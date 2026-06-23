# 01 — Architecture & Tech Stack

All version/vendor facts below were verified against current sources (June 2026). See "Why" notes.

---

## 1. Tech stack decisions (the full list you asked for)

| Layer | Choice | Why (verified June 2026) |
|---|---|---|
| **Web frontend** | **Next.js 16** (App Router) + **React 19.2** + **TypeScript** | Current stable is 16.x; App Router uses React 19.2, React Compiler is stable (auto-memoization), Cache Components (`use cache`) for fast invite pages. SSR/SSG = SEO + fast first paint on slow Indian networks (explicitly praised in ShaadiOra testimonials). |
| **Styling** | **Tailwind CSS v4** + CSS variables (design tokens) | Token-driven theming; per-template palettes via CSS vars. |
| **Animation** | **Framer Motion** (UI/section reveals) + **GSAP** (cinematic signature interactions: dhol, kolam, jharokha, houseboat) + **Lottie** (complex per-template motion) | Matches ShaadiOra's cinematic differentiator; GSAP ScrollTrigger for scroll-driven scenes. |
| **State (client)** | **Zustand** for builder editor state + **TanStack Query** for server cache | Builder is a long-lived editor; Zustand is light, Query handles autosave/sync + dashboard data. |
| **Forms/validation** | **React Hook Form** + **Zod** (shared client+server schemas) | One schema validates the invitation JSON on both sides (and AI output — doc 04). |
| **Backend/API** | **Next.js Route Handlers** + **tRPC** for app surface; **plain REST** for webhooks & public guest endpoints | Modular monolith; tRPC gives end-to-end types for builder/dashboard; REST where external callers (Razorpay, WhatsApp, guests) need stable contracts. Can split into a NestJS service later without changing the data model. |
| **ORM / DB** | **Prisma** + **PostgreSQL** (Neon serverless in prod) | Relational fits couples/guests/RSVPs/payments cleanly. |
| **Cache / rate-limit / counters** | **Redis** (Upstash) | Slug-availability cache, view counters, OTP throttling, rate limiting. |
| **Auth** | **Phone-OTP** via **MSG91** (primary, India-first) or Twilio Verify (fallback); sessions via **Auth.js (NextAuth)** with JWT + httpOnly cookie | Matches current phone login. OTP delivered over SMS + optional WhatsApp (cheaper in India). |
| **Object storage / CDN** | **Cloudflare R2** (S3-compatible) + **Cloudflare CDN**; **Next/Image** + on-the-fly optimization | Gallery images, audio tracks, exported PDFs, uploaded invitation cards. R2 = no egress fees. |
| **Payments — one-time** | **Razorpay Orders API** (publish fee per template) | India-first, UPI. Use **UPI Intent / Dynamic QR** (NPCI sunset UPI Collect on 28 Feb 2026). Webhook-driven entitlement. |
| **Payments — subscription (Premium)** | **Razorpay Subscriptions + UPI Autopay / card eMandate** | Recurring Premium tier; mandate mapped to customer+plan. |
| **Analytics** | **GA4** via `@next/third-parties/google` (`<GoogleAnalytics>` in root layout) + server-side custom events table | Official Next.js integration, auto pageview on client nav; we also persist first-party `AnalyticsEvent` rows to power dashboard "Total Views" independent of GA. |
| **Product analytics (optional)** | PostHog (self-host or cloud) | Funnels for intake/builder drop-off; can defer to Phase 6+. |
| **Ads** | **Google AdSense** on **blog + non-converting marketing pages only**; **vendor lead-gen / affiliate** ("Free Quotes") as the primary monetizable surface in the Wedding Report | Keep builder, guest invites, and dashboard **ad-free** to protect the premium feel; ads live where content traffic is. Vendor quotes are higher-value than display ads. |
| **AI layer** | **Server-side LLM gateway** (Anthropic Claude as primary, provider-abstracted). Claude **vision** for invitation-card extraction; text models for report, copy, personality tags | Vision-language models read ornate, multilingual cards end-to-end (no separate OCR+layout pipeline). Provider abstraction lets us swap/fallback. **Never call the model from the client.** |
| **Notifications** | **WhatsApp Business Cloud API** (share, RSVP confirmations, OTP, support) + **email** (Resend) for receipts | Per-message template pricing; in India utility/auth templates are very cheap (~$0.01). |
| **Background jobs / queue** | **Inngest** (or BullMQ on Redis) | AI generation, PDF export, WhatsApp sends, image processing run async with retries. |
| **PDF export** | **Playwright** (render report/invite to PDF server-side) | Pixel-faithful exports of the Wedding Report. |
| **Search (city picker)** | Static dataset (Indian cities + states) shipped as JSON, fuzzy-matched client-side; upgrade to Postgres `pg_trgm` if needed | The report/intake city picker. |
| **Hosting** | **Vercel** (web) + **Neon** (Postgres) + **Upstash** (Redis) + **Cloudflare R2/CDN** + **Inngest** | Or consolidate on AWS later. |
| **Mobile (later)** | **PWA** now (installable, offline-friendly invites) → **React Native (Expo)** sharing the tRPC/REST API + design tokens | Per locked decision. |
| **CI/CD** | GitHub Actions → Vercel previews; Prisma migrate on deploy | |
| **Error monitoring** | Sentry (web + server) | |

