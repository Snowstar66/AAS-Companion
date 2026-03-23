# M1-STORY-007

## Title
Build Story Workspace with required AAS fields

## Story Type
UI + Domain Feature

## Value Intent
Ensure Story design quality before build handoff by enforcing the minimum AAS story structure.

## Summary
Build the Story Workspace with validation for Test Definition and Definition of Done.

## Acceptance Criteria
- Story Workspace shows:
  - title
  - story type
  - value intent
  - acceptance criteria
  - AI Usage Scope
  - Test Definition
  - Definition of Done
- Story cannot be marked ready if Test Definition is empty
- Story cannot be marked ready if Definition of Done is empty
- validation messages are clear and inline
- readiness panel reflects missing fields
- save and reload preserves values
- important changes create activity events

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e

## Definition of Done
- values persist correctly
- blocked and valid readiness states are both demonstrable
- validation is server-backed
- UI clearly shows what is missing

## Scope In
- Story detail route
- Story form sections
- validation schema
- readiness calculator
- persistence

## Scope Out
- linked test artifact management
- evidence explorer
- external tool export

## Constraints
- no ready-for-build state without server validation
- Story-ID must remain visible
- UI should reinforce structured Story design

## Required Evidence
- screenshots
- validation test result
- persistence demo
- activity event example