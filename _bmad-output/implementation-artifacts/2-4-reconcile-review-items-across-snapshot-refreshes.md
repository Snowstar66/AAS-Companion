# Story 2.4: Reconcile Review Items Across Snapshot Refreshes

Status: done

## Story

As an AI Delivery Architect,
I want review items to reconcile when findings change across snapshots,
so that the audit trail stays trustworthy as evidence improves or drifts.

## Acceptance Criteria

1. Given a finding remains present after refresh, when Control Mirror syncs review items, then the existing review item remains linked and receives updated finding metadata.
2. Given a finding disappears because evidence is corrected, when Control Mirror syncs review items, then unresolved review items are marked superseded or resolved-by-refresh according to the lifecycle rules without deleting history.
3. Given a decided finding reappears with materially different evidence, when Control Mirror syncs review items, then the system opens a new review need or marks the prior decision as needing reassessment.
4. Given snapshot refresh creates many findings, when reconciliation runs, then deterministic matching prevents duplicate review spam for stable findings.

## Tasks / Subtasks

- [x] Reconcile disappeared findings (AC: 2)
  - [x] Mark organization-scoped open/deferred items as superseded when their stable key is absent from the current sync set.
  - [x] Handle empty current review sets without deleting historical queue rows.
- [x] Preserve stable-key behavior for continuing or materially changed findings (AC: 1, 3, 4)
  - [x] Continue updating same-key items in place.
  - [x] Let materially changed stable keys create a new review item while preserving prior decision history.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover superseding disappeared unresolved findings.
  - [x] Cover empty sync superseding unresolved queue rows.
  - [x] Cover materially changed findings opening a new stable queue item.
  - [x] Cover reopening a superseded item when the same stable finding reappears.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-human-review-queue.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 2.4 builds on the stable queue keys from Story 2.1 and the decision history from Story 2.2. Reconciliation must preserve audit history: superseded items are state changes, not deletes.

### Project Structure Notes

- Queue sync/reconciliation: `packages/db/src/repositories/control-mirror-human-review-repository.ts`
- Focused tests: `apps/web/src/test/control-mirror-human-review-queue.test.ts`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story started after Story 2.3 dashboard/report reflection passed tests and web build.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-human-review-queue.test.ts` - passed, 11 tests.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-human-review-queue.test.ts` - passed, 23 tests. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning remains.
- Simulated code review found and fixed a reappearance edge case: superseded items with the same stable key are reopened when the finding reappears.

### Completion Notes List

- Queue sync now marks missing open/deferred review items as `superseded` instead of deleting them.
- Empty current review sets supersede unresolved queue rows while preserving decided history.
- Reappearing same-key findings reopen superseded items; materially changed keys create distinct review needs through deterministic stable keys.

### File List

- `packages/db/src/repositories/control-mirror-human-review-repository.ts`
- `apps/web/src/test/control-mirror-human-review-queue.test.ts`
- `_bmad-output/implementation-artifacts/2-4-reconcile-review-items-across-snapshot-refreshes.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented Story 2.4 refresh reconciliation.
