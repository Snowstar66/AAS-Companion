\# M2-STORY-007



\## Title

Show imported artifacts in Value Spine and readiness views



\## Story Type

UI Feature



\## Value Intent

Make imported-and-promoted work visible in the same operational model as natively created work, without losing clarity about origin, readiness or lineage.



\## Summary

Extend Value Spine and readiness views so promoted imported artifacts can be inspected alongside directly authored objects while preserving a shared user mental model.



\## Acceptance Criteria

\- promoted imported objects appear in Value Spine views

\- imported origin is visually indicated

\- AAS readiness state is visible in relevant views

\- missing links are visible

\- missing tests or test definitions are visible

\- lineage can be navigated from governed object back to original source artifact

\- imported objects can be filtered separately if needed

\- native and imported objects remain comparable in shared views

\- imported objects do not require a separate mental model for understanding readiness and progression



\## AI Usage Scope

\- CODE

\- TEST



\## Test Definition

\- component

\- integration

\- e2e smoke



\## Definition of Done

\- promoted imported objects behave coherently in existing workspaces

\- users can understand both origin and readiness

\- traceability is visible without overwhelming the UI

\- imported items do not reduce usability of native objects

\- native and imported objects remain understandable within one shared operational model



\## Scope In

\- Value Spine visualization updates

\- readiness panel updates

\- imported origin indicators

\- readiness state indicators

\- lineage navigation

\- filtering support for imported objects



\## Scope Out

\- advanced graph analytics

\- cross-project lineage federation

\- full evidence graph expansion



\## Constraints

\- imported status must not reduce clarity

\- origin marker must be visible but not noisy

\- readiness must use consistent semantics across native and imported objects

\- spine views must remain operational, not decorative

\- shared views must not force users into separate native vs imported workflows for ordinary inspection



\## Required Evidence

\- screenshots of Value Spine with imported objects

\- readiness panel example

\- lineage navigation example

\- filtered imported-object example

\- comparison view showing native and imported objects together

