# M1-PATCH-014

## Title
Support native-first filtering in Framing list

## Story Type
UX / List Behavior Patch

## Value Intent
Allow teams working on real customer cases to focus on native authored work without being distracted by demo examples.

## Summary
Add native-first filtering behavior to Framing list so demo-seeded objects do not dominate normal working views while remaining accessible when needed.

## Acceptance Criteria
- Framing list supports filtering by case origin
- supported filter options include:
  - All
  - Native
  - Demo
- Native filter can be used as the default working view
- demo cases remain accessible through filter change
- filtering does not break existing list behavior
- filtering works for both seeded and newly created native cases
- active filter state is visible to the user
- empty state under Native filter helps user start a new case
- empty state includes a Start new case action

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- users can focus on native work by default
- demo content remains accessible intentionally
- filter behavior is understandable and stable
- empty native state supports real work initiation

## Scope In
- origin filter in Framing list
- native-first default behavior
- empty state messaging
- Start new case CTA from empty state

## Scope Out
- imported origin filters
- cross-workspace filtering
- saved personal filter preferences
- analytics

## Constraints
- filtering must not remove access to demo data
- filtering must remain simple and understandable
- native-first behavior must not create a second list model
- empty state must encourage clean case creation rather than demo exploration

## Required Evidence
- screenshot of filter options
- screenshot of Native-only list
- screenshot of empty native state with Start new case action
- short demo of switching between Native and Demo views