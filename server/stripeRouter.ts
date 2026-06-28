import Stripe from "stripe";
import type { Request, Response } from "express";
import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod/v4";
import * as db from "./db";
import { PLANS, type PlanKey } from "./stripeProducts";

// ─── Lazy Stripe client (avoids crash when STRIPE_SECRET_KEY is not set) ──────
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Please add it to your environment variables.");
    _stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  }
  return _stripe;
}

// ─── tRPC Stripe Router ────────────────────────────────────────────────────────
export const stripeRouter = router({
  createCheckout: protectedProcedure
    .input(z.object({ plan: z.enum(["starter", "pro", "agency"]), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new Error("User not found");

      const plan = PLANS[input.plan as PlanKey];

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: user.email ?? undefined,
        allow_promotion_codes: true,
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          plan: input.plan,
          customer_email: user.email ?? "",
          customer_name: user.name ?? "",
        },
        subscription_data: {
          metadata: {
            user_id: ctx.user.id.toString(),
            plan: input.plan,
          },
        },
        success_url: `${input.origin}/dashboard?checkout=success&plan=${input.plan}`,
        cancel_url: `${input.origin}/pricing?checkout=cancelled`,
      });

      return { url: session.url };
    }),

  getPortalUrl: protectedProcedure
    .input(z.object({ origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const user = await db.getUserById(ctx.user.id);
      if (!user?.stripeCustomerId) throw new Error("No Stripe customer found");

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${input.origin}/dashboard`,
      });

      return { url: session.url };
    }),
});

// ─── Stripe Webhook Handler ────────────────────────────────────────────────────
export async function handleStripeWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("[Stripe Webhook] STRIPE_SECRET_KEY not set — skipping webhook processing");
    res.json({ received: true, skipped: true });
    return;
  }

  const stripe = getStripe();
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Test event detection
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    res.json({ verified: true });
    return;
  }

  console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.user_id ?? "0");
        const plan = (session.metadata?.plan ?? "starter") as PlanKey;
        if (!userId) break;

        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        await db.updateUserSubscription(userId, {
          stripeCustomerId: customerId ?? undefined,
          stripeSubscriptionId: subscriptionId ?? undefined,
          subscriptionStatus: "active",
          subscriptionPlan: plan,
        });
        console.log(`[Stripe] User ${userId} subscribed to ${plan}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = parseInt(sub.metadata?.user_id ?? "0");
        if (!userId) break;

        const plan = (sub.metadata?.plan ?? "starter") as PlanKey;
        const status: "active" | "cancelled" | "expired" | "trial" =
          sub.status === "active" ? "active" :
          sub.status === "canceled" ? "cancelled" :
          sub.status === "past_due" ? "active" : "expired";

        const rawEnd = (sub as any).current_period_end ?? sub.items?.data?.[0]?.current_period_end;
        const periodEnd = rawEnd ? new Date(rawEnd * 1000) : undefined;

        await db.updateUserSubscription(userId, {
          stripeSubscriptionId: sub.id,
          subscriptionStatus: status,
          subscriptionPlan: plan,
          subscriptionCurrentPeriodEnd: periodEnd,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = parseInt(sub.metadata?.user_id ?? "0");
        if (!userId) break;

        await db.updateUserSubscription(userId, {
          subscriptionStatus: "cancelled",
        });
        console.log(`[Stripe] Subscription cancelled for user ${userId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : (invoice.customer as any)?.id;
        if (!customerId) break;
        console.warn(`[Stripe] Payment failed for customer ${customerId}`);
        // Status remains active during grace period — Stripe handles dunning.
        // If subscription is eventually cancelled, customer.subscription.deleted fires.
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err);
  }

  res.json({ received: true });
}
