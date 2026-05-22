---
stepsCompleted:
  - step-01-derive-from-epic-10-retro
  - step-02-design-epic-11
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-10-retro-2026-05-22.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-10-export-acceptance-workflow-hardening.md
created: 2026-05-22
status: in-progress
---

# AAS Control Mirror - Epic 11: Export Retention Governance

## Overview

Epic 10 made export acceptance workflow reliable enough to distinguish generated, pending, blocked and share-ready evidence packs. Epic 11 adds lifecycle governance for persisted audit artifacts so saved evidence pack exports can be retained, archived and audited deliberately.

The core product goal is operational governance: persisted evidence pack exports should have visible retention state before delete/archive actions or re-download audit events are added.

## Requirements Inventory

### Functional Requirements

FR1: Persisted export records must carry retention state and policy label.

FR2: Export history must display retention state without loading full payload bodies.

FR3: Later stories must be able to archive exports without deleting audit history.

FR4: Later stories must be able to log re-download events.

FR5: Retention governance must preserve tenant scoping and stored filename/content type behavior.

### Non-Functional Requirements

NFR1: Do not delete existing export payloads in this epic.

NFR2: Keep retention state deterministic and testable.

NFR3: Preserve existing export and persisted download routes.

NFR4: Add schema changes with migrations and Prisma generation.

## Epic 11 Goal

Make persisted Control Mirror evidence pack exports governable over time through visible retention metadata, archive lifecycle and re-download audit events.

## Stories

### Story 11.1: Add Export Retention State Metadata

As a governance operator,
I want persisted evidence pack exports to show retention state,
so that saved audit artifacts can be managed deliberately.

**Acceptance Criteria:**

1. Given a new export is persisted, when the record is stored, then retention state defaults to active with a governance audit policy label.
2. Given export history is listed, when records render, then retention state and policy label are visible without loading payload bodies.
3. Given persisted download still occurs, when a record is fetched, then stored filename/content type and payload behavior are unchanged.

### Story 11.2: Archive Persisted Evidence Pack Exports

As a governance operator,
I want to archive an export without deleting it,
so that stale audit artifacts are marked out of active sharing circulation while history remains intact.

**Acceptance Criteria:**

1. Given an active export exists, when an authorized operator archives it with rationale, then retention state becomes archived with actor, timestamp and reason.
2. Given an archived export appears in history, when it renders, then archive state and reason are visible.
3. Given an archived export is downloaded, when the response is served, then it remains available with archive disclosure.

### Story 11.3: Audit Persisted Export Re-Downloads

As a governance lead,
I want re-downloads of persisted evidence packs to be logged,
so that audit artifacts have access traceability.

**Acceptance Criteria:**

1. Given a persisted export is downloaded, when the route succeeds, then a re-download event is recorded with actor and timestamp.
2. Given download fails or export is missing, when the route redirects, then no success event is recorded.
3. Given export history renders, when re-download events exist, then last download metadata is visible.

### Story 11.4: Harden Retention Governance Regression and Retro

As an AQA,
I want retention governance coverage and lessons captured,
so that persisted audit artifact lifecycle remains reliable.

**Acceptance Criteria:**

1. Given retention state, archive lifecycle and download events exist, when targeted tests run, then repository, API, route and page coverage all pass.
2. Given build validation runs, when the web app builds, then export routes remain included.
3. Given Epic 11 is complete, when retrospective is written, then residual risks and next recommendations are captured.

## Recommended First Slice

Start with **Story 11.1: Add Export Retention State Metadata**.

This is the smallest correct next step because it introduces visible lifecycle state before adding archive or audit event actions.
