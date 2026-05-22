# Story 4.1: Activate Uploaded Snapshot Source Action

Status: done

## Story

As a Delivery Lead,
I want the Control Mirror source panel to present uploaded snapshot as an explicit action,
so that I can start a project evidence upload without thinking the app scanned my machine.

## Acceptance Criteria

1. Given I open Control Mirror, when source modes render, then uploaded snapshot is shown as active with refresh support, retention posture and safety constraints.
2. Given folder snapshot and repository root are not implemented, when source modes render, then they remain visible but non-actionable.
3. Given I choose uploaded snapshot, when the upload panel opens, then it states allowed file types, size/count constraints and redaction policy before submission.

## Tasks / Subtasks

- [x] Activate uploaded snapshot source action (AC: 1, 2)
  - [x] Mark uploaded snapshot as active and actionable in the source policy.
  - [x] Keep folder snapshot and repository root non-actionable.
  - [x] Keep source constraints explicit and safety-focused.
- [x] Add upload preparation panel (AC: 3)
  - [x] Open panel from source action via Control Mirror URL state.
  - [x] Show allowed file types and limits.
  - [x] Show retention/redaction posture and no-silent-scan copy.
  - [x] Make clear that submission adapter comes next.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover uploaded snapshot active source policy.
  - [x] Cover folder/repository modes staying non-actionable.
  - [x] Cover upload preparation panel rendering.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 4.1 should activate the source action only. Do not add archive extraction, file submission or server action ingestion in this slice.

Important boundaries:

- Do not imply local folders or repositories are scanned.
- Do not add a fake upload success path.
- Keep unsupported/planned modes visible but non-actionable.
- Use the existing source policy surface and Control Mirror page patterns.

### Project Structure Notes

- Source policy: `packages/domain/src/control-mirror.ts`
- Control Mirror page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 4 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-4-uploaded-snapshot-ux-and-adapter.md)
- [Epic 3 retrospective](_bmad-output/implementation-artifacts/epic-3-retro-2026-05-21.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 4 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - passed, 15 tests. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning and webpack cache snapshot warnings remain.

### Completion Notes List

- Uploaded snapshot is now an active, actionable Control Mirror source mode with refresh support and redacted-excerpt retention.
- Folder snapshot and Git/repository root remain visible but non-actionable.
- Control Mirror now opens an uploaded snapshot preparation panel from `?source=uploaded-snapshot` with allowed file, safety and retention guidance.
- Focused tests cover source policy status and upload preparation panel rendering.

### File List

- `_bmad-output/implementation-artifacts/4-1-activate-uploaded-snapshot-source-action.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-21: Started Story 4.1 uploaded snapshot source action.
- 2026-05-21: Implemented Story 4.1 uploaded snapshot source action.
