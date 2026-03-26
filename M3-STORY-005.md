# M3-STORY-005

## Title
Implement Approval Record and Sign-off model

## Story Type
Feature

## Value Intent
Create auditable review and sign-off records that support AAS governance and tollgate control.

## Summary
Implement the core data model and services for review records, approval records and sign-off traceability.

## Acceptance Criteria
- approval record model exists
- review record model exists or approval model can distinguish review vs approval
- each record stores:
  - entity type
  - entity id
  - approval or review type
  - required role
  - actual person
  - organization side
  - decision status
  - timestamp
  - note
  - evidence reference
- records are persisted and queryable
- records create activity events
- records can be linked to tollgates and work objects

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration

## Definition of Done
- records can be created and retrieved
- review and approval are distinguishable
- sign-off traceability is demonstrable
- audit trail exists

## Scope In
- approval/review model
- persistence
- service layer
- activity events
- linkage to entities

## Scope Out
- signature providers
- legal e-sign workflows
- notification workflows

## Constraints
- approval must not be inferred automatically
- actual human person must be recorded
- organization side must remain visible
- records must be append-only or auditable

## Required Evidence
- sample approval record
- sample review record
- audit trail example