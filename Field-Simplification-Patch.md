# Field Simplification and Patch Pack

Detta patch-pack förenklar objektmodellen för Outcome, Epic och Story utan att bryta AAS.

Målet är att:

* minska duplicerade fält som betyder nästan samma sak
* skilja tydligare mellan styrande innehåll och governance-/systemmetadata
* låta Outcome bära Framing-tyngden
* låta Epic bära värdeområde och scope
* låta Story bära testbar leveransenhet
* flytta review/approval/readiness/blockers till separata governance-lager där det går

## Förenklingsprinciper

### Princip 1

Ett primärt innehållsfält per nivå.

### Princip 2

Governance-fält ska inte dupliceras som fria redigerbara kärnfält i varje objekt.

### Princip 3

AI-nivå, risk och ägarskap beslutas högt upp där det är möjligt och ärvs ned där det är rimligt.

### Princip 4

Systemstatus, blockers och readiness ska i första hand vara härledd eller separat governance-data, inte manuellt dubbelinmatad objektsdata.

---

# Reducerad målmodell

## Outcome — Must Have

* key
* title
* problemStatement
* outcomeStatement
* baselineDefinition
* baselineSource
* timeframe
* valueOwnerId
* riskProfile
* aiAccelerationLevel
* status

## Outcome — Should Have

* notes (endast om separat behov finns)
* sourceType/origin (metadata)
* createdAt / updatedAt (metadata)

## Outcome — Can Be Derived / Separate Governance

* readiness
* blockers
* tollgate state
* approvals
* review state
* activity timeline

---

## Epic — Must Have

* key
* outcomeId
* title
* purpose
* scopeBoundary
* riskNote
* status

## Epic — Should Have

* notes (bara om ni verkligen behöver det)
* origin metadata

## Epic — Can Be Derived / Separate Governance

* readiness
* blockers
* approvals
* review state
* full risk profile
* full AI governance record

---

## Story — Must Have

* storyId
* outcomeId
* epicId
* title
* storyType
* valueIntent
* acceptanceCriteria
* aiAccelerationLevel
* aiUsageScope
* testDefinition
* definitionOfDone
* status

## Story — Should Have

* notes (endast om det inte duplicerar valueIntent)
* origin metadata

## Story — Can Be Derived / Separate Governance

* readiness
* blockers
* approvals
* review state
* full risk profile
* separate owner model, om governance redan hanteras separat

---

# Fält som bör ifrågasättas eller slås ihop

## Kandidater att ta bort eller slå ihop

* summary + description + notes på samma nivå
* full riskProfile på både Epic och Story
* flera olika statusfält som uttrycker nästan samma sak
* approval som vanliga objektfält i Outcome, Epic och Story
* duplicerat owner-fält på nivåer där ägarskap redan styrs via Outcome eller governance records
* separata fria AI-beslut på Outcome, Epic och Story när det i praktiken är ett styrbeslut från Framing som ärvs ned

## Rekommenderad sammanslagning

* Outcome:

  * behåll problemStatement + outcomeStatement
  * undvik extra summary om inte verkligt behov finns
* Epic:

  * behåll purpose som huvudtext
  * undvik både summary, description och notes samtidigt
* Story:

  * behåll valueIntent som huvudtext
  * undvik extra summary om den inte tillför unik information

---

# Patch stories

**Rekommenderad körordning:**

1. M1-PATCH-044 — Simplify Outcome field model
2. M1-PATCH-045 — Simplify Epic field model
3. M1-PATCH-046 — Simplify Story field model
4. M1-PATCH-047 — Move governance-like fields out of core object forms
5. M1-PATCH-048 — Inherit AI and risk context downward where appropriate
6. M1-PATCH-049 — Simplify forms and labels to match reduced field model

---

# M1-PATCH-044

## Title

Simplify Outcome field model

## Story Type

Domain / Form Simplification Patch

## Value Intent

Reduce duplication and improve clarity in Framing by keeping only Outcome fields that are truly needed for business effect, baseline, ownership and AI-level governance.

## Summary

Refine the Outcome object and Outcome form so Outcome carries the essential Framing information without duplicating presentation or governance fields that belong elsewhere.

## Acceptance Criteria

* Outcome core field set is reduced to the agreed simplified model
* Outcome retains business-effect fields required for Framing, including:

  * title
  * problemStatement
  * outcomeStatement
  * baselineDefinition
  * baselineSource
  * timeframe
  * valueOwner
  * riskProfile
  * aiAccelerationLevel
  * status
* duplicate descriptive fields that mean the same thing are removed or merged
* governance-like fields such as approvals or readiness are not stored as duplicate free-edit text fields in the core Outcome form
* Outcome form becomes simpler and easier to understand
* existing Outcome behavior remains compatible with later governance overlays

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* Outcome form is simpler without losing AAS-required Framing meaning
* duplicated or overlapping Outcome fields are removed or merged
* users can still define business effect, baseline, ownership and AI level clearly
* later governance and readiness behavior remains possible without core-form clutter

