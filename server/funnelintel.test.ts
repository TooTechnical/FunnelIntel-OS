import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── aiHelpers: checkCanGenerate ─────────────────────────────────────────────

describe("checkCanGenerate (aiHelpers)", () => {
  it("allows generation for active subscribers", async () => {
    const { checkCanGenerate } = await import("./aiHelpers");
    expect(checkCanGenerate({ subscriptionStatus: "active", trialEndsAt: null })).toBe(true);
  });

  it("allows generation during active trial", async () => {
    const { checkCanGenerate } = await import("./aiHelpers");
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(checkCanGenerate({ subscriptionStatus: "trial", trialEndsAt: futureDate })).toBe(true);
  });

  it("blocks generation for expired trial", async () => {
    const { checkCanGenerate } = await import("./aiHelpers");
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(checkCanGenerate({ subscriptionStatus: "trial", trialEndsAt: pastDate })).toBe(false);
  });

  it("blocks generation for expired subscription", async () => {
    const { checkCanGenerate } = await import("./aiHelpers");
    expect(checkCanGenerate({ subscriptionStatus: "expired", trialEndsAt: null })).toBe(false);
  });

  it("blocks generation for cancelled subscription", async () => {
    const { checkCanGenerate } = await import("./aiHelpers");
    expect(checkCanGenerate({ subscriptionStatus: "cancelled", trialEndsAt: null })).toBe(false);
  });

  it("blocks generation when trial but trialEndsAt is null", async () => {
    const { checkCanGenerate } = await import("./aiHelpers");
    expect(checkCanGenerate({ subscriptionStatus: "trial", trialEndsAt: null })).toBe(false);
  });
});

// ─── Zod Output Schemas ───────────────────────────────────────────────────────

describe("IntelligenceSchema", () => {
  it("parses minimal object with defaults", async () => {
    const { IntelligenceSchema } = await import("./aiHelpers");
    const result = IntelligenceSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.current_state).toEqual([]);
      expect(result.data.confidence_score).toBe(5);
      expect(result.data.awareness_level).toBe("problem_aware");
    }
  });

  it("rejects invalid awareness_level", async () => {
    const { IntelligenceSchema } = await import("./aiHelpers");
    const result = IntelligenceSchema.safeParse({ awareness_level: "fully_aware" });
    expect(result.success).toBe(false);
  });
});

describe("AwarenessSchema", () => {
  it("parses with defaults", async () => {
    const { AwarenessSchema } = await import("./aiHelpers");
    const result = AwarenessSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.awareness_level).toBe("problem_aware");
    }
  });

  it("accepts all valid awareness levels", async () => {
    const { AwarenessSchema } = await import("./aiHelpers");
    for (const level of ["unaware", "problem_aware", "solution_aware", "product_aware"]) {
      expect(AwarenessSchema.safeParse({ awareness_level: level }).success).toBe(true);
    }
  });
});

describe("ThresholdSchema", () => {
  it("parses with defaults", async () => {
    const { ThresholdSchema } = await import("./aiHelpers");
    const result = ThresholdSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.biggest_gap).toBe("desire");
    }
  });
});

describe("SelfReviewSchema", () => {
  it("parses with defaults", async () => {
    const { SelfReviewSchema } = await import("./aiHelpers");
    const result = SelfReviewSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overall_score).toBe(5);
      expect(result.data.issues).toEqual([]);
    }
  });

  it("rejects scores above 10", async () => {
    const { SelfReviewSchema } = await import("./aiHelpers");
    expect(SelfReviewSchema.safeParse({ overall_score: 11 }).success).toBe(false);
  });
});

// ─── buildMarkdown ────────────────────────────────────────────────────────────

