import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, Layout, Sparkles } from "lucide-react";
import { Link, useParams } from "wouter";

export default function FunnelSkeleton() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: skeleton, isLoading } = trpc.funnelSkeleton.get.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const generateMutation = trpc.funnelSkeleton.generate.useMutation({
    onSuccess: () => { utils.funnelSkeleton.get.invalidate({ projectId }); toast.success("Funnel skeleton generated!"); },
    onError: (e) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;
  const sections = (skeleton?.sections as any[]) ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Funnel Skeleton</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
              <Layout className="w-4 h-4 text-neon-pink" />
            </div>
            <div>
              <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 9</div>
              <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">FUNNEL SKELETON</h1>
            </div>
          </div>
          <p className="text-cyber-muted text-sm max-w-xl">
            Generate an 11-section landing page skeleton with copy directions, emotional targets, and objection handling for each section.
          </p>
        </div>
        <button
          onClick={() => generateMutation.mutate({ projectId })}
          disabled={generateMutation.isPending || !canGenerate}
          className="btn-neon-solid px-5 py-2.5 rounded flex items-center gap-2 text-xs shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {generateMutation.isPending ? "Generating..." : skeleton ? "Regenerate" : "Generate Skeleton"}
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
      ) : !skeleton ? (
        <div className="hud-card p-12 text-center">
          <Layout className="w-10 h-10 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-display text-sm text-cyber-text tracking-wide mb-2">No skeleton generated yet</h3>
          <p className="text-xs text-cyber-muted mb-6 max-w-sm mx-auto">Complete mental steps first, then generate the funnel skeleton.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(skeleton as any).overallStrategy && (
            <div className="hud-card p-5 border-neon-cyan/40 bg-neon-cyan/5">
              <h4 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-2">Overall Strategy</h4>
              <p className="text-sm text-cyber-muted leading-relaxed">{(skeleton as any).overallStrategy}</p>
            </div>
          )}
          {sections.map((section: any, i: number) => (
            <div key={i} className={`hud-card p-5 ${i % 2 === 0 ? "" : "hud-card-cyan"}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-7 h-7 rounded flex items-center justify-center font-display font-bold text-xs ${
                  i % 2 === 0 ? "bg-neon-pink/20 text-neon-pink" : "bg-neon-cyan/20 text-neon-cyan"
                }`}>{i + 1}</div>
                <h3 className={`font-display font-bold text-sm tracking-widest ${i % 2 === 0 ? "text-neon-pink" : "text-neon-cyan"}`}>
                  {section.section_name ?? section.name}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Purpose", value: section.purpose },
                  { label: "Copy Direction", value: section.copy_direction },
                  { label: "Emotional Target", value: section.emotional_target },
                  { label: "Objection Handled", value: section.objection_handled },
                  { label: "Awareness Level Addressed", value: section.awareness_level_addressed },
                  { label: "Mental Step Triggered", value: section.mental_step_triggered },
                ].filter(f => f.value).map((field, j) => (
                  <div key={j} className="bg-cyber-surface/50 rounded p-3">
                    <div className="text-xs text-cyber-muted font-display tracking-wide mb-1">{field.label}</div>
                    <p className="text-xs text-cyber-text leading-relaxed">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4 border-t border-cyber">
            <Link href={`/projects/${projectId}/drafting`}>
              <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
                Next: Drafting Studio <ChevronRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
