# Story 10.3: Add Supersede and Revoke Acceptance Events

Status: done

## Story

As a Security reviewer,
I want to supersede or revoke a previous acceptance decision,
so that exported artifacts reflect changed risk posture without rewriting history.

## Acceptance Criteria

1. Given a reviewer records a newer decision, when readiness is computed, then the newer decision supersedes the older decision for that role.
2. Given a reviewer revokes acceptance, when readiness is computed, then the role is no longer accepted.
3. Given event history is inspected, when multiple decisions exist, then all events remain auditable.

## Tasks / Subtasks

- [x] Add revoke event type (AC: 2, 3)
  - [x] Add `revoked` to the acceptance decision enum and migration.
  - [x] Regenerate Prisma client.
  - [x] Allow the repository/API/action path to record `revoked`.
- [x] Update readiness semantics (AC: 1, 2)
  - [x] Keep latest event per role as the superseding decision.
  - [x] Treat latest `revoked` as not accepted and pending for that role.
  - [x] Preserve all event rows in history.
- [x] Run verification
  - [x] `pnpm --filter @aas-companion/db db:generate`
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-acceptance-action.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 10.3 should add revoke as an event, not mutate or delete previous acceptance decisions.

Important boundaries:

- Supersede is implicit: latest decision per role controls readiness.
- `revoked` should not be treated as `changes_requested`; it returns the role to pending/missing acceptance.
- Do not add edit/delete APIs.
- Keep tenant scoping and reviewer authority from Story 10.2.

### Project Structure Notes

- Prisma schema: `packages/db/prisma/schema.prisma`
- Migration: `packages/db/prisma/migrations`
- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API/action: `packages/api/src/control-mirror.ts`, `apps/web/src/app/(protected)/control-mirror/actions.ts`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-export-acceptance-action.test.ts`

### References

- [Story 10.1](_bmad-output/implementation-artifacts/10-1-compute-multi-role-acceptance-readiness.md)
- [Story 10.2](_bmad-output/implementation-artifacts/10-2-gate-reviewer-role-submission-by-active-user-role.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 10 backlog and started.
- `pnpm --filter @aas-companion/db db:generate` - passed after adding the `revoked` enum value.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-acceptance-action.test.ts` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 2 files and 9 tests.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added `revoked` as a persisted acceptance decision event type with migration.
- Updated repository/API/action types to record revoke events.
- Updated action form to offer `Revoked`.
- Readiness now treats the latest `revoked` event for a role as not accepted and pending again.
- Added regression coverage showing a newer revoke supersedes an older acceptance while preserving all decision events.

### File List

- `_bmad-output/implementation-artifacts/10-3-add-supersede-and-revoke-acceptance-events.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260522124500_control_mirror_acceptance_revoked_decision/migration.sql`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-export-acceptance-action.test.ts`

## Change Log

- 2026-05-22: Created and started Story 10.3 supersede and revoke acceptance events.
- 2026-05-22: Added revoke acceptance events and latest-event readiness semantics.
