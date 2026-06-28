import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Trial & subscription
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", [
    "trial",
    "active",
    "expired",
    "cancelled",
    "none",
  ])
    .default("none")
    .notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", [
    "starter",
    "pro",
    "agency",
  ]),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  subscriptionCurrentPeriodEnd: timestamp("subscriptionCurrentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  productService: text("productService"),
  targetCustomer: text("targetCustomer"),
  desiredAction: text("desiredAction"),
  mainOffer: text("mainOffer"),
  funnelType: varchar("funnelType", { length: 128 }),
  status: mysqlEnum("status", [
    "research",
    "buyer_journey",
    "funnel_strategy",
    "drafting",
    "review",
    "ready_to_launch",
  ])
    .default("research")
    .notNull(),
  // Progress flags
  researchComplete: boolean("researchComplete").default(false),
  intelligenceComplete: boolean("intelligenceComplete").default(false),
  buyerJourneyComplete: boolean("buyerJourneyComplete").default(false),
  awarenessComplete: boolean("awarenessComplete").default(false),
  thresholdComplete: boolean("thresholdComplete").default(false),
  mentalStepsComplete: boolean("mentalStepsComplete").default(false),
  funnelSkeletonComplete: boolean("funnelSkeletonComplete").default(false),
  draftingComplete: boolean("draftingComplete").default(false),
  selfReviewComplete: boolean("selfReviewComplete").default(false),
  competitorReviewComplete: boolean("competitorReviewComplete").default(false),
  exportComplete: boolean("exportComplete").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Research Sources ─────────────────────────────────────────────────────────

export const researchSources = mysqlTable("research_sources", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sourceType: mysqlEnum("sourceType", [
    "customer_review",
    "interview_notes",
    "sales_call_transcript",
    "reddit_comment",
    "youtube_comment",
    "trustpilot_review",
    "google_review",
    "competitor_copy",
    "client_notes",
    "testimonial",
    "survey_answer",
    "general_market_research",
    "other",
  ]).notNull(),
  content: text("content").notNull(),
  url: varchar("url", { length: 2048 }),
  fileKey: varchar("fileKey", { length: 512 }),
  fileUrl: varchar("fileUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ResearchSource = typeof researchSources.$inferSelect;
export type InsertResearchSource = typeof researchSources.$inferInsert;

// ─── Intelligence Extracts ────────────────────────────────────────────────────

export const intelligenceExtracts = mysqlTable("intelligence_extracts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  // Structured JSON fields
  currentState: json("currentState"),
  dreamState: json("dreamState"),
  roadblocks: json("roadblocks"),
  previousSolutions: json("previousSolutions"),
  competitorProducts: json("competitorProducts"),
  exactPhrases: json("exactPhrases"),
  pains: json("pains"),
  desires: json("desires"),
  objections: json("objections"),
  trustFears: json("trustFears"),
  buyingTriggers: json("buyingTriggers"),
  decisionMoments: json("decisionMoments"),
  emotionalLanguage: json("emotionalLanguage"),
  repeatedThemes: json("repeatedThemes"),
  marketingAngles: json("marketingAngles"),
  awarenessLevel: mysqlEnum("awarenessLevel", [
    "unaware",
    "problem_aware",
    "solution_aware",
    "product_aware",
  ]),
  confidenceScore: int("confidenceScore"),
  rawOutput: text("rawOutput"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IntelligenceExtract = typeof intelligenceExtracts.$inferSelect;
export type InsertIntelligenceExtract = typeof intelligenceExtracts.$inferInsert;

// ─── Market Research Templates ────────────────────────────────────────────────

export const marketResearchTemplates = mysqlTable("market_research_templates", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  currentState: json("currentState"),
  dreamState: json("dreamState"),
  roadblocks: json("roadblocks"),
  solutions: json("solutions"),
  productsBusinesses: json("productsBusinesses"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Interview Builder ────────────────────────────────────────────────────────

export const interviewBuilders = mysqlTable("interview_builders", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  knowledgeGaps: json("knowledgeGaps"),
  interviewTypes: json("interviewTypes"),
  outreachMessages: json("outreachMessages"),
  buyerQuestions: json("buyerQuestions"),
  nonBuyerQuestions: json("nonBuyerQuestions"),
  followUpProbes: json("followUpProbes"),
  notesTemplate: text("notesTemplate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Buyer Journeys ───────────────────────────────────────────────────────────

export const buyerJourneys = mysqlTable("buyer_journeys", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  stages: json("stages"), // Array of {stage, happened, thought, felt, language, opportunity}
  rawOutput: text("rawOutput"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Awareness Diagnoses ──────────────────────────────────────────────────────

export const awarenessDiagnoses = mysqlTable("awareness_diagnoses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  awarenessLevel: mysqlEnum("awarenessLevel", [
    "unaware",
    "problem_aware",
    "solution_aware",
    "product_aware",
  ]),
  attentionMode: mysqlEnum("attentionMode", ["passive", "active"]),
  recommendedFunnelType: varchar("recommendedFunnelType", { length: 128 }),
  explanation: text("explanation"),
  contentRecommendations: json("contentRecommendations"),
  firstMessageStrategy: text("firstMessageStrategy"),
  ctaStrategy: text("ctaStrategy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Threshold Gaps ───────────────────────────────────────────────────────────

export const thresholdGaps = mysqlTable("threshold_gaps", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  currentDesire: int("currentDesire"),
  requiredDesire: int("requiredDesire"),
  currentCertainty: int("currentCertainty"),
  requiredCertainty: int("requiredCertainty"),
  currentTrust: int("currentTrust"),
  requiredTrust: int("requiredTrust"),
  biggestGap: mysqlEnum("biggestGap", ["desire", "certainty", "trust"]),
  funnelFocus: text("funnelFocus"),
  recommendations: json("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Mental Steps ─────────────────────────────────────────────────────────────

export const mentalSteps = mysqlTable("mental_steps", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  steps: json("steps"), // Array of {order, step, threshold, trigger, funnelElement, copyAngle}
  rawOutput: text("rawOutput"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Funnel Skeletons ─────────────────────────────────────────────────────────

export const funnelSkeletons = mysqlTable("funnel_skeletons", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  funnelType: varchar("funnelType", { length: 128 }),
  sections: json("sections"), // Array of {name, job, content, mentalStep}
  adAssets: json("adAssets"),
  rawOutput: text("rawOutput"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Draft Assets ─────────────────────────────────────────────────────────────

export const draftAssets = mysqlTable("draft_assets", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  assetType: mysqlEnum("assetType", [
    "social_ad",
    "social_ad_visual",
    "google_ad",
    "landing_page",
    "offer_section",
    "cta_buttons",
    "email_sequence",
    "outreach_dm",
    "sales_call_script",
    "faq",
    "follow_up",
  ]).notNull(),
  elementName: varchar("elementName", { length: 255 }),
  elementJob: text("elementJob"),
  mentalStep: text("mentalStep"),
  thresholdAffected: mysqlEnum("thresholdAffected", [
    "desire",
    "certainty",
    "trust",
    "attention",
  ]),
  primaryCopy: text("primaryCopy"),
  variations: json("variations"), // Array of strings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Self Reviews ─────────────────────────────────────────────────────────────

export const selfReviews = mysqlTable("self_reviews", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  draftAssetId: int("draftAssetId"),
  reviewContent: text("reviewContent"),
  lizardBrainScore: int("lizardBrainScore"),
  batonHandoffScore: int("batonHandoffScore"),
  thresholdScore: int("thresholdScore"),
  languageScore: int("languageScore"),
  finalScore: int("finalScore"),
  overallScore: int("overallScore"),
  issues: json("issues"),
  suggestedFixes: json("suggestedFixes"),
  rewrittenVersion: text("rewrittenVersion"),
  readinessScore: int("readinessScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Competitor Reviews ───────────────────────────────────────────────────────

export const competitorReviews = mysqlTable("competitor_reviews", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  userAd: text("userAd"),
  competitorAd1: text("competitorAd1"),
  competitorAd2: text("competitorAd2"),
  topPlayerAd: text("topPlayerAd"),
  userLandingPage: text("userLandingPage"),
  competitorLandingPage: text("competitorLandingPage"),
  reviewQuestions: json("reviewQuestions"),
  insiderFeedback: json("insiderFeedback"),
  winningVariation: varchar("winningVariation", { length: 128 }),
  whyItWon: text("whyItWon"),
  thresholdIssue: mysqlEnum("thresholdIssue", ["desire", "certainty", "trust"]),
  revisionRecommendation: text("revisionRecommendation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompetitorReview = typeof competitorReviews.$inferSelect;
