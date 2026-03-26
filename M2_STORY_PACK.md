# M2 Story Pack

This file defines the second implementation milestone after M1.

## M2 goal
Build the artifact intake, interpretation and compliance layer so the AAS Control Plane can ingest existing delivery artifacts, translate them into the AAS model, show what is missing for compliance, and control progression into Framing, Design and Build.

M2 should make it possible to:
- upload external markdown-based delivery artifacts
- classify source artifact type
- parse structured candidate content
- map imported content into the AAS canonical model
- show AAS compliance gaps
- separate missing data from uncertain interpretation and human-only decisions
- route imported content through human review
- promote confirmed content into governed Framing and Design objects
- block build progression when unresolved compliance gaps remain

---

## M2 scope in
- Artifact Intake workspace
- source classification
- markdown parsing
- candidate object extraction
- AAS candidate object mapping
- compliance gap analysis
- human review queue
- promotion into governed objects
- imported-origin markers
- AAS readiness state for promoted imported objects
- build blocking for unresolved imported compliance

## M2 scope out
- non-markdown document formats
- advanced OCR/document intelligence
- autonomous remediation of compliance gaps
- automatic tollgate approvals
- advanced multi-system synchronization
- actual external build execution adapters
- release approval automation

---

## M2 story order

### M2-STORY-001
Create Artifact Intake workspace

### M2-STORY-002
Classify and parse imported artifacts into structured candidate objects

### M2-STORY-003
Map parsed artifacts to the AAS canonical candidate model

### M2-STORY-004
Run AAS compliance gap analysis on candidate imported objects

### M2-STORY-005
Create Human Review and Confirmation queue for imported artifacts

### M2-STORY-006
Promote confirmed imported artifacts into governed Framing and Design objects

### M2-STORY-007
Show imported artifacts in Value Spine and readiness views

### M2-STORY-008
Block build progression when imported artifacts are not AAS-compliant

---

## M2 architecture constraints
These constraints apply across the whole milestone:
- imported artifacts must remain organization-scoped
- source lineage must remain visible from imported file to governed object
- mapping must preserve ambiguity instead of hiding it
- deterministic compliance rules must stay explainable
- human-only decisions must remain separate from machine interpretation
- promotion must not imply automatic tollgate approval
- build progression must remain blocked when unresolved compliance gaps exist

---

## M2 compliance result categories
The product must distinguish clearly between:
- `missing`
- `uncertain`
- `human-only`
- `blocked`

### Meaning
- `missing`: required field or link is not present
- `uncertain`: imported content may represent the needed field, but interpretation confidence is not sufficient
- `human-only`: a human must explicitly decide or confirm this
- `blocked`: the object cannot progress because unresolved conditions remain

These categories must appear consistently in:
- intake views
- mapping views
- compliance views
- review queue
- build handoff

---

## M2 imported object readiness states
Promoted imported objects should use a visible AAS readiness state such as:
- `imported`
- `imported_incomplete`
- `imported_human_review_needed`
- `imported_framing_ready`
- `imported_design_ready`
- `blocked`

These states should be visible in:
- object detail views
- readiness panels
- Value Spine views
- build gating flows

---

## M2 review point
After the first three M2 stories, stop for human review.

That review should inspect:
- source classification quality
- parsing quality
- mapping quality
- ambiguity handling
- whether candidate AAS object mapping is trustworthy enough to continue

Only after that review should the team continue to:
- compliance analysis
- human review queue
- promotion
- build blocking

---

## M2 demo acceptance
M2 is acceptable when the following can be demonstrated:
- user uploads markdown-based artifacts
- system classifies source artifact type
- system parses candidate outcomes, epics and stories
- system maps imported content into candidate AAS objects
- system shows clear compliance gaps
- system separates machine uncertainty from human-only decisions
- user can review and confirm imported content
- promoted imported objects appear in Framing/Design views with origin and readiness state
- unresolved imported compliance blocks build progression

---

## Recommended implementation lanes after review of M2-STORY-001 to 003

### Lane A
- compliance engine
- compliance views
- human review queue

### Lane B
- promotion flow
- readiness states
- imported origin markers
- build blocking

Do not parallelize heavily before source classification, parsing and mapping are judged stable.

---

## Delivery discipline
Every commit, PR or AI session summary must mention the Story-ID.

Every completed story must produce:
- implementation summary
- changed file list
- tests added or changed
- test results
- deviations or known risks
- note of required human decisions

---

## Governance reminder
Imported content may be interpreted by AI, but the following remain human-controlled:
- Value Owner confirmation
- baseline validity
- AI level confirmation
- risk acceptance
- tollgate approvals