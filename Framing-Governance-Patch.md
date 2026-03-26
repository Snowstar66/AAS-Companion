# Framing and Governance Clarity Patch Pack

Detta patch-pack täcker två behov:

1. **Projekt och Framing**

   * ett projekt ska ha exakt en aktiv Framing
   * ny Framing för nytt business case ska i normalfallet betyda nytt projekt
   * inne i ett projekt ska användaren i första hand kunna redigera eller ersätta Framing, inte skapa parallella aktiva Framings

2. **Governance-sidan**

   * tydligare och mer yteffektiv layout
   * fortsatt tydlig separation mellan kund och leverantör
   * roller och agenter ska listas snarare än visas som fullt öppna edit-formulär
   * stöd för profilbild/foto där det finns
   * tydliga ikoner tills foto finns, med olika visuella markörer för människa och AI-agent

Patcharna utgår från att produkten följer modellen:

**Home → välj projekt → arbeta inne i projektet**

med en aktiv Framing per projekt och med Governance som en sektion inne i projektet.

**Rekommenderad körordning:**

1. M1-PATCH-050 — Enforce one active Framing per project and replace create-new-Framing flow
2. M3-PATCH-009 — Make Governance a role list view grouped by customer and supplier
3. M3-PATCH-010 — Replace always-open edit fields with progressive role detail editing
4. M3-PATCH-011 — Support role avatars, human placeholders and AI agent icons

---

# M1-PATCH-050

## Title

Enforce one active Framing per project and replace create-new-Framing flow

## Story Type

Domain / Workflow Patch

## Value Intent

Keep project context understandable by ensuring each project has one active Framing and by steering users toward editing or replacing the current Framing rather than creating parallel active Framings.

## Summary

Refine project behavior so each project has exactly one active Framing, and replace confusing create-new-Framing actions inside the project with clearer edit or replace Framing actions.

## Acceptance Criteria

* each project has exactly one active Framing at a time
* active Framing is clearly identified inside the project
* project navigation routes users into the current active Framing context
* user can edit the active Framing inside the project
* if supported, user can replace the active Framing through an explicit replace flow
* replace flow makes it clear whether current Framing will be archived, superseded or updated
* normal project UI does not encourage creating multiple parallel active Framings
* action labels inside project favor:

  * Edit Framing
  * Replace Framing
  * Archive Framing, where applicable
* action label Create new Framing is not used as normal in-project action for the active business case
* new business case creation is steered toward Create project rather than parallel Framing creation inside an existing project
* project remains understandable as one business case with one active Framing

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* each project has one clear active Framing
* users no longer perceive multiple active Framings as normal within one project
* in-project Framing actions are clearer and less confusing
* new business cases are naturally steered toward new project creation
* project context remains stable and understandable

## Scope In

* active Framing rule per project
* in-project Framing action redesign
* edit Framing flow
* replace Framing flow where supported
* clearer action wording for Framing lifecycle

## Scope Out

* full Framing version history redesign
* multi-case portfolio handling inside one project
* M3 authority redesign
* archive restore redesign beyond what is needed for replace clarity

## Constraints

* project must retain exactly one active Framing at a time
* patch must not reintroduce competing top-level contexts
* replace flow must remain explicit and understandable
* patch must remain compatible with project isolation and later governance overlays

## Required Evidence

* screenshot showing project with one active Framing
* screenshot showing Edit Framing or Replace Framing action
* short demo of editing current Framing
* short demo of replace flow if implemented

---

# M3-PATCH-009

## Title

Make Governance a role list view grouped by customer and supplier

## Story Type

UI / Governance Patch

## Value Intent

Make Governance easier to scan and use by presenting roles in a compact list structure while preserving the important separation between customer-side and supplier-side responsibility.

## Summary

Redesign the Governance page into a list-based, space-efficient role view grouped by customer and supplier, so users can understand role coverage, assignments and gaps without facing many open edit forms at once.

## Acceptance Criteria

* Governance page presents roles in a list-based layout rather than many fully open edit sections by default
* Governance page remains clearly separated into:

  * Customer
  * Supplier
* human roles and agent roles are shown in appropriate grouped lists
* each listed row provides enough summary information to understand the role, including where relevant:

  * role name
  * assigned person or agent
  * current status
  * missing or filled state
  * key mandate summary
