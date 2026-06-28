// FunnelIntel OS — Stripe Products & Prices
// These are the plan definitions. Create matching products/prices in your Stripe dashboard.

export const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? process.env.STRIPE_PRICE_STARTER ?? "price_starter",
    amount: 4900, // $49/mo
    currency: "usd",
    interval: "month" as const,
    features: [
      "3 funnel projects",
      "All 13 modules",
      "AI research extraction",
      "Funnel skeleton generation",
      "PDF strategy report",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? process.env.STRIPE_PRICE_PRO ?? "price_pro",
    amount: 9700, // $97/mo
    currency: "usd",
    interval: "month" as const,
    features: [
      "Unlimited funnel projects",
      "All 13 modules",
      "AI research extraction",
      "Funnel skeleton generation",
      "Drafting Studio with variations",
      "Self-review checker",
      "Competitor comparison",
      "PDF strategy report",
      "Priority support",
    ],
  },
  agency: {
    name: "Agency",
    priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? process.env.STRIPE_PRICE_AGENCY ?? "price_agency",
    amount: 19700, // $197/mo
    currency: "usd",
    interval: "month" as const,
    features: [
      "Everything in Pro",
      "Unlimited projects",
      "Client workspaces",
      "White-label exports",
      "Dedicated onboarding",
      "Slack support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