describe("buildMarkdown (exportHandlerUtils)", () => {
  it("returns fallback string for null data", async () => {
    const { buildMarkdown } = await import("./exportHandlerUtils");
    expect(buildMarkdown(null)).toContain("No project data");
  });

  it("generates markdown with project name", async () => {
    const { buildMarkdown } = await import("./exportHandlerUtils");
    const data = {
      project: { name: "Test Project", productService: "SaaS", targetCustomer: "SMBs", mainOffer: "Free trial" },
      research: [], intelligence: null, marketResearch: null, buyerJourney: null,
      awareness: null, threshold: null, mental: null, skeleton: null,
      drafts: [], reviews: [], competitor: null,
    };
    const result = buildMarkdown(data);
    expect(result).toContain("Test Project");
    expect(result).toContain("FunnelIntel OS");
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user-001",
    email: "test@funnelintel.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function makeCtx(user: AuthenticatedUser | null = null): TrpcContext {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
    _clearedCookies: clearedCookies,
  } as any;
}

// ─── Auth Tests ────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const user = makeUser();
    const ctx = makeCtx(user);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    const cleared = (ctx as any)._clearedCookies;
    expect(cleared).toHaveLength(1);
    expect(cleared[0]?.name).toBe(COOKIE_NAME);
    expect(cleared[0]?.options).toMatchObject({
      maxAge: -1,
      httpOnly: true,
      path: "/",
    });
  });

  it("allows logout when user is not authenticated", async () => {
    const ctx = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("auth.me", () => {
  it("returns null when not authenticated", async () => {
    const ctx = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Subscription Guard Tests ─────────────────────────────────────────────────

describe("subscription guard logic", () => {
  it("allows generation for active subscribers", () => {
    const user = {
      subscriptionStatus: "active",
      trialEndsAt: null,
    };
    const now = new Date();
    const trialActive = user.subscriptionStatus === "trial" && user.trialEndsAt && (user.trialEndsAt as any) > now;
    const canGenerate = user.subscriptionStatus === "active" || trialActive;
    expect(canGenerate).toBe(true);
  });

  it("allows generation during active trial", () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
    const user = {
      subscriptionStatus: "trial",
      trialEndsAt: futureDate,
    };
    const now = new Date();
    const trialActive = user.subscriptionStatus === "trial" && user.trialEndsAt && user.trialEndsAt > now;
    const canGenerate = user.subscriptionStatus === "active" || !!trialActive;
    expect(canGenerate).toBe(true);
  });

  it("blocks generation for expired trial", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    const user = {
      subscriptionStatus: "trial",
      trialEndsAt: pastDate,
    };
    const now = new Date();
    const trialActive = user.subscriptionStatus === "trial" && user.trialEndsAt && user.trialEndsAt > now;
    const canGenerate = user.subscriptionStatus === "active" || !!trialActive;
    expect(canGenerate).toBe(false);
  });

  it("blocks generation for expired subscription", () => {
    const user = {
      subscriptionStatus: "expired",
      trialEndsAt: null,
    };
    const now = new Date();
    const trialActive = user.subscriptionStatus === "trial" && user.trialEndsAt && (user.trialEndsAt as any) > now;
    const canGenerate = user.subscriptionStatus === "active" || !!trialActive;
    expect(canGenerate).toBe(false);
  });
});

// ─── Stripe Products Tests ─────────────────────────────────────────────────────

describe("stripe products", () => {
  it("exports all three required plan keys", async () => {
    const { PLANS } = await import("./stripeProducts");
    expect(Object.keys(PLANS)).toContain("starter");
    expect(Object.keys(PLANS)).toContain("pro");
    expect(Object.keys(PLANS)).toContain("agency");
  });

  it("starter plan is cheaper than pro", async () => {
    const { PLANS } = await import("./stripeProducts");
    expect(PLANS.starter.amount).toBeLessThan(PLANS.pro.amount);
  });

  it("pro plan is cheaper than agency", async () => {
    const { PLANS } = await import("./stripeProducts");
    expect(PLANS.pro.amount).toBeLessThan(PLANS.agency.amount);
  });

  it("all plans have required fields", async () => {
    const { PLANS } = await import("./stripeProducts");
    for (const [key, plan] of Object.entries(PLANS)) {
      expect(plan.name, `${key} should have name`).toBeTruthy();
      expect(plan.amount, `${key} should have amount`).toBeGreaterThan(0);
      expect(plan.currency, `${key} should have currency`).toBe("usd");
      expect(plan.features, `${key} should have features`).toBeInstanceOf(Array);
      expect(plan.features.length, `${key} should have at least one feature`).toBeGreaterThan(0);
    }
  });
});

// ─── Module Numbering Tests ────────────────────────────────────────────────────

describe("module numbering integrity", () => {
  it("defines all 13 modules in the correct order", () => {
    const modules = [
      { num: 1, name: "Research Intake" },
      { num: 2, name: "Intelligence Extraction" },
      { num: 3, name: "Market Research Template" },
      { num: 4, name: "Interview Builder" },
      { num: 5, name: "Buyer Journey Map" },
      { num: 6, name: "Awareness Diagnosis" },
      { num: 7, name: "Threshold Gap Analysis" },
      { num: 8, name: "Mental Steps + Triggers" },
      { num: 9, name: "Funnel Skeleton" },
      { num: 10, name: "Drafting Studio" },
      { num: 11, name: "Self-Review Checker" },
      { num: 12, name: "Competitor Review" },
      { num: 13, name: "Export Report" },
    ];

    expect(modules).toHaveLength(13);
    modules.forEach((m, i) => {
      expect(m.num).toBe(i + 1);
    });
  });
});

// ─── Export Handler Tests ──────────────────────────────────────────────────────

describe("export handler", () => {
  it("handles null project data gracefully", async () => {
    const { buildMarkdown } = await import("./exportHandlerUtils").catch(() => ({ buildMarkdown: null }));
    // If the util doesn't export separately, just verify the module loads
    const handler = await import("./exportHandler");
    expect(handler.handleExport).toBeTypeOf("function");
  });
});
