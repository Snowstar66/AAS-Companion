# M3-STORY-006

## Title
Create Tollgate Review and Approval UI

## Story Type
UI + Governance Feature

## Value Intent
Make required reviewers, approvers and actual decisions visible and actionable at each tollgate.

## Summary
Create a Tollgate Review and Approval UI that shows who must review, who must approve, what has happened and what is still pending.

## Acceptance Criteria
- tollgate view shows:
  - required review roles
  - required approval roles
  - current assigned people
  - completed review actions
  - completed approval actions
  - pending actions
  - blocked actions
- human reviewer or approver can record:
  - approve
  - reject
  - request changes
  - note
- UI distinguishes:
  - review
  - approval
  - escalation
- actual decisions create approval records and activity events
- blocked tollgates remain visibly blocked until required sign-off exists

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e

## Definition of Done
- review and approval can be demonstrated in UI
- required vs completed actions are clear
- blocked state is understandable
- sign-off traceability is visible from the tollgate view

## Scope In
- tollgate approval UI
- review/approval action handling
- state visualization
- activity linkage

## Scope Out
- release approval workflows
- email reminders
- advanced escalation routing

## Constraints
- no AI role may record final human approval
- tollgate state must remain consistent with approval records
- blocked state must be specific and actionable

## Required Evidence
- tollgate approval screenshot
- approve/reject demo
- blocked tollgate example