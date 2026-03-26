# M2-ENAB-004A

## Title
Introduce governed object provenance and shared readiness semantics

## Story Type
Platform / Domain Enablement

## Value Intent
Create a shared foundation so natively created and imported-promoted governed objects can use the same operational model without losing origin, lineage or readiness clarity.

## Summary
Introduce shared provenance fields, lineage references and reusable readiness semantics for governed objects before Human Review, promotion and build-boundary gating are extended further.

## Acceptance Criteria
- governed objects can store:
  - origin type
  - created mode
  - lineage reference where applicable
- supported origin types include:
  - seeded
  - native
  - imported
- supported created modes include:
  - demo
  - clean
  - promotion
- lineage reference can be empty for native objects and present for imported-promoted objects
- readiness state can be computed with shared semantics across governed objects
- shared block-reason structure exists for readiness and progression decisions
- provenance metadata is queryable and usable by UI views
- activity events can include provenance context where relevant

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration

## Definition of Done
- provenance fields persist correctly
- shared readiness semantics can be reused by both native and imported governed objects
- lineage is optional for native objects and preserved for imported-promoted objects
- event payloads can carry provenance context without breaking existing flows

## Scope In
- provenance field model
- lineage reference model
- shared readiness semantics
- shared block-reason model
- persistence updates
- event payload support

## Scope Out
- human review UI
- promotion UI
- tollgate approval UI
- external integrations

## Constraints
- provenance must not fork the governed object model into separate native and imported variants
- lineage must remain optional where no source artifact exists
- readiness semantics must remain understandable to humans
- enablement must not silently change existing governance outcomes

## Required Evidence
- schema example
- example native governed object with provenance
- example imported-promoted governed object with provenance
- example shared readiness/block-reason output