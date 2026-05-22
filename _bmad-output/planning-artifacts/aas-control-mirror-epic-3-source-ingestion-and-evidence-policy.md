---
stepsCompleted:
  - step-01-derive-from-epic-2-retro
  - step-02-design-epic-3
  - step-03-create-stories
inputDocuments:
  - docs/features/aas-control-mirror.md
  - docs/aas-companion-ux-spec.md
  - _bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md
  - _bmad-output/planning-artifacts/aas-control-mirror-implementation-epics.md
  - _bmad-output/implementation-artifacts/epic-2-retro-2026-05-21.md
created: 2026-05-21
status: ready-for-sprint-planning
---

# AAS Control Mirror - Epic 3: Source Ingestion and Evidence Policy

## Overview

Epic 1 proved the Control Mirror conformance loop. Epic 2 made Human Review persisted, auditable and readiness-driving. Epic 3 should now expand the evidence boundary safely: Control Mirror needs clearer source-mode capabilities, retention/redaction rules and ingestion guardrails before it accepts broader project snapshots such as uploaded zip files, folder snapshots or repository exports.

The central product risk is not technical parsing. It is trust. AAS Companion must never imply it silently scanned local files, retained sensitive logs without policy, executed uploaded code, or treated unsupported source modes as live evidence.

## Requirements Inventory

### Functional Requirements

FR1: Control Mirror must expose source modes with explicit support status and constraints.

FR2: Control Mirror must distinguish current imports/manual artifacts, uploaded zip, folder snapshot and repository root modes.

FR3: Source ingestion must require explicit user action and must not silently read local project files.

FR4: Uploaded project snapshots must create a persistent Control Mirror snapshot and artifact manifest with normalized paths, hashes, artifact type, parsing status and lineage metadata.

FR5: Ingestion must reject unsafe paths, unsupported file types and unreadable files without blocking the entire scan where partial processing is safe.

FR6: Evidence retention policy must define whether content is stored as excerpts, parsed metadata, redacted text or not stored.

FR7: Control Mirror UI must show source policy, retention posture, unsupported modes and why a mode is blocked or planned.

FR8: Refresh behavior must remain deterministic and compare files by normalized path and content hash where a source mode supports refresh.

### Non-Functional Requirements

NFR1: Never execute uploaded or scanned project code.

NFR2: Enforce `organizationId` on every source, snapshot, artifact and policy read/write.

NFR3: Reject zip path traversal and absolute paths.

NFR4: Store only the minimum source content needed for conformance evidence until retention/redaction is explicitly approved.

NFR5: Do not claim repository, folder or file-system access unless the user explicitly supplied those files through a supported browser/server flow.

NFR6: Source-mode UI must be calm and operational, using existing Control Mirror and Import patterns.

NFR7: Tests must cover path safety, file allowlist behavior, refresh/change classification and policy visibility.

### Architecture Requirements

- Source ingestion remains a subsystem boundary distinct from artifact intake promotion.
- Current `ControlMirrorSource`, `ControlMirrorSnapshot`, `ControlMirrorArtifact` and normalized evidence models should be reused before adding new tables.
- Add new persistence only for source policy or ingestion audit if existing fields cannot express the required state.
- Path normalization and zip safety logic must be deterministic and unit-testable outside React.
- Broad content retention and redaction rules must be domain/service-owned, not only UI copy.
- Git/repository root should remain planned until a real connector or explicit uploaded export exists.

### UX Requirements

UX-DR1: Source modes must show support status, refresh support, retention posture and safety constraints before the user acts.

UX-DR2: Unsupported/planned source modes must be visible but not look actionable.

UX-DR3: Upload/ingestion results must show accepted, rejected, unreadable, new, modified, unchanged and deleted counts.

UX-DR4: Evidence policy warnings must sit near the source action, not hidden in documentation.

UX-DR5: Users must see that Control Mirror reads user-authorized evidence, not arbitrary local files.

## Coverage Map

| Requirement | Covered by |
| --- | --- |
| FR1, FR2, FR3, FR6, FR7, NFR4, NFR5, UX-DR1, UX-DR2, UX-DR4, UX-DR5 | Story 3.1 |
| FR4, FR5, NFR1, NFR2, NFR3, NFR7, UX-DR3 | Story 3.2 |
| FR6, NFR4, NFR7, UX-DR4 | Story 3.3 |
| FR8, NFR2, NFR7, UX-DR3 | Story 3.4 |

