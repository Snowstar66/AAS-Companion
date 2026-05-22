# Story 11.4: Harden Retention Governance Regression and Retro

Status: done

## Story

As an AQA,
I want retention governance coverage and lessons captured,
so that persisted audit artifact lifecycle remains reliable.

## Acceptance Criteria

1. Given retention state, archive lifecycle and download events exist, when targeted tests run, then repository, API, route and page coverage all pass.
2. Given build validation runs, when the web app builds, then export routes remain included.
3. Given Epic 11 is complete, when retrospective is written, then residual risks and next recommendations are captured.

## Tasks / Subtasks

- [x] Harden retention governance regression coverage (AC: 1)
  - [x] Add API-level coverage for archive and re-download audit service mappings.
  - [x] Confirm repository, route, action and page regression coverage remain green.
  - [x] Preserve metadata-only export history behavior and fail-closed download audit behavior.
- [x] Validate build and route inclusion (AC: 2)
  - [x] Run `pnpm build:web-runtime-packages`.
  - [x] Run targeted retention governance tests.
  - [x] Run `pnpm --filter @aas-companion/web build` and confirm `/control-mirror/export` and `/control-mirror/export/[exportId]` are present.
- [x] Capture Epic 11 retrospective (AC: 3)
  - [x] Create Epic 11 retrospective with accomplishments, residual risks and next recommendations.
  - [x] Mark Epic 11 and retrospective tracking complete when verification passes.

## Dev Notes

Story 11.4 should harden and document the Epic 11 retention governance slice. Do not add new retention lifecycle behaviors such as delete, restore, expiry automation or policy editing in this story.

Important boundaries:

- Regression coverage should prove the existing lifecycle: active metadata, archive-with-reason, archived download disclosure, successful re-download audit event, no audit event on failed lookup, and visible latest download metadata.
- API tests should mock DB repositories and assert service return shape/failure shape, not hit Prisma.
- Route tests already prove fail-closed behavior for missing export and audit failure; keep that behavior unchanged.
- Page tests already prove retention and latest download metadata; avoid large UI refactors.
- Full `pnpm test` currently has unrelated failures outside this epic (`smoke.test.tsx`, `outcome-workspace-page.test.tsx`); targeted Epic 11 tests are the acceptance gate for this story.

### Project Structure Notes

- API service: `packages/api/src/control-mirror.ts`
- Repository/model: `packages/db/src/repositories/control-mirror-export-repository.ts`, `packages/db/prisma/schema.prisma`
- Route/UI/action: `apps/web/src/app/(protected)/control-mirror/export/[exportId]/route.ts`, `apps/web/src/app/(protected)/control-mirror/actions.ts`, `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-export-download-service.test.ts`, `apps/web/src/test/control-mirror-export-retention-action.test.ts`, `apps/web/src/test/control-mirror-export-download-route.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### Previous Story Intelligence

- Story 11.1 established `active` retention metadata and metadata-only history list selects.
- Story 11.2 established archive repository/API/action behavior and archived download disclosure headers.
- Story 11.3 established `ControlMirrorEvidencePackExportDownloadEvent`, tenant-scoped audit persistence, route fail-closed audit, and latest download metadata display.
- Tests must usually be rerun outside the sandbox because Vitest config resolution is blocked by `Access is denied` in sandbox.

### References

- [Epic 11 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-11-export-retention-governance.md)
- [Story 11.1](_bmad-output/implementation-artifacts/11-1-add-export-retention-state-metadata.md)
- [Story 11.2](_bmad-output/implementation-artifacts/11-2-archive-persisted-evidence-pack-exports.md)
- [Story 11.3](_bmad-output/implementation-artifacts/11-3-audit-persisted-export-re-downloads.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 11 backlog and started.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-export-download-service.test.ts src/test/control-mirror-export-retention-action.test.ts src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 5 files and 24 tests. Existing React non-boolean attribute warnings remain.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added API-level regression coverage for archive service response mapping.
- Added API-level regression coverage for re-download audit service success and failure mapping.
- Re-ran Epic 11 targeted regression across repository, API, route, action and page tests.
- Re-ran runtime package build and web production build; export routes remain included.
- Created Epic 11 retrospective with residual risks and next recommendations.

### File List

- `_bmad-output/implementation-artifacts/11-4-harden-retention-governance-regression-and-retro.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/epic-11-retro-2026-05-22.md`
- `apps/web/src/test/control-mirror-export-download-service.test.ts`

## Change Log

- 2026-05-22: Created and started Story 11.4 retention governance hardening and retrospective.
- 2026-05-22: Hardened Epic 11 regression coverage and completed retention governance retrospective.
