# Story 3.2: Add Uploaded Snapshot Intake Guardrails

Status: done

## Story

As an AI Delivery Architect,
I want uploaded project snapshots to be validated before processing,
so that unsafe paths, unsupported files and unreadable content cannot compromise Control Mirror evidence.

## Acceptance Criteria

1. Given a project snapshot upload is provided, when ingestion validates files, then path traversal, absolute paths and unsupported extensions are rejected.
2. Given valid files remain, when snapshot creation completes, then a persistent snapshot and artifact manifest are created with normalized path, hash, type, parsing status and lineage metadata.
3. Given some files are rejected or unreadable, when the scan completes, then the dashboard shows accepted/rejected/unreadable counts and continues with safe files.

## Tasks / Subtasks

- [x] Add deterministic uploaded snapshot validation (AC: 1, 3)
  - [x] Normalize safe relative paths.
  - [x] Reject path traversal, absolute paths and empty paths.
  - [x] Reject unsupported extensions through a conservative allowlist.
  - [x] Track unreadable content without processing it as evidence.
- [x] Add uploaded snapshot persistence entry point (AC: 2, 3)
  - [x] Create/reuse an `uploaded_zip` Control Mirror source.
  - [x] Persist safe files as Control Mirror artifact rows with hash, type, parsing status and lineage.
  - [x] Persist normalized evidence for safe files.
  - [x] Store rejected/unreadable counts in snapshot summary.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover unsafe path rejection.
  - [x] Cover unsupported extension rejection.
  - [x] Cover partial processing with safe and rejected files.
  - [x] Cover persisted snapshot row creation shape.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 3.2 activates the backend guardrails for uploaded project snapshots without adding a broad zip extraction dependency or UI upload surface. Treat the input as an already-extracted file list supplied by a future upload adapter.

Important boundaries:

- Do not execute uploaded code.
- Do not silently read local folders.
- Reject unsafe paths before persistence.
- Continue processing safe files when other files are rejected or unreadable.
- Keep file allowlist conservative but broad enough for Control Mirror evidence: markdown/text/json/csv/log/report plus common source/test extensions that Control Mirror needs to classify.

### Project Structure Notes

- Domain validation helpers: `packages/domain/src/control-mirror.ts`
- Snapshot persistence: `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- DB exports: `packages/db/src/index.ts`
- Focused tests: `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`

### References

- [Epic 3 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-3-source-ingestion-and-evidence-policy.md)
- [Story 3.1](_bmad-output/implementation-artifacts/3-1-establish-source-mode-registry-and-evidence-policy-surface.md)
- [Architecture handoff](_bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 3 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-uploaded-snapshot-guardrails.test.ts` - passed, 3 tests.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-uploaded-snapshot-guardrails.test.ts src/test/control-mirror-human-review-queue.test.ts` - passed before final SHA-256 hash refinement, 27 tests. Initial parallel run hit the known package/dist race; sequential rerun passed. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed after final SHA-256 hash refinement. Existing Next ESLint plugin warning remains.

### Completion Notes List

- Added deterministic uploaded snapshot validation for safe relative paths, unsupported extensions, unreadable content and rejected file counts.
- Added `createControlMirrorUploadedSnapshot()` to persist safe uploaded files as Control Mirror artifacts and normalized evidence while storing rejected/unreadable counts in snapshot summary.
- Dashboard snapshot metadata now includes rejected file count so partial processing is visible.
- Focused tests cover unsafe paths, unsupported extensions, unreadable files and persisted row shape.

### File List

- `_bmad-output/implementation-artifacts/3-2-add-uploaded-snapshot-intake-guardrails.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror.ts`
- `packages/db/src/repositories/control-mirror-repository.ts`
- `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- `packages/db/src/index.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`

## Change Log

- 2026-05-21: Started Story 3.2 uploaded snapshot intake guardrails.
- 2026-05-21: Implemented Story 3.2 uploaded snapshot intake guardrails.
