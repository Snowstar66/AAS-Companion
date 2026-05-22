# Story 11.1: Add Export Retention State Metadata

Status: done

## Story

As a governance operator,
I want persisted evidence pack exports to show retention state,
so that saved audit artifacts can be managed deliberately.

## Acceptance Criteria

1. Given a new export is persisted, when the record is stored, then retention state defaults to active with a governance audit policy label.
2. Given export history is listed, when records render, then retention state and policy label are visible without loading payload bodies.
3. Given persisted download still occurs, when a record is fetched, then stored filename/content type and payload behavior are unchanged.

## Tasks / Subtasks

- [x] Add retention metadata persistence (AC: 1, 3)
  - [x] Add retention state enum and export record fields.
  - [x] Add migration and regenerate Prisma client.
  - [x] Return retention metadata from create/list/get repository helpers.
- [x] Surface retention metadata in API and UI (AC: 2)
  - [x] Return retention fields from export history API.
  - [x] Render retention state and policy label in recent export history.
  - [x] Add page regression assertions.
- [x] Run verification
  - [x] `pnpm --filter @aas-companion/db db:generate`
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-download-service.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 11.1 should only add metadata and display it. Do not add archive/delete actions or re-download audit events yet.

Important boundaries:

- Default state is `active`.
- Default policy label is `governance_audit_artifact`.
- History list must remain metadata-only and must not load payload bodies.
- Existing persisted download response body, filename and content type must remain stable.

### Project Structure Notes

- Prisma schema: `packages/db/prisma/schema.prisma`
- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-export-download-service.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 11 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-11-export-retention-governance.md)
- [Epic 10 Retro](_bmad-output/implementation-artifacts/epic-10-retro-2026-05-22.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 11 first slice and started.
- `pnpm --filter @aas-companion/db db:generate` - passed after adding retention state enum and fields.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-download-service.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 3 files and 11 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added retention state enum and retention metadata fields to persisted export records.
- New export records default to `active` and `governance_audit_artifact`.
- Repository create/list/get helpers now return retention metadata without loading payload bodies for history.
- Export history API returns retention metadata and persisted download service preserves filename/content type/body behavior.
- Control Mirror recent export history now displays retention state and policy label.
- Added repository, download service and page regression coverage.

### File List

- `_bmad-output/planning-artifacts/aas-control-mirror-epic-11-export-retention-governance.md`
- `_bmad-output/implementation-artifacts/11-1-add-export-retention-state-metadata.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260522132000_control_mirror_export_retention_state/migration.sql`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-export-download-service.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 11.1 export retention metadata.
- 2026-05-22: Added persisted export retention state metadata and history display.
