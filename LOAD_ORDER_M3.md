# Load Order M3

This file defines the recommended reading and execution order for M3.

## Purpose

The goal is to introduce governance staffing, authority and approval capability in a sequence that matches the current repository state.

M3 should build on the existing M1 and M2 foundations without jumping directly into final approval UI before named people, role coverage and authority structure exist.

---

## Preconditions for M3

Before starting M3, the AI build role must assume:

- M1 and M2 foundations already exist in the repository
- current repository state must be inspected before making changes
- tollgate status exists, but full human approval workflow is not yet implemented
- human people/roles are not yet modeled deeply enough for final approval flows

The AI build role must work from actual repository state, not from assumptions in story files alone.

---

## Read order

The AI build role should read these files in the following order before starting M3:

1. `README.md`
2. `LOAD_ORDER_M2.md`
3. `LOAD_ORDER_M3.md`
4. `M3-STORY-001.md`
5. `M3-STORY-002.md`
6. `M3-STORY-003.md`
7. `M3-STORY-004.md`
8. `M3-STORY-007.md`
9. `M3-STORY-005.md`
10. `M3-STORY-006.md`
11. `M3-STORY-008.md`

If architecture, UI or domain notes exist for M3, they may be read after the files above.

---

## Recommended execution order

M3 should be implemented in this order:

1. `M3-STORY-001`  
   Create Party and Role Directory workspace

2. `M3-STORY-002`  
   Model required roles by AI acceleration level

3. `M3-STORY-003`  
   Create Agent Registry and human oversight linkage

4. `M3-STORY-004`  
   Create Authority Matrix for customer, supplier and AI governance

5. `M3-STORY-007`  
   Show readiness and staffing gaps for required governance roles

Then stop for human review.

Only after explicit human approval should implementation continue to:

6. `M3-STORY-005`  
   Implement Approval Record and Sign-off model

7. `M3-STORY-006`  
   Create Tollgate Review and Approval UI

8. `M3-STORY-008`  
   Link approvals and sign-offs to evidence, activity and traceability views

---

## Why this order

This order is recommended because:

- `M3-STORY-001` creates the named human people and roles that later approval flows need
- `M3-STORY-002` makes role requirements explicit before readiness or approval comparisons are attempted
- `M3-STORY-003` depends on human oversight roles already existing
- `M3-STORY-004` becomes more useful once people, roles and agents already exist
- `M3-STORY-007` depends on role assignments and coverage logic, not on approval records
- `M3-STORY-005` should land before `M3-STORY-006`, because final tollgate approval UI should write real approval records
- `M3-STORY-008` should be last because it depends on approval records and approval activity already existing

---

## Mandatory stop rule

After `M3-STORY-007`, the AI build role should stop and request human review.

No approval-model or tollgate-signoff UI story should begin until a human explicitly approves continuation.

---

## Human review checkpoint after M3-STORY-007

The human reviewer should check:

### Role directory

- Are customer and supplier roles clear and usable?
- Are human roles distinct from agent roles?
- Are real named people now available for later governance linkage?

### Required-role logic

- Are AI-level role requirements understandable?
- Are missing and risky combinations visible and explainable?

### Authority structure

- Does the Authority Matrix reflect the intended accountability model?
- Are ownership and approval responsibilities clear enough before sign-off records are introduced?

### Readiness view

- Does staffing/readiness visibility help decision-making?
- Are readiness gaps shown clearly without implying actual approval?

### Go / no-go decision

The human reviewer decides whether to:

- continue to approval-record modeling
- revise people/role modeling
- revise authority or readiness semantics
- pause for architecture correction

---

## Specific M3 governance rules

The AI build role must not:

- treat AI agents as human approvers
- blur customer and supplier accountability
- infer final approval from staffing completeness alone
- implement tollgate final approval UI before approval records exist
- hide missing ownership or missing roles

The AI build role must:

- keep human and agent entities visibly distinct
- keep oversight linkage explicit
- keep role-readiness explainable
- keep approval human-centered and auditable
- preserve organization-side visibility in all governance records

---

## Before coding each M3 story

Before implementation begins, the AI build role should:

1. restate the Story-ID and title
2. summarize the scope
3. list impacted files
4. confirm assumptions
5. identify governance or modeling risks
6. only then begin implementation

---

## After each M3 story

After implementation, the AI build role should provide:

- Story-ID
- implementation summary
- changed files
- tests added or changed
- test results
- deviations
- unresolved questions
- human decisions required

---

## Human operator reminder

The safest way to use M3 is:

- start with human roles and party structure
- then model role requirements
- then add agent oversight
- then build authority and readiness views
- stop for human review
- only then add approval records, tollgate approval UI and full sign-off traceability

This keeps M3 aligned with governed human accountability instead of jumping too early into final approval mechanics.
