# Story 5.4: Add Module-Level Regression Coverage for Control Mirror Boundaries

Status: done

## Story

As an AQA,
I want focused tests around the extracted Control Mirror modules,
so that future feature work can change one boundary without silently breaking another.

## Acceptance Criteria

1. Given extracted modules exist, when targeted tests run, then source policy, review state and report composition have direct coverage.
2. Given dashboard integration tests run, when module extraction is complete, then no dashboard output regressions are introduced.
3. Given package exports build, when consumers import from `@aas-companion/domain`, then compatibility remains intact.

## Tasks / Subtasks

- [x] Add focused module boundary tests (AC: 1)
  - [x] Cover source policy and uploaded snapshot helper exports directly.
  - [x] Cover Human Review stable key/state helpers directly.
  - [x] Cover report and retention summary helpers directly.
- [x] Run integration and package compatibility checks (AC: 2, 3)
  - [x] Run existing Control Mirror dashboard/page tests.
  - [x] Run runtime package build.
  - [x] Run web production build.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-module-boundaries.test.ts src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 5.4 should add regression coverage only. Do not change Control Mirror behavior unless a test exposes a real regression from the extraction work.

Important boundaries:

- No new product capability.
- No schema change.
- Keep tests focused on extracted module boundaries and existing dashboard integration.

### Project Structure Notes

- Source helpers: `packages/domain/src/control-mirror-source.ts`
- Human Review helpers: `packages/domain/src/control-mirror-human-review.ts`
- Report helpers: `packages/domain/src/control-mirror-report.ts`
- Test location: `apps/web/src/test/control-mirror-module-boundaries.test.ts`

### References

- [Epic 5 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-5-control-mirror-modularization.md)
- [Story 5.3](_bmad-output/implementation-artifacts/5-3-extract-report-and-retention-summary-composition.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 5 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-module-boundaries.test.ts src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 18 tests. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added direct module boundary coverage for Control Mirror source/upload helpers, Human Review stable key/state helpers and report/retention summary helpers.
- Existing dashboard rule/page tests continue to cover integration behavior after extraction.
- Runtime package and web production builds confirm `@aas-companion/domain` export compatibility.

### File List

- `_bmad-output/implementation-artifacts/5-4-add-module-level-regression-coverage-for-control-mirror-boundaries.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/test/control-mirror-module-boundaries.test.ts`

## Change Log

- 2026-05-22: Started Story 5.4 Control Mirror module boundary regression coverage.
- 2026-05-22: Added Control Mirror module boundary regression tests.
