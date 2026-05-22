---
stepsCompleted:
  - step-01-derive-from-epic-7-retro
  - step-02-design-epic-8
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-7-retro-2026-05-22.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-7-evidence-pack-route-and-format-hardening.md
created: 2026-05-22
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 8: Persisted Export History

## Overview

Epic 7 hardened the Control Mirror evidence pack export contract and added Markdown alongside JSON. Epic 8 should turn each export into a durable audit event so governance reviewers can see what was generated, when it was generated, which format was used and which snapshot it represented.

The core product goal is evidence continuity: exported Control Mirror packs should leave a tenant-scoped history entry instead of disappearing after download.

## Requirements Inventory

### Functional Requirements

FR1: Successful evidence pack downloads must create a tenant-scoped export history record.

FR2: Export history records must preserve snapshot id, schema version, format, generated timestamp, filename, content type and payload.

FR3: JSON and Markdown exports must both be persisted.

FR4: Export creation must fail closed if the current evidence pack cannot be built or saved.

FR5: Future UI slices must be able to list export history without loading full payload bodies.

### Non-Functional Requirements

NFR1: Do not persist raw uploaded source text.

NFR2: Keep organization scoping mandatory on all repository and API operations.

NFR3: Keep the route response backward-compatible for existing JSON and Markdown downloads.

NFR4: Keep persisted Markdown content derived from the same evidence pack payload as JSON.

NFR5: Avoid broad UI changes until persistence is in place.

## Epic 8 Goal

Make Control Mirror evidence packs durable by recording each generated export as an auditable, tenant-scoped history artifact.

## Stories

### Story 8.1: Add Evidence Pack Export History Persistence

As an AQA,
I want successful evidence pack exports to be persisted,
so that downloaded audit artifacts leave a durable history record.

**Acceptance Criteria:**

1. Given a JSON evidence pack export succeeds, when the route responds, then an export history record is saved with organization, snapshot, schema version, filename, content type and payload metadata.
2. Given a Markdown evidence pack export succeeds, when the route responds, then the same evidence pack payload and Markdown body are saved as a Markdown export record.
3. Given persistence fails, when the export route is called, then the route redirects with fail-closed copy and no successful download is implied.

### Story 8.2: List Recent Evidence Pack Exports

As a governance reviewer,
I want to see recent Control Mirror exports,
so that I can confirm which evidence packs have already been generated.

**Acceptance Criteria:**

1. Given export records exist, when the Control Mirror page loads, then recent exports are listed with generated time, format, filename and snapshot id.
2. Given no export records exist, when the page loads, then the history area shows an empty state.
3. Given records exist for another organization, when the current page loads, then they are not shown.

### Story 8.3: Re-download Persisted Evidence Pack Exports

As a Delivery Lead,
I want to re-download a persisted export,
so that audit reviewers can retrieve the exact artifact that was generated earlier.

**Acceptance Criteria:**

1. Given a persisted export exists for my organization, when I request it, then the original content is returned with the stored filename and content type.
2. Given the export belongs to another organization, when I request it, then it is not returned.
3. Given the export id is missing or invalid, when I request it, then the response fails closed.

### Story 8.4: Harden Export History Regression Coverage and Retro

As an AQA,
I want export history coverage and lessons captured,
so that persisted audit artifacts remain reliable.

**Acceptance Criteria:**

1. Given export history is implemented, when targeted tests run, then create, list and re-download flows are covered.
2. Given build validation runs, when the web app builds, then export routes remain included.
3. Given Epic 8 is complete, when retrospective is written, then follow-up risks and next recommendations are captured.

## Recommended First Slice

Start with **Story 8.1: Add Evidence Pack Export History Persistence**.

This is the smallest correct next step because it gives every successful export a durable audit record before adding list or re-download UI.
