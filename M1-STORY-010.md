# M1-STORY-010

## Title
Implement end-to-end happy path and blocked path

## Story Type
Test Feature

## Value Intent
Prove that the first usable slice behaves coherently across auth, governance and UI.

## Summary
Implement Playwright scenarios for blocked and successful M1 flows.

## Acceptance Criteria
- e2e scenario covers login and dashboard
- e2e scenario covers Outcome with missing baseline and blocked Tollgate 1
- e2e scenario covers Outcome with completed baseline and successful submit
- e2e scenario covers Story missing Test Definition and blocked readiness
- e2e scenario covers valid Story and Execution Contract preview
- test results can be reviewed by a human operator
- failure artifacts are captured on failure

## AI Usage Scope
- CODE
- TEST

## Test Definition
- e2e

## Definition of Done
- Playwright runs locally
- tests can run in CI or CI-like mode
- failure screenshots or traces are captured
- results are documented for M1 review

## Scope In
- Playwright config
- fixtures
- scenario scripts
- failure artifacts
- M1 demo verification

## Scope Out
- visual regression suite
- multi-browser matrix beyond basic target coverage
- performance benchmark suite

## Constraints
- tests must reflect real user flows, not only mock flows
- blocked path is as important as happy path
- test setup must remain understandable for later extension

## Required Evidence
- Playwright report
- screenshots
- trace artifact
- M1 demo verification notes