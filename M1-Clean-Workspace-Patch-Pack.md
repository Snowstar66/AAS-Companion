# M1 Clean Workspace Patch Pack

Detta patch-pack innehåller tre sammanhängande patch stories som ska implementeras **före M3** för att säkerställa att webbappen stödjer ett helt rent native case utan demo-läckage, samt native skapande av Epic och Story utan att import krävs.

**Rekommenderad körordning:**

1. M1-PATCH-016 — Isolate clean workspace from demo-seeded data
2. M1-PATCH-017 — Create native Epic from Outcome Workspace
3. M1-PATCH-018 — Create native Story from Epic without import

---

# M1-PATCH-016

## Title

Isolate clean workspace from demo-seeded data

## Story Type

UX / Workspace Isolation Patch

## Value Intent

Ensure a newly created customer case opens in a completely clean governed workspace, so users can work with real case data without confusion from demo-seeded examples.

## Summary

Refine clean-case behavior so a newly created native case is shown in an isolated clean workspace where only case-relevant governed objects are visible, and demo-seeded data no longer appears in lists, side panels, relation pickers or fallback views.

## Acceptance Criteria

* a newly created clean native case opens in clean workspace mode
* clean workspace mode scopes visible data to the current case context
* demo-seeded Outcomes are not shown in the clean workspace context
* demo-seeded Epics are not shown in the clean workspace context
* demo-seeded Stories are not shown in the clean workspace context
* relation panels only show objects relevant to the current native case
* sidebars and linked-object panels do not show demo fallback data
* pickers for related governed objects do not surface demo-seeded objects in clean workspace mode
* if no Epics exist for the current case, the Epic area shows an empty state rather than demo content
* if no Stories exist for the current case, the Story area shows an empty state rather than demo content
* Execution Contract preview dependencies do not silently use demo-seeded fallback data
* recent activity views inside clean workspace only show activity relevant to the current case where applicable
* clean workspace mode does not break existing demo exploration flows
* clean workspace behavior works under current tenant/org context

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* a user can open a newly created clean case and see no unrelated demo-seeded governed objects
* empty states are shown where native objects have not yet been created
* clean workspace remains fully usable without imported data
* existing demo mode continues to work intentionally outside clean workspace mode
* no hidden fallback to demo data remains in the clean native path

## Scope In

* workspace scoping rules
* clean workspace mode behavior
* query/filter refinement for related governed objects
* empty state handling for missing Epics and Stories
* picker/list/panel isolation behavior
* activity scoping where applicable

## Scope Out

* imported artifact behavior
* authority matrix
* approval records
* staffing readiness
* new governance semantics

## Constraints

* patch must not change underlying AAS governance rules
* patch must not remove demo support from the application
* patch must not create a separate governed object model for clean cases
* clean workspace isolation must be achieved primarily through scope, filtering and empty-state behavior
* patch must not require M3 role or approval features to function
* patch must not force import as the only path for continuing work in a clean case

## Required Evidence

* screenshot of a newly created clean case with empty Epic/Story areas
* screenshot showing absence of demo-seeded objects in clean workspace
* example of empty state for Epics
* example of empty state for Stories
* e2e demo of clean workspace isolation

---

# M1-PATCH-017

## Title

Create native Epic from Outcome Workspace

## Story Type

Feature Patch

## Value Intent

Allow teams to continue Framing naturally by creating native Epics directly from the current Outcome without needing imported artifacts.

## Summary

Add or clarify a native Epic creation path in Outcome Workspace so a clean customer case can move from Outcome definition into Epic creation in the same governed native flow.

## Acceptance Criteria

* Outcome Workspace provides a visible Create Epic action for the current case
* Create Epic action is available in clean native workspace mode
* creating an Epic from Outcome Workspace creates a native Epic linked to the current Outcome
* created Epic is linked to the current case context
* new Epic opens in a usable draft state
* Epic list for the current Outcome shows only Epics relevant to the current case in clean workspace mode
* when no Epics exist, Outcome Workspace shows an empty state with Create Epic action
* creating an Epic produces an activity event
* created Epic can be reopened from the Outcome context
* creating a native Epic does not require import flow
* creating a native Epic does not auto-create Stories
* creating a native Epic does not auto-pass any tollgate

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* a user can create the first Epic directly from a clean Outcome
* created Epic is clearly part of the current governed native case
* Epic creation works without demo-seeded dependencies
* Epic empty state and Epic list behavior are understandable
* Framing can continue naturally after Outcome creation

## Scope In

* Create Epic CTA in Outcome Workspace
* native Epic creation flow
* Epic-to-Outcome linking
* Epic draft initialization
* Epic empty state behavior
* activity event on Epic creation

## Scope Out

* story breakdown logic
* imported promotion logic
* authority assignments
* tollgate approvals
* advanced Epic analytics

## Constraints

* Epic creation must reuse the governed native object model already used by the application
* Epic creation must not depend on imported artifacts
* Epic creation must not introduce a separate Epic workflow for clean cases
* Epic creation must not silently attach demo data
* Epic creation must preserve clean workspace isolation behavior

## Required Evidence

* screenshot of Create Epic action in Outcome Workspace
* screenshot of empty Epic state with Create Epic CTA
* screenshot of newly created Epic linked to current Outcome
* activity log example for Epic creation
* short demo of creating first Epic in clean case

---

# M1-PATCH-018

## Title

Create native Story from Epic without import

## Story Type

Feature Patch

## Value Intent

Allow teams to move from Framing into Design by creating native Stories from an Epic directly, without requiring imported artifacts.

## Summary

Add or clarify a native Story creation path from Epic context so teams can break down an Epic into governed draft Stories in the normal Design flow.

## Acceptance Criteria

* Epic context provides a visible Create Story action
* Create Story action is available in clean native workspace mode
* creating a Story from Epic creates a native Story linked to the current Epic
* created Story is linked to the current Outcome through the existing governed structure
* created Story is linked to the current case context
* new Story opens in Story Workspace in draft state
* Story can be edited using the existing governed Story flow
* when no Stories exist for the current Epic, the Story area shows an empty state with Create Story action
* creating a Story produces an activity event
* Story creation works without using import flow
* Story creation does not silently attach demo acceptance criteria, demo tests or almost-ready demo content
* Story creation does not auto-pass readiness or build-handoff checks

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* a user can create the first native Story from a native Epic without import
* created Story opens in draft state and can be completed through existing Story workflow
* Story creation works in a clean case without demo leakage
* Design can start natively from Epic breakdown
* Story empty state and create flow are understandable to users

## Scope In

* Create Story CTA in Epic context
* native Story creation flow
* Story-to-Epic linking
* Story draft initialization
* Story empty state behavior
* redirect into Story Workspace
* activity event on Story creation

## Scope Out

* imported artifact interpretation
* imported promotion
* build tool execution
* authority approval logic
* advanced story generation assistance

## Constraints

* Story creation must reuse the existing governed Story model
* Story creation must not depend on M2 import flow
* Story creation must not introduce a separate native-only Story workspace
* Story creation must not silently inject demo content into Story fields
* Story creation must preserve clean workspace isolation behavior
* Story creation must remain compatible with later M3 governance overlays

## Required Evidence

* screenshot of Create Story action from Epic context
* screenshot of empty Story state with Create Story CTA
* screenshot of newly created Story in draft state
* activity log example for Story creation
* short demo of Epic-to-Story breakdown in a clean native case
