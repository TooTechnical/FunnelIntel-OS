import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  awarenessDiagnoses,
  buyerJourneys,
  competitorReviews,
  draftAssets,
  exportReports,
  funnelSkeletons,
  intelligenceExtracts,
  interviewBuilders,
  marketResearchTemplates,
  mentalSteps,
  projects,
  researchSources,
  selfReviews,
  thresholdGaps,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "passwordHash", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    // Start trial on first login
    const existing = await getUserByOpenId(user.openId);
    if (!existing) {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      values.trialStartedAt = now;
      values.trialEndsAt = trialEnd;
      values.subscriptionStatus = "trial";
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPasswordUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users)
    .where(and(eq(users.email, email), isNotNull(users.passwordHash)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserSubscription(userId: number, data: {
  subscriptionStatus?: "trial" | "active" | "expired" | "cancelled" | "none";
  subscriptionPlan?: "starter" | "pro" | "agency" | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionCurrentPeriodEnd?: Date | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data as any).where(eq(users.id, userId));
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function getUserStats() {
  const db = await getDb();
  if (!db) return { total: 0, trial: 0, active: 0, expired: 0 };
  const [total, trial, active, expired] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.subscriptionStatus, "trial")),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.subscriptionStatus, "active")),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.subscriptionStatus, "expired")),
  ]);
  return {
    total: Number(total[0]?.count ?? 0),
    trial: Number(trial[0]?.count ?? 0),
    active: Number(active[0]?.count ?? 0),
    expired: Number(expired[0]?.count ?? 0),
  };
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(data: typeof projects.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result[0];
}

export async function updateProject(id: number, userId: number, data: Partial<typeof projects.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data as any).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function deleteProject(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function getProjectStats() {
  const db = await getDb();
  if (!db) return { total: 0 };
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(projects);
  return { total: Number(total?.count ?? 0) };
}

// ─── Research Sources ─────────────────────────────────────────────────────────

export async function getResearchByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(researchSources)
    .where(and(eq(researchSources.projectId, projectId), eq(researchSources.userId, userId)))
    .orderBy(desc(researchSources.createdAt));
}

export async function createResearchSource(data: typeof researchSources.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(researchSources).values(data);
  return result[0];
}

export async function deleteResearchSource(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(researchSources).where(and(eq(researchSources.id, id), eq(researchSources.userId, userId)));
}

// ─── Intelligence Extracts ────────────────────────────────────────────────────

