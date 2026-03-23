# M1-STORY-001

## Title
Scaffold monorepo and app shell

## Story Type
Feature

## Value Intent
Establish a runnable, typed foundation for the AAS Control Plane so the team can start structured implementation.

## Summary
Scaffold the monorepo, app shell and shared foundations so the system can run locally and support feature work.

## Acceptance Criteria
- pnpm workspace is configured
- Next.js app exists in `apps/web`
- shared packages exist for `ui`, `domain`, `db`, `api`, `telemetry`, `config`
- TypeScript strict mode is enabled
- Tailwind is configured
- shadcn/ui is configured
- root scripts exist for `dev`, `build`, `lint`, `typecheck`, `test`
- `.env.example` exists
- root `README.md` exists with boot instructions
- app shell renders with topbar, sidebar and right rail
- `/` route renders a placeholder start page inside the shell

## AI Usage Scope
- CODE
- TEST
- CONTENT

## Test Definition
- smoke
- unit

## Definition of Done
- repository installs with one command
- app starts locally
- shell renders in browser
- lint passes
- typecheck passes
- at least one minimal test passes
- workspace structure is clear enough for later stories

## Scope In
- monorepo setup
- package manager setup
- Next.js app bootstrap
- app shell
- shared package entry points
- environment schema
- root scripts

## Scope Out
- feature-specific domain logic
- auth implementation
- database modeling
- business workflows

## File Targets
- `/package.json`
- `/pnpm-workspace.yaml`
- `/.gitignore`
- `/.editorconfig`
- `/.npmrc`
- `/README.md`
- `/.env.example`
- `/apps/web/package.json`
- `/apps/web/next.config.ts`
- `/apps/web/tsconfig.json`
- `/apps/web/src/app/layout.tsx`
- `/apps/web/src/app/page.tsx`
- `/apps/web/src/app/globals.css`
- `/apps/web/src/components/layout/app-shell.tsx`
- `/apps/web/src/components/layout/topbar.tsx`
- `/apps/web/src/components/layout/sidebar.tsx`
- `/apps/web/src/components/layout/right-rail.tsx`
- `/packages/ui/package.json`
- `/packages/ui/src/index.ts`
- `/packages/domain/package.json`
- `/packages/domain/src/index.ts`
- `/packages/db/package.json`
- `/packages/db/src/index.ts`
- `/packages/api/package.json`
- `/packages/api/src/index.ts`
- `/packages/telemetry/package.json`
- `/packages/telemetry/src/index.ts`
- `/packages/config/package.json`
- `/packages/config/src/env.ts`

## Constraints
- no business logic in shell components
- no fake business state outside explicit placeholders
- imports/workspace references must be consistent
- layout must support later route expansion without rewrite

## Required Evidence
- list of created files
- boot commands
- lint result
- typecheck result
- test result
- short description of rendered shell