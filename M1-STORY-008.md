# M1-STORY-008

## Title
Build Execution Contract preview

## Story Type
Integration/UI Feature

## Value Intent
Show how governed Stories are handed off to AI build tooling without losing traceability.

## Summary
Build the Execution Contract preview for build-ready Stories.

## Acceptance Criteria
- a Build Handoff route exists
- user can open a Story and preview a generated Execution Contract
- contract includes:
  - outcome_id
  - epic_id
  - story_id
  - AI level
  - acceptance criteria
  - test definition
- contract generation fails if the Story is not valid
- invalid state shows clear blocking explanation
- user can copy contract as JSON
- user can copy or view contract as Markdown
- activity event is created on contract generation

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- contract builder is typed
- preview UI is readable
- invalid Stories are blocked
- valid Stories produce a coherent contract preview

## Scope In
- Build Handoff route
- contract builder
- preview UI
- copy/export helpers
- validation before generation

## Scope Out
- external tool adapters
- background export jobs
- workflow execution logging

## Constraints
- no contract generation without valid Story-ID
- output must reflect actual persisted Story data
- contract preview should be human-readable and machine-usable

## Required Evidence
- preview screenshot
- contract snapshot
- invalid contract rejection demo