# Story 11.3: Audit Persisted Export Re-Downloads

Status: done

## Story

As a governance lead,
I want re-downloads of persisted evidence packs to be logged,
so that audit artifacts have access traceability.

## Acceptance Criteria

1. Given a persisted export is downloaded, when the route succeeds, then a re-download event is recorded with actor and timestamp.
2. Given download fails or export is missing, when the route redirects, then no success event is recorded.
3. Given export history renders, when re-download events exist, then last download metadata is visible.

## Tasks / Subtasks

- [x] Add re-download audit persistence (AC: 1, 2)
  - [x] Add download event table and migration.
  - [x] Add tenant-scoped repository helper requiring actor.
  - [x] Add API service for successful re-download audit events.
- [x] Wire route and history display (AC: 1, 2, 3)
  - [x] Record event after persisted export lookup succeeds and before file response is returned.
  - [x] Do not record event on missing/failed download.
  - [x] Show latest download actor/timestamp in export history.
- [x] Run verification
  - [x] `pnpm --filter @aas-companion/db db:generate`
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 11.3 should add re-download audit events only. Do not add archive/delete/restore changes in this story.

Important boundaries:

- Record only successful persisted export downloads.
- Fail closed if a successful download cannot be audited.
- Keep tenant scoping on export lookup and audit event creation.
- History list must remain metadata-only and must not load payload bodies.

### Project Structure Notes

- Prisma schema: `packages/db/prisma/schema.prisma`
- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- Route/UI: `apps/web/src/app/(protected)/control-mirror/export/[exportId]/route.ts`, `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-export-download-route.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 11 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-11-export-retention-governance.md)
- [Story 11.2](_bmad-output/implementation-artifacts/11-2-archive-persisted-evidence-pack-exports.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 11 backlog and started.
- `pnpm --filter @aas-companion/db db:generate` - passed.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 3 files and 17 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.
- `pnpm test` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox still has unrelated pre-existing failures in `src/test/smoke.test.tsx` (`storyIdeaStats.framingReady`) and `src/test/outcome-workspace-page.test.tsx` (missing `AI review framing` button). Control Mirror page test timeout under full parallel load was adjusted and the targeted Control Mirror suite passed again.

### Completion Notes List

- Added persisted re-download audit events linked to organization, export and human actor.
- Added tenant-scoped repository and API helpers that fail closed when actor or export scope is invalid.
- Persisted export download route now records a successful audit event before returning the file response.
- Missing exports and audit failures redirect without serving the file; missing exports do not create audit events.
- Recent export history now shows latest re-download actor/timestamp or an explicit no re-downloads state.
- Added repository, route and page regression coverage for successful audit, no-audit-on-missing, audit fail-closed redirect and visible latest download metadata.

### File List

- `_bmad-output/implementation-artifacts/11-3-audit-persisted-export-re-downloads.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260522140500_control_mirror_export_download_events/migration.sql`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/db/src/index.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/export/[exportId]/route.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-export-download-route.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 11.3 persisted export re-download audit events.
- 2026-05-22: Added audited persisted export re-download events and latest-download history metadata.
