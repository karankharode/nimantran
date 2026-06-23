# Nimantran — Starter Scaffold

Luxury Indian wedding website + **AI-first** digital invitation builder. This scaffold pairs with the blueprint in [`../docs/`](../docs/). Build in the phase order of `docs/07-implementation-roadmap.md`.

## Quick start
```bash
pnpm install
cp .env.example .env        # fill in keys
pnpm db:migrate             # apply Prisma schema to Postgres
pnpm dev                    # http://localhost:3000
```

## Deploy (preview / staging)

**Vercel (recommended for Next.js):** import the repo, set `DATABASE_URL` (Neon Postgres), `AUTH_SECRET`, and optional `SENTRY_*` / `NEXT_PUBLIC_SENTRY_DSN`. Build command `pnpm build`, install `pnpm install`. Run `prisma migrate deploy` as a build step or one-off after first deploy. Redis (`REDIS_URL`) is optional in dev — production should use Upstash.

**Render:** Web Service, Node 22, build `pnpm install && pnpm db:generate && pnpm exec prisma migrate deploy && pnpm build`, start `pnpm start`. Add a managed Postgres instance and wire `DATABASE_URL`. Bind is automatic on `$PORT`.

CI (`.github/workflows/ci.yml`) runs typecheck, lint, unit + E2E tests, and build against a Postgres service container with dev OTP (no MSG91).

## Repository setup (personal GitHub)

This repo has **no `origin` remote** by default. Use your **personal** GitHub account — not an org/work account — when you create the remote.

1. Create an empty repo on GitHub (e.g. `github.com/YOUR_USER/vivahnimantran`) — **do not** add a README or `.gitignore` (this repo already has them).
2. Point `gh` at your personal account if needed:
   ```bash
   gh auth login          # pick your personal GitHub user
   gh auth status         # confirm login is YOUR_USER, not a work org
   ```
3. Add the remote and push (you run these — agent will not push without explicit ask):
   ```bash
   git remote add origin git@github.com:YOUR_USER/vivahnimantran.git
   git push -u origin master
   ```
   Use `main` instead of `master` if you prefer; CI listens to both branch names.

**Local checks before push:** `pnpm typecheck && pnpm lint && pnpm test` (E2E needs Postgres + `.env`).

Optional: [Trunk](https://docs.trunk.io) linters — config in `.trunk/trunk.yaml`; run `trunk check` locally.

## Branding
The entire product brand lives in **`src/config/brand.ts`** + `public/brand/*`. Rebrand = edit that one file. Never hardcode the product name, colors, or domain in components (enforced in review).

## Target folder structure
```
nimantran/
├── prisma/
│   └── schema.prisma                 # data model (docs/02) ✅ included
├── public/
│   └── brand/                        # logo, monogram, og, favicon (per brand.ts)
├── src/
│   ├── config/
│   │   ├── brand.ts                  # ✅ single source of truth for branding
│   │   └── flags.ts                  # feature flags from env
│   ├── app/                          # Next.js App Router (routes: docs/05 §2)
│   │   ├── (marketing)/              # landing, templates, blog, about, contact
│   │   ├── (auth)/login/             # phone OTP
│   │   ├── intake/                   # AI-first intake (card upload → quiz → draft)
│   │   ├── builder/[invitationId]/   # two-pane editor
│   │   ├── dashboard/                # tabs: overview/guests/wishes/timeline/payments/report/review
│   │   ├── wedding-report/           # 12-step quiz + /report?s=uuid
│   │   ├── [slug]/                   # published guest invite (SSR)
│   │   └── api/                      # REST: auth/otp, i/:slug/*, pay/*, intake/card, report/*, webhooks
│   ├── server/
│   │   ├── trpc/                     # routers: invitation, dash, intake, report, templates, auth
│   │   ├── ai/                       # provider-abstracted gateway (Claude primary) + prompts
│   │   ├── payments/                 # razorpay orders + subscriptions + webhook handler
│   │   ├── notifications/            # whatsapp + email (resend)
│   │   ├── jobs/                     # inngest functions (ocr, ai-draft, pdf, sends)
│   │   └── lib/                      # entitlements, redis, r2, db, otp, slug
│   ├── templates/                    # ✅ template plugin system (docs/06)
│   │   ├── types.ts                  # ✅ contracts
│   │   ├── registry.ts               # ✅ registry + planned lineup
│   │   └── <id>/                     # config.ts, schema.ts, Renderer.tsx, interactions/, assets/
│   ├── content/
│   │   ├── rituals/<faith>.json      # curated KB grounding AI ceremony copy (docs/04)
│   │   └── cities-in.json            # city picker dataset
│   ├── components/                   # primitives + composites (docs/05 §10)
│   ├── styles/                       # tailwind v4 + tokens (docs/05 §1)
│   └── lib/schemas/                  # shared Zod schemas (client+server, AI validation)
├── tests/                            # vitest units + playwright e2e
├── .env.example                      # ✅ included
└── package.json                      # ✅ included
```
✅ = provided in this scaffold. Everything else is to be implemented per the docs.

## Contracts to honor
- **Data model:** `prisma/schema.prisma` (docs/02)
- **API surface:** docs/03 (tRPC + REST)
- **Template plugin boundary:** `src/templates/` (docs/06) — preview must equal published.
- **AI is server-side only**, output validated against `src/lib/schemas` (docs/04).
- **Entitlements** resolve publish/Premium/ads/custom-domain from Payment + Subscription.
