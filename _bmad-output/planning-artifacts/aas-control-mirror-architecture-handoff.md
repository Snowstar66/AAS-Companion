---
artifact: architecture-handoff
feature: AAS Control Mirror
outcome_id: OUT-CM-001
source_reference: docs/features/aas-control-mirror.md
role: Solution / AI Delivery Architect
execution_mode: simulated role reasoning
created: 2026-05-21
status: complete-for-readiness-check
depends_on:
  - _bmad-output/planning-artifacts/aas-control-mirror-analyst-handoff.md
  - _bmad-output/planning-artifacts/aas-control-mirror-product-handoff.md
  - _bmad-output/planning-artifacts/aas-control-mirror-ux-handoff.md
---

# AAS Control Mirror - Architecture Handoff

## Execution Statement

This handoff was produced in simulated role reasoning by the same Codex session coordinating the BMAD run. It is not independent architecture approval.

No implementation has been started.

## Architectural Objective

Control Mirror should become a governed conformance subsystem that takes a project source snapshot, creates an artifact manifest, normalizes recognized evidence into AAS concepts, runs conformance checks, surfaces Human Review needs and generates a report.

The subsystem should integrate with existing AAS Companion boundaries:

- Next.js App Router in `apps/web`.
- API/service layer in `packages/api`.
- Persistence and repositories in `packages/db`.
- Domain parsing/rules in domain package patterns.
- Existing tenant boundary through `organizationId`.
- Existing ActivityEvent and Human Review concepts where suitable.

## Proposed Subsystem Boundaries

| Boundary | Responsibility |
| --- | --- |
| Source ingestion | Accept user-authorized files/snapshots and create scan jobs. |
| Snapshot model | Represent one immutable scan of a project source. |
| Artifact manifest | Store file metadata, hash, classification, parsing status and lineage. |
| Parser/normalizer | Convert raw files into canonical AAS evidence candidates. |
| Conformance engine | Run deterministic checks over normalized evidence and approved Framing. |
| AI-level evaluator | Compare requested AI level with required evidence. |
| Human Review adapter | Create or suggest review items for critical gaps. |
| Dashboard/report query layer | Provide summarized and drill-down-ready read models. |

## MVP Data Model Proposal

New persisted entities are recommended rather than overloading Artifact Intake, because Control Mirror includes build/test/log evidence beyond Framing import.

### ControlMirrorSnapshot

Fields:

- id
- organizationId
- label
- sourceType
- sourceReference
- scanStartedAt
- scanCompletedAt
- status
- approvedFramingOutcomeId
- approvedFramingVersion
- requestedAiAccelerationLevel
- achievedAiAccelerationLevel
- releaseReadiness
- summaryJson
- createdBy
- createdAt
- updatedAt

### ControlMirrorArtifact

Fields:

- id
- snapshotId
- organizationId
- filePath
- fileName
- extension
- sizeBytes
- sourceHash
- lastModifiedAt
- artifactType
- parsingStatus
- parsingConfidence
- detectedOutcomeKey
- detectedEpicKey
- detectedStoryKey
- detectedAiLevel
- lineageStatus
- sourceExcerpt
- parsedJson
- createdAt
- updatedAt

### ControlMirrorEvidence

Fields:

- id
- snapshotId
- artifactId
- organizationId
- evidenceType
- aasEntityType
- aasEntityKey
- sourceSection
- confidence
- normalizedJson
- createdAt

### ControlMirrorCheckResult

Fields:

- id
- snapshotId
- organizationId
- checkType
- status
- severity
- outcomeKey
- epicKey
- storyKey
- artifactId
- evidenceIds
- message
- recommendation
- requiresHumanReview
- createdAt

### ControlMirrorHumanReviewLink

Fields depend on whether Human Review gets a first-class queue model. MVP can either:

- Persist links to new/existing review records if available.
- Or persist generated review recommendations in `ControlMirrorCheckResult` and surface them in the dashboard/report until a Human Review table exists.

Product preference is actual persisted Human Review items for auditable decisions, but this may be split into a second implementation slice.

## Source Ingestion Constraints

- Browser cannot silently read local project roots.
- Folder snapshot must use explicit user-selected files/directories where supported.
- Uploaded zip requires server-side or client-side extraction, file allowlist, size limit and path traversal protection.
- Git/repository root must be treated as metadata unless a server-side connector or explicit uploaded export exists.
- MVP should start with manual artifact upload and/or uploaded zip if Product wants a realistic first implementation.