* list layout is more space-efficient than fully open edit forms
* page remains understandable at a glance
* customer and supplier separation remains explicit and visible
* Governance still supports later review, approval and readiness interpretation
* list layout remains compatible with human roles and AI agents in the same governance section

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* Governance page is easier to scan and use
* customer and supplier separation remains clear
* roles can be understood without expanding every item
* layout is significantly more space-efficient than the current always-open model
* page remains compatible with later M3 governance flows

## Scope In

* Governance list layout
* customer and supplier grouping
* compact role row design
* summary information model in list rows

## Scope Out

* deep approval workflow redesign
* staffing recommendation engine
* cross-project governance analytics
* external directory integrations

## Constraints

* customer and supplier separation must remain explicit
* compact layout must not hide critical governance meaning
* governance page must remain operational, not decorative
* patch must remain compatible with role editing and avatar/icon support

## Required Evidence

* screenshot of Governance list grouped by customer and supplier
* screenshot showing compact role rows
* short demo of scanning governance page without opening every role

---

# M3-PATCH-010

## Title

Replace always-open edit fields with progressive role detail editing

## Story Type

UX / Governance Editing Patch

## Value Intent

Reduce clutter and cognitive load by letting users inspect and edit governance roles progressively instead of exposing all edit fields at once.

## Summary

Refine Governance editing so each role is shown as a compact row or card by default, with detail editing available on expand, inline reveal, panel or drawer when needed.

## Acceptance Criteria

* governance roles are not shown with all edit fields open by default
* each role can be opened for editing through explicit user action
* supported progressive detail patterns may include:

  * expand inline
  * side panel
  * drawer
  * detail section
* default list state remains compact and readable
* user can still edit role details when needed
* user can clearly see which role is currently being edited
* editing one role does not force all other roles open
* list remains usable with many roles
* customer and supplier grouping remains intact while editing
* role editing remains compatible with human roles and agent roles

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* Governance page is less cluttered by default
* users can focus on one role at a time when editing
* page remains understandable with many roles present
* editing behavior supports space efficiency and clarity
* progressive editing does not break governance data integrity

## Scope In

* progressive editing pattern for governance roles
* compact default row or card state
* active-edit state visibility
* grouped-list compatibility during editing

## Scope Out

* governance role schema redesign
* M3 approval workflow redesign
* external directory integration
* bulk editing across roles

## Constraints

* default governance state must remain compact
* editability must remain easy to access
* progressive editing must not hide critical context such as customer vs supplier grouping
* patch must remain compatible with avatar/icon support and later readiness views

## Required Evidence

* screenshot of compact default Governance page
* screenshot of one role expanded or opened for editing
* short demo of editing one role without opening all others

---

# M3-PATCH-011

## Title

Support role avatars, human placeholders and AI agent icons

## Story Type

UI / Identity Patch

## Value Intent

Make governance roles easier to understand visually by distinguishing humans from AI agents and by supporting real photos where available.

## Summary

Add support for profile photos on governance roles where available, and use clear placeholder visuals when photos are missing: a human-oriented placeholder for human roles and a distinct AI-oriented icon for agents and agent roles.

## Acceptance Criteria

* governance role rows can display a photo or avatar area
* if a human role has a photo, the photo is shown
* if a human role has no photo, a clear human placeholder icon is shown
* if an AI agent or agent role has no custom image, a distinct AI-oriented icon is shown
* human and AI visual markers are easy to distinguish at a glance
* avatar or icon display works in compact list rows and detail editing views
* avatar or icon support remains compatible with customer and supplier grouping
* role identification remains understandable even when no custom photos exist
* visual identity support does not require all users to upload photos before Governance becomes usable

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* governance rows can visually distinguish humans and AI agents
* photos are supported where available
* placeholders are useful and understandable where photos are missing
* page readability improves through visual identity cues
* avatar/icon support works in both compact and edit states

## Scope In

* avatar slot support for governance rows
* photo display where available
* human placeholder icon
* AI agent placeholder icon
* compatibility with compact list layout and detail editing

## Scope Out

* image moderation workflow
* external profile sync
* avatar cropping tool
* advanced theme customization

## Constraints

* placeholder design must clearly distinguish human from AI agent roles
* support for missing images must be graceful and usable
* patch must remain compatible with grouped customer/supplier governance lists
* avatar/icon display must not create layout instability in compact views

## Required Evidence

* screenshot showing human role with placeholder icon
* screenshot showing AI agent role with AI icon
* screenshot showing role with uploaded or configured photo
* short demo of Governance page with mixed human and AI visuals
