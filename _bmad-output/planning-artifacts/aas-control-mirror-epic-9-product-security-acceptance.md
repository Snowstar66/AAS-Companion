---
stepsCompleted:
  - step-01-derive-from-epic-8-retro
  - step-02-design-epic-9
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-8-retro-2026-05-22.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-8-persisted-export-history.md
created: 2026-05-22
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 9: Product/Security Acceptance

## Overview

Epic 8 made Control Mirror evidence packs persistent and re-downloadable. Epic 9 should make the acceptance posture explicit so persisted audit artifacts are not mistaken for externally approved release artifacts.

The core product goal is release readiness: every exported evidence pack should disclose which Product, Security and AQA checks are required before broad governance sharing.

## Requirements Inventory

### Functional Requirements

FR1: Evidence packs must include Product/Security acceptance posture.

FR2: Markdown exports must render the same acceptance posture.

FR3: Control Mirror UI must show acceptance requirements near export/download history.

FR4: Acceptance posture must disclose raw-source exclusion and retention-review needs.

FR5: Later stories must be able to record acceptance decisions without changing the evidence pack safety model.

### Non-Functional Requirements

NFR1: Do not include raw uploaded source text in acceptance policy or disclosures.

NFR2: Keep acceptance posture deterministic and testable.

NFR3: Preserve existing JSON/Markdown export routes and persisted history behavior.

NFR4: Do not add heavyweight workflow state until policy surface is stable.

## Epic 9 Goal

Make Control Mirror export acceptance explicit so persisted evidence packs can move toward controlled governance release.

## Stories

### Story 9.1: Add Evidence Pack Product/Security Acceptance Policy

As a governance reviewer,
I want each evidence pack to disclose Product/Security acceptance requirements,
so that persisted exports are not shared as approved artifacts before the right review happens.

**Acceptance Criteria:**

1. Given an evidence pack is built, when the payload is inspected, then it includes Product/Security acceptance status, required reviewers and checklist items.
2. Given Markdown export is built, when it is inspected, then acceptance requirements are rendered without raw source text.
3. Given Control Mirror renders the report/export area, when export guidance is visible, then Product/Security acceptance status and required review surfaces are visible.

### Story 9.2: Record Export Acceptance Decisions

As a Product or Security reviewer,
I want to record an acceptance decision for a persisted export,
so that governance sharing has a named human decision.

**Acceptance Criteria:**

1. Given a persisted export exists, when an authorized reviewer records acceptance, then the decision is stored with actor, role, rationale and timestamp.
2. Given an export has an acceptance decision, when history is listed, then the latest decision state is visible.
3. Given a decision is missing rationale or actor, when submitted, then it fails closed.

### Story 9.3: Gate External Sharing Copy on Acceptance

As a Delivery Lead,
I want the UI to distinguish generated exports from accepted exports,
so that teams do not overstate audit readiness.

**Acceptance Criteria:**

1. Given no acceptance decision exists, when export history renders, then the export is marked acceptance pending.
2. Given acceptance exists, when export history renders, then accepted state and reviewer are visible.
3. Given re-download occurs before acceptance, when the download is served, then the persisted payload still includes acceptance-required disclosure.

### Story 9.4: Harden Acceptance Regression Coverage and Retro

As an AQA,
I want acceptance policy coverage and lessons captured,
so that export governance remains reliable.

**Acceptance Criteria:**

1. Given acceptance policy and decisions exist, when targeted tests run, then payload, Markdown, UI and persistence coverage all pass.
2. Given build validation runs, when the web app builds, then export routes remain included.
3. Given Epic 9 is complete, when retrospective is written, then follow-up risks and next recommendations are captured.

## Recommended First Slice

Start with **Story 9.1: Add Evidence Pack Product/Security Acceptance Policy**.

This is the smallest correct next step because it makes acceptance requirements explicit before adding decision persistence.
