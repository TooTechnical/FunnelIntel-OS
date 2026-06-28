import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { stripeRouter } from "./stripeRouter";
import { checkCanGenerate } from "./aiHelpers";
import { buildMarkdown } from "./exportHandlerUtils";

// ─── Admin Guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

// ─── AI Helper (thin wrapper for backward compat) ─────────────────────────────
async function callAI(systemPrompt: string, userPrompt: string) {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });
  const raw = response.choices[0]?.message?.content;
  const content = typeof raw === "string" ? raw : "{}";
  try { return JSON.parse(content); } catch { return {}; }
}

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (!opts.ctx.user) return null;
      const user = await db.getUserById(opts.ctx.user.id);
      return user ?? null;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    subscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const now = new Date();
      const trialActive = user.subscriptionStatus === "trial" && user.trialEndsAt && user.trialEndsAt > now;
      const canGenerate = checkCanGenerate(user);
      return {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        trialEndsAt: user.trialEndsAt,
        canGenerate,
        trialActive,
        trialExpired: user.subscriptionStatus === "trial" && !trialActive,
      };
    }),
  }),

  // ─── Projects ──────────────────────────────────────────────────────────────
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProjectsByUser(ctx.user.id);
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id, ctx.user.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        return project;
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        businessName: z.string().optional(),
        industry: z.string().optional(),
        productService: z.string().optional(),
        targetCustomer: z.string().optional(),
        desiredAction: z.string().optional(),
        mainOffer: z.string().optional(),
        funnelType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProject({ ...input, userId: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        businessName: z.string().optional(),
        industry: z.string().optional(),
        productService: z.string().optional(),
        targetCustomer: z.string().optional(),
        desiredAction: z.string().optional(),
        mainOffer: z.string().optional(),
        funnelType: z.string().optional(),
        status: z.enum(["research", "buyer_journey", "funnel_strategy", "drafting", "review", "ready_to_launch"]).optional(),
        researchComplete: z.boolean().optional(),
        intelligenceComplete: z.boolean().optional(),
        buyerJourneyComplete: z.boolean().optional(),
        awarenessComplete: z.boolean().optional(),
        thresholdComplete: z.boolean().optional(),
        mentalStepsComplete: z.boolean().optional(),
        funnelSkeletonComplete: z.boolean().optional(),
        draftingComplete: z.boolean().optional(),
        selfReviewComplete: z.boolean().optional(),
        competitorReviewComplete: z.boolean().optional(),
        exportComplete: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateProject(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProject(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Research ──────────────────────────────────────────────────────────────
  research: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getResearchByProject(input.projectId, ctx.user.id);
      }),
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1),
        sourceType: z.enum(["customer_review","interview_notes","sales_call_transcript","reddit_comment","youtube_comment","trustpilot_review","google_review","competitor_copy","client_notes","testimonial","survey_answer","general_market_research","other"]),
        content: z.string().min(1),
        url: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createResearchSource({ ...input, userId: ctx.user.id });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteResearchSource(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Intelligence Extraction (Modules 2–4) ────────────────────────────────
  intelligence: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getIntelligenceByProject(input.projectId, ctx.user.id);
      }),
    extract: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const research = await db.getResearchByProject(input.projectId, ctx.user.id);
        if (research.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No research sources found" });

        const combinedResearch = research.map(r => `[${r.sourceType}] ${r.title}:\n${r.content}`).join("\n\n---\n\n");

        const result = await callAI(
          `You are a customer intelligence analyst. Extract structured marketing intelligence from the provided research. 
Return a JSON object with these exact keys:
- current_state: array of strings (how customers describe their situation now)
- dream_state: array of strings (what they want instead)
- roadblocks: array of strings (what they believe is stopping them)
- previous_solutions: array of strings (what they tried before)
- competitor_products: array of strings (products/businesses they compare)
- exact_phrases: array of strings (verbatim customer quotes - mark these clearly)
- pains: array of strings (specific pain points)
- desires: array of strings (specific desires)
- objections: array of strings (buying objections)
- trust_fears: array of strings (trust-related fears)
- buying_triggers: array of strings (what triggers purchase decisions)
- decision_moments: array of strings (key decision moments)
- emotional_language: array of strings (emotional words/phrases used)
- repeated_themes: array of strings (themes that appear multiple times)
- marketing_angles: array of strings (strong angles for marketing)
- awareness_level: one of "unaware" | "problem_aware" | "solution_aware" | "product_aware"
- confidence_score: integer 1-10

Separate exact customer quotes from AI paraphrases. Mark exact quotes with quotation marks.`,
          `Research data:\n\n${combinedResearch}`
        );

        await db.upsertIntelligence(input.projectId, ctx.user.id, {
          currentState: result.current_state,
          dreamState: result.dream_state,
          roadblocks: result.roadblocks,
          previousSolutions: result.previous_solutions,
          competitorProducts: result.competitor_products,
          exactPhrases: result.exact_phrases,
          pains: result.pains,
          desires: result.desires,
          objections: result.objections,
          trustFears: result.trust_fears,
          buyingTriggers: result.buying_triggers,
          decisionMoments: result.decision_moments,
          emotionalLanguage: result.emotional_language,
          repeatedThemes: result.repeated_themes,
          marketingAngles: result.marketing_angles,
          awarenessLevel: result.awareness_level,
          confidenceScore: result.confidence_score,
          rawOutput: JSON.stringify(result),
        });

        await db.updateProject(input.projectId, ctx.user.id, { intelligenceComplete: true });
        return db.getIntelligenceByProject(input.projectId, ctx.user.id);
      }),

    generateMarketResearch: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const intel = await db.getIntelligenceByProject(input.projectId, ctx.user.id);
        if (!intel) throw new TRPCError({ code: "BAD_REQUEST", message: "Run intelligence extraction first" });

        const result = await callAI(
          `You are a market research analyst. Generate a structured market research template.
Return JSON with:
- current_state: { customer_language: string, insight: string, marketing_use: string, confidence: number }
- dream_state: { customer_language: string, insight: string, marketing_use: string, confidence: number }
- roadblocks: { customer_language: string, insight: string, marketing_use: string, confidence: number }
- solutions: { customer_language: string, insight: string, marketing_use: string, confidence: number }
- products_businesses: { customer_language: string, insight: string, marketing_use: string, confidence: number }`,
          `Intelligence data: ${JSON.stringify(intel)}`
        );

        await db.upsertMarketResearch(input.projectId, ctx.user.id, {
          currentState: result.current_state,
          dreamState: result.dream_state,
          roadblocks: result.roadblocks,
          solutions: result.solutions,
          productsBusinesses: result.products_businesses,
        });

        return db.getMarketResearchByProject(input.projectId, ctx.user.id);
      }),

    getMarketResearch: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getMarketResearchByProject(input.projectId, ctx.user.id);
      }),

    generateInterviewBuilder: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const intel = await db.getIntelligenceByProject(input.projectId, ctx.user.id);
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!intel || !project) throw new TRPCError({ code: "BAD_REQUEST", message: "Missing data" });

        const result = await callAI(
          `You are a customer research strategist. Generate an interview builder based on intelligence gaps.
Return JSON with:
- knowledge_gaps: array of strings (what we still don't know)
- interview_types: array of { type: string, description: string, priority: string }
- outreach_messages: array of { type: string, message: string }
- buyer_questions: array of strings (questions for buyers who purchased)
- non_buyer_questions: array of strings (questions for non-buyers)
- follow_up_probes: array of strings (follow-up probe questions)
- notes_template: string (markdown template for interview notes)

Focus on pre-decision language: what triggered action, what they tried first, what they feared, what almost stopped them.`,
          `Project: ${project.name}\nTarget: ${project.targetCustomer}\nIntelligence: ${JSON.stringify(intel)}`
        );

        await db.upsertInterview(input.projectId, ctx.user.id, {
          knowledgeGaps: result.knowledge_gaps,
          interviewTypes: result.interview_types,
          outreachMessages: result.outreach_messages,
          buyerQuestions: result.buyer_questions,
          nonBuyerQuestions: result.non_buyer_questions,
          followUpProbes: result.follow_up_probes,
          notesTemplate: result.notes_template,
        });

        return db.getInterviewByProject(input.projectId, ctx.user.id);
      }),

    getInterview: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getInterviewByProject(input.projectId, ctx.user.id);
      }),
  }),

  // ─── Buyer Journey (Module 5) ─────────────────────────────────────────────
  buyerJourney: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getBuyerJourneyByProject(input.projectId, ctx.user.id);
      }),
    generate: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const [project, intel] = await Promise.all([
          db.getProjectById(input.projectId, ctx.user.id),
          db.getIntelligenceByProject(input.projectId, ctx.user.id),
        ]);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });

        const result = await callAI(
          `You are a buyer journey strategist. Map the complete buyer journey.
Return JSON with:
- stages: array of 8 objects, each with:
  { stage: string, stage_name: string, happened: string, thought: string, felt: string, language: string, marketing_opportunity: string }
  
Stage names: "Before State", "Trigger Moment", "Search / Discovery", "Questions", "Doubts", "Decision Criteria", "Action", "After-Action Experience"`,
          `Project: ${project.name}\nProduct: ${project.productService}\nTarget: ${project.targetCustomer}\nIntelligence: ${JSON.stringify(intel)}`
        );

        await db.upsertBuyerJourney(input.projectId, ctx.user.id, {
          stages: result.stages,
          rawOutput: JSON.stringify(result),
        });
        await db.updateProject(input.projectId, ctx.user.id, { buyerJourneyComplete: true });
        return db.getBuyerJourneyByProject(input.projectId, ctx.user.id);
      }),
  }),

  // ─── Awareness Diagnosis (Module 6) ──────────────────────────────────────
  awareness: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAwarenessByProject(input.projectId, ctx.user.id);
      }),
    diagnose: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        awarenessLevel: z.enum(["unaware", "problem_aware", "solution_aware", "product_aware"]),
        attentionMode: z.enum(["passive", "active"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const funnelMap: Record<string, string> = {
          "unaware_passive": "Disruption Funnel",
          "problem_aware_passive": "Interrupt Funnel",
          "problem_aware_active": "Informational Funnel",
          "solution_aware_passive": "Differentiation Funnel",
          "solution_aware_active": "Search Funnel",
          "product_aware_passive": "Retargeting Funnel",
          "product_aware_active": "Branded Search Funnel",
        };

        const key = `${input.awarenessLevel}_${input.attentionMode}`;
        const recommendedFunnelType = funnelMap[key] ?? "Custom Funnel";

        const project = await db.getProjectById(input.projectId, ctx.user.id);
        const result = await callAI(
          `You are a funnel strategist. Given the awareness level and attention mode, provide detailed recommendations.
Return JSON with:
- explanation: string (why this funnel type fits)
- content_recommendations: array of strings (what kind of content to use)
- first_message_strategy: string (what the first message should do)
- cta_strategy: string (what the CTA should be)`,
          `Awareness: ${input.awarenessLevel}\nAttention: ${input.attentionMode}\nFunnel type: ${recommendedFunnelType}\nProject: ${project?.name}\nProduct: ${project?.productService}`
        );

        await db.upsertAwareness(input.projectId, ctx.user.id, {
          awarenessLevel: input.awarenessLevel,
          attentionMode: input.attentionMode,
          recommendedFunnelType,
          explanation: result.explanation,
          contentRecommendations: result.content_recommendations,
          firstMessageStrategy: result.first_message_strategy,
          ctaStrategy: result.cta_strategy,
        });
        await db.updateProject(input.projectId, ctx.user.id, { awarenessComplete: true });
        return db.getAwarenessByProject(input.projectId, ctx.user.id);
      }),
  }),

  // ─── Threshold Gap (Module 7) ─────────────────────────────────────────────
  threshold: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getThresholdByProject(input.projectId, ctx.user.id);
      }),
    analyze: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        currentDesire: z.number().min(1).max(10),
        requiredDesire: z.number().min(1).max(10),
        currentCertainty: z.number().min(1).max(10),
        requiredCertainty: z.number().min(1).max(10),
        currentTrust: z.number().min(1).max(10),
        requiredTrust: z.number().min(1).max(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const desireGap = input.requiredDesire - input.currentDesire;
        const certaintyGap = input.requiredCertainty - input.currentCertainty;
        const trustGap = input.requiredTrust - input.currentTrust;

        const gaps = { desire: desireGap, certainty: certaintyGap, trust: trustGap };
        const biggestGap = (Object.entries(gaps).sort(([,a],[,b]) => b - a)[0][0]) as "desire" | "certainty" | "trust";

        const project = await db.getProjectById(input.projectId, ctx.user.id);
        const result = await callAI(
          `You are a conversion strategist. Analyze threshold gaps and provide funnel focus recommendations.
Return JSON with:
- funnel_focus: string (what the funnel must primarily focus on)
- recommendations: array of { threshold: string, gap: number, recommendation: string, funnel_elements: array of strings }`,
          `Desire gap: ${desireGap}/10\nCertainty gap: ${certaintyGap}/10\nTrust gap: ${trustGap}/10\nBiggest gap: ${biggestGap}\nProject: ${project?.name}`
        );

        await db.upsertThreshold(input.projectId, ctx.user.id, {
          currentDesire: input.currentDesire,
          requiredDesire: input.requiredDesire,
          currentCertainty: input.currentCertainty,
          requiredCertainty: input.requiredCertainty,
          currentTrust: input.currentTrust,
          requiredTrust: input.requiredTrust,
          biggestGap,
          funnelFocus: result.funnel_focus,
          recommendations: result.recommendations,
        });
        await db.updateProject(input.projectId, ctx.user.id, { thresholdComplete: true });
        return db.getThresholdByProject(input.projectId, ctx.user.id);
      }),
  }),

  // ─── Mental Steps (Module 8) ──────────────────────────────────────────────
  mentalSteps: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getMentalStepsByProject(input.projectId, ctx.user.id);
      }),
    generate: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const [project, intel, threshold, awareness] = await Promise.all([
          db.getProjectById(input.projectId, ctx.user.id),
          db.getIntelligenceByProject(input.projectId, ctx.user.id),
          db.getThresholdByProject(input.projectId, ctx.user.id),
          db.getAwarenessByProject(input.projectId, ctx.user.id),
        ]);

        const result = await callAI(
          `You are a conversion psychology expert. Generate the ordered chain of mental steps a prospect must take before acting.
Return JSON with:
- steps: array of 7-10 objects, each with:
  { order: number, step: string (the mental statement in quotes), threshold: "desire"|"certainty"|"trust"|"attention", trigger: string, funnel_element: string, copy_angle: string }

Example step: { order: 1, step: "Stop scrolling.", threshold: "attention", trigger: "pattern interrupt in headline", funnel_element: "ad hook", copy_angle: "name the exact pain" }`,
          `Project: ${project?.name}\nProduct: ${project?.productService}\nTarget: ${project?.targetCustomer}\nBiggest gap: ${threshold?.biggestGap}\nAwareness: ${awareness?.awarenessLevel}\nIntelligence: ${JSON.stringify(intel)}`
        );

        await db.upsertMentalSteps(input.projectId, ctx.user.id, {
          steps: result.steps,
          rawOutput: JSON.stringify(result),
        });
        await db.updateProject(input.projectId, ctx.user.id, { mentalStepsComplete: true });
        return db.getMentalStepsByProject(input.projectId, ctx.user.id);
      }),
  }),

  // ─── Funnel Skeleton (Module 9) ───────────────────────────────────────────
  funnelSkeleton: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getFunnelSkeletonByProject(input.projectId, ctx.user.id);
      }),
    generate: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const [project, awareness, threshold, mentalStepsData] = await Promise.all([
          db.getProjectById(input.projectId, ctx.user.id),
          db.getAwarenessByProject(input.projectId, ctx.user.id),
          db.getThresholdByProject(input.projectId, ctx.user.id),
          db.getMentalStepsByProject(input.projectId, ctx.user.id),
        ]);

        const result = await callAI(
          `You are a funnel architect. Generate a complete funnel skeleton with 11 landing page sections.
Return JSON with:
- funnel_type: string
- sections: array of 11 objects: { name: string, job: string, content_direction: string, mental_step: string, threshold: string }
  Section names: Hero Headline, Subheadline, Pain Recognition, Failed Attempts, Why This Is Different, Mechanism/Process, Proof/Testimonial, What Happens Next, Offer/CTA, FAQ/Objection Handling, Final CTA
- ad_assets: { social_ad_direction: string, google_ad_direction: string }`,
          `Project: ${project?.name}\nOffer: ${project?.mainOffer}\nFunnel type: ${awareness?.recommendedFunnelType}\nBiggest gap: ${threshold?.biggestGap}\nMental steps: ${JSON.stringify(mentalStepsData?.steps)}`
        );

        await db.upsertFunnelSkeleton(input.projectId, ctx.user.id, {
          funnelType: result.funnel_type,
          sections: result.sections,
          adAssets: result.ad_assets,
          rawOutput: JSON.stringify(result),
        });
        await db.updateProject(input.projectId, ctx.user.id, { funnelSkeletonComplete: true });
        return db.getFunnelSkeletonByProject(input.projectId, ctx.user.id);
      }),
  }),

  // ─── Drafting Studio (Module 10) ──────────────────────────────────────────
  drafting: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getDraftsByProject(input.projectId, ctx.user.id);
      }),
    generate: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        assetType: z.enum(["social_ad","social_ad_visual","google_ad","landing_page","offer_section","cta_buttons","email_sequence","outreach_dm","sales_call_script","faq","follow_up"]),
        elementName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const [project, intel, threshold, mentalStepsData, skeleton] = await Promise.all([
          db.getProjectById(input.projectId, ctx.user.id),
          db.getIntelligenceByProject(input.projectId, ctx.user.id),
          db.getThresholdByProject(input.projectId, ctx.user.id),
          db.getMentalStepsByProject(input.projectId, ctx.user.id),
          db.getFunnelSkeletonByProject(input.projectId, ctx.user.id),
        ]);

        const result = await callAI(
          `You are a conversion copywriter. Generate copy for a specific funnel asset using real customer language.
IMPORTANT: Use exact customer phrases from research. Avoid vague words like "high quality", "get results", "grow your business", "digital solutions", "professional service" unless made specific.
Return JSON with:
- element_name: string
- element_job: string (what this element must do)
- mental_step: string (which mental step it triggers)
- threshold_affected: "desire"|"certainty"|"trust"|"attention"
- primary_copy: string (the main copy)
- variations: array of 3 alternative versions`,
          `Asset type: ${input.assetType}\nProject: ${project?.name}\nOffer: ${project?.mainOffer}\nTarget: ${project?.targetCustomer}\nBiggest gap: ${threshold?.biggestGap}\nExact phrases: ${JSON.stringify((intel as any)?.exactPhrases)}\nMental steps: ${JSON.stringify(mentalStepsData?.steps)}`
        );

        return db.createDraftAsset({
          projectId: input.projectId,
          userId: ctx.user.id,
          assetType: input.assetType,
          elementName: result.element_name,
          elementJob: result.element_job,
          mentalStep: result.mental_step,
          thresholdAffected: result.threshold_affected,
          primaryCopy: result.primary_copy,
          variations: result.variations,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        primaryCopy: z.string().optional(),
        variations: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateDraftAsset(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteDraftAsset(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Self Review (Module 11) ──────────────────────────────────────────────
  selfReview: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getSelfReviewsByProject(input.projectId, ctx.user.id);
      }),
    run: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        content: z.string().min(1),
        draftAssetId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const [project, intel, threshold] = await Promise.all([
          db.getProjectById(input.projectId, ctx.user.id),
          db.getIntelligenceByProject(input.projectId, ctx.user.id),
          db.getThresholdByProject(input.projectId, ctx.user.id),
        ]);

        const result = await callAI(
          `You are a conversion copy reviewer. Run a comprehensive 5-category review.
Return JSON with:
- lizard_brain_score: 1-10 (clarity in first 3 seconds)
- baton_handoff_score: 1-10 (message match ad→landing page→CTA)
- threshold_score: 1-10 (is the biggest gap addressed)
- language_score: 1-10 (real customer language vs generic)
- final_score: 1-10 (grammar, typos, CTA consistency)
- overall_score: 1-10
- readiness_score: 1-100
- issues: array of { category: string, issue: string, severity: "high"|"medium"|"low" }
- suggested_fixes: array of { issue: string, fix: string }
- rewritten_version: string (improved version of the content)`,
          `Content to review:\n${input.content}\n\nProject context:\nTarget: ${project?.targetCustomer}\nBiggest gap: ${threshold?.biggestGap}\nExact phrases: ${JSON.stringify((intel as any)?.exactPhrases)}`
        );

        const review = await db.createSelfReview({
          projectId: input.projectId,
          userId: ctx.user.id,
          draftAssetId: input.draftAssetId,
          reviewContent: input.content,
          lizardBrainScore: result.lizard_brain_score,
          batonHandoffScore: result.baton_handoff_score,
          thresholdScore: result.threshold_score,
          languageScore: result.language_score,
          finalScore: result.final_score,
          overallScore: result.overall_score,
          issues: result.issues,
          suggestedFixes: result.suggested_fixes,
          rewrittenVersion: result.rewritten_version,
          readinessScore: result.readiness_score,
        });
        await db.updateProject(input.projectId, ctx.user.id, { selfReviewComplete: true });
        return review;
      }),
  }),

  // ─── Competitor Review (Module 12) ────────────────────────────────────────
  competitorReview: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getCompetitorReviewByProject(input.projectId, ctx.user.id);
      }),
    save: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        userAd: z.string().optional(),
        competitorAd1: z.string().optional(),
        competitorAd2: z.string().optional(),
        topPlayerAd: z.string().optional(),
        userLandingPage: z.string().optional(),
        competitorLandingPage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { projectId, ...data } = input;
        await db.upsertCompetitorReview(projectId, ctx.user.id, data);
        return { success: true };
      }),
    analyze: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !checkCanGenerate(user)) throw new TRPCError({ code: "FORBIDDEN", message: "Trial expired or no active subscription." });

        const review = await db.getCompetitorReviewByProject(input.projectId, ctx.user.id);
        if (!review) throw new TRPCError({ code: "BAD_REQUEST", message: "No competitor data saved" });

        const result = await callAI(
          `You are a competitive analysis expert. Analyze the provided ads and landing pages.
Return JSON with:
- review_questions: array of strings (questions for insider review)
- winning_variation: string (which variation would win and why)
- why_it_won: string
- threshold_issue: "desire"|"certainty"|"trust"
- revision_recommendation: string`,
          `User ad: ${review.userAd}\nCompetitor 1: ${review.competitorAd1}\nCompetitor 2: ${review.competitorAd2}\nTop player: ${review.topPlayerAd}`
        );

        await db.upsertCompetitorReview(input.projectId, ctx.user.id, {
          reviewQuestions: result.review_questions,
          winningVariation: result.winning_variation,
          whyItWon: result.why_it_won,
          thresholdIssue: result.threshold_issue,
          revisionRecommendation: result.revision_recommendation,
        });
        await db.updateProject(input.projectId, ctx.user.id, { competitorReviewComplete: true });
        return db.getCompetitorReviewByProject(input.projectId, ctx.user.id);
      }),
    saveFeedback: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        feedback: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertCompetitorReview(input.projectId, ctx.user.id, {
          insiderFeedback: input.feedback,
        });
        return { success: true };
      }),
  }),

  // ─── Export (Module 13) ───────────────────────────────────────────────────
  export: router({
    getProjectData: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getFullProjectData(input.projectId, ctx.user.id);
      }),
    generateMarkdown: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const data = await db.getFullProjectData(input.projectId, ctx.user.id);
        if (!data?.project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        const markdown = buildMarkdown(data);
        await db.createExportReport({
          projectId: input.projectId,
          userId: ctx.user.id,
          markdownContent: markdown,
        });
        await db.updateProject(input.projectId, ctx.user.id, { exportComplete: true, status: "ready_to_launch" });
        return { markdown };
      }),
    generatePdf: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // PDF generation is handled by the Express route /api/export/:projectId?format=pdf
        // This tRPC procedure triggers the export and returns the download URL.
        const data = await db.getFullProjectData(input.projectId, ctx.user.id);
        if (!data?.project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        const markdown = buildMarkdown(data);
        await db.createExportReport({
          projectId: input.projectId,
          userId: ctx.user.id,
          markdownContent: markdown,
        });
        await db.updateProject(input.projectId, ctx.user.id, { exportComplete: true, status: "ready_to_launch" });
        return { downloadUrl: `/api/export/${input.projectId}?format=pdf` };
      }),
    getLatestReport: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getLatestExportReport(input.projectId, ctx.user.id);
      }),
    markComplete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateProject(input.projectId, ctx.user.id, { exportComplete: true, status: "ready_to_launch" });
        return { success: true };
      }),
  }),

  // ─── Stripe ───────────────────────────────────────────────────────────────
  stripe: stripeRouter,

  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => {
      const [userStats, projectStats] = await Promise.all([
        db.getUserStats(),
        db.getProjectStats(),
      ]);
      return { users: userStats, projects: projectStats };
    }),
    users: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.getAllUsers(input.limit, input.offset);
      }),
  }),
});

export type AppRouter = typeof appRouter;
