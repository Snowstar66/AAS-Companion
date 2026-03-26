# Value Spine Delete and Epic Update Patch Pack

Detta patch-pack innehåller patch stories för att:

* kunna uppdatera native Epic som förstklassigt objekt
* kunna radera draft-objekt i Value Spine
* kunna arkivera governade objekt med aggregerad påverkan
* kunna återställa arkiverade objekt vid behov

**Rekommenderad körordning:**

1. M1-PATCH-019 — Edit native Epic in Epic Workspace
2. M1-PATCH-020 — Define Value Spine removal policy and aggregate impact preview
3. M1-PATCH-021 — Delete native draft Value Spine objects
4. M1-PATCH-022 — Archive governed Value Spine objects with cascading child handling
5. M1-PATCH-023 — Restore archived Value Spine objects

---

# M1-PATCH-019

## Title

Edit native Epic in Epic Workspace

## Story Type

Feature Patch

## Value Intent

Allow teams to write and maintain the Epic layer explicitly so the tool can carry the full Value Spine natively: Outcome → Epic → Story → Test.

## Summary

Introduce a first-class Epic Workspace where users can open, edit and maintain native Epics linked to an Outcome, including title, value intent, summary and related Stories.

## Acceptance Criteria

* a native Epic can be opened in a dedicated Epic Workspace
* Epic Workspace shows the Epic within current Outcome and case context
* user can edit Epic title
* user can edit Epic value intent
* user can edit Epic summary or description
* user can view Stories linked to the Epic
* user can create Story from Epic context using the existing governed native flow
* Epic changes are persisted
* Epic changes create activity events
* Epic editing works in clean native workspace mode
* Epic editing does not require import flow
* Epic editing does not depend on M3 governance features

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* a user can create, open and edit a native Epic as a first-class governed object
* Epic can be used as the explicit layer between Outcome and Story
* Epic Workspace is understandable and usable in clean native flow
* Story creation from Epic remains possible and coherent
* Epic changes are traceable through activity events

## Scope In

* Epic Workspace
* Epic edit form
* Epic persistence updates
* Epic-to-Outcome context display
* linked Story list in Epic context
* activity events for Epic changes

## Scope Out

* imported Epic promotion logic
* authority assignments
* approval records
* staffing readiness
* advanced Epic analytics

## Constraints

* Epic editing must reuse the existing governed native model
* Epic editing must not create a separate workflow for clean cases
* Epic must remain explicitly linked to Outcome context
* Epic editing must not silently inject demo or imported data
* Epic editing must remain compatible with later M3 governance overlays

## Required Evidence

* screenshot of Epic Workspace
* screenshot of Epic edit form
* screenshot showing Epic linked to Outcome and Stories
* activity log example for Epic update
* short demo of editing native Epic in clean case

---

# M1-PATCH-020

## Title

Define Value Spine removal policy and aggregate impact preview

## Story Type

Governance / Domain Patch

## Value Intent

Ensure removal of Outcome, Epic, Story and Test objects happens in a controlled and explainable way that preserves AAS traceability and human accountability.

## Summary

Introduce a shared removal policy for Value Spine objects that distinguishes between draft deletion and governed archive/withdrawal, and provides aggregate impact preview before destructive actions are executed.

## Acceptance Criteria

* a shared removal policy exists for Value Spine object types:

  * Outcome
  * Epic
  * Story
  * Test
* removal policy distinguishes between:

  * hard delete for eligible draft objects
  * archive or withdraw for governed objects
* aggregate impact preview is available before removal actions execute
* impact preview can show affected child objects where applicable
* impact preview can show governance impact where applicable, including:

  * linked child objects
  * activity history presence
  * pending readiness or tollgate state
  * linked approvals or lineage where applicable
* removal policy is reusable across native governed objects
* blocked removal scenarios can be surfaced clearly
* removal actions are classified as reversible or irreversible
* activity events are defined for removal attempts and completed removal actions

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration

## Definition of Done

* removal behavior is defined consistently across Value Spine object types
* users can preview aggregate impact before destructive actions
* draft delete and governed archive semantics are clearly separated
* removal policy is reusable by later UI actions and governance overlays
* removal actions remain explainable and auditable

## Scope In

* shared removal policy model
* aggregate impact preview model
* reversible vs irreversible action classification
* removal-related activity event definitions
* blocking reason support for disallowed removal

## Scope Out

* concrete restore UX
* bulk cross-initiative operations
* permanent purge of archived data
* external retention integrations

## Constraints

* removal policy must preserve AAS traceability expectations
* governable objects with meaningful history must not default to hard delete
* aggregate impact must be visible before action execution
* policy must not depend on imported object support to function
* policy must remain compatible with later M2 and M3 governance behavior

## Required Evidence

* removal policy matrix
* example aggregate impact preview for Outcome
* example aggregate impact preview for Epic
* example blocked removal scenario
* activity event naming examples

---

# M1-PATCH-021

## Title

Delete native draft Value Spine objects

## Story Type

Feature Patch

## Value Intent

Allow users to clean up mistaken or abandoned draft work early, without carrying unnecessary clutter through Framing and Design.

## Summary

Enable hard delete for eligible native draft Outcome, Epic, Story and Test objects when they are still early-stage, lightly connected and not yet carrying meaningful governance state.

## Acceptance Criteria

