# Story 4.3: Show Uploaded Snapshot Result Summary

Status: done

## Story

As an AQA,
I want upload results to show accepted, rejected, unreadable and refresh delta counts,
so that I can validate evidence coverage and privacy posture before relying on Control Mirror.

## Acceptance Criteria

1. Given an uploaded snapshot completes, when Control Mirror refreshes, then accepted, rejected, unreadable, unchanged, new, modified and deleted counts are visible.
2. Given rejected or unreadable files exist, when I inspect results, then reasons are visible without exposing hidden local filesystem access.
3. Given sensitive evidence was redacted, when the result summary and report render, then retention disclosure remains visible.

## Tasks / Subtasks

- [x] Extend dashboard upload summary model (AC: 1, 2)
  - [x] Carry accepted/rejected/unreadable counts from snapshot summary.
  - [x] Carry rejected file reasons from snapshot summary.
  - [x] Derive unreadable file paths from artifact manifest.
- [x] Render uploaded snapshot result summary (AC: 1, 2, 3)
  - [x] Show accepted/rejected/unreadable and refresh delta counts.
  - [x] Show rejected reasons and unreadable paths.
  - [x] Keep retention/redaction disclosure visible near the result.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover dashboard mapping for rejected reasons.
  - [x] Cover page rendering for upload result summary.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 4.3 should present results from the existing persisted uploaded snapshot. Do not add new ingestion behavior in this slice.

Important boundaries:

- Do not expose absolute local paths.
- Rejected reason display should use normalized/original upload path metadata only.
- Keep retention disclosure tied to the current snapshot/report.

### Project Structure Notes

- Domain dashboard model: `packages/domain/src/control-mirror.ts`
- Dashboard repository mapping: `packages/db/src/repositories/control-mirror-repository.ts`
- Control Mirror page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 4 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-4-uploaded-snapshot-ux-and-adapter.md)
- [Story 4.2](_bmad-output/implementation-artifacts/4-2-add-uploaded-snapshot-submission-adapter.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 4 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - passed, 15 tests. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning and webpack cache snapshot warnings remain.

### Completion Notes List

- Added `uploadSummary` to the Control Mirror dashboard read model for uploaded snapshot result counts and file-level issue summaries.
- Dashboard repository now maps accepted counts and rejected file reasons from snapshot summary JSON.
- Control Mirror page now shows uploaded snapshot result counts, rejected reasons, unreadable files and retention disclosure together.
- Focused tests cover upload summary mapping and page rendering.

### File List

- `_bmad-output/implementation-artifacts/4-3-show-uploaded-snapshot-result-summary.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror.ts`
- `packages/db/src/repositories/control-mirror-repository.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Started Story 4.3 uploaded snapshot result summary.
- 2026-05-22: Implemented Story 4.3 uploaded snapshot result summary.
