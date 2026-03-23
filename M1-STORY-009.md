# M1-STORY-009

## Title
Add telemetry, audit and instrumentation

## Story Type
Platform Feature

## Value Intent
Make traceability and observability present from the first usable slice.

## Summary
Add telemetry, audit events and product instrumentation for M1 workflows.

## Acceptance Criteria
- activity events are created for:
  - outcome update
  - tollgate submit
  - story update
  - execution contract generation
- basic request logging exists
- page view analytics exist for:
  - Home
  - Framing
  - Outcome
  - Story
- trace or request ID is available where relevant
- errors are surfaced in a structured format
- telemetry hooks are documented

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration

## Definition of Done
- core event names are implemented consistently
- activity history is visible where relevant
- structured errors are observable in the product flow
- instrumentation is stable enough for M1 demo use

## Scope In
- telemetry package
- event emitters
- activity timeline data
- analytics instrumentation
- error structure

## Scope Out
- full OpenTelemetry export pipeline
- session replay policies
- advanced BI/reporting

## Constraints
- do not overengineer observability in M1
- event names must stay consistent
- audit and product analytics should be distinguishable

## Required Evidence
- event list
- instrumentation notes
- audit demo