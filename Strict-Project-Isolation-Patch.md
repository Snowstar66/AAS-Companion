# Strict Project Isolation Patch Pack

Detta patch-pack skärper projektmodellen så att verktyget verkligen fungerar enligt principen:

**Open project → bara detta projekt → inget annat syns**

Patcharna svarar på följande behov:

* inget projekt ska vara aktivt förrän användaren explicit väljer Open project eller Create project
* Open project ska visa skapade projekt
* demo får inte visas implicit genom AAS demo organization eller annan fallback
* alla operativa menyer och listor ska vara strikt scoped till aktivt projekt
* användarsynlig numrering ska börja om per projekt
* projekt ska kunna tas bort eller arkiveras och då återgå till tomt Home

**Rekommenderad körordning:**

1. M1-PATCH-038 — Require explicit project selection before entering work
2. M1-PATCH-039 — Show only created projects in Open project
3. M1-PATCH-040 — Scope all operational menus to active project only
4. M1-PATCH-041 — Reset user-visible numbering per project
5. M1-PATCH-042 — Allow delete or archive project and return to empty Home
6. M1-PATCH-043 — Remove implicit demo organization fallback from normal startup

---

# M1-PATCH-038

## Title

Require explicit project selection before entering work

## Story Type

Navigation / Context Patch

## Value Intent

Ensure users enter the tool through an explicit project choice so no accidental or implicit project context is active during normal work.

## Summary

Refine startup and navigation so no project is active until the user explicitly chooses Open project, Create project or an explicit demo entry.

## Acceptance Criteria

* no normal project is active on startup until the user explicitly chooses one
* user can choose:

  * Open project
  * Create project
  * Open demo project
* tool does not enter a normal work context automatically on startup
* normal startup does not implicitly open AAS demo organization
* when no project has been selected, operational project sections are not shown as active working areas
* when a project is selected, it becomes the active project context
* explicit demo project selection remains possible without affecting normal startup behavior
* startup behavior is understandable for first-time and returning users

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e

## Definition of Done

* no accidental active project exists on normal startup
* users must explicitly choose how to enter work
* demo is not opened implicitly
* startup behavior supports a clean and trustworthy project model

## Scope In

* startup flow
* active project initialization rules
* explicit project-entry actions
* no-project-selected state handling

## Scope Out

* project list rendering details
* project deletion
* numbering logic
* M3 governance behavior

## Constraints

* tool must not create a hidden active project on startup
* explicit demo selection must remain possible but never implicit
* startup behavior must remain compatible with later project archive/delete flows

## Required Evidence

* screenshot of startup with explicit project choices
* short demo of startup without implicit active project
* short demo of explicit demo project selection

---

# M1-PATCH-039

## Title

Show only created projects in Open project

## Story Type

Home / Project Selection Patch

## Value Intent

Make Open project trustworthy by showing the user's created project list clearly, without mixing in hidden defaults or unrelated fallback contexts.

## Summary

Refine Open project so it shows created projects clearly, supports selecting one project explicitly, and does not inject unrelated demo or fallback project contexts.

## Acceptance Criteria

* Open project shows created projects
* each listed project is identifiable by name
* Open project does not automatically include demo as if it were a normal project unless explicitly modeled as demo project
* demo project appears only when intentionally available and clearly marked as Demo
* opening a project from the list makes that project active
* if no normal projects exist, Open project shows an empty state
* empty state supports:

  * Create project
  * Open demo project, if available as explicit choice
* Open project does not route user into unrelated project data before selection
* project selection remains understandable and simple

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can trust Open project as the list of available projects
* project selection is explicit and understandable
* unrelated fallback contexts no longer appear in project selection flow
* empty state remains clean when no projects exist

## Scope In

* Open project list behavior
* empty state for no projects
* project selection action
* demo project labeling in selection flow

## Scope Out

* project internals
* project deletion
* cross-project analytics
* import behavior
* M3 governance behavior

## Constraints

* Open project must list real created projects only, except for explicit demo project entry
* selection must not implicitly activate unrelated project context
* demo must remain clearly distinct from normal projects
* patch must remain compatible with later project archive/delete semantics

## Required Evidence

* screenshot of Open project list
* screenshot of empty Open project state
* screenshot of clearly labeled demo project entry if present
* short demo of selecting a created project

---

# M1-PATCH-040

## Title

Scope all operational menus to active project only

## Story Type

Workspace Isolation / Data Scope Patch

## Value Intent

Ensure users only see operational data that belongs to the currently active project, so menus and lists never mix data from other projects.

## Summary

Make all operational menus and internal views strictly depend on the active project so Framing, Outcome, Value Spine, Story, Test, Import, Human Review, Activity and tollgates show only current-project data.

## Acceptance Criteria

* Framing menu shows only current active project data
* Outcome menu shows only current active project data
* Value Spine view shows only current active project data
* Epic list shows only current active project data
* Story list shows only current active project data
* Test list shows only current active project data
* Import view shows only current active project data
* Human Review shows only current active project data
* Activity and history show only current active project data
* tollgates and blockers show only current active project data
* linked-object panels and pickers respect active project scope
* unrelated project data is not shown through hidden fallback behavior
* explicit project switch is required to see another project's operational data

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* active project scope is enforced across operational menus and views
* users no longer see other projects' Outcomes or Value Spine items in normal work
* scope trust is restored across the tool
* explicit project switching is the only path to another project's data

## Scope In

* active project query scoping
* list/menu scope enforcement
* scoped pickers and linked-object panels
* scoped history/tollgate/review behavior

## Scope Out

