---
stepsCompleted:
  - step-01-derive-from-epic-6-retro
  - step-02-design-epic-7
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-6-retro-2026-05-22.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-6-report-and-evidence-pack-export.md
created: 2026-05-22
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 7: Evidence Pack Route and Format Hardening

## Overview

Epic 6 introduced the Control Mirror evidence pack export model, protected JSON route, and UI disclosure. Epic 7 hardens the route and export contract so the evidence pack can become a dependable audit artifact instead of just a downloadable payload.

The core product goal is export trust: a Delivery Lead, AQA or governance reviewer should be able to download an evidence pack with stable headers, predictable failure behavior, clear format/version cues, and regression coverage around the route boundary.

## Requirements Inventory

### Functional Requirements

FR1: The protected export route must have direct regression coverage for success and failure behavior.

FR2: Export responses must preserve download headers, no-store caching and deterministic filename generation.

FR3: Export failures must redirect back to Control Mirror with clear fail-closed copy.

FR4: Export format/version metadata must remain visible enough for future JSON/Markdown/PDF evolution.

FR5: Tests must verify the route uses the active organization context.

### Non-Functional Requirements

NFR1: Do not include raw uploaded source content in route tests or fixtures.

NFR2: Keep route-level tests focused on the route boundary, not dashboard composition.

NFR3: Preserve existing JSON export behavior.

NFR4: Keep future format work additive and backwards-compatible.

NFR5: Avoid adding new dependencies for route tests.

## Epic 7 Goal

Make Control Mirror evidence pack export safer to evolve by hardening the route contract, filename/version behavior and future format seams.

## Stories

### Story 7.1: Add Evidence Pack Export Route Tests

As an AQA,
I want direct route-level coverage for the evidence pack export,
so that download headers, organization scoping and fail-closed redirects do not regress.

**Acceptance Criteria:**

1. Given an active project session and successful evidence pack service result, when the export route is called, then it returns JSON with download headers and no-store caching.
2. Given the route is called, when it builds the export, then it passes the active organization id to the evidence pack service.
3. Given the evidence pack service fails, when the export route is called, then it redirects back to Control Mirror with fail-closed error copy.

### Story 7.2: Add Markdown Evidence Pack Export Format

As a governance reviewer,
I want a readable Markdown export option,
so that evidence packs can be shared in review workflows without inspecting raw JSON.

**Acceptance Criteria:**

1. Given a Control Mirror evidence pack, when Markdown export is requested, then report summary, findings, Human Review state and retention disclosure are rendered.
2. Given Markdown export is requested, when content is serialized, then raw source text remains excluded.
3. Given the web export route receives a Markdown format request, then it returns a Markdown attachment with appropriate headers.

### Story 7.3: Harden Export Filename and Version Metadata

As an AQA,
I want deterministic filename and version behavior,
so that exported artifacts remain auditable across snapshots and future schema changes.

**Acceptance Criteria:**

1. Given project or snapshot names contain unsafe characters, when an export is downloaded, then the filename is sanitized and stable.
2. Given an export is generated, when the payload is inspected, then schema version and generated timestamp remain present.
3. Given tests need deterministic timestamps, when the export builder is called with an injected timestamp, then the payload uses that timestamp.

### Story 7.4: Harden Export Regression Coverage and Retro

As a Delivery Lead,
I want export regression coverage and lessons captured,
so that the next slice can build on a known stable export contract.

**Acceptance Criteria:**

1. Given JSON and Markdown exports exist, when targeted tests run, then route, payload and page disclosure coverage all pass.
2. Given Epic 7 is complete, when retrospective is written, then follow-up risks and next recommendations are captured.
3. Given build validation runs, when the web app builds, then the export routes remain included.

## Recommended First Slice

Start with **Story 7.1: Add Evidence Pack Export Route Tests**.

This is the smallest correct next step because it locks down the route boundary added in Epic 6 before introducing another export format.
