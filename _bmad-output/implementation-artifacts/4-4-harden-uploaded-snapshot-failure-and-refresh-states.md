# Story 4.4: Harden Uploaded Snapshot Failure and Refresh States

Status: done

## Story

As a Delivery Lead,
I want upload failures and repeated uploads to be deterministic and understandable,
so that Control Mirror does not create duplicate review noise or misleading readiness claims.

## Acceptance Criteria

1. Given upload submission fails, when the page returns, then the error is clear and no successful scan is implied.
2. Given the same snapshot is uploaded again, when Control Mirror compares it, then unchanged files are counted as unchanged and do not create duplicate review identity.
3. Given a changed upload affects Human Review findings, when queue sync runs, then Epic 2 reconciliation rules preserve previous decisions where the stable finding key still applies.

## Tasks / Subtasks

- [x] Harden failure copy and page state (AC: 1)
  - [x] Ensure upload errors say no snapshot was created.
  - [x] Keep error state on the uploaded snapshot panel.
- [x] Reinforce deterministic refresh behavior (AC: 2)
  - [x] Cover repeated upload unchanged classification.
  - [x] Keep normalized uploaded paths as stable artifact identity.
- [x] Reinforce Human Review reconciliation compatibility (AC: 3)
  - [x] Cover stable review keys across snapshot ids for the same uploaded finding.
  - [x] Confirm changed counts/labels do not create duplicate review identity.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-uploaded-snapshot-guardrails.test.ts src/test/control-mirror-human-review-queue.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 4.4 should not add new upload capability. It hardens failure communication and verifies that the Epic 2 review queue remains compatible with Epic 4 uploaded snapshot refreshes.

Important boundaries:

- Failed uploads must not imply a scan succeeded.
- Duplicate review noise must be prevented through stable finding identity.
- Repeated uploads should remain deterministic by normalized path and content hash.

### Project Structure Notes

- Upload action: `apps/web/src/app/(protected)/control-mirror/actions.ts`
- Refresh persistence tests: `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`
- Human Review queue tests: `apps/web/src/test/control-mirror-human-review-queue.test.ts`
- Page tests: `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 4 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-4-uploaded-snapshot-ux-and-adapter.md)
- [Story 4.3](_bmad-output/implementation-artifacts/4-3-show-uploaded-snapshot-result-summary.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 4 backlog.
- `pnpm test -- src/test/control-mirror-uploaded-snapshot-guardrails.test.ts src/test/control-mirror-human-review-queue.test.ts src/test/control-mirror-page.test.tsx` - passed, 18 tests. Existing React warning remains for non-boolean `jsx`/`global`.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Fail-closed upload errors now explicitly say no snapshot was created.
- The page preserves uploaded snapshot error state when returning from failed submissions.
- Added repeated identical upload coverage for unchanged classification and stable uploaded path identity.
- Added Human Review queue stable key coverage for uploaded snapshot findings across refresh snapshots.

### File List

- `_bmad-output/implementation-artifacts/4-4-harden-uploaded-snapshot-failure-and-refresh-states.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `apps/web/src/test/control-mirror-human-review-queue.test.ts`
- `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`

## Change Log

- 2026-05-22: Started Story 4.4 uploaded snapshot failure and refresh hardening.
- 2026-05-22: Hardened uploaded snapshot failure copy and added deterministic refresh/review reconciliation coverage.