## Scope In

* Outcome field model simplification
* Outcome form simplification
* field merge/removal for overlapping descriptive fields
* compatibility with existing Framing flow

## Scope Out

* Epic changes
* Story changes
* approval record redesign
* M3 authority logic

## Constraints

* Outcome must still support AAS Framing requirements
* simplification must not remove baseline, ownership or AI-level decision capability
* patch must not introduce hidden loss of traceability
* governance metadata may move out of the core form, but must not be silently lost

## Required Evidence

* before/after Outcome field list
* screenshot of simplified Outcome form
* example showing retained Framing meaning after simplification

---

# M1-PATCH-045

## Title

Simplify Epic field model

## Story Type

Domain / Form Simplification Patch

## Value Intent

Make Epic easier to understand by keeping it focused on value area and scope, rather than turning it into a duplicate of Outcome or Story.

## Summary

Refine the Epic object and Epic form so Epic remains the middle Value Spine layer focused on purpose, scope and linkage to Outcome, without carrying unnecessary duplicated fields.

## Acceptance Criteria

* Epic core field set is reduced to the agreed simplified model
* Epic retains essential fields including:

  * key
  * outcomeId
  * title
  * purpose
  * scopeBoundary
  * riskNote
  * status
* duplicate descriptive fields are removed or merged
* Epic does not carry a full duplicated Outcome-style business effect model
* Epic does not carry a full duplicated Story-style delivery/test model
* Epic remains clearly linked to Outcome and Stories
* Epic form becomes easier to understand and edit

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* Epic is clearly distinguishable from both Outcome and Story
* Epic form focuses on value area and scope
* unnecessary duplicated fields are removed or merged
* Epic remains usable as the middle Value Spine layer

## Scope In

* Epic field model simplification
* Epic form simplification
* merge/removal of overlapping Epic descriptive fields
* retained linkage to Outcome and Story

## Scope Out

* Outcome simplification
* Story simplification
* imported Epic promotion redesign
* M3 governance behavior

## Constraints

* Epic must remain a first-class Value Spine object
* simplification must not collapse Epic into either Outcome or Story semantics
* patch must preserve explicit linkage to parent Outcome and child Stories
* patch must remain compatible with later review and governance overlays

## Required Evidence

* before/after Epic field list
* screenshot of simplified Epic form
* example showing Epic still distinct from Outcome and Story

---

# M1-PATCH-046

## Title

Simplify Story field model

## Story Type

Domain / Form Simplification Patch

## Value Intent

Keep Story focused on being the smallest governed and testable delivery unit, without unnecessary duplicated descriptive or governance fields.

## Summary

Refine the Story object and Story form so Story keeps its required AAS delivery semantics while removing overlapping or redundant fields.

## Acceptance Criteria

* Story core field set is reduced to the agreed simplified model
* Story retains essential fields including:

  * storyId
  * outcomeId
  * epicId
  * title
  * storyType
  * valueIntent
  * acceptanceCriteria
  * aiAccelerationLevel
  * aiUsageScope
  * testDefinition
  * definitionOfDone
  * status
* duplicate descriptive fields such as overlapping summary/description/notes are removed or merged where appropriate
* Story remains testable and build-handoff ready in principle
* governance-like fields are not duplicated unnecessarily in the core Story form
* Story form becomes easier to complete and review

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* Story remains the smallest governed and testable delivery unit
* Story form is simpler without losing AAS-required delivery meaning
* overlapping descriptive fields are reduced
* story creation and editing remain understandable and operational

## Scope In

* Story field model simplification
* Story form simplification
* merge/removal of overlapping descriptive fields
* compatibility with existing Story workflow

## Scope Out

* test object redesign
* imported story correction redesign
* approval chain behavior
* build tool integration changes

## Constraints

* Story must still support Story type, AI usage scope, acceptance criteria and test definition
* simplification must not weaken build-handoff readiness semantics
* patch must remain compatible with later M2 and M3 overlays
* traceability to Outcome and Epic must remain explicit

## Required Evidence

* before/after Story field list
* screenshot of simplified Story form
* example showing Story still testable after simplification

---

# M1-PATCH-047

## Title

Move governance-like fields out of core object forms

## Story Type

Governance / Form Architecture Patch

## Value Intent

Reduce form clutter by separating core object meaning from governance overlays such as approvals, readiness, blockers and review state.

## Summary

Refine object architecture so approvals, readiness, blockers, review state and similar governance-like information are represented outside the core Outcome, Epic and Story forms where possible.

## Acceptance Criteria

