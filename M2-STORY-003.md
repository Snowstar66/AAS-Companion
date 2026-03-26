# M2-STORY-003

## Title
Map parsed artifacts to the AAS canonical candidate model

## Story Type
Feature

## Value Intent
Translate extracted artifact content into AAS-aligned candidate objects while preserving ambiguity, traceability and source confidence.

## Summary
Map parsed artifact output into candidate Outcome, Epic and Story objects inside the AAS Control Plane, without yet treating them as compliant or approved.

## Acceptance Criteria
- parsed output can be mapped into candidate AAS objects:
  - candidate Outcome
  - candidate Epic
  - candidate Story
- each candidate object retains:
  - source file reference
  - source section reference
  - extraction confidence
  - source classification
- mapping engine distinguishes mapping state:
  - mapped
  - uncertain
  - missing
- relationships Outcome → Epic → Story can be inferred where possible
- ambiguous relationships remain marked as uncertain rather than forced
- unmapped source sections remain visible for human review
- candidate objects are organization-scoped and persisted

## AI Usage Scope
- CODE
- TEST
- CONTENT

## Test Definition
- unit
- integration

## Definition of Done
- candidate AAS object graph can be generated from parsed content
- ambiguity is preserved instead of hidden
- source traceability remains visible end-to-end
- candidate objects are reviewable in the system

## Scope In
- mapping engine
- candidate object model
- relationship inference
- mapping state model
- traceability links

## Scope Out
- compliance gap analysis
- human review decisions
- promotion to live governed objects
- build progression

## Constraints
- mapping must never auto-approve AAS compliance
- ambiguous input must remain ambiguous in output
- canonical model must remain aligned with current domain objects
- inferred relationships must be reviewable and reversible

## Required Evidence
- mapped candidate object example
- uncertain mapping example
- source lineage example
- unmapped source section example