* global admin views
* cross-project portfolio analytics
* archive restore behavior
* demo content design

## Constraints

* all normal operational views must require active project scope
* hidden org-level or demo-level fallback must not populate current project menus
* explicit project switching may exist, but never implicit cross-project leakage
* patch must remain compatible with later imported-object and M3 overlays

## Required Evidence

* screenshot showing Outcome menu with only active project items
* screenshot showing isolated Value Spine
* screenshot showing isolated Human Review or Activity view
* e2e demo proving cross-project leakage is removed

---

# M1-PATCH-041

## Title

Reset user-visible numbering per project

## Story Type

Naming / Numbering Patch

## Value Intent

Make project-local work easier to understand by restarting user-visible numbering within each project instead of carrying numbering across unrelated projects.

## Summary

Refine user-visible numbering rules so Outcomes and other Value Spine objects can start from 01 inside a new project, independent of numbering used in previous projects.

## Acceptance Criteria

* first Outcome in a new project can use user-visible number 01
* user-visible numbering for Outcomes is project-specific
* if Epic numbering is shown, it can also be project-specific
* if Story numbering is shown, it can also be project-specific or inherit project-local scheme consistently
* numbering in one project is not affected by objects created in another project
* user-visible numbering remains stable within a project
* internal technical IDs may remain independent from user-visible numbering
* numbering behavior remains understandable in lists and detail views

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration

## Definition of Done

* new projects start with clean user-visible numbering
* numbering no longer confuses users by continuing across projects
* project-local numbering remains stable and understandable
* internal IDs remain decoupled from user-facing numbering where needed

## Scope In

* user-visible numbering rules per project
* numbering display updates in relevant views
* project-local sequence handling

## Scope Out

* technical primary key redesign
* historical renumbering across old data
* advanced numbering customization
* archive numbering policies

## Constraints

* numbering must be project-specific for user-facing clarity
* numbering must not break existing traceability expectations
* internal IDs may remain global if needed, but user-facing numbering must be local to project
* patch must remain compatible with import and M3 overlays

## Required Evidence

* screenshot of first Outcome in a new project labeled 01
* example showing two different projects each starting from 01
* short demo of numbering remaining local to project

---

# M1-PATCH-042

## Title

Allow delete or archive project and return to empty Home

## Story Type

Project Lifecycle Patch

## Value Intent

Allow users to remove or retire a project cleanly and return to an empty, trustworthy tool state when no project remains active.

## Summary

Introduce user-facing delete or archive behavior for projects so a project can be removed from active work and, when no other project remains active, the tool returns to an empty Home state.

## Acceptance Criteria

* project can be deleted or archived through explicit user action where allowed
* delete or archive action is discoverable from project context
* project removal action shows context before confirmation
* if project is deleted or archived and no other project is active, tool returns to Home
* if no normal projects remain, Home shows empty project state
* empty Home state does not open demo implicitly
* empty Home state supports:

  * Create project
  * Open project
  * Open demo project, if available explicitly
* removed or archived project no longer appears as active work
* project removal creates activity event
* action remains understandable to users

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e

## Definition of Done

* users can remove or retire a project cleanly
* tool can return to an empty Home state without implicit demo fallback
* project lifecycle becomes understandable and complete
* active project state is cleared correctly after removal

## Scope In

* project delete/archive action
* project removal confirmation
* post-removal navigation back to Home
* empty Home state after removal
* activity event for project removal

## Scope Out

* bulk project deletion
* restore archived project flow
* advanced retention policies
* external compliance exports

## Constraints

* project removal must not implicitly activate demo or another unrelated project
* empty Home must remain clean when no normal project exists
* patch must remain compatible with delete/archive semantics already used for lower-level objects
* project removal must remain explicit and user-confirmed

## Required Evidence

* screenshot of project delete/archive action
* screenshot of empty Home after removing last project
* short demo of deleting or archiving a project and returning to empty Home

---

# M1-PATCH-043

## Title

Remove implicit demo organization fallback from normal startup

## Story Type

Startup / Demo Isolation Patch

## Value Intent

Prevent confusion and loss of trust by ensuring demo organization data never appears in normal startup or normal project flows unless explicitly chosen.

## Summary

Remove implicit AAS demo organization fallback from normal startup and normal project navigation so demo data only appears through explicit demo project selection.

## Acceptance Criteria

* normal startup does not open AAS demo organization implicitly
* normal startup does not display demo organization data in project views without explicit selection
* normal project creation does not inherit demo organization data
* normal project opening does not inherit demo organization data
* if demo project exists, it is accessed only through explicit demo selection
* demo organization data does not appear in Outcome menus, Framing views, Value Spine views, Human Review or Activity unless demo is explicitly active
* explicit demo selection remains possible for intended demo usage
* demo and non-demo project flows remain clearly separated

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e

## Definition of Done

* demo organization fallback is removed from normal work
* users no longer see demo organization data unless explicitly chosen
* normal project trust is improved through clean startup and navigation
* demo remains usable only through explicit selection path

## Scope In

* startup fallback removal
* demo organization isolation in navigation and views
* explicit demo-entry preservation

## Scope Out

* demo content redesign
* project deletion behavior
* numbering behavior
* M3 governance behavior

## Constraints

* demo must never appear implicitly in normal work paths
* explicit demo entry must remain possible and clearly separate
* patch must remain compatible with Home project selection model
* patch must remove normal reliance on AAS demo organization as hidden default context

## Required Evidence

* screenshot of clean startup without demo organization
* screenshot of normal project view without demo fallback
* short demo of explicit demo project path remaining available