* eligible native draft Outcome can be hard deleted
* eligible native draft Epic can be hard deleted
* eligible native draft Story can be hard deleted
* eligible native draft Test can be hard deleted
* delete action requires explicit user confirmation
* delete action shows aggregate impact preview before confirmation
* delete action is blocked when object is no longer eligible for hard delete
* blocked delete explains why hard delete is not allowed
* successful delete removes object from normal working views
* successful delete creates activity event
* delete action works within current case context
* delete behavior preserves parent-child consistency in Value Spine

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* users can remove draft mistakes cleanly
* hard delete is only available for eligible draft native objects
* blocked delete scenarios are understandable
* aggregate impact preview is shown before destructive action
* Value Spine consistency is maintained after delete

## Scope In

* delete action for eligible native draft objects
* eligibility checks for hard delete
* delete confirmation UI
* aggregate impact preview reuse
* delete activity events
* parent-child consistency handling

## Scope Out

* archive behavior for governed objects
* imported object deletion
* restore archived objects
* cross-case bulk deletion
* approval-aware removal logic beyond current eligibility rules

## Constraints

* hard delete must only be available for eligible draft native objects
* objects with meaningful governance state must not silently hard delete
* delete action must remain explicit and user-confirmed
* delete action must not leave orphaned Value Spine references
* delete behavior must remain compatible with later archive semantics

## Required Evidence

* screenshot of delete confirmation for draft object
* screenshot of blocked delete when object is ineligible
* demo of deleting draft Epic or Story
* activity log example for hard delete
* example showing Value Spine remains consistent after delete

---

# M1-PATCH-022

## Title

Archive governed Value Spine objects with cascading child handling

## Story Type

Governance Feature Patch

## Value Intent

Allow governed work to be withdrawn safely without destroying traceability, while making aggregate impact on child objects explicit and controllable.

## Summary

Introduce archive or withdraw actions for governed Outcome, Epic, Story and Test objects, including aggregate impact preview, cascading child handling and preserved auditability.

## Acceptance Criteria

* governed Outcome can be archived or withdrawn instead of hard deleted
* governed Epic can be archived or withdrawn instead of hard deleted
* governed Story can be archived or withdrawn instead of hard deleted
* governed Test can be archived or withdrawn instead of hard deleted
* archive action shows aggregate impact preview before confirmation
* impact preview shows affected child objects where applicable
* user can see whether action affects child objects transitively
* archive action can require a reason before completion
* archive action creates activity event
* archived objects are removed from normal active working views
* archived objects remain traceable in history or archive-aware views
* cascading child handling is explicit, not silent
* blocked archive scenarios can be surfaced when parent-child consistency would otherwise break
* archived status remains understandable in Value Spine context

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* governed objects can be safely withdrawn without destroying auditability
* aggregate child impact is shown before archive execution
* archived objects are no longer treated as active work
* archive behavior is understandable and consistent across Value Spine types
* users can distinguish archive from hard delete

## Scope In

* archive or withdraw actions for governed objects
* archive confirmation UI
* aggregate impact preview reuse
* optional reason capture
* archive status handling in active views
* activity events for archive flow
* explicit cascading child handling logic

## Scope Out

* permanent purge
* restore flow
* imported lineage-specific archive rules
* retention schedules
* external compliance export

## Constraints

* governed objects must not default to hard delete
* traceability and accountability must remain available after archive
* child impact must be explicit before confirmation
* archive behavior must not silently collapse Value Spine without user awareness
* archive semantics must remain compatible with later M2 and M3 governance overlays

## Required Evidence

* screenshot of archive confirmation with impact preview
* screenshot of archived object state or history visibility
* example requiring reason for archive
* demo of archiving governed Epic with linked Stories
* activity log example for archive action

---

# M1-PATCH-023

## Title

Restore archived Value Spine objects

## Story Type

Recovery / Workflow Patch

## Value Intent

Allow teams to recover archived work during Framing and Design when archive actions were premature or the case direction changes.

## Summary

Introduce restore behavior for archived Outcome, Epic, Story and Test objects so archived work can re-enter active governed flow in a controlled and traceable way.

## Acceptance Criteria

* archived Outcome can be restored when restore is allowed
* archived Epic can be restored when restore is allowed
* archived Story can be restored when restore is allowed
* archived Test can be restored when restore is allowed
* restore action shows object context before confirmation
* restore action creates activity event
* restored object returns to active working views
* restored object preserves previous traceability and history
* restore action is blocked when parent-child consistency would break
* blocked restore explains why restore is not allowed
* restore behavior is understandable across Value Spine object types

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* archived objects can be recovered in supported scenarios
* restore behavior preserves traceability and audit history
* blocked restore cases are understandable
* restored objects behave like active governed objects again
* recovery flow reduces risk of premature archive during Framing and Design

## Scope In

* restore action for archived objects
* restore confirmation UI
* restore eligibility checks
* restore activity events
* active-view reintegration
* traceability preservation on restore

## Scope Out

* permanent purge recovery
* cross-case mass restore
* imported lineage reconciliation
* approval replay
* advanced retention management

## Constraints

* restore must preserve history and accountability
* restore must not silently create inconsistent parent-child relationships
* blocked restore must be specific and understandable
* restore semantics must remain compatible with later M2 and M3 governance layers

## Required Evidence

* screenshot of restore action
* screenshot of blocked restore scenario
* demo of restoring archived Story or Epic
* activity log example for restore
* example showing restored object back in active view
