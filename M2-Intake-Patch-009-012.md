# M2 Intake Review Patch Pack

Detta patch-pack innehåller patch stories för att göra intake-arbetet användbart i praktiken när en story eller annan artefakt har lästs in.

Målet är att användaren ska kunna:

* läsa hela den importerade källstoryn i verktyget
* se den tolkade kandidatversionen strukturerat
* se en sammanhållen fellista över unmapped, low-confidence, missing och human-only frågor
* korrigera och confirm:a innan promotion

**Rekommenderad körordning:**

1. M2-PATCH-009 — Show full imported source artifact in intake workspace
2. M2-PATCH-010 — Show structured candidate view side-by-side with source
3. M2-PATCH-011 — Introduce correction queue for unmapped, low-confidence and missing fields
4. M2-PATCH-012 — Allow human correction and confirmation before promotion

---

# M2-PATCH-009

## Title

Show full imported source artifact in intake workspace

## Story Type

UI / Review Patch

## Value Intent

Allow users to read the complete imported artifact in one place so human review can happen against the actual source, not only against fragmented extracted sections.

## Summary

Add a full-source reading view in intake workspace so imported story files can be read as complete artifacts from start to finish during review.

## Acceptance Criteria

* an imported story or artifact can be opened in intake workspace
* intake workspace shows the full source content of the imported artifact
* full source is readable from top to bottom in one continuous view
* source view preserves meaningful structure from the source where possible, including headings and section order
* source view is available during intake review before promotion
* source view remains available while reviewing extracted or mapped content
* source view does not require leaving intake workspace to inspect the full artifact
* source view is scoped to the currently opened imported artifact
* source view does not mix content from other imported artifacts
* source view works for imported story markdown in current M2 scope

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* a user can read the complete imported story in the tool
* intake review no longer depends on scattered fragments only
* source readability is sufficient for human interpretation work
* full source view remains stable while other intake panels are used
* current imported artifact context remains clear and trustworthy

## Scope In

* full source panel or view in intake workspace
* source rendering for imported markdown story files
* current imported artifact context handling
* source readability improvements for review use

## Scope Out

* inline source editing
* PDF OCR improvements
* advanced diffing
* promotion behavior
* authority and approval logic

## Constraints

* source view must represent the currently imported artifact only
* source view must not silently collapse relevant source sections
* source readability must be prioritized over decorative formatting
* patch must remain compatible with later correction and promotion steps

## Required Evidence

* screenshot of full source view in intake workspace
* screenshot showing source structure preserved
* short demo of reading an entire imported story in the tool

---

# M2-PATCH-010

## Title

Show structured candidate view side-by-side with source

## Story Type

UI / Interpretation Patch

## Value Intent

Allow users to compare the imported source artifact with the system's interpreted candidate object so mapping quality can be reviewed and understood.

## Summary

Add a structured candidate view side-by-side with full source so users can inspect how the imported artifact has been interpreted into Story or other governed candidate fields.

## Acceptance Criteria

* intake workspace can show full source and structured candidate view side-by-side or in a clearly linked dual-view pattern
* candidate view shows interpreted fields relevant to the current imported object
* candidate story view can show fields such as:

  * Title
  * Story Type
  * Value Intent
  * Summary
  * Acceptance Criteria
  * AI Usage Scope
  * Test Definition
  * Definition of Done
* candidate view clearly indicates fields that are missing or uncertain where applicable
* candidate view remains linked to the currently opened source artifact
* user can inspect source and candidate without losing context
* side-by-side review works for imported story markdown in current M2 scope
* candidate view does not silently hide unmapped source material

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* a user can compare source and interpreted candidate in one review flow
* mapped fields are understandable and inspectable
* candidate structure is readable enough for human correction work
* source and candidate stay aligned to the same imported artifact context
* intake interpretation becomes reviewable instead of opaque

## Scope In

* structured candidate panel or view
* side-by-side layout or equivalent linked layout
* field rendering for interpreted candidate data
* missing/uncertain field indicators in candidate view

## Scope Out

* correction editing
* bulk candidate merging
* promotion actions
* authority overlays
* advanced lineage graphing

## Constraints

* candidate view must remain scoped to the same artifact as the source view
* side-by-side review must remain understandable on supported screen sizes
* candidate view must not pretend certainty where interpretation is incomplete
* patch must remain compatible with later correction and promotion flow

