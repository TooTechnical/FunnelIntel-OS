import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect } from "react";

const PLANS = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "$49",
    period: "/month",
    color: "cyan" as const,
    features: [
      "3 funnel projects",
      "All 13 modules",
      "AI research extraction",
      "Funnel skeleton generation",
      "PDF strategy report",
      "Email support",
      "2-day free trial",
    ],
    cta: "Start Free Trial",
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "$97",
    period: "/month",
    color: "pink" as const,
    popular: true,
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
      "2-day free trial",
    ],
    cta: "Start Free Trial",
  },
  {
    key: "agency" as const,
    name: "Agency",
    price: "$197",
    period: "/month",
    color: "cyan" as const,
    features: [
      "Everything in Pro",
      "Unlimited projects",
      "Client workspaces",
      "White-label exports",
      "Dedicated onboarding",
      "Slack support",
      "2-day free trial",
    ],
    cta: "Start Free Trial",
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  void location;

  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  // Show success/cancel toast from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      toast.info("Checkout cancelled. You can try again anytime.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = (planKey: "starter" | "pro" | "agency") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    checkoutMutation.mutate({ plan: planKey, origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text py-24">
      <div className="container max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1 px-3 py-1 text-xs font-display tracking-widest uppercase border rounded border-neon-pink/50 text-neon-pink bg-neon-pink/5 mb-6">
            Pricing
          </div>
          <h1 className="font-display font-bold text-4xl text-cyber-text">
            Start free. <span className="text-neon-pink">Scale when ready.</span>
          </h1>
          <p className="mt-4 text-cyber-muted">Every plan includes a 2-day free trial. No credit card required to start.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.key} className={`relative ${plan.popular ? "scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="btn-neon-solid px-4 py-1 rounded text-xs">MOST POPULAR</span>
                </div>
              )}
              <div className={`hud-card p-6 h-full flex flex-col ${plan.popular ? "border-neon-pink/60" : ""}`}>
                <div className={`font-display font-black text-xl tracking-widest ${plan.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
                  {plan.name}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display font-black text-4xl text-cyber-text">{plan.price}</span>
                  <span className="text-cyber-muted text-sm">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-cyber-muted">
                      <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={checkoutMutation.isPending}
                  className={`mt-6 w-full text-center py-3 rounded text-xs font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                    plan.popular ? "btn-neon-solid" : plan.color === "pink" ? "btn-neon-pink" : "btn-neon-cyan"
                  }`}
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      {plan.cta} <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 hud-card p-6 text-center">
          <p className="text-xs text-cyber-muted mb-2">
            Test payments with card <span className="font-mono text-neon-cyan">4242 4242 4242 4242</span> · Any future expiry · Any CVC
          </p>
          <p className="text-xs text-cyber-muted">
            Subscriptions are managed securely via Stripe. Cancel anytime from your account settings.
          </p>
        </div>

        <div className="text-center mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/">
            <a className="text-xs text-cyber-muted hover:text-neon-cyan transition-colors">← Back to home</a>
          </Link>
          <Link href="/terms">
            <a className="text-xs text-cyber-muted hover:text-neon-cyan transition-colors">Terms of Service</a>
          </Link>
          <Link href="/privacy">
            <a className="text-xs text-cyber-muted hover:text-neon-cyan transition-colors">Privacy Policy</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
