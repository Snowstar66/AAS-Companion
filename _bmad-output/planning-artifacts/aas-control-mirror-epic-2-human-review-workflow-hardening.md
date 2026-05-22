---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - docs/features/aas-control-mirror.md
  - docs/aas-companion-ux-spec.md
  - _bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md
  - _bmad-output/planning-artifacts/aas-control-mirror-implementation-epics.md
  - _bmad-output/implementation-artifacts/1-6-human-review-guardrails-and-control-report.md
  - _bmad-output/implementation-artifacts/epic-1-retro-2026-05-21.md
created: 2026-05-21
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 2: Human Review Workflow Hardening

## Overview

Epic 1 completed the Control Mirror MVP and proved the core conformance loop: snapshot summary, artifact manifest, AAS normalization, cross-reference checks, evidence coverage, guardrails, linked Human Review recommendations and report preview.

The remaining risk is that Human Review is still mostly represented as linked/recommended review items rather than a first-class persisted decision workflow. Epic 2 turns Control Mirror findings into auditable Human Review work that can be owned, decided, traced back to findings and reflected consistently in dashboard/report readiness.

## Requirements Inventory

### Functional Requirements

FR1: Control Mirror must create or update persisted Human Review items for critical conformance gaps that require a human decision.

FR2: Human Review items must preserve source finding linkage, affected Outcome/Epic/Story/artifact, severity, recommended decision and blocking status.

FR3: Human Review items must support a lifecycle with at least open, decided, deferred and superseded states.

FR4: Human Review decisions must support approve, reject, defer, downgrade, request exception and request rework outcomes where applicable.

FR5: Control Mirror dashboard and report read models must include persisted open/decided review state rather than only generated recommendations.

FR6: When a conformance finding changes or disappears, the corresponding Human Review item must be updated without losing prior decision history.

FR7: Human Review decisions must be auditable through a chronological decision history with actor, timestamp, decision, rationale and affected objects.

FR8: Control Mirror release/readiness recommendations must honor unresolved blocking Human Review items.

### NonFunctional Requirements

NFR1: All persisted review records must enforce tenant scope through `organizationId`.

NFR2: The workflow must not allow AI to approve release, accept residual risk or silently downgrade/override a human mandate.

NFR3: Decision history must be append-only from the user perspective; superseded items may be linked or marked but not erased from audit context.

NFR4: The implementation must reuse existing AAS Companion patterns for repositories, API services, App Router pages, cards, badges and tests.

NFR5: The user interface must stay operational and compact, with decision controls close to the affected finding.

NFR6: Tests must cover deterministic rule behavior, persistence mapping, API/service behavior and page rendering for open and decided review states.

### Additional Architecture Requirements

- Prefer first-class persisted review items if the current model supports it; otherwise introduce a narrow Control Mirror review queue model rather than expanding unrelated tollgate/signoff tables.
- Existing `ActivityEvent` and Human Review concepts should be reused where suitable.
- Persisted review records must link to `ControlMirrorCheckResult` or equivalent stable finding identifiers.
- Core status calculation belongs in the domain/API/query layer, not only in React components.
- Conformance status must remain transparent; blockers must not be hidden behind aggregate scores.

### UX Design Requirements

UX-DR1: Human Review must present a candidate/review queue grouped by missing, uncertain, human-only, blocked and unmapped findings where relevant.

UX-DR2: Each review item must show source lineage, affected object, decision needed, recommended option, alternatives, risks and blocking effect.

UX-DR3: Decision actions must be visible, calm and explicit, using existing AAS Companion operational UI patterns.

UX-DR4: Control Mirror must show open Human Review items as a first-class readiness signal.

UX-DR5: Import/review surfaces must preserve lineage and review status, avoiding silent promotion of uncertain or blocked objects.

## Coverage Map

| Requirement | Covered by |
| --- | --- |
| FR1, FR2, FR3 | Story 2.1 |
| FR4, FR7, NFR2, NFR3 | Story 2.2 |
| FR5, FR8, UX-DR4 | Story 2.3 |
| FR6, NFR6 | Story 2.4 |
| NFR1, NFR4 | All stories |
| UX-DR1, UX-DR2, UX-DR3, UX-DR5 | Stories 2.2 and 2.3 |

## Epic List

1. Epic 2: Human Review Workflow Hardening - make Control Mirror Human Review decisions persisted, auditable and readiness-driving.

## Epic 2: Human Review Workflow Hardening

### Epic Goal

Make Control Mirror Human Review a first-class governance workflow so mandate holders can decide critical conformance gaps with traceable lifecycle state, audit history and direct impact on release/readiness recommendations.

