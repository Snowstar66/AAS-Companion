# Story 10.2: Gate Reviewer Role Submission by Active User Role

Status: done

## Story

As a governance owner,
I want acceptance submissions to be constrained by reviewer role authority,
so that users cannot record arbitrary Product/Security/AQA decisions.

## Acceptance Criteria

1. Given a user lacks reviewer authority, when they submit an acceptance decision, then the action fails closed.
2. Given a user has matching authority, when they submit a decision, then the decision is recorded.
3. Given submission is rejected, when Control Mirror redirects, then the error copy explains that reviewer authority is required.

## Tasks / Subtasks

- [x] Add reviewer authority mapping (AC: 1, 2)
  - [x] Map Product owner acceptance to `value_owner`.
  - [x] Map Security/privacy acceptance to `architect` or `aida`.
  - [x] Map AQA acceptance to `aqa`.
- [x] Gate acceptance server action (AC: 1, 2, 3)
  - [x] Reject unauthorized reviewer-role submissions before API persistence.
  - [x] Redirect with clear reviewer authority copy.
  - [x] Preserve authorized acceptance decision recording.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-acceptance-action.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 10.2 should gate server-side submissions only. Do not add UI role filtering or new membership roles in this story.

Important boundaries:

- Fail closed before `recordControlMirrorEvidencePackExportAcceptanceDecisionService`.
- Use active organization membership role from the project session.
- Keep existing tenant scoping and rationale validation in the API/repository.
- Do not change persisted decision schema.

### Project Structure Notes

- Action: `apps/web/src/app/(protected)/control-mirror/actions.ts`
- Authority helper: `apps/web/src/lib/control-mirror/export-acceptance-authority.ts`
- Tests: `apps/web/src/test/control-mirror-export-acceptance-action.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 10 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-10-export-acceptance-workflow-hardening.md)
- [Story 10.1](_bmad-output/implementation-artifacts/10-1-compute-multi-role-acceptance-readiness.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 10 backlog and started.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-export-acceptance-action.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 2 files and 4 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added reviewer authority helper for Product owner, Security/privacy and AQA acceptance lanes.
- Acceptance server action now rejects unauthorized reviewer-role submissions before API persistence.
- Unauthorized submissions redirect with reviewer authority copy.
- Authorized matching role submissions still persist and revalidate Control Mirror.
- Added server action regression coverage for fail-closed and authorized paths.

### File List

- `_bmad-output/implementation-artifacts/10-2-gate-reviewer-role-submission-by-active-user-role.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/lib/control-mirror/export-acceptance-authority.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/test/control-mirror-export-acceptance-action.test.ts`

## Change Log

- 2026-05-22: Created and started Story 10.2 reviewer role authority gate.
- 2026-05-22: Added role-authority gate for Control Mirror export acceptance submissions.
