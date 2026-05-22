# Story 4.2: Add Uploaded Snapshot Submission Adapter

Status: done

## Story

As an AI Delivery Architect,
I want uploaded files to be converted into the existing safe snapshot input contract,
so that the UI can use the Epic 3 backend without duplicating validation logic.

## Acceptance Criteria

1. Given files are selected through the upload workflow, when submission runs, then the adapter creates `ControlMirrorUploadedSnapshotFileInput` records with explicit path, content and size.
2. Given a file cannot be read by the browser/server action, when ingestion runs, then it is passed as unreadable rather than processed as source evidence.
3. Given the backend rejects files, when submission completes, then the UI receives structured counts and reasons from the persisted snapshot summary.

## Tasks / Subtasks

- [x] Add uploaded snapshot adapter (AC: 1, 2)
  - [x] Convert selected files into `ControlMirrorUploadedSnapshotFileInput`.
  - [x] Preserve explicit file path/name, size and last modified metadata.
  - [x] Pass unreadable files as null content.
  - [x] Enforce file count and per-file size limits before processing.
- [x] Add service/action wiring (AC: 1, 2, 3)
  - [x] Add API service around `createControlMirrorUploadedSnapshot()`.
  - [x] Add Control Mirror server action that uses the adapter.
  - [x] Redirect with structured success/error counts.
  - [x] Keep Demo upload read-only.
- [x] Add UI submission form (AC: 1, 3)
  - [x] Add file input to the uploaded snapshot panel.
  - [x] Keep policy copy near submission.
  - [x] Make clear files are validated server-side before storage.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover adapter conversion.
  - [x] Cover unreadable file conversion.
  - [x] Cover empty/oversized local rejection.
  - [x] Cover Control Mirror page form rendering.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-uploaded-snapshot-adapter.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 4.2 wires submission to the existing Epic 3 backend contract. It should not implement archive extraction, folder scanning or repository connectors.

Important boundaries:

- Do not execute uploaded code.
- Do not silently read local folders.
- Keep validation duplicated only where necessary for transport limits; domain/backend validation remains authoritative.
- Demo mode remains read-only.

### Project Structure Notes

- Adapter: `apps/web/src/lib/control-mirror/uploaded-snapshot-adapter.ts`
- Server action: `apps/web/src/app/(protected)/control-mirror/actions.ts`
- API service: `packages/api/src/control-mirror.ts`
- UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-uploaded-snapshot-adapter.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 4 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-4-uploaded-snapshot-ux-and-adapter.md)
- [Story 4.1](_bmad-output/implementation-artifacts/4-1-activate-uploaded-snapshot-source-action.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 4 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-uploaded-snapshot-adapter.test.ts src/test/control-mirror-page.test.tsx` - passed, 5 tests. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning and webpack cache snapshot warnings remain.

### Completion Notes List

- Added a Control Mirror uploaded snapshot adapter that converts selected files into the Epic 3 safe input contract.
- Added file count and size limits, unreadable-file handling and explicit file metadata preservation.
- Added API service and Control Mirror server action for uploaded snapshot submission.
- Added upload form to the uploaded snapshot panel while keeping server validation and retention copy visible.
- Focused tests cover adapter conversion, unreadable files, local rejection and page form rendering.

### File List

- `_bmad-output/implementation-artifacts/4-2-add-uploaded-snapshot-submission-adapter.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/lib/control-mirror/uploaded-snapshot-adapter.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-uploaded-snapshot-adapter.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Started Story 4.2 uploaded snapshot submission adapter.
- 2026-05-22: Implemented Story 4.2 uploaded snapshot submission adapter.
