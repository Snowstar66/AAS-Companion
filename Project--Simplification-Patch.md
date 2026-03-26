# Project Context Simplification Patch Pack

Detta patch-pack förenklar produktmodellen enligt följande princip:

* **Home** används endast för att välja, skapa eller återgå till ett projekt.
* **Projekt** är den enda aktiva operativa kontexten i verktyget.
* **Framing** är en sektion i projektet, inte en separat överordnad kontext.
* Allt arbete genomsyras vattentätt av valt projekt.
* Ordet **workspace** tvättas bort från användargränssnittet till förmån för **projekt**.

Målet är att användaren aldrig ska behöva fundera på om hen är i Home, Workspace eller Framing som olika konkurrerande kontexter. Det ska kännas som:

**Home → välj projekt → arbeta inne i projektet**

med sektioner som:

* Framing
* Value Spine
* Import
* Human Review
* Activity
* senare Governance / Approvals

**Rekommenderad körordning:**

1. M1-PATCH-033 — Replace workspace terminology with project across user-facing UI
2. M1-PATCH-034 — Make Home a project selector only
3. M1-PATCH-035 — Make project the single active operating context
4. M1-PATCH-036 — Show active project prominently in header and navigation
5. M1-PATCH-037 — Make Framing a section inside project, not a competing context

---

# M1-PATCH-033

## Title

Replace workspace terminology with project across user-facing UI

## Story Type

Language / UX Patch

## Value Intent

Reduce conceptual confusion by using one clear user-facing term for the active case container: project.

## Summary

Replace user-facing workspace terminology with project across navigation, headers, labels and explanatory text so the tool presents a simpler operating model.

## Acceptance Criteria

* user-facing term workspace is replaced with project across normal UI surfaces
* Home uses project language instead of workspace language
* navigation uses project language instead of workspace language where relevant
* headers use project language instead of workspace language where relevant
* explanatory text uses project language instead of workspace language where relevant
* rename remains understandable in clean work, demo work and import/review contexts
* underlying product behavior is not changed solely by terminology replacement
* user-facing language remains consistent after replacement

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users encounter project as the primary container concept in the UI
* workspace terminology no longer causes confusion in normal usage
* terminology is consistent across major navigation and page surfaces
* rename prepares the ground for a simpler Home → Project operating model

## Scope In

* terminology updates in user-facing UI
* navigation labels
* headers and breadcrumbs
* explanatory helper text

## Scope Out

* backend renaming
* database renaming where unnecessary
* analytics refactoring
* domain-model refactoring beyond what is needed for user clarity

## Constraints

* patch must keep terminology consistent across user-facing surfaces
* patch must not introduce mixed workspace/project language in the same path
* patch must remain compatible with demo and import flows
* patch must prioritize user understanding over internal naming conventions

## Required Evidence

* screenshot showing project terminology in navigation
* screenshot showing project terminology in header
* screenshot proving workspace terminology removed from normal UI

---

# M1-PATCH-034

## Title

Make Home a project selector only

## Story Type

UX / Navigation Patch

## Value Intent

Make Home immediately understandable as the place where users choose, create or resume a project, rather than a second operational context.

## Summary

Simplify Home so it acts only as a project selector and return point, with lightweight project statuses but no mixed operational workviews.

## Acceptance Criteria

* Home shows a list of projects
* Home allows user to create a new project
* Home allows user to return to most recent project
* Home allows user to open a demo project only by explicit choice
* Home does not behave like an operational work area
* Home does not show mixed project histories by default
* Home does not show mixed project Value Spine data by default
* Home does not show mixed project tollgate details by default
* Home may show lightweight project status such as:

  * In progress
  * Framing draft
  * Design in progress
  * Not ready for build
  * Awaiting review
  * Archived
* Home is understandable as a project selection screen for first-time and returning users

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* Home is clearly understood as the place to choose or resume a project
* Home no longer competes with project internals as another work context
* project selection is simple and stable
* Home aligns with the simplified operating model

## Scope In

* Home information architecture
* project list UI
* create project entry point
* resume recent project behavior
* lightweight project status rendering

## Scope Out

* project internals
* Value Spine rendering in Home
* Human Review logic
* M3 governance logic
* portfolio analytics

## Constraints

* Home must not become a mixed operational dashboard again
* Home must not expose unrelated project details by default
* Home must support explicit demo project selection without leaking demo data elsewhere
* patch must reinforce Home as selection layer only

## Required Evidence

* screenshot of Home as project selector
* screenshot of Home with project statuses
* short demo of create project and open project flow
* short demo of explicit demo project selection

---

# M1-PATCH-035

## Title

Make project the single active operating context

## Story Type

Domain / Navigation Patch

## Value Intent

