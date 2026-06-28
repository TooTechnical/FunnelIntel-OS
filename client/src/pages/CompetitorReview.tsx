import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CompetitorReview() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: review, isLoading } = trpc.competitorReview.get.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const [form, setForm] = useState({ userAd: "", competitorAd1: "", competitorAd2: "", topPlayerAd: "", userLandingPage: "", competitorLandingPage: "" });

  const saveMutation = trpc.competitorReview.save.useMutation({
    onSuccess: () => { utils.competitorReview.get.invalidate({ projectId }); toast.success("Saved!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const analyzeMutation = trpc.competitorReview.analyze.useMutation({
    onSuccess: () => { utils.competitorReview.get.invalidate({ projectId }); toast.success("Analysis complete!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Competitor Review</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
          <Eye className="w-4 h-4 text-neon-pink" />
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 12</div>
          <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">COMPETITOR COMPARISON</h1>
        </div>
      </div>
      <p className="text-cyber-muted text-sm mb-8 max-w-xl">
        Compare your ad and landing page against competitors. Get an insider review board analysis with differentiation opportunities.
      </p>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue</Link>
        </div>
      )}

      <Tabs defaultValue="input" className="space-y-6">
        <TabsList className="bg-cyber-surface border border-cyber">
          <TabsTrigger value="input" className="font-display text-xs tracking-wide data-[state=active]:text-neon-pink data-[state=active]:bg-neon-pink/10">
            Input Copy
          </TabsTrigger>
          <TabsTrigger value="results" className="font-display text-xs tracking-wide data-[state=active]:text-neon-cyan data-[state=active]:bg-neon-cyan/10">
            Analysis Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "userAd", label: "Your Ad Copy", color: "pink" },
              { key: "competitorAd1", label: "Competitor 1 Ad", color: "cyan" },
              { key: "competitorAd2", label: "Competitor 2 Ad", color: "pink" },
              { key: "topPlayerAd", label: "Top Player / Market Leader Ad", color: "cyan" },
              { key: "userLandingPage", label: "Your Landing Page Copy", color: "pink" },
              { key: "competitorLandingPage", label: "Competitor Landing Page Copy", color: "cyan" },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <label className={`text-xs font-display tracking-wide block mb-1 ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>{label}</label>
                <Textarea
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={`Paste ${label.toLowerCase()} here...`}
                  className="bg-cyber-surface border-cyber text-cyber-text text-sm resize-none"
                  rows={5}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveMutation.mutate({ projectId, ...form })}
              disabled={saveMutation.isPending}
              className="btn-neon-cyan px-5 py-2.5 rounded text-xs disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving..." : "Save Copy"}
            </button>
            <button
              onClick={() => analyzeMutation.mutate({ projectId })}
              disabled={analyzeMutation.isPending || !canGenerate}
              className="btn-neon-solid px-5 py-2.5 rounded text-xs disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {analyzeMutation.isPending ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            </div>
          ) : !review?.winningVariation ? (
            <div className="hud-card p-8 text-center">
              <Eye className="w-8 h-8 text-cyber-muted mx-auto mb-3" />
              <p className="text-xs text-cyber-muted">No analysis yet. Save your copy and run the analysis.</p>
            </div>
          ) : (
            <>
              <div className="hud-card border-neon-cyan/40 bg-neon-cyan/5 p-5">
                <h4 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-2">Winning Variation</h4>
                <p className="text-sm text-cyber-text font-display">{review.winningVariation}</p>
                {review.whyItWon && <p className="text-xs text-cyber-muted mt-2 leading-relaxed">{review.whyItWon}</p>}
              </div>

              {review.thresholdIssue && (
                <div className="hud-card p-4">
                  <div className="text-xs text-cyber-muted font-display tracking-widest mb-1">THRESHOLD ISSUE</div>
                  <div className="font-display font-bold text-neon-pink text-sm uppercase">{review.thresholdIssue}</div>
                </div>
              )}

              {(review.reviewQuestions as string[])?.length > 0 && (
                <div className="hud-card p-5">
                  <h4 className="font-display text-xs tracking-widest uppercase text-neon-pink mb-3">Insider Review Questions</h4>
                  <ul className="space-y-2">
                    {(review.reviewQuestions as string[]).map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-cyber-muted">
                        <span className="text-neon-pink mt-0.5">{i + 1}.</span>{q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.revisionRecommendation && (
                <div className="hud-card border-neon-pink/60 bg-neon-pink/5 p-5">
                  <h4 className="font-display text-xs tracking-widest uppercase text-neon-pink mb-2">Revision Recommendation</h4>
                  <p className="text-sm text-cyber-text leading-relaxed">{review.revisionRecommendation}</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8 pt-4 border-t border-cyber">
        <Link href={`/projects/${projectId}/export`}>
          <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
            Next: Export Report <ChevronRight className="w-3 h-3" />
          </a>
        </Link>
      </div>
    </div>
  );
}
