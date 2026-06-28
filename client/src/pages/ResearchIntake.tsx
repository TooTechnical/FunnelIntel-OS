import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BookOpen, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SOURCE_TYPES = [
  { value: "customer_review", label: "Customer Review" },
  { value: "interview_notes", label: "Interview Notes" },
  { value: "sales_call_transcript", label: "Sales Call Transcript" },
  { value: "reddit_comment", label: "Reddit Comment" },
  { value: "youtube_comment", label: "YouTube Comment" },
  { value: "trustpilot_review", label: "Trustpilot Review" },
  { value: "google_review", label: "Google Review" },
  { value: "competitor_copy", label: "Competitor Copy" },
  { value: "client_notes", label: "Client Notes" },
  { value: "testimonial", label: "Testimonial" },
  { value: "survey_answer", label: "Survey Answer" },
  { value: "general_market_research", label: "General Market Research" },
  { value: "other", label: "Other" },
];

const SOURCE_COLORS: Record<string, string> = {
  customer_review: "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/5",
  interview_notes: "text-neon-pink border-neon-pink/40 bg-neon-pink/5",
  sales_call_transcript: "text-neon-purple border-neon-purple/40 bg-neon-purple/5",
  competitor_copy: "text-orange-400 border-orange-400/40 bg-orange-400/5",
  testimonial: "text-green-400 border-green-400/40 bg-green-400/5",
};

export default function ResearchIntake() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", sourceType: "customer_review", content: "", url: "" });

  const utils = trpc.useUtils();
  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: research = [], isLoading } = trpc.research.list.useQuery({ projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const createMutation = trpc.research.create.useMutation({
    onSuccess: () => {
      utils.research.list.invalidate({ projectId });
      setAddOpen(false);
      setForm({ title: "", sourceType: "customer_review", content: "", url: "" });
      toast.success("Research source added");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.research.delete.useMutation({
    onSuccess: () => { utils.research.list.invalidate({ projectId }); toast.success("Deleted"); },
  });

  const markCompleteMutation = trpc.projects.update.useMutation({
    onSuccess: () => { utils.projects.get.invalidate({ id: projectId }); toast.success("Module marked complete"); },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan transition-colors">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan transition-colors">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Research Intake</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-neon-pink" />
            </div>
            <div>
              <div className="text-xs text-cyber-muted font-display tracking-widest">MODULES 1–2</div>
              <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">RESEARCH INTAKE</h1>
            </div>
          </div>
          <p className="text-cyber-muted text-sm max-w-xl">
            Paste in customer reviews, interviews, forum posts, sales call transcripts, and competitor copy. The more research you add, the more accurate the AI extraction will be.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button className="btn-neon-solid px-4 py-2 rounded flex items-center gap-2 text-xs shrink-0">
              <Plus className="w-4 h-4" /> Add Source
            </button>
          </DialogTrigger>
          <DialogContent className="bg-cyber-dark border border-neon-pink/30 text-cyber-text max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-neon-pink tracking-widest">ADD RESEARCH SOURCE</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">Title *</label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Trustpilot review batch #1"
                  className="bg-cyber-surface border-cyber text-cyber-text text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">Source Type *</label>
                <Select value={form.sourceType} onValueChange={v => setForm(f => ({ ...f, sourceType: v }))}>
                  <SelectTrigger className="bg-cyber-surface border-cyber text-cyber-text text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-dark border-cyber text-cyber-text">
                    {SOURCE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-cyber-text hover:bg-cyber-surface focus:bg-cyber-surface">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">Content *</label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Paste the raw content here..."
                  className="bg-cyber-surface border-cyber text-cyber-text text-sm resize-none"
                  rows={8}
                />
              </div>
              <div>
                <label className="text-xs text-cyber-muted font-display tracking-wide block mb-1">Source URL (optional)</label>
                <Input
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="bg-cyber-surface border-cyber text-cyber-text text-sm"
                />
              </div>
              <button
                onClick={() => createMutation.mutate({ projectId, ...form as any })}
                disabled={!form.title || !form.content || createMutation.isPending}
                className="w-full btn-neon-solid py-2.5 rounded text-xs disabled:opacity-50"
              >
                {createMutation.isPending ? "Adding..." : "Add Source"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Research sources */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-cyber-muted font-display tracking-widest">LOADING...</p>
        </div>
      ) : research.length === 0 ? (
        <div className="hud-card p-12 text-center">
          <BookOpen className="w-10 h-10 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-display text-sm text-cyber-text tracking-wide mb-2">No research sources yet</h3>
          <p className="text-xs text-cyber-muted mb-6 max-w-sm mx-auto">
            Add at least 3–5 research sources for best results. Paste reviews, interviews, forum posts, or competitor copy.
          </p>
          <button onClick={() => setAddOpen(true)} className="btn-neon-solid px-6 py-2.5 rounded text-xs">
            Add First Source
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {research.map((src) => {
            const typeLabel = SOURCE_TYPES.find(t => t.value === src.sourceType)?.label ?? src.sourceType;
            const colorClass = SOURCE_COLORS[src.sourceType] ?? "text-cyber-muted border-cyber bg-cyber-surface";
            return (
              <div key={src.id} className="hud-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 border rounded font-display tracking-wide ${colorClass}`}>
                        {typeLabel}
                      </span>
                      <h3 className="font-display text-sm text-cyber-text tracking-wide truncate">{src.title}</h3>
                    </div>
                    <p className="text-xs text-cyber-muted line-clamp-3 leading-relaxed">{src.content}</p>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-neon-cyan hover:underline mt-1 block truncate">
                        {src.url}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate({ id: src.id })}
                    className="text-cyber-muted hover:text-neon-pink transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {research.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-cyber">
              <span className="text-xs text-cyber-muted">{research.length} source{research.length !== 1 ? "s" : ""} added</span>
              <div className="flex gap-3">
                <button
                  onClick={() => markCompleteMutation.mutate({ id: projectId, researchComplete: true })}
                  disabled={markCompleteMutation.isPending}
                  className="btn-neon-cyan px-4 py-2 rounded text-xs"
                >
                  Mark Complete
                </button>
                <Link href={`/projects/${projectId}/intelligence`}>
                  <a className="btn-neon-solid px-4 py-2 rounded text-xs flex items-center gap-1">
                    Next: Extract Intelligence <ChevronRight className="w-3 h-3" />
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
