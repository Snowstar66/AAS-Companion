# AAS Control Plane

Level 2 AAS foundation for the control plane, implemented with BMAD execution discipline and stopped at the mandatory human review point after `M1-STORY-003`.

## Story Status

Current implementation scope:
- `M1-STORY-001` scaffold and app shell
- `M1-STORY-002` auth, org context, and seeded demo workspace
- `M1-STORY-003` core schema, repositories, validators, services, and domain documentation

The repository currently includes:
- `apps/web` for the Next.js App Router frontend
- shared workspace packages for `ui`, `domain`, `db`, `api`, `telemetry`, and `config`
- strict TypeScript, Tailwind, shadcn/ui-ready primitives, Vitest, and Playwright configuration
- protected login/workspace routes with demo-safe access
- seeded demo data with 6 roles, 2 outcomes, 1 epic, 3 stories, 1 blocked tollgate, and activity events
- Prisma schema, org-scoped repositories, and service functions for M1 core objects

## Workspace

```text
apps/
  web/
packages/
  api/
  config/
  db/
  domain/
  telemetry/
  ui/
```

## Commands

```bash
pnpm install
pnpm db:generate
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm db:push
pnpm db:seed
pnpm test:e2e
```

## Environment

Copy `.env.example` to `.env.local` for app development. Supabase auth is optional for local review because demo access is enabled by default.

## Demo Access

Use `http://localhost:3000/login` and choose `Enter demo workspace`.

The seeded organization includes:
- `value_owner`
- `aida`
- `aqa`
- `architect`
- `delivery_lead`
- `builder`

Seed coverage:
- `2` outcomes
- `1` epic
- `3` stories with mixed readiness
- `1` blocked tollgate case for missing baseline
- append-only activity events

## Governance Notes

- AAS governs outcome, risk, traceability, and tollgates.
- BMAD governs execution discipline.
- Do not continue past `M1-STORY-003` without human review.
