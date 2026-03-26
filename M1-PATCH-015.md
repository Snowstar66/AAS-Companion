# M1-PATCH-015

## Title
Verify clean customer case flow from Framing to blocked Tollgate 1

## Story Type
Test / Validation Patch

## Value Intent
Prove that the product can support a real clean customer case flow before M3 governance features are added.

## Summary
Add end-to-end validation for the clean case path so a new native case can be created from Framing, opened in Outcome Workspace and correctly blocked at Tollgate 1 until required Framing inputs are provided.

## Acceptance Criteria
- e2e flow covers Start new case from Framing entry
- e2e flow verifies redirect to Outcome Workspace
- e2e flow verifies new case is marked as native
- e2e flow verifies no demo stories or almost-ready data are attached
- e2e flow verifies Tollgate 1 is blocked on incomplete Framing data
- e2e flow verifies blocker messaging is visible
- e2e flow verifies demo path still works after clean case patching
- e2e flow verifies native filtering and provenance labeling where relevant

## AI Usage Scope
- CODE
- TEST

## Test Definition
- e2e
- smoke

## Definition of Done
- clean customer case flow is demonstrable end-to-end
- expected blocked Tollgate behavior is verified
- demo path regression risk is reduced
- product is ready to move into M3 without losing the native clean-start path

## Scope In
- e2e for Start new case
- e2e for clean Outcome creation
- e2e for blocked Tollgate 1
- e2e regression check for demo path
- e2e check for provenance/filter behavior where applicable

## Scope Out
- M3 role readiness
- approvals
- imported artifact scenarios
- build tool integration

## Constraints
- test must validate existing governed behavior rather than mock it away
- test must cover both clean path and surviving demo path
- validation must remain lightweight and focused on pre-M3 readiness

## Required Evidence
- e2e run output
- video or screenshots of clean case flow
- screenshot of blocked Tollgate 1 on new native case
- screenshot showing demo path still available