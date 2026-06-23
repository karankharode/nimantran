# Claude Code — Kickoff Prompts

How to run the build: **one thread per phase**, in order. Start each thread from the repo root so `CLAUDE.md` auto-loads. Don't ask it to build everything in one go — it produces better, reviewable work phase by phase.

---

## Thread 1 — Phase 0 + Phase 1 (foundations + template engine + first template)
Paste this:

> Read `CLAUDE.md` and all of `docs/` before writing any code. We are building Nimantran.
>
> Do **Phase 0** then **Phase 1** from `docs/07-implementation-roadmap.md`, and stop there for my review.
>
> **Phase 0 — Foundations:** initialize the Next.js 16 + TS app over the existing scaffold (keep `src/config/brand.ts`, `prisma/schema.prisma`, `src/templates/*`, `src/server/lib/entitlements.ts`, `.env.example`). Wire: Prisma + Postgres migration, Redis client, R2 client, Auth.js phone-OTP via MSG91, Tailwind v4 with the design tokens from `docs/05` §1, `BrandProvider`/`ThemeProvider`, GA4 via `@next/third-parties`, Inngest + Sentry setup, the feature flags in `src/config/flags.ts`. I should be able to log in by phone OTP and see an empty authenticated dashboard.
>
> **Phase 1 — Template engine + one template end-to-end:** implement the template plugin contract from `docs/06` and ship **Imperial Heritage** fully (`config.ts`, `schema.ts`, `Renderer.tsx`, a signature interaction, assets). Implement `invitation.create/get/saveAll/checkSlug/publish/unpublish` (tRPC), the slug Redis cache, and the publish entitlement gate (use Razorpay **sandbox**). The builder shell must render the template preview using the SAME renderer as the published `/<slug>` page.
>
> Constraints: follow the locked decisions and rules in `CLAUDE.md`. Do not build the Premium tier or custom domains (deferred). Keep all branding through `brand.ts`. When done, run `pnpm typecheck && pnpm lint && pnpm test`, add a Playwright E2E for: OTP login → create draft → edit Essentials → pay (sandbox) → publish → load public invite. Then summarize what you built, what's stubbed, and what I should verify.

---

## Thread 2 — Phase 2 (full builder, 10 sections)
> Read `CLAUDE.md` and `docs/`. Phases 0–1 are done. Implement **Phase 2** from `docs/07`: all 10 builder sections (`docs/05` §6), `saveSection` with the `revision` sync-guard (`docs/03`), per-section Zod schemas in `src/lib/schemas`, gallery upload to R2, two-pane live preview with mobile/desktop toggle, progress ring, autosave + "All changes saved", the "Unsaved Cloud Changes" guard modal, Clear Form, Change Template (field re-map), and the WhatsApp help button. Verify (`typecheck/lint/test` + an E2E that edits every section and confirms preview updates and local+cloud persistence). Summarize and stop for review.

---

## Thread 3 — Phase 3 (guest experience)
> ...Implement **Phase 3** (`docs/07`): published invite sections (`docs/05` §7) — countdown, events + directions + add-to-calendar (ICS), gallery, info, gifts, RSVP popup (all 3 modes + custom questions), wishes wall, soundtrack widget, WhatsApp contact; REST endpoints from `docs/03` §4; view analytics via the queue; WhatsApp utility confirmation on native RSVP. Lazy-load interactions; respect `prefers-reduced-motion`. Verify + E2E (guest views, RSVPs native, wish, directions, add-to-calendar). Summarize and stop.

---

## Thread 4 — Phase 4 (dashboard)
> ...Implement **Phase 4**: `dash.*` aggregates, guest list (search/filters), **CSV/XLSX export** to a signed R2 URL, payments history, wishes, timeline, saved report, write-a-review; Overview stats + publish panel + journey tracker + live recent RSVPs + quick actions (`docs/05` §8). Verify + E2E (RSVPs show in dashboard; export has clean columns). Summarize and stop.

---

## Thread 5 — Phase 5 (remaining templates)
> ...Implement **Phase 5**: port the remaining 7 templates + the Custom pipeline as plugins (`docs/06` §4). For each, verify preview == live and the reduced-motion fallback. Make `/templates` filters (faith + state) work. Verify + visual checks. Summarize and stop.

---

## Thread 6 — Phase 6 (AI layer: Wedding Report + AI-first card intake)
> ...Implement **Phase 6**: the server-side AI gateway (provider-abstracted, Claude primary), the Wedding Report (12-step quiz → generation → report tabs → PDF/WhatsApp/Save/Free-Quotes, `docs/03` §6), and the new **AI-first intake** (`docs/04`): card upload → vision extraction with confidence → confirm chips → quiz → full AI draft (template pick + all section copy, grounded in `content/rituals/<faith>.json`) → drop into builder; plus `ai.regenerateField` and `ai.personalityTags`. All AI output validated against the shared Zod schemas; ai-credits + rate limits. Verify with fixture invitation-card images. Summarize and stop.

---

## Thread 7 — Phase 7 (marketing site + PWA polish)
> ...Implement **Phase 7**: landing (hero w/ AI CTA, journey, report promo, stats, testimonials wall, FAQ, newsletter), templates gallery, blog (MDX), about/contact/feedback, AdSense on blog/marketing only, SEO/sitemap, PWA manifest + installable. Razorpay one-time payments to production-ready (keep Premium subscriptions deferred). Verify Lighthouse on the guest invite (slow-3G budget). Summarize.

---

## Tips for best results
- **One phase per thread.** Long threads drift; fresh threads re-load `CLAUDE.md` cleanly.
- After each thread, **review the diff and run the app** before starting the next.
- If Claude Code wants to change a contract (`schema.prisma` or `docs/03`), make it update the doc in the same commit.
- Commit at the end of each phase so you can roll back.
- Keep `.env` filled with sandbox keys early (Razorpay test mode, a dev Postgres, MSG91 test).
