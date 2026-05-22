---
story_key: 1-5-test-evidence-and-value-spine-coverage
epic: Control Mirror MVP
traceability:
  - CM-06.1
  - CM-06.2
  - CM-08.2
status: done
created: 2026-05-21
---

# Story 1.5: Test Evidence and Value Spine Coverage

## User Story

As an AQA, I want test evidence mapped to Outcome, Epic and Story so that release readiness is based on value coverage instead of only technical execution.

## Acceptance Criteria

```gherkin
Given test evidence exists
When Control Mirror parses it
Then each evidence item is mapped to test id, Story-ID, Epic, Outcome, test level, result and evidence source

Given Stories exist in the Value Spine
When coverage is calculated
Then the dashboard distinguishes no test, test definition only, implemented tests, passing tests, failing tests and manual verification only

Given a Value Spine link is broken
When I open coverage detail
Then the missing link is highlighted
And untraced implementation artifacts are shown outside the Value Spine
```

## Implementation Scope

- Add deterministic test evidence mapping from normalized evidence and artifact manifest rows.
- Add story-level Value Spine coverage details for Outcome -> Epic -> Story -> Test.
- Surface missing links and untraced implementation artifacts outside the Value Spine.
- Extend Control Mirror dashboard coverage UI and tests.

## Out of Scope

- CI provider integrations.
- Deep parsing of every test reporter format.
- Persisted test-run history.
- Full report generation.

## Verification

- Add/update domain and page tests for test evidence mapping, story coverage states and broken Value Spine links.
- Run runtime package build, targeted tests and web build.

## Tasks/Subtasks

- [x] Add deterministic test evidence mapping model.
- [x] Map test evidence to Story-ID, Epic, Outcome, level, result and evidence source.
- [x] Calculate story-level Value Spine coverage states.
- [x] Surface broken Value Spine links and untraced implementation artifacts outside the spine.
- [x] Add Value Spine test coverage UI to `/control-mirror`.
- [x] Add targeted domain and page tests.
- [x] Run runtime package build, targeted tests and web build.

## Dev Agent Record

### Debug Log

- `pnpm build:web-runtime-packages` passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` passed: 2 files, 9 tests.
- `pnpm --filter @aas-companion/web build` initially caught a tuple inference issue in the test evidence summary list; fixed by extracting a typed `Array<[string, number]>`.
- `pnpm --filter @aas-companion/web build` passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` passed again after the build fix.
- No DB sync was required for this story because no schema changes were introduced.

### Completion Notes

- Story 1.5 acceptance criteria are implemented as deterministic test coverage checks.
- Control Mirror now maps normalized test evidence to Story, Epic and Outcome when Story-ID is present.
- Story coverage distinguishes no test, test definition only, implemented tests, passing tests, failing tests, manual verification only and behavioural contract tests.
- Untraced implementation/test artifacts are shown outside the Value Spine.

### File List

- `packages/domain/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `_bmad-output/implementation-artifacts/1-5-test-evidence-and-value-spine-coverage.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented Control Mirror test evidence and Value Spine coverage mapping.

## Status

Done
