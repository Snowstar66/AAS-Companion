# M3-STORY-002

## Title
Model required roles by AI acceleration level

## Story Type
Feature

## Value Intent
Make minimum governance staffing requirements explicit for each AI acceleration level.

## Summary
Implement a rules model that defines which roles are minimally required for Level 1, Level 2 and Level 3, and allow the product to compare actual assigned people against those requirements.

## Acceptance Criteria
- system stores required roles per AI level
- system can show required role sets for:
  - Level 1
  - Level 2
  - Level 3
- system can compare required roles against currently assigned named roles
- result can classify role coverage as:
  - satisfied
  - missing
  - partially covered
  - risky combination
- level readiness result is visible in UI
- logic can be used on initiative or workspace level

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration

## Definition of Done
- required-role logic is deterministic
- readiness result is understandable
- at least one example per AI level can be demonstrated

## Scope In
- role requirement model
- AI-level coverage rules
- readiness result model
- UI display of required vs assigned roles

## Scope Out
- actual approval flows
- escalation logic
- agent registry

## Constraints
- readiness logic must be explainable
- role requirement rules must remain configurable
- risky combinations must not be silently treated as acceptable

## Required Evidence
- examples for Level 1, 2 and 3
- role gap example
- risky combination example