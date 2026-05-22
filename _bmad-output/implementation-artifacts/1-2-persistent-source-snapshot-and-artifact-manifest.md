---
story_key: 1-2-persistent-source-snapshot-and-artifact-manifest
epic: Control Mirror MVP
traceability:
  - CM-01.1
  - CM-01.2
  - CM-01.3
status: done
created: 2026-05-21
---

# Story 1.2: Persistent Source Snapshot and Artifact Manifest

## User Story

As a Delivery Lead, I want Control Mirror to register a project source and create persistent snapshots so that scans can be refreshed and compared over time.

## Acceptance Criteria

```gherkin
Given an active AAS project exists
When I register a Control Mirror source
Then a source record is created with source type, label and support status

Given a source is scanned
When snapshot creation completes
Then each file is stored in an artifact manifest with path, name, hash, type, parsing status and lineage status

Given a previous snapshot exists
When I refresh the source
Then files are classified as unchanged, new, modified, deleted or unreadable
```

## Implementation Scope

- Add persistent Control Mirror source, snapshot and artifact records.
- Support the first real source mode: `current_imports`, derived from existing Artifact Intake files.
- Create and refresh snapshots from current import files.
- Compare file path and hash with the previous snapshot for change status.
- Show persistent snapshot metadata and artifact manifest on `/control-mirror`.

## Out of Scope

- Uploaded zip extraction.
- Browser folder snapshot.
- Git/repository connector.
- Real-time file watching.
- Executing project code.

## Verification

- Add domain/repository/page tests for snapshot manifest behavior.
- Run runtime package build, targeted tests and web build.

## Tasks/Subtasks

- [x] Add persistent Prisma records for Control Mirror sources, snapshots and artifact manifests.
- [x] Implement `current_imports` snapshot refresh from existing Artifact Intake files.
- [x] Compare refreshed files to the previous completed snapshot by path and hash.
- [x] Surface persistent snapshot metadata, change counts and artifact change status on `/control-mirror`.
- [x] Add targeted domain and page coverage for persistent snapshot behavior.
- [x] Run Prisma generation, runtime package build, targeted tests, web build and local DB schema sync.

## Dev Agent Record

### Debug Log

- `pnpm db:generate` passed.
- `pnpm build:web-runtime-packages` initially caught a widened `changeStatus` type in the Prisma createMany payload; fixed with explicit `ControlMirrorArtifactChangeStatus`.
- `pnpm build:web-runtime-packages` passed after the type fix.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` passed: 2 files, 6 tests.
- `pnpm --filter @aas-companion/web build` initially caught a non-conforming Next page prop signature; fixed by making `searchParams` a Next 15 Promise prop.
- `pnpm --filter @aas-companion/web build` passed.
- `pnpm db:push` passed and synced the local PostgreSQL schema.

### Completion Notes

- Story 1.2 acceptance criteria are implemented for the first supported source mode, `current_imports`.
- Control Mirror now creates a source record when needed, persists completed snapshots, stores artifact manifest rows and classifies changes as unchanged, new, modified or deleted.
- The `/control-mirror` page can refresh the current import snapshot and shows snapshot counts plus per-artifact change status.

### File List

- `packages/db/prisma/schema.prisma`
- `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- `packages/db/src/repositories/control-mirror-repository.ts`
- `packages/db/src/index.ts`
- `packages/domain/src/control-mirror.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/actions.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `_bmad-output/implementation-artifacts/1-2-persistent-source-snapshot-and-artifact-manifest.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented persistent Control Mirror source/snapshot/artifact manifest refresh for `current_imports`.

## Status

Done
