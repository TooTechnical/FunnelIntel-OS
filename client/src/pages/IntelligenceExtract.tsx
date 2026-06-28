import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Brain, ChevronRight, Sparkles } from "lucide-react";
import { Link, useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CardList({ title, items, color = "pink" }: { title: string; items?: string[]; color?: "pink" | "cyan" }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="hud-card p-4">
      <h4 className={`font-display text-xs tracking-widest uppercase mb-3 ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-cyber-muted leading-relaxed">
            <span className={`mt-1 shrink-0 ${color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>▸</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function IntelligenceExtract() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: intel, isLoading } = trpc.intelligence.get.useQuery({ projectId });
  const { data: marketResearch } = trpc.intelligence.getMarketResearch.useQuery({ projectId });
  const { data: interview } = trpc.intelligence.getInterview.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const extractMutation = trpc.intelligence.extract.useMutation({
    onSuccess: () => { utils.intelligence.get.invalidate({ projectId }); toast.success("Intelligence extracted!"); },
    onError: (e) => toast.error(e.message),
  });
  const marketMutation = trpc.intelligence.generateMarketResearch.useMutation({
    onSuccess: () => { utils.intelligence.getMarketResearch.invalidate({ projectId }); toast.success("Market research generated!"); },
    onError: (e) => toast.error(e.message),
  });
  const interviewMutation = trpc.intelligence.generateInterviewBuilder.useMutation({
    onSuccess: () => { utils.intelligence.getInterview.invalidate({ projectId }); toast.success("Interview builder generated!"); },
    onError: (e) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Intelligence Extraction</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-neon-pink" />
            </div>
            <div>
              <div className="text-xs text-cyber-muted font-display tracking-widest">MODULES 2–4</div>
              <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">INTELLIGENCE EXTRACTION</h1>
            </div>
          </div>
          <p className="text-cyber-muted text-sm max-w-xl">
            AI extracts current state, dream state, roadblocks, exact phrases, objections, and awareness level from your research.
          </p>
        </div>
        {!intel && (
          <button
            onClick={() => extractMutation.mutate({ projectId })}
            disabled={extractMutation.isPending || !canGenerate}
            className="btn-neon-solid px-5 py-2.5 rounded flex items-center gap-2 text-xs shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {extractMutation.isPending ? "Extracting..." : "Extract Intelligence"}
          </button>
        )}
      </div>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue generating</Link>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-cyber-muted font-display tracking-widest">LOADING...</p>
        </div>
      ) : !intel ? (
        <div className="hud-card p-12 text-center">
          <Brain className="w-10 h-10 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-display text-sm text-cyber-text tracking-wide mb-2">No intelligence extracted yet</h3>
          <p className="text-xs text-cyber-muted mb-6 max-w-sm mx-auto">
            Add research sources first, then click "Extract Intelligence" to run the AI analysis.
          </p>
          <Link href={`/projects/${projectId}/research`}>
            <a className="btn-neon-cyan px-6 py-2.5 rounded text-xs">← Add Research First</a>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="extract" className="space-y-6">
          <TabsList className="bg-cyber-surface border border-cyber">
            <TabsTrigger value="extract" className="font-display text-xs tracking-wide data-[state=active]:text-neon-pink data-[state=active]:bg-neon-pink/10">
              Module 2: Extract
            </TabsTrigger>
            <TabsTrigger value="market" className="font-display text-xs tracking-wide data-[state=active]:text-neon-cyan data-[state=active]:bg-neon-cyan/10">
              Module 3: Market Research
            </TabsTrigger>
            <TabsTrigger value="interview" className="font-display text-xs tracking-wide data-[state=active]:text-neon-pink data-[state=active]:bg-neon-pink/10">
              Module 4: Interview Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-cyber-muted">Confidence: </span>
                <span className="font-display font-bold text-neon-cyan">{intel.confidenceScore}/10</span>
                <span className={`text-xs px-2 py-0.5 border rounded font-display tracking-wide ${
                  intel.awarenessLevel === "unaware" ? "text-orange-400 border-orange-400/40 bg-orange-400/5" :
                  intel.awarenessLevel === "problem_aware" ? "text-neon-yellow border-neon-yellow/40 bg-neon-yellow/5" :
                  intel.awarenessLevel === "solution_aware" ? "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/5" :
                  "text-green-400 border-green-400/40 bg-green-400/5"
                }`}>
                  {intel.awarenessLevel?.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => extractMutation.mutate({ projectId })}
                disabled={extractMutation.isPending || !canGenerate}
                className="btn-neon-cyan px-4 py-2 rounded text-xs disabled:opacity-50"
              >
                {extractMutation.isPending ? "Re-extracting..." : "Re-extract"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardList title="Current State" items={intel.currentState as string[]} color="pink" />
              <CardList title="Dream State" items={intel.dreamState as string[]} color="cyan" />
              <CardList title="Roadblocks" items={intel.roadblocks as string[]} color="pink" />
              <CardList title="Exact Phrases (Customer Language)" items={intel.exactPhrases as string[]} color="cyan" />
              <CardList title="Pains" items={intel.pains as string[]} color="pink" />
              <CardList title="Desires" items={intel.desires as string[]} color="cyan" />
              <CardList title="Objections" items={intel.objections as string[]} color="pink" />
              <CardList title="Trust Fears" items={intel.trustFears as string[]} color="cyan" />
              <CardList title="Buying Triggers" items={intel.buyingTriggers as string[]} color="pink" />
              <CardList title="Marketing Angles" items={intel.marketingAngles as string[]} color="cyan" />
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            {!marketResearch ? (
              <div className="hud-card p-8 text-center">
                <p className="text-cyber-muted text-sm mb-4">Generate the structured market research template from your intelligence data.</p>
                <button
                  onClick={() => marketMutation.mutate({ projectId })}
                  disabled={marketMutation.isPending || !canGenerate}
                  className="btn-neon-solid px-6 py-2.5 rounded text-xs disabled:opacity-50"
                >
                  {marketMutation.isPending ? "Generating..." : "Generate Market Research"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {["currentState", "dreamState", "roadblocks", "solutions", "productsBusinesses"].map((key, i) => {
                  const data = (marketResearch as any)[key];
                  if (!data) return null;
                  const labels: Record<string, string> = {
                    currentState: "Current State",
                    dreamState: "Dream State",
                    roadblocks: "Roadblocks",
                    solutions: "Solutions",
                    productsBusinesses: "Products & Businesses",
                  };
                  return (
                    <div key={key} className="hud-card p-5">
                      <h4 className={`font-display text-xs tracking-widest uppercase mb-3 ${i % 2 === 0 ? "text-neon-pink" : "text-neon-cyan"}`}>
                        {labels[key]}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-cyber-muted font-display tracking-wide block mb-1">Customer Language</span>
                          <p className="text-cyber-text leading-relaxed">{data.customer_language}</p>
                        </div>
                        <div>
                          <span className="text-cyber-muted font-display tracking-wide block mb-1">Insight</span>
                          <p className="text-cyber-text leading-relaxed">{data.insight}</p>
                        </div>
                        <div>
                          <span className="text-cyber-muted font-display tracking-wide block mb-1">Marketing Use</span>
                          <p className="text-cyber-text leading-relaxed">{data.marketing_use}</p>
                        </div>
                        <div>
                          <span className="text-cyber-muted font-display tracking-wide block mb-1">Confidence</span>
                          <span className="text-neon-cyan font-display font-bold">{data.confidence}/10</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="interview" className="space-y-4">
            {!interview ? (
              <div className="hud-card p-8 text-center">
                <p className="text-cyber-muted text-sm mb-4">Generate interview questions and outreach messages to fill knowledge gaps.</p>
                <button
                  onClick={() => interviewMutation.mutate({ projectId })}
                  disabled={interviewMutation.isPending || !canGenerate}
                  className="btn-neon-solid px-6 py-2.5 rounded text-xs disabled:opacity-50"
                >
                  {interviewMutation.isPending ? "Generating..." : "Generate Interview Builder"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardList title="Knowledge Gaps" items={interview.knowledgeGaps as string[]} color="pink" />
                <CardList title="Buyer Questions" items={interview.buyerQuestions as string[]} color="cyan" />
                <CardList title="Non-Buyer Questions" items={interview.nonBuyerQuestions as string[]} color="pink" />
                <CardList title="Follow-Up Probes" items={interview.followUpProbes as string[]} color="cyan" />
                {interview.notesTemplate && (
                  <div className="hud-card p-4 md:col-span-2">
                    <h4 className="font-display text-xs tracking-widest uppercase text-neon-pink mb-3">Notes Template</h4>
                    <pre className="text-xs text-cyber-muted whitespace-pre-wrap leading-relaxed">{interview.notesTemplate}</pre>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {intel && (
        <div className="flex justify-end mt-8 pt-4 border-t border-cyber">
          <Link href={`/projects/${projectId}/buyer-journey`}>
            <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
              Next: Buyer Journey <ChevronRight className="w-3 h-3" />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
