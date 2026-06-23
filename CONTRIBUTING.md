# Contributing

## Prerequisites

- Node 22+, pnpm 9
- Postgres (local Docker/Homebrew, or Neon for remote)
- Copy `.env.example` → `.env`; fill `DATABASE_URL` and `AUTH_SECRET` at minimum

## Commands

```bash
pnpm install
pnpm db:migrate          # after schema changes
pnpm typecheck && pnpm lint && pnpm test
pnpm test:e2e            # needs DATABASE_URL; dev OTP when MSG91 unset
pnpm build               # use NODE_ENV=production if your shell sets something else
```

CI runs the same gate on push/PR (see `.github/workflows/ci.yml`).

## Conventions

- Branding only via `src/config/brand.ts` + `public/brand/*` — no hardcoded product name/colors in app code.
- Data/API contracts: `prisma/schema.prisma`, `docs/03-api-spec.md` — update docs in the same commit if you change them.
- Build in phase order: `docs/07-implementation-roadmap.md`.
- Never commit `.env`, `.pgdata*`, or secrets.

## Pull requests

1. Branch from `main`.
2. Keep scope to one phase/feature.
3. Ensure CI would pass locally.
4. No force-push to default branch.
