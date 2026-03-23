# Codex-Ready Task Pack — M1-STORY-001 to M1-STORY-003

This file is the direct execution pack for the first implementation step.

## Operating rule
The AI build role must:
- work one story at a time
- not redefine scope
- not invent governance
- not continue past M1-STORY-003 without human review
- report changed files, tests, deviations and open questions

---

# M1-STORY-001

## Summary
Scaffold the monorepo, app shell and shared foundations so the system can run locally and support feature work.

## Deliverables
- pnpm workspace
- Next.js app in `apps/web`
- shared packages: `ui`, `domain`, `db`, `api`, `telemetry`, `config`
- TypeScript strict setup
- Tailwind configured
- shadcn/ui configured
- common scripts for lint, typecheck and test
- `.env.example`
- root `README.md`

## File targets

```text
/package.json
/pnpm-workspace.yaml
/.gitignore
/.editorconfig
/.npmrc
/README.md
/.env.example
/apps/web/package.json
/apps/web/next.config.ts
/apps/web/tsconfig.json
/apps/web/src/app/layout.tsx
/apps/web/src/app/page.tsx
/apps/web/src/app/globals.css
/apps/web/src/components/layout/app-shell.tsx
/apps/web/src/components/layout/topbar.tsx
/apps/web/src/components/layout/sidebar.tsx
/apps/web/src/components/layout/right-rail.tsx
/packages/ui/package.json
/packages/ui/src/index.ts
/packages/domain/package.json
/packages/domain/src/index.ts
/packages/db/package.json
/packages/db/src/index.ts
/packages/api/package.json
/packages/api/src/index.ts
/packages/telemetry/package.json
/packages/telemetry/src/index.ts
/packages/config/package.json
/packages/config/src/env.ts