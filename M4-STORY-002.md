# M4-STORY-002

## Title
Classify project context for pricing evaluation

## Story Type
Logic

## Value Intent
Determine project type to guide pricing model recommendation.

## Summary
Evaluate project characteristics from Framing and derive classification for pricing model selection.

## Acceptance Criteria
- system evaluates:
  - baseline exists (yes/no)
  - outcome clarity (clear/unclear)
  - scope stability (stable/unstable)
  - AI level
- classification outputs:
  - Existing delivery
  - New build
  - Uncertain / fallback
- classification is visible to user
- classification updates when Framing changes
- classification is project-scoped

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration

## Definition of Done
- classification logic works deterministically
- output is understandable to user