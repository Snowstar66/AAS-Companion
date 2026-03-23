# M1-STORY-005

## Title
Build Framing Cockpit

## Story Type
UI Feature

## Value Intent
Give users a clear workspace for finding, inspecting and starting Framing work.

## Summary
Build the Framing Cockpit for Outcome list and readiness overview.

## Acceptance Criteria
- `/framing` renders a list of Outcomes
- filtering by status works
- readiness indicators are shown per Outcome
- blocked Outcomes are visually marked
- search or quick filter is available
- user can navigate from list to Outcome Workspace
- user can start creation of a new Outcome
- loading, empty and error states exist

## AI Usage Scope
- CODE
- TEST

## Test Definition
- component
- e2e

## Definition of Done
- cockpit is readable on desktop
- filters are usable and stable
- navigation to Outcome detail works
- readiness status is understandable to a human reviewer

## Scope In
- Framing route
- Outcome list component
- filters
- quick actions
- navigation to detail

## Scope Out
- kanban mode
- bulk edit
- advanced saved views

## Constraints
- clarity before density
- blocked state must be obvious
- list must be usable with seeded data from M1

## Required Evidence
- screenshots
- interaction test
- route test