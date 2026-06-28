import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, Network, Sparkles } from "lucide-react";
import { Link, useParams } from "wouter";

const STAGE_COLORS = ["pink","cyan","pink","cyan","pink","cyan","pink","cyan"] as const;

export default function BuyerJourney() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: journey, isLoading } = trpc.buyerJourney.get.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const generateMutation = trpc.buyerJourney.generate.useMutation({
    onSuccess: () => { utils.buyerJourney.get.invalidate({ projectId }); toast.success("Buyer journey mapped!"); },
    onError: (e) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;
  const stages = (journey?.stages as any[]) ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Buyer Journey</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
              <Network className="w-4 h-4 text-neon-pink" />
            </div>
            <div>
              <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 5</div>
              <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">BUYER JOURNEY MAP</h1>
            </div>
          </div>
          <p className="text-cyber-muted text-sm max-w-xl">
            Map all 8 buyer journey stages — from before state to after-action experience — with thoughts, feelings, and exact language at each step.
          </p>
        </div>
        <button
          onClick={() => generateMutation.mutate({ projectId })}
          disabled={generateMutation.isPending || !canGenerate}
          className="btn-neon-solid px-5 py-2.5 rounded flex items-center gap-2 text-xs shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {generateMutation.isPending ? "Mapping..." : journey ? "Regenerate" : "Generate Journey"}
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
      ) : !journey ? (
        <div className="hud-card p-12 text-center">
          <Network className="w-10 h-10 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-display text-sm text-cyber-text tracking-wide mb-2">No buyer journey mapped yet</h3>
          <p className="text-xs text-cyber-muted mb-6 max-w-sm mx-auto">Run intelligence extraction first, then generate the buyer journey map.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage: any, i: number) => {
            const color = STAGE_COLORS[i % STAGE_COLORS.length];
            return (
              <div key={i} className={`hud-card p-5 ${color === "pink" ? "" : "hud-card-cyan"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-display font-bold text-sm ${
                    color === "pink" ? "bg-neon-pink/20 text-neon-pink" : "bg-neon-cyan/20 text-neon-cyan"
                  }`}>{i + 1}</div>
                  <h3 className={`font-display font-bold text-sm tracking-widest ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
                    {stage.stage_name ?? stage.stage}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "What Happened", value: stage.happened },
                    { label: "Thought", value: stage.thought },
                    { label: "Felt", value: stage.felt },
                    { label: "Language Used", value: stage.language },
                    { label: "Marketing Opportunity", value: stage.marketing_opportunity },
                  ].filter(f => f.value).map((field, j) => (
                    <div key={j} className="bg-cyber-surface/50 rounded p-3">
                      <div className="text-xs text-cyber-muted font-display tracking-wide mb-1">{field.label}</div>
                      <p className="text-xs text-cyber-text leading-relaxed">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {journey && (
        <div className="flex justify-end mt-8 pt-4 border-t border-cyber">
          <Link href={`/projects/${projectId}/awareness`}>
            <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
              Next: Awareness Diagnosis <ChevronRight className="w-3 h-3" />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
