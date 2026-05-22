---
story_key: 1-4-framing-cross-reference-and-build-conformance-engine
epic: Control Mirror MVP
traceability:
  - CM-03.1
  - CM-03.2
  - CM-03.3
  - CM-05.1
  - CM-05.2
status: done
created: 2026-05-21
---

# Story 1.4: Framing Cross-Reference and Build Conformance Engine

## User Story

As a Value Owner, I want design and build artifacts checked against approved Framing and Value Spine so that scope drift, weak traceability and over-claimed AI levels are visible before release decisions.

## Acceptance Criteria

```gherkin
Given an approved Framing version exists
When Control Mirror evaluates design artifacts
Then each artifact is assessed against Outcome, baseline, scope, constraints, AI level and risk profile

Given an implementation artifact lacks Story-ID or requirement source
When Build Conformance runs
Then it is flagged as Untraced Artifact and treated as release risk

Given requested AI level is Level 2 or Level 3
When required evidence is missing
Then Control Mirror recommends downgrade, pause, controls or exception approval
```

## Implementation Scope

- Add deterministic framing cross-reference checks over normalized evidence and active Value Spine records.
- Add build conformance findings for implementation/test artifacts.
- Add AI-level evidence recommendation output using existing requested/achieved level calculation.
- Surface conformance summary and findings on `/control-mirror`.

## Out of Scope

- AI semantic matching.
- Persisted Human Review creation.
- Full scope-out policy engine.
- Final Control Mirror report generation.

## Verification

- Add/update domain and page tests for cross-reference, untraced artifact and AI-level recommendation behavior.
- Run runtime package build, targeted tests and web build.

## Tasks/Subtasks

- [x] Add deterministic framing cross-reference and build conformance result model.
- [x] Evaluate normalized design evidence against active Outcome/Epic/Story framing signals.
- [x] Flag unlinked delivery candidates as potential scope drift.
- [x] Flag untraced implementation/test evidence as release risk.
- [x] Add requested-vs-achieved AI-level recommendation output.
- [x] Surface conformance summary and findings on `/control-mirror`.
- [x] Add targeted domain and page tests.
- [x] Run runtime package build, targeted tests and web build.

## Dev Agent Record

### Debug Log

- `pnpm build:web-runtime-packages` passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` initially caught page assertions that became duplicated after the conformance table surfaced the same evidence/action text; assertions were updated to expect multiple visible references.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` passed: 2 files, 8 tests.
- `pnpm --filter @aas-companion/web build` passed.
- No DB sync was required for this story because no schema changes were introduced.

### Completion Notes

- Story 1.4 acceptance criteria are implemented as deterministic conformance checks.
- Control Mirror now exposes framing alignment counts, scope drift/out-of-scope counts, build traceability findings, release-risk counts and an AI-level recommendation.
- Untraced implementation/test evidence is treated as release risk.
- Scope drift findings are promoted into Human Review recommendations.

### File List

- `packages/domain/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `_bmad-output/implementation-artifacts/1-4-framing-cross-reference-and-build-conformance-engine.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-21: Implemented Control Mirror framing cross-reference and build conformance engine.

## Status

Done
