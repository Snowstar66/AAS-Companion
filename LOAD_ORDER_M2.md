# Load Order M2

This file defines the reading and execution order for the BMAD/AI build role during M2.

## Purpose
The goal is to ensure that imported artifacts are handled in a governed way and that M2 builds on M1 without bypassing review, ambiguity handling or human authority.

---

## Read order

The AI build role must read these files in the following order before starting M2 work:

1. `README_START_HERE.md`
2. `HUMAN_DECISIONS_AND_STOP_RULES.md`
3. `TECH_DEFAULTS.md`
4. `LOAD_ORDER.md`
5. `M1_STORY_PACK.md`
6. `M2_STORY_PACK.md`
7. `LOAD_ORDER_M2.md`
8. `M2-STORY-001.md`
9. `M2-STORY-002.md`
10. `M2-STORY-003.md`
11. `M2-STORY-004.md`
12. `M2-STORY-005.md`
13. `M2-STORY-006.md`
14. `M2-STORY-007.md`
15. `M2-STORY-008.md`

If architecture, UI or domain files exist for M2, they may be read after the files above.

---

## Preconditions for M2
Before starting M2 implementation, the AI build role must assume:
- M1 foundation exists
- M1 has been reviewed by a human
- current repository state must be inspected before changing anything

The AI build role must not assume that M1 is perfect. It must inspect current implementation and work from actual repository state.

---

## Execution order

The AI build role may execute only in this order:

1. `M2-STORY-001`
2. `M2-STORY-002`
3. `M2-STORY-003`

Then stop for human review.

Only after explicit human approval may it continue to:

4. `M2-STORY-004`
5. `M2-STORY-005`
6. `M2-STORY-006`
7. `M2-STORY-007`
8. `M2-STORY-008`

---

## Mandatory stop rule

After `M2-STORY-003`, the AI build role must stop and request human review.

No additional M2 story may begin until a human explicitly says to continue.

---

## Before coding each M2 story

Before implementation begins, the AI build role must:

1. restate the Story-ID and title
2. summarize the scope
3. list impacted files
4. confirm assumptions
5. identify architectural or governance risks
6. only then begin implementation

---

## After each M2 story

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

## Specific M2 governance rules

The AI build role may not:
- treat imported content as automatically compliant
- hide uncertainty in parsing or mapping
- downgrade human-only decisions into ordinary missing fields
- promote imported content as approved if human confirmation is missing
- allow build progression when unresolved imported compliance gaps remain

The AI build role must:
- preserve source lineage
- preserve ambiguity where ambiguity exists
- keep imported origin visible after promotion
- use deterministic compliance checks where rules are explicit
- stop if governance semantics become unclear

---

## Human review checkpoint after M2-STORY-003

The human reviewer must check:

### Intake and classification
- Is Artifact Intake usable?
- Are source artifact types being classified sensibly?

### Parsing
- Is the parser extracting meaningful candidate structure?
- Are source references preserved?

### Mapping
- Is AAS candidate mapping trustworthy?
- Is ambiguity preserved correctly?
- Are relationships inferred carefully rather than forced?

### Go / no-go decision
The human reviewer decides whether to:
- continue to compliance and review queue
- revise parsing/mapping
- narrow supported import patterns
- pause for architecture correction

---

## Human operator reminder

The correct way to use M2 is:

- load all controlling files
- inspect the existing repository state
- start with `M2-STORY-001`
- continue to `M2-STORY-002`
- continue to `M2-STORY-003`
- stop for human review
- only then continue to `M2-STORY-004` to `M2-STORY-008`

This is required to keep imported artifact handling aligned with AAS governance.