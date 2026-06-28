# FunnelIntel OS — TODO

## Phase 1: Foundation
- [x] Database schema: users (extend with trial/subscription), projects, research_sources, intelligence_extracts, buyer_journeys, awareness_diagnoses, threshold_gaps, mental_steps, funnel_skeletons, draft_assets, self_reviews, competitor_reviews, insider_feedback
- [x] Global cyberpunk theme: CSS variables, neon glow utilities, HUD corner brackets
- [x] Google Fonts: Orbitron (headings) + Inter (body)
- [x] App.tsx routes wired for all pages

## Phase 2: Landing Page (Module 14)
- [x] Hero section: exact headline "Stop guessing what your customers need to hear."
- [x] Problem section
- [x] Product section
- [x] How It Works section
- [x] Feature cards (8 features)
- [x] Use cases list (6 personas)
- [x] Pricing tiers: Starter $49, Pro $97, Agency $197
- [x] FAQ section
- [x] CTA buttons linking to sign-up

## Phase 3: Auth & Trial
- [x] Sign-up / login pages (Manus OAuth)
- [x] Trial start timestamp stored on first login
- [x] Trial expiry check (2 days) on all protected routes
- [x] Subscription status gating middleware
- [x] Trial expired banner + upgrade prompt
- [x] Subscription plan stored on user record

## Phase 4: Project Dashboard
- [x] Project list page with stats cards (total, active, trial status)
- [x] Create project modal/form (name, business, industry, product, target customer, desired action, offer, funnel type)
- [x] Project card with status badge and progress checklist
- [x] Project status: Research → Buyer Journey → Funnel Strategy → Drafting → Review → Ready to Launch
- [x] Delete / archive project

## Phase 5: Research Intake (Modules 1–4)
- [x] Research source form: title, type, pasted content, optional URL
- [x] Research type selector (reviews, interviews, transcripts, Reddit, competitor copy, etc.)
- [x] AI extraction: current state, dream state, roadblocks, exact phrases, objections, awareness level
- [x] Structured JSON cards for each extracted field
- [x] Separate exact phrases vs AI paraphrases vs strategic insights
- [x] Market Research Template (Module 3) with confidence scores
- [x] Interview Builder (Module 4): knowledge gaps, outreach messages, question sets

## Phase 6: Buyer Journey + Awareness + Thresholds (Modules 5–7)
- [x] Buyer Journey Mapper: 8 stages with thought/feeling/language/opportunity
- [x] Awareness + Attention Diagnosis: 4 awareness levels × 2 attention modes → funnel type recommendation
- [x] Threshold Gap Analysis: desire/certainty/trust scores (current vs required), biggest gap identification

## Phase 7: Mental Steps, Funnel Skeleton, Drafting, Self-Review, Competitor Review (Modules 8–12)
- [x] Mental Steps + Triggers Builder: ordered chain with threshold/trigger/element/copy angle
- [x] Funnel Skeleton Generator: landing page skeleton (11 sections)
- [x] Drafting Studio: element-by-element copy generation with 2–4 variations
- [x] Self-Review Checker: 5 check categories, score, issues, fixes, rewrite
- [x] Competitor Comparison / Insider Review Board: upload/paste assets, generate review questions, store feedback

## Phase 8: Export, Stripe, Admin
- [x] PDF strategy report generation (server-side, all 13 sections)
- [x] Markdown export
- [x] Stripe integration: Starter/Pro/Agency plans, 2-day trial, webhook handler
- [x] Admin panel: users, projects, subscriptions, trial users, usage stats

## Phase 9: Polish & Tests
- [x] Cyberpunk neon glow on all key UI elements
- [x] HUD corner brackets on cards
- [x] Progress bars / checklists on project workflow
- [x] Empty states with guidance
- [x] Vitest unit tests for core procedures (14 tests passing)
- [x] Push to GitHub

## Remaining / Future Work
- [ ] Stripe price IDs must be created in Stripe dashboard and set as STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO, STRIPE_PRICE_AGENCY env vars
- [ ] Claim Stripe sandbox at the URL in project settings before 2026-08-27
- [ ] File upload for competitor ads/landing pages (Module 12 enhancement)
- [ ] Team members feature for Agency plan
- [ ] Email notifications for trial expiry
- [ ] Tooltips for marketing terms (awareness, attention, desire, certainty, trust)
