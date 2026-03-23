# Load Order

This file defines the reading and execution order for the BMAD/AI build role.

## Purpose
The goal is to prevent uncontrolled implementation and ensure that:
- AAS governance stays intact
- technical defaults stay fixed
- the build role starts in the correct place
- implementation stops at the first human review point

---

## Read order

The AI build role must read these files in the following order:

1. `README_START_HERE.md`
2. `HUMAN_DECISIONS_AND_STOP_RULES.md`
3. `TECH_DEFAULTS.md`
4. `CODEX_READY_TASK_PACK_M1_001_003.md`
5. `M1_STORY_PACK.md`

If available later, supporting files such as architecture or UI specs may be read after these.

---

## Execution order

The AI build role may execute only in this order:

1. `M1-STORY-001`
2. `M1-STORY-002`
3. `M1-STORY-003`

Then stop.

Do not continue automatically to:
- `M1-STORY-004`
- `M1-STORY-005`
- `M1-STORY-006`
- `M1-STORY-007`
- `M1-STORY-008`
- `M1-STORY-009`
- `M1-STORY-010`

These may only be started after explicit human approval.

---

## Mandatory stop rule

After `M1-STORY-003`, the AI build role must stop and request human review.

No additional story may begin until a human says to continue.

---

## Before coding each story

Before implementation begins, the AI build role must:

1. restate the Story-ID and title
2. summarize the scope
3. list impacted files
4. confirm assumptions
5. identify risks or unclear constraints
6. only then begin implementation

---

## After each story

After implementation, the AI build role must provide:

- Story-ID
- implementation summary
- changed files
- tests added or changed
- test results
- deviations
- unresolved questions
- human decisions required

---

## Non-negotiable rules

The AI build role may not:
- redefine outcome
- change AI level
- change governance logic
- approve tollgates
- accept risk
- widen scope silently
- continue past `M1-STORY-003` without approval

---

## Human operator reminder

The correct way to use this pack is:

- load all core files
- start with `M1-STORY-001`
- inspect results
- continue to `M1-STORY-002`
- inspect results
- continue to `M1-STORY-003`
- stop for review

This is intentional and required.