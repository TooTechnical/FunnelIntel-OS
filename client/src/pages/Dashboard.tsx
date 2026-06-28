import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  FolderOpen,
  Plus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  research: { label: "Research", color: "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/5" },
  buyer_journey: { label: "Buyer Journey", color: "text-neon-pink border-neon-pink/40 bg-neon-pink/5" },
  funnel_strategy: { label: "Funnel Strategy", color: "text-neon-purple border-neon-purple/40 bg-neon-purple/5" },
  drafting: { label: "Drafting", color: "text-neon-yellow border-neon-yellow/40 bg-neon-yellow/5" },
  review: { label: "Review", color: "text-orange-400 border-orange-400/40 bg-orange-400/5" },
  ready_to_launch: { label: "Ready to Launch", color: "text-green-400 border-green-400/40 bg-green-400/5" },
};

function ProjectProgress({ project }: { project: any }) {
  const steps = [
    project.researchComplete,
    project.intelligenceComplete,
    project.buyerJourneyComplete,
    project.awarenessComplete,
    project.thresholdComplete,
    project.mentalStepsComplete,
    project.funnelSkeletonComplete,
    project.draftingComplete,
    project.selfReviewComplete,
    project.competitorReviewComplete,
    project.exportComplete,
  ];
  const completed = steps.filter(Boolean).length;
  const pct = Math.round((completed / steps.length) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-cyber-muted mb-1">
        <span>{completed}/{steps.length} modules</span>
        <span className="text-neon-cyan">{pct}%</span>
      </div>
      <div className="h-1 bg-cyber-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TrialBanner({ status }: { status: any }) {
  if (!status) return null;
  if (status.canGenerate && status.trialActive) {
    const hoursLeft = status.trialEndsAt
      ? Math.max(0, Math.round((new Date(status.trialEndsAt).getTime() - Date.now()) / 3600000))
      : 0;
    return (
      <div className="hud-card border-neon-cyan/40 bg-neon-cyan/5 p-4 flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-neon-cyan shrink-0" />
        <div>
          <div className="text-sm font-display text-neon-cyan tracking-wide">Free Trial Active</div>
          <div className="text-xs text-cyber-muted">{hoursLeft}h remaining — upgrade to keep full access</div>
        </div>
        <Link href="/pricing">
          <a className="ml-auto btn-neon-cyan px-4 py-2 rounded text-xs">Upgrade</a>
        </Link>
      </div>
    );
  }
  if (status.trialExpired && !status.canGenerate) {
    return (
      <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 flex items-center gap-3 mb-6">
        <AlertTriangle className="w-5 h-5 text-neon-pink shrink-0" />
        <div>
          <div className="text-sm font-display text-neon-pink tracking-wide">Trial Expired</div>
          <div className="text-xs text-cyber-muted">You can view existing data but cannot generate new AI outputs. Choose a plan to continue.</div>
        </div>
        <Link href="/pricing">
          <a className="ml-auto btn-neon-solid px-4 py-2 rounded text-xs">Choose a Plan</a>
        </Link>
      </div>
    );
  }
  if (status.status === "active") {
    return (
      <div className="hud-card border-green-400/30 bg-green-400/5 p-3 flex items-center gap-3 mb-6">
        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        <span className="text-xs text-green-400 font-display tracking-wide">
          {status.plan ? status.plan.charAt(0).toUpperCase() + status.plan.slice(1) : "Pro"} Plan Active
        </span>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", businessName: "", industry: "", productService: "", targetCustomer: "", desiredAction: "", mainOffer: "",
  });

  const utils = trpc.useUtils();
  const { data: projects = [], isLoading } = trpc.projects.list.useQuery();
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setCreateOpen(false);
      setForm({ name: "", businessName: "", industry: "", productService: "", targetCustomer: "", desiredAction: "", mainOffer: "" });
      toast.success("Project created");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); toast.success("Project deleted"); },
  });

  const activeProjects = projects.filter(p => p.status !== "ready_to_launch").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-neon-pink glow-sm-pink tracking-widest">
            DASHBOARD
          </h1>
          <p className="text-cyber-muted text-sm mt-1">
            Welcome back, {user?.name?.split(" ")[0] ?? "Operator"}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button className="btn-neon-solid px-5 py-2.5 rounded flex items-center gap-2 text-xs">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </DialogTrigger>
          <DialogContent className="bg-cyber-dark border border-neon-pink/30 text-cyber-text max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-neon-pink tracking-widest">CREATE PROJECT</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {[
                { key: "name", label: "Project Name *", placeholder: "e.g. Acme Landing Page Funnel" },
                { key: "businessName", label: "Business / Client Name", placeholder: "e.g. Acme Corp" },
                { key: "industry", label: "Industry", placeholder: "e.g. SaaS, Coaching, E-commerce" },
                { key: "targetCustomer", label: "Target Customer", placeholder: "e.g. Freelance web designers struggling with client positioning" },
                { key: "desiredAction", label: "Desired Customer Action", placeholder: "e.g. Book a discovery call" },
                { key: "mainOffer", label: "Main Offer", placeholder: "e.g. 90-day brand positioning sprint" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">{label}</label>
                  {key === "targetCustomer" || key === "mainOffer" ? (
                    <Textarea
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="bg-cyber-surface border-cyber text-cyber-text text-sm resize-none"
                      rows={2}
                    />
                  ) : (
                    <Input
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="bg-cyber-surface border-cyber text-cyber-text text-sm"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">Product / Service</label>
                <Input
                  value={form.productService}
                  onChange={e => setForm(f => ({ ...f, productService: e.target.value }))}
                  placeholder="e.g. Website design and brand strategy packages"
                  className="bg-cyber-surface border-cyber text-cyber-text text-sm"
                />
              </div>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name || createMutation.isPending}
                className="w-full btn-neon-solid py-2.5 rounded text-xs mt-2 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create Project"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trial Banner */}
      <TrialBanner status={subStatus} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Projects", value: projects.length, icon: FolderOpen, color: "pink" },
          { label: "Active Projects", value: activeProjects, icon: Zap, color: "cyan" },
          { label: "Completed", value: projects.length - activeProjects, icon: CheckCircle2, color: "pink" },
          { label: "Plan", value: subStatus?.plan ? subStatus.plan.charAt(0).toUpperCase() + subStatus.plan.slice(1) : subStatus?.trialActive ? "Trial" : "None", icon: BarChart3, color: "cyan" },
        ].map((stat, i) => (
          <div key={i} className={`hud-card ${i % 2 === 0 ? "" : "hud-card-cyan"} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`} />
              <span className="text-xs text-cyber-muted font-display tracking-wide">{stat.label}</span>
            </div>
            <div className={`font-display font-black text-2xl ${stat.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div>
        <h2 className="font-display text-sm text-cyber-muted tracking-widest uppercase mb-4 border-b border-cyber pb-2">
          Your Projects
        </h2>

        {isLoading ? (
          <div className="text-center py-12 text-cyber-muted">
            <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-display tracking-widest">LOADING...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="hud-card p-12 text-center">
            <FolderOpen className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
            <h3 className="font-display text-sm text-cyber-text tracking-wide mb-2">No projects yet</h3>
            <p className="text-xs text-cyber-muted mb-6">Create your first project to start building customer intelligence.</p>
            <button onClick={() => setCreateOpen(true)} className="btn-neon-solid px-6 py-2.5 rounded text-xs">
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const statusInfo = STATUS_LABELS[project.status] ?? STATUS_LABELS.research;
              return (
                <div key={project.id} className="hud-card p-5 flex flex-col gap-4 hover:bg-cyber-surface transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm text-cyber-text tracking-wide truncate">{project.name}</h3>
                      {project.businessName && (
                        <p className="text-xs text-cyber-muted mt-0.5 truncate">{project.businessName}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 border rounded font-display tracking-wide shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {project.targetCustomer && (
                    <p className="text-xs text-cyber-muted line-clamp-2">{project.targetCustomer}</p>
                  )}

                  <ProjectProgress project={project} />

                  <div className="flex items-center justify-between pt-2 border-t border-cyber">
                    <span className="text-xs text-cyber-muted">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { if (confirm("Delete this project?")) deleteMutation.mutate({ id: project.id }); }}
                        className="text-xs text-cyber-muted hover:text-neon-pink transition-colors"
                      >
                        Delete
                      </button>
                      <Link href={`/projects/${project.id}`}>
                        <a className="flex items-center gap-1 text-xs text-neon-cyan hover:text-neon-pink transition-colors font-display tracking-wide">
                          Open <ChevronRight className="w-3 h-3" />
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
