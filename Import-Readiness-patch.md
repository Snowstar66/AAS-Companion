# Import Readiness and Disposition Patch Pack

Detta patch-pack ligger i linje med AAS-processen och bygger vidare på tidigare Import/Human Review-patchar.

Syftet är att säkerställa att importerade stories och andra kandidater inte lämnas i ett oändligt osäkerhetsläge. I stället ska varje osäkerhet kunna få en tydlig disposition:

* **korrigerad**
* **bekräftad av människa**
* **markerad som ej relevant**
* **fortfarande blockerande**
* **kasserad / avvisad**

Detta gör Import användbart som ett steg mot AAS-governad progression, utan att verktyget påstår att AI själv har "förstått allt".

## AAS-rätt princip

Import ska inte ge automatiskt godkännande. Import ska hjälpa användaren att:

* förstå källmaterialet
* korrigera tolkningen
* bekräfta mänskliga beslut
* avgöra om kandidaten är

  * redo för promotion
  * inte redo
  * eller ska kasseras

## Produktregel

Långa listor av osäkerhet får inte bli ett permanent tillstånd.
Varje unresolved post ska kunna:

* lösas
* bekräftas
* avfärdas som irrelevant
* eller leda till att kandidaten kasseras

**Rekommenderad körordning:**

1. M2-PATCH-016 — Turn unresolved import issues into explicit disposition actions
2. M2-PATCH-017 — Add concise unresolved summary and completion progress in Import review
3. M2-PATCH-018 — Allow discard or reject imported story candidate
4. M2-PATCH-019 — Add explicit import readiness states after correction
5. M2-PATCH-020 — Gate promotion and tollgate progression based on import readiness and human confirmation

---

# M2-PATCH-016

## Title

Turn unresolved import issues into explicit disposition actions

## Story Type

Review / Correction Patch

## Value Intent

Ensure unresolved import issues can be actively worked off rather than remaining as passive uncertainty lists.

## Summary

Refine Import review so each unresolved item has an explicit disposition path, allowing the reviewer to resolve, confirm, dismiss as not relevant or keep it as blocking.

## Acceptance Criteria

* each unresolved import issue can be assigned a disposition action
* supported disposition actions include where relevant:

  * Correct
  * Confirm
  * Mark not relevant
  * Keep pending
  * Block
* low-confidence fields can be explicitly confirmed by a human
* unmapped sections can be explicitly mapped or marked not relevant
* missing required fields can be completed or remain blocking
* human-only decisions can be marked pending or resolved by human action
* each disposition action is persisted
* each disposition action creates activity history
* unresolved issues no longer exist only as passive labels without action path
* issue state remains scoped to current project and current imported artifact

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* unresolved issues can be actively processed one by one
* reviewers can choose meaningful next actions instead of just reading uncertainty
* action states are persisted and traceable
* unresolved issue handling becomes operational rather than descriptive only

## Scope In

* disposition actions for unresolved items
* unresolved state model refinement
* persistence of correction/confirmation actions
* activity history for issue resolution actions

## Scope Out

* promotion redesign
* tollgate approval chain
* import parsing redesign
* bulk correction across many artifacts

## Constraints

* unresolved issues must remain traceable to source and candidate context
* human-only decisions must remain explicit and cannot be auto-confirmed by AI
* disposition actions must not silently erase source uncertainty without visible trace
* patch must remain compatible with later readiness and gating behavior

## Required Evidence

* screenshot of unresolved item with available disposition actions
* screenshot of corrected vs confirmed vs not-relevant states
* activity log example for issue disposition
* short demo of working off unresolved items in Import review

---

# M2-PATCH-017

## Title

Add concise unresolved summary and completion progress in Import review

## Story Type

UX / Review Patch

## Value Intent

Reduce review overload by replacing long raw uncertainty lists with a concise action-oriented summary and visible completion progress.

## Summary

Refine Import review so unresolved issues are summarized clearly by category and completion progress, while still allowing drill-down into the actual remaining work when needed.

## Acceptance Criteria

* Import review shows a concise unresolved summary for the current artifact or candidate
* unresolved summary groups issues into meaningful categories such as:

  * missing required fields
  * low-confidence items
  * unmapped sections
  * human-only decisions
  * blocking issues
* Import review shows count of remaining unresolved items
* Import review shows resolved vs unresolved progress
* user can drill down into unresolved items when needed
* user is not forced to scan long unstructured uncertainty lists to understand current state
* summary remains scoped to current project and current imported artifact
* progress updates as items are resolved, confirmed, dismissed or discarded

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* unresolved state is easier to understand at a glance
* users can see how much work remains before a candidate is ready or must be discarded
* long raw uncertainty lists no longer dominate the review experience
* summary still allows drill-down into actual unresolved work when needed

## Scope In

* unresolved summary UI
* grouped issue counts
* resolved/unresolved progress indicator
* drill-down from summary to issue list

## Scope Out

* correction action redesign
* promotion redesign
* approval chain redesign
* cross-artifact dashboards

## Constraints

* summary must remain accurate to actual unresolved state
* grouped counts must remain scoped to current project and current artifact
* summary must not hide blocking issues or create false readiness
* patch must remain compatible with disposition actions and readiness states

## Required Evidence

* screenshot of concise unresolved summary
* screenshot of progress indicator in Import review
* short demo of progress changing as issues are resolved

---

# M2-PATCH-018

## Title

Allow discard or reject imported story candidate

## Story Type

Workflow / Disposition Patch

## Value Intent

Allow users to stop carrying low-value or unusable imported candidates by explicitly rejecting or discarding them instead of keeping them as endless unresolved work.

