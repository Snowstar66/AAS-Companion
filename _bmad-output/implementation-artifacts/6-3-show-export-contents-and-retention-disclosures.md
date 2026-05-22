# Story 6.3: Show Export Contents and Retention Disclosures

Status: done

## Story

As a governance reviewer,
I want the export panel to preview what the evidence pack contains,
so that I know what will and will not be shared.

## Acceptance Criteria

1. Given an export action is visible, when I inspect the report area, then included sections are listed.
2. Given retention/redaction applies, when export guidance renders, then it states that raw source text is not included.
3. Given Human Review items exist, when export guidance renders, then open/blocking review counts are visible.

## Tasks / Subtasks

- [x] Add export contents preview (AC: 1, 2, 3)
  - [x] List the evidence pack sections near the download action.
  - [x] Keep raw-source exclusion and retention disclosure visible.
  - [x] Show open and blocking Human Review counts in the export guidance.
- [x] Add focused page coverage (AC: 1, 2, 3)
  - [x] Cover included export sections.
  - [x] Cover no-raw-source guidance.
  - [x] Cover Human Review export counts.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 6.3 should only improve export preview clarity. Do not change the evidence pack payload shape in this slice unless needed to reflect already available data.

Important boundaries:

- Do not include raw source text.
- Do not add new export formats.
- Keep existing dashboard behavior unchanged.

### Project Structure Notes

- Page UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Story 6.2](_bmad-output/implementation-artifacts/6-2-add-web-export-action-for-current-control-mirror-state.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 6 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 1 test. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added export contents preview listing snapshot metadata, report summary, evidence summaries, conformance findings, guardrail findings and Human Review state.
- Kept raw-source exclusion and retention disclosure visible near the export action.
- Added open/blocking Human Review counts to export guidance.
- Updated page test coverage for export contents and review counts.

### File List

- `_bmad-output/implementation-artifacts/6-3-show-export-contents-and-retention-disclosures.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Started Story 6.3 export contents and retention disclosure preview.
- 2026-05-22: Added Control Mirror evidence pack contents preview and retention/review export guidance.
