# UX Consistency and Clarity Patch Pack

Detta patch-pack baseras på faktisk användarfeedback och adresserar kritiska UX-problem som påverkar användbarhet, tydlighet och flöde.

## Bedömning av feedback

All feedback är **relevant och korrekt**.
Den pekar inte på fel i AAS-modellen utan på **UI/UX-brister i implementationen**.

Sammanfattning:

* AAS-logiken är stark
* UX-lagret bryter ibland modellen
* Verktyget känns tyngre än det är

Detta patch-pack syftar till att:

* göra modellen operativ
* göra status konsekvent
* minska kognitiv belastning
* tydliggöra nästa steg

---

## Rekommenderad körordning

1. M1-PATCH-059 — Single source of truth for status across all views
2. M1-PATCH-060 — Add Next Required Action panel
3. M1-PATCH-061 — Introduce story lifecycle step indicator
4. M1-PATCH-062 — Progressive disclosure of information
5. M1-PATCH-063 — Replace internal status labels with user-facing language
6. M1-PATCH-064 — Enhance Value Spine cards with operational status
7. M1-PATCH-065 — Immediate feedback after critical actions
8. M1-PATCH-066 — Prevent duplicate approvals
9. M1-PATCH-067 — Add inline terminology support (AAS concepts)

---

# M1-PATCH-059

## Title

Enforce single source of truth for status across all views

## Story Type

Consistency / Data Patch

## Value Intent

Ensure users always see the same status regardless of where they are in the tool.

## Summary

All status indicators must be derived from the same underlying state model and rendered consistently across Story, Value Spine, Governance and Review views.

## Acceptance Criteria

* Story status is identical in all views
* Value Spine reflects actual Story state
* no conflicting status labels appear
* status is derived, not duplicated
* status updates propagate immediately across views

## Definition of Done

* no conflicting statuses exist
* users trust status information

---

# M1-PATCH-060

## Title

Add Next Required Action panel

## Story Type

UX / Guidance Patch

## Value Intent

Help users understand what to do next without interpreting the model.

## Summary

Introduce a top panel that shows the next required action based on current state.

## Acceptance Criteria

* panel visible at top of relevant pages
* shows 1–3 clear actions
* actions are actionable (buttons/links)
* based on current state (dynamic)
* scoped to project and object

## Definition of Done

* users no longer guess next step
* workflow becomes guided

---

# M1-PATCH-061

## Title

Introduce story lifecycle step indicator

## Story Type

UX / Workflow Patch

## Value Intent

Make progress visible and understandable.

## Summary

Add a step indicator showing lifecycle:
Draft → Ready for review → Under sign-off → Approved → Ready for handoff

## Acceptance Criteria

* step indicator visible on Story view
* reflects real state
* updates automatically
* consistent across UI

## Definition of Done

* users understand where they are in process

---

# M1-PATCH-062

## Title

Introduce progressive disclosure of information

## Story Type

UX Simplification Patch

## Value Intent

Reduce cognitive overload by showing only relevant information first.

## Summary

Collapse secondary panels and show primary information first.

## Acceptance Criteria

* default view shows only critical info
* secondary info is collapsible
* user can expand details when needed

## Definition of Done

* pages feel lighter
* faster comprehension

---

# M1-PATCH-063

## Title

Replace internal status labels with user-friendly language

## Story Type

UX / Language Patch

## Value Intent

Improve understanding by using natural language.

## Summary

Replace terms like "definition blocked" with clearer alternatives.

## Acceptance Criteria

* labels updated to user-friendly terms
* terminology consistent across UI
* no internal jargon exposed

## Definition of Done

* users understand statuses instantly

---

# M1-PATCH-064

## Title

Enhance Value Spine cards with operational status

## Story Type

UI / Information Patch

## Value Intent

Make Value Spine actionable at a glance.

## Summary

Each Story card shows:

* readiness status
* missing sign-offs
* number of open actions
* readiness for handoff

## Acceptance Criteria

* cards display above fields
* info is accurate
* info is minimal but sufficient

## Definition of Done

* users can act directly from Value Spine

---

# M1-PATCH-065

## Title

Provide immediate feedback after critical actions

## Story Type

UX / Feedback Patch

## Value Intent

Ensure users know their action succeeded.

## Summary

Show immediate visual confirmation after readiness, approval, etc.

## Acceptance Criteria

* success message shown
* status updates instantly
* no need for refresh

## Definition of Done

* no ambiguity after actions

---

# M1-PATCH-066

## Title

Prevent duplicate approvals

## Story Type

Validation Patch

## Value Intent

Maintain data integrity and trust.

## Summary

Block or warn when duplicate approval is attempted.

## Acceptance Criteria

* duplicate approval blocked or warned
* user informed clearly

## Definition of Done

* no duplicate approvals exist

---

# M1-PATCH-067

## Title

Add inline AAS terminology support

## Story Type

Help / UX Patch

## Value Intent

Make AAS concepts understandable in context.

## Summary

Add tooltips for key terms such as Framing, Value Spine, Readiness, Tollgate.

## Acceptance Criteria

* help icons present near terms
* short explanation shown on hover/click
* consistent across app

## Definition of Done

* users understand terms without external docs

---

## Expected Outcome

* UX becomes significantly clearer
* status becomes trustworthy
* workflow becomes guided
* tool becomes faster to use
* AAS becomes understandable in practice
