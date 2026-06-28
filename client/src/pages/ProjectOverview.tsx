import { trpc } from "@/lib/trpc";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Link, useParams } from "wouter";

const MODULES = [
  { id: 1, href: "research", label: "Research Intake", desc: "Paste customer reviews, interviews, forum posts, competitor copy", key: "researchComplete" },
  { id: 2, href: "intelligence", label: "Intelligence Extraction", desc: "AI extracts pains, desires, objections, exact phrases, awareness level", key: "intelligenceComplete" },
  { id: 3, href: "intelligence", label: "Market Research Template", desc: "Structured customer language mapped to marketing use cases", key: "intelligenceComplete" },
  { id: 4, href: "intelligence", label: "Interview Builder", desc: "Generate questions and outreach messages to fill knowledge gaps", key: "intelligenceComplete" },
  { id: 5, href: "buyer-journey", label: "Buyer Journey Map", desc: "Map all 8 stages: trigger, search, doubts, decision, action", key: "buyerJourneyComplete" },
  { id: 6, href: "awareness", label: "Awareness Diagnosis", desc: "Diagnose awareness level and attention mode, get funnel type", key: "awarenessComplete" },
  { id: 7, href: "thresholds", label: "Threshold Gap Analysis", desc: "Score desire, certainty, trust gaps. Find the biggest gap.", key: "thresholdComplete" },
  { id: 8, href: "mental-steps", label: "Mental Steps + Triggers", desc: "Build the ordered chain of mental steps before action", key: "mentalStepsComplete" },
  { id: 9, href: "funnel-skeleton", label: "Funnel Skeleton", desc: "Generate 11-section landing page skeleton with copy directions", key: "funnelSkeletonComplete" },
  { id: 10, href: "drafting", label: "Drafting Studio", desc: "Generate copy element by element with variations", key: "draftingComplete" },
  { id: 11, href: "self-review", label: "Self-Review Checker", desc: "5-category review: lizard brain, baton handoff, threshold, language, final", key: "selfReviewComplete" },
  { id: 12, href: "competitor-review", label: "Competitor Comparison", desc: "Compare your ad vs competitors, get insider review questions", key: "competitorReviewComplete" },
  { id: 13, href: "export", label: "Export Strategy Report", desc: "Download complete strategy report as PDF or Markdown", key: "exportComplete" },
];

export default function ProjectOverview() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const { data: project, isLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-display text-cyber-muted tracking-widest">LOADING PROJECT...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center text-cyber-muted">
        <p>Project not found.</p>
        <Link href="/dashboard" className="text-neon-cyan text-sm mt-2 block">← Back to Dashboard</Link>
      </div>
    );
  }

  const completedCount = MODULES.filter(m => (project as any)[m.key]).length;
  const pct = Math.round((completedCount / MODULES.length) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-cyber-muted mb-3">
          <Link href="/dashboard" className="hover:text-neon-cyan transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-cyber-text">{project.name}</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-neon-pink glow-sm-pink tracking-widest">{project.name}</h1>
        {project.targetCustomer && (
          <p className="text-cyber-muted text-sm mt-1">{project.targetCustomer}</p>
        )}
      </div>

      {/* Progress */}
      <div className="hud-card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-xs text-cyber-muted tracking-widest uppercase">Overall Progress</span>
          <span className="font-display font-bold text-neon-cyan">{pct}%</span>
        </div>
        <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-cyber-muted">
          <span>{completedCount} of {MODULES.length} modules complete</span>
          {project.mainOffer && <span className="text-cyber-text">{project.mainOffer}</span>}
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-2">
        {MODULES.map((mod, i) => {
          const isComplete = !!(project as any)[mod.key];
          const href = `/projects/${projectId}/${mod.href}`;
          return (
            <Link key={i} href={href}>
              <a className={`flex items-center gap-4 p-4 rounded border transition-all duration-150 group ${
                isComplete
                  ? "border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10"
                  : "border-cyber bg-cyber-surface hover:border-neon-pink/30 hover:bg-neon-pink/5"
              }`}>
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 font-display font-bold text-xs ${
                  isComplete ? "bg-neon-cyan/20 text-neon-cyan" : "bg-cyber-border text-cyber-muted"
                }`}>
                  {isComplete ? <CheckCircle2 className="w-4 h-4" /> : mod.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-display text-sm tracking-wide ${isComplete ? "text-neon-cyan" : "text-cyber-text"}`}>
                    {mod.label}
                  </div>
                  <div className="text-xs text-cyber-muted mt-0.5 truncate">{mod.desc}</div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${isComplete ? "text-neon-cyan" : "text-cyber-muted"}`} />
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
