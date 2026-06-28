import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, Download, FileText } from "lucide-react";
import { Link, useParams } from "wouter";

export default function ExportReport() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: subStatus } = trpc.auth.subscriptionStatus.useQuery();

  const { data: projectData, isLoading: loadingData } = trpc.export.getProjectData.useQuery({ projectId });

  const markCompleteMutation = trpc.export.markComplete.useMutation({
    onSuccess: () => { utils.projects.get.invalidate({ id: projectId }); toast.success("Project marked complete!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleDownload = async (format: "pdf" | "markdown") => {
    if (!projectData) return;
    const res = await fetch(`/api/export/${projectId}?format=${format}`);
    if (!res.ok) { toast.error("Export failed"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnelintel-${projectId}.${format === "pdf" ? "pdf" : "md"}`;
    a.click();
    URL.revokeObjectURL(url);
    markCompleteMutation.mutate({ projectId });
  };

  const canGenerate = subStatus?.canGenerate ?? false;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-cyber-muted mb-6">
        <Link href="/dashboard" className="hover:text-neon-cyan">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/projects/${projectId}`} className="hover:text-neon-cyan">{project?.name ?? "Project"}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neon-pink">Export Report</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-neon-pink" />
        </div>
        <div>
          <div className="text-xs text-cyber-muted font-display tracking-widest">MODULE 13</div>
          <h1 className="font-display font-bold text-xl text-neon-pink tracking-widest">EXPORT STRATEGY REPORT</h1>
        </div>
      </div>
      <p className="text-cyber-muted text-sm mb-8 max-w-xl">
        Generate a complete, downloadable strategy report from all your project data — intelligence, buyer journey, funnel skeleton, copy drafts, and review findings.
      </p>

      {!canGenerate && (
        <div className="hud-card border-neon-pink/40 bg-neon-pink/5 p-4 mb-6 text-sm text-neon-pink font-display tracking-wide">
          Trial expired — <Link href="/pricing" className="underline">upgrade to continue</Link>
        </div>
      )}

      <div className="hud-card p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full border-2 border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center mx-auto">
          <Download className="w-8 h-8 text-neon-pink" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-cyber-text tracking-wide mb-2">
            {project?.name ?? "Project"} — Strategy Report
          </h3>
          <p className="text-sm text-cyber-muted leading-relaxed max-w-sm mx-auto">
            Your report will include all extracted intelligence, buyer journey map, awareness diagnosis, threshold analysis, mental steps, funnel skeleton, copy drafts, and review findings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => handleDownload("pdf")}
            disabled={loadingData || !canGenerate}
            className="btn-neon-solid px-8 py-3 rounded text-xs flex items-center gap-2 justify-center disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {loadingData ? "Loading..." : "Download PDF Report"}
          </button>
          <button
            onClick={() => handleDownload("markdown")}
            disabled={loadingData || !canGenerate}
            className="btn-neon-cyan px-8 py-3 rounded text-xs flex items-center gap-2 justify-center disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {loadingData ? "Loading..." : "Download Markdown"}
          </button>
        </div>

        {project?.exportComplete && (
          <div className="text-xs text-green-400 font-display tracking-wide">
            ✓ Report previously generated — you can regenerate at any time
          </div>
        )}
      </div>

      <div className="mt-8 hud-card p-5">
        <h4 className="font-display text-xs tracking-widest uppercase text-neon-cyan mb-4">Report Contents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Executive Summary",
            "Customer Intelligence (Modules 1–4)",
            "Buyer Journey Map (Module 5)",
            "Awareness Diagnosis (Module 6)",
            "Threshold Gap Analysis (Module 7)",
            "Mental Steps + Triggers (Module 8)",
            "Funnel Skeleton (Module 9)",
            "Copy Drafts (Module 10)",
            "Self-Review Findings (Module 11)",
            "Competitor Analysis (Module 12)",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-cyber-muted">
              <span className="text-neon-cyan">▸</span>{item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-cyber">
        <Link href={`/projects/${projectId}`}>
          <a className="btn-neon-cyan px-5 py-2.5 rounded text-xs flex items-center gap-2">
            ← Back to Project
          </a>
        </Link>
        <Link href="/dashboard">
          <a className="btn-neon-solid px-5 py-2.5 rounded text-xs flex items-center gap-2">
            Dashboard <ChevronRight className="w-3 h-3" />
          </a>
        </Link>
      </div>
    </div>
  );
}
