---
stepsCompleted:
  - step-01-derive-from-epic-4-retro
  - step-02-design-epic-5
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-4-retro-2026-05-22.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-4-uploaded-snapshot-ux-and-adapter.md
  - _bmad-output/planning-artifacts/aas-control-mirror-implementation-epics.md
created: 2026-05-22
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 5: Control Mirror Modularization

## Overview

Epic 4 made uploaded snapshots usable from Control Mirror. The next risk is not missing capability; it is concentration of behavior in a few high-traffic files. `packages/domain/src/control-mirror.ts` now owns source policy, uploaded snapshot validation, retention/redaction, normalization, conformance, Human Review state, report summaries and dashboard assembly.

Epic 5 should reduce change risk by extracting stable domain seams while preserving public exports and behavior. The goal is not a redesign. The goal is smaller modules with focused tests and no product-visible change.

## Requirements Inventory

### Functional Requirements

FR1: Control Mirror public domain exports must remain backward compatible.

FR2: Source policy, uploaded snapshot validation and retention/redaction helpers must be isolated from dashboard assembly.

FR3: Conformance and report composition helpers must be easier to test without constructing full page scenarios.

FR4: Human Review identity/state helpers must remain compatible with persisted review reconciliation.

FR5: Existing Control Mirror dashboard output must remain behaviorally unchanged.

### Non-Functional Requirements

NFR1: No new user-facing capability in this epic.

NFR2: No schema migration unless a later story explicitly proves it is necessary.

NFR3: Keep extraction mechanical and covered by existing targeted tests.

NFR4: Preserve package-level import compatibility through `@aas-companion/domain`.

NFR5: Prefer small modules over broad abstractions.

## Epic 5 Goal

Reduce Control Mirror implementation risk by modularizing the domain logic that changed most during Epics 1-4, while keeping behavior, exports and UI output stable.

## Stories

### Story 5.1: Extract Source Policy and Uploaded Snapshot Domain Helpers

As an AI Delivery Architect,
I want source policy, uploaded snapshot validation and retention helpers moved into a focused domain module,
so that future upload or source-mode changes do not require editing the full Control Mirror dashboard engine.

**Acceptance Criteria:**

1. Given existing imports from `@aas-companion/domain`, when tests build, then source policy, uploaded snapshot and retention exports remain available.
2. Given uploaded snapshot validation runs, when existing guardrail tests execute, then accepted, rejected and unreadable behavior is unchanged.
3. Given Control Mirror dashboard builds evidence, when existing rule/page tests execute, then retention disclosure and source policy output are unchanged.

### Story 5.2: Extract Human Review State and Stable Finding Identity Helpers

As a Delivery Lead,
I want Human Review state and stable finding identity logic isolated,
so that reconciliation behavior stays testable as Control Mirror findings evolve.

**Acceptance Criteria:**

1. Given existing review items, when state summary runs, then open/decided/deferred/superseded counts remain unchanged.
2. Given uploaded snapshot findings refresh, when stable keys are derived, then matching findings preserve identity.
3. Given persisted decisions exist, when dashboard state is applied, then latest decision and blocking state remain unchanged.

### Story 5.3: Extract Report and Retention Summary Composition

As an AQA,
I want report summary and retention summary composition isolated,
so that evidence-pack work can build on a stable report boundary.

**Acceptance Criteria:**

1. Given a Control Mirror dashboard is built, when report summary items render, then labels, statuses and recommended next step remain unchanged.
2. Given retained, redacted or omitted evidence exists, when retention summary is composed, then disclosure text remains unchanged.
3. Given report output is tested, when future export work starts, then it can reuse a focused report module.

### Story 5.4: Add Module-Level Regression Coverage for Control Mirror Boundaries

As an AQA,
I want focused tests around the extracted Control Mirror modules,
so that future feature work can change one boundary without silently breaking another.

**Acceptance Criteria:**

1. Given extracted modules exist, when targeted tests run, then source policy, review state and report composition have direct coverage.
2. Given dashboard integration tests run, when module extraction is complete, then no dashboard output regressions are introduced.
3. Given package exports build, when consumers import from `@aas-companion/domain`, then compatibility remains intact.

## Recommended First Slice

Start with **Story 5.1: Extract Source Policy and Uploaded Snapshot Domain Helpers**.

This is the smallest correct next step because the source/upload helpers are already a coherent block, have focused tests, and can be extracted without changing UI behavior.
