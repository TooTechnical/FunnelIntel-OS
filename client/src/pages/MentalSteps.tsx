import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, Lightbulb, Sparkles } from "lucide-react";
import { Link, useParams } from "wouter";

export default function MentalSteps() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: mentalSteps, isLoading } = trpc.mentalSteps.get.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const generateMutation = trpc.mentalSteps.generate.useMutation({
    onSuccess: () => { utils.mentalSteps.get.invalidate({ projectId }); toast.success("Mental steps generated!"); },
    onError: (e) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;
  const stepsData = mentalSteps?.steps as any;
  const steps = Array.isArray(stepsData) ? stepsData : (stepsData?.steps ?? []);
  const triggers = stepsData?.triggers ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Mental Steps</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-neon-pink" />
            </div>
            <div>
              <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 8</div>
              <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">MENTAL STEPS + TRIGGERS</h1>
            </div>
          </div>
          <p className="text-cyber-muted text-sm max-w-xl">
            Build the ordered chain of mental steps and psychological triggers your prospect must experience before they take action.
          </p>
        </div>
        <button
          onClick={() => generateMutation.mutate({ projectId })}
          disabled={generateMutation.isPending || !canGenerate}
          className="btn-neon-solid px-5 py-2.5 rounded flex items-center gap-2 text-xs shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {generateMutation.isPending ? "Generating..." : mentalSteps ? "Regenerate" : "Generate"}
        </button>
      </div>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue</Link>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      ) : !mentalSteps ? (
        <div className="hud-card p-12 text-center">
          <Lightbulb className="w-10 h-10 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-display text-sm text-cyber-text tracking-wide mb-2">No mental steps generated yet</h3>
          <p className="text-xs text-cyber-muted mb-6 max-w-sm mx-auto">Complete awareness diagnosis and threshold analysis first.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mental Steps Chain */}
          <div>
            <h3 className="font-display text-xs tracking-widest uppercase text-neon-pink mb-4">Mental Steps Chain</h3>
            <div className="space-y-3">
              {steps.map((step: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 ${
                      i % 2 === 0 ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/40" : "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                    }`}>{i + 1}</div>
                    {i < steps.length - 1 && <div className="w-px flex-1 bg-cyber-border mt-1" />}
                  </div>
                  <div className="hud-card p-4 flex-1 mb-3">
                    <div className={`font-display text-sm tracking-wide mb-2 ${i % 2 === 0 ? "text-neon-pink" : "text-neon-cyan"}`}>
                      {step.step}
                    </div>
                    {step.description && <p className="text-xs text-cyber-muted leading-relaxed mb-2">{step.description}</p>}
                    {step.copy_direction && (
                      <div className="bg-cyber-surface/50 rounded p-2 text-xs text-cyber-muted">
                        <span className="font-display tracking-wide text-cyber-text">Copy Direction: </span>{step.copy_direction}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Psychological Triggers */}
          {triggers.length > 0 && (
            <div>
              <h3 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-4">Psychological Triggers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {triggers.map((trigger: any, i: number) => (
                  <div key={i} className="hud-card hud-card-cyan p-4">
                    <div className="font-display text-sm text-neon-cyan tracking-wide mb-2">{trigger.trigger}</div>
                    {trigger.how_to_use && <p className="text-xs text-cyber-muted leading-relaxed">{trigger.how_to_use}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-cyber">
            <Link href={`/projects/${projectId}/funnel-skeleton`}>
              <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
                Next: Funnel Skeleton <ChevronRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