Ensure users experience one active and watertight context while working, so the entire tool feels centered on the chosen project.

## Summary

Refine routing, scoping and context behavior so once a project is opened it becomes the single active operating context for Framing, Value Spine, Import, Human Review, Activity and later governance layers.

## Acceptance Criteria

* opening a project establishes it as the single active operating context
* project context persists across normal navigation inside the tool
* Framing inside the project respects active project context
* Value Spine inside the project respects active project context
* Import inside the project respects active project context
* Human Review inside the project respects active project context
* Activity inside the project respects active project context
* tollgates and readiness inside the project respect active project context
* user can only leave the current project by explicit navigation action
* unrelated project data does not appear through hidden fallback behavior
* active project context remains stable during normal navigation

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e

## Definition of Done

* users can trust that the chosen project is the current context everywhere
* no competing top-level context is perceived inside normal work
* project context remains stable across major sections
* tool behavior aligns with watertight project isolation

## Scope In

* active project context handling
* routing and navigation context persistence
* scoped section behavior for project internals
* explicit project exit/switch behavior

## Scope Out

* cross-project reporting
* admin views
* imported lineage federation
* M3 approval rules

## Constraints

* project must be the single active operating context during normal work
* project context must not be replaced by hidden section-level fallback context
* patch must remain compatible with demo project type and later governance overlays
* explicit project switching may exist, but never as background leakage

## Required Evidence

* screenshot showing stable active project across sections
* short demo of moving through Framing, Value Spine and Import within one project
* e2e demo proving no accidental cross-project context leakage

---

# M1-PATCH-036

## Title

Show active project prominently in header and navigation

## Story Type

Navigation / Context Visibility Patch

## Value Intent

Help users always understand what project they are currently working in, reducing confusion caused by headers that prioritize incidental or technical details.

## Summary

Update header and primary navigation so the active project is the most prominent context indicator, with optional secondary context such as Framing, Epic or Story shown beneath or beside it.

## Acceptance Criteria

* header prominently shows the active project name
* active project is more prominent than incidental object titles or patch labels
* header may show secondary context such as:

  * current Framing
  * current Epic
  * current Story
* navigation also reflects the current active project context
* active project remains visible while moving between major project sections
* header does not prioritize latest patch or unrelated internal label over active project
* context visibility remains understandable on supported screen sizes
* active project display works in both normal and demo project flows

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can immediately see which project is active
* active project visibility reduces context confusion
* header reflects the correct product priority order for context
* navigation and header remain coherent across sections

## Scope In

* header information priority
* active project display
* secondary context display
* primary navigation project context visibility

## Scope Out

* advanced breadcrumb history
* project analytics in header
* cross-project comparison
* M3-specific approval indicators in header

## Constraints

* active project must be the most prominent context indicator in normal work
* secondary context must not overshadow active project
* patch must remain compatible with project-scoped navigation model
* header must not display irrelevant patch labels as primary user context

## Required Evidence

* screenshot of header with active project
* screenshot of header with project plus secondary context
* short demo of header staying correct while navigating sections

---

# M1-PATCH-037

## Title

Make Framing a section inside project, not a competing context

## Story Type

UX / Information Architecture Patch

## Value Intent

Reduce conceptual overload by ensuring Framing feels like one section of work inside a project, rather than a separate top-level container competing with Home and project context.

## Summary

Refine the information architecture so Framing is presented as a section within the active project, alongside sections such as Value Spine, Import, Human Review and Activity.

## Acceptance Criteria

* Framing is presented as a project section, not as a competing top-level context
* project navigation includes Framing as one section among other project sections
* opening Framing keeps the user visibly inside the active project
* Framing header or content shows it belongs to the active project
* Value Spine is accessible as another section within the same active project
* Import is accessible as another section within the same active project
* Human Review is accessible as another section within the same active project
* Activity is accessible as another section within the same active project
* users do not need to mentally switch container models when moving between project sections
* Framing remains the business-case definition area of the project without replacing project context itself

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* Framing is understood as part of the active project
* users no longer perceive Framing as a competing top-level container
* moving between Framing and other sections feels like moving within one project
* the simplified Home → Project → section model is reinforced

## Scope In

* project section navigation structure
* Framing section presentation
* section-level context cues
* movement between project sections

## Scope Out

* Framing content redesign
* M3 approval information architecture
* portfolio navigation
* advanced section personalization

## Constraints

* Framing must remain clearly tied to active project
* Framing must not appear as a separate global container in normal use
* patch must remain compatible with project isolation and later governance overlays
* simplified model must prioritize user understanding over historical UI structure

## Required Evidence

* screenshot of project navigation showing Framing as section
* screenshot of Framing page with active project context visible
* short demo of moving from Framing to Value Spine to Import inside one project
