---
artifact: analyst-handoff
feature: AAS Control Mirror
outcome_id: OUT-CM-001
source_reference: docs/features/aas-control-mirror.md
role: Analyst
execution_mode: simulated role reasoning
created: 2026-05-21
status: complete-for-product-handoff
---

# AAS Control Mirror - Analyst Handoff

## Execution Statement

This handoff was produced by the same Codex session that is coordinating the BMAD run. It is therefore simulated role reasoning, not independent multi-agent execution.

The governing reference is `docs/features/aas-control-mirror.md`. Mermaid diagrams in that file are treated as logical design sketches, not screenshots or visual UI source material.

## Analyst Objective

Control Mirror is a governance capability for AAS Companion that scans BMAD/AAS design and build artifacts, normalizes them into AAS concepts, and compares them with approved Framing, Value Spine, requested AI Acceleration Level, risk posture and available evidence.

The key analysis conclusion is that Control Mirror is not another import parser. It is a delivery conformance layer that must preserve source lineage, detect drift, distinguish design readiness from build evidence, and surface human decision needs before release or higher AI-level claims.

## Source Materials Reviewed

- `docs/features/aas-control-mirror.md`
- `docs/aas-companion-ux-spec.md`
- `docs/architecture/m1-domain-model.md`
- `docs/architecture/m1-telemetry.md`
- Existing repository shape around `packages/api`, `packages/db`, `apps/web/src/app/(protected)`, `apps/web/src/lib/framing`, `apps/web/src/lib/intake`, and Human Review.

## Existing Product Context

AAS Companion already has these relevant concepts:

- Tenant scope through `organizationId`.
- Outcome, Epic, Story, DirectionSeed, Tollgate, SignoffRecord and ActivityEvent as core governed entities.
- Artifact intake for text, markdown, JSON and CSV uploads.
- Imported object lineage through intake sessions, files and AAS candidates.
- Human Review surfaces for uncertain or blocked promotion.
- Governance roles including value owner, AIDA, AQA, architect, delivery lead and builder.

Control Mirror should reuse these concepts where possible, but its artifact manifest and conformance results are broader than the current intake model because they include build files, tests, logs, QA evidence and reports.

## Scope In

- Project source registration for uploaded zip, folder snapshot, Git/repository root, or manual artifact upload.
- Snapshot and manifest creation with file metadata, hash, lineage status and parsing confidence.
- Artifact classification across design, architecture, UX, story, implementation, tests, QA, risk, decision, workflow log and report types.
- Normalization into canonical AAS concepts without overwriting source artifacts.
- Framing cross-reference against approved Outcome, baseline, scope, constraints, AI level and risk profile.
- Story Idea versus Delivery Story distinction.
- Design readiness reporting.
- Build conformance reporting.
- Test evidence coverage mapped to Outcome, Epic and Story.
- Requested versus achieved AI Acceleration Level evaluation.
- Human Review item generation or recommendation for critical gaps.
- Executive dashboard and Control Mirror report.

## Scope Out For MVP

- VS Code extension.
- Real-time file watching.
- Complete support for every proprietary BMAD variant.
- Deep parsing of all CI/CD log formats.
- Automated release approval.
- AI acceptance of residual risk.
- AI override of approved scope-out.

## Source Type Assumptions

| Source type | MVP interpretation | Key constraint |
| --- | --- | --- |
| Manual artifact upload | Reuse/extend existing text, markdown, JSON and CSV intake path. | Good first slice but insufficient for build artifacts. |
| Uploaded zip | Browser upload creates a static project snapshot. | Needs zip extraction, size limits, supported file filters and path sanitization. |
| Folder snapshot | Browser File System Access or multi-file directory upload where supported. | Browser support is uneven; fallback must be manual upload or zip. |
| Git/repository root | Registered metadata and later server-side scan or uploaded exported tree. | Direct local repo access is not possible from the browser without explicit user-selected files or a backend connector. |

## Artifact Taxonomy

The manifest must support at least these artifact types:

- Framing Source
- Design Artifact
- Architecture Artifact
- UX Artifact
- Delivery Story
- Implementation Note
- Test Evidence
- QA Review
- AI Risk Ledger
- Decision Log
- Workflow Log
- Final Report
- Unknown Artifact

Unknown Artifact is not a discard state. It is a controlled uncertainty state that can become a release risk if the file appears implementation-related or changes runtime behavior.

## Canonical AAS Concepts

The normalizer should map artifacts into:

- Outcome evidence
- Epic evidence
- Story Idea
- Candidate Delivery Story
- Delivery Story
- Acceptance Criteria evidence
- Test Definition evidence
- Test Execution evidence
- Implementation evidence
- Architecture decision evidence
- UX/journey evidence
- Risk evidence
- Decision evidence
- Workflow/handoff evidence
- Final report evidence

All normalized entries must keep source lineage back to snapshot id, file path, hash and source section when available.

## Story Idea Versus Delivery Story Rule

A story-like item must not become build-ready unless it has:

- Linked Outcome.
- Linked Epic.
- Story ID or proposed Story ID.
- Value intent.
- Expected behavior.
- Acceptance criteria.
- Test definition.
- AI usage scope.

If these are missing, classify as Framing Story Idea, Candidate Delivery Story, Exploration Story, Epic Candidate, Acceptance Criteria Candidate, Journey/UX Context, or Out of Scope/Deferred.

## Ambiguity Log

| Ambiguity | Impact | Recommended owner |
| --- | --- | --- |
| Whether Control Mirror should store full file content or only manifest excerpts and normalized evidence. | Privacy, storage and auditability tradeoff. | Architecture + Product |
| Whether zip upload is mandatory for MVP or can follow manual artifact upload. | Affects MVP scope and browser/server complexity. | Product |
| Whether Human Review items need a new table or can initially be represented through existing candidate/review/tollgate patterns. | Data model and UX routing. | Architecture |
| How to define numeric conformance percentages without creating false precision. | Executive trust and reporting clarity. | Product + AQA |
| Whether achieved AI level is computed deterministically or recommended with human confirmation. | Governance risk. | Architecture + AQA |
| How much implementation artifact parsing is required for the first release. | MVP feasibility. | Architecture |
| Whether Git/repository root means local browser-selected directory, remote repo connector, or server-side configured path. | Security and platform model. | Product + Architecture |

## Risk Signals

- Over-claiming Level 2/3 when evidence is incomplete.
- Treating AI-produced conformance as approval rather than review support.
- Treating Mermaid diagrams as UI screenshots.
- Hiding untraced runtime files inside aggregate percentages.
- Promoting weak Story Ideas into build work.
- Creating conformance scores without drill-down evidence.
- Allowing project-root scanning without explicit user action and clear security boundaries.

## Analyst Recommendation To Product

Product should define Control Mirror as a conformance and decision-support workspace, not a build automation feature. MVP should prioritize:

1. Snapshot and manifest.
2. AAS normalization.
3. Framing alignment.
4. Requested versus achieved AI level.
5. Design readiness.
6. Build conformance.
7. Test evidence coverage.
8. Human Review and report outputs.

Implementation must remain blocked until Product/PM, UX and Architecture handoffs are complete.
