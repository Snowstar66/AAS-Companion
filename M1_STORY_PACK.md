# M1 Story Pack

This file defines the first implementation milestone.

## M1 goal
Build the first coherent slice of the AAS Control Plane so the team can feel the system and validate the foundation before continuing.

A user should be able to:
- sign in
- enter a demo organization context
- see the Home dashboard
- work with an Outcome
- see Tollgate 1 blocked when baseline is missing
- complete baseline fields and submit
- work with a Story
- see Story readiness blocked when Test Definition is missing
- preview an Execution Contract

---

## M1 scope in
- monorepo scaffold
- web app shell
- auth wiring
- prisma schema for core objects
- seed data
- Home page
- Framing Cockpit
- Outcome Workspace
- Story Workspace
- Tollgate 1 panel
- Build Handoff preview
- baseline audit/telemetry

## M1 scope out
- full Design Cockpit
- full Blueprint Workspace
- full Governance Center
- full Evidence graph
- external tool adapters
- WorkOS
- enterprise SSO
- SCIM
- full mobile optimization

---

## M1 story order

### M1-STORY-001
Scaffold monorepo and app shell

### M1-STORY-002
Implement auth, org context and demo seed

### M1-STORY-003
Implement core domain schema and persistence

### M1-STORY-004
Build Home dashboard

### M1-STORY-005
Build Framing Cockpit

### M1-STORY-006
Build Outcome Workspace with Tollgate 1 validation

### M1-STORY-007
Build Story Workspace with required AAS fields

### M1-STORY-008
Build Execution Contract preview

### M1-STORY-009
Add telemetry, audit and instrumentation

### M1-STORY-010
Implement end-to-end happy path and blocked path

---

## M1 architecture constraints
These constraints apply to the whole milestone:
- no business rules in React components
- all mutating validation must exist server-side
- no approval decisions only in UI
- all data must be tenant-scoped
- all important changes must create activity events
- all validation errors must be structured
- execution contract may never be generated without valid Story-ID

---

## M1 demo acceptance
M1 is acceptable when the following can be demonstrated:
- user signs in
- Home shows system status
- Framing Cockpit shows outcomes
- Outcome Workspace blocks Tollgate 1 when baseline is missing
- Outcome can be submitted when baseline is present
- Story Workspace blocks readiness when Test Definition is missing
- Execution Contract preview can be generated from a valid Story
- Activity timeline shows central events

---

## Human review point
After the first three stories, stop for human review.

That review must inspect:
- repo structure
- auth and org model
- core schema
- naming consistency
- implementation quality
- whether to continue into UI stories

---

## Recommended implementation lanes after schema is stable

### Lane A
- Home
- Framing
- Outcome

### Lane B
- Story workspace
- Execution contract preview
- Telemetry
- E2E

Do not parallelize heavily before the core schema is stable.

---

## Delivery discipline
Every commit, PR or AI session summary must mention the Story-ID.

Every completed story must produce:
- implementation summary
- changed file list
- tests added or changed
- test results
- deviations or known risks
- note of required human decisions