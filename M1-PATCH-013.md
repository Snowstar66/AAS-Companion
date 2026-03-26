# M1-PATCH-013

## Title
Show object provenance for demo and native cases

## Story Type
UI / Transparency Patch

## Value Intent
Help users understand where case data comes from so demo-seeded examples are not confused with real authored customer work.

## Summary
Add lightweight provenance indicators in Framing list and Outcome Workspace to distinguish demo-seeded and native-authored cases, and make clean customer work visually clear.

## Acceptance Criteria
- Framing list shows visible origin labeling for cases
- supported visible labels include:
  - Demo
  - Native
- Outcome Workspace shows visible provenance summary for the current case
- provenance summary includes at least:
  - Origin
  - Status
- clean newly created cases show:
  - Origin: Native
  - Status: Draft
- demo-seeded cases show a clear demo-oriented label
- provenance indicators are visible without overwhelming the UI
- provenance indicators do not interfere with editing or Tollgate behavior
- provenance remains understandable across both seeded and newly created cases

## AI Usage Scope
- CODE
- TEST

## Test Definition
- component
- integration
- e2e smoke

## Definition of Done
- users can reliably distinguish demo and native cases
- provenance is visible in both list and detail context
- provenance UI does not create unnecessary noise
- existing case editing behavior remains unchanged

## Scope In
- provenance badges
- provenance summary in Outcome Workspace
- Framing list labeling
- basic visual treatment for demo vs native

## Scope Out
- imported provenance handling
- lineage drilldown
- approval/evidence linkage
- readiness redesign

## Constraints
- provenance display must remain lightweight
- provenance must clarify object origin without introducing a separate workflow
- patch must not depend on imported object implementation
- patch must not change case governance semantics

## Required Evidence
- screenshot of Framing list with demo/native badges
- screenshot of Outcome Workspace provenance summary
- side-by-side example of demo and native case labeling