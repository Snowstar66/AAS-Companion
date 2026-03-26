# Workspace Clean Mode and Operating Model Patch Pack

Detta patch-pack omsätter följande produktregler till konkreta patch stories:

## Produktregel 1

Allt arbete sker i ett workspace.

## Produktregel 2

Varje workspace har exakt ett aktivt Framing-case.

## Produktregel 3

All operativ data är workspace-isolerad som default.

## Produktregel 4

Demo är en separat, tydligt märkt workspace-typ.

## Produktregel 5

Human Review ska vara en åtgärdslista, inte en tolkningslabyrint.

## Produktregel 6

Draft-objekt ska vara lätta att radera. Governade objekt ska arkiveras.

Patch-packet fokuserar på att göra verktyget begripligt och användbart i vardagen innan vidare governance-lager läggs på.

**Rekommenderad körordning:**

1. M1-PATCH-028 — Make Home a workspace selector and return point
2. M1-PATCH-029 — Enforce one active Framing per workspace
3. M1-PATCH-030 — Enforce workspace-isolated operational data by default
4. M1-PATCH-031 — Replace seeded terminology and show demo only by explicit choice
5. M2-PATCH-013 — Rename Intake to Import across user-facing surfaces
6. M2-PATCH-014 — Make Human Review an action list for approval readiness
7. M1-PATCH-032 — Simplify draft delete and archive discoverability in workspace context

---

# M1-PATCH-028

## Title

Make Home a workspace selector and return point

## Story Type

UX / Navigation Patch

## Value Intent

Make Home the clear starting point for choosing or returning to the current workspace, rather than a mixed operational dashboard with cross-case noise.

## Summary

Redesign Home so it primarily helps the user choose, resume or create a workspace, with simple high-level status per workspace and without leaking operational data across cases.

## Acceptance Criteria

* Home acts as the primary workspace selector
* Home allows user to return to the most recent workspace
* Home allows user to open another workspace explicitly
* Home allows user to create a new workspace
* Home does not show mixed operational lists from multiple workspaces by default
* Home can show lightweight workspace-level status indicators such as:

  * In progress
  * Framing draft
  * Design in progress
  * Not ready for build
  * Awaiting review
  * Archived
* Home does not show cross-workspace Value Spine content by default
* Home does not show cross-workspace tollgate details by default
* Home does not show cross-workspace story lists by default
* Home remains understandable for first-time and returning users

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can understand Home as the place to choose or resume work
* Home no longer behaves like a mixed cross-case dashboard
* workspace selection and return path are clear
* workspace-level status is readable and useful
* Home supports the product model where work happens inside workspaces

## Scope In

* Home information architecture
* workspace selection UI
* resume current workspace behavior
* create workspace entry point
* lightweight workspace status rendering

## Scope Out

* workspace internals
* Value Spine rendering inside Home
* approval workflows
* portfolio analytics
* admin reporting

## Constraints

* Home must not become a mixed operational dashboard again
* Home must not show unrelated case details by default
* Home must remain compatible with demo and non-demo workspace types
* patch must reinforce workspace-first product model

## Required Evidence

* screenshot of redesigned Home
* screenshot of workspace list with statuses
* short demo of resume current workspace flow
* short demo of create new workspace flow

---

# M1-PATCH-029

## Title

Enforce one active Framing per workspace

## Story Type

Domain / Workflow Patch

## Value Intent

Make each workspace understandable as one controlled business case by ensuring there is exactly one active Framing per workspace at a time.

## Summary

Refine workspace behavior so each workspace owns exactly one active Framing case, and user flows consistently treat that Framing as the governing context for Value Spine, review and progression.

## Acceptance Criteria

* each workspace has exactly one active Framing at a time
* current active Framing is clearly shown inside the workspace
* creating a new workspace also establishes its Framing context
* opening a workspace opens or routes into its active Framing context
* Value Spine inside a workspace is tied to that workspace's active Framing
* stories and tests inside a workspace are tied to that workspace's active Framing
* tollgates inside a workspace are tied to that workspace's active Framing
* human review inside a workspace is tied to that workspace's active Framing where applicable
* users cannot accidentally work across multiple active Framings inside the same workspace
* if archival or replacement of Framing is later supported, active Framing state remains explicit and singular

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* workspace has a clear and singular active Framing identity
* users can understand the business case context of the workspace
* operational flows align around the active Framing
* ambiguity about which Framing is current is removed
* later governance layers can rely on stable Framing context per workspace

## Scope In

* active Framing model per workspace
* workspace routing into Framing context
* current Framing identification in UI
* alignment of workspace flows to active Framing

## Scope Out

* multi-Framing portfolio behavior within one workspace
* archival UI for Framing replacement
* M3 authority behaviors
* advanced reporting

## Constraints

