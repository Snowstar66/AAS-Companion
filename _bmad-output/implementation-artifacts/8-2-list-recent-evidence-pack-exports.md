# Story 8.2: List Recent Evidence Pack Exports

Status: done

## Story

As a governance reviewer,
I want to see recent Control Mirror exports,
so that I can confirm which evidence packs have already been generated.

## Acceptance Criteria

1. Given export records exist, when the Control Mirror page loads, then recent exports are listed with generated time, format, filename and snapshot id.
2. Given no export records exist, when the page loads, then the history area shows an empty state.
3. Given records exist for another organization, when the current page loads, then they are not shown.

## Tasks / Subtasks

- [x] Add API list service (AC: 1, 3)
  - [x] Call the export-history repository with the active organization id.
  - [x] Return metadata only, not full payload bodies.
- [x] Add Control Mirror page history panel (AC: 1, 2)
  - [x] Render recent exports with generated time, format, filename and snapshot id.
  - [x] Render empty state when no export records exist.
  - [x] Keep existing export action visible.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-page.test.tsx src/test/control-mirror-export-history.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 8.2 should list recent export metadata only. Re-download belongs to Story 8.3.

Important boundaries:

- Do not load full export payload bodies in the list.
- Do not add re-download links yet.
- Preserve existing dashboard and export behavior.

### Project Structure Notes

- API service: `packages/api/src/control-mirror.ts`
- Page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-page.test.tsx`, `apps/web/src/test/control-mirror-export-history.test.ts`

### References

- [Epic 8 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-8-persisted-export-history.md)
- [Story 8.1](_bmad-output/implementation-artifacts/8-1-add-evidence-pack-export-history-persistence.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 8 backlog.
- Started recent export history list implementation.
- `pnpm build:web-runtime-packages` - initial run caught an `exactOptionalPropertyTypes` issue for optional `take`; rerun passed after only passing `take` when present.
- `pnpm test -- src/test/control-mirror-page.test.tsx src/test/control-mirror-export-history.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 5 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added `listControlMirrorEvidencePackExportsService()` returning tenant-scoped export metadata.
- Added recent evidence pack exports panel to the Control Mirror report area.
- Added empty state for projects with no recorded exports.
- Updated page tests to cover populated and empty export history.

### File List

- `_bmad-output/implementation-artifacts/8-2-list-recent-evidence-pack-exports.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 8.2 recent export list.
- 2026-05-22: Added tenant-scoped recent export history list on Control Mirror.
