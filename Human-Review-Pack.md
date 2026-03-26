# Human Review Backlog Patch Pack

Detta patch-pack omvandlar Human Review från en formulärbaserad vy till en operativ backlog där användaren kan arbeta systematiskt med review, correction och approval.

Målet är att Human Review ska svara på:
👉 “Vad ska jag göra nu?”

inte:
👉 “Vilka fält finns här?”

---

## Designprinciper

* Lista först, formulär vid behov
* Statusbaserad gruppering
* Action före information
* Ett item i taget i fokus
* Full spårbarhet

---

## M2-PATCH-S7

### Title

Transform Human Review into backlog-style review list

### Story Type

UX / Workflow Patch

### Value Intent

Make Human Review operational by presenting review work as a backlog instead of a large unstructured form.

### Summary

Replace the current open-form Human Review view with a list of review items representing Stories, Epics or other candidates that require action.

### Acceptance Criteria

* Human Review opens with a list of items instead of a full form
* each item represents a Story, Epic or candidate object
* list is scoped to current project
* list shows compact summary per item
* items are actionable
* no large default open form is shown

### Definition of Done

* Human Review feels like a task list
* users can immediately see what needs work
* form is no longer the primary entry point

---

## M2-PATCH-S8

### Title

Group Human Review items by status

### Story Type

UX / State Patch

### Value Intent

Allow users to understand progress and priority by grouping items by status.

### Summary

Introduce clear grouping of Human Review items into actionable states.

### Acceptance Criteria

* items are grouped into:

  * Needs action (❌)
  * Needs confirmation (⚠)
  * Pending (⏳)
  * Approved (✅)
  * Rejected (🚫)
* counts are shown per group
* groups can be expanded/collapsed
* status is visible at a glance

### Definition of Done

* users can see progress instantly
* backlog is scannable
* no need to inspect each item to understand state

---

## M2-PATCH-S9

### Title

Open review item into focused correction workspace

### Story Type

Workflow / Detail Patch

### Value Intent

Allow users to focus on one item at a time when reviewing and correcting.

### Summary

Clicking an item opens a focused workspace showing:

* source
* candidate
* correction controls

### Acceptance Criteria

* clicking an item opens detail view
* detail view includes:

  * full source
  * parsed candidate
  * correction queue
* user can resolve issues directly
* user can return to list

### Definition of Done

* item-level work is isolated
* user focus improves
* no need to scroll large forms

---

## M2-PATCH-S10

### Title

Enable status transitions via actions

### Story Type

Workflow / Interaction Patch

### Value Intent

Allow users to progress items through states with clear actions.

### Summary

Add actions to move items between states.

### Acceptance Criteria

* actions include:

  * Fix (resolve issue)
  * Confirm (accept interpretation)
  * Mark not relevant
  * Reject
  * Approve
* actions update item status
* changes persist
* activity log updated

### Definition of Done

* users can complete review workflow end-to-end
* items move between states clearly
* backlog can be cleared

---

## M2-PATCH-S11

### Title

Show progress and completion in Human Review

### Story Type

UX / Feedback Patch

### Value Intent

Give users a sense of progress and completion.

### Summary

Add progress indicators to Human Review.

### Acceptance Criteria

* show total items
* show resolved vs unresolved
* show completion percentage
* update in real-time

### Definition of Done

* users see progress clearly
* no ambiguity about remaining work

---

## M2-PATCH-S12

### Title

Support discard and archive in review backlog

### Story Type

Workflow / Disposition Patch

### Value Intent

Allow users to remove irrelevant items and keep backlog clean.

### Summary

Add ability to discard or archive items.

### Acceptance Criteria

* user can discard item
* discarded items move to separate section
* discarded items do not block progress
* action is logged

### Definition of Done

* backlog remains manageable
* irrelevant items removed from flow

---

## Expected Outcome

* Human Review becomes a backlog
* users can work systematically
* no more overwhelming forms
* faster review cycles
* better readiness for promotion and tollgates