## Required Evidence

* screenshot of side-by-side source and candidate view
* screenshot of candidate Story field rendering
* example showing missing or uncertain field indicator
* short demo of reviewing candidate against full source

---

# M2-PATCH-011

## Title

Introduce correction queue for unmapped, low-confidence and missing fields

## Story Type

Review / Correction Patch

## Value Intent

Allow users to work through intake issues systematically instead of hunting for fragmented problems across multiple views.

## Summary

Introduce a correction queue in intake workspace that lists unresolved mapping and completeness issues for the currently opened imported artifact, including unmapped source sections, low-confidence interpretations, missing required fields and human-only questions.

## Acceptance Criteria

* intake workspace shows a correction queue for the currently opened imported artifact
* correction queue lists unresolved items grouped by issue type where applicable
* supported issue types include:

  * unmapped source sections
  * low-confidence interpretations
  * missing required fields
  * human-only decisions
  * blocked issues where applicable
* each correction item shows enough context to understand the issue
* each correction item can be opened from the queue into relevant review context
* correction queue remains scoped to the current imported artifact
* correction queue can show resolved vs unresolved state
* correction queue makes it possible to work through issues one by one
* correction queue does not require user to search across unrelated screens to find the problem source

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e

## Definition of Done

* users can see a coherent list of intake issues for a given imported artifact
* issue categories are understandable and operationally useful
* correction work no longer depends on scattered fragmented cues
* resolved and unresolved issues are distinguishable
* queue-based review improves human review flow before promotion

## Scope In

* correction queue UI
* issue grouping and state model
* navigation hooks from queue to relevant source or candidate context
* resolved/unresolved tracking

## Scope Out

* automatic issue resolution
* authority approval logic
* bulk artifact correction across many artifacts
* promotion action redesign
* advanced analytics

## Constraints

* correction queue must remain scoped to the current imported artifact
* issue categories must reflect actual intake uncertainty rather than decorative labels
* queue items must remain explainable to a human reviewer
* patch must remain compatible with later human correction and promotion flow

## Required Evidence

* screenshot of correction queue
* screenshot showing grouped issue types
* screenshot showing resolved vs unresolved states
* short demo of opening an issue from the queue into review context

---

# M2-PATCH-012

## Title

Allow human correction and confirmation before promotion

## Story Type

Feature Patch

## Value Intent

Allow a human reviewer to correct intake interpretation issues and confirm the candidate object before promotion, so promotion reflects reviewed meaning rather than raw parser output.

## Summary

Add human correction and confirmation actions in intake workspace so users can resolve mapping issues, correct candidate fields and explicitly confirm readiness for promotion.

## Acceptance Criteria

* user can correct interpreted candidate fields in intake workspace before promotion
* user can resolve unmapped source sections by mapping or classifying them appropriately
* user can resolve low-confidence fields through human confirmation or correction
* user can mark human-only questions as pending or resolved where applicable
* corrected candidate remains linked to the original imported artifact
* correction actions are persisted
* correction actions create activity events
* user can see whether correction queue items are resolved after correction
* user can explicitly confirm candidate readiness for promotion when remaining issues permit it
* promotion remains a separate step after correction and confirmation
* correction flow does not hide the original source artifact

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* users can correct imported candidate data before promotion
* correction flow is traceable and understandable
* source, candidate and issue queue remain coherent during correction
* reviewed candidate can be explicitly confirmed when ready
* promotion is improved by human reconciliation rather than parser-only interpretation

## Scope In

* candidate field correction actions
* issue resolution actions
* correction persistence
* activity events for correction and confirmation
* readiness-to-promote confirmation state

## Scope Out

* full multi-approver governance
* tollgate approval logic
* imported artifact re-parsing automation
* bulk correction workflows
* external synchronization

## Constraints

* correction must preserve source traceability
* correction must not silently overwrite original source representation
* promotion must remain separate from correction
* human-only decisions must remain explicit
* patch must remain compatible with existing M2 promotion model and later M3 governance overlays

## Required Evidence

* screenshot of corrected candidate field in intake workspace
* screenshot of resolved correction queue item
* screenshot of explicit confirmation before promotion
* activity log example for correction and confirmation
* short demo of correcting and confirming an imported story before promotion
