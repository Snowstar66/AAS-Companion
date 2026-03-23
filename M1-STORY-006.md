# M1-STORY-006

## Title
Build Outcome Workspace with Tollgate 1 validation

## Story Type
UI + Domain Feature

## Value Intent
Make AAS Framing discipline visible and enforceable in the product.

## Summary
Build the Outcome Workspace with baseline validation and a Tollgate 1 panel.

## Acceptance Criteria
- Outcome Workspace shows:
  - summary
  - baseline
  - risks
  - epic seeds
  - approvals
  - tollgate panel
- user can edit outcome statement
- user can edit baseline definition
- user can edit baseline source
- Tollgate 1 submission is blocked when required fields are missing
- clear inline message explains what is missing
- once required fields are present, user can submit to Tollgate 1 review
- activity event is created on submit
- blockers appear in the right rail

## AI Usage Scope
- CODE
- TEST
- CONTENT

## Test Definition
- unit
- integration
- e2e

## Definition of Done
- validation is enforced server-side
- blocked and valid states are both demonstrable
- Tollgate 1 behavior aligns with AAS Framing discipline
- seeded or created Outcomes can be used in the flow

## Scope In
- Outcome detail route
- summary form
- baseline form
- readiness panel
- Tollgate 1 panel
- submit mutation
- blockers in right rail

## Scope Out
- full multi-approver flow
- exception handling
- advanced risk editing

## Constraints
- no client-only validation for submission logic
- forward progression must be meaningfully blocked
- error messaging must be clear and concrete

## Required Evidence
- before/after screenshots
- failed validation demo
- successful submit demo
- audit/activity record