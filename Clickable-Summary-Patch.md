# Clickable Summary Cards Patch Pack

Detta patch-pack gör sammanfattningskort och statistikboxar klickbara där det är relevant, men bara under tydliga villkor:

1. klicket måste vara **strikt scoped till aktivt projekt**
2. klicket måste leda till **en arbetsyta där användaren kan agera**
3. kort utan tydlig destination ska **inte** vara klickbara, eller ska visa en tydlig sekundär action i stället

Målet är att göra boxar som visar antal Outcomes, Stories, Blockers, review-frågor, roller eller liknande mer användbara som nästa steg i arbetet, utan att återinföra kontextförvirring eller cross-project leakage.

**Rekommenderad körordning:**

1. M1-PATCH-051 — Make project-scoped summary cards actionable where a real destination exists
2. M1-PATCH-052 — Link project overview and Framing summary cards to filtered work views
3. M2-PATCH-015 — Link Import and Human Review summary cards to action lists
4. M3-PATCH-012 — Link Governance summary cards to filtered governance views

---

# M1-PATCH-051

## Title

Make project-scoped summary cards actionable where a real destination exists

## Story Type

UX / Navigation Patch

## Value Intent

Turn summary cards into useful next-step navigation when they represent real work the user can continue inside the active project.

## Summary

Refine summary-card behavior so cards become clickable or expose an explicit open action when they represent a meaningful, project-scoped destination, while non-actionable cards remain informational.

## Acceptance Criteria

* summary cards can be actionable when a meaningful destination exists
* actionable summary cards remain scoped to the active project
* clicking an actionable summary card opens the relevant destination inside the active project
* non-actionable summary cards remain informational and are not misleadingly clickable
* if a card is not fully clickable, a clear secondary action such as View or Open list can be used
* clickable behavior is consistent enough that users can predict what will happen
* navigation from cards does not leak into other projects
* card click behavior does not open global mixed views by default
* summary cards remain readable and useful even when not actionable

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* actionable summary cards reliably take the user to relevant work
* non-actionable cards are not misleading
* project scope is preserved during card navigation
* users can use summary cards as next-step shortcuts without confusion

## Scope In

* actionable summary card behavior
* card click and open-action patterns
* active project scope preservation on navigation
* non-actionable card state behavior

## Scope Out

* cross-project dashboards
* new analytics metrics
* approval workflow redesign
* card content redesign beyond action behavior

## Constraints

* actionable cards must always remain scoped to active project
* cards must only be clickable when a real destination exists
* navigation from cards must not reintroduce demo or cross-project leakage
* patch must remain compatible with project-isolated navigation model

## Required Evidence

* screenshot of clickable summary card in active project
* screenshot of informational non-clickable card
* short demo of card navigation preserving project scope

---

# M1-PATCH-052

## Title

Link project overview and Framing summary cards to filtered work views

## Story Type

UI / Workflow Patch

## Value Intent

Allow users to move directly from project or Framing summary numbers into the relevant objects they need to inspect or update.

## Summary

Add project-scoped drill-down behavior from summary cards in project overview and Framing views so counts such as Outcomes, Epics, Stories, Tests, blockers or readiness-related items open filtered and actionable work views.

## Acceptance Criteria

* relevant summary cards in project overview can open filtered project work views
* relevant summary cards in Framing view can open filtered project work views
* supported destinations may include:

  * current Framing
  * current Outcome view
  * Value Spine
  * filtered Epic list
  * filtered Story list
  * filtered Test list
  * blocker-focused view
* card drill-down always stays inside the active project
* where possible, destination opens with useful filter or expansion state already applied
* summary-card navigation does not open mixed or global lists
* cards that represent blocked or missing work can take user to the place where that work can be fixed
* if a card's number is zero, card behavior remains understandable and does not mislead users

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e

## Definition of Done

* users can move from project or Framing summary cards directly into relevant project work
* destinations are actionable and properly filtered where relevant
* project and Framing summaries become operational rather than decorative
* card navigation remains clear and scoped

## Scope In

* project overview card drill-down
* Framing summary card drill-down
* filtered destination routing
* zero-state card behavior

## Scope Out

* Home dashboard redesign
* cross-project project comparison
* new analytics aggregation
* governance card behavior

## Constraints

