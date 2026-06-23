# CLAUDE.md — Nimantran

This file is auto-loaded by Claude Code. It is the standing context for every thread. Read it fully before acting.

## What we're building
**Nimantran** — a luxury Indian wedding website + **AI-first** digital invitation builder. Exact functional replica of ShaadiOra on a clean architecture, plus a new AI-first intake that starts by reading the couple's uploaded invitation-card image. Full spec + blueprint live in `../docs/` (read these first):

- `docs/00-README-index.md` — naming + branding system + how to use the blueprint
- `docs/01-architecture-tech-stack.md` — the stack (locked)
- `docs/02-data-model.md` — data model (matches `prisma/schema.prisma`)
- `docs/03-api-spec.md` — tRPC + REST contracts
- `docs/04-ai-intake-ocr.md` — the new card-OCR/AI-intake feature
- `docs/05-ui-wireframes.md` — page layouts, components, tokens
- `docs/06-template-engine.md` — the template plugin system (core decision)
- `docs/07-implementation-roadmap.md` — phased build order (follow this)
- `docs/08-parity-review.md` — feature parity matrix

## Locked decisions — do NOT re-litigate
- Brand = **Nimantran**. Stack = **Next.js 16 + React 19 + TS**, Tailwind v4, tRPC + REST, Prisma + Postgres, Redis, phone-OTP (MSG91) + Auth.js, R2/Cloudflare, Razorpay, GA4, WhatsApp Cloud API, server-side Claude vision for OCR, Inngest jobs.
- Templates are **plugins** (`src/templates/<id>/`). One renderer powers builder preview AND published invite — they must never diverge.
- AI runs **server-side only**; all AI output is validated against shared Zod schemas.
- PWA-first; React Native is later (Phase 8).

## Deferred — NOT in scope for now (build core first)
- Premium subscription tier perks/pricing (entitlements are stubbed in `src/server/lib/entitlements.ts` — leave the resolver, don't build the paid tier UI/plans yet).
- Self-serve custom domains.
Build everything else to full working parity before touching these.

## Rules
1. **Branding:** never hardcode the product name/colors/domain. Always import from `src/config/brand.ts`. Per-template palettes come from template configs, not inline hex.
2. **Contracts:** treat `prisma/schema.prisma` (docs/02) and docs/03 as fixed contracts. If you must change them, update the doc in the same commit.
3. **Build in phase order** (docs/07). Each phase must be shippable. Don't start a later phase before the earlier one compiles, type-checks, and has its happy-path tested.
4. **Verify before done:** `pnpm typecheck && pnpm lint && pnpm test` must pass. Add a Playwright E2E for each phase's happy path.
5. Keep guest invite pages fast (SSR/SSG, lazy-load template interactions, `prefers-reduced-motion` fallback).
6. Ask before introducing a dependency not already in `package.json`.

## Commands
```
pnpm install
pnpm db:migrate      # Prisma → Postgres
pnpm dev
pnpm typecheck && pnpm lint && pnpm test
pnpm test:e2e
```

## Definition of done for a phase
Compiles + type-checks + lints clean · happy-path E2E passes · matches the relevant `docs/` contract · branding/theming go through `brand.ts` + template configs · parity items for that phase (docs/08) are checked off.
