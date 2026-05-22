# Story 8.1: Add Evidence Pack Export History Persistence

Status: done

## Story

As an AQA,
I want successful evidence pack exports to be persisted,
so that downloaded audit artifacts leave a durable history record.

## Acceptance Criteria

1. Given a JSON evidence pack export succeeds, when the route responds, then an export history record is saved with organization, snapshot, schema version, filename, content type and payload metadata.
2. Given a Markdown evidence pack export succeeds, when the route responds, then the same evidence pack payload and Markdown body are saved as a Markdown export record.
3. Given persistence fails, when the export route is called, then the route redirects with fail-closed copy and no successful download is implied.

## Tasks / Subtasks

- [x] Add export history persistence model (AC: 1, 2)
  - [x] Add Prisma enum/table and migration for Control Mirror export history.
  - [x] Add repository create/list helpers with mandatory organization scope.
  - [x] Assert persisted records do not require raw source text.
- [x] Persist route exports through API service (AC: 1, 2, 3)
  - [x] Add API service that builds, serializes and persists JSON/Markdown exports.
  - [x] Update `/control-mirror/export` to use the persisted export service.
  - [x] Preserve existing JSON and Markdown download behavior.
- [x] Run verification
  - [x] `pnpm --filter @aas-companion/db db:generate`
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-route.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 8.1 should persist successful exports only. UI listing and re-download routes belong to later stories.

Important boundaries:

- Do not add export history UI in this story.
- Do not persist raw uploaded source text.
- Keep existing `/control-mirror/export` JSON behavior as default.
- Keep Markdown export available through `?format=markdown` and `?format=md`.

### Project Structure Notes

- Prisma schema: `packages/db/prisma/schema.prisma`
- Migration: `packages/db/prisma/migrations/*_control_mirror_evidence_pack_exports/migration.sql`
- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- Route: `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-export-route.test.ts`

### References

- [Epic 8 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-8-persisted-export-history.md)
- [Epic 7 retro](_bmad-output/implementation-artifacts/epic-7-retro-2026-05-22.md)
- [Story 7.2](_bmad-output/implementation-artifacts/7-2-add-markdown-evidence-pack-export-format.md)
- [Story 7.3](_bmad-output/implementation-artifacts/7-3-harden-export-filename-and-version-metadata.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 8 backlog.
- Started export history persistence implementation.
- `pnpm --filter @aas-companion/db db:generate` - passed.
- `pnpm build:web-runtime-packages` - initial run caught missing `organizationId` in export list select; rerun passed.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-route.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 8 tests.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added Prisma model, enum and migration for Control Mirror evidence pack export history.
- Added repository helpers to create and list tenant-scoped export records without loading payload bodies in list views.
- Added API service that builds, serializes and persists JSON/Markdown exports before returning download content.
- Updated `/control-mirror/export` to fail closed if export creation/persistence fails.
- Added route and repository tests for JSON, Markdown and persistence failure behavior.

### File List

- `_bmad-output/implementation-artifacts/8-1-add-evidence-pack-export-history-persistence.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/aas-control-mirror-epic-8-persisted-export-history.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260522103500_control_mirror_evidence_pack_exports/migration.sql`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/db/src/index.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-export-route.test.ts`

## Change Log

- 2026-05-22: Created and started Story 8.1 export history persistence.
- 2026-05-22: Added persisted evidence pack export history and route integration.
