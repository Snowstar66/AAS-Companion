\# M2-STORY-006



\## Title

Promote confirmed imported artifacts into governed Framing and Design objects



\## Story Type

Feature



\## Value Intent

Allow reviewed imported artifacts to become live governed objects while retaining lineage and readiness transparency inside the same operational model as natively created work.



\## Summary

Enable promotion of confirmed candidate Outcomes, Epics and Stories into the normal Framing and Design workspaces, with explicit imported origin, retained lineage and visible AAS readiness state.



\## Acceptance Criteria

\- confirmed candidate Outcome can be promoted into Outcome Workspace

\- confirmed candidate Epic can be promoted into Epic Workspace

\- confirmed candidate Story can be promoted into Story Workspace

\- promoted objects retain traceability to original source artifacts

\- promoted objects are marked with imported origin

\- promoted objects reuse the same governed object model as native objects

\- promoted objects receive an AAS readiness state such as:

&#x20; - imported

&#x20; - imported\_incomplete

&#x20; - imported\_human\_review\_needed

&#x20; - imported\_framing\_ready

&#x20; - imported\_design\_ready

&#x20; - blocked

\- promotion is blocked if required human confirmations remain unresolved

\- promotion actions create activity events

\- promoted objects become visible in normal governed workspaces without requiring a separate imported-only workspace model



\## AI Usage Scope

\- CODE

\- TEST



\## Test Definition

\- integration

\- e2e



\## Definition of Done

\- promotion flow works end-to-end

\- imported lineage is visible after promotion

\- readiness state is visible and meaningful

\- blocked promotion scenarios are demonstrable

\- promoted imported objects behave coherently with native governed objects



\## Scope In

\- promotion actions

\- promotion rules

\- imported origin markers

\- AAS readiness state model

\- lineage persistence

\- governed-object conversion



\## Scope Out

\- tollgate approval

\- automatic build approval

\- external synchronization



\## Constraints

\- promotion must not imply compliance approval beyond what is explicitly confirmed

\- imported origin must remain visible after promotion

\- readiness state must remain queryable and UI-visible

\- lineage must not be lost in transformation

\- promotion may add provenance and readiness metadata, but must not create a separate workspace behavior model



\## Required Evidence

\- promotion demo

\- example of imported origin marker

\- example readiness state after promotion

\- blocked promotion example

\- example promoted object shown in normal governed workspace

