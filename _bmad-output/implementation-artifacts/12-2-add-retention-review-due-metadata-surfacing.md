# Story 12.2: Add Retention Review Due Metadata Surfacing

Status: done

## Story

As a governance lead,
I want exports with review dates to be visible in history,
so that audit artifacts can be reviewed before stale sharing.

## Acceptance Criteria

1. Given a retention review due date exists, when export history renders, then the due date is visible.
2. Given a retention review date has passed, when export history renders, then it is visually distinguishable as review due.
3. Given no review due date exists, when history renders, then the current no-date behavior remains compact.

## Tasks / Subtasks

- [x] Surface retention review metadata in export history UI (AC: 1, 2, 3)
  - [x] Show review due date only when `retention.reviewDueAt` exists.
  - [x] Show reviewed date only when `retention.reviewedAt` exists.
  - [x] Add a review-due tone when due date is before current render time and review has not been completed.
- [x] Add regression coverage (AC: 1, 2, 3)
  - [x] Assert review due copy renders for exports with due dates.
  - [x] Assert overdue review copy is distinguishable.
  - [x] Preserve existing compact no-date assertions.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 12.2 should only surface already-existing retention review metadata. Do not add policy scheduling, delete, restore, legal hold or date editing in this story.

Important boundaries:

- The export history API already returns `retention.reviewDueAt` and `retention.reviewedAt`.
- Keep no-date rows compact; avoid rendering `n/a` review rows for every export.
- Use deterministic date comparison during server render with `new Date()`; tests should use a date safely in the past to avoid clock brittleness.
- Retention history remains metadata-only and must not load payload bodies.

### Project Structure Notes

- UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 12 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-12-retention-policy-administration.md)
- [Story 12.1](_bmad-output/implementation-artifacts/12-1-resolve-export-audit-actor-display-names.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 12 backlog and started.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 1 file and 2 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Control Mirror export history now shows retention review due dates only when present.
- Overdue unreviewed exports render as `Review overdue`.
- Reviewed exports show reviewed timestamp.
- Added page regression assertions for review due, overdue and reviewed metadata.

### File List

- `_bmad-output/implementation-artifacts/12-2-add-retention-review-due-metadata-surfacing.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 12.2 retention review due metadata surfacing.
- 2026-05-22: Surfaced retention review due and reviewed metadata in export history.
