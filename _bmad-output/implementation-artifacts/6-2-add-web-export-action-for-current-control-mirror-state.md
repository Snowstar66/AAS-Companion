# Story 6.2: Add Web Export Action for Current Control Mirror State

Status: done

## Story

As a Delivery Lead,
I want to download the current Control Mirror evidence pack,
so that I can share audit-ready evidence with reviewers.

## Acceptance Criteria

1. Given I open Control Mirror, when the dashboard loads, then an export action is visible near the report section.
2. Given I trigger export, when the route succeeds, then a JSON evidence pack is returned for the current organization context.
3. Given export fails, when the route cannot build the pack, then the user is returned with a clear error and no successful export is implied.

## Tasks / Subtasks

- [x] Add export service and route (AC: 2, 3)
  - [x] Add an API service that builds the evidence pack for the current organization.
  - [x] Add a protected Control Mirror export route that returns JSON with download headers.
  - [x] Redirect back to Control Mirror with clear error copy on failure.
- [x] Add report export action in UI (AC: 1)
  - [x] Show a download action near the Control report preview.
  - [x] Keep retention/no-raw-source framing near the export action.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover page rendering for the export action.
  - [x] Cover evidence pack service payload behavior through the existing domain model.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-page.test.tsx src/test/control-mirror-evidence-pack.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 6.2 should add a downloadable JSON route for the evidence pack model introduced in Story 6.1. It should not add alternate export formats yet.

Important boundaries:

- Preserve organization scoping.
- Do not include raw source text.
- Export failure must fail closed and not imply a report was created.
- Keep existing dashboard behavior unchanged.

### Project Structure Notes

- API service: `packages/api/src/control-mirror.ts`
- Export route: `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- Page UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-page.test.tsx`, `apps/web/src/test/control-mirror-evidence-pack.test.ts`

### References

- [Epic 6 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-6-report-and-evidence-pack-export.md)
- [Story 6.1](_bmad-output/implementation-artifacts/6-1-add-control-mirror-evidence-pack-export-model.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 6 backlog.
- `pnpm build:web-runtime-packages` - initial run caught an `exactOptionalPropertyTypes` issue for optional `generatedAt`; rerun passed after only passing the option when present.
- `pnpm test -- src/test/control-mirror-page.test.tsx src/test/control-mirror-evidence-pack.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox caught an unsupported `toHaveAttribute` matcher; final rerun passed, 2 tests. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added `getControlMirrorEvidencePackService()` to build the evidence pack for the current organization context.
- Added protected `/control-mirror/export` route returning JSON with download headers and fail-closed redirect copy.
- Added a Control report preview download action and no-raw-source disclosure.
- Updated page/evidence-pack tests for the export action and payload behavior.

### File List

- `_bmad-output/implementation-artifacts/6-2-add-web-export-action-for-current-control-mirror-state.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `apps/web/src/test/control-mirror-evidence-pack.test.ts`

## Change Log

- 2026-05-22: Started Story 6.2 Control Mirror web export action.
- 2026-05-22: Added protected Control Mirror evidence pack JSON export route and UI download action.
