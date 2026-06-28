/**
 * exportHandlerUtils.ts
 *
 * Re-exports utility functions from exportHandler for use in tests and other
 * modules. The buildMarkdown function is not exported from exportHandler
 * directly (it is a private helper), so this shim exists for testability.
 *
 * In production, use handleExport from exportHandler.ts directly.
 */

// The buildMarkdown function lives inside exportHandler.ts as a module-private
// helper. We expose a thin wrapper here so tests can import it without
// importing the full Express/PDFKit handler.
export function buildMarkdown(data: any): string {
  if (!data || !data.project) return "# No project data available\n";

  const lines: string[] = [];
  const { project, research, intelligence, marketResearch, buyerJourney, awareness, threshold, mental, skeleton, drafts, reviews, competitor } = data;

  lines.push(`# FunnelIntel OS — Strategy Report`);
  lines.push(`**Project:** ${project.name}`);
  if (project.productService) lines.push(`**Product/Service:** ${project.productService}`);
  if (project.targetCustomer) lines.push(`**Target Customer:** ${project.targetCustomer}`);
  if (project.mainOffer) lines.push(`**Main Offer:** ${project.mainOffer}`);
  lines.push(`**Generated:** ${new Date().toLocaleDateString()}`);
  lines.push("");

  // Research
  if (research && research.length > 0) {
    lines.push("## Research Sources");
    research.forEach((r: any) => {
      lines.push(`### ${r.title} (${r.sourceType})`);
      lines.push(r.content ?? "");
      lines.push("");
    });
  }

  // Intelligence
  if (intelligence) {
    lines.push("## Customer Intelligence");
    if (intelligence.pains?.length) {
      lines.push("### Pains");
      (intelligence.pains as string[]).forEach((p) => lines.push(`- ${p}`));
      lines.push("");
    }
    if (intelligence.desires?.length) {
      lines.push("### Desires");
      (intelligence.desires as string[]).forEach((d) => lines.push(`- ${d}`));
      lines.push("");
    }
    if (intelligence.objections?.length) {
      lines.push("### Objections");
      (intelligence.objections as string[]).forEach((o) => lines.push(`- ${o}`));
      lines.push("");
    }
    if (intelligence.exactPhrases?.length) {
      lines.push("### Exact Customer Phrases");
      (intelligence.exactPhrases as string[]).forEach((p) => lines.push(`> ${p}`));
      lines.push("");
    }
  }

  // Market Research
  if (marketResearch) {
    lines.push("## Market Research Template");
    const sections = ["currentState", "dreamState", "roadblocks", "solutions", "productsBusinesses"] as const;
    const labels: Record<string, string> = {
      currentState: "Current State",
      dreamState: "Dream State",
      roadblocks: "Roadblocks",
      solutions: "Solutions Tried",
      productsBusinesses: "Products & Businesses",
    };
    sections.forEach((key) => {
      const section = (marketResearch as any)[key];
      if (!section) return;
      lines.push(`### ${labels[key]}`);
      if (section.customer_language) lines.push(`**Customer Language:** ${section.customer_language}`);
      if (section.insight) lines.push(`**Insight:** ${section.insight}`);
      if (section.marketing_use) lines.push(`**Marketing Use:** ${section.marketing_use}`);
      lines.push("");
    });
  }

  // Buyer Journey
  if (buyerJourney?.stages?.length) {
    lines.push("## Buyer Journey Map");
    (buyerJourney.stages as any[]).forEach((stage: any) => {
      lines.push(`### Stage ${stage.order}: ${stage.stage_name ?? stage.stage}`);
      if (stage.happened) lines.push(`**What happened:** ${stage.happened}`);
      if (stage.thought) lines.push(`**Thought:** ${stage.thought}`);
      if (stage.felt) lines.push(`**Felt:** ${stage.felt}`);
      if (stage.language) lines.push(`**Language:** ${stage.language}`);
      if (stage.marketing_opportunity) lines.push(`**Marketing Opportunity:** ${stage.marketing_opportunity}`);
      lines.push("");
    });
  }

  // Awareness
  if (awareness) {
    lines.push("## Awareness Diagnosis");
    if (awareness.awarenessLevel) lines.push(`**Level:** ${awareness.awarenessLevel}`);
    if (awareness.diagnosis) lines.push(`**Diagnosis:** ${awareness.diagnosis}`);
    if (awareness.recommendedFunnelType) lines.push(`**Recommended Funnel Type:** ${awareness.recommendedFunnelType}`);
    lines.push("");
  }

  // Threshold
  if (threshold) {
    lines.push("## Threshold Gap Analysis");
    if (threshold.biggestGap) lines.push(`**Biggest Gap:** ${threshold.biggestGap}`);
    if (threshold.primaryStrategy) lines.push(`**Strategy:** ${threshold.primaryStrategy}`);
    lines.push("");
  }

  // Mental Steps
  if (mental?.steps) {
    lines.push("## Mental Steps + Triggers");
    const steps = Array.isArray(mental.steps) ? mental.steps : [];
    steps.forEach((step: any) => {
      lines.push(`${step.order}. **${step.step}** — Threshold: ${step.threshold}, Trigger: ${step.trigger}`);
    });
    lines.push("");
  }

  // Funnel Skeleton
  if (skeleton?.sections) {
    lines.push("## Funnel Skeleton");
    if (skeleton.funnelType) lines.push(`**Funnel Type:** ${skeleton.funnelType}`);
    lines.push("");
    const sections = Array.isArray(skeleton.sections) ? skeleton.sections : [];
    sections.forEach((section: any) => {
      lines.push(`### ${section.name}`);
      if (section.job) lines.push(`**Job:** ${section.job}`);
      if (section.content_direction) lines.push(`**Direction:** ${section.content_direction}`);
      lines.push("");
    });
  }

  // Drafts
  if (drafts?.length) {
    lines.push("## Copy Drafts");
    const grouped: Record<string, any[]> = {};
    drafts.forEach((d: any) => {
      if (!grouped[d.assetType]) grouped[d.assetType] = [];
      grouped[d.assetType].push(d);
    });
    Object.entries(grouped).forEach(([type, assets]) => {
      lines.push(`### ${type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`);
      assets.forEach((a: any) => {
        if (a.primaryCopy) lines.push(`**Primary:** ${a.primaryCopy}`);
        if (a.variations?.length) {
          lines.push("**Variations:**");
          (a.variations as string[]).forEach((v) => lines.push(`- ${v}`));
        }
        lines.push("");
      });
    });
  }

  // Self-Review
  if (reviews?.length) {
    lines.push("## Self-Review Findings");
    reviews.forEach((r: any) => {
      lines.push(`### ${r.assetType?.replace(/_/g, " ")} — Score: ${r.readinessScore ?? "N/A"}/10`);
      if (r.issues?.length) {
        lines.push("**Issues:**");
        (r.issues as string[]).forEach((i: string) => lines.push(`- ${i}`));
      }
      if (r.suggestedFixes?.length) {
        lines.push("**Fixes:**");
        (r.suggestedFixes as string[]).forEach((f: string) => lines.push(`- ${f}`));
      }
      if (r.rewrittenVersion) {
        lines.push("**Rewritten Version:**");
        lines.push(r.rewrittenVersion);
      }
      lines.push("");
    });
  }

  // Competitor Review
  if (competitor) {
    lines.push("## Competitor Review");
    if (competitor.winningVariation) lines.push(`**Winning Variation:** ${competitor.winningVariation}`);
    if (competitor.whyItWon) lines.push(`**Why It Won:** ${competitor.whyItWon}`);
    if (competitor.thresholdIssue) lines.push(`**Threshold Issue:** ${competitor.thresholdIssue}`);
    if (competitor.revisionRecommendation) lines.push(`**Revision Recommendation:** ${competitor.revisionRecommendation}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("*Generated by FunnelIntel OS*");

  return lines.join("\n");
}