* workspace must not allow ambiguous active Framing state
* patch must preserve clean user understanding of one business case per workspace
* patch must remain compatible with later archive/replace semantics
* patch must remain consistent with workspace isolation rules

## Required Evidence

* screenshot showing workspace with active Framing identified
* short demo of opening workspace into active Framing
* example showing Value Spine aligned to active Framing

---

# M1-PATCH-030

## Title

Enforce workspace-isolated operational data by default

## Story Type

Workspace / Data Isolation Patch

## Value Intent

Protect user trust and reduce confusion by ensuring all operational data is isolated to the current workspace unless the user explicitly changes context.

## Summary

Make workspace isolation the default rule for operational data so histories, tollgates, user stories, Value Spines, blockers, review queues and other working data stay within the current workspace.

## Acceptance Criteria

* operational data inside a workspace is scoped to that workspace by default
* history lists inside a workspace show only events relevant to that workspace
* tollgate views inside a workspace show only the current workspace context
* Value Spine views inside a workspace show only the current workspace context
* Epic, Story and Test lists inside a workspace show only objects belonging to that workspace
* blockers and readiness inside a workspace reflect only the current workspace
* review queues inside a workspace reflect only the current workspace
* side panels, linked-object lists and pickers respect current workspace scope
* user can intentionally leave current workspace by explicit navigation action
* cross-workspace data does not appear through hidden fallback behavior

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* workspace trust is preserved through strict default isolation
* users no longer see operational contamination from other workspaces
* side panels and related views remain scoped and understandable
* cross-workspace navigation becomes explicit instead of accidental
* tool behavior aligns with watertight workspace separation

## Scope In

* workspace scope enforcement for operational data
* scoped queries for lists and panels
* picker and linked-object scope enforcement
* explicit context-switch handling

## Scope Out

* global admin views
* cross-workspace portfolio analytics
* imported lineage federation
* external reporting

## Constraints

* workspace isolation must be default behavior
* operational views must not rely on global fallback data
* explicit cross-workspace navigation may exist, but never as background leakage
* patch must remain compatible with demo workspace type and later M3 overlays

## Required Evidence

* screenshot showing isolated workspace history
* screenshot showing isolated Value Spine
* screenshot showing scoped review queue or tollgate view
* e2e demo of stable workspace isolation

---

# M1-PATCH-031

## Title

Replace seeded terminology and show demo only by explicit choice

## Story Type

Language / UX Patch

## Value Intent

Make the tool easier to understand by removing internal terminology from normal user flows and ensuring demo content appears only when explicitly chosen.

## Summary

Remove user-facing seeded terminology, replace it with clearer demo language where relevant, and ensure demo data only appears when the user explicitly opens a demo workspace or demo mode.

## Acceptance Criteria

* user-facing term seeded is removed from normal UI
* new real workspaces and cases do not show seeded labels
* demo content is shown only after explicit user choice
* demo workspace type is clearly labeled as Demo
* non-demo workspaces do not display demo labels or demo-origin terms
* if origin is shown for real work, it uses meaningful user language only where needed
* normal workspaces use status labels such as:

  * In progress
  * Framing draft
  * Design in progress
  * Not ready for build
  * Awaiting review
  * Archived
* demo content is never shown implicitly in newly created workspaces
* demo and non-demo workspaces are clearly distinguishable when user chooses between them

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* seeded terminology no longer confuses users
* new workspaces feel clean and real by default
* demo becomes an explicit and clearly marked workspace type
* status language is more useful than technical origin labels in normal work
* no demo leakage remains in non-demo workspace path

## Scope In

* user-facing terminology updates
* demo labeling
* status label updates for normal workspaces
* explicit demo entry behavior

## Scope Out

* internal field renaming where not required for user-facing clarity
* analytics terminology migration
* advanced localization work
* demo content design itself

## Constraints

* patch must remove seeded from user-facing surfaces
* patch must not show demo content unless explicitly chosen by user
* status labels for normal workspaces must remain operationally meaningful
* patch must remain consistent with workspace isolation model

## Required Evidence

* screenshot showing demo workspace labeling
* screenshot showing normal workspace status labels
* screenshot proving seeded terminology removed from UI
* short demo showing demo appears only after explicit selection

---

# M2-PATCH-013

## Title

Rename Intake to Import across user-facing surfaces

## Story Type

Language / Navigation Patch

## Value Intent

Use clearer language so users immediately understand that this area is for importing external material into the workspace.

## Summary

Rename Intake to Import in user-facing navigation, views and labels so the function is easier to understand and aligns with expected user language.

## Acceptance Criteria

* user-facing label Intake is replaced with Import
* navigation uses Import instead of Intake
* view titles use Import instead of Intake
* action labels use Import terminology where relevant
* related explanatory text uses Import terminology where relevant
* rename remains understandable in story and artifact import flows
* rename does not change underlying promotion or review semantics

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users encounter Import instead of Intake in normal UI
* rename improves clarity of the feature's purpose
* navigation remains coherent after rename
* underlying M2 behavior remains unchanged

## Scope In

* user-facing terminology update from Intake to Import
* navigation label updates
* page title updates
* action text updates

## Scope Out

* backend service renaming
* data model renaming where unnecessary
* analytics refactoring
* import behavior changes beyond wording

## Constraints

* rename must be consistent across user-facing surfaces
* rename must not imply broader behavior than existing import feature supports
* patch must remain compatible with Human Review and promotion terminology

## Required Evidence

* screenshot of navigation showing Import
* screenshot of Import workspace title
* example of import action text in UI

---

# M2-PATCH-014

## Title

Make Human Review an action list for approval readiness

## Story Type

Review / Workflow Patch

## Value Intent

Help users understand exactly what must be updated or completed before they can approve imported material, instead of forcing them to interpret fragmented clues.

## Summary

Refine Human Review so it behaves like a task-oriented action list for the current workspace and imported artifact, showing what must be corrected, completed or confirmed before approval readiness is reached.

## Acceptance Criteria

* Human Review clearly shows the current workspace being reviewed
* Human Review clearly shows the current imported artifact or candidate object being reviewed
* Human Review presents unresolved work as an action list rather than scattered fragments
* action list includes issue types such as:

  * missing field
  * low confidence field
  * unmapped section
  * human-only decision
  * blocking issue
* each action list item explains what the user needs to do
* each action list item provides a clear next action where applicable, such as:

  * complete
  * confirm
  * correct
  * mark not relevant
* Human Review shows progress through remaining unresolved items
* Human Review remains scoped to current workspace and current artifact context
* user does not need to navigate across unrelated screens to understand what remains before approval
* Human Review remains compatible with later promotion and governance steps

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e

## Definition of Done

* Human Review becomes an action-oriented correction flow
* users can understand what remains before approval readiness
* workspace and artifact context are clearly visible during review
* review no longer feels like a fragmented interpretation maze
* action-list model supports later promotion and governance flows

## Scope In

* Human Review information design
* action-list rendering of review issues
* current workspace and artifact context display
* progress indicator for unresolved review items
* action wording improvements

## Scope Out

* final approval chain logic
* M3 authority assignments
* import parsing changes
* bulk review analytics

## Constraints

* Human Review must remain scoped to current workspace and artifact
* action list must tell user what to update or confirm
* review flow must not hide original source or candidate context
* patch must remain compatible with existing correction and promotion model

## Required Evidence

* screenshot of Human Review action list
* screenshot showing current workspace in review UI
* screenshot showing unresolved item count or progress
* short demo of resolving review items toward approval readiness

---

# M1-PATCH-032

## Title

Simplify draft delete and archive discoverability in workspace context

## Story Type

Workflow / Deletion UX Patch

## Value Intent

Make it easy to remove draft mistakes and archive governed work in the correct way, without forcing users to guess whether deletion is possible or where the action lives.

## Summary

Refine delete and archive actions so they are visible and understandable inside workspace context, with easier hard delete for eligible draft objects and clear archive actions for governed objects.

## Acceptance Criteria

* delete or archive action is discoverable from relevant object views where applicable
* eligible draft objects can be hard deleted through visible UI action
* governed objects can be archived through visible UI action
* delete and archive actions clearly differentiate draft removal from governed archive
* delete and archive actions show context before confirmation
* hard delete eligibility for draft objects is not so restrictive that normal early cleanup becomes frustrating
* users can understand why hard delete is blocked when it is not allowed
* users can understand when archive should be used instead of hard delete
* delete or archive actions remain scoped to current workspace context
* successful delete or archive creates activity event

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e smoke

## Definition of Done

* users can find removal actions in normal workspace flow
* early draft cleanup is practical and understandable
* governed work is archived rather than silently hard deleted
* blocked hard delete cases are understandable
* removal behavior aligns with product rule for draft delete and governed archive

## Scope In

* delete/archive action placement in object views
* clearer hard delete eligibility handling for drafts
* confirmation UX for delete and archive
* removal action wording improvements
* activity events for user-facing removal actions

## Scope Out

* restore flow redesign
* retention policy redesign
* bulk deletion across workspaces
* external compliance exports

## Constraints

* eligible draft objects must be easy to remove in normal work
* governed objects must default to archive rather than hard delete
* removal actions must remain scoped to workspace context
* blocked delete cases must explain why the action is unavailable
* patch must remain compatible with existing removal policy and archive semantics

## Required Evidence

* screenshot showing delete action on eligible draft object
* screenshot showing archive action on governed object
* screenshot of blocked hard delete explanation
* short demo of deleting draft object and archiving governed object within workspace
