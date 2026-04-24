# Performance audit - 2026-04-24

## Status

- GitHub label: created as `performance`.
- Local build: passed with `pnpm build`.
- Worktree note: the repo already had unrelated modified and untracked files before this audit.

## Build signal

Next build completed successfully. The heaviest first-load routes are:

| Route | First Load JS | Route chunk signal |
| --- | ---: | ---: |
| `/framing` | 242 kB | `app/(protected)/framing/page` chunk ~147.3 kB |
| `/outcomes/[outcomeId]` | 207 kB | shares the framing workspace surface |
| `/stories/[storyId]` | 169 kB | `app/(protected)/stories/[storyId]/page` chunk ~60 kB |
| `/help` | 149 kB | static help payload/data likely dominates |

Shared first-load JS is 102 kB.

## Findings

### 1. Framing workspace ships too much client code up front

`apps/web/src/app/(protected)/framing/page.tsx` loads `FramingOutcomeSection` for the selected outcome path, and `FramingOutcomeSection` imports several large interactive panels: `AiAssistantPanel`, `OutcomeAiRiskPostureCard`, `OutcomeAiReviewDialog`, `FramingBriefExportPanel`, value-spine tree, and tollgate review UI.

Evidence:

- `apps/web/src/app/(protected)/framing/page.tsx:232`
- `apps/web/src/app/(protected)/framing/page.tsx:460`
- `apps/web/src/components/framing/framing-outcome-section.tsx:19`
- `apps/web/src/components/framing/framing-outcome-section.tsx:20`
- `apps/web/src/components/framing/framing-outcome-section.tsx:28`
- Build output: `/framing` is 242 kB First Load JS.

Risk: slow first interaction on the main workflow, especially on mobile or slower laptops.

### 2. Outcome workspace fetches broad nested data, including heavy sketch payloads

`getOutcomeWorkspaceSnapshot` and the broader workspace snapshots select complete nested epics, direction seeds, stories, JSON journey contexts, downstream instructions, and in some paths base64 sketch fields. This is useful for rendering all tabs immediately, but it makes every page load pay for data that may be below the fold or on another subpage.

Evidence:

- `packages/db/src/repositories/outcome-repository.ts:434`
- `packages/db/src/repositories/outcome-repository.ts:437`
- `packages/db/src/repositories/workspace-repository.ts:52`
- `packages/db/src/repositories/workspace-repository.ts:111`
- `packages/db/src/repositories/workspace-repository.ts:112`
- `packages/db/src/repositories/workspace-repository.ts:477`

Risk: database time, server render time, cache payload size, and RSC payload all grow with project size.

### 3. Tollgate review reloads the outcome snapshot instead of reusing page data

The outcome/framing page first loads `getCachedOutcomeWorkspaceData`. Inside `FramingOutcomeSection`, the tollgate section then calls `getCachedOutcomeTollgateReviewData`, whose service calls `getOutcomeWorkspaceSnapshot` again.

Evidence:

- `apps/web/src/app/(protected)/outcomes/[outcomeId]/page.tsx:35`
- `apps/web/src/components/framing/framing-outcome-section.tsx:1645`
- `apps/web/src/components/framing/framing-outcome-section.tsx:1646`
- `packages/api/src/workspace.ts:282`
- `packages/api/src/workspace.ts:284`

Risk: duplicate heavy reads on the same request path and duplicate cache entries for overlapping data.

### 4. Several hot paths do repeated in-memory filtering

The code repeatedly filters arrays by `epicId`, candidate type, workflow, and session grouping during render/service composition. This is fine for small demo data, but becomes O(n*m) as imported artifacts, epics, stories, and journey contexts grow.

Evidence:

- `packages/db/src/repositories/outcome-repository.ts:535`
- `packages/db/src/repositories/outcome-repository.ts:536`
- `apps/web/src/components/framing/framing-outcome-section.tsx:1400`
- `apps/web/src/components/framing/framing-outcome-section.tsx:1450`
- `apps/web/src/components/intake/artifact-intake-review-workspace.tsx:930`
- `apps/web/src/components/intake/artifact-intake-review-workspace.tsx:1135`
- `apps/web/src/app/(protected)/review/page.tsx:1204`

Risk: slow server render and client render when a project has many imported candidates or story ideas.

### 5. Story workspace has serial follow-up queries and an org-wide scan

`getStoryWorkspaceService` loads the story snapshot, then tries imported blockers, then loads linked seed data. If there is no direct source seed, it calls `listDirectionSeeds(organizationId, { includeArchived: true })` and finds the matching seed in memory.

Evidence:

