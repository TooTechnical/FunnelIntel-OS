import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, BarChart3, Sparkles, RefreshCw } from "lucide-react";
import { Link, useParams } from "wouter";

const SECTIONS = [
  { key: "currentState", label: "Current State", desc: "Where the customer is right now — their situation, frustrations, and reality.", color: "pink" as const },
  { key: "dreamState", label: "Dream State", desc: "Where the customer wants to be — their ideal outcome and transformation.", color: "cyan" as const },
  { key: "roadblocks", label: "Roadblocks", desc: "What's stopping them from getting to the dream state.", color: "pink" as const },
  { key: "solutions", label: "Solutions Tried", desc: "What they've already tried and why it didn't work.", color: "cyan" as const },
  { key: "productsBusinesses", label: "Products & Businesses", desc: "What products, services, or businesses they've considered or used.", color: "pink" as const },
];

function SectionCard({
  label,
  desc,
  data,
  color,
}: {
  label: string;
  desc: string;
  data: any;
  color: "pink" | "cyan";
}) {
  const colorClass = color === "pink" ? "text-neon-pink" : "text-neon-cyan";
  const borderClass = color === "pink" ? "border-neon-pink/30" : "border-neon-cyan/30";

  if (!data) {
    return (
      <div className={`hud-card p-5 border ${borderClass} opacity-50`}>
        <h3 className={`font-display text-xs tracking-widest uppercase mb-1 ${colorClass}`}>{label}</h3>
        <p className="text-xs text-cyber-muted">{desc}</p>
        <p className="text-xs text-cyber-muted mt-3 italic">Not yet generated.</p>
      </div>
    );
  }

  return (
    <div className={`hud-card p-5 border ${borderClass}`}>
      <h3 className={`font-display text-xs tracking-widest uppercase mb-1 ${colorClass}`}>{label}</h3>
      <p className="text-xs text-cyber-muted mb-4">{desc}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-wide mb-1.5">Customer Language</div>
          <p className="text-xs text-cyber-text leading-relaxed bg-cyber-dark/50 p-3 rounded border border-cyber">
            {data.customer_language ?? data.customerLanguage ?? "—"}
          </p>
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-wide mb-1.5">Strategic Insight</div>
          <p className="text-xs text-cyber-text leading-relaxed bg-cyber-dark/50 p-3 rounded border border-cyber">
            {data.insight ?? "—"}
          </p>
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-wide mb-1.5">Marketing Use</div>
          <p className="text-xs text-cyber-text leading-relaxed bg-cyber-dark/50 p-3 rounded border border-cyber">
            {data.marketing_use ?? data.marketingUse ?? "—"}
          </p>
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-wide mb-1.5">Confidence Score</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-cyber-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${color === "pink" ? "bg-neon-pink" : "bg-neon-cyan"}`}
                style={{ width: `${(data.confidence ?? 7) * 10}%` }}
              />
            </div>
            <span className={`font-display font-bold text-sm ${colorClass}`}>
              {data.confidence ?? 7}/10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketResearch() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: intel } = trpc.intelligence.get.useQuery({ projectId });
  const { data: marketResearch, isLoading } = trpc.intelligence.getMarketResearch.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const marketMutation = trpc.intelligence.generateMarketResearch.useMutation({
    onSuccess: () => {
      utils.intelligence.getMarketResearch.invalidate({ projectId });
      toast.success("Market research template generated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const canGenerate = subStatus?.canGenerate ?? false;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan transition-colors">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan transition-colors">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Market Research Template</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-neon-pink" />
            </div>
            <div>
              <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 3B</div>
              <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">MARKET RESEARCH TEMPLATE</h1>
            </div>
          </div>
          <p className="text-cyber-muted text-sm max-w-xl">
            Structured breakdown of your market across five strategic dimensions — with customer language, insights, and marketing use for each.
          </p>
        </div>
        <button
          onClick={() => marketMutation.mutate({ projectId })}
          disabled={marketMutation.isPending || !canGenerate || !intel}
          className="btn-neon-solid px-5 py-2.5 rounded flex items-center gap-2 text-xs shrink-0 disabled:opacity-50"
        >
          {marketMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {marketMutation.isPending ? "Generating..." : marketResearch ? "Regenerate" : "Generate Template"}
        </button>
      </div>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue</Link>
        </div>
      )}

      {!intel && (
        <div className="hud-card p-8 text-center mb-6">
          <p className="text-cyber-muted text-sm mb-3">You need to run Intelligence Extraction first before generating the market research template.</p>
          <Link href={`/projects/${projectId}/intelligence`}>
            <a className="btn-neon-solid px-5 py-2.5 rounded text-xs inline-flex items-center gap-2">
              Go to Intelligence Extract <ChevronRight className="w-3 h-3" />
            </a>
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-display tracking-widest text-cyber-muted">LOADING...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <SectionCard
              key={section.key}
              label={section.label}
              desc={section.desc}
              data={marketResearch ? (marketResearch as any)[section.key] : null}
              color={section.color}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-cyber">
        <Link href={`/projects/${projectId}/intelligence`}>
          <a className="btn-neon-cyan px-5 py-2.5 rounded text-xs flex items-center gap-2">
            ← Intelligence Extract
          </a>
        </Link>
        <Link href={`/projects/${projectId}/buyer-journey`}>
          <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
            Next: Buyer Journey <ChevronRight className="w-3 h-3" />
          </a>
        </Link>
      </div>
    </div>
  );
}
