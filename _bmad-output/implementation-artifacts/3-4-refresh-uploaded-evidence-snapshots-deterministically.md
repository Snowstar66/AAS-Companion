# Story 3.4: Refresh Uploaded Evidence Snapshots Deterministically

Status: done

## Story

As a Delivery Lead,
I want refreshed uploaded snapshots to compare against prior snapshots,
so that I can see what evidence changed without duplicate review spam.

## Acceptance Criteria

1. Given a previous snapshot exists, when a new upload is processed for the same source, then files are classified as unchanged, new, modified, deleted or unreadable by normalized path and hash.
2. Given unchanged files exist, when parser and normalizer versions are compatible, then parse results may be reused.
3. Given changed files affect Human Review findings, when Control Mirror syncs review items, then Epic 2 reconciliation rules preserve decision history and avoid duplicate review spam.

## Tasks / Subtasks

- [x] Compare uploaded snapshots against prior completed source snapshot (AC: 1)
  - [x] Find the latest completed uploaded snapshot for the same organization/source.
  - [x] Compare accepted files by normalized path and SHA-256 hash.
  - [x] Preserve unreadable status for unreadable files.
  - [x] Add deleted artifact rows for prior files missing from the new upload.
- [x] Store deterministic refresh counts (AC: 1, 2)
  - [x] Track unchanged, new, modified, deleted and unreadable counts.
  - [x] Persist summary counts for dashboard/report use.
  - [x] Keep unchanged files stable enough for later parser reuse.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover uploaded snapshot refresh classification.
  - [x] Cover deleted file rows.
  - [x] Cover prior decision reconciliation compatibility through stable artifact paths.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 3.4 should reuse the Story 3.2 uploaded snapshot entry point and Story 3.3 retention policy. Avoid adding zip extraction or UI upload controls here.

Important boundaries:

- Compare by normalized path and SHA-256 source hash.
- Do not create duplicate review identity from unstable uploaded paths.
- Unreadable files should not erase prior files as deleted when they have the same normalized path.
- Deleted rows should be visible in the artifact manifest but should not create new normalized source evidence.

### Project Structure Notes

- Snapshot persistence: `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- Focused tests: `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`

### References

- [Epic 3 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-3-source-ingestion-and-evidence-policy.md)
- [Story 3.2](_bmad-output/implementation-artifacts/3-2-add-uploaded-snapshot-intake-guardrails.md)
- [Story 3.3](_bmad-output/implementation-artifacts/3-3-apply-retention-and-redaction-policy-to-evidence-storage.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 3 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-uploaded-snapshot-guardrails.test.ts` - passed, 4 tests.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning and webpack cache snapshot warnings remain.

### Completion Notes List

- Uploaded snapshot creation now compares accepted files against the latest completed uploaded snapshot for the same source.
- Files are deterministically classified as unchanged, new, modified, deleted or unreadable by normalized path and SHA-256 hash.
- Snapshot summary now persists refresh counts for uploaded snapshots.
- Focused tests cover unchanged/new/modified/deleted classification and deleted artifact rows.

### File List

- `_bmad-output/implementation-artifacts/3-4-refresh-uploaded-evidence-snapshots-deterministically.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`

## Change Log

- 2026-05-21: Started Story 3.4 deterministic uploaded snapshot refresh.
- 2026-05-21: Implemented Story 3.4 deterministic uploaded snapshot refresh.
