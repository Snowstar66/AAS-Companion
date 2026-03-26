# M3-STORY-001

## Title
Create Party and Role Directory workspace

## Story Type
Feature

## Value Intent
Provide a governed directory of named people and roles across customer and supplier sides.

## Summary
Create a Party and Role Directory workspace where customer-side and supplier-side participants can be registered with role, mandate and contact details.

## Acceptance Criteria
- a new Party and Role Directory route exists
- user can create and edit human role entries
- each human role entry can store:
  - full name
  - email
  - phone number
  - profile image/avatar
  - organization side: customer or supplier
  - role title
  - mandate notes
  - active/inactive status
- roles can be linked to organization context
- roles can be filtered by:
  - customer
  - supplier
  - active
  - role type
- activity events are created for create/update/deactivate actions

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- workspace is usable from navigation
- named human roles can be created and viewed
- customer/supplier separation is visible
- profile data persists correctly

## Scope In
- role directory UI
- party model
- person profile model
- contact data fields
- activity events

## Scope Out
- agent registry
- approval records
- AI-level readiness logic

## Constraints
- human roles and agent roles must not be mixed in one model without explicit type
- customer and supplier side must remain visible
- role directory is governance data, not social profile data

## Required Evidence
- screenshots
- example customer role
- example supplier role
- activity log example