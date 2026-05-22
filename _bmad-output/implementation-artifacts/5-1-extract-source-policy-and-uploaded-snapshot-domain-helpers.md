# Story 5.1: Extract Source Policy and Uploaded Snapshot Domain Helpers

Status: done

## Story

As an AI Delivery Architect,
I want source policy, uploaded snapshot validation and retention helpers moved into a focused domain module,
so that future upload or source-mode changes do not require editing the full Control Mirror dashboard engine.

## Acceptance Criteria

1. Given existing imports from `@aas-companion/domain`, when tests build, then source policy, uploaded snapshot and retention exports remain available.
2. Given uploaded snapshot validation runs, when existing guardrail tests execute, then accepted, rejected and unreadable behavior is unchanged.
3. Given Control Mirror dashboard builds evidence, when existing rule/page tests execute, then retention disclosure and source policy output are unchanged.

## Tasks / Subtasks

- [x] Extract source/upload helpers (AC: 1, 2, 3)
  - [x] Add a focused domain module for source policy, uploaded snapshot validation and retention policy.
  - [x] Preserve public exports from the existing Control Mirror domain surface.
  - [x] Keep behavior unchanged for allowed extensions, path normalization, unreadable files and retention disclosure.
- [x] Update imports and package compatibility (AC: 1)
  - [x] Import extracted helpers into dashboard assembly where needed.
  - [x] Confirm `@aas-companion/domain` consumers still compile.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-uploaded-snapshot-guardrails.test.ts src/test/control-mirror-uploaded-snapshot-adapter.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 5.1 is a behavior-preserving refactor. Do not change source policy copy, upload limits, validation semantics, retention disclosure or UI behavior in this slice.

Important boundaries:

- No product-visible behavior change.
- No schema change.
- No new upload capability.
- Keep package-level import compatibility intact.

### Project Structure Notes

- Current domain engine: `packages/domain/src/control-mirror.ts`
- Proposed extracted module: `packages/domain/src/control-mirror-source.ts`
- Focused tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`, `apps/web/src/test/control-mirror-uploaded-snapshot-adapter.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 5 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-5-control-mirror-modularization.md)
- [Epic 4 retrospective](_bmad-output/implementation-artifacts/epic-4-retro-2026-05-22.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 5 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-uploaded-snapshot-guardrails.test.ts src/test/control-mirror-uploaded-snapshot-adapter.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 24 tests. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Extracted source policy, uploaded snapshot validation and retention/redaction helpers into `packages/domain/src/control-mirror-source.ts`.
- `packages/domain/src/control-mirror.ts` now imports the helpers for dashboard assembly and re-exports the same public source/upload/retention API.
- Existing upload guardrails, adapter behavior, page rendering and production build remain green.

### File List

- `_bmad-output/implementation-artifacts/5-1-extract-source-policy-and-uploaded-snapshot-domain-helpers.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/aas-control-mirror-epic-5-control-mirror-modularization.md`
- `packages/domain/src/control-mirror-source.ts`
- `packages/domain/src/control-mirror.ts`

## Change Log

- 2026-05-22: Started Story 5.1 Control Mirror source/upload helper extraction.
- 2026-05-22: Extracted Control Mirror source/upload/retention helpers into a focused domain module.
