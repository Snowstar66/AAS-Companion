# Story 2.1: Persist Control Mirror Human Review Queue

Status: done

## Story

As an AQA,
I want critical Control Mirror findings to create persisted Human Review queue items,
so that required human decisions are not only generated in the dashboard but can be owned, tracked and audited.

## Acceptance Criteria

1. Given Control Mirror detects a critical gap requiring human decision, when conformance results are saved or refreshed, then a persisted Human Review item is created or updated with finding id, organization id, severity, affected object, recommendation, blocking status and source lineage.
2. Given the same finding is detected again, when the queue sync runs, then the existing Human Review item is updated instead of duplicating a new open item.
3. Given a finding belongs to another organization, when review items are queried or updated, then tenant boundaries prevent cross-organization access.
4. Given Control Mirror generates review recommendations in the domain layer, when the dashboard service returns data, then it can expose persisted review identity/state without losing the existing recommendation fields.

## Tasks / Subtasks

- [x] Add a narrow persisted Control Mirror review queue model (AC: 1, 2, 3)
  - [x] Inspect existing tollgate/signoff/review models before finalizing fields.
  - [x] Add Prisma enums/model for queue item state and stable finding linkage.
  - [x] Relate records to `Organization` and optionally to latest `ControlMirrorSnapshot`.
  - [x] Add indexes for `organizationId`, `sourceFindingId`, state and snapshot lookup.
- [x] Add repository functions for sync and lookup (AC: 1, 2, 3)
  - [x] Create `packages/db/src/repositories/control-mirror-human-review-repository.ts`.
  - [x] Implement deterministic upsert by tenant and stable finding key.
  - [x] Preserve existing open item identity on repeated detection.
  - [x] Export repository functions from `packages/db/src/index.ts`.
- [x] Wire Control Mirror refresh/dashboard services to persisted queue state (AC: 1, 4)
  - [x] Sync generated `ControlMirrorHumanReviewItem[]` after snapshot refresh or dashboard build.
  - [x] Return persisted review item id/state alongside existing recommendation details.
  - [x] Keep release/readiness behavior unchanged for unresolved blockers in this story.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover generated item to persisted queue mapping.
  - [x] Cover duplicate prevention for the same finding.
  - [x] Cover organization isolation.
  - [x] Update Control Mirror page/service tests if the returned item shape changes.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-human-review-queue.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Epic 1 already generates Human Review recommendations in `packages/domain/src/control-mirror.ts`, including `sourceFindingId`, severity, decision format, affected object, blocking status and `/review?source=control-mirror` links. This story persists that queue state; it should not change the recommendation semantics unless persistence needs a stable identifier wrapper.

The existing Human Review dashboard is currently built from outcomes, tollgates, signoffs and party roles through `packages/db/src/repositories/human-review-repository.ts` and `packages/api/src/review-dashboard.ts`. Control Mirror is separate: `packages/db/src/repositories/control-mirror-repository.ts` builds a dashboard snapshot from AAS records, artifact intake, latest Control Mirror snapshot, tollgates and signoffs, then calls `buildControlMirrorDashboard`.

The existing Control Mirror snapshot persistence is in `packages/db/src/repositories/control-mirror-snapshot-repository.ts`. It creates `ControlMirrorSource`, `ControlMirrorSnapshot`, `ControlMirrorArtifact` and `ControlMirrorNormalizedEvidence` records from current import artifacts. Story 2.1 should add review queue persistence beside that model, not overload artifact candidates or signoff records.

Suggested persisted fields for the first slice:

- `id`
- `organizationId`
- `snapshotId` nullable
- `sourceFindingId`
- `stableFindingKey`
- `severity`
- `category`
- `decisionNeeded`
- `recommendedOption`
- `affectedObject`
- `affectedOutcomeId` nullable
- `affectedEpicId` nullable
- `affectedStoryId` nullable
- `blocksRelease`
- `sourceLineageJson`
- `state` with initial values such as `open` and `superseded`
- `createdAt`
- `updatedAt`

Decision recording and audit history belong to Story 2.2. For this story, keep any decision fields minimal or absent so the queue foundation stays tight.

