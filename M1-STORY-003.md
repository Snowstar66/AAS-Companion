# M1-STORY-003

## Title
Implement core domain schema and persistence

## Story Type
Feature

## Value Intent
Create a stable AAS-aligned persistence model for the first usable slice of the product.

## Summary
Implement the core persistence model for Outcome, Story and Tollgate so the first slice has a stable AAS foundation.

## Acceptance Criteria
- Prisma schema includes:
  - Outcome
  - Epic
  - Story
  - Tollgate
  - ActivityEvent
- core enums exist for role and status values
- first real migration runs successfully
- repositories exist for:
  - Outcome
  - Story
  - Tollgate
  - ActivityEvent
- Zod schemas mirror core domain fields
- simple create/read/update services exist
- repository access is organization-scoped
- at least one mutation creates an activity event
- domain model documentation exists in markdown

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration

## Definition of Done
- migration runs cleanly
- repositories can persist and read seeded objects
- Zod validates input correctly
- activity events are append-only
- documentation exists for the M1 domain model

## Scope In
- Prisma schema
- migrations
- repositories
- core services
- Zod domain validators
- basic DTO contracts
- activity events

## Scope Out
- full evidence model
- full AI usage log model
- advanced risk ledger modeling
- external integrations

## Minimum Schema Details

### Outcome
- id
- organizationId
- key
- title
- problemStatement
- outcomeStatement
- baselineDefinition
- baselineSource
- timeframe
- valueOwnerId
- riskProfile
- aiAccelerationLevel
- status
- createdAt
- updatedAt

### Epic
- id
- organizationId
- outcomeId
- key
- title
- purpose
- status

### Story
- id
- organizationId
- outcomeId
- epicId
- key
- title
- storyType
- valueIntent
- acceptanceCriteria
- aiUsageScope
- aiAccelerationLevel
- testDefinition
- definitionOfDone
- status
- createdAt
- updatedAt

### Tollgate
- id
- organizationId
- entityType
- entityId
- tollgateType
- status
- blockers
- approverRoles
- decidedBy
- decidedAt
- comments

### ActivityEvent
- id
- organizationId
- entityType
- entityId
- eventType
- actorId
- metadata
- createdAt

## File Targets
- `/packages/db/prisma/schema.prisma`
- `/packages/db/src/client.ts`
- `/packages/db/src/repositories/outcome-repository.ts`
- `/packages/db/src/repositories/story-repository.ts`
- `/packages/db/src/repositories/tollgate-repository.ts`
- `/packages/db/src/repositories/activity-repository.ts`
- `/packages/domain/src/outcome.ts`
- `/packages/domain/src/story.ts`
- `/packages/domain/src/tollgate.ts`
- `/packages/domain/src/activity.ts`
- `/packages/domain/src/enums.ts`
- `/packages/domain/src/validators.ts`
- `/packages/api/src/outcomes.ts`
- `/packages/api/src/stories.ts`
- `/packages/api/src/tollgates.ts`
- `/docs/architecture/m1-domain-model.md`

## Constraints
- activity events must be append-only
- do not use JSON for primary relationships
- JSON is acceptable for list fields in M1
- all repository access must be org-scoped
- no UI dependencies in db/domain/api layers

## Required Evidence
- schema summary
- migration file list
- example repository usage
- proof of org-scoped access