import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Slider } from "@/components/ui/slider";

function GapBar({ label, current, required, color }: { label: string; current: number; required: number; color: "pink" | "cyan" | "purple" }) {
  const gap = required - current;
  const colorClass = color === "pink" ? "bg-neon-pink" : color === "cyan" ? "bg-neon-cyan" : "bg-neon-purple";
  const textClass = color === "pink" ? "text-neon-pink" : color === "cyan" ? "text-neon-cyan" : "text-neon-purple";
  return (
    <div className="hud-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`font-display text-sm tracking-widest uppercase ${textClass}`}>{label}</span>
        <span className={`font-display font-bold text-lg ${textClass}`}>Gap: {gap > 0 ? `+${gap}` : gap}</span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-cyber-muted mb-1">
            <span>Current</span><span>{current}/10</span>
          </div>
          <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
            <div className={`h-full ${colorClass} opacity-50 rounded-full`} style={{ width: `${current * 10}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-cyber-muted mb-1">
            <span>Required</span><span>{required}/10</span>
          </div>
          <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
            <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${required * 10}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThresholdGap() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: threshold, isLoading } = trpc.threshold.get.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const [vals, setVals] = useState({ currentDesire: 3, requiredDesire: 8, currentCertainty: 4, requiredCertainty: 8, currentTrust: 3, requiredTrust: 8 });

  const analyzeMutation = trpc.threshold.analyze.useMutation({
    onSuccess: () => { utils.threshold.get.invalidate({ projectId }); toast.success("Threshold analysis complete!"); },
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
        <span className="text-neon-pink">Threshold Gaps</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-neon-pink" />
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 7</div>
          <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">THRESHOLD GAP ANALYSIS</h1>
        </div>
      </div>
      <p className="text-cyber-muted text-sm mb-8 max-w-xl">
        Score desire, certainty, and trust — where they are now vs where they need to be to act. The biggest gap tells you what your funnel must fix.
      </p>

      {!threshold ? (
        <div className="space-y-6">
          {[
            { key: "Desire", current: "currentDesire", required: "requiredDesire", color: "pink" as const, desc: "How much they want the outcome" },
            { key: "Certainty", current: "currentCertainty", required: "requiredCertainty", color: "cyan" as const, desc: "How certain they are your solution works" },
            { key: "Trust", current: "currentTrust", required: "requiredTrust", color: "purple" as const, desc: "How much they trust you specifically" },
          ].map(({ key, current, required, color, desc }) => {
            const colorClass = color === "pink" ? "text-neon-pink" : color === "cyan" ? "text-neon-cyan" : "text-neon-purple";
            return (
              <div key={key} className="hud-card p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-display text-sm tracking-widest uppercase ${colorClass}`}>{key}</span>
                  <span className="text-xs text-cyber-muted">{desc}</span>
                </div>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="text-xs text-cyber-muted font-display tracking-wide block mb-2">Current Level: {(vals as any)[current]}/10</label>
                    <Slider
                      min={1} max={10} step={1}
                      value={[(vals as any)[current]]}
                      onValueChange={([v]) => setVals(prev => ({ ...prev, [current]: v }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-cyber-muted font-display tracking-wide block mb-2">Required Level: {(vals as any)[required]}/10</label>
                    <Slider
                      min={1} max={10} step={1}
                      value={[(vals as any)[required]]}
                      onValueChange={([v]) => setVals(prev => ({ ...prev, [required]: v }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => analyzeMutation.mutate({ projectId, ...vals })}
            disabled={analyzeMutation.isPending || !canGenerate}
            className="btn-neon-solid px-6 py-2.5 rounded text-xs disabled:opacity-50"
          >
            {analyzeMutation.isPending ? "Analyzing..." : "Run Threshold Analysis"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GapBar label="Desire" current={threshold.currentDesire ?? 0} required={threshold.requiredDesire ?? 0} color="pink" />
            <GapBar label="Certainty" current={threshold.currentCertainty ?? 0} required={threshold.requiredCertainty ?? 0} color="cyan" />
            <GapBar label="Trust" current={threshold.currentTrust ?? 0} required={threshold.requiredTrust ?? 0} color="purple" />
          </div>

          <div className="hud-card border-neon-pink/60 bg-neon-pink/5 p-5">
            <div className="text-xs text-cyber-muted font-display tracking-widest mb-2">BIGGEST GAP</div>
            <div className="font-display font-black text-2xl text-neon-pink glow-sm-pink tracking-widest uppercase">{threshold.biggestGap}</div>
            {threshold.funnelFocus && <p className="text-sm text-cyber-muted mt-2 leading-relaxed">{threshold.funnelFocus}</p>}
          </div>

          {(threshold.recommendations as any[])?.map((rec: any, i: number) => (
            <div key={i} className="hud-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-display text-xs tracking-widest uppercase ${i % 2 === 0 ? "text-neon-pink" : "text-neon-cyan"}`}>{rec.threshold}</span>
                <span className="text-xs text-cyber-muted">Gap: {rec.gap}</span>
              </div>
              <p className="text-sm text-cyber-muted mb-3">{rec.recommendation}</p>
              {rec.funnel_elements?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rec.funnel_elements.map((el: string, j: number) => (
                    <span key={j} className="text-xs px-2 py-0.5 border border-cyber rounded text-cyber-muted">{el}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between pt-4 border-t border-cyber">
            <button
              onClick={() => analyzeMutation.mutate({ projectId, ...vals })}
              disabled={analyzeMutation.isPending || !canGenerate}
              className="btn-neon-cyan px-4 py-2 rounded text-xs disabled:opacity-50"
            >
              Re-analyze
            </button>
            <Link href={`/projects/${projectId}/mental-steps`}>
              <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
                Next: Mental Steps <ChevronRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