* governance-like fields are identified and classified separately from core object fields
* core forms for Outcome, Epic and Story no longer duplicate governance state as free-edit data where avoidable
* readiness is represented as computed or separate governance state where appropriate
* blockers are represented as computed or separate governance state where appropriate
* approvals are represented as separate records or overlays where appropriate
* review state is represented as separate governance state where appropriate
* simplified core forms remain understandable and usable
* governance information remains visible where needed without cluttering core forms

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration

## Definition of Done

* core forms are less cluttered by governance metadata
* governance information remains available without being modeled as duplicate object text fields
* users can distinguish object meaning from governance state more easily
* architecture remains compatible with M2 and M3 overlays

## Scope In

* governance field classification
* separation of governance metadata from core forms
* readiness/blocker/approval/review display simplification
* object-form cleanup

## Scope Out

* full M3 redesign
* detailed approval workflow redesign
* portfolio reporting
* external compliance export

## Constraints

* governance data must not be lost when moved out of core forms
* users must still be able to understand current readiness and review situation
* patch must not reduce traceability or accountability
* separation must remain compatible with later M3 governance records

## Required Evidence

* mapping of core fields vs governance fields
* screenshot showing simplified object form with separate governance display
* example of readiness/blocker/approval shown outside core form

---

# M1-PATCH-048

## Title

Inherit AI and risk context downward where appropriate

## Story Type

Domain / Governance Simplification Patch

## Value Intent

Reduce duplicated AI and risk entry by letting higher-level decisions guide lower levels unless explicit deviation is needed.

## Summary

Refine object behavior so AI acceleration level, risk context and related governance assumptions can flow downward from Outcome where appropriate, instead of requiring repeated independent entry at every level.

## Acceptance Criteria

* Outcome remains the primary place for AI acceleration level decision
* Outcome remains the primary place for full risk profile definition
* Epic does not require a separate full AI decision model by default
* Epic does not require a separate full risk profile by default
* Story can inherit AI level from Outcome by default where appropriate
* Story can still show and use AI usage scope explicitly
* Story can still support a constrained or lower effective AI level where needed
* lower-level objects do not require unnecessary repeated entry of the same governance decision
* inheritance behavior remains understandable to users

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration

## Definition of Done

* users do not need to re-enter the same AI/risk decisions unnecessarily
* higher-level Framing decisions remain visible and usable downstream
* Story still supports explicit delivery-level AI usage control
* simplification reduces duplication without weakening governance intent

## Scope In

* AI/risk inheritance behavior
* UI support for inherited defaults
* Story-level retained AI usage scope behavior
* reduction of duplicate AI/risk entry fields

## Scope Out

* pricing logic redesign
* automated risk scoring
* M3 authority logic
* imported artifact inheritance redesign

## Constraints

* Outcome must remain the governing source of primary AI level decision
* lower-level inheritance must remain explainable to users
* Story must still support explicit AI usage control for build relevance
* patch must not hide meaningful deviations where they matter

## Required Evidence

* example showing AI level inherited from Outcome to Story
* example showing reduced duplicate risk fields
* screenshot of simplified lower-level forms using inherited defaults

---

# M1-PATCH-049

## Title

Simplify forms and labels to match reduced field model

## Story Type

UX / Form Patch

## Value Intent

Make object editing easier by aligning labels, layout and field groups with the simplified model so users do not feel that multiple fields ask for the same thing.

## Summary

Refine forms, labels and grouping for Outcome, Epic and Story so the reduced field model is obvious in the UI and overlapping field meanings are removed from the user experience.

## Acceptance Criteria

* Outcome form labels align with simplified Outcome model
* Epic form labels align with simplified Epic model
* Story form labels align with simplified Story model
* overlapping labels that suggest duplicate meaning are removed or clarified
* field groups make the object's purpose easier to understand
* forms no longer present multiple fields that appear to ask for the same information without justification
* simplified form layout remains compatible with current project-scoped navigation and Value Spine editing
* labels remain understandable to users without relying on internal technical language

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* form labels and grouping reflect the simplified object model
* users can better understand why each field exists
* duplicate-feeling field entry is reduced
* forms remain usable in normal Framing, Epic and Story editing flow

## Scope In

* field label updates
* field grouping updates
* simplified form layout
* copy updates for field purpose clarity

## Scope Out

* domain model redesign beyond simplified fields
* M3 approval UI
* import parsing logic
* analytics redesign

## Constraints

* label simplification must not obscure AAS meaning
* forms must remain operationally useful for Value Spine authoring
* patch must remain compatible with previous simplification patches
* wording must favor user understanding over internal schema language

## Required Evidence

* screenshot of simplified Outcome form
* screenshot of simplified Epic form
* screenshot of simplified Story form
* before/after example of labels or grouping
