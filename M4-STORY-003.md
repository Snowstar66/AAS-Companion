# M4-STORY-003

## Title
Recommend pricing model based on project classification

## Story Type
Recommendation

## Value Intent
Guide user toward appropriate AAS pricing model without enforcing decision.

## Summary
Map project classification to recommended pricing model and show reasoning.

## Acceptance Criteria
- system recommends one of:
  - Controlled Efficiency Share
  - Accelerated Build Contract
  - Structured T&M
- recommendation is labeled "Recommended"
- recommendation includes rationale:
  - baseline
  - scope
  - AI level
- recommendation is not enforced
- user can ignore recommendation
- recommendation updates dynamically

## AI Usage Scope
- CODE
- TEST

## Test Definition
- integration

## Definition of Done
- recommendation is clear and explainable
- no automatic selection occurs