# M1-STORY-004

## Title
Build Home dashboard

## Story Type
UI Feature

## Value Intent
Provide an immediate operational overview of the system state for all main roles.

## Summary
Build the Home dashboard with operational summary cards, top blockers and recent activity.

## Acceptance Criteria
- `/` renders a Home dashboard
- KPI summary cards are shown
- outcomes by status are shown
- top blockers are shown
- pending tollgate actions are shown
- recent activity is shown
- page follows the app shell layout
- right rail shows blockers and next actions
- loading, empty and error states exist
- page view analytics event is emitted

## AI Usage Scope
- CODE
- CONTENT
- TEST

## Test Definition
- unit
- component
- e2e smoke

## Definition of Done
- dashboard is readable and consistent with the design direction
- core widgets render from seeded data
- loading, empty and error states behave correctly
- route can be demoed to a human reviewer

## Scope In
- Home route
- dashboard widgets
- summary queries
- right rail content
- activity preview

## Scope Out
- advanced analytics drill-down
- configurable dashboards
- cross-org views

## Constraints
- no fake metrics hidden as real data
- dashboard must tolerate partial data
- widgets should remain modular

## Required Evidence
- screenshots
- component test result
- e2e smoke result