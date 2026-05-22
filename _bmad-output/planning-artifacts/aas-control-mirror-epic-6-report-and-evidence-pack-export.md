---
stepsCompleted:
  - step-01-derive-from-epic-5-retro
  - step-02-design-epic-6
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-5-retro-2026-05-22.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-5-control-mirror-modularization.md
created: 2026-05-22
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 6: Report and Evidence Pack Export

## Overview

Epic 5 created focused Control Mirror domain modules. Epic 6 should turn the existing Control Mirror report into a durable, shareable evidence pack while preserving the trust boundaries established in Epics 3-5.

The core product goal is auditability: a Delivery Lead, AQA or governance stakeholder should be able to export what Control Mirror concluded, which evidence it used, what was redacted or omitted, and which Human Review decisions remain open.

## Requirements Inventory

### Functional Requirements

FR1: Control Mirror must expose a deterministic report/evidence-pack payload.

FR2: The export payload must include dashboard summary, source/snapshot metadata, evidence summaries, conformance findings, guardrail findings, Human Review state and recommended next step.

FR3: The export payload must disclose retention/redaction posture and avoid raw source text.

FR4: The web UI must provide a clear export/download action for the current Control Mirror state.

FR5: Export failure states must be visible and must not imply a report was created.

### Non-Functional Requirements

NFR1: Do not include raw uploaded source content in the export payload.

NFR2: Preserve organization scoping for any server-side export action.

NFR3: Keep export serialization deterministic enough for tests and audit comparisons.

NFR4: Keep report/export logic in domain/API helpers, not embedded only in page rendering.

NFR5: Preserve existing Control Mirror dashboard behavior.

## Epic 6 Goal

Make Control Mirror results portable and auditable through a safe evidence-pack export model and UI action.

## Stories

### Story 6.1: Add Control Mirror Evidence Pack Export Model

As an AQA,
I want a serializable Control Mirror evidence pack model,
so that report/export work can use a stable payload without scraping page UI.

**Acceptance Criteria:**

1. Given a Control Mirror dashboard, when an evidence pack is built, then it includes report metadata, snapshot/source state, summary items, evidence summaries, findings, Human Review state and recommended next step.
2. Given evidence contains retained or redacted source context, when the evidence pack is built, then raw source text is not included and retention disclosure is included.
3. Given package consumers import from `@aas-companion/domain`, when runtime packages build, then evidence pack exports are available.

### Story 6.2: Add Web Export Action for Current Control Mirror State

As a Delivery Lead,
I want to download the current Control Mirror evidence pack,
so that I can share audit-ready evidence with reviewers.

**Acceptance Criteria:**

1. Given I open Control Mirror, when the dashboard loads, then an export action is visible near the report section.
2. Given I trigger export, when the server action succeeds, then a JSON evidence pack is returned for the current organization context.
3. Given export fails, when the page returns, then the error is clear and no successful export is implied.

### Story 6.3: Show Export Contents and Retention Disclosures

As a governance reviewer,
I want the export panel to preview what the evidence pack contains,
so that I know what will and will not be shared.

**Acceptance Criteria:**

1. Given an export action is visible, when I inspect the report area, then included sections are listed.
2. Given retention/redaction applies, when export guidance renders, then it states that raw source text is not included.
3. Given Human Review items exist, when export guidance renders, then open/blocking review counts are visible.

### Story 6.4: Harden Evidence Pack Regression Coverage

As an AQA,
I want focused export tests,
so that future report changes do not leak raw source text or drop required audit fields.

**Acceptance Criteria:**

1. Given a dashboard with redacted evidence, when export tests run, then raw source text is not serialized.
2. Given Human Review decisions exist, when export tests run, then decision state and latest rationale are preserved.
3. Given the web export action renders, when page tests run, then export guidance and failure states remain covered.

## Recommended First Slice

Start with **Story 6.1: Add Control Mirror Evidence Pack Export Model**.

This is the smallest correct next step because it creates a stable domain payload before adding download behavior or UI affordances.
