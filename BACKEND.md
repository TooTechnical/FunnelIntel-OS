# FunnelIntel OS — Backend Documentation

## Overview

FunnelIntel OS is a 13-module AI-powered funnel strategy platform. The backend is built with:

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ / TypeScript |
| API | tRPC v11 (type-safe RPC over Express) |
| Database | MySQL / TiDB via Drizzle ORM |
| AI | OpenAI-compatible LLM via `invokeLLM` |
| Auth | Manus OAuth (session cookie) |
| Payments | Stripe Subscriptions + Webhooks |
| Build | esbuild (server) + Vite (client) |
| Tests | Vitest |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all required values.

```
DATABASE_URL=mysql://user:password@host:3306/funnelintel
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
OWNER_OPEN_ID=your-manus-open-id
```

---

## Database Schema

All tables live in `drizzle/schema.ts`. Migrations are in `drizzle/`.

| Table | Purpose |
|---|---|
| `users` | Auth, subscription status, trial dates, Stripe IDs |
| `projects` | One project per funnel campaign; tracks completion flags |
| `research_sources` | Raw customer research pasted by the user (Module 1) |
| `intelligence_extracts` | AI-extracted intelligence from research (Module 2) |
| `market_research_templates` | Structured market research template (Module 3) |
| `interview_builders` | Interview questions and outreach messages (Module 4) |
| `buyer_journeys` | 8-stage buyer journey map (Module 5) |
| `awareness_diagnoses` | Awareness level + funnel type recommendation (Module 6) |
| `threshold_gaps` | Desire/certainty/trust gap analysis (Module 7) |
| `mental_steps` | Ordered mental steps + triggers (Module 8) |
| `funnel_skeletons` | 11-section funnel skeleton (Module 9) |
| `draft_assets` | Generated copy assets (Module 10) |
| `self_reviews` | AI copy review scores and fixes (Module 11) |
| `competitor_reviews` | Competitor ad/LP comparison (Module 12) |
| `export_reports` | Saved markdown export snapshots (Module 13) |

### Running Migrations

```bash
pnpm drizzle-kit push
```

---

## Subscription & Trial Gating

Every AI-generation procedure is gated by `checkCanGenerate(user)` from `server/aiHelpers.ts`.

| Status | `checkCanGenerate` result |
|---|---|
| `active` | `true` — paid subscriber |
| `trial` + `trialEndsAt` in future | `true` — within 48-hour trial window |
| `trial` + `trialEndsAt` in past | `false` — trial expired |
| `expired` | `false` |
| `cancelled` | `false` |
| `none` | `false` |

**Trial window:** 48 hours from first login, set automatically in `upsertUser`.

When `checkCanGenerate` returns `false`, the procedure throws:
```
TRPCError { code: "FORBIDDEN", message: "Trial expired or no active subscription." }
```

---

## AI Helpers (`server/aiHelpers.ts`)

### `checkCanGenerate(user)`
Boolean guard. Returns `true` if the user may invoke AI generation.

### `assertCanGenerate(user)`
Throws `TRPCError FORBIDDEN` if the user cannot generate. Use in mutations.

### `safeJsonLLM({ systemPrompt, userPrompt, schema, fallback? })`
Calls the LLM, parses JSON, validates with Zod, and retries once on failure.
Returns the validated typed output or throws `INTERNAL_SERVER_ERROR`.

### Zod Output Schemas
One schema per module, all exported from `aiHelpers.ts`:

| Export | Module |
|---|---|
| `IntelligenceSchema` | Module 2 — Intelligence Extraction |
| `MarketResearchSchema` | Module 3 — Market Research Template |
| `InterviewBuilderSchema` | Module 4 — Interview Builder |
| `BuyerJourneySchema` | Module 5 — Buyer Journey |
| `AwarenessSchema` | Module 6 — Awareness Diagnosis |
| `ThresholdSchema` | Module 7 — Threshold Gap Analysis |
| `MentalStepsSchema` | Module 8 — Mental Steps + Triggers |
| `FunnelSkeletonSchema` | Module 9 — Funnel Skeleton |
| `DraftingSchema` | Module 10 — Drafting Studio |
| `SelfReviewSchema` | Module 11 — Self-Review Checker |
| `CompetitorReviewSchema` | Module 12 — Competitor Review |

---

## tRPC Router Reference

All procedures are in `server/routers.ts`. The root router is `appRouter`.

### `auth`
| Procedure | Type | Description |
|---|---|---|
| `auth.me` | query | Returns current user or null |
| `auth.logout` | mutation | Clears session cookie |
| `auth.subscriptionStatus` | query | Returns subscription status, plan, trial info, `canGenerate` flag |

### `projects`
| Procedure | Type | Description |
|---|---|---|
| `projects.list` | query | All projects for the current user |
| `projects.get` | query | Single project by ID |
| `projects.create` | mutation | Create a new project |
| `projects.update` | mutation | Update project fields or completion flags |
| `projects.delete` | mutation | Delete a project |

### `research` (Module 1)
| Procedure | Type | Description |
|---|---|---|
| `research.list` | query | All research sources for a project |
| `research.create` | mutation | Paste a new research source |
| `research.delete` | mutation | Delete a research source |

