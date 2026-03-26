# Framing Scoped Value Spine Patch Pack

Detta patch-pack innehåller patch stories för att:

* isolera en öppnad Framing från andra Framing och demo-data
* göra Value Spine tydlig som hierarki inom vald Framing
* göra Epic navigation och editing tydlig i rätt kontext
* säkerställa att endast barnobjekt till vald Framing visas i normal native arbetsvy

**Rekommenderad körordning:**

1. M1-PATCH-024 — Isolate opened Framing from other Framing contexts
2. M1-PATCH-025 — Show Framing-scoped Value Spine as hierarchical tree
3. M1-PATCH-026 — Navigate to and edit Epic in Framing context
4. M1-PATCH-027 — Restrict child-object visibility to current Framing in native mode

---

# M1-PATCH-024

## Title

Isolate opened Framing from other Framing contexts

## Story Type

UX / Workspace Isolation Patch

## Value Intent

Ensure a user working inside one specific Framing can understand and trust the context, without unrelated data from other Framing instances or demo-seeded examples appearing in the same working view.

## Summary

Refine Framing workspace behavior so opening a specific Framing establishes a strict working context where visible data, related objects and default navigation remain scoped to that Framing rather than leaking across cases.

## Acceptance Criteria

* opening a specific Framing establishes a current Framing context
* Framing header clearly identifies the active Framing
* active Framing context is maintained across normal navigation within that workspace
* unrelated Outcomes from other Framing contexts are not shown in the opened Framing workspace
* unrelated Epics from other Framing contexts are not shown in the opened Framing workspace
* unrelated Stories from other Framing contexts are not shown in the opened Framing workspace
* unrelated Tests from other Framing contexts are not shown in the opened Framing workspace
* demo-seeded Framing content is not shown inside a clean native Framing workspace unless intentionally opened by user action
* relation panels, linked object panels and sidebars respect current Framing scope
* current Framing context remains valid under current tenant or org scope
* existing demo exploration flows continue to work when intentionally entered outside the clean native Framing context

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* a user can open one specific Framing and trust that workspace context
* no unrelated governed objects appear by default in that Framing workspace
* demo data no longer leaks into native clean Framing work unintentionally
* scoped navigation remains understandable and stable
* existing demo flows are preserved intentionally outside the scoped native path

## Scope In

* Framing workspace scoping
* current Framing context handling
* scoped query behavior for related governed objects
* sidebar and related-panel scope isolation
* Framing header context clarity

## Scope Out

* Value Spine tree rendering
* Epic editing behavior
* approval workflows
* staffing readiness
* imported lineage-specific views

## Constraints

* patch must not change underlying AAS governance rules
* patch must not remove demo support globally
* patch must not require M3 governance features to function
* patch must establish scope through current Framing context rather than through hidden fallback rules
* patch must remain compatible with later imported-object views and M3 overlays

## Required Evidence

* screenshot of opened Framing with clear context header
* screenshot showing no unrelated demo or other Framing objects in workspace
* example of scoped related-object panel
* e2e demo of opening one Framing and staying within its context

---

# M1-PATCH-025

## Title

Show Framing-scoped Value Spine as hierarchical tree

## Story Type

UI Feature Patch

## Value Intent

Make the full Value Spine understandable inside a given Framing so users can see how Outcome, Epics, Stories and Tests relate to each other within that case.

## Summary

Introduce a Framing-scoped Value Spine view that presents the current Framing hierarchy as a structured tree or equivalent hierarchical view: Framing → Epic(s) → Story(s) → Test(s).

## Acceptance Criteria

* opened Framing shows a Value Spine section
* Value Spine section reflects only the current Framing context
* Value Spine presents hierarchy in understandable parent-child form
* hierarchy includes at least:

  * current Framing or Outcome
  * linked Epics
  * linked Stories under each Epic
  * linked Tests under each Story where available
* empty branches are shown as empty states rather than filled with unrelated demo data
* user can expand or inspect Epic level within the Framing hierarchy
* user can expand or inspect Story level within the Framing hierarchy
* hierarchy remains understandable even when some child levels are empty
* hierarchy does not show unrelated objects from other Framing contexts
* Value Spine remains operational and supports navigation, not just decorative visualization

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can see the current Framing's Value Spine as a clear hierarchy
* parent-child relationships are understandable from the UI
* empty states support continued native authoring
* hierarchy is scoped to the active Framing and free from demo leakage
* Value Spine view improves navigation rather than duplicating unrelated data

## Scope In

* Value Spine hierarchical rendering
* Framing-scoped Epic grouping
* Story grouping under Epic
* Test grouping under Story
* empty states within the hierarchy
* navigation hooks from hierarchy nodes

## Scope Out

* advanced graph analytics
* imported lineage graphing
* approval state graph overlays
* cross-Framing comparison views

## Constraints