export async function getIntelligenceByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(intelligenceExtracts)
    .where(and(eq(intelligenceExtracts.projectId, projectId), eq(intelligenceExtracts.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertIntelligence(projectId: number, userId: number, data: Partial<typeof intelligenceExtracts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getIntelligenceByProject(projectId, userId);
  if (existing) {
    await db.update(intelligenceExtracts).set(data as any).where(eq(intelligenceExtracts.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(intelligenceExtracts).values({ projectId, userId, ...data } as any);
    return result[0];
  }
}

// ─── Market Research Templates ────────────────────────────────────────────────

export async function getMarketResearchByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(marketResearchTemplates)
    .where(and(eq(marketResearchTemplates.projectId, projectId), eq(marketResearchTemplates.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMarketResearch(projectId: number, userId: number, data: Partial<typeof marketResearchTemplates.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getMarketResearchByProject(projectId, userId);
  if (existing) {
    await db.update(marketResearchTemplates).set(data as any).where(eq(marketResearchTemplates.id, existing.id));
  } else {
    await db.insert(marketResearchTemplates).values({ projectId, userId, ...data } as any);
  }
}

// ─── Interview Builder ────────────────────────────────────────────────────────

export async function getInterviewByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(interviewBuilders)
    .where(and(eq(interviewBuilders.projectId, projectId), eq(interviewBuilders.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertInterview(projectId: number, userId: number, data: Partial<typeof interviewBuilders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getInterviewByProject(projectId, userId);
  if (existing) {
    await db.update(interviewBuilders).set(data as any).where(eq(interviewBuilders.id, existing.id));
  } else {
    await db.insert(interviewBuilders).values({ projectId, userId, ...data } as any);
  }
}

// ─── Buyer Journey ────────────────────────────────────────────────────────────

export async function getBuyerJourneyByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(buyerJourneys)
    .where(and(eq(buyerJourneys.projectId, projectId), eq(buyerJourneys.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertBuyerJourney(projectId: number, userId: number, data: Partial<typeof buyerJourneys.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getBuyerJourneyByProject(projectId, userId);
  if (existing) {
    await db.update(buyerJourneys).set(data as any).where(eq(buyerJourneys.id, existing.id));
  } else {
    await db.insert(buyerJourneys).values({ projectId, userId, ...data } as any);
  }
}

// ─── Awareness Diagnosis ──────────────────────────────────────────────────────

export async function getAwarenessByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(awarenessDiagnoses)
    .where(and(eq(awarenessDiagnoses.projectId, projectId), eq(awarenessDiagnoses.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertAwareness(projectId: number, userId: number, data: Partial<typeof awarenessDiagnoses.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAwarenessByProject(projectId, userId);
  if (existing) {
    await db.update(awarenessDiagnoses).set(data as any).where(eq(awarenessDiagnoses.id, existing.id));
  } else {
    await db.insert(awarenessDiagnoses).values({ projectId, userId, ...data } as any);
  }
}

// ─── Threshold Gaps ───────────────────────────────────────────────────────────

export async function getThresholdByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(thresholdGaps)
    .where(and(eq(thresholdGaps.projectId, projectId), eq(thresholdGaps.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertThreshold(projectId: number, userId: number, data: Partial<typeof thresholdGaps.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getThresholdByProject(projectId, userId);
  if (existing) {
    await db.update(thresholdGaps).set(data as any).where(eq(thresholdGaps.id, existing.id));
  } else {
    await db.insert(thresholdGaps).values({ projectId, userId, ...data } as any);
  }
}

// ─── Mental Steps ─────────────────────────────────────────────────────────────

export async function getMentalStepsByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(mentalSteps)
    .where(and(eq(mentalSteps.projectId, projectId), eq(mentalSteps.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMentalSteps(projectId: number, userId: number, data: Partial<typeof mentalSteps.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getMentalStepsByProject(projectId, userId);
  if (existing) {
    await db.update(mentalSteps).set(data as any).where(eq(mentalSteps.id, existing.id));
  } else {
    await db.insert(mentalSteps).values({ projectId, userId, ...data } as any);
  }
}

// ─── Funnel Skeleton ──────────────────────────────────────────────────────────

export async function getFunnelSkeletonByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(funnelSkeletons)
    .where(and(eq(funnelSkeletons.projectId, projectId), eq(funnelSkeletons.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertFunnelSkeleton(projectId: number, userId: number, data: Partial<typeof funnelSkeletons.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getFunnelSkeletonByProject(projectId, userId);
  if (existing) {
    await db.update(funnelSkeletons).set(data as any).where(eq(funnelSkeletons.id, existing.id));
  } else {
    await db.insert(funnelSkeletons).values({ projectId, userId, ...data } as any);
  }
}

// ─── Draft Assets ─────────────────────────────────────────────────────────────

export async function getDraftsByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(draftAssets)
    .where(and(eq(draftAssets.projectId, projectId), eq(draftAssets.userId, userId)))
    .orderBy(desc(draftAssets.createdAt));
}

export async function createDraftAsset(data: typeof draftAssets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(draftAssets).values(data);
  return result[0];
}

export async function updateDraftAsset(id: number, userId: number, data: Partial<typeof draftAssets.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(draftAssets).set(data as any).where(and(eq(draftAssets.id, id), eq(draftAssets.userId, userId)));
}

export async function deleteDraftAsset(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(draftAssets).where(and(eq(draftAssets.id, id), eq(draftAssets.userId, userId)));
}

// ─── Self Reviews ─────────────────────────────────────────────────────────────

export async function getSelfReviewsByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(selfReviews)
    .where(and(eq(selfReviews.projectId, projectId), eq(selfReviews.userId, userId)))
    .orderBy(desc(selfReviews.createdAt));
}

export async function createSelfReview(data: typeof selfReviews.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(selfReviews).values(data);
  return result[0];
}

// ─── Competitor Reviews ───────────────────────────────────────────────────────

export async function getCompetitorReviewByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(competitorReviews)
    .where(and(eq(competitorReviews.projectId, projectId), eq(competitorReviews.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCompetitorReview(projectId: number, userId: number, data: Partial<typeof competitorReviews.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getCompetitorReviewByProject(projectId, userId);
  if (existing) {
    await db.update(competitorReviews).set(data as any).where(eq(competitorReviews.id, existing.id));
  } else {
    await db.insert(competitorReviews).values({ projectId, userId, ...data } as any);
  }
}

// ─── Draft Asset by ID ───────────────────────────────────────────────────────

export async function getDraftAssetById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(draftAssets)
    .where(and(eq(draftAssets.id, id), eq(draftAssets.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Alias used in instructions spec
export const getDraftAssetsByProject = getDraftsByProject;
export const createDraftAssets = createDraftAsset;

// ─── Self Review by Asset ─────────────────────────────────────────────────────

export async function getSelfReviewByAsset(draftAssetId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(selfReviews)
    .where(and(eq(selfReviews.draftAssetId, draftAssetId), eq(selfReviews.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Export Reports ───────────────────────────────────────────────────────────

export async function createExportReport(data: typeof exportReports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(exportReports).values(data);
  return result[0];
}

export async function getExportReportsByProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exportReports)
    .where(and(eq(exportReports.projectId, projectId), eq(exportReports.userId, userId)))
    .orderBy(desc(exportReports.createdAt));
}

export async function getLatestExportReport(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(exportReports)
    .where(and(eq(exportReports.projectId, projectId), eq(exportReports.userId, userId)))
    .orderBy(desc(exportReports.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export const listUsersForAdmin = getAllUsers;

export async function getAdminStats() {
  const [userStats, projectStats] = await Promise.all([
    getUserStats(),
    getProjectStats(),
  ]);
  return { users: userStats, projects: projectStats };
}

// ─── Full Project Data (for export) ──────────────────────────────────────────

export async function getFullProjectData(projectId: number, userId: number) {
  const [
    project,
    research,
    intelligence,
    marketResearch,
    interview,
    buyerJourney,
    awareness,
    threshold,
    mental,
    skeleton,
    drafts,
    reviews,
    competitor,
  ] = await Promise.all([
    getProjectById(projectId, userId),
    getResearchByProject(projectId, userId),
    getIntelligenceByProject(projectId, userId),
    getMarketResearchByProject(projectId, userId),
    getInterviewByProject(projectId, userId),
    getBuyerJourneyByProject(projectId, userId),
    getAwarenessByProject(projectId, userId),
    getThresholdByProject(projectId, userId),
    getMentalStepsByProject(projectId, userId),
    getFunnelSkeletonByProject(projectId, userId),
    getDraftsByProject(projectId, userId),
    getSelfReviewsByProject(projectId, userId),
    getCompetitorReviewByProject(projectId, userId),
  ]);
  return { project, research, intelligence, marketResearch, interview, buyerJourney, awareness, threshold, mental, skeleton, drafts, reviews, competitor };
}
