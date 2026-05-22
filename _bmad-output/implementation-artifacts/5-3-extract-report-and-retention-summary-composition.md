# Story 5.3: Extract Report and Retention Summary Composition

Status: done

## Story

As an AQA,
I want report summary and retention summary composition isolated,
so that evidence-pack work can build on a stable report boundary.

## Acceptance Criteria

1. Given a Control Mirror dashboard is built, when report summary items render, then labels, statuses and recommended next step remain unchanged.
2. Given retained, redacted or omitted evidence exists, when retention summary is composed, then disclosure text remains unchanged.
3. Given report output is tested, when future export work starts, then it can reuse a focused report module.

## Tasks / Subtasks

- [x] Extract report helpers (AC: 1, 2, 3)
  - [x] Add a focused domain module for report summary and evidence retention summary composition.
  - [x] Preserve public exports from the existing Control Mirror domain surface where useful.
  - [x] Keep summary labels, status mapping and retention disclosure unchanged.
- [x] Update dashboard composition imports (AC: 1, 2)
  - [x] Import extracted helpers into dashboard assembly and persisted Human Review state application.
  - [x] Keep report output unchanged for existing tests.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 5.3 is a behavior-preserving refactor. Do not change report labels, retention wording, recommended next step copy or dashboard readiness behavior.

Important boundaries:

- No product-visible behavior change.
- No schema change.
- No report/export capability in this slice.
- Keep package-level import compatibility intact.

### Project Structure Notes

- Current domain engine: `packages/domain/src/control-mirror.ts`
- Proposed extracted module: `packages/domain/src/control-mirror-report.ts`
- Focused tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 5 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-5-control-mirror-modularization.md)
- [Story 5.2](_bmad-output/implementation-artifacts/5-2-extract-human-review-state-and-stable-finding-identity-helpers.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 5 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 15 tests. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Extracted report summary item composition and evidence retention summary composition into `packages/domain/src/control-mirror-report.ts`.
- `packages/domain/src/control-mirror.ts` now imports and re-exports the report helpers while preserving dashboard output behavior.
- Existing report labels, retention disclosure and Human Review state application tests remain green.

### File List

- `_bmad-output/implementation-artifacts/5-3-extract-report-and-retention-summary-composition.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror-report.ts`
- `packages/domain/src/control-mirror.ts`

## Change Log

- 2026-05-22: Started Story 5.3 report and retention summary extraction.
- 2026-05-22: Extracted Control Mirror report and retention summary composition into a focused domain module.
