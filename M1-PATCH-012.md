# M1-PATCH-012

## Title
Create clean native draft Outcome from Framing

## Story Type
Workflow / Domain Patch

## Value Intent
Ensure a real customer case starts as a clean governed native draft Outcome rather than from demo-seeded content.

## Summary
Implement or refine the clean case creation flow so Start new case creates a native draft Outcome with no seeded stories or almost-ready demo content attached, and opens directly in Outcome Workspace.

## Acceptance Criteria
- selecting Start new case creates a new Outcome in draft state
- newly created Outcome is treated as a native governed object
- newly created Outcome is not prefilled with seeded stories
- newly created Outcome is not prefilled with almost-ready demo data
- newly created Outcome opens directly in Outcome Workspace after creation
- newly created Outcome can use the same existing Framing editing flow as other Outcomes
- Tollgate 1 remains blocked until required Framing inputs are completed
- creation action creates an activity event
- creation flow works under current tenant/org context
- creation flow does not require new approval or authority data to exist

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- a clean case can be created end-to-end from Framing
- the created object is clearly a native draft Outcome
- no demo content is silently attached
- redirect into Outcome Workspace works reliably
- existing Outcome Workspace behavior is reused

## Scope In
- clean native Outcome creation flow
- creation action or server-side command
- redirect into Outcome Workspace
- activity event on creation
- tenant-aware creation behavior

## Scope Out
- new role assignments
- approval records
- imported lineage
- build handoff changes
- staffing/readiness logic

## Constraints
- creation flow must reuse current governed Outcome model
- creation flow must not fork a separate domain model for clean cases
- creation must not auto-pass Tollgate 1
- creation must not auto-generate downstream design objects
- creation must not depend on M3 governance structures

## Required Evidence
- screenshot of newly created clean draft Outcome
- activity log example for case creation
- demo showing blocked Tollgate 1 on fresh case
- example payload or persisted object showing draft native case