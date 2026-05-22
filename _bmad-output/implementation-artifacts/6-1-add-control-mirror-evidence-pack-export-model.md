# Story 6.1: Add Control Mirror Evidence Pack Export Model

Status: done

## Story

As an AQA,
I want a serializable Control Mirror evidence pack model,
so that report/export work can use a stable payload without scraping page UI.

## Acceptance Criteria

1. Given a Control Mirror dashboard, when an evidence pack is built, then it includes report metadata, snapshot/source state, summary items, evidence summaries, findings, Human Review state and recommended next step.
2. Given evidence contains retained or redacted source context, when the evidence pack is built, then raw source text is not included and retention disclosure is included.
3. Given package consumers import from `@aas-companion/domain`, when runtime packages build, then evidence pack exports are available.

## Tasks / Subtasks

- [x] Add evidence pack model and builder (AC: 1, 2)
  - [x] Define a serializable evidence pack type in the report domain module.
  - [x] Build the payload from an existing Control Mirror dashboard.
  - [x] Include retention disclosure and omit raw source text.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover required export sections.
  - [x] Cover retention disclosure and no raw source text.
  - [x] Cover package export compatibility through `@aas-companion/domain`.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-module-boundaries.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 6.1 should not add UI or download behavior. It only creates the stable domain export payload that later stories can call.

Important boundaries:

- Do not include raw source content.
- Do not change existing dashboard output.
- Do not add schema changes.
- Keep package-level import compatibility intact.

### Project Structure Notes

- Report module: `packages/domain/src/control-mirror-report.ts`
- Domain exports: `packages/domain/src/control-mirror.ts`
- Tests: `apps/web/src/test/control-mirror-evidence-pack.test.ts`

### References

- [Epic 6 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-6-report-and-evidence-pack-export.md)
- [Epic 5 retrospective](_bmad-output/implementation-artifacts/epic-5-retro-2026-05-22.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 6 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-module-boundaries.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 4 tests.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added `ControlMirrorEvidencePack` and `buildControlMirrorEvidencePack()` in the report domain module.
- Evidence pack payload includes snapshot/source/report/evidence/finding/Human Review state and safety disclosure.
- Focused tests confirm audit fields, retention disclosure and no raw source text serialization.

### File List

- `_bmad-output/implementation-artifacts/6-1-add-control-mirror-evidence-pack-export-model.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/aas-control-mirror-epic-6-report-and-evidence-pack-export.md`
- `packages/domain/src/control-mirror-report.ts`
- `packages/domain/src/control-mirror.ts`
- `apps/web/src/test/control-mirror-evidence-pack.test.ts`

## Change Log

- 2026-05-22: Started Story 6.1 Control Mirror evidence pack export model.
- 2026-05-22: Added Control Mirror evidence pack export model and tests.
