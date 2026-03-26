# AI Level Validation and Recommendations Patch Pack

Detta patch-pack gör governance-sidan mer operativ genom att ersätta passiv hjälptext med:

* faktisk validering av om bemanning och rollseparation stödjer vald AI-nivå
* AAS-baserade rekommendationer när bemanning eller separation inte räcker
* tydlig skillnad mellan staffing-readiness och slutlig tollgate-/approval-readiness

Patcharna utgår från att governance-sidan redan har eller får stöd för:

* roller per kund och leverantör
* required roles by AI level
* risky combinations
* agenter och supervising human
* readiness/staffing gaps

## Designprincip

Verktyget ska inte säga att ett projekt är "approved for level 3".
Det ska i stället säga om:

* den nuvarande staffing- och separationsbilden stödjer vald AI-nivå
* den inte stödjer vald nivå
* nedgradering rekommenderas
* ytterligare mänskliga roller eller separation krävs

## Rekommenderad körordning

1. M3-PATCH-013 — Replace passive AI level help text with staffing validation for selected AI level
2. M3-PATCH-014 — Add AAS-based recommendations for staffing and role separation gaps
3. M3-PATCH-015 — Separate staffing validation from final approval and tollgate readiness

---

# M3-PATCH-013

## Title

Replace passive AI level help text with staffing validation for selected AI level

## Story Type

Governance / Validation Patch

## Value Intent

Make AI-level readiness operational by validating whether the current project's staffing, role coverage and separation actually support the selected AI level.

## Summary

Replace the passive help-text treatment of AI level readiness with an explicit validation result based on the selected AI level and the currently assigned human and agent roles.

## Acceptance Criteria

* governance page validates staffing against the currently selected AI level
* validation is not hardcoded to level 3 only
* validation result is shown clearly in the UI
* supported validation outcomes include where relevant:

  * Staffing supports selected AI level
  * Staffing does not support selected AI level
  * Missing required role
  * Risky role combination
  * Agent lacks supervising human
* validation reflects actually assigned roles, not assumed roles
* validation reflects risky role combinations where defined
* validation remains scoped to the active project
* validation result is understandable without reading long explanatory text
* previous passive help text is replaced or reduced to supporting explanation only

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* governance page shows a real staffing validation result for the selected AI level
* users no longer depend on passive explanatory text to infer readiness
* validation works for the selected AI level rather than only for level 3
* validation result is project-scoped, understandable and operationally useful

## Scope In

* selected AI-level staffing validation
* validation result UI
* validation messages for missing roles and risky combinations
* replacement of passive help-only pattern

## Scope Out

* final tollgate approval logic
* pricing logic redesign
* approval-chain redesign
* cross-project governance analytics

## Constraints

* validation must reflect current project staffing only
* validation must not imply final approval or sign-off
* validation must remain explainable and human-readable
* patch must remain compatible with required roles, risky combinations and supervising-human rules

## Required Evidence

* screenshot of governance page showing validation result
* screenshot of validation result for supported and unsupported AI-level staffing
* short demo of validation changing when roles are assigned or removed

---

# M3-PATCH-014

## Title

Add AAS-based recommendations for staffing and role separation gaps

## Story Type

Governance / Recommendation Patch

## Value Intent

Help users act on governance gaps by showing concrete AAS-aligned recommendations when staffing or role separation does not support the selected AI level.

## Summary

Add recommendation logic to the governance page so missing roles, risky combinations and weak supervision produce clear next-step guidance grounded in AAS principles.

## Acceptance Criteria

* governance page can show recommendations when staffing validation fails or is risky
* supported recommendations include where relevant:

  * Assign missing role
  * Separate conflicting roles
  * Assign supervising human
  * Keep current AI level blocked
  * Downgrade AI level
* recommendations are based on actual detected gap types
* recommendations are understandable and action-oriented
* downgrade recommendation can be shown when current staffing does not sustain selected AI level
* recommendation display remains scoped to the active project
* recommendations remain compatible with customer/supplier role separation
* recommendations do not overclaim certainty beyond the detected governance gaps
* recommendations remain visible without forcing user to inspect every role row manually

## AI Usage Scope

* CODE
* TEST

## Test Definition

* unit
* integration
* e2e smoke

## Definition of Done

* governance gaps lead to concrete and understandable next-step recommendations
* users can see how to improve staffing readiness without guessing
* AAS-aligned downgrade guidance is visible when appropriate
* recommendations make governance page more operational and less passive

## Scope In

* recommendation logic from validation outcomes
* recommendation UI
* AAS-aligned guidance for missing roles and risky separation
* downgrade recommendation where appropriate

## Scope Out

* automatic role assignment
  n- automatic approval granting
* staffing optimization engine
* broader commercial recommendation engine

## Constraints

* recommendations must remain grounded in AAS governance logic
* recommendations must not automatically mutate staffing or AI level without human action
* downgrade guidance must remain professional and explainable
* patch must remain compatible with later M3 approval and readiness extensions

## Required Evidence

* screenshot of governance page with recommendations shown
* screenshot showing downgrade recommendation
* short demo of recommendations changing after staffing update

---

# M3-PATCH-015

## Title

Separate staffing validation from final approval and tollgate readiness

## Story Type

Governance / Readiness Clarification Patch

## Value Intent

Prevent false green lights by making it clear that staffing validation is one readiness dimension, not the same thing as final approval or full tollgate readiness.

## Summary

Clarify governance outputs so staffing validation is shown as a distinct result and is not confused with final sign-off, final approval or full tollgate readiness.

## Acceptance Criteria

* governance page distinguishes staffing validation from final approval status
* governance page distinguishes staffing validation from full tollgate readiness
* UI wording avoids implying that staffing support alone equals project approval
* supported phrasing may include:

  * Staffing supports selected AI level
  * Staffing does not support selected AI level
  * Further governance or tollgate requirements remain
* if staffing supports the selected AI level, remaining approval or tollgate requirements can still be visible separately
* if staffing does not support the selected AI level, progression can remain blocked or flagged accordingly
* distinction remains understandable to users
* distinction remains visible in the active project context

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can distinguish staffing-readiness from full approval state
* governance page no longer risks overclaiming what the validation means
* staffing validation supports decision-making without replacing human sign-off
* AAS meaning is preserved more clearly in the UI

## Scope In

* UI wording and state separation
* distinct display of staffing validation vs final approval/tollgate readiness
* compatibility with progression blocking messages

## Scope Out

* full approval workflow redesign
* M3 approval record redesign
* tollgate page redesign
* external compliance reporting

## Constraints

* staffing validation must never be presented as equivalent to final approval
* UI wording must remain concise and operational
* patch must remain compatible with later tollgate and approval layers
* project context must remain clear throughout

## Required Evidence

* screenshot showing separate staffing validation and approval/tollgate state
* screenshot showing unsupported staffing without false green light
* short demo of UI distinction between staffing validation and final readiness