- `packages/api/src/workspace.ts:740`
- `packages/api/src/workspace.ts:755`
- `packages/api/src/workspace.ts:800`
- `packages/api/src/workspace.ts:805`
- `apps/web/src/app/(protected)/stories/[storyId]/page.tsx:57`

Risk: story pages degrade as the project accumulates story ideas, especially imported/archive history.

### 6. Dashboard, review, and intake surfaces are unbounded

Home/dashboard and review/intake list paths fetch and render broad sets without visible pagination or hard caps in several places. Review and intake also contain large page/component files with lots of repeated render-time grouping.

Evidence:

- `packages/db/src/repositories/workspace-repository.ts:477`
- `packages/db/src/repositories/workspace-repository.ts:512`
- `packages/db/src/repositories/workspace-repository.ts:535`
- `apps/web/src/app/(protected)/review/page.tsx:1109`
- `apps/web/src/app/(protected)/review/page.tsx:1126`
- `apps/web/src/app/(protected)/intake/page.tsx:216`
- `apps/web/src/app/(protected)/intake/page.tsx:589`

Risk: initial load gets slower with normal product usage.

### 7. Cache exists, but invalidation is very broad

There is good use of `unstable_cache` for framing cockpit, outcome workspace, tollgate review, and value owners. Many actions also call multiple `revalidatePath` entries, often covering `/framing`, `/workspace`, `/stories`, `/review`, and `/`.

Evidence:

- `apps/web/src/lib/cache/project-data.ts:24`
- `apps/web/src/lib/cache/project-data.ts:34`
- `apps/web/src/lib/cache/project-data.ts:44`
- `apps/web/src/app/(protected)/outcomes/[outcomeId]/actions.ts:524`
- `apps/web/src/app/(protected)/stories/[storyId]/actions.ts:139`
- `apps/web/src/app/(protected)/intake/actions.ts:1053`

Risk: useful cached work is frequently invalidated, so the app may behave as if uncached during active editing.

## Recommended optimization plan

### Phase 0: Instrument before changing behavior

1. Keep the existing `[perf]` timing helper but make it production-safe behind an env flag such as `AAS_PERF_LOGS=1`.
2. Add timings around the heaviest services:
   - `getOutcomeWorkspaceSnapshot`
   - `getOutcomeTollgateReviewService`
   - `getStoryWorkspaceService`
   - `getHomeDashboardSnapshot`
   - `loadArtifactIntakeWorkspace`
   - `loadArtifactReviewQueue`
3. Add counters to timing details: outcomes, epics, direction seeds, stories, tollgates, candidates, files, rendered sections.
4. Capture baseline numbers for `/framing`, `/outcomes/[outcomeId]`, `/stories/[storyId]`, `/review`, `/intake`, and `/`.

### Phase 1: Quick wins

1. Split heavy client panels from `/framing`:
   - dynamically import `AiAssistantPanel`;
   - lazy-load export/review panels behind disclosure state or subpage navigation;
   - keep the first viewport as mostly server-rendered HTML.
2. Stop loading sketch data in broad workspace/list snapshots. Fetch `uxSketchDataUrl` and `uxSketches` only on the specific editor/detail panel that needs them.
3. Replace repeated `array.filter` per epic with precomputed maps:
   - `directionSeedsByEpicId`
   - `storiesByEpicId`
   - candidates grouped by file/type/session.
4. Avoid the duplicate outcome snapshot in tollgate review by passing the already-loaded outcome/tollgate/readiness context into the tollgate section or by making the tollgate review service accept a slim snapshot.

### Phase 2: Data-shape fixes

1. Create slim repository methods:
   - cockpit list shape;
   - outcome overview shape;
   - outcome journey-context shape;
   - outcome downstream-instructions shape;
   - tollgate review shape;
   - story overview shape.
2. Move page tabs/subpages to their own data loaders so `/framing?subpage=journey-context` does not load export/review/edit payloads.
3. Replace `listDirectionSeeds(...).find(...)` in story workspace with a direct indexed query by `sourceStoryId`.
4. Add hard caps and pagination to dashboard/review/intake lists, with "open focused workspace" as the deep detail route.

### Phase 3: Storage and payload

1. Move base64 sketch/image data out of core rows and store references/thumbnails.
2. Keep full artifact file content out of backlog/list views; load file content only when a file is selected.
3. Consider derived summary tables or materialized read models for review/dashboard counts if projects become large.

### Phase 4: Verification gates

1. Add a build-size budget check for route chunks, initially warning at:
   - `/framing` route chunk > 120 kB;
   - shared First Load JS > 110 kB;
   - any protected route First Load JS > 220 kB.
