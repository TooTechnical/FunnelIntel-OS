import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, Edit3, Sparkles, Copy } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ASSET_TYPES = [
  { value: "social_ad", label: "Social Ad" },
  { value: "social_ad_visual", label: "Social Ad Visual" },
  { value: "google_ad", label: "Google Ad" },
  { value: "landing_page", label: "Landing Page" },
  { value: "offer_section", label: "Offer Section" },
  { value: "cta_buttons", label: "CTA Buttons" },
  { value: "email_sequence", label: "Email Sequence" },
  { value: "outreach_dm", label: "Outreach DM" },
  { value: "sales_call_script", label: "Sales Call Script" },
  { value: "faq", label: "FAQ" },
  { value: "follow_up", label: "Follow Up" },
] as const;

type AssetTypeValue = typeof ASSET_TYPES[number]["value"];

export default function DraftingStudio() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: drafts = [], isLoading } = trpc.drafting.list.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const [assetType, setAssetType] = useState<AssetTypeValue>("social_ad");
  const [elementName, setElementName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrimary, setEditPrimary] = useState("");

  const generateMutation = trpc.drafting.generate.useMutation({
    onSuccess: () => { utils.drafting.list.invalidate({ projectId }); toast.success("Copy generated!"); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.drafting.update.useMutation({
    onSuccess: () => { utils.drafting.list.invalidate({ projectId }); setEditingId(null); toast.success("Saved"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.drafting.delete.useMutation({
    onSuccess: () => { utils.drafting.list.invalidate({ projectId }); toast.success("Deleted"); },
  });

  const canGenerate = subStatus?.canGenerate ?? false;

  const groupedDrafts = drafts.reduce((acc: Record<string, typeof drafts>, draft) => {
    const key = draft.assetType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(draft);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Drafting Studio</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
          <Edit3 className="w-4 h-4 text-neon-pink" />
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 10</div>
          <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">DRAFTING STUDIO</h1>
        </div>
      </div>
      <p className="text-cyber-muted text-sm mb-8 max-w-xl">
        Generate copy asset by asset — social ads, landing pages, email sequences, CTAs — with primary copy and 3 variations you can edit inline.
      </p>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue</Link>
        </div>
      )}

      {/* Generate panel */}
      <div className="hud-card p-5 mb-8">
        <h3 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-4">Generate Copy Asset</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">Asset Type</label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetTypeValue)}>
              <SelectTrigger className="bg-cyber-surface border-cyber text-cyber-text text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cyber-dark border-cyber text-cyber-text max-h-60">
                {ASSET_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-cyber-text hover:bg-cyber-surface focus:bg-cyber-surface">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">Element Name (optional)</label>
            <input
              value={elementName}
              onChange={e => setElementName(e.target.value)}
              placeholder="e.g. Hero headline, Pain-point hook..."
              className="w-full px-3 py-2 bg-cyber-surface border border-cyber rounded text-cyber-text text-sm outline-none focus:border-neon-pink/60"
            />
          </div>
        </div>
        <button
          onClick={() => generateMutation.mutate({ projectId, assetType, elementName: elementName || undefined })}
          disabled={generateMutation.isPending || !canGenerate}
          className="mt-3 btn-neon-solid px-6 py-2.5 rounded text-xs disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {generateMutation.isPending ? "Generating..." : "Generate Copy + 3 Variations"}
        </button>
      </div>

      {/* Drafts */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="hud-card p-8 text-center">
          <Edit3 className="w-8 h-8 text-cyber-muted mx-auto mb-3" />
          <p className="text-xs text-cyber-muted">No drafts yet. Generate your first copy asset above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDrafts).map(([type, typeDrafts]) => {
            const typeLabel = ASSET_TYPES.find(t => t.value === type)?.label ?? type;
            return (
              <div key={type}>
                <h3 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-3">{typeLabel}</h3>
                <div className="space-y-4">
                  {typeDrafts.map((draft, i) => {
                    const variations = (draft.variations as string[]) ?? [];
                    return (
                      <div key={draft.id} className="hud-card p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-xs text-cyber-muted font-display tracking-wide">Asset #{i + 1}</span>
                            {draft.elementName && <span className="ml-2 text-xs text-neon-cyan">{draft.elementName}</span>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { navigator.clipboard.writeText(draft.primaryCopy ?? ""); toast.success("Copied!"); }}
                              className="text-cyber-muted hover:text-neon-cyan transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setEditingId(draft.id); setEditPrimary(draft.primaryCopy ?? ""); }}
                              className="text-cyber-muted hover:text-neon-pink transition-colors text-xs font-display tracking-wide"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate({ id: draft.id })}
                              className="text-cyber-muted hover:text-neon-pink transition-colors text-xs font-display tracking-wide"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Primary copy */}
                        <div className="mb-4">
                          <div className="text-xs text-cyber-muted font-display tracking-wide mb-2">Primary Copy</div>
                          {editingId === draft.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editPrimary}
                                onChange={e => setEditPrimary(e.target.value)}
                                className="bg-cyber-surface border-cyber text-cyber-text text-sm resize-none"
                                rows={4}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateMutation.mutate({ id: draft.id, primaryCopy: editPrimary })}
                                  disabled={updateMutation.isPending}
                                  className="btn-neon-solid px-4 py-1.5 rounded text-xs"
                                >
                                  Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="btn-neon-cyan px-4 py-1.5 rounded text-xs">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-cyber-text leading-relaxed whitespace-pre-wrap bg-cyber-surface/50 rounded p-3">
                              {draft.primaryCopy}
                            </p>
                          )}
                        </div>

                        {/* Variations */}
                        {variations.length > 0 && (
                          <div>
                            <div className="text-xs text-cyber-muted font-display tracking-wide mb-2">Variations</div>
                            <div className="space-y-2">
                              {variations.map((v, vi) => (
                                <div key={vi} className="flex items-start gap-2">
                                  <span className="text-xs text-neon-cyan font-display shrink-0 mt-0.5">{vi + 1}.</span>
                                  <p className="text-xs text-cyber-muted leading-relaxed">{v}</p>
                                  <button
                                    onClick={() => { navigator.clipboard.writeText(v); toast.success("Copied!"); }}
                                    className="text-cyber-muted hover:text-neon-cyan transition-colors shrink-0 ml-auto"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cyber">
                          {draft.elementJob && <span className="text-xs px-2 py-0.5 border border-cyber rounded text-cyber-muted">{draft.elementJob}</span>}
                          {draft.thresholdAffected && <span className="text-xs px-2 py-0.5 border border-neon-cyan/30 rounded text-neon-cyan">{draft.thresholdAffected}</span>}
                          {draft.mentalStep && <span className="text-xs px-2 py-0.5 border border-neon-pink/30 rounded text-neon-pink">{draft.mentalStep}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {drafts.length > 0 && (
        <div className="flex justify-end mt-8 pt-4 border-t border-cyber">
          <Link href={`/projects/${projectId}/self-review`}>
            <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
              Next: Self-Review <ChevronRight className="w-3 h-3" />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