### Project Structure Notes

- Domain types and generated recommendation logic: `packages/domain/src/control-mirror.ts`
- Dashboard DB read model: `packages/db/src/repositories/control-mirror-repository.ts`
- Snapshot refresh persistence: `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- Existing Human Review DB snapshot: `packages/db/src/repositories/human-review-repository.ts`
- API facade: `packages/api/src/control-mirror.ts`
- Control Mirror route: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Review route: `apps/web/src/app/(protected)/review/page.tsx`
- Existing tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`, `apps/web/src/test/review-queue-page.test.tsx`

### References

- [Epic 2 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-2-human-review-workflow-hardening.md)
- [Architecture handoff](_bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md)
- [Epic 1 Story 1.6](_bmad-output/implementation-artifacts/1-6-human-review-guardrails-and-control-report.md)
- [Epic 1 retrospective](_bmad-output/implementation-artifacts/epic-1-retro-2026-05-21.md)
- [Control Mirror reference](/docs/features/aas-control-mirror.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `pnpm test -- src/test/control-mirror-human-review-queue.test.ts` - initial sandboxed run failed because Vitest config access was denied; escalated run first failed as expected until the new repository exports existed.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-human-review-queue.test.ts` - passed, 2 tests.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-human-review-queue.test.ts` - passed, 13 tests. The existing React test warning about non-boolean `jsx/global` attributes remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing webpack cache snapshot warnings and Next ESLint plugin warning remain.
- `pnpm db:push` - passed and synced the local PostgreSQL schema.
- `pnpm build:web-runtime-packages` - passed after review fixes.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-human-review-queue.test.ts` - passed after review fixes, 14 tests. The existing React test warning about non-boolean `jsx/global` attributes remains.
- `pnpm --filter @aas-companion/web build` - passed after review fixes. Existing webpack cache snapshot warnings and Next ESLint plugin warning remain.

### Completion Notes List

- Added a first-class `ControlMirrorHumanReviewItem` persistence model with tenant scope, stable finding key, snapshot linkage, severity, recommendation fields, source lineage and queue state.
- Added deterministic preparation/merge helpers and repository sync so repeated Control Mirror findings update the same persisted queue item instead of duplicating it.
- Updated the Control Mirror dashboard API service to sync generated review recommendations to the queue and return persisted review identity/state on each item.
- Added an `isPersistent` snapshot flag so derived dashboard snapshots do not create invalid foreign-key links to non-ControlMirror snapshot ids.
- Added focused tests for queue row preparation, deduplication and persisted-state merge, then reran existing Control Mirror rule/page regressions.
- Resolved code review findings by removing dynamic affected-object text from stable finding keys and syncing the persisted review queue immediately after Control Mirror snapshot refresh.

### File List

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260521213000_control_mirror_human_review_queue/migration.sql`
- `packages/db/src/repositories/control-mirror-human-review-repository.ts`
- `packages/db/src/index.ts`
- `packages/domain/src/control-mirror.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/test/control-mirror-human-review-queue.test.ts`
- `_bmad-output/planning-artifacts/aas-control-mirror-epic-2-human-review-workflow-hardening.md`
- `_bmad-output/implementation-artifacts/2-1-persist-control-mirror-human-review-queue.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented Story 2.1 persisted Control Mirror Human Review queue, API sync and focused test coverage.
- 2026-05-21: Addressed simulated code review findings for stable aggregate keys and refresh-time queue sync.

## Senior Developer Review (AI)

Review mode: simulated internal review by the same Codex session. Not independent QA/AQA.

Outcome: Changes requested, then resolved.

### Findings

- [x] Stable finding key used dynamic `affectedObject` text, which could create duplicate queue rows when aggregate counts changed.
- [x] Refresh service created a new Control Mirror snapshot without syncing the persisted Human Review queue until the dashboard was loaded.

### Resolution

- Stable finding keys now use source finding, category and affected entity ids, avoiding volatile count text.
- `refreshControlMirrorCurrentImportsSnapshotService` now loads the dashboard after refresh and syncs generated Human Review items to persistence immediately.
- Added test coverage for aggregate finding key stability.
