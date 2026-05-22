---
story_key: 1-3-aas-normalization-and-story-readiness-classification
epic: Control Mirror MVP
traceability:
  - CM-02.1
  - CM-02.2
status: done
created: 2026-05-21
---

# Story 1.3: AAS Normalization and Story Readiness Classification

## User Story

As an AQA, I want scanned artifacts normalized into canonical AAS evidence so that Control Mirror can compare design/build output against Framing and Value Spine.

## Acceptance Criteria

```gherkin
Given artifacts are present in a snapshot
When normalization runs
Then recognized content is mapped into AAS evidence types with source lineage

Given a story-like item is detected
When it lacks build-readiness fields
Then it is classified as Story Idea, Candidate Delivery Story, Exploration Story or Out of Scope/Deferred

Given normalized evidence is created
When I inspect it
Then the original source is not overwritten
And lineage to snapshot, file and source section is retained
```

## Implementation Scope

- Add deterministic AAS normalization rules for Control Mirror artifacts.
- Persist normalized evidence separately from the original artifact manifest.
- Keep source lineage to snapshot, artifact, file and section/excerpt.
- Classify story-like content into readiness categories.
- Surface normalization/readiness summary on `/control-mirror`.

## Out of Scope

- AI semantic parsing.
- Multi-section extraction from long documents.
- Full story promotion workflow.
- Framing cross-reference scoring.
- Human Review persistence.

## Verification

- Add domain and page tests for normalization/readiness behavior.
- Run Prisma generation, runtime package build, targeted tests, web build and DB schema sync.

## Tasks/Subtasks

- [x] Add deterministic AAS evidence normalization rules for Control Mirror artifacts.
- [x] Add story-like classification and build-readiness missing-field detection.
- [x] Persist normalized evidence separately from artifact manifest rows.
- [x] Retain lineage to snapshot, artifact, source file, source section and excerpt.
- [x] Surface normalization/readiness summary and detail rows on `/control-mirror`.
- [x] Add targeted domain and page tests for normalization behavior.
- [x] Run Prisma generation, runtime package build, targeted tests, web build and local DB schema sync.

## Dev Agent Record

### Debug Log

- `pnpm db:generate` passed after adding normalized evidence enums/model.
- `pnpm build:web-runtime-packages` passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` initially caught overly broad page assertions after the same file appeared in both normalization and artifact tables; assertions were updated to expect multiple visible references.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` passed: 2 files, 7 tests.
- `pnpm --filter @aas-companion/web build` passed.
- `pnpm db:push` passed and synced the local PostgreSQL schema.

### Completion Notes

- Story 1.3 acceptance criteria are implemented with deterministic normalization, not AI semantic parsing.
- Normalized evidence is stored in `ControlMirrorNormalizedEvidence` and does not overwrite the original artifact manifest/source excerpt.
- Story-like evidence is classified as candidate delivery story, framing story idea, exploration, epic candidate, acceptance criteria candidate, journey/UX context, out-of-scope/deferred or not story-like.
- Build-readiness gaps are exposed through missing readiness fields and summarized in the Control Mirror dashboard.

### File List

- `packages/domain/src/control-mirror.ts`
- `packages/db/prisma/schema.prisma`
- `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- `packages/db/src/repositories/control-mirror-repository.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `_bmad-output/implementation-artifacts/1-3-aas-normalization-and-story-readiness-classification.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented persistent AAS normalization and story readiness classification for Control Mirror snapshots.

## Status

Done
