# M1-PATCH-011

## Title
Make clean case creation the primary Framing entry point

## Story Type
UX / Workflow Improvement

## Value Intent
Allow teams to start a real customer case from a clean Framing state without being confused by demo-seeded data.

## Summary
Adjust the Framing entry experience so users can clearly choose between starting a new clean case and exploring demo data, with clean case creation becoming the primary action for normal work.

## Acceptance Criteria
- Framing entry view shows two clear actions:
  - Start new case
  - Open demo case
- Start new case is the primary action
- Open demo case is secondary and clearly labeled as demo
- Start new case is available from the main Framing entry area without requiring prior demo navigation
- selecting Start new case initiates the existing governed Outcome creation path
- selecting Open demo case opens existing demo-seeded content without changing native case behavior
- existing demo flows continue to work
- Framing entry remains understandable for first-time users

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- a user can start a clean case directly from Framing
- a user can still access demo cases intentionally
- clean case is the obvious default path for real work
- existing demo behavior is preserved
- no new governance logic is introduced in this patch

## Scope In
- Framing entry actions
- CTA hierarchy
- demo labeling in entry area
- routing from Framing entry

## Scope Out
- new governance rules
- authority matrix
- approvals
- staffing readiness
- imported artifact promotion

## Constraints
- patch must not change underlying governance logic
- patch must not remove demo support
- patch must not introduce a separate workspace model for clean cases
- clean case creation must reuse existing Outcome and Tollgate behavior
- demo entry must remain available but secondary

## Required Evidence
- screenshot of Framing entry with both actions
- screenshot showing clean case as primary CTA
- short demo of navigating to demo path without affecting native flow