* all destinations must remain inside the active project
* drill-down must favor actionable filtered views over generic landing pages
* cards must not open unrelated data when user expects to continue work
* patch must remain compatible with Value Spine and strict project-isolation patches

## Required Evidence

* screenshot of project or Framing summary card
* screenshot of filtered destination opened from card click
* short demo of blocker card leading to blocker-focused work view
* short demo of Story/Value Spine card leading to filtered project view

---

# M2-PATCH-015

## Title

Link Import and Human Review summary cards to action lists

## Story Type

Review / Navigation Patch

## Value Intent

Make Import and Human Review more actionable by turning summary counts into direct links to the unresolved work the user must review, correct or approve.

## Summary

Add clickable summary-card behavior in Import and Human Review so counts such as unmapped sections, low-confidence fields, missing required fields, human-only questions or ready-for-approval items lead directly to action-oriented filtered views.

## Acceptance Criteria

* Import summary cards can link to filtered issue lists for the current project and current artifact context where relevant
* Human Review summary cards can link to filtered action lists for the current project and current artifact context where relevant
* supported drill-down categories may include:

  * unmapped sections
  * low-confidence fields
  * missing required fields
  * human-only decisions
  * blocking issues
  * ready-for-approval items
* clicking a card opens a view where the user can actually continue the work, not just see a number again
* project scope is preserved during navigation
* artifact context is preserved where applicable
* summary-card drill-down does not send user to unrelated project or artifact data
* issue counts remain understandable even when cards are not actionable in a given context
* summary cards reinforce Human Review as an action list rather than a fragmented interpretation maze

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e

## Definition of Done

* Import and Human Review summary counts become useful entry points to unresolved work
* project and artifact context stay stable during drill-down
* review users can continue work directly from summary cards
* action-list behavior is clearer and more efficient

## Scope In

* Import summary-card drill-down
* Human Review summary-card drill-down
* filtered issue-list destinations
* project/artifact context preservation

## Scope Out

* import parsing redesign
* review correction form redesign
* promotion workflow redesign
* approval chain redesign

## Constraints

* drill-down must remain scoped to active project
* artifact-scoped review cards must preserve current artifact context where applicable
* cards must lead to actionable lists, not generic overview pages, where possible
* patch must remain compatible with later correction and promotion flows

## Required Evidence

* screenshot of Import summary cards
* screenshot of Human Review summary cards
* screenshot of filtered issue/action list opened from a card
* short demo of low-confidence or missing-fields card leading to actionable review list

---

# M3-PATCH-012

## Title

Link Governance summary cards to filtered governance views

## Story Type

Governance / Navigation Patch

## Value Intent

Allow users to move directly from governance counts into the relevant role, staffing or approval views they need to inspect or resolve.

## Summary

Add project-scoped drill-down behavior from Governance summary cards so counts such as missing roles, risky combinations, unassigned roles, pending approvals or agents without supervising humans lead to filtered governance views.

## Acceptance Criteria

* Governance summary cards can link to filtered governance lists inside the active project
* supported drill-down categories may include:

  * missing roles
  * unassigned roles
  * risky combinations
  * pending approvals
  * agents without supervising human
* clicking a Governance summary card opens a relevant filtered governance view or list
* active project context is preserved during navigation
* customer and supplier grouping remain understandable after drill-down where applicable
* governance card drill-down does not open cross-project role data
* cards remain readable even when no drill-down is available for a given metric
* filtered governance views remain compatible with compact grouped Governance layout

## AI Usage Scope

* CODE
* TEST

## Test Definition

* integration
* e2e smoke

## Definition of Done

* governance summary counts become practical entry points to governance work
* navigation remains scoped to active project
* users can quickly move from governance signals to relevant filtered role or approval views
* grouped governance structure remains understandable after drill-down

## Scope In

* Governance summary-card drill-down
* filtered governance destinations
* active project scope preservation
* grouped customer/supplier compatibility during drill-down

## Scope Out

* approval workflow redesign
* directory integration redesign
* cross-project governance analytics
* avatar/icon redesign

## Constraints

* Governance card drill-down must remain strictly project-scoped
* filtered destinations must preserve readability of customer vs supplier separation where relevant
* cards must only be actionable when a meaningful governance destination exists
* patch must remain compatible with compact governance list patterns and later M3 extensions

## Required Evidence

* screenshot of Governance summary card(s)
* screenshot of filtered governance destination
* short demo of missing-role or pending-approval card navigation