## Summary

Add an explicit discard or reject path for imported story candidates so a reviewer can decide that a candidate should not proceed further when it is not worth correcting or is not suitable for promotion.

## Acceptance Criteria

* reviewer can explicitly discard or reject an imported story candidate
* discard or reject action requires explicit user confirmation
* discard or reject action can require a reason where configured
* discarded or rejected candidate is clearly no longer treated as active correction work
* discarded or rejected candidate does not remain in active promotion-ready queues
* discard or reject action creates activity history
* source traceability remains available after discard or reject where appropriate
* discarded or rejected candidate can be distinguished from unresolved active candidates
* discard or reject remains scoped to current project and current imported artifact context

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* reviewers can intentionally stop work on unsuitable imported candidates
* unusable candidates no longer clutter active review queues indefinitely
* discard or reject remains traceable and understandable
* Import review can converge on a smaller set of meaningful candidates

## Scope In

* discard or reject action for imported story candidate
* confirmation flow
* optional reason capture
* status handling for discarded or rejected candidates
* activity history for discard or reject

## Scope Out

* restore discarded candidate flow
* bulk discard across many artifacts
* archive policy redesign
* promotion redesign

## Constraints

* discard or reject must remain explicit and traceable
* discard or reject must not delete source traceability silently
* discarded candidates must not continue to appear as active unresolved work
* patch must remain compatible with later readiness and gating logic

## Required Evidence

* screenshot of discard or reject action
* screenshot of discarded or rejected state
* activity log example for discarded candidate
* short demo of discarding a low-value imported story candidate

---

# M2-PATCH-019

## Title

Add explicit import readiness states after correction

## Story Type

Readiness / Governance Patch

## Value Intent

Give users a clear and trustworthy readiness signal after correction work, instead of leaving them to infer whether an imported candidate can move forward.

## Summary

Introduce explicit readiness states for imported candidates after correction and review so the system can show whether the candidate is not ready, ready for promotion, blocked or discarded.

## Acceptance Criteria

* imported candidate can show explicit readiness state after correction work
* supported readiness states include where relevant:

  * Not ready for promotion
  * Ready for promotion
  * Blocked by human decision
  * Discarded or rejected
* readiness state reflects unresolved blocking issues accurately
* readiness state reflects resolved and confirmed issues accurately
* readiness state updates when correction or confirmation work is completed
* readiness state is visible in Import and Human Review context where relevant
* readiness state remains scoped to current project and current imported candidate
* readiness state does not imply final tollgate approval by itself
* readiness state helps the user understand whether the candidate can move to next step

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* imported candidates have clear next-step readiness signals
* reviewers do not need to guess whether promotion is possible
* readiness states remain truthful and do not overclaim certainty
* readiness behavior supports later governed progression without replacing human approval

## Scope In

* readiness state model for imported candidates
* readiness calculation from correction/disposition outcomes
* readiness display in Import/Human Review
* state transitions after correction work

## Scope Out

* tollgate approval chain
* promotion redesign
* build execution tooling
* advanced confidence scoring redesign

## Constraints

* readiness state must not be confused with final human sign-off
* readiness must reflect actual unresolved or blocking state honestly
* discarded candidates must not appear promotion-ready
* patch must remain compatible with later promotion and tollgate gating

## Required Evidence

* screenshot of candidate marked Ready for promotion
* screenshot of candidate marked Not ready for promotion
* screenshot of discarded candidate readiness state
* short demo of readiness changing after correction

---

# M2-PATCH-020

## Title

Gate promotion and tollgate progression based on import readiness and human confirmation

## Story Type

Governance / Gating Patch

## Value Intent

Ensure imported content cannot progress merely because it was parsed, but only after correction, disposition and necessary human confirmation have reached an acceptable readiness state.

## Summary

Refine promotion and downstream progression so imported candidates can only move forward when readiness state and human confirmation are sufficient, while blocked or discarded candidates cannot create false green lights.

## Acceptance Criteria

* imported candidate cannot be promoted when readiness state is Not ready for promotion
* imported candidate cannot be promoted when blocking human-only decisions remain unresolved
* discarded or rejected candidates cannot be promoted
* imported candidate can be promoted only when readiness state is Ready for promotion
* promotion gating remains visible and explainable to the user
* downstream tollgate-related progression does not treat import parsing alone as sufficient readiness
* if imported content is promoted into governed objects, later tollgate views can still reflect remaining governed-object requirements separately
* gating messages explain what remains before progression is possible
* project scope remains preserved throughout gating behavior
* human confirmation remains visible where it is required for progression

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e

## Definition of Done

* imported content no longer gets implicit green light just because it exists in the system
* promotion and downstream progression reflect correction and human confirmation state
* blocked and discarded candidates are clearly prevented from moving forward
* users understand what still needs to happen before promotion or later tollgate assessment

## Scope In

* promotion gating based on import readiness
* visible gating messages in Import/Human Review
* compatibility with later governed-object tollgate behavior
* prevention of progression for discarded or blocked candidates

## Scope Out

* full tollgate UI redesign
* approval chain redesign
* build tool execution
* cross-project import analytics

## Constraints

* import readiness must not be treated as final approval
* gating must remain explainable and human-readable
* discarded candidates must be excluded from progression paths
* patch must remain compatible with later M3 governance and approval layers

## Required Evidence

* screenshot of blocked promotion due to unresolved import readiness
* screenshot of allowed promotion after correction and confirmation
* short demo of discarded candidate being excluded from progression
* short demo of gating message explaining what remains
