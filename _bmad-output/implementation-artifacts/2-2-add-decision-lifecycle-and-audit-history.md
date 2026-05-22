# Story 2.2: Add Decision Lifecycle and Audit History

Status: done

## Story

As a mandate holder,
I want each Human Review item to support explicit decisions and rationale,
so that proceed, pause, downgrade, exception and rework choices are visible and auditable.

## Acceptance Criteria

1. Given an open Human Review item exists, when a user records a decision, then the item stores decision type, rationale, actor, timestamp and resulting state.
2. Given a decision changes the delivery posture, when the item is saved, then the audit history preserves the prior state and appends the new decision event.
3. Given an AI-generated recommendation exists, when a decision is recorded, then the UI and persisted data distinguish recommendation from human decision.
4. Given the user attempts to approve release or accept residual risk through AI output alone, when the decision is validated, then the system blocks silent AI approval and requires explicit human-owned decision data.

## Tasks / Subtasks

- [x] Extend Control Mirror Human Review persistence for decisions (AC: 1, 2, 3)
  - [x] Add decision enum/model or append-only child table for review decision events.
  - [x] Store actor id, decision type, rationale, prior state, resulting state and created timestamp.
  - [x] Keep AI recommendation fields separate from human decision fields.
- [x] Add repository/API functions for recording decisions (AC: 1, 2, 4)
  - [x] Validate organization scope and review item ownership.
  - [x] Reject decisions without explicit human actor and rationale.
  - [x] Append a decision event and update the queue item state in one transaction.
- [x] Surface decision state in the review/dashboard flow (AC: 1, 3)
  - [x] Return latest human decision metadata with persisted Control Mirror review items.
  - [x] Keep generated recommendation visible as recommendation, not decision.
  - [x] Add route/action support only as far as needed for a working recorded decision path.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover append-only decision creation.
  - [x] Cover rejection without actor/rationale.
  - [x] Cover recommendation vs human decision separation.
  - [x] Cover tenant isolation.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-human-review-queue.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 2.1 introduced the persisted `ControlMirrorHumanReviewItem` queue foundation with stable finding keys, tenant scope, snapshot linkage and generated recommendation metadata. Story 2.2 must build on that model without changing the generated recommendation semantics.

Important boundary: AI can recommend, but a human decision must be explicitly recorded with an actor and rationale. Do not auto-convert `recommendedOption` into a decision. Do not claim release approval or residual-risk acceptance from generated Control Mirror output.

Decision lifecycle target:

- `open`: unresolved review item.
- `decided`: human decision recorded for approve/reject/downgrade/exception/rework style outcomes.
- `deferred`: human decision recorded to defer.
- `superseded`: reserved for Story 2.4 refresh reconciliation.

Suggested decision event fields:

- `id`
- `organizationId`
- `reviewItemId`
- `decisionType`
- `rationale`
- `priorState`
- `resultingState`
- `actorId`
- `createdAt`

### Project Structure Notes

- Queue model and sync: `packages/db/src/repositories/control-mirror-human-review-repository.ts`
- Prisma schema: `packages/db/prisma/schema.prisma`
- API facade: `packages/api/src/control-mirror.ts`
- Control Mirror route/action surface: `apps/web/src/app/(protected)/control-mirror/`
- Existing focused test: `apps/web/src/test/control-mirror-human-review-queue.test.ts`

### References

- [Epic 2 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-2-human-review-workflow-hardening.md)
- [Story 2.1](_bmad-output/implementation-artifacts/2-1-persist-control-mirror-human-review-queue.md)
- [Architecture handoff](_bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Simulated code review - passed with no blocking findings; residual posture/count recalculation belongs to Story 2.3 and is being handled there.
- `pnpm db:generate` - initially failed because `ControlMirrorHumanReviewDecisionEvent.organization` needed the opposite relation on `Organization`; fixed and reran successfully.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-human-review-queue.test.ts src/test/control-mirror-page.test.tsx` - first escalated run found a `getDecisionLabel` helper name collision; renamed the new helper to `getHumanDecisionLabel`.
- `pnpm test -- src/test/control-mirror-human-review-queue.test.ts src/test/control-mirror-page.test.tsx` - passed, 6 tests. Existing React test warning about non-boolean `jsx/global` attributes remains.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-human-review-queue.test.ts` - passed, 16 tests. Existing React test warning remains.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-human-review-queue.test.ts` - passed after repository-level decision tests were added, 18 tests. Existing React test warning remains.
- `pnpm db:push` - passed and synced the local PostgreSQL schema.
- `pnpm --filter @aas-companion/web build` - passed. Existing webpack cache snapshot warnings and Next ESLint plugin warning remain.

### Completion Notes List

- Added append-only `ControlMirrorHumanReviewDecisionEvent` persistence with decision type, rationale, actor, prior state, resulting state and timestamp.
- Added repository/API decision recording that validates explicit actor/rationale, scopes by organization, appends the event and updates queue item lifecycle state in one transaction.
- Returned latest human decision metadata with persisted Control Mirror review queue items while keeping generated recommendation fields separate.
- Added a Control Mirror server action and compact decision form for persisted open review items.
- Added focused tests for lifecycle-state mapping and recommendation-vs-human-decision separation, and updated the page test for the decision form.
- Added repository-level tests for missing actor/rationale rejection and tenant-scoped append/update transaction behavior.

### File List

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260521224500_control_mirror_human_review_decisions/migration.sql`
- `packages/db/src/repositories/control-mirror-human-review-repository.ts`
- `packages/db/src/index.ts`
- `packages/domain/src/control-mirror.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-human-review-queue.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `_bmad-output/implementation-artifacts/2-2-add-decision-lifecycle-and-audit-history.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented Story 2.2 decision lifecycle and append-only audit event support for Control Mirror Human Review.
