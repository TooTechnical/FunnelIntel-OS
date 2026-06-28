import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Shield, Users, FolderOpen, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function AdminPanel() {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = trpc.admin.stats.useQuery();
  const { data: users = [], isLoading: loadingUsers } = trpc.admin.users.useQuery({ limit: 50, offset: 0 });

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 text-neon-pink mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl text-neon-pink tracking-widest mb-2">ACCESS DENIED</h2>
        <p className="text-cyber-muted text-sm">Admin access required.</p>
        <Link href="/dashboard" className="btn-neon-solid px-5 py-2.5 rounded text-xs mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
          <Shield className="w-4 h-4 text-neon-pink" />
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-widest">SYSTEM</div>
          <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">ADMIN PANEL</h1>
        </div>
      </div>

      {/* Stats */}
      {loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="hud-card p-5 animate-pulse">
              <div className="h-3 bg-cyber-surface rounded mb-2 w-2/3" />
              <div className="h-8 bg-cyber-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.users.total, icon: Users, color: "pink" as const },
            { label: "Active Trials", value: (stats.users as any).trialActive ?? stats.users.trial, icon: TrendingUp, color: "cyan" as const },
            { label: "Paid Subscribers", value: (stats.users as any).paid ?? stats.users.active, icon: Shield, color: "pink" as const },
            { label: "Total Projects", value: stats.projects.total, icon: FolderOpen, color: "cyan" as const },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`hud-card p-5 ${color === "cyan" ? "hud-card-cyan" : ""}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`} />
                <span className="text-xs text-cyber-muted font-display tracking-widest">{label}</span>
              </div>
              <div className={`font-display font-black text-3xl ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
                {value ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Starter Plan", value: (stats.users as any).starter ?? 0, color: "pink" as const },
            { label: "Pro Plan", value: (stats.users as any).pro ?? 0, color: "cyan" as const },
            { label: "Agency Plan", value: (stats.users as any).agency ?? 0, color: "pink" as const },
          ].map(({ label, value, color }) => (
            <div key={label} className={`hud-card p-4 ${color === "cyan" ? "hud-card-cyan" : ""}`}>
              <div className="text-xs text-cyber-muted font-display tracking-widest mb-1">{label}</div>
              <div className={`font-display font-bold text-2xl ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="hud-card overflow-hidden">
        <div className="p-4 border-b border-cyber flex items-center justify-between">
          <h3 className="font-display text-xs tracking-widest uppercase text-neon-cyan">Users</h3>
          <span className="text-xs text-cyber-muted">{users.length} shown</span>
        </div>
        {loadingUsers ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cyber">
                  {["ID", "Name", "Email", "Role", "Plan", "Status", "Joined"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-display tracking-widest text-cyber-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-cyber/50 hover:bg-cyber-surface/30 transition-colors">
                    <td className="px-4 py-3 text-cyber-muted">{u.id}</td>
                    <td className="px-4 py-3 text-cyber-text">{u.name ?? "—"}</td>
                    <td className="px-4 py-3 text-cyber-muted">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-display text-xs ${u.role === "admin" ? "bg-neon-pink/20 text-neon-pink" : "bg-cyber-surface text-cyber-muted"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-display text-xs ${
                        u.subscriptionPlan === "agency" ? "bg-neon-cyan/20 text-neon-cyan" :
                        u.subscriptionPlan === "pro" ? "bg-neon-pink/20 text-neon-pink" :
                        u.subscriptionPlan === "starter" ? "bg-cyber-surface text-cyber-muted" :
                        "text-cyber-muted"
                      }`}>
                        {u.subscriptionPlan ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-display text-xs ${
                        u.subscriptionStatus === "active" ? "bg-green-500/20 text-green-400" :
                        u.subscriptionStatus === "trial" ? "bg-neon-cyan/20 text-neon-cyan" :
                        "bg-neon-pink/20 text-neon-pink"
                      }`}>
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cyber-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
