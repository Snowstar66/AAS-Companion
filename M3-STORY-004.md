# M3-STORY-004

## Title
Create Authority Matrix for customer, supplier and AI governance

## Story Type
Feature

## Value Intent
Make the authority model explicit so users can see who owns value, architecture, AI governance and sign-off responsibilities.

## Summary
Create an Authority Matrix that shows responsibilities and authority boundaries across customer, supplier and AI governance roles.

## Acceptance Criteria
- an Authority Matrix view exists
- matrix shows role groups for:
  - customer
  - supplier
  - AI governance / authority
- matrix can show responsibility areas such as:
  - outcome ownership
  - architecture review
  - AI review
  - risk acceptance
  - tollgate approval
  - build readiness approval
  - escalation ownership
- responsibility cells can show:
  - owner
  - reviewer
  - approver
  - not assigned
- matrix is understandable in both summary and detailed mode
- matrix can link to actual named people where assigned

## AI Usage Scope
- CODE
- TEST
- CONTENT

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- authority model can be demonstrated with seeded data
- customer/supplier split is visible
- responsibility areas are clear to a human reviewer
- matrix supports operational use, not only documentation

## Scope In
- authority matrix model
- authority matrix UI
- summary and detail mode
- link to named human roles

## Scope Out
- approval record persistence
- evidence linking
- automated escalation workflow

## Constraints
- authority model must not blur accountability across human and AI roles
- unknown ownership must remain visible as missing
- matrix must be usable in real reviews and demos

## Required Evidence
- authority matrix screenshot
- customer/supplier example
- missing authority example