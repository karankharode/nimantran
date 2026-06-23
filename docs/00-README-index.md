# Nimantran — Product Blueprint (Master Index)

*Prepared for: Karan · Date: 23 June 2026*
*Source of truth for the rebuild of ShaadiOra on a clean architecture, branded as **Nimantran**.*

---

## What this is

This `docs/` set + `scaffold/` directory is a **production-ready blueprint** to be handed to Claude Code. It is an exact functional replica of ShaadiOra (per the uploaded spec) on a modern, modular architecture, plus one headline new feature: an **AI-first intake that starts by reading the couple's uploaded invitation card image**.

Read the documents in order:

| # | Document | What it covers |
|---|---|---|
| 00 | **README-index** (this file) | Naming, branding system, how to use this blueprint |
| 01 | [Architecture & Tech Stack](01-architecture-tech-stack.md) | Full stack decisions (web, mobile, backend, frontend, GA4, ads, payments, subscription, theming), system diagram, principles |
| 02 | [Data Model](02-data-model.md) | All entities, relationships, Prisma schema |
| 03 | [API Spec](03-api-spec.md) | Every endpoint: auth, builder, guest invite, dashboard, AI report, AI intake/OCR, payments, webhooks |
| 04 | [AI Intake & Card OCR](04-ai-intake-ocr.md) | The new feature: card image → extracted draft → low-resistance suggestion flow |
| 05 | [UI Layouts & Wireframes](05-ui-wireframes.md) | Page-by-page layout structures, text wireframes, component inventory, design tokens |
| 06 | [Template Engine](06-template-engine.md) | The plugin-based template system (the most important rebuild decision) |
| 07 | [Implementation Plan & Roadmap](07-implementation-roadmap.md) | Phased frontend + backend build plan, env/config, testing |
| 08 | [Parity Checklist & Review](08-parity-review.md) | Feature-parity matrix vs ShaadiOra + readiness review + gaps |

A runnable **starter scaffold** lives in [`../scaffold/`](../scaffold/) (Next.js 16 + Prisma + centralized branding config).

---

## 1. The name: **Nimantran**

**Nimantran** (निमंत्रण) means *invitation* in Hindi/Sanskrit. It is classical, pan-Indian, instantly meaningful, and easy to say and write.

- **Wordmark:** Nimantran
- **Sanskrit/Devanagari lockup:** निमंत्रण
- **Tagline options:** "An Invitation They'll Never Forget" · "Your wedding, beautifully invited."
- **Suggested domains (to verify/secure):** `nimantran.app`, `nimantran.in`, `getnimantran.com`, `nimantran.co`. The published-invite pattern stays `<brand-domain>/<slug>`.

### Brand-agnostic by design

The codebase **never hardcodes the name**. A single config object drives every visible string, color, and asset. Renaming = editing one file (`scaffold/src/config/brand.ts`). See §2.

---

## 2. Centralized branding system (rebrand = one file)

All brand-dependent values live in **`src/config/brand.ts`**. Components import `brand`, never literals.

```ts
// src/config/brand.ts  — the ONLY place the product name/colors live
export const brand = {
  name: "Nimantran",
  legalName: "Nimantran Technologies",
  nameDevanagari: "निमंत्रण",
  tagline: "An Invitation They'll Never Forget",
  domain: process.env.NEXT_PUBLIC_BRAND_DOMAIN ?? "nimantran.app",
  inviteUrlPattern: (slug: string) =>
    `${process.env.NEXT_PUBLIC_BRAND_DOMAIN ?? "nimantran.app"}/${slug}`,
  email: { support: "help@nimantran.app", noreply: "no-reply@nimantran.app" },
  social: { instagram: "", youtube: "", whatsapp: "" },
  // visual tokens that are brand-level (templates override per-theme)
  theme: {
    colorBg: "#0a0a0a", colorGold: "#c9a24b", colorMaroon: "#7a1f2b",
    fontDisplay: "'Cormorant Garamond', serif", fontUI: "'Inter', sans-serif",
  },
} as const;
export type Brand = typeof brand;
```

**Rules enforced in review:**
1. No component, email template, or metadata string contains the literal "Nimantran" — always `brand.name`.
2. Colors/fonts at brand level come from `brand.theme`; per-template palettes come from the template config (see doc 06), never inline hex.
3. Domain is env-driven so staging/prod/white-label differ without code changes.
4. The favicon, OG image, manifest name, and email logo all resolve from `brand` + `/public/brand/*` assets.

This makes the product trivially re-skinnable (rename, or even white-label per region) later.

---

## 3. Decisions locked with Karan (23 Jun 2026)

| Decision | Choice |
|---|---|
| **Brand name** | Nimantran |
| **Monetization** | Both: one-time per-template publish fee **and** a Premium subscription tier (entitlement-modeled) |
| **Mobile** | PWA first (from the Next.js web app), then React Native (Expo) sharing API + tokens |
| **Deliverable** | Full multi-file blueprint + starter scaffold |
| **New headline feature** | AI-first intake beginning with **invitation-card image upload + vision extraction**, then low-resistance suggestions for the rest |

---

## 4. How Claude Code should use this

1. Start from `scaffold/` (already structured). Run `pnpm install`, set `.env` from `.env.example`.
2. Implement in the phase order of doc 07. Each phase maps to parity items in doc 08.
3. Treat doc 02 (Prisma) and doc 03 (API) as contracts. Treat doc 06 (template engine) as the core extensibility boundary.
4. Keep all branding through `brand.ts` (doc 00 §2) and all theming through template configs (doc 06).