* hierarchy must remain scoped to the active Framing
* hierarchy must remain readable and operational
* hierarchy must not silently include global fallback data
* UI may use tree, accordion or equivalent hierarchical pattern, but user understanding must match parent-child structure
* patch must remain compatible with later M3 governance overlays

## Required Evidence

* screenshot of Framing-scoped Value Spine hierarchy
* screenshot of empty-state branch in hierarchy
* screenshot showing Epic, Story and Test nesting
* short demo of navigating through hierarchy within one Framing

---

# M1-PATCH-026

## Title

Navigate to and edit Epic in Framing context

## Story Type

Feature Patch

## Value Intent

Allow users to open and edit an Epic as part of a specific Framing so the Epic layer becomes a clear and usable part of the Value Spine rather than an implicit or hidden structure.

## Summary

Refine Epic navigation and editing so a user can move from a Framing-scoped Value Spine into the correct Epic context, edit the Epic and return to the same Framing without losing hierarchy understanding.

## Acceptance Criteria

* user can open an Epic from the current Framing Value Spine
* opened Epic clearly shows which Framing it belongs to
* Epic workspace or Epic detail clearly shows parent Framing or Outcome context
* user can edit Epic title
* user can edit Epic value intent
* user can edit Epic summary or description
* Epic workspace shows Stories that belong to that Epic within current Framing
* Epic workspace does not show Stories from unrelated Epics or other Framing contexts in normal native mode
* user can return from Epic view to the same Framing context
* Epic changes are persisted
* Epic changes create activity events
* Epic navigation and editing work without requiring import flow

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* Epic becomes a first-class editable layer in the Framing-scoped flow
* users can understand where the Epic belongs in the Value Spine
* Epic editing no longer feels detached from the current Framing
* Story relationships are visible from Epic context
* navigation back to Framing remains stable and understandable

## Scope In

* Epic navigation from Framing hierarchy
* Epic context header or breadcrumb
* Epic edit behavior
* Epic-scoped Story list
* return navigation to parent Framing
* activity events for Epic updates

## Scope Out

* imported Epic promotion behavior
* authority matrix
* approval records
* staffing readiness
* advanced Epic analytics

## Constraints

* Epic navigation must preserve current Framing context
* Epic editing must not show unrelated Story data in clean native mode
* Epic must remain clearly linked to its parent Framing or Outcome
* patch must not depend on M3 governance features
* patch must remain compatible with later imported-object support

## Required Evidence

* screenshot of Epic opened from Framing hierarchy
* screenshot of Epic context header showing parent Framing
* screenshot of Epic edit form with linked Stories
* activity log example for Epic update
* short demo of Framing → Epic → Framing navigation

---

# M1-PATCH-027

## Title

Restrict child-object visibility to current Framing in native mode

## Story Type

Workspace / Data Visibility Patch

## Value Intent

Ensure users only see child objects that actually belong to the currently opened Framing, so native work can proceed without confusion and Value Spine trust is preserved.

## Summary

Refine child-object visibility rules so Epics, Stories and Tests shown in native working views belong only to the currently opened Framing and its children, unless a user intentionally leaves that context.

## Acceptance Criteria

* Epics shown in current native Framing view belong only to the current Framing
* Stories shown in current native Framing view belong only to Epics under the current Framing
* Tests shown in current native Framing view belong only to Stories under the current Framing
* child-object pickers respect current Framing scope in native mode
* linked-object lists respect current Framing scope in native mode
* side panels and related-item trays respect current Framing scope in native mode
* if current Framing has no child objects at a given level, the UI shows an empty state rather than unrelated data
* user can still intentionally navigate away to other Framing or demo contexts through explicit action outside the current native scope
* scoped child visibility remains consistent across Framing view, Epic view and Story view
* no hidden demo fallback data is shown in clean native path

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* users see only child objects that belong to the active Framing in native mode
* empty states appear instead of unrelated fallback data
* Value Spine trust is preserved across Framing, Epic and Story navigation
* scoped visibility remains stable and understandable
* explicit cross-context navigation remains possible without contaminating the native working path

## Scope In

* child-object visibility rules
* scoped pickers and linked-object lists
* scoped side-panel behavior
* empty-state behavior for missing child objects
* consistency across Framing, Epic and Story views

## Scope Out

* imported lineage overlays
* M3 approval overlays
* cross-Framing portfolio views
* advanced analytics

## Constraints

* native mode must prioritize strict current-Framing scope
* child visibility must not rely on hidden global fallback data
* explicit cross-context navigation must remain possible, but not automatic
* patch must remain compatible with later M2 imported object and M3 governance support

## Required Evidence

* screenshot showing only current Framing children in native mode
* screenshot of empty child state instead of demo fallback
* screenshot of scoped picker or related-object list
* e2e demo of stable child visibility across Framing → Epic → Story navigation