### Story 2.1: Persist Control Mirror Human Review Queue

As an AQA,
I want critical Control Mirror findings to create persisted Human Review queue items,
So that required human decisions are not only generated in the dashboard but can be owned, tracked and audited.

**Acceptance Criteria:**

**Given** Control Mirror detects a critical gap requiring human decision
**When** conformance results are saved or refreshed
**Then** a persisted Human Review item is created or updated with finding id, organization id, severity, affected object, recommendation, blocking status and source lineage.

**Given** the same finding is detected again
**When** the queue sync runs
**Then** the existing Human Review item is updated instead of duplicating a new open item.

**Given** a finding belongs to another organization
**When** review items are queried or updated
**Then** tenant boundaries prevent cross-organization access.

**Implementation Notes:**

- Start by inspecting existing review/tollgate/signoff tables and repository patterns.
- Add the narrowest persistence model needed for Control Mirror review items and links.
- Keep generated recommendation logic deterministic and domain-owned.

### Story 2.2: Add Decision Lifecycle and Audit History

As a mandate holder,
I want each Human Review item to support explicit decisions and rationale,
So that proceed, pause, downgrade, exception and rework choices are visible and auditable.

**Acceptance Criteria:**

**Given** an open Human Review item exists
**When** a user records a decision
**Then** the item stores decision type, rationale, actor, timestamp and resulting state.

**Given** a decision changes the delivery posture
**When** the item is saved
**Then** the audit history preserves the prior state and appends the new decision event.

**Given** an AI-generated recommendation exists
**When** a decision is recorded
**Then** the UI and persisted data distinguish recommendation from human decision.

**Given** the user attempts to approve release or accept residual risk through AI output alone
**When** the decision is validated
**Then** the system blocks silent AI approval and requires explicit human-owned decision data.

**Implementation Notes:**

- Model decisions as append-only events or a decision-history child table.
- Keep decision labels aligned with Control Mirror readiness options: proceed, proceed with controls, downgrade, pause, exception, rework.
- Avoid implying legal approval; this is product governance evidence.

### Story 2.3: Reflect Review State in Control Mirror Dashboard and Report

As a Delivery Lead,
I want Control Mirror readiness to use persisted Human Review state,
So that dashboard and report recommendations match the actual decision workflow.

**Acceptance Criteria:**

**Given** open blocking Human Review items exist
**When** Control Mirror readiness is calculated
**Then** release/readiness recommendation cannot show ready without exposing the blockers.

**Given** Human Review items have decisions
**When** I open Control Mirror
**Then** the dashboard shows open, decided, deferred and superseded counts with affected Outcome/Epic/Story context.

**Given** a Control Mirror report is generated
**When** review items are included
**Then** the report includes persisted decision state, rationale summary and unresolved blockers.

**Given** the review queue is empty
**When** the dashboard renders
**Then** it shows a clear empty state rather than implying review was skipped.

**Implementation Notes:**

- Keep dashboard/report read models derived from the same service result.
- Reuse existing page styles and avoid card-in-card nesting beyond repeated list items.
- Include tests for both open blocker and decided item states.

### Story 2.4: Reconcile Review Items Across Snapshot Refreshes

As an AI Delivery Architect,
I want review items to reconcile when findings change across snapshots,
So that the audit trail stays trustworthy as evidence improves or drifts.

**Acceptance Criteria:**

**Given** a finding remains present after refresh
**When** Control Mirror syncs review items
**Then** the existing review item remains linked and receives updated finding metadata.

**Given** a finding disappears because evidence is corrected
**When** Control Mirror syncs review items
**Then** unresolved review items are marked superseded or resolved-by-refresh according to the lifecycle rules without deleting history.

**Given** a decided finding reappears with materially different evidence
**When** Control Mirror syncs review items
**Then** the system opens a new review need or marks the prior decision as needing reassessment.

**Given** snapshot refresh creates many findings
**When** reconciliation runs
**Then** deterministic matching prevents duplicate review spam for stable findings.

**Implementation Notes:**

- Define stable finding keys before adding UI polish.
- Match by organization, snapshot/project context, finding type and affected object where possible.
- Include unit coverage for unchanged, resolved, duplicated and materially changed findings.

## Recommended First Slice

Start with **Story 2.1: Persist Control Mirror Human Review Queue**.

This is the smallest correct foundation. Story 2.2 depends on having items to decide, and Story 2.3 depends on persisted state to display. Story 2.4 is best after the basic persistence and decision lifecycle are in place.
