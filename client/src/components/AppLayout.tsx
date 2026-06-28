import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  Layers,
  LogOut,
  Network,
  PenTool,
  Search,
  Settings,
  Shield,
  Swords,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/dashboard", icon: BarChart3, label: "Dashboard", group: "main" },
];

const MODULE_ITEMS = [
  { href: "research", icon: BookOpen, label: "1–2. Research Intake", module: "1" },
  { href: "intelligence", icon: Brain, label: "3–4. Intelligence Extract", module: "3" },
  { href: "buyer-journey", icon: Network, label: "5. Buyer Journey", module: "5" },
  { href: "awareness", icon: Target, label: "6. Awareness Diagnosis", module: "6" },
  { href: "thresholds", icon: TrendingUp, label: "7. Threshold Gaps", module: "7" },
  { href: "mental-steps", icon: Zap, label: "8. Mental Steps", module: "8" },
  { href: "funnel-skeleton", icon: Layers, label: "9. Funnel Skeleton", module: "9" },
  { href: "drafting", icon: PenTool, label: "10. Drafting Studio", module: "10" },
  { href: "self-review", icon: Search, label: "11. Self-Review", module: "11" },
  { href: "competitor-review", icon: Swords, label: "12. Competitor Review", module: "12" },
  { href: "export", icon: FileText, label: "13. Export Report", module: "13" },
];

interface AppLayoutProps {
  children: ReactNode;
  projectId?: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); window.location.href = "/"; },
  });

  // Extract projectId from URL
  const projectMatch = location.match(/\/projects\/(\d+)/);
  const currentProjectId = projectMatch ? projectMatch[1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neon-cyan font-display text-sm tracking-widest">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex min-h-screen bg-cyber-black">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        } bg-cyber-dark border-r border-cyber shrink-0 relative`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-cyber">
          <div className="w-8 h-8 shrink-0 relative">
            <div className="absolute inset-0 bg-neon-pink/10 border border-neon-pink/50 rotate-45 box-glow-sm-pink" />
            <span className="absolute inset-0 flex items-center justify-center text-neon-pink font-display font-bold text-xs">F</span>
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-display font-bold text-sm text-neon-pink glow-sm-pink tracking-wider">FUNNELINTEL</div>
              <div className="font-display text-xs text-neon-cyan/70 tracking-widest">OS</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-cyber-muted hover:text-neon-cyan transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-150 group ${
                  active
                    ? "bg-neon-pink/10 text-neon-pink border border-neon-pink/30 box-glow-sm-pink"
                    : "text-cyber-muted hover:text-neon-cyan hover:bg-neon-cyan/5"
                }`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="font-display text-xs tracking-wide">{item.label}</span>}
              </Link>
            );
          })}

          {/* Module nav — only when in a project */}
          {currentProjectId && sidebarOpen && (
            <>
              <div className="px-3 pt-4 pb-1">
                <div className="text-xs text-cyber-muted font-display tracking-widest uppercase border-b border-cyber pb-1">
                  Project Modules
                </div>
              </div>
              {MODULE_ITEMS.map((item) => {
                const href = `/projects/${currentProjectId}/${item.href}`;
                const active = location === href;
                return (
                  <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-150 ${
                      active
                        ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 box-glow-sm-cyan"
                        : "text-cyber-muted hover:text-neon-cyan hover:bg-neon-cyan/5"
                    }`}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="font-body text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}

          {/* Admin */}
          {isAdmin && (
            <>
              <div className="px-3 pt-4 pb-1">
                {sidebarOpen && (
                  <div className="text-xs text-cyber-muted font-display tracking-widest uppercase border-b border-cyber pb-1">Admin</div>
                )}
              </div>
              <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-150 ${
                  location === "/admin"
                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/30"
                    : "text-cyber-muted hover:text-neon-cyan hover:bg-neon-cyan/5"
                }`}>
                  <Shield className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="font-display text-xs tracking-wide">Admin Panel</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-cyber p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-neon-pink/20 border border-neon-pink/30 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-neon-pink" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-display text-cyber-text truncate">{user?.name || "User"}</div>
                <div className="text-xs text-cyber-muted truncate">{user?.email || ""}</div>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                className="text-cyber-muted hover:text-neon-pink transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoutMutation.mutate()}
              className="w-full flex justify-center text-cyber-muted hover:text-neon-pink transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-cyber-black">
        {children}
      </main>
    </div>
  );
}
