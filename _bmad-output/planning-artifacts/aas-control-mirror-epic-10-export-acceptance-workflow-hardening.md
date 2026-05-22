---
stepsCompleted:
  - step-01-derive-from-epic-9-retro
  - step-02-design-epic-10
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-9-retro-2026-05-22.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-9-product-security-acceptance.md
created: 2026-05-22
status: in-progress
---

# AAS Control Mirror - Epic 10: Export Acceptance Workflow Hardening

## Overview

Epic 9 made Product/Security acceptance visible and recordable for Control Mirror evidence pack exports. Epic 10 hardens that workflow so export history can distinguish a generated export, a partially reviewed export, a rejected export and an export that has all required acceptance roles recorded.

The core product goal is governance release readiness: persisted evidence packs should not appear broadly shareable until Product owner, Security/privacy and AQA acceptance requirements are satisfied.

## Requirements Inventory

### Functional Requirements

FR1: Export history must compute acceptance readiness from the latest decision per required reviewer role.

FR2: Export history must show pending, changes-requested and share-ready states separately.

FR3: Acceptance readiness must disclose missing or blocking reviewer roles.

FR4: Later stories must be able to restrict reviewer role submissions by user role without changing the evidence pack payload.

FR5: Later stories must support supersede/revoke semantics using new decision events rather than mutating historic export payloads.

### Non-Functional Requirements

NFR1: Do not load full export payload bodies for history readiness.

NFR2: Keep readiness deterministic and testable from persisted decision events.

NFR3: Preserve existing export download routes and acceptance decision submission.

NFR4: Keep tenant scoping on all export and acceptance lookups.

## Epic 10 Goal

Make Control Mirror export acceptance workflow reliable enough to support controlled governance sharing.

## Stories

### Story 10.1: Compute Multi-Role Acceptance Readiness

As a governance lead,
I want export history to summarize readiness across required reviewer roles,
so that a single acceptance decision is not mistaken for full sharing approval.

**Acceptance Criteria:**

1. Given no required role has accepted, when export history is listed, then readiness is acceptance pending with all required roles missing.
2. Given some required roles have accepted, when export history is listed, then readiness remains pending and only missing roles are listed.
3. Given any latest required role decision requests changes, when export history is listed, then readiness is changes requested and blocking roles are listed.
4. Given all required roles have accepted or accepted with conditions, when export history renders, then the export is marked share ready and accepted roles are visible.

### Story 10.2: Gate Reviewer Role Submission by Active User Role

As a governance owner,
I want acceptance submissions to be constrained by reviewer role authority,
so that users cannot record arbitrary Product/Security/AQA decisions.

**Acceptance Criteria:**

1. Given a user lacks reviewer authority, when they submit an acceptance decision, then the action fails closed.
2. Given a user has matching authority, when they submit a decision, then the decision is recorded.
3. Given submission is rejected, when Control Mirror redirects, then the error copy explains that reviewer authority is required.

### Story 10.3: Add Supersede and Revoke Acceptance Events

As a Security reviewer,
I want to supersede or revoke a previous acceptance decision,
so that exported artifacts reflect changed risk posture without rewriting history.

**Acceptance Criteria:**

1. Given a reviewer records a newer decision, when readiness is computed, then the newer decision supersedes the older decision for that role.
2. Given a reviewer revokes acceptance, when readiness is computed, then the role is no longer accepted.
3. Given event history is inspected, when multiple decisions exist, then all events remain auditable.

### Story 10.4: Harden Acceptance Workflow Regression and Retro

As an AQA,
I want acceptance workflow coverage and lessons captured,
so that governance sharing remains reliable.

**Acceptance Criteria:**

1. Given multi-role readiness and role-gated decisions exist, when targeted tests run, then repository, API, action and page coverage all pass.
2. Given build validation runs, when the web app builds, then export routes remain included.
3. Given Epic 10 is complete, when retrospective is written, then residual risks and next recommendations are captured.

## Recommended First Slice

Start with **Story 10.1: Compute Multi-Role Acceptance Readiness**.

This is the smallest correct next step because it clarifies share readiness before adding authorization or lifecycle events.
