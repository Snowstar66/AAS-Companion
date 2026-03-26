# M2-STORY-004

## Title
Run AAS compliance gap analysis on candidate imported objects

## Story Type
Feature

## Value Intent
Make governance, traceability and readiness gaps visible before imported artifacts are allowed to progress into Framing, Design or Build.

## Summary
Run deterministic AAS compliance analysis on candidate imported objects and show exactly what is missing, uncertain, human-only or blocked.

## Acceptance Criteria
- system can analyze candidate objects for missing or incomplete AAS-relevant fields such as:
  - Outcome statement
  - baseline
  - Value Owner
  - AI level
  - risk profile
  - Epic linkage
  - Story-ID
  - acceptance criteria
  - Test Definition
  - Definition of Done
- system can analyze missing Value Spine links:
  - Outcome → Epic
  - Epic → Story
  - Story → Test-related definition where applicable
- compliance results classify findings into exactly these categories:
  - missing
  - uncertain
  - human-only
  - blocked
- compliance results are visible:
  - per intake session
  - per file
  - per candidate object
- summary view and detail view both exist
- compliance engine is deterministic and reviewable

## AI Usage Scope
- CODE
- TEST
- CONTENT

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- compliance result is understandable in UI
- category distinction is clear to a reviewer
- deterministic rules can be explained
- gaps can be demonstrated from real imported artifacts

## Scope In
- compliance engine
- compliance result model
- summary UI
- object-level gap detail UI

## Scope Out
- auto-remediation
- tollgate advancement
- risk acceptance
- final approval logic

## Constraints
- no candidate object may be treated as compliant without explicit rule pass
- human-only decisions must not be downgraded to ordinary missing fields
- blocked state must be based on explicit rules
- compliance results must be explainable, not opaque

## Required Evidence
- compliance summary screenshot
- example gap detail view
- examples of:
  - missing
  - uncertain
  - human-only
  - blocked