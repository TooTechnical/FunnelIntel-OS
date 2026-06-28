/**
 * aiHelpers.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared AI utilities for FunnelIntel OS backend.
 *
 * Exports:
 *   checkCanGenerate(user)   – subscription / trial guard
 *   safeJsonLLM(opts)        – LLM call → JSON parse → Zod validate → retry
 *   AI output Zod schemas    – one per module
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { invokeLLM } from "./_core/llm";

// ─── Subscription / Trial Guard ───────────────────────────────────────────────

export function checkCanGenerate(user: {
  subscriptionStatus: string;
  trialEndsAt: Date | null | undefined;
}): boolean {
  const now = new Date();
  if (user.subscriptionStatus === "active") return true;
  if (
    user.subscriptionStatus === "trial" &&
    user.trialEndsAt &&
    user.trialEndsAt > now
  )
    return true;
  return false;
}

export function assertCanGenerate(user: {
  subscriptionStatus: string;
  trialEndsAt: Date | null | undefined;
}): void {
  if (!checkCanGenerate(user)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Trial expired or no active subscription.",
    });
  }
}

// ─── safeJsonLLM ─────────────────────────────────────────────────────────────

interface SafeJsonLLMOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  fallback?: T;
}

export async function safeJsonLLM<T>({
  systemPrompt,
  userPrompt,
  schema,
  fallback,
}: SafeJsonLLMOptions<T>): Promise<T> {
  async function callOnce(extraInstruction = ""): Promise<unknown> {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: extraInstruction
            ? `${systemPrompt}\n\n${extraInstruction}`
            : systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = response.choices[0]?.message?.content;
    const content = typeof raw === "string" ? raw : "{}";
    return JSON.parse(content);
  }

  // First attempt
  let parsed: unknown;
  try {
    parsed = await callOnce();
  } catch {
    // JSON parse failed — retry with explicit instruction
    try {
      parsed = await callOnce("Return valid JSON only. No markdown, no prose.");
    } catch {
      if (fallback !== undefined) return fallback;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "AI returned invalid JSON after retry.",
      });
    }
  }

  // Zod validation
  const result = schema.safeParse(parsed);
  if (result.success) return result.data;

  // Retry with stricter instruction
  try {
    const retried = await callOnce(
      "Return valid JSON only. No markdown, no prose. Match the exact schema requested."
    );
    const retryResult = schema.safeParse(retried);
    if (retryResult.success) return retryResult.data;
  } catch {
    // fall through
  }

  if (fallback !== undefined) return fallback;
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "AI response did not match expected schema after retry.",
  });
}

// ─── Module Output Schemas ────────────────────────────────────────────────────

// Module 2 – Intelligence Extraction
export const IntelligenceSchema = z.object({
  current_state: z.array(z.string()).default([]),
  dream_state: z.array(z.string()).default([]),
  roadblocks: z.array(z.string()).default([]),
  previous_solutions: z.array(z.string()).default([]),
  competitor_products: z.array(z.string()).default([]),
  exact_phrases: z.array(z.string()).default([]),
  pains: z.array(z.string()).default([]),
  desires: z.array(z.string()).default([]),
  objections: z.array(z.string()).default([]),
  trust_fears: z.array(z.string()).default([]),
  buying_triggers: z.array(z.string()).default([]),
  decision_moments: z.array(z.string()).default([]),
  emotional_language: z.array(z.string()).default([]),
  repeated_themes: z.array(z.string()).default([]),
  marketing_angles: z.array(z.string()).default([]),
  awareness_level: z
    .enum(["unaware", "problem_aware", "solution_aware", "product_aware"])
    .default("problem_aware"),
  confidence_score: z.number().int().min(1).max(10).default(5),
});
export type IntelligenceOutput = z.infer<typeof IntelligenceSchema>;

// Module 3 – Market Research Template
export const MarketResearchSchema = z.object({
  current_state: z
    .object({
      customer_language: z.string().optional(),
      insight: z.string().optional(),
      marketing_use: z.string().optional(),
    })
    .default({}),
  dream_state: z
    .object({
      customer_language: z.string().optional(),
      insight: z.string().optional(),
      marketing_use: z.string().optional(),
    })
    .default({}),
  roadblocks: z
    .object({
      customer_language: z.string().optional(),
      insight: z.string().optional(),
      marketing_use: z.string().optional(),
    })
    .default({}),
  solutions: z
    .object({
      customer_language: z.string().optional(),
      insight: z.string().optional(),
      marketing_use: z.string().optional(),
    })
    .default({}),
  products_businesses: z
    .object({
      customer_language: z.string().optional(),
      insight: z.string().optional(),
      marketing_use: z.string().optional(),
    })
    .default({}),
});
export type MarketResearchOutput = z.infer<typeof MarketResearchSchema>;

// Module 4 – Interview Builder
export const InterviewBuilderSchema = z.object({
  knowledge_gaps: z.array(z.string()).default([]),
  interview_types: z.array(z.string()).default([]),
  outreach_messages: z.array(z.string()).default([]),
  buyer_questions: z.array(z.string()).default([]),
  non_buyer_questions: z.array(z.string()).default([]),
  follow_up_probes: z.array(z.string()).default([]),
  notes_template: z.string().default(""),
});
export type InterviewBuilderOutput = z.infer<typeof InterviewBuilderSchema>;

// Module 5 – Buyer Journey
export const BuyerJourneyStageSchema = z.object({
  stage: z.number().int().optional(),
  stage_name: z.string(),
  happened: z.string().default(""),
  thought: z.string().default(""),
  felt: z.string().default(""),
  language: z.string().default(""),
  marketing_opportunity: z.string().default(""),
});
export const BuyerJourneySchema = z.object({
  stages: z.array(BuyerJourneyStageSchema).default([]),
});
export type BuyerJourneyOutput = z.infer<typeof BuyerJourneySchema>;

// Module 6 – Awareness Diagnosis
export const AwarenessSchema = z.object({
  awareness_level: z
    .enum(["unaware", "problem_aware", "solution_aware", "product_aware"])
    .default("problem_aware"),
  explanation: z.string().default(""),
  content_recommendations: z.array(z.string()).default([]),
  first_message_strategy: z.string().default(""),
  cta_strategy: z.string().default(""),
  recommended_funnel_type: z.string().default(""),
  primary_strategy: z.string().default(""),
  diagnosis: z.string().default(""),
});
export type AwarenessOutput = z.infer<typeof AwarenessSchema>;

// Module 7 – Threshold Gap Analysis
export const ThresholdSchema = z.object({
  biggest_gap: z.enum(["desire", "certainty", "trust"]).default("desire"),
  funnel_focus: z.string().default(""),
  recommendations: z.array(z.string()).default([]),
  primary_strategy: z.string().default(""),
});
export type ThresholdOutput = z.infer<typeof ThresholdSchema>;

// Module 8 – Mental Steps + Triggers
export const MentalStepItemSchema = z.object({
  order: z.number().int(),
  step: z.string(),
  threshold: z.enum(["desire", "certainty", "trust"]).default("desire"),
  trigger: z.string().default(""),
  funnel_element: z.string().default(""),
  copy_angle: z.string().default(""),
});
export const MentalStepsSchema = z.object({
  steps: z.array(MentalStepItemSchema).default([]),
});
export type MentalStepsOutput = z.infer<typeof MentalStepsSchema>;

// Module 9 – Funnel Skeleton
export const FunnelSkeletonSchema = z.object({
  funnel_type: z.string().default(""),
  sections: z
    .array(
      z.object({
        name: z.string(),
        job: z.string().default(""),
        content_direction: z.string().default(""),
        mental_step: z.string().default(""),
      })
    )
    .default([]),
  ad_assets: z.array(z.string()).default([]),
  offer: z.string().default(""),
  cta: z.string().default(""),
  follow_up: z.string().default(""),
});
export type FunnelSkeletonOutput = z.infer<typeof FunnelSkeletonSchema>;

// Module 10 – Drafting Studio
export const DraftAssetItemSchema = z.object({
  asset_type: z.string(),
  element_name: z.string().default(""),
  element_job: z.string().default(""),
  mental_step: z.string().default(""),
  threshold_affected: z
    .enum(["desire", "certainty", "trust", "attention"])
    .default("desire"),
  primary_copy: z.string().default(""),
  variations: z.array(z.string()).default([]),
});
export const DraftingSchema = z.object({
  assets: z.array(DraftAssetItemSchema).default([]),
});
export type DraftingOutput = z.infer<typeof DraftingSchema>;

// Module 11 – Self-Review Checker
export const SelfReviewSchema = z.object({
  lizard_brain_score: z.number().int().min(0).max(10).default(5),
  baton_handoff_score: z.number().int().min(0).max(10).default(5),
  threshold_score: z.number().int().min(0).max(10).default(5),
  language_score: z.number().int().min(0).max(10).default(5),
  final_score: z.number().int().min(0).max(10).default(5),
  overall_score: z.number().int().min(0).max(10).default(5),
  issues: z.array(z.string()).default([]),
  suggested_fixes: z.array(z.string()).default([]),
  rewritten_version: z.string().default(""),
  readiness_score: z.number().int().min(0).max(10).default(5),
});
export type SelfReviewOutput = z.infer<typeof SelfReviewSchema>;

// Module 12 – Competitor Review
export const CompetitorReviewSchema = z.object({
  review_questions: z.array(z.string()).default([]),
  winning_variation: z.string().default(""),
  why_it_won: z.string().default(""),
  threshold_issue: z
    .enum(["desire", "certainty", "trust"])
    .default("trust"),
  revision_recommendation: z.string().default(""),
});
export type CompetitorReviewOutput = z.infer<typeof CompetitorReviewSchema>;
