# Story 6.4: Harden Evidence Pack Regression Coverage

Status: done

## Story

As an AQA,
I want focused export tests,
so that future report changes do not leak raw source text or drop required audit fields.

## Acceptance Criteria

1. Given a dashboard with redacted evidence, when export tests run, then raw source text is not serialized.
2. Given Human Review decisions exist, when export tests run, then decision state and latest rationale are preserved.
3. Given the web export action renders, when page tests run, then export guidance and failure states remain covered.

## Tasks / Subtasks

- [x] Harden evidence pack tests (AC: 1, 2)
  - [x] Assert export serialization omits raw content/excerpt fields.
  - [x] Assert latest Human Review decision state and rationale are preserved.
- [x] Harden page tests (AC: 3)
  - [x] Cover export guidance.
  - [x] Cover fail-closed export error state copy.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 6.4 should add regression coverage only. Do not change export behavior unless a test exposes a real gap.

Important boundaries:

- No new export format.
- No schema change.
- Raw source text must remain excluded from the evidence pack.

### Project Structure Notes

- Evidence pack tests: `apps/web/src/test/control-mirror-evidence-pack.test.ts`
- Page tests: `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Story 6.3](_bmad-output/implementation-artifacts/6-3-show-export-contents-and-retention-disclosures.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 6 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox caught test isolation assertions; final rerun passed, 4 tests. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Hardened evidence pack regression tests to assert raw `content`/`retainedExcerpt` fields are not serialized.
- Added Human Review latest decision/rationale preservation coverage in evidence pack export.
- Added page coverage for fail-closed export error copy while keeping the export action visible.

### File List

- `_bmad-output/implementation-artifacts/6-4-harden-evidence-pack-regression-coverage.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/test/control-mirror-evidence-pack.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Started Story 6.4 evidence pack regression coverage hardening.
- 2026-05-22: Hardened Control Mirror evidence pack export regression coverage.