## Hashing And Refresh

Use content hash as the stable change detector. Refresh compares current snapshot files to previous snapshot files by normalized path and hash.

Classifications:

- unchanged
- new
- modified
- deleted
- unreadable

Unchanged files can reuse previous parse and evidence results if parser version and normalizer version match.

## Normalization Model

Normalizer input:

- artifact manifest entries
- parsed file content
- source classification
- approved Framing/Value Spine data

Normalizer output:

- evidence records with AAS entity type/key
- confidence
- lineage to artifact and source section
- unresolved references

Canonical evidence types:

- framing_source
- design_evidence
- architecture_evidence
- ux_evidence
- story_candidate
- acceptance_criteria
- test_definition
- implementation_evidence
- test_execution
- qa_review
- risk_ledger
- decision_log
- workflow_log
- final_report

## Conformance Checks

MVP checks should include:

- Design artifact has approved Outcome alignment.
- Design artifact does not conflict with scope-out.
- Story-like item is not build-ready without required fields.
- Delivery Story maps to Outcome and Epic.
- Implementation artifact has Story-ID or requirement source.
- Story has acceptance criteria.
- Story has test definition.
- Test evidence maps to Story/Epic/Outcome.
- Requested AI level has required evidence.
- Required role handoffs exist for Level 3 claims.
- Unaccepted risk creates Human Review need.
- Architecture/security/data/UX-critical drift is at least Medium severity.

## AI Level Evidence Rules

For Level 2, required evidence:

- requirements baseline
- implementation map
- decision log
- AI Risk Ledger
- AI review
- test evidence
- final delivery report

For Level 3, additionally required:

- role handoffs
- workflow log
- AI Delivery Blueprint
- AAS Evidence Pack
- actual vs simulated execution statement
- QA/AQA independence statement
- downgrade rule evaluation

Missing required evidence must recommend one of:

- proceed at requested level
- proceed with controls
- downgrade
- pause
- request exception approval

The system may recommend but must not approve.

## Dashboard Query Model

Expose one service-level read model with:

- snapshot summary
- metric summaries
- artifact counts by type/status
- Value Spine coverage
- design readiness groups
- build conformance groups
- test evidence coverage groups
- AI level evidence gaps
- Human Review items/recommendations
- report preview data

Avoid computing core status exclusively in React components.

## Security And Privacy Constraints

- Never scan local files without explicit user selection.
- Sanitize zip paths and reject path traversal.
- Enforce organizationId on every read/write.
- Consider content retention policy before storing full file contents.
- Limit accepted file types for MVP.
- Treat secrets in uploaded logs as a risk; add redaction or warnings before broad log support.
- Do not execute uploaded project code.

## Integration With Existing System

Likely implementation areas after readiness approval:

- `packages/db/prisma/schema.prisma` for new models/enums.
- `packages/db/src/repositories` for snapshot, artifact and check repositories.
- `packages/api/src` for Control Mirror services.
- `apps/web/src/app/(protected)/control-mirror` for the route.
- `apps/web/src/components/control-mirror` for page components.
- `apps/web/src/components/layout/sidebar.tsx` and language data for navigation.
- `apps/web/src/test` for dashboard, rules and service tests.

These are architectural pointers only, not an instruction to implement yet.

## Architecture Open Questions

| Question | Recommendation |
| --- | --- |
| Store full content or excerpts only? | Start with excerpts plus parsedJson for supported text files; avoid broad log retention until policy exists. |
| Manual upload or zip first? | Manual upload is lowest risk; zip is more faithful to project snapshot but needs extraction/security work. |
| Human Review model | Prefer first-class persisted review items if current model supports it; otherwise create Control Mirror review recommendations as MVP. |
| Conformance scoring | Use transparent weighted checks or status bands; do not hide blockers behind averages. |
| Parser location | Deterministic parser/rules belong in domain/db service boundaries; AI interpretation must produce structured output with fallback. |

## Handoff To Readiness Check

Before implementation, run BMAD Check Implementation Readiness against:

- This Architecture handoff.
- Analyst handoff.
- Product handoff.
- UX handoff.
- Governing reference `docs/features/aas-control-mirror.md`.

Implementation remains blocked until readiness passes or required corrections are made.
