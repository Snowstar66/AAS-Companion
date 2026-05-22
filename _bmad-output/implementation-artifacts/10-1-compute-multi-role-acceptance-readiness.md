# Story 10.1: Compute Multi-Role Acceptance Readiness

Status: done

## Story

As a governance lead,
I want export history to summarize readiness across required reviewer roles,
so that a single acceptance decision is not mistaken for full sharing approval.

## Acceptance Criteria

1. Given no required role has accepted, when export history is listed, then readiness is acceptance pending with all required roles missing.
2. Given some required roles have accepted, when export history is listed, then readiness remains pending and only missing roles are listed.
3. Given any latest required role decision requests changes, when export history is listed, then readiness is changes requested and blocking roles are listed.
4. Given all required roles have accepted or accepted with conditions, when export history renders, then the export is marked share ready and accepted roles are visible.

## Tasks / Subtasks

- [x] Add acceptance readiness summary to export history records (AC: 1, 2, 3)
  - [x] Compute latest decision per required role.
  - [x] Return missing, accepted and blocking roles without loading export payload bodies.
  - [x] Add repository regression coverage.
- [x] Surface readiness through API and UI (AC: 1, 2, 3, 4)
  - [x] Return acceptance summary from export history API.
  - [x] Render pending, changes-requested and share-ready states in Control Mirror history.
  - [x] Preserve latest decision copy for audit context.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 10.1 should only compute and display readiness. Do not add authorization checks, revoke decisions or schema changes in this story.

Important boundaries:

- Required reviewer roles are Product owner, Security/privacy and AQA.
- `accepted` and `accepted_with_conditions` count as accepted for readiness.
- `changes_requested` blocks readiness for that role.
- If a role has multiple events, the newest event for that role controls that role's readiness.
- Do not mutate persisted export payloads.

### Project Structure Notes

- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-history.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 10 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-10-export-acceptance-workflow-hardening.md)
- [Epic 9 Retro](_bmad-output/implementation-artifacts/epic-9-retro-2026-05-22.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 10 first slice and started.
- `pnpm build:web-runtime-packages` - first run caught download-record type coverage for the new acceptance summary; rerun passed after adding a default summary to download records.
- `pnpm test -- src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 2 files and 9 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added multi-role acceptance readiness summary for persisted export history.
- Readiness now distinguishes `acceptance_pending`, `changes_requested` and `share_ready`.
- Export history API returns required, accepted, missing and blocking roles plus latest per-role decisions.
- Control Mirror history renders pending, changes-requested and share-ready states while preserving latest decision audit copy.
- Added repository and page coverage for partial, blocked and fully accepted export readiness.

### File List

- `_bmad-output/planning-artifacts/aas-control-mirror-epic-10-export-acceptance-workflow-hardening.md`
- `_bmad-output/implementation-artifacts/10-1-compute-multi-role-acceptance-readiness.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 10.1 multi-role acceptance readiness.
- 2026-05-22: Added multi-role acceptance readiness summary across repository, API and Control Mirror history UI.