## Epic 3: Source Ingestion and Evidence Policy

### Epic Goal

Make Control Mirror evidence ingestion explicit, safe and policy-driven so users can expand from current imported artifacts toward uploaded project snapshots without compromising source trust, privacy or auditability.

### Story 3.1: Establish Source Mode Registry and Evidence Policy Surface

As a Delivery Lead,
I want Control Mirror to show which source modes are supported, planned or blocked and what evidence retention policy applies,
so that I understand exactly what evidence the system can read before I connect anything.

**Acceptance Criteria:**

**Given** I open Control Mirror source/evidence controls
**When** source modes are listed
**Then** each mode shows support status, refresh support, retention posture and safety constraints.

**Given** a mode is planned or unsupported
**When** it is displayed
**Then** it is visible but cannot be selected as if it were live.

**Given** evidence content may contain sensitive data
**When** the policy is shown
**Then** the UI states whether content is stored as metadata, excerpts, redacted content or not retained.

**Given** the user has not uploaded or selected files
**When** Control Mirror renders
**Then** it must not imply local files or repositories were scanned.

**Implementation Notes:**

- Start with a domain-level source-mode registry and policy read model.
- Reuse existing `ControlMirrorSourceType` concepts where possible.
- Keep current imports/manual artifact upload as active/currently supported.
- Keep uploaded zip as the next candidate mode but do not implement extraction in this story.
- Folder snapshot and Git/repository root should remain planned/unsupported until a real browser/server connector exists.

### Story 3.2: Add Uploaded Snapshot Intake Guardrails

As an AI Delivery Architect,
I want uploaded project snapshots to be validated before processing,
so that unsafe paths, unsupported files and unreadable content cannot compromise Control Mirror evidence.

**Acceptance Criteria:**

**Given** a project snapshot upload is provided
**When** ingestion validates files
**Then** path traversal, absolute paths and unsupported extensions are rejected.

**Given** valid files remain
**When** snapshot creation completes
**Then** a persistent snapshot and artifact manifest are created with normalized path, hash, type, parsing status and lineage metadata.

**Given** some files are rejected or unreadable
**When** the scan completes
**Then** the dashboard shows accepted/rejected/unreadable counts and continues with safe files.

**Implementation Notes:**

- Prefer a narrow server-side validation utility before wiring broad UI.
- Do not execute uploaded code.
- Keep file allowlist conservative: markdown, text, JSON, CSV and selected log/report extensions.

### Story 3.3: Apply Retention and Redaction Policy to Evidence Storage

As an AQA,
I want Control Mirror to store only policy-compliant evidence content,
so that uploaded logs or repository exports do not create hidden privacy/security risk.

**Acceptance Criteria:**

**Given** evidence content is parsed
**When** it is stored
**Then** retention mode determines whether full content, excerpt, redacted excerpt or metadata-only data is persisted.

**Given** possible secrets or sensitive values are detected
**When** evidence is normalized
**Then** the stored excerpt is redacted or the item is marked for Human Review.

**Given** a report is generated
**When** it references source evidence
**Then** it must disclose whether source text was retained, redacted or omitted.

### Story 3.4: Refresh Uploaded Evidence Snapshots Deterministically

As a Delivery Lead,
I want refreshed uploaded snapshots to compare against prior snapshots,
so that I can see what evidence changed without duplicate review spam.

**Acceptance Criteria:**

**Given** a previous snapshot exists
**When** a new upload is processed for the same source
**Then** files are classified as unchanged, new, modified, deleted or unreadable by normalized path and hash.

**Given** unchanged files exist
**When** parser and normalizer versions are compatible
**Then** parse results may be reused.

**Given** changed files affect Human Review findings
**When** Control Mirror syncs review items
**Then** Epic 2 reconciliation rules preserve decision history and avoid duplicate review spam.

## Recommended First Slice

Start with **Story 3.1: Establish Source Mode Registry and Evidence Policy Surface**.

This is the smallest correct next step because it gives the UI and service layer an explicit source/evidence policy before any broader ingestion surface is added.
