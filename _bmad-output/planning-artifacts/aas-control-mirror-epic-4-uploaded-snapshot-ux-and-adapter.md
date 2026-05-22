---
stepsCompleted:
  - step-01-derive-from-epic-3-retro
  - step-02-design-epic-4
  - step-03-create-stories
inputDocuments:
  - _bmad-output/implementation-artifacts/epic-3-retro-2026-05-21.md
  - _bmad-output/planning-artifacts/aas-control-mirror-epic-3-source-ingestion-and-evidence-policy.md
  - _bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md
created: 2026-05-21
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 4: Uploaded Snapshot UX and Adapter

## Overview

Epic 3 made Control Mirror source ingestion explicit, safe and policy-driven. It created the backend contract for uploaded project snapshots, including path validation, file allowlists, retention/redaction policy and deterministic refresh classification.

Epic 4 should turn that backend capability into a careful user-facing workflow. The product risk is still trust: users must know exactly what they are uploading, what was accepted or rejected, what source text was retained or redacted, and why folder or repository access is not happening silently.

## Requirements Inventory

### Functional Requirements

FR1: Control Mirror must provide a visible uploaded snapshot action from the source policy surface.

FR2: The upload workflow must accept explicit user-provided project snapshot files and convert them into the uploaded snapshot file input contract.

FR3: The workflow must show file limits, allowed formats, retention posture and safety constraints before submission.

FR4: Ingestion results must show accepted, rejected, unreadable, unchanged, new, modified and deleted counts.

FR5: Users must be able to inspect rejected/unreadable reasons without exposing hidden local file access.

FR6: Uploaded snapshot refresh must reuse the same source identity for deterministic change comparison.

FR7: Upload errors must fail closed with clear operational messages and no partial UI claim that local folders were scanned.

FR8: The upload workflow must keep unsupported folder/repository modes visible but non-actionable.

### Non-Functional Requirements

NFR1: Do not execute uploaded code.

NFR2: Do not silently read local project folders or repositories.

NFR3: Keep file size, file count and extension limits explicit.

NFR4: Preserve organization scoping for every uploaded snapshot action.

NFR5: Keep retention/redaction policy in the backend path, not only in the UI.

NFR6: Keep the UI calm, operational and consistent with Control Mirror patterns.

NFR7: Add tests for success, rejected files, unreadable files, refresh counts and UI disclosure.

### Architecture Requirements

- Use the existing `createControlMirrorUploadedSnapshot()` entry point from Story 3.2.
- Add an adapter layer between browser upload payloads and `ControlMirrorUploadedSnapshotFileInput`.
- Keep archive extraction or multi-file parsing deterministic and isolated from page rendering.
- Do not add a repository connector or folder scanner in this epic.
- Keep Control Mirror upload actions under the protected organization context.
- Start modularizing new upload-specific logic rather than adding all code to `control-mirror.ts`.

### UX Requirements

UX-DR1: The first viewport of Control Mirror must still communicate current readiness before upload controls.

UX-DR2: Source policy controls must show uploaded snapshot as active only when the adapter is wired.

UX-DR3: Upload UI must show accepted/rejected/unreadable and refresh deltas after submission.

UX-DR4: Retention/redaction disclosure must appear near upload and in report preview.

UX-DR5: Empty, failed and partial ingestion states must be visible and understandable.

## Coverage Map

| Requirement | Covered by |
| --- | --- |
| FR1, FR3, FR8, NFR6, UX-DR1, UX-DR2, UX-DR4 | Story 4.1 |
| FR2, FR7, NFR1, NFR2, NFR3, NFR4, NFR5 | Story 4.2 |
| FR4, FR5, FR6, NFR7, UX-DR3, UX-DR5 | Story 4.3 |
| FR4, FR6, FR7, NFR7, UX-DR3, UX-DR5 | Story 4.4 |

## Epic 4: Uploaded Snapshot UX and Adapter

### Epic Goal

Make uploaded project snapshots usable from Control Mirror through an explicit, policy-aware upload workflow that preserves the safety guarantees established in Epic 3.

### Story 4.1: Activate Uploaded Snapshot Source Action

As a Delivery Lead,
I want the Control Mirror source panel to present uploaded snapshot as an explicit action,
so that I can start a project evidence upload without thinking the app scanned my machine.

**Acceptance Criteria:**

**Given** I open Control Mirror
**When** source modes render
**Then** uploaded snapshot is shown as active with refresh support, retention posture and safety constraints.

**Given** folder snapshot and repository root are not implemented
**When** source modes render
**Then** they remain visible but non-actionable.

**Given** I choose uploaded snapshot
**When** the upload panel opens
**Then** it states allowed file types, size/count constraints and redaction policy before submission.

### Story 4.2: Add Uploaded Snapshot Submission Adapter

As an AI Delivery Architect,
I want uploaded files to be converted into the existing safe snapshot input contract,
so that the UI can use the Epic 3 backend without duplicating validation logic.

**Acceptance Criteria:**

**Given** files are selected through the upload workflow
**When** submission runs
**Then** the adapter creates `ControlMirrorUploadedSnapshotFileInput` records with explicit path, content and size.

**Given** a file cannot be read by the browser/server action
**When** ingestion runs
**Then** it is passed as unreadable rather than processed as source evidence.

**Given** the backend rejects files
**When** submission completes
**Then** the UI receives structured counts and reasons from the persisted snapshot summary.

### Story 4.3: Show Uploaded Snapshot Result Summary

As an AQA,
I want upload results to show accepted, rejected, unreadable and refresh delta counts,
so that I can validate evidence coverage and privacy posture before relying on Control Mirror.

**Acceptance Criteria:**

**Given** an uploaded snapshot completes
**When** Control Mirror refreshes
**Then** accepted, rejected, unreadable, unchanged, new, modified and deleted counts are visible.

**Given** rejected or unreadable files exist
**When** I inspect results
**Then** reasons are visible without exposing hidden local filesystem access.

**Given** sensitive evidence was redacted
**When** the result summary and report render
**Then** retention disclosure remains visible.

### Story 4.4: Harden Uploaded Snapshot Failure and Refresh States

As a Delivery Lead,
I want upload failures and repeated uploads to be deterministic and understandable,
so that Control Mirror does not create duplicate review noise or misleading readiness claims.

**Acceptance Criteria:**

**Given** upload submission fails
**When** the page returns
**Then** the error is clear and no successful scan is implied.

**Given** the same snapshot is uploaded again
**When** Control Mirror compares it
**Then** unchanged files are counted as unchanged and do not create duplicate review identity.

**Given** a changed upload affects Human Review findings
**When** queue sync runs
**Then** Epic 2 reconciliation rules preserve previous decisions where the stable finding key still applies.

## Recommended First Slice

Start with **Story 4.1: Activate Uploaded Snapshot Source Action**.

This is the smallest correct next step because it makes the source policy surface honest about the newly available backend capability without yet adding archive extraction complexity.
