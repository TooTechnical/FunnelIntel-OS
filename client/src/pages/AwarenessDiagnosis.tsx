import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, Target } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AWARENESS_LEVELS = [
  { value: "unaware", label: "Unaware", desc: "Doesn't know they have the problem" },
  { value: "problem_aware", label: "Problem Aware", desc: "Knows the problem, not the solution" },
  { value: "solution_aware", label: "Solution Aware", desc: "Knows solutions exist, not your product" },
  { value: "product_aware", label: "Product Aware", desc: "Knows your product, hasn't bought yet" },
];

const ATTENTION_MODES = [
  { value: "passive", label: "Passive", desc: "Scrolling, not actively searching" },
  { value: "active", label: "Active", desc: "Actively searching for a solution" },
];

export default function AwarenessDiagnosis() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: awareness, isLoading } = trpc.awareness.get.useQuery({ projectId });
  const { data: intel } = trpc.intelligence.get.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const [awarenessLevel, setAwarenessLevel] = useState(intel?.awarenessLevel ?? "problem_aware");
  const [attentionMode, setAttentionMode] = useState("passive");

  const diagnoseMutation = trpc.awareness.diagnose.useMutation({
    onSuccess: () => { utils.awareness.get.invalidate({ projectId }); toast.success("Awareness diagnosed!"); },
    onError: (e) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Awareness Diagnosis</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-neon-pink" />
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 6</div>
          <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">AWARENESS DIAGNOSIS</h1>
        </div>
      </div>
      <p className="text-cyber-muted text-sm mb-8 max-w-xl">
        Diagnose your target customer's awareness level and attention mode. The system will recommend the right funnel type and first-message strategy.
      </p>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue</Link>
        </div>
      )}

      {/* Input form */}
      {!awareness && (
        <div className="hud-card p-6 mb-6 space-y-6">
          <div>
            <label className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-3 block">Awareness Level</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AWARENESS_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => setAwarenessLevel(level.value as any)}
                  className={`p-4 rounded border text-left transition-all ${
                    awarenessLevel === level.value
                      ? "border-neon-pink/60 bg-neon-pink/10 text-neon-pink"
                      : "border-cyber bg-cyber-surface text-cyber-muted hover:border-neon-pink/30"
                  }`}
                >
                  <div className="font-display text-sm tracking-wide">{level.label}</div>
                  <div className="text-xs mt-1 opacity-70">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-3 block">Attention Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {ATTENTION_MODES.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setAttentionMode(mode.value as any)}
                  className={`p-4 rounded border text-left transition-all ${
                    attentionMode === mode.value
                      ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                      : "border-cyber bg-cyber-surface text-cyber-muted hover:border-neon-cyan/30"
                  }`}
                >
                  <div className="font-display text-sm tracking-wide">{mode.label}</div>
                  <div className="text-xs mt-1 opacity-70">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => diagnoseMutation.mutate({ projectId, awarenessLevel: awarenessLevel as any, attentionMode: attentionMode as any })}
            disabled={diagnoseMutation.isPending || !canGenerate}
            className="btn-neon-solid px-6 py-2.5 rounded text-xs disabled:opacity-50"
          >
            {diagnoseMutation.isPending ? "Diagnosing..." : "Run Diagnosis"}
          </button>
        </div>
      )}

      {/* Results */}
      {awareness && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="hud-card p-4 text-center">
              <div className="text-xs text-cyber-muted font-display tracking-widest mb-2">AWARENESS LEVEL</div>
              <div className="font-display font-bold text-neon-pink text-sm">{awareness.awarenessLevel?.replace("_", " ").toUpperCase()}</div>
            </div>
            <div className="hud-card hud-card-cyan p-4 text-center">
              <div className="text-xs text-cyber-muted font-display tracking-widest mb-2">ATTENTION MODE</div>
              <div className="font-display font-bold text-neon-cyan text-sm">{awareness.attentionMode?.toUpperCase()}</div>
            </div>
            <div className="hud-card p-4 text-center">
              <div className="text-xs text-cyber-muted font-display tracking-widest mb-2">RECOMMENDED FUNNEL</div>
              <div className="font-display font-bold text-neon-pink text-sm">{awareness.recommendedFunnelType}</div>
            </div>
          </div>

          {awareness.explanation && (
            <div className="hud-card p-5">
              <h4 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-3">Why This Funnel Type</h4>
              <p className="text-sm text-cyber-muted leading-relaxed">{awareness.explanation}</p>
            </div>
          )}

          {awareness.firstMessageStrategy && (
            <div className="hud-card p-5">
              <h4 className="font-display text-xs tracking-widest uppercase text-neon-pink mb-3">First Message Strategy</h4>
              <p className="text-sm text-cyber-muted leading-relaxed">{awareness.firstMessageStrategy}</p>
            </div>
          )}

          {awareness.ctaStrategy && (
            <div className="hud-card p-5">
              <h4 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-3">CTA Strategy</h4>
              <p className="text-sm text-cyber-muted leading-relaxed">{awareness.ctaStrategy}</p>
            </div>
          )}

          {(awareness.contentRecommendations as string[])?.length > 0 && (
            <div className="hud-card p-5">
              <h4 className="font-display text-xs tracking-widest uppercase text-neon-pink mb-3">Content Recommendations</h4>
              <ul className="space-y-2">
                {(awareness.contentRecommendations as string[]).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-cyber-muted">
                    <span className="text-neon-pink mt-1">▸</span>{rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-cyber">
            <button
              onClick={() => diagnoseMutation.mutate({ projectId, awarenessLevel: awareness.awarenessLevel as any, attentionMode: awareness.attentionMode as any })}
              disabled={diagnoseMutation.isPending || !canGenerate}
              className="btn-neon-cyan px-4 py-2 rounded text-xs disabled:opacity-50"
            >
              Re-run Diagnosis
            </button>
            <Link href={`/projects/${projectId}/thresholds`}>
              <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
                Next: Threshold Gaps <ChevronRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
