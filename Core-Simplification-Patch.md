# Core Simplification Patch Pack

Detta patch-pack innehåller fullständiga förenklingspatchar som reducerar komplexitet i verktyget utan att bryta AAS.

Målet är att:

* minska kognitiv belastning
* göra flödet begripligt
* ta bort redundans
* göra verktyget operativt

---

# M1-PATCH-S1

## Title

Collapse Outcome into Framing (UI-level)

## Story Type

UX / Information Architecture Patch

## Value Intent

Reduce structural complexity by removing redundant hierarchy levels and making Framing the single entry point for business definition.

## Summary

Remove Outcome as a separate navigation-level object in the UI and embed Outcome as a section inside Framing, since there is only one Outcome per project.

## Acceptance Criteria

* Outcome is no longer a separate menu item
* Framing contains a clearly defined Outcome section
* Outcome fields are editable within Framing
* navigation does not include a separate Outcome page
* Value Spine still links correctly from Framing → Epic → Story → Test
* users do not need to navigate between Framing and Outcome

## Definition of Done

* Framing contains all Outcome-related fields
* no duplicate Outcome UI remains
* navigation is simplified
* Value Spine remains intact

---

# M1-PATCH-S2

## Title

Remove duplicate descriptive fields across objects

## Story Type

Domain / Form Simplification Patch

## Value Intent

Reduce confusion and redundant input by ensuring each object has one primary descriptive field.

## Summary

Remove overlapping fields such as summary, description, and notes across Outcome, Epic and Story, and keep only one primary content field per level.

## Acceptance Criteria

* Outcome uses only outcomeStatement (and problemStatement)
* Epic uses only purpose
* Story uses only valueIntent
* duplicate descriptive fields are removed or merged
* forms do not present multiple fields with similar meaning

## Definition of Done

* users no longer need to decide between similar text fields
* forms are shorter and clearer
* no loss of essential information

---

# M2-PATCH-S3

## Title

Simplify correction queue to core resolution states

## Story Type

Review / Workflow Patch

## Value Intent

Make correction workflow actionable by reducing complexity of unresolved states.

## Summary

Replace complex unresolved categories with a small set of actionable states.

## Acceptance Criteria

* unresolved items are categorized as:

  * Needs action
  * Needs confirmation
  * Resolved
  * Discarded
* users can resolve items directly from list
* queue can be cleared systematically
* no long passive lists remain

## Definition of Done

* correction queue is actionable
* users can complete review without confusion
* unresolved items do not accumulate indefinitely

---

# M3-PATCH-S4

## Title

Simplify governance to three core validation dimensions

## Story Type

Governance / UX Patch

## Value Intent

Make governance understandable and actionable by reducing visible complexity.

## Summary

Reduce governance UI to three core checks:

* Roles assigned
* Separation valid
* Human oversight present

## Acceptance Criteria

* governance view shows only three primary indicators
* detailed data is available via expand
* validation results are clear (OK / Not OK)
* recommendations are shown when issues exist

## Definition of Done

* governance is readable at a glance
* users can act on issues directly
* complexity is hidden unless needed

---

# M1-PATCH-S5

## Title

Enforce strict project scope across all views

## Story Type

Data / Context Isolation Patch

## Value Intent

Ensure user trust by preventing cross-project data leakage.

## Summary

All data queries and views must be scoped to the active project.

## Acceptance Criteria

* all lists filter by active project
* no fallback to demo or global data
* empty states shown instead of unrelated data
* cross-project data only visible via explicit switch

## Definition of Done

* no cross-project leakage occurs
* users trust the context they are working in

---

# M1-PATCH-S6

## Title

Define single primary action per screen

## Story Type

UX / Interaction Patch

## Value Intent

Guide users clearly by ensuring each screen has one obvious next step.

## Summary

Each screen presents one primary call-to-action aligned with the workflow stage.

## Acceptance Criteria

* each page has one primary CTA
* CTA matches current workflow stage
* secondary actions are visually subordinate
* user always knows next step

## Definition of Done

* navigation feels guided
* user hesitation reduced
* workflow becomes linear and predictable

---

# Recommended Implementation Order

1. M1-PATCH-S5 (Project isolation)
2. M1-PATCH-S1 (Collapse Outcome)
3. M2-PATCH-S3 (Correction queue)
4. M3-PATCH-S4 (Governance simplification)
5. M1-PATCH-S2 (Field reduction)
6. M1-PATCH-S6 (Primary actions)

---

# Expected Outcome

* 2–3x clearer UX
* faster onboarding
* reduced confusion
* stronger alignment with AAS
* better integration with AI build workflows
