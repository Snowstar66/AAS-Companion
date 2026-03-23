# M1-STORY-002

## Title
Implement auth, org context and demo seed

## Story Type
Feature

## Value Intent
Allow controlled sign-in and seeded organization context so the product can be explored as a governed demo system.

## Summary
Implement Supabase auth, organization context and demo seed data so a user can log in and access a seeded demo workspace.

## Acceptance Criteria
- Supabase auth is wired through environment variables
- a login route exists
- a protected app layout exists
- protected routes require a valid session
- organization context is available server-side
- users, organizations and memberships are modeled
- demo roles exist:
  - value_owner
  - aida
  - aqa
  - architect
  - delivery_lead
  - builder
- seed script creates one demo organization
- seed script creates at least:
  - 1 draft outcome
  - 1 almost-ready outcome
  - 1 epic
  - 3 stories with mixed readiness
  - 1 tollgate case blocked by missing baseline
- seed script can be rerun without uncontrolled duplication

## AI Usage Scope
- CODE
- TEST

## Test Definition
- integration
- smoke

## Definition of Done
- login works locally or through a clearly marked demo-safe setup
- protected route requires session
- demo organization data loads for signed-in user
- organization context is explicit in server-side access paths
- seed script works repeatedly in development

## Scope In
- auth wiring
- session handling
- protected routes
- user/org/membership model
- role model
- demo seed data
- org context helper

## Scope Out
- enterprise SSO
- SCIM
- advanced invite flow
- production-grade identity administration

## File Targets
- `/apps/web/src/app/login/page.tsx`
- `/apps/web/src/app/(protected)/layout.tsx`
- `/apps/web/src/lib/auth/server.ts`
- `/apps/web/src/lib/auth/client.ts`
- `/apps/web/src/lib/auth/guards.ts`
- `/apps/web/src/lib/org-context.ts`
- `/packages/db/prisma/schema.prisma`
- `/packages/db/src/client.ts`
- `/packages/db/src/seed.ts`
- `/packages/domain/src/auth.ts`
- `/packages/domain/src/roles.ts`
- `/packages/domain/src/organization.ts`
- `/.env.example`
- `/README.md`

## Constraints
- auth may not live only in the client
- protected routes must be protected server-side
- org context must be explicit
- no enterprise auth complexity in M1
- role model must stay AAS-compatible

## Required Evidence
- auth architecture summary
- env variable list
- seed data summary
- short demo note for login + protected route