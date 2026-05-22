# Story 11.2: Archive Persisted Evidence Pack Exports

Status: done

## Story

As a governance operator,
I want to archive an export without deleting it,
so that stale audit artifacts are marked out of active sharing circulation while history remains intact.

## Acceptance Criteria

1. Given an active export exists, when an authorized operator archives it with rationale, then retention state becomes archived with actor, timestamp and reason.
2. Given an archived export appears in history, when it renders, then archive state and reason are visible.
3. Given an archived export is downloaded, when the response is served, then it remains available with archive disclosure.

## Tasks / Subtasks

- [x] Add archive repository/API lifecycle (AC: 1, 3)
  - [x] Add tenant-scoped archive helper that requires actor and reason.
  - [x] Add API service for archive action.
  - [x] Preserve persisted download availability for archived exports.
- [x] Add server action and UI (AC: 1, 2)
  - [x] Add archive server action with active project session.
  - [x] Add compact archive form for active exports.
  - [x] Show archived actor, timestamp and reason in history.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-retention-action.test.ts src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 11.2 should archive exports without deleting payloads or acceptance decisions.

Important boundaries:

- Archive is tenant-scoped by organization id and export id.
- Archive requires actor and reason.
- Archived exports remain downloadable.
- Do not add hard delete or restore in this story.

### Project Structure Notes

- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- Action/UI: `apps/web/src/app/(protected)/control-mirror/actions.ts`, `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-export-retention-action.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 11 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-11-export-retention-governance.md)
- [Story 11.1](_bmad-output/implementation-artifacts/11-1-add-export-retention-state-metadata.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 11 backlog and started.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-retention-action.test.ts src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 4 files and 16 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added tenant-scoped archive repository helper requiring actor and reason.
- Added archive API service and Control Mirror server action with active project session and archive authority gate.
- Active exports now show a compact archive form in recent export history.
- Archived exports show archived actor, timestamp and reason.
- Persisted download still serves archived exports with stored filename/content type/body and archive disclosure headers.
- Added repository, action, route and page regression coverage.

### File List

- `_bmad-output/implementation-artifacts/11-2-archive-persisted-evidence-pack-exports.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/db/src/index.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/app/(protected)/control-mirror/export/[exportId]/route.ts`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-export-retention-action.test.ts`
- `apps/web/src/test/control-mirror-export-download-route.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 11.2 archive persisted evidence pack exports.
- 2026-05-22: Added archive lifecycle for persisted evidence pack exports.
