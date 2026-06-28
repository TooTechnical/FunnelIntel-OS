import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckSquare, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Textarea } from "@/components/ui/textarea";

const REVIEW_CATEGORIES = [
  { key: "lizardBrain", label: "Lizard Brain Check", color: "pink" as const, desc: "Does the copy trigger primal responses — fear, desire, safety, status?" },
  { key: "batonHandoff", label: "Baton Handoff", color: "cyan" as const, desc: "Does each section hand off smoothly to the next without dropping momentum?" },
  { key: "thresholdCheck", label: "Threshold Check", color: "pink" as const, desc: "Does the copy address the biggest desire/certainty/trust gap?" },
  { key: "languageCheck", label: "Language Check", color: "cyan" as const, desc: "Is customer language used throughout? Are vague words eliminated?" },
  { key: "finalCheck", label: "Final Check", color: "pink" as const, desc: "Overall readability, flow, and conversion readiness." },
];

export default function SelfReview() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: reviews = [], isLoading } = trpc.selfReview.list.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const [content, setContent] = useState("");

  const runMutation = trpc.selfReview.run.useMutation({
    onSuccess: () => { utils.selfReview.list.invalidate({ projectId }); setContent(""); toast.success("Review complete!"); },
    onError: (e) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;
  const latestReview = reviews[0];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Self-Review</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-neon-pink" />
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 11</div>
          <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">SELF-REVIEW CHECKER</h1>
        </div>
      </div>
      <p className="text-cyber-muted text-sm mb-8 max-w-xl">
        Paste your copy draft and run a 5-category review: lizard brain, baton handoff, threshold check, language check, and final assessment.
      </p>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue</Link>
        </div>
      )}

      {/* Input */}
      <div className="hud-card p-5 mb-8">
        <h3 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-4">Paste Your Copy Draft</h3>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste the full copy you want reviewed here..."
          className="bg-cyber-surface border-cyber text-cyber-text text-sm resize-none mb-3"
          rows={8}
        />
        <button
          onClick={() => runMutation.mutate({ projectId, content })}
          disabled={!content || runMutation.isPending || !canGenerate}
          className="btn-neon-solid px-6 py-2.5 rounded text-xs disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {runMutation.isPending ? "Reviewing..." : "Run 5-Category Review"}
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      ) : latestReview && (
        <div className="space-y-4">
          {/* Score summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Overall Score", value: latestReview.overallScore, color: "pink" as const },
              { label: "Lizard Brain", value: (latestReview.lizardBrainScore as any)?.score, color: "cyan" as const },
              { label: "Language", value: (latestReview.languageScore as any)?.score, color: "pink" as const },
              { label: "Threshold", value: (latestReview.thresholdScore as any)?.score, color: "cyan" as const },
            ].map((item, i) => (
              <div key={i} className={`hud-card p-4 text-center ${item.color === "cyan" ? "hud-card-cyan" : ""}`}>
                <div className="text-xs text-cyber-muted font-display tracking-widest mb-1">{item.label}</div>
                <div className={`font-display font-black text-2xl ${item.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
                  {item.value ?? "—"}<span className="text-sm text-cyber-muted">/10</span>
                </div>
              </div>
            ))}
          </div>

          {/* Category breakdowns */}
          {REVIEW_CATEGORIES.map(({ key, label, color, desc }) => {
            const data = (latestReview as any)[`${key}Score`] ?? (latestReview as any)[key];
            if (!data) return null;
            return (
              <div key={key} className={`hud-card p-5 ${color === "cyan" ? "hud-card-cyan" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className={`font-display text-sm tracking-widest uppercase ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>{label}</h4>
                    <p className="text-xs text-cyber-muted mt-0.5">{desc}</p>
                  </div>
                  {data.score && (
                    <div className={`font-display font-bold text-xl ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
                      {data.score}/10
                    </div>
                  )}
                </div>
                {data.assessment && <p className="text-sm text-cyber-muted leading-relaxed mb-3">{data.assessment}</p>}
                {data.issues?.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-cyber-muted font-display tracking-wide mb-2">Issues Found</div>
                    <ul className="space-y-1">
                      {data.issues.map((issue: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-neon-pink">
                          <span className="mt-0.5">✗</span>{issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.suggestions?.length > 0 && (
                  <div>
                    <div className="text-xs text-cyber-muted font-display tracking-wide mb-2">Suggestions</div>
                    <ul className="space-y-1">
                      {data.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-neon-cyan">
                          <span className="mt-0.5">→</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {(latestReview as any).topPriority && (
            <div className="hud-card border-neon-pink/60 bg-neon-pink/5 p-5">
              <h4 className="font-display text-xs tracking-widest uppercase text-neon-pink mb-2">Top Priority Fix</h4>
              <p className="text-sm text-cyber-text leading-relaxed">{(latestReview as any).topPriority}</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-cyber">
            <Link href={`/projects/${projectId}/competitor-review`}>
              <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
                Next: Competitor Review <ChevronRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
