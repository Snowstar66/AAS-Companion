# M1 Domain Model

## Scope

This document describes the persistence slice implemented for `M1-STORY-003`. It is intentionally limited to the first reviewable AAS foundation and does not include later UI workflows from `M1-STORY-004+`.

## Tenant Boundary

All persisted records are scoped by `organizationId`.

Core tenant-owned entities:
- `Outcome`
- `Epic`
- `Story`
- `Tollgate`
- `ActivityEvent`
- `Membership`

Repository reads and writes require organization scope, and the workspace summary is built from tenant-scoped queries only.

## Role Model

The M1 role model uses the six seeded delivery/governance roles:
- `value_owner`
- `aida`
- `aqa`
- `architect`
- `delivery_lead`
- `builder`

These roles are represented in `Membership.role` and may also appear in `Tollgate.approverRoles`.

## Outcome

`Outcome` is the primary value object for the M1 slice.

Key fields:
- `key`
- `title`
- `problemStatement`
- `outcomeStatement`
- `baselineDefinition`
- `baselineSource`
- `timeframe`
- `valueOwnerId`
- `riskProfile`
- `aiAccelerationLevel`
- `status`

`Outcome` owns:
- many `Epic`
- many `Story`

## Epic

`Epic` groups stories under an outcome.

Key fields:
- `key`
- `title`
- `purpose`
- `status`

`Epic` belongs to one `Outcome` and one `Organization`.

## Story

`Story` carries the first AAS-aligned delivery contract fields needed for M1 review.

Key fields:
- `key`
- `title`
- `storyType`
- `valueIntent`
- `acceptanceCriteria`
- `aiUsageScope`
- `aiAccelerationLevel`
- `testDefinition`
- `definitionOfDone`
- `status`

`Story` belongs to:
- one `Outcome`
- one `Epic`
- one `Organization`

## Tollgate

`Tollgate` is modeled generically against an entity instead of only against outcomes.

Key fields:
- `entityType`
- `entityId`
- `tollgateType`
- `status`
- `blockers`
- `approverRoles`
- `decidedBy`
- `decidedAt`
- `comments`

This lets M1 represent a blocked outcome baseline gate now and expand later without replacing the table shape.

## ActivityEvent

`ActivityEvent` is append-only.

Key fields:
- `entityType`
- `entityId`
- `eventType`
- `actorId`
- `metadata`
- `createdAt`

Mutating repository operations append an event inside the same transaction so traceability starts in M1 rather than being deferred.

## M1 Seed Shape

The demo seed creates:
- `1` organization
- `6` users and memberships, one per role
- `2` outcomes
- `1` epic
- `3` stories with mixed readiness
- `1` blocked tollgate
- activity events describing the seeded state

## Intentional M1 Limits

Still out of scope in this model:
- full evidence graph
- advanced risk ledger
- external tool adapters
- enterprise identity administration