### Theme system (your "theme" ask)
Two distinct concepts, kept separate:
- **Brand theme** — product-level look (doc 00 §2, `brand.theme`). One per deployment.
- **Template themes** — per-template palette/motifs/fonts/audio, defined in each template's config (doc 06). The published invite and builder preview both read template theme tokens via CSS variables, so there is **one source of truth and no drift**.
- **Light/dark:** invites are dark-cinematic by design; the **dashboard and builder chrome** support light/dark via `prefers-color-scheme` + a toggle.

---

## 2. System architecture (high level)

```
                         ┌─────────────────────────────────────────────┐
                         │                Clients                       │
                         │  Web (Next.js SSR/SSG)  ·  PWA  ·  RN (later)│
                         └───────────────┬─────────────────────────────┘
                                         │ HTTPS (tRPC + REST)
                 ┌───────────────────────┼───────────────────────────────┐
                 │              Next.js App (Vercel)                       │
                 │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │
                 │  │ Marketing/   │  │  Builder       │  │ Guest invite │ │
                 │  │ SEO (SSG)    │  │ (client+tRPC)  │  │  /<slug> SSR │ │
                 │  └──────────────┘  └───────────────┘  └──────────────┘ │
                 │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │
                 │  │ Dashboard    │  │ Wedding Report │  │ AI Intake    │ │
                 │  └──────────────┘  └───────────────┘  └──────────────┘ │
                 │  ── Route Handlers / tRPC routers / REST webhooks ──   │
                 └───┬─────────┬─────────┬─────────┬──────────┬──────────┘
                     │         │         │         │          │
            ┌────────▼──┐ ┌────▼────┐ ┌──▼─────┐ ┌─▼───────┐ ┌▼───────────────┐
            │ Postgres  │ │ Redis   │ │ R2 +   │ │ AI      │ │ External APIs  │
            │ (Prisma)  │ │(Upstash)│ │ CDN    │ │ Gateway │ │ Razorpay /     │
            │           │ │         │ │        │ │(server) │ │ WhatsApp /     │
            └───────────┘ └─────────┘ └────────┘ └────┬────┘ │ MSG91 / Resend │
                                                      │      └────────────────┘
                                              ┌───────▼────────┐
                                              │ LLM provider   │
                                              │ (Claude, etc.) │
                                              └────────────────┘

       Async work (AI draft, PDF, WhatsApp, image opt) ── Inngest queue ──┘
```

### Request patterns
- **Guest invite `/<slug>`** → SSR with aggressive caching (`use cache` + Redis slug map + CDN). View event written async (fire-and-forget to queue) so guest pages stay fast.
- **Builder** → client app; field edits update Zustand + local draft; debounced autosave → tRPC → Postgres; "Unsaved Cloud Changes" guard compares local vs server revision.
- **AI intake / report / OCR** → client uploads/answers → tRPC → enqueue Inngest job → LLM gateway → validate against Zod schema → persist → stream/poll result to client.
- **Payments** → client creates Razorpay order/subscription via tRPC → Razorpay → **webhook (REST)** flips `paymentStatus`/entitlement (source of truth is the webhook, never the client callback).

---

## 3. Architectural principles

1. **One renderer, two surfaces.** The same React template renderer powers the builder live-preview and the published invite — no divergence. (Doc 06.)
2. **Template = plugin.** Adding a template never touches core (config + schema + renderer + interactions + assets). (Doc 06.)
3. **The invitation is one normalized document.** The builder edits a single `Invitation` + typed child records (doc 02); the renderer is a pure function of that data.
4. **AI populates the schema, humans confirm.** Every AI-generated field is editable and regenerable; AI output is validated against the same Zod schema as manual input. (Doc 04.)
5. **Server-side AI only.** No model keys or prompts on the client.
6. **Entitlements, not feature flags scattered.** A single `entitlements` resolver answers "can this user publish / use Premium / remove ads / use custom domain" from `Payment` + `Subscription`. (Doc 02/03.)
7. **Brand-agnostic & theme-tokenized.** (Doc 00 §2, Doc 06.)
8. **Fast on slow networks.** SSG/SSR, image optimization, code-split per-template interactions (lazy-loaded), minimal JS on guest pages.

---

## 4. Environments & config

- **Environments:** `local` → `preview` (per-PR Vercel) → `staging` → `production`.
- **Secrets:** Razorpay, WhatsApp, MSG91, LLM keys, R2, Resend — all server-side env (see `scaffold/.env.example`).
- **Feature flags:** simple env/DB-backed flags for `AI_INTAKE_ENABLED`, `ADS_ENABLED`, `SUBSCRIPTIONS_ENABLED` so features can ship dark.

Sources: [Next.js 16](https://nextjs.org/blog/next-16) · [Razorpay Subscriptions](https://razorpay.com/subscriptions/) · [NPCI UPI Collect sunset](https://razorpay.com/blog/master-recurring-payments-upi-autopay-guide/) · [GA4 with @next/third-parties](https://nextjs.org/docs/app/guides/third-party-libraries) · [Claude Vision for documents](https://getstream.io/blog/anthropic-claude-visual-reasoning/) · [WhatsApp Business pricing 2026](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
