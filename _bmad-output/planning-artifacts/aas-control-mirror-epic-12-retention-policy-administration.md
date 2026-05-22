---
created: 2026-05-22
status: in-progress
source: _bmad-output/implementation-artifacts/epic-11-retro-2026-05-22.md
---

# AAS Control Mirror - Epic 12: Retention Policy Administration

## Overview

Epic 11 made persisted evidence pack exports governable with visible retention state, archive lifecycle and re-download audit events. Epic 12 builds on that by making retention governance easier to operate: audit actors should be readable, retention review dates should become actionable, and future destructive lifecycle actions should remain policy-gated rather than ad hoc.

## Requirements Inventory

### Functional Requirements

FR1: Export history should display known archive/download actors as human-readable names or emails while preserving actor ids as fallback.

FR2: Retention review metadata should be usable in history and future policy review workflows.

FR3: Future delete/restore actions must be policy-gated and should not be introduced before legal hold/expiry semantics are defined.

FR4: Retention governance must preserve tenant scoping and metadata-only export history lists.

### Non-Functional Requirements

NFR1: Do not delete existing export payloads in this epic unless a later story explicitly defines policy-gated deletion.

NFR2: Keep audit actor resolution deterministic and testable.

NFR3: Avoid large UI restructuring until a dedicated export details view is specified.

## Epic 12 Goal

Make persisted Control Mirror evidence pack retention governance more operator-readable and policy-ready without weakening audit traceability.

## Stories

### Story 12.1: Resolve Export Audit Actor Display Names

As a governance operator,
I want export archive and re-download actors shown as readable people,
so that audit history can be reviewed without copying opaque ids.

**Acceptance Criteria:**

1. Given an archived export has an actor id that matches an app user, when export history renders, then the archive actor displays the user full name or email with id fallback.
2. Given a latest re-download event has an actor id that matches an app user, when export history renders, then the download actor displays the user full name or email with id fallback.
3. Given an actor id cannot be resolved, when history renders, then the existing actor id remains visible.

### Story 12.2: Add Retention Review Due Metadata Surfacing

As a governance lead,
I want exports with review dates to be visible in history,
so that audit artifacts can be reviewed before stale sharing.

**Acceptance Criteria:**

1. Given a retention review due date exists, when export history renders, then the due date is visible.
2. Given a retention review date has passed, when export history renders, then it is visually distinguishable as review due.
3. Given no review due date exists, when history renders, then the current no-date behavior remains compact.

### Story 12.3: Define Policy-Gated Delete/Restore Spec

As Product/Security,
I want delete and restore behavior specified before implementation,
so that destructive retention lifecycle actions do not bypass governance.

**Acceptance Criteria:**

1. Given archived exports exist, when policy is drafted, then delete eligibility, legal hold and restore rules are documented.
2. Given destructive actions are not yet implemented, when Epic 12 completes, then there is no new hard delete route for evidence pack exports.
3. Given future implementation starts, when a story is created, then it includes explicit authority, audit and migration requirements.

## Recommended First Slice

Start with **Story 12.1: Resolve Export Audit Actor Display Names**.

This is the smallest safe next step because it improves governance readability without adding destructive lifecycle behavior.