### `intelligence` (Modules 2–4)
| Procedure | Type | Description |
|---|---|---|
| `intelligence.get` | query | Get extracted intelligence |
| `intelligence.extract` | mutation | **[GATED]** Run AI extraction on all research |
| `intelligence.generateMarketResearch` | mutation | **[GATED]** Generate market research template |
| `intelligence.getMarketResearch` | query | Get market research template |
| `intelligence.generateInterviewBuilder` | mutation | **[GATED]** Generate interview questions |
| `intelligence.getInterview` | query | Get interview builder data |

### `buyerJourney` (Module 5)
| Procedure | Type | Description |
|---|---|---|
| `buyerJourney.get` | query | Get buyer journey |
| `buyerJourney.generate` | mutation | **[GATED]** Generate 8-stage buyer journey |

### `awareness` (Module 6)
| Procedure | Type | Description |
|---|---|---|
| `awareness.get` | query | Get awareness diagnosis |
| `awareness.diagnose` | mutation | **[GATED]** Run awareness diagnosis |

### `threshold` (Module 7)
| Procedure | Type | Description |
|---|---|---|
| `threshold.get` | query | Get threshold gap analysis |
| `threshold.analyze` | mutation | **[GATED]** Analyse desire/certainty/trust gaps |

### `mentalSteps` (Module 8)
| Procedure | Type | Description |
|---|---|---|
| `mentalSteps.get` | query | Get mental steps |
| `mentalSteps.generate` | mutation | **[GATED]** Generate ordered mental steps |

### `funnelSkeleton` (Module 9)
| Procedure | Type | Description |
|---|---|---|
| `funnelSkeleton.get` | query | Get funnel skeleton |
| `funnelSkeleton.generate` | mutation | **[GATED]** Generate 11-section funnel skeleton |

### `drafting` (Module 10)
| Procedure | Type | Description |
|---|---|---|
| `drafting.list` | query | All draft assets for a project |
| `drafting.generate` | mutation | **[GATED]** Generate a copy asset |
| `drafting.update` | mutation | Update draft copy |
| `drafting.delete` | mutation | Delete a draft asset |

### `selfReview` (Module 11)
| Procedure | Type | Description |
|---|---|---|
| `selfReview.list` | query | All self-reviews for a project |
| `selfReview.run` | mutation | **[GATED]** Run AI copy review |

### `competitorReview` (Module 12)
| Procedure | Type | Description |
|---|---|---|
| `competitorReview.get` | query | Get competitor review data |
| `competitorReview.save` | mutation | Save ads/landing pages for comparison |
| `competitorReview.analyze` | mutation | **[GATED]** Run AI competitor analysis |
| `competitorReview.saveFeedback` | mutation | Save insider feedback answers |

### `export` (Module 13)
| Procedure | Type | Description |
|---|---|---|
| `export.getProjectData` | query | Get full project data bundle |
| `export.generateMarkdown` | mutation | Generate markdown report + save to DB |
| `export.generatePdf` | mutation | Trigger PDF export, returns download URL |
| `export.getLatestReport` | query | Get most recent saved export report |
| `export.markComplete` | mutation | Mark project as `ready_to_launch` |

> **PDF download:** `GET /api/export/:projectId?format=pdf` — handled by the Express route in `server/_core/index.ts`.

### `stripe`
| Procedure | Type | Description |
|---|---|---|
| `stripe.createCheckout` | mutation | Create Stripe Checkout session |
| `stripe.getPortalUrl` | mutation | Create Stripe Customer Portal session |

### `admin`
| Procedure | Type | Description |
|---|---|---|
| `admin.stats` | query | User + project counts by status |
| `admin.users` | query | Paginated user list |

---

## Stripe Webhook Events

Handled at `POST /api/stripe/webhook`:

| Event | Action |
|---|---|
| `checkout.session.completed` | Set user to `active`, store `stripeCustomerId` + `stripeSubscriptionId` |
| `customer.subscription.updated` | Update status, plan, and `subscriptionCurrentPeriodEnd` |
| `customer.subscription.deleted` | Set user to `cancelled` |
| `invoice.payment_failed` | Log warning (Stripe handles dunning) |

---

## Scripts

```bash
pnpm dev          # Start dev server (Vite + Express)
pnpm build        # Build client (Vite) + server (esbuild)
pnpm check        # TypeScript type-check (no emit)
pnpm test         # Run Vitest test suite
pnpm drizzle-kit push   # Push schema to database
```

---

## File Structure

```
server/
  _core/           # Express app, tRPC context, auth middleware, LLM helper
  aiHelpers.ts     # checkCanGenerate, safeJsonLLM, all Zod output schemas
  db.ts            # All database access functions
  routers.ts       # All tRPC procedures (appRouter)
  stripeRouter.ts  # Stripe checkout, portal, webhook handler
  stripeProducts.ts# Plan definitions (starter / pro / agency)
  exportHandler.ts # Express handler for PDF/markdown download
  exportHandlerUtils.ts # buildMarkdown (testable utility)
  *.test.ts        # Vitest unit tests

drizzle/
  schema.ts        # Drizzle table definitions
  0000_*.sql       # Initial migration
  0001_*.sql       # Subscription fields migration
  0002_export_reports.sql  # Export reports table migration
  meta/            # Drizzle migration journal
```
