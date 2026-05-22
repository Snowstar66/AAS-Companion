# Story 5.2: Extract Human Review State and Stable Finding Identity Helpers

Status: done

## Story

As a Delivery Lead,
I want Human Review state and stable finding identity logic isolated,
so that reconciliation behavior stays testable as Control Mirror findings evolve.

## Acceptance Criteria

1. Given existing review items, when state summary runs, then open/decided/deferred/superseded counts remain unchanged.
2. Given uploaded snapshot findings refresh, when stable keys are derived, then matching findings preserve identity.
3. Given persisted decisions exist, when dashboard state is applied, then latest decision and blocking state remain unchanged.

## Tasks / Subtasks

- [x] Extract Human Review helpers (AC: 1, 2, 3)
  - [x] Add a focused domain module for Human Review item types, state summary and stable finding key helpers.
  - [x] Preserve public exports from the existing Control Mirror domain surface.
  - [x] Keep review href, default rationale copy and state defaults unchanged.
- [x] Reuse stable identity in queue persistence (AC: 2, 3)
  - [x] Update the Human Review queue repository to use the domain stable key helper.
  - [x] Keep persisted decision merge behavior unchanged.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-human-review-queue.test.ts src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 5.2 is a behavior-preserving refactor. Do not change Human Review generated copy, stable key semantics, persisted decision states or dashboard readiness behavior.

Important boundaries:

- No schema change.
- No new review workflow capability.
- Stable finding keys must remain identical for existing fixtures.
- Keep package-level import compatibility intact.

### Project Structure Notes

- Current domain engine: `packages/domain/src/control-mirror.ts`
- Proposed extracted module: `packages/domain/src/control-mirror-human-review.ts`
- Queue persistence: `packages/db/src/repositories/control-mirror-human-review-repository.ts`
- Focused tests: `apps/web/src/test/control-mirror-human-review-queue.test.ts`, `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 5 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-5-control-mirror-modularization.md)
- [Story 5.1](_bmad-output/implementation-artifacts/5-1-extract-source-policy-and-uploaded-snapshot-domain-helpers.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 5 backlog.
- `pnpm build:web-runtime-packages` - initial run caught a DB index re-export compatibility issue; after preserving the repository re-export, rerun passed.
- `pnpm test -- src/test/control-mirror-human-review-queue.test.ts src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 27 tests. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Extracted Human Review item types, state summary, review href enrichment and stable finding key generation into `packages/domain/src/control-mirror-human-review.ts`.
- `packages/domain/src/control-mirror.ts` now imports and re-exports the Human Review helpers to preserve package-level compatibility.
- Human Review queue persistence now reuses the domain stable finding key helper while preserving the existing DB export surface.
- Existing persisted decision merge, uploaded snapshot stable identity and dashboard state tests remain green.

### File List

- `_bmad-output/implementation-artifacts/5-2-extract-human-review-state-and-stable-finding-identity-helpers.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror-human-review.ts`
- `packages/domain/src/control-mirror.ts`
- `packages/db/src/repositories/control-mirror-human-review-repository.ts`

## Change Log

- 2026-05-22: Started Story 5.2 Human Review helper extraction.
- 2026-05-22: Extracted Control Mirror Human Review state and stable finding identity helpers into a focused domain module.
