# Story 12.1: Resolve Export Audit Actor Display Names

Status: done

## Story

As a governance operator,
I want export archive and re-download actors shown as readable people,
so that audit history can be reviewed without copying opaque ids.

## Acceptance Criteria

1. Given an archived export has an actor id that matches an app user, when export history renders, then the archive actor displays the user full name or email with id fallback.
2. Given a latest re-download event has an actor id that matches an app user, when export history renders, then the download actor displays the user full name or email with id fallback.
3. Given an actor id cannot be resolved, when history renders, then the existing actor id remains visible.

## Tasks / Subtasks

- [x] Add actor display metadata to export history records (AC: 1, 2, 3)
  - [x] Resolve archivedBy actor ids from AppUser in tenant-scoped export history listing.
  - [x] Resolve latest download event actor via AppUser relation.
  - [x] Preserve actor id fallback when full name/email is absent or user is missing.
- [x] Surface actor display metadata through API and UI (AC: 1, 2, 3)
  - [x] Return archive and latest download actor display labels from export history API.
  - [x] Render readable actor labels in recent export history while preserving existing ids as fallback.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 12.1 should only improve actor readability in export history. Do not add delete, restore, legal hold or policy window behavior.

Important boundaries:

- Export history must remain metadata-only and must not load payload bodies.
- Actor display should prefer `fullName`, then `email`, then raw actor id.
- Archive actor is stored as an id string on the export record; resolve it with a separate AppUser lookup.
- Latest download actor has an AppUser relation; select only display fields.
- Existing audit ids must remain available in API response for traceability.

### Project Structure Notes

- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 12 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-12-retention-policy-administration.md)
- [Epic 11 Retro](_bmad-output/implementation-artifacts/epic-11-retro-2026-05-22.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 12 plan and started.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 2 files and 14 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Export history repository now resolves archive actor ids from AppUser using full name, email and id fallback.
- Latest download event selection now includes actor display fields without loading export payload bodies.
- Export history API returns archive and latest download actor display labels while preserving raw actor ids.
- Control Mirror recent export history now renders readable archive/download actor labels.
- Added regression coverage for resolved actor labels and fallback behavior.

### File List

- `_bmad-output/planning-artifacts/aas-control-mirror-epic-12-retention-policy-administration.md`
- `_bmad-output/implementation-artifacts/12-1-resolve-export-audit-actor-display-names.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 12.1 export audit actor display names.
- 2026-05-22: Resolved readable archive and re-download actor labels in export history.
