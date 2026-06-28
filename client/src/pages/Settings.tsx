import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  User,
  CreditCard,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

const PLAN_DETAILS = {
  starter: {
    name: "Starter",
    price: "€19/month",
    color: "cyan" as const,
    features: ["3 projects", "Basic research analysis", "Funnel skeleton", "Ad and landing page drafts"],
  },
  pro: {
    name: "Pro",
    price: "€49/month",
    color: "pink" as const,
    features: ["20 projects", "Interview builder", "Threshold analysis", "Mental steps + triggers", "Self-review checker", "Export reports"],
  },
  agency: {
    name: "Agency",
    price: "€149/month",
    color: "cyan" as const,
    features: ["Unlimited projects", "Client workspaces", "Competitor comparison", "Insider review board", "PDF/Markdown export"],
  },
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    trial: { label: "Trial", cls: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30" },
    expired: { label: "Expired", cls: "bg-neon-pink/20 text-neon-pink border-neon-pink/30" },
    cancelled: { label: "Cancelled", cls: "bg-cyber-muted/20 text-cyber-muted border-cyber-muted/30" },
    none: { label: "No Plan", cls: "bg-cyber-muted/20 text-cyber-muted border-cyber-muted/30" },
  };
  const c = config[status] ?? config.none;
  return (
    <span className={`px-2 py-0.5 rounded border font-display text-xs tracking-wide ${c.cls}`}>
      {c.label}
    </span>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { data: subStatus, isLoading } = trpc.auth.subscriptionStatus.useQuery();
  const portalMutation = trpc.stripe.getPortalUrl.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
    onError: (e) => toast.error(e.message),
  });
  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
    onError: (e) => toast.error(e.message),
  });

  const handleUpgrade = (plan: "starter" | "pro" | "agency") => {
    checkoutMutation.mutate({ plan, origin: window.location.origin });
  };

  const handleManageBilling = () => {
    portalMutation.mutate({ origin: window.location.origin });
  };

  const plan = subStatus?.plan as keyof typeof PLAN_DETAILS | undefined;
  const planDetails = plan ? PLAN_DETAILS[plan] : null;

  const trialDaysLeft = subStatus?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subStatus.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-cyber-muted mb-4">
          <Link href="/dashboard" className="hover:text-neon-cyan transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neon-pink">Settings</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-neon-pink tracking-widest">SETTINGS &amp; BILLING</h1>
        <p className="text-cyber-muted text-sm mt-1">Manage your account, subscription, and billing details.</p>
      </div>

      {/* Account Info */}
      <div className="hud-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-4 h-4 text-neon-cyan" />
          <h2 className="font-display text-xs tracking-widest uppercase text-neon-cyan">Account</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-cyber-muted font-display tracking-wide mb-1">Name</div>
            <div className="text-sm text-cyber-text">{user?.name || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-cyber-muted font-display tracking-wide mb-1">Email</div>
            <div className="text-sm text-cyber-text">{user?.email || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-cyber-muted font-display tracking-wide mb-1">Account Type</div>
            <div className="text-sm text-cyber-text capitalize">{user?.role || "user"}</div>
          </div>
          <div>
            <div className="text-xs text-cyber-muted font-display tracking-wide mb-1">Member Since</div>
            <div className="text-sm text-cyber-text">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="hud-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-4 h-4 text-neon-pink" />
          <h2 className="font-display text-xs tracking-widest uppercase text-neon-pink">Subscription</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-cyber-muted text-xs">
            <div className="w-4 h-4 border border-neon-pink border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-cyber-muted font-display tracking-wide mb-1">Current Plan</div>
                <div className="text-sm text-cyber-text font-display font-bold">
                  {planDetails?.name ?? (subStatus?.trialActive ? "Free Trial" : "No Plan")}
                </div>
              </div>
              <StatusBadge status={subStatus?.status ?? "none"} />
            </div>

            {subStatus?.trialActive && (
              <div className="flex items-center gap-2 p-3 rounded border border-neon-cyan/30 bg-neon-cyan/5">
                <Clock className="w-4 h-4 text-neon-cyan shrink-0" />
                <div className="text-xs text-neon-cyan">
                  <span className="font-display font-bold">{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</span> remaining in your free trial.
                  {" "}Trial ends {subStatus.trialEndsAt ? new Date(subStatus.trialEndsAt).toLocaleDateString() : ""}.
                </div>
              </div>
            )}

            {subStatus?.status === "expired" && (
              <div className="flex items-center gap-2 p-3 rounded border border-neon-pink/30 bg-neon-pink/5">
                <AlertTriangle className="w-4 h-4 text-neon-pink shrink-0" />
                <div className="text-xs text-neon-pink">
                  Your trial has expired. Upgrade to continue generating AI outputs.
                </div>
              </div>
            )}

            {subStatus?.status === "active" && planDetails && (
              <div>
                <div className="text-xs text-cyber-muted font-display tracking-wide mb-2">Plan Features</div>
                <ul className="space-y-1.5">
                  {planDetails.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-cyber-muted">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${planDetails.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {subStatus?.status === "active" ? (
                <button
                  onClick={handleManageBilling}
                  disabled={portalMutation.isPending}
                  className="btn-neon-cyan px-5 py-2.5 rounded text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {portalMutation.isPending ? "Opening..." : "Manage Billing"}
                </button>
              ) : (
                <Link href="/pricing">
                  <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Upgrade Plan
                  </a>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Upgrade (if not active) */}
      {subStatus && subStatus.status !== "active" && (
        <div className="hud-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <h2 className="font-display text-xs tracking-widest uppercase text-neon-cyan">Quick Upgrade</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(PLAN_DETAILS) as [keyof typeof PLAN_DETAILS, typeof PLAN_DETAILS[keyof typeof PLAN_DETAILS]][]).map(([key, p]) => (
              <div key={key} className={`hud-card p-4 ${p.color === "pink" ? "" : "hud-card-cyan"}`}>
                <div className={`font-display font-bold text-sm tracking-widest mb-1 ${p.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
                  {p.name}
                </div>
                <div className="text-xs text-cyber-muted mb-3">{p.price}</div>
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={checkoutMutation.isPending}
                  className={`w-full py-2 rounded text-xs font-display tracking-wide transition-all disabled:opacity-50 ${
                    p.color === "pink" ? "btn-neon-solid" : "btn-neon-cyan"
                  }`}
                >
                  {checkoutMutation.isPending ? "..." : "Select"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      <div className="hud-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-4 h-4 text-neon-pink" />
          <h2 className="font-display text-xs tracking-widest uppercase text-neon-pink">Security &amp; Privacy</h2>
        </div>
        <div className="space-y-3 text-xs text-cyber-muted">
          <p>Your account is secured via OAuth. Passwords are never stored by FunnelIntel OS.</p>
          <p>All AI-generated outputs are stored securely and are only accessible to your account.</p>
          <div className="flex gap-4 pt-2">
            <Link href="/privacy">
              <a className="text-neon-cyan hover:text-neon-pink transition-colors">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-neon-cyan hover:text-neon-pink transition-colors">Terms of Service</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
