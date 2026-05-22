# Story 9.2: Record Export Acceptance Decisions

Status: done

## Story

As a Product or Security reviewer,
I want to record an acceptance decision for a persisted export,
so that governance sharing has a named human decision.

## Acceptance Criteria

1. Given a persisted export exists, when an authorized reviewer records acceptance, then the decision is stored with actor, role, rationale and timestamp.
2. Given an export has an acceptance decision, when history is listed, then the latest decision state is visible.
3. Given a decision is missing rationale or actor, when submitted, then it fails closed.

## Tasks / Subtasks

- [x] Add acceptance decision persistence (AC: 1, 3)
  - [x] Add Prisma enum/table and migration for export acceptance decisions.
  - [x] Add tenant-scoped repository helper to record decisions.
  - [x] Reject missing actor or rationale before persistence.
- [x] Surface latest decision in export history (AC: 2)
  - [x] Include latest acceptance decision in list metadata.
  - [x] Return latest decision from API list service.
- [x] Add page action and UI (AC: 1, 2, 3)
  - [x] Add server action for recording export acceptance.
  - [x] Add compact acceptance form to recent export history rows.
  - [x] Show latest decision state in the history table.
- [x] Run verification
  - [x] `pnpm --filter @aas-companion/db db:generate`
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 9.2 should record acceptance decisions only. Do not add delete/edit lifecycle or role authorization beyond active project session yet.

Important boundaries:

- Always scope export lookup by active organization id.
- Require actor and rationale.
- Keep the evidence pack payload unchanged when recording a decision.

### Project Structure Notes

- Prisma schema: `packages/db/prisma/schema.prisma`
- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- Action/UI: `apps/web/src/app/(protected)/control-mirror/actions.ts`, `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Story 9.1](_bmad-output/implementation-artifacts/9-1-add-evidence-pack-product-security-acceptance-policy.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 9 backlog.
- Started export acceptance decision persistence.
- `pnpm --filter @aas-companion/db db:generate` - initial run caught long Prisma index names; rerun passed after explicit short index maps.
- `pnpm build:web-runtime-packages` - initial run caught transaction client typing for the acceptance recorder; rerun passed after narrowing to full Prisma client.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed after adding the new server action to the page test mock, 8 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including export routes. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added export acceptance decision enums, Prisma model and migration.
- Added tenant-scoped repository helper that validates actor/rationale and records acceptance decisions in a transaction.
- Added latest acceptance decision metadata to export history list records.
- Added API service and Control Mirror server action for recording export acceptance.
- Added compact per-export acceptance form and latest decision display in the Control Mirror history table.
- Added repository and page regression coverage.

### File List

- `_bmad-output/implementation-artifacts/9-2-record-export-acceptance-decisions.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260522111500_control_mirror_export_acceptance_decisions/migration.sql`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/db/src/index.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 9.2 export acceptance decisions.
- 2026-05-22: Added persisted Product/Security/AQA acceptance decisions for evidence pack exports.