2. Add integration tests for the new slim loaders to prevent accidental re-expansion.
3. Run Playwright traces for the main flows after each phase and compare:
   - server response time;
   - JS transferred;
   - hydration time;
   - first interaction readiness.

## Priority recommendation

Start with `/framing`, because it is the heaviest route and central to the product. The best first implementation slice is:

1. split `AiAssistantPanel` and export/review panels out of the initial client bundle;
2. remove sketch payloads from default workspace queries;
3. eliminate the duplicate tollgate review snapshot load;
4. add timings/counters so the next optimization is data-driven.

## Implemented first optimization slice

Implemented on 2026-04-24:

1. Added `AAS_PERF_LOGS=1` support to web/API/DB timing helpers while keeping dev timings enabled locally.
2. Split the heaviest framing client panels through `apps/web/src/components/framing/framing-lazy-panels.tsx`:
   - `AiAssistantPanel`
   - `FramingBriefExportPanel`
   - `OutcomeAiReviewDialog`
   - `OutcomeAiRiskPostureCard`
3. Replaced repeated epic-scoped `filter()` work in `FramingOutcomeSection` with precomputed maps for direction seeds, stories, and mapped source story IDs.
4. Replaced an org-wide `listDirectionSeeds(...).find(...)` in story workspace loading with a direct `getDirectionSeedBySourceStoryId` repository query.
5. Added the supporting Prisma index: `DirectionSeed(organizationId, sourceStoryId)`.
6. Replaced the duplicate full outcome workspace load for Tollgate 1 review with a slim `getOutcomeTollgateReviewSnapshot` repository method.
7. Replaced repeated per-epic filtering inside `getOutcomeWorkspaceSnapshot` with precomputed direction-seed and story maps.
8. Replaced repeated candidate/file scans in the artifact intake workspace loader with maps and single-pass counters.
9. Replaced repeated review-queue summary filters with a single-pass queue summarizer.
10. Fixed structured framing constraint heading normalization for markdown headings with repeated hashes, which stabilized the existing intake helper test.

Build verification after implementation:

| Route | Before | After |
| --- | ---: | ---: |
| `/framing` | 242 kB | 216 kB |
| `/outcomes/[outcomeId]` | 207 kB | 147 kB |
| `/stories/[storyId]` | 169 kB | 169 kB |

`pnpm build` passes after the changes.

Targeted test verification:

- `pnpm test -- src/test/story-workspace-page.test.tsx`
- `pnpm test -- src/test/value-spine-page.test.tsx`
- `pnpm test -- src/test/framing-cockpit.test.tsx`
- `pnpm test -- src/test/review-queue-page.test.tsx`
- `pnpm test -- src/test/artifact-intake-helpers.test.ts`

## Implemented DB round-trip optimization slice

Implemented after the initial bundle/data-shape pass:

1. `submitOutcomeTollgateService` now uses the slim tollgate review snapshot instead of the full outcome workspace snapshot.
2. `recordTollgateDecisionService` now uses the slim tollgate review snapshot to refresh outcome readiness/version state before sign-off decisions.
3. Approval-document snapshot generation still loads the full outcome workspace snapshot, but only on the approval path where the full document payload is actually needed.
4. Sign-off person validation now fetches the selected active party role directly instead of loading the full active project role list.
5. Tollgate review action composition now groups active people and signoff records once, avoiding repeated per-requirement scans.

## Implemented fast framing authoring slice

Focused on the paths Pontus called out: Framing approval, Create Epic, and Create Story Idea.

1. Native Epic creation now loads only existing Epic keys instead of all Epic records.
2. Native Story Idea creation now loads only existing Direction Seed keys instead of all Story Idea records.
3. Delivery Story creation from a Story Idea now loads only existing Story keys and a linked-story count instead of full story lists.
4. The new key-only lookups keep the same `EPC-###`, `SEED-###`, and `STR-###` key behavior while reducing DB payload size on hot create actions.

## Implemented targeted invalidation slice

Focused on the low-hanging cache cost in the same fast authoring paths.

1. Kept the existing auth/project guards because they are already request-cached through `react.cache` and are not the main repeated cost.
2. Added small shared revalidation helpers for Outcome and Epic framing actions so the hot paths invalidate the same focused surfaces consistently.
3. Removed broad `/`, `/workspace`, and unrelated `/stories` invalidations from common Framing save/create flows:
   - save Outcome framing;
   - submit/record Tollgate 1 approval;
   - create Epic from Outcome;
   - create Story Idea from Outcome/Epic;
   - save Story Idea;
   - create Delivery Story from a Story Idea.
4. Kept targeted invalidation for `/framing`, the current Outcome/Epic/Story Idea route, approval-document route, and `/review` where approval decisions need it.
