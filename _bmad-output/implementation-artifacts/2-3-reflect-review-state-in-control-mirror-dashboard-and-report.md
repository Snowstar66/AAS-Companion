# Story 2.3: Reflect Review State in Control Mirror Dashboard and Report

Status: done

## Story

As a Delivery Lead,
I want Control Mirror readiness to use persisted Human Review state,
so that dashboard and report recommendations match the actual decision workflow.

## Acceptance Criteria

1. Given open blocking Human Review items exist, when Control Mirror readiness is calculated, then release/readiness recommendation cannot show ready without exposing the blockers.
2. Given Human Review items have decisions, when I open Control Mirror, then the dashboard shows open, decided, deferred and superseded counts with affected Outcome/Epic/Story context.
3. Given a Control Mirror report is generated, when review items are included, then the report includes persisted decision state, rationale summary and unresolved blockers.
4. Given the review queue is empty, when the dashboard renders, then it shows a clear empty state rather than implying review was skipped.

## Tasks / Subtasks

- [x] Add review-state summary read model (AC: 1, 2, 3)
  - [x] Count open, decided, deferred and superseded Human Review items.
  - [x] Keep affected Outcome/Epic/Story context in the dashboard read model.
  - [x] Treat only open blocking items as unresolved release blockers.
- [x] Apply persisted review state to dashboard/report service output (AC: 1, 3)
  - [x] Recalculate readiness after queue-state merge.
  - [x] Update report open/blocking counts, required approvals, blocking gaps and decision rationale summary.
- [x] Surface review-state summary in Control Mirror UI (AC: 2, 4)
  - [x] Show lifecycle counts near Human Review items.
  - [x] Show compact affected Outcome/Epic/Story context.
  - [x] Preserve empty-state behavior when no review items exist.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover persisted decided items changing report blockers.
  - [x] Cover dashboard state/count rendering.
  - [x] Run targeted verification.

## Dev Notes

Story 2.1 created the persisted queue. Story 2.2 added explicit decision events. Story 2.3 must make the dashboard/report use those persisted lifecycle states, not only generated recommendations.

Boundary: AI recommendations remain visible, but release/readiness summaries must not count decided or superseded queue items as unresolved blockers.

### Project Structure Notes

- Domain dashboard/report read model: `packages/domain/src/control-mirror.ts`
- API merge point: `packages/api/src/control-mirror.ts`
- Control Mirror page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Focused tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story started after simulated Story 2.2 review passed with no blocking findings.
- `pnpm build:web-runtime-packages` - passed after tightening optional review-state summary types.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-human-review-queue.test.ts` - passed, 19 tests. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning remains.
- Simulated code review - passed with no blocking findings.

### Completion Notes List

- Added a domain-level review-state summary with open, decided, deferred and superseded counts plus affected Outcome/Epic/Story context.
- Dashboard service now reapplies persisted queue state after merge so report counts, blockers, required approvals and decision rationale summary reflect Human Review lifecycle state.
- Control Mirror UI now shows lifecycle counts and compact context rows before the Human Review item list while preserving the empty state.

### File List

- `packages/domain/src/control-mirror.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `_bmad-output/implementation-artifacts/2-3-reflect-review-state-in-control-mirror-dashboard-and-report.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented Story 2.3 review-state dashboard/report reflection.
