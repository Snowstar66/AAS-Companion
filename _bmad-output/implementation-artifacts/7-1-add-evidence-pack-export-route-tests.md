# Story 7.1: Add Evidence Pack Export Route Tests

Status: done

## Story

As an AQA,
I want direct route-level coverage for the evidence pack export,
so that download headers, organization scoping and fail-closed redirects do not regress.

## Acceptance Criteria

1. Given an active project session and successful evidence pack service result, when the export route is called, then it returns JSON with download headers and no-store caching.
2. Given the route is called, when it builds the export, then it passes the active organization id to the evidence pack service.
3. Given the evidence pack service fails, when the export route is called, then it redirects back to Control Mirror with fail-closed error copy.

## Tasks / Subtasks

- [x] Add route-level success coverage (AC: 1, 2)
  - [x] Mock active project session and evidence pack service.
  - [x] Assert JSON response, download filename, content type and no-store cache header.
  - [x] Assert active organization id is passed to the export service.
- [x] Add route-level failure coverage (AC: 3)
  - [x] Mock failed evidence pack service result.
  - [x] Assert redirect back to `/control-mirror` with fail-closed error copy.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-route.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 7.1 should add route tests only. Do not change export behavior unless the route test exposes a real gap.

Important boundaries:

- Preserve the existing JSON export route and URL.
- Do not introduce Markdown/PDF export in this story.
- Do not include raw source text in route fixtures.
- Keep the test focused on route concerns: auth/session scope, service call, headers and redirect behavior.

### Project Structure Notes

- Export route: `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- New test: `apps/web/src/test/control-mirror-export-route.test.ts`

### References

- [Epic 7 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-7-evidence-pack-route-and-format-hardening.md)
- [Story 6.2](_bmad-output/implementation-artifacts/6-2-add-web-export-action-for-current-control-mirror-state.md)
- [Story 6.4](_bmad-output/implementation-artifacts/6-4-harden-evidence-pack-regression-coverage.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 7 backlog.
- Started route-level export regression coverage implementation.
- `pnpm test -- src/test/control-mirror-export-route.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 2 tests.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added direct route-level success coverage for `/control-mirror/export`.
- Asserted active organization id is passed to `getControlMirrorEvidencePackService`.
- Asserted JSON download headers, no-store caching and sanitized evidence-pack filename.
- Added fail-closed redirect coverage for export service failure copy.

### File List

- `_bmad-output/implementation-artifacts/7-1-add-evidence-pack-export-route-tests.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/aas-control-mirror-epic-7-evidence-pack-route-and-format-hardening.md`
- `apps/web/src/test/control-mirror-export-route.test.ts`

## Change Log

- 2026-05-22: Created Story 7.1 route-level export regression coverage.
- 2026-05-22: Started Story 7.1 implementation.
- 2026-05-22: Added route-level evidence pack export tests and completed verification.
