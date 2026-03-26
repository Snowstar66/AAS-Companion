# M3-STORY-003

## Title
Create Agent Registry and human oversight linkage

## Story Type
Feature

## Value Intent
Make AI agents visible as support roles with clear scope and explicit human oversight.

## Summary
Create an Agent Registry where named AI agents can be registered, categorized and linked to human oversight roles.

## Acceptance Criteria
- user can create and edit agent entries
- each agent entry can store:
  - agent name
  - agent type
  - purpose
  - scope of work
  - allowed artifact types
  - allowed actions
  - supervising human role
  - active/inactive state
- agent entries are visually distinct from human roles
- agent entries can be filtered by purpose or scope
- supervising human role is mandatory
- activity events are created for create/update/deactivate actions

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- agents are visible in the product
- agent scope is understandable
- supervising human linkage is required and persisted
- agents do not appear as accountability owners

## Scope In
- agent registry UI
- agent data model
- human oversight linkage
- activity events

## Scope Out
- actual LLM orchestration
- execution logs
- approval record linkage

## Constraints
- no agent may exist without supervising human role
- agents must not be shown as approvers
- human and agent entities must remain visually and semantically distinct

## Required Evidence
- agent registry screenshot
- example agent with supervisor
- activity event example