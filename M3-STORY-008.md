# M3-STORY-008

## Title
Link approvals and sign-offs to evidence, activity and traceability views

## Story Type
Governance Feature

## Value Intent
Make sign-off traceability visible across the product so approvals can be understood in context and audited later.

## Summary
Link approval records and sign-off history into evidence views, activity timelines and traceability views.

## Acceptance Criteria
- approval and review records can be viewed from:
  - tollgate views
  - entity detail views
  - activity timeline
  - evidence/traceability views
- each record can show linked evidence reference where available
- approval history is navigable
- traceability can show:
  - who reviewed
  - who approved
  - when
  - for what entity
  - with which note or evidence reference
- approval-related activity appears in relevant timelines
- users can understand sign-off lineage without leaving the product context

## AI Usage Scope
- CODE
- TEST

## Test Definition
- integration
- e2e

## Definition of Done
- approval history is visible in product flows
- traceability from entity to approval record is demonstrable
- activity timeline includes approval events
- evidence linkage works where evidence exists

## Scope In
- evidence linkage
- activity timeline integration
- traceability integration
- approval history views

## Scope Out
- external evidence repositories
- document retention policies
- legal archive workflows

## Constraints
- approval history must remain queryable
- evidence linkage must not imply that evidence is complete if it is not
- approval records must remain human-centered and auditable

## Required Evidence
- traceability screenshot
- approval history example
- activity timeline example
- evidence-linked approval example