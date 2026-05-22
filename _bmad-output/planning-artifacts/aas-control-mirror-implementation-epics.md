---
artifact: implementation-epics
feature: AAS Control Mirror
outcome_id: OUT-CM-001
source_reference: docs/features/aas-control-mirror.md
created: 2026-05-21
status: ready-for-sprint-tracking
execution_mode: simulated role reasoning
---

# AAS Control Mirror - Implementation Epics and Stories

## Execution Statement

This file translates the governing Control Mirror reference into implementation stories for sprint tracking. It compresses the 11 recommended MVP backlog stories into 6 implementation stories while preserving traceability to the original CM story IDs.

The first implementation story is already completed by the current Control Mirror MVP slice. It is a read-model dashboard over existing AAS Companion records, not the final persistent snapshot model.

## Epic 1: Control Mirror MVP

### Epic Goal

Deliver a usable Control Mirror capability that can register or derive project sources, create traceable artifact evidence, normalize artifacts into AAS concepts, calculate conformance against approved Framing and Value Spine, surface Human Review needs, and generate a report-ready control view.

### Story 1.1: Current-State Control Mirror Dashboard

**Traceability:** CM-03.3, CM-04.1, CM-05.1, CM-06.2, CM-08.1, CM-09.1 partial

As a Delivery Lead, I want a Control Mirror dashboard derived from existing AAS Companion records so that I can immediately see requested AI level, achieved AI level, conformance metrics, artifact evidence and Human Review risks.

#### Acceptance Criteria

```gherkin
Given an active AAS project exists
When I open Control Mirror
Then I see requested AI level, achieved AI level and release readiness

Given existing artifact intake records exist
When the dashboard loads
Then the manifest summary reflects imported files and candidates

Given evidence is missing for requested AI level
When AI level is calculated
Then achieved AI level is lower than requested
And a Human Review recommendation is shown
```

#### Current Status

Done in the first implementation slice:

- Route `/control-mirror`
- Deterministic conformance rules
- API and DB read model
- Navigation entry
- Domain and page tests
- Web build verification

### Story 1.2: Persistent Source Snapshot and Artifact Manifest

**Traceability:** CM-01.1, CM-01.2, CM-01.3

As a Delivery Lead, I want Control Mirror to register a project source and create persistent snapshots so that scans can be refreshed and compared over time.

#### Acceptance Criteria

```gherkin
Given an active AAS project exists
When I register a Control Mirror source
Then a source record is created with source type, label and support status

Given a source is scanned
When snapshot creation completes
Then each file is stored in an artifact manifest with path, name, hash, type, parsing status and lineage status

Given a previous snapshot exists
When I refresh the source
Then files are classified as unchanged, new, modified, deleted or unreadable
```

#### Notes

Start with manual artifact upload and current import-derived records. Add uploaded zip only if scope stays contained. Folder snapshot and Git root can remain planned source modes until platform constraints are resolved.

### Story 1.3: AAS Normalization and Story Readiness Classification

**Traceability:** CM-02.1, CM-02.2

As an AQA, I want scanned artifacts normalized into canonical AAS evidence so that Control Mirror can compare design/build output against Framing and Value Spine.

#### Acceptance Criteria

```gherkin
Given artifacts are present in a snapshot
When normalization runs
Then recognized content is mapped into AAS evidence types with source lineage

Given a story-like item is detected
When it lacks build-readiness fields
Then it is classified as Story Idea, Candidate Delivery Story, Exploration Story or Out of Scope/Deferred

Given normalized evidence is created
When I inspect it
Then the original source is not overwritten
And lineage to snapshot, file and source section is retained
```

### Story 1.4: Framing Cross-Reference and Build Conformance Engine

**Traceability:** CM-03.1, CM-03.2, CM-03.3, CM-05.1, CM-05.2

As a Value Owner, I want design and build artifacts checked against approved Framing and Value Spine so that scope drift, weak traceability and over-claimed AI levels are visible before release decisions.

#### Acceptance Criteria

```gherkin
Given an approved Framing version exists
When Control Mirror evaluates design artifacts
Then each artifact is assessed against Outcome, baseline, scope, constraints, AI level and risk profile

Given an implementation artifact lacks Story-ID or requirement source
When Build Conformance runs
Then it is flagged as Untraced Artifact and treated as release risk

Given requested AI level is Level 2 or Level 3
When required evidence is missing
Then Control Mirror recommends downgrade, pause, controls or exception approval
```

### Story 1.5: Test Evidence and Value Spine Coverage

**Traceability:** CM-06.1, CM-06.2, CM-08.2

As an AQA, I want test evidence mapped to Outcome, Epic and Story so that release readiness is based on value coverage instead of only technical execution.

#### Acceptance Criteria

```gherkin
Given test evidence exists
When Control Mirror parses it
Then each evidence item is mapped to test id, Story-ID, Epic, Outcome, test level, result and evidence source

Given Stories exist in the Value Spine
When coverage is calculated
Then the dashboard distinguishes no test, test definition only, implemented tests, passing tests, failing tests and manual verification only

Given a Value Spine link is broken
When I open coverage detail
Then the missing link is highlighted
And untraced implementation artifacts are shown outside the Value Spine
```

### Story 1.6: Human Review, Guardrails and Control Report

**Traceability:** CM-07.1, CM-07.2, CM-09.1, CM-09.2, CM-10.1

As a mandate holder, I want critical conformance gaps turned into auditable Human Review items and a Control Mirror report so that proceed, pause, downgrade or release recommendations are evidence-based.

#### Acceptance Criteria

```gherkin
Given Control Mirror detects a critical conformance gap
When the gap requires a human decision
Then a Human Review item is persisted or linked with decision format and affected Outcome/Epic/Story

Given conformance checks have run
When I generate a Control Mirror report
Then it includes active project, approved Framing version, snapshot id, requested AI level, achieved AI level, evidence summaries, open Human Review items and recommended next control step

Given requested AI level is Level 2 or Level 3
When commercial guardrails are checked
Then missing baseline, Value Spine, risk ledger, mandate, AIDA/AQA capacity, test evidence or governance funding evidence is flagged
```

## Out Of Sprint For MVP

- Real-time file watching
- Full VS Code extension
- Automated release approval
- AI acceptance of residual risk
- Deep parsing of every CI/CD format
- Full remote repository connector
