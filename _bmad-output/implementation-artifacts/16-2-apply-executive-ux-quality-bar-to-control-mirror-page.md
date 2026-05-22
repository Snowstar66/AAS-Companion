# Story 16.2: Apply Executive UX Quality Bar to Control Mirror Page

Date: 2026-05-22
Status: done

## User Story

As a mandate holder, I want the Control Mirror page to answer the key control questions immediately so that I can understand source, posture, human decisions and evidence gaps before drilling into audit detail.

## Acceptance Criteria

1. Given the Control Mirror page loads, when the first viewport is visible, then it shows source judged, control posture, human decisions and evidence gaps.
2. Given AI, lineage or Value Spine evidence is missing, when the page loads, then those gaps are counted and treated as risk.
3. Given implementation artifacts are untraced, when the Value Spine diagram renders, then they appear outside the spine rather than inside the approved flow.
4. Given the regression test runs, when Control Mirror renders, then the new first-viewport UX cues are asserted.

## Implementation

- Updated `apps/web/src/app/(protected)/control-mirror/page.tsx`
  - Added first-viewport signal panels inside the Control Mirror hero.
  - Summarized source judged, control posture, human decisions and evidence gaps.
  - Extended `ValueSpineDiagram` to show untraced artifacts outside the spine.
- Updated `apps/web/src/test/control-mirror-page.test.tsx`
  - Added assertions for the new first-viewport cues and outside-spine artifact count.

## Verification

- `pnpm test -- src/test/control-mirror-page.test.tsx`
  - Pass: 1 file, 2 tests.
- `pnpm --filter @aas-companion/web build`
  - Pass.

## Notes

The page still keeps detailed evidence in expandable/audit sections; this slice improves the executive entry point without hiding traceability.
