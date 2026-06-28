# FunnelIntel OS

**AI-powered customer intelligence and funnel engineering SaaS platform.**

FunnelIntel OS turns customer research, interviews, reviews, and competitor analysis into validated funnels, ads, landing pages, and offers — engineered around desire, certainty, and trust.

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + TailwindCSS |
| API | tRPC (type-safe end-to-end) |
| Database | MySQL (TiDB) via Drizzle ORM |
| Auth | OAuth2 (Manus) via session cookies |
| AI | OpenAI-compatible LLM via `invokeLLM` |
| Payments | Stripe Subscriptions + Webhooks |
| Export | PDFKit (PDF) + Markdown |
| Testing | Vitest |

---

## The 13-Module Workflow

Each project progresses through 13 structured modules:

| # | Module | Purpose |
|---|---|---|
| 1 | Research Intake | Paste customer reviews, interviews, forum posts, transcripts |
| 2 | Intelligence Extraction | AI extracts pains, desires, objections, exact phrases |
| 3 | Market Research Template | Structured breakdown across 5 strategic dimensions |
| 4 | Interview Builder | AI generates knowledge-gap questions and outreach messages |
| 5 | Buyer Journey Map | Map all 8 stages from trigger to action |
| 6 | Awareness Diagnosis | Diagnose awareness level and recommend funnel type |
| 7 | Threshold Gap Analysis | Score desire/certainty/trust gaps, identify biggest gap |
| 8 | Mental Steps + Triggers | Build the ordered chain of mental steps before action |
| 9 | Funnel Skeleton | Generate 11-section landing page structure |
| 10 | Drafting Studio | Generate copy element by element with variations |
| 11 | Self-Review Checker | 5-category review: score, issues, fixes, rewrite |
| 12 | Competitor Review | Compare ads/pages, diagnose winning variation |
| 13 | Export Report | Download complete strategy report as PDF or Markdown |

---

## Subscription Plans

| Plan | Price | Projects | Features |
|---|---|---|---|
| Starter | $49/month | 3 | All 13 modules, PDF export |
| Pro | $97/month | Unlimited | + Priority support, variations |
| Agency | $197/month | Unlimited | + Client workspaces, white-label |

All plans include a **2-day free trial** — no credit card required.

---

## Trial & Subscription Logic

- New users are set to `subscriptionStatus: "trial"` with `trialEndsAt = now + 2 days`
- `checkCanGenerate(user)` returns `true` if status is `"active"` OR trial is active
- All AI-generating tRPC mutations call `checkCanGenerate` before invoking the LLM
- After trial expiry, users can view existing data but cannot generate new outputs
- Stripe webhooks handle `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`

---

## Environment Variables

```env
# Database
DATABASE_URL=mysql://...

# Auth
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
SESSION_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...

# AI
OPENAI_API_KEY=...
OPENAI_API_BASE=...  # optional, for custom endpoints
```

---

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

---

## Database Schema

The Drizzle schema (`drizzle/schema.ts`) defines tables for:

- `users` — auth, subscription status, trial dates, Stripe IDs
- `projects` — per-user projects with completion flags for each module
- `researchSources` — raw research input (reviews, interviews, etc.)
- `intelligenceData` — extracted pains, desires, objections, phrases
- `marketResearchTemplates` — 5-dimension market research breakdown
- `interviewBuilders` — knowledge gap questions and outreach messages
- `buyerJourneys` — 8-stage journey maps
- `awarenessData` — awareness level diagnosis
- `thresholdData` — desire/certainty/trust gap scores
- `mentalStepsData` — ordered mental step chains
- `funnelSkeletons` — 11-section funnel structures
- `draftAssets` — copy drafts with variations
- `selfReviews` — 5-category review results
- `competitorReviews` — competitor analysis and insider feedback

---

## File Structure

```
├── client/src/
│   ├── pages/          # All 13 module pages + Dashboard, Home, Pricing, Settings, Terms, Privacy
│   ├── components/     # AppLayout, ErrorBoundary, UI components
│   ├── _core/          # Auth hooks, tRPC setup
│   └── lib/            # tRPC client, utilities
├── server/
│   ├── routers.ts      # All tRPC routes (auth, projects, 13 modules, stripe, admin)
│   ├── db.ts           # All database operations
│   ├── stripeRouter.ts # Stripe checkout, portal, webhooks
│   ├── exportHandler.ts # PDF + Markdown export
│   ├── exportHandlerUtils.ts # Testable markdown builder
│   ├── stripeProducts.ts # Plan definitions
│   └── _core/          # Express server, tRPC context, OAuth
└── drizzle/
    └── schema.ts       # Full database schema
```

---

## Testing

```bash
pnpm test
```

Tests cover:
- Auth logout flow
- Subscription guard logic (active, trial, expired)
- Stripe plan structure validation
- Module numbering integrity
- Export handler loading

---

## Stripe Webhook Setup

Point your Stripe webhook to: `POST /api/stripe/webhook`

Events to enable:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

*Built with FunnelIntel OS — Customer intelligence for funnels that convert.*
