import type { Request, Response } from "express";
import PDFDocument from "pdfkit";
import * as db from "./db";

function getUser(req: Request): { id: number } | null {
  return (req as any).user ?? null;
}

export async function handleExport(req: Request, res: Response) {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const projectId = parseInt(req.params.projectId);
  const format = (req.query.format as string) ?? "pdf";

  const data = await db.getFullProjectData(projectId, user.id);
  if (!data?.project) { res.status(404).json({ error: "Project not found" }); return; }

  if (format === "markdown") {
    const md = buildMarkdown(data);
    res.setHeader("Content-Type", "text/markdown");
    res.setHeader("Content-Disposition", `attachment; filename="funnelintel-${projectId}.md"`);
    res.send(md);
    return;
  }

  // PDF
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="funnelintel-${projectId}.pdf"`);
  doc.pipe(res);

  const PINK = "#FF2D78";
  const CYAN = "#00F5FF";
  const DARK = "#0A0A0F";
  const LIGHT = "#E8E8F0";
  const MUTED = "#8888AA";

  const { project, research, intelligence, buyerJourney, awareness, threshold, mental, skeleton, drafts, reviews, competitor } = data;

  // Cover
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK);
  doc.fill(PINK).font("Helvetica-Bold").fontSize(28).text("FUNNELINTEL OS", 50, 80);
  doc.fill(CYAN).font("Helvetica").fontSize(14).text("Strategy Report", 50, 120);
  doc.fill(LIGHT).font("Helvetica-Bold").fontSize(20).text(project?.name ?? "Untitled Project", 50, 160);
  if (project?.targetCustomer) doc.fill(MUTED).font("Helvetica").fontSize(11).text(`Target: ${project.targetCustomer}`, 50, 195);
  doc.fill(MUTED).fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 215);

  const section = (title: string, color = PINK) => {
    doc.addPage();
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK);
    doc.fill(color).font("Helvetica-Bold").fontSize(16).text(title, 50, 50);
    doc.fill(MUTED).font("Helvetica").fontSize(9).text("─".repeat(80), 50, 72);
    doc.y = 90;
  };

  const field = (label: string, value: string | null | undefined) => {
    if (!value) return;
    doc.fill(CYAN).font("Helvetica-Bold").fontSize(9).text(label.toUpperCase(), { continued: false });
    doc.fill(LIGHT).font("Helvetica").fontSize(10).text(value, { width: 495 });
    doc.moveDown(0.5);
  };

  const listItems = (items: any[], label: string) => {
    if (!items?.length) return;
    doc.fill(CYAN).font("Helvetica-Bold").fontSize(9).text(label.toUpperCase());
    items.forEach((item: any) => {
      const text = typeof item === "string" ? item : JSON.stringify(item);
      doc.fill(LIGHT).font("Helvetica").fontSize(10).text(`• ${text}`, { width: 480, indent: 10 });
    });
    doc.moveDown(0.5);
  };

  // Research sources
  if (research?.length) {
    section("CUSTOMER RESEARCH (MODULES 1–4)", PINK);
    research.forEach((r: any) => {
      doc.fill(CYAN).font("Helvetica-Bold").fontSize(9).text(`[${r.sourceType}] ${r.title ?? ""}`);
      if (r.content) doc.fill(LIGHT).font("Helvetica").fontSize(9).text(r.content.substring(0, 500), { width: 495 });
      doc.moveDown(0.4);
    });
  }

  // Intelligence
  if (intelligence) {
    section("EXTRACTED INTELLIGENCE", CYAN);
    const i = intelligence as any;
    field("Current State", typeof i.currentState === "string" ? i.currentState : JSON.stringify(i.currentState));
    field("Dream State", typeof i.dreamState === "string" ? i.dreamState : JSON.stringify(i.dreamState));
    listItems(Array.isArray(i.exactPhrases) ? i.exactPhrases : [], "Exact Customer Phrases");
    listItems(Array.isArray(i.objections) ? i.objections : [], "Objections");
    field("Awareness Level", i.awarenessLevel);
  }

  // Buyer Journey
  if (buyerJourney) {
    section("BUYER JOURNEY MAP (MODULE 5)", PINK);
    const stages = (buyerJourney as any).stages as any[];
    stages?.forEach((stage: any) => {
      doc.fill(PINK).font("Helvetica-Bold").fontSize(10).text(stage.stage ?? stage.name ?? "Stage");
      if (stage.description) doc.fill(LIGHT).font("Helvetica").fontSize(9).text(stage.description, { width: 495 });
      doc.moveDown(0.3);
    });
  }

  // Awareness
  if (awareness) {
    section("AWARENESS DIAGNOSIS (MODULE 6)", CYAN);
    field("Awareness Level", awareness.awarenessLevel);
    field("Attention Mode", awareness.attentionMode);
    field("Diagnosis", (awareness as any).diagnosis);
    field("Entry Point", (awareness as any).entryPointRecommendation);
  }

  // Threshold
  if (threshold) {
    section("THRESHOLD GAP ANALYSIS (MODULE 7)", PINK);
    field("Biggest Gap", threshold.biggestGap);
    const gaps = (threshold as any).gaps;
    if (gaps) {
      field("Desire Gap", `Score: ${gaps.desire?.score}/10 — ${gaps.desire?.analysis}`);
      field("Certainty Gap", `Score: ${gaps.certainty?.score}/10 — ${gaps.certainty?.analysis}`);
      field("Trust Gap", `Score: ${gaps.trust?.score}/10 — ${gaps.trust?.analysis}`);
    }
  }

  // Mental Steps
  if (mental) {
    section("MENTAL STEPS + TRIGGERS (MODULE 8)", CYAN);
    const stepsData = (mental as any).steps as any;
    const steps = Array.isArray(stepsData) ? stepsData : (stepsData?.steps ?? []);
    const triggers = stepsData?.triggers ?? [];
    steps.forEach((step: any, i: number) => {
      doc.fill(CYAN).font("Helvetica-Bold").fontSize(10).text(`${i + 1}. ${step.step}`);
      if (step.description) doc.fill(LIGHT).font("Helvetica").fontSize(9).text(step.description, { width: 495 });
      doc.moveDown(0.3);
    });
    if (triggers.length) {
      doc.moveDown(0.5);
      doc.fill(PINK).font("Helvetica-Bold").fontSize(11).text("PSYCHOLOGICAL TRIGGERS");
      triggers.forEach((t: any) => {
        doc.fill(PINK).font("Helvetica-Bold").fontSize(9).text(t.trigger);
        if (t.how_to_use) doc.fill(MUTED).font("Helvetica").fontSize(9).text(t.how_to_use, { width: 495 });
        doc.moveDown(0.3);
      });
    }
  }

  // Funnel Skeleton
  if (skeleton) {
    section("FUNNEL SKELETON (MODULE 9)", PINK);
    const sections = (skeleton as any).sections as any[];
    sections?.forEach((s: any, i: number) => {
      doc.fill(PINK).font("Helvetica-Bold").fontSize(10).text(`${i + 1}. ${s.section_name ?? s.name}`);
      if (s.purpose) doc.fill(MUTED).font("Helvetica").fontSize(9).text(`Purpose: ${s.purpose}`, { width: 495 });
      if (s.copy_direction) doc.fill(LIGHT).font("Helvetica").fontSize(9).text(`Copy: ${s.copy_direction}`, { width: 495 });
      doc.moveDown(0.4);
    });
  }

  // Drafts
  if (drafts?.length) {
    section("COPY DRAFTS (MODULE 10)", CYAN);
    drafts.forEach((draft: any) => {
      doc.fill(CYAN).font("Helvetica-Bold").fontSize(10).text(`[${draft.assetType}] ${draft.elementName ?? ""}`);
      if (draft.primaryCopy) doc.fill(LIGHT).font("Helvetica").fontSize(10).text(draft.primaryCopy, { width: 495 });
      doc.moveDown(0.5);
    });
  }

  // Self Review
  if (reviews?.length) {
    section("SELF-REVIEW FINDINGS (MODULE 11)", PINK);
    const review = reviews[0] as any;
    field("Overall Score", `${review.overallScore}/10`);
    if (review.overallAssessment) field("Overall Assessment", review.overallAssessment);
  }

  // Competitor
  if (competitor?.winningVariation) {
    section("COMPETITOR ANALYSIS (MODULE 12)", CYAN);
    field("Winning Variation", competitor.winningVariation);
    field("Why It Won", competitor.whyItWon);
    field("Threshold Issue", competitor.thresholdIssue);
    field("Revision Recommendation", competitor.revisionRecommendation);
  }

  doc.end();
}

function buildMarkdown(data: Awaited<ReturnType<typeof db.getFullProjectData>>): string {
  if (!data) return "# No data";
  const { project, research, intelligence, buyerJourney, threshold, mental, drafts, reviews, competitor } = data;
  const lines: string[] = [];

  lines.push(`# FunnelIntel OS — Strategy Report`);
  lines.push(`## ${project?.name ?? "Untitled"}`);
  lines.push(`**Target:** ${project?.targetCustomer ?? "—"}`);
  lines.push(`**Generated:** ${new Date().toLocaleDateString()}`);
  lines.push("");

  if (research?.length) {
    lines.push("## Customer Research (Modules 1–4)");
    research.forEach((r: any) => {
      lines.push(`### [${r.sourceType}] ${r.title ?? ""}`);
      if (r.content) lines.push(r.content);
      lines.push("");
    });
  }

  if (intelligence) {
    lines.push("## Extracted Intelligence");
    const i = intelligence as any;
    if (i.currentState) lines.push(`**Current State:** ${typeof i.currentState === "string" ? i.currentState : JSON.stringify(i.currentState)}`);
    if (i.dreamState) lines.push(`**Dream State:** ${typeof i.dreamState === "string" ? i.dreamState : JSON.stringify(i.dreamState)}`);
    if (Array.isArray(i.exactPhrases) && i.exactPhrases.length) {
      lines.push("**Exact Phrases:**");
      i.exactPhrases.forEach((p: string) => lines.push(`- ${p}`));
    }
    lines.push("");
  }

  if (threshold) {
    lines.push("## Threshold Gap Analysis (Module 7)");
    lines.push(`**Biggest Gap:** ${threshold.biggestGap}`);
    lines.push("");
  }

  if (mental) {
    lines.push("## Mental Steps + Triggers (Module 8)");
    const stepsData = (mental as any).steps as any;
    const steps = Array.isArray(stepsData) ? stepsData : (stepsData?.steps ?? []);
    steps.forEach((s: any, i: number) => lines.push(`${i + 1}. **${s.step}** — ${s.description ?? ""}`));
    lines.push("");
  }

  if (drafts?.length) {
    lines.push("## Copy Drafts (Module 10)");
    drafts.forEach((d: any) => {
      lines.push(`### [${d.assetType}] ${d.elementName ?? ""}`);
      if (d.primaryCopy) lines.push(d.primaryCopy);
      lines.push("");
    });
  }

  if (reviews?.length) {
    lines.push("## Self-Review Findings (Module 11)");
    const r = reviews[0] as any;
    lines.push(`**Overall Score:** ${r.overallScore}/10`);
    if (r.overallAssessment) lines.push(r.overallAssessment);
    lines.push("");
  }

  if (competitor?.winningVariation) {
    lines.push("## Competitor Analysis (Module 12)");
    lines.push(`**Winning Variation:** ${competitor.winningVariation}`);
    if (competitor.revisionRecommendation) lines.push(`**Recommendation:** ${competitor.revisionRecommendation}`);
    lines.push("");
  }

  return lines.join("\n");
}
