# 07 — Implementation Plan & Roadmap

Phased build for **web first, all features**. Each phase is shippable and maps to parity items (doc 08). Backend and frontend tasks are listed per phase so Claude Code can interleave.

---

## Phase 0 — Foundations
**Backend:** repo + monorepo layout; Prisma schema (doc 02) + first migration on Neon Postgres; Redis (Upstash); R2 buckets; Razorpay sandbox keys; Auth.js + phone-OTP (MSG91) end-to-end; entitlements resolver skeleton; Inngest setup; Sentry.
**Frontend:** Next.js 16 app shell; `brand.ts` + `ThemeProvider`/`BrandProvider`; Tailwind v4 + design tokens (doc 05 §1); base component primitives; `@next/third-parties` GA4 wired (dark in non-prod).
**Exit:** can log in by phone OTP; empty authed dashboard renders; CI + preview deploys green.

## Phase 1 — Template engine + 1 template end-to-end
**Backend:** `invitation.create/get/saveAll/checkSlug/publish/unpublish`; slug Redis cache; publish entitlement gate (sandbox payment).
**Frontend:** template plugin contract (doc 06); ship **Imperial Heritage** fully (config+schema+Renderer+interaction); builder shell renders its preview; publish to `/<slug>` SSR.
**Exit:** create draft → edit Essentials → pay (sandbox) → publish → public invite loads.

## Phase 2 — Full builder (10 sections)
**Backend:** `saveSection` with revision sync-guard; per-section Zod schemas; gallery upload → R2; autosave endpoints.
**Frontend:** all 10 section forms (doc 05 §6); two-pane live preview with mobile/desktop toggle; progress ring; autosave + "All changes saved"; **Unsaved Cloud Changes** guard modal; Clear Form; Change Template (field re-map); WhatsApp help button.
**Exit:** every section editable with instant preview; local+cloud persistence + guard work.

## Phase 3 — Guest experience
**Backend:** REST RSVP (native + custom questions), wishes, view analytics (queue), ICS calendar gen; WhatsApp utility confirmation on RSVP.
**Frontend:** published invite sections (doc 05 §7): countdown, events + directions + add-to-calendar, gallery, info, gifts, **RSVP popup** (3 modes), wishes wall, soundtrack widget, WhatsApp contact. Lazy-loaded interactions; reduced-motion.
**Exit:** a guest can view, RSVP (native saved to dashboard), wish, get directions, add to calendar, hear soundtrack.

## Phase 4 — Dashboard
**Backend:** `dash.*` aggregates; guest CSV/XLSX export (R2 signed URL); payments history; review capture.
**Frontend:** Overview stats + publish panel + journey tracker + live recent RSVPs + countdown + quick actions; Guest List (search/filters/export); Wishes; Timeline; Payments; saved Report; Write a Review.
**Exit:** couple manages everything; export produces clean columns.

## Phase 5 — Port remaining templates
All 8 themed templates + Custom pipeline (doc 06 §4). Each = plugin only; verify preview==live and reduced-motion fallback per template.
**Exit:** full template lineup with signature interactions + themed audio; `/templates` filters work.

## Phase 6 — AI layer
**Backend:** server AI gateway (provider-abstracted, Claude primary); Wedding Report generation (doc 03 §6) + PDF (Playwright) + WhatsApp/Save/Free-Quotes; **card OCR extraction** + **AI draft generation** (doc 04) with rituals knowledge base + Zod validation; `ai.regenerateField`, `ai.personalityTags`; ai-credits entitlement + rate limits.
**Frontend:** 12-step report quiz + report tabs; **AI-first intake** `/intake` (card upload → confirm chips → quiz → draft → builder); inline regenerate controls across builder.
**Exit:** Wedding Report at parity; AI intake drafts a full publishable invitation from a card.

## Phase 7 — Marketing, monetization & polish
**Backend:** Razorpay **Subscriptions** (Premium) + webhook entitlements; AdSense config; newsletter; sitemap/SEO; blog (MDX or CMS).
**Frontend:** landing (hero w/ AI CTA, journey, report promo, stats, testimonials wall, FAQ, newsletter), templates gallery, blog, about/contact/feedback; AdSense slots on blog/marketing only; Premium upgrade flow; PWA manifest + installable.
**Exit:** full marketing site, both monetization paths live, PWA installable, SEO solid.

## Phase 8 (later) — React Native (Expo)
Reuse tRPC/REST API + design tokens; couple app (builder-lite + dashboard) and/or guest app. Out of scope for web-first delivery; API is already mobile-ready.

---

## Cross-cutting workstreams (run throughout)
- **Testing:** Vitest (units, Zod schemas, entitlements), Playwright (E2E: OTP→build→pay→publish→RSVP→export), visual regression on each template (preview==live), webhook idempotency tests, AI output schema-validation tests with fixture cards.
- **Security/privacy:** encrypt phone PII, owner-scoped authZ on every query, signed URLs for exports/uploads, webhook signature verification, rate limits, DPDP-friendly data export/delete (Phase 4+).
- **Performance:** SSG/SSR, image optimization, lazy interactions, Lighthouse budget for guest invite on slow 3G.
- **Observability:** Sentry, structured logs, first-party analytics table + GA4, AI cost/usage dashboard.

---

## Environment config (`.env`) — see `scaffold/.env.example`
`DATABASE_URL` · `REDIS_URL` · `AUTH_SECRET` · `MSG91_KEY` · `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` · `WHATSAPP_TOKEN/PHONE_ID` · `R2_*` · `RESEND_KEY` · `LLM_PROVIDER`/`ANTHROPIC_API_KEY` · `NEXT_PUBLIC_GA_ID` · `NEXT_PUBLIC_BRAND_DOMAIN` · feature flags `AI_INTAKE_ENABLED`/`ADS_ENABLED`/`SUBSCRIPTIONS_ENABLED`.

---

## Suggested team sequencing (if parallelizing)
1. One dev on **template engine + renderer** (unblocks everything visual).
2. One on **data/API/auth/payments** (the contracts).
3. Converge on builder (Phase 2), then split guest vs dashboard (Phases 3/4).
4. AI layer (Phase 6) after the schema is stable — it targets the same schema.
