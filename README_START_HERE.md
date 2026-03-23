# AAS BMAD Build Pack — Start Here

This package contains the build instructions for an AAS-governed Control Plane built with BMAD execution discipline.

## What this is
A web-based control plane for:
- Framing
- Design
- Tollgates
- Value Spine
- AI Governance
- Build Handoff to external AI tools

## Governing model
- **AAS** governs outcome, risk, traceability, tollgates, AI level, and human mandate.
- **BMAD** governs how the build work is executed.
- **AI tools** are execution engines, not governance owners.

## Approved defaults
The following defaults are approved for implementation start:
- AI Acceleration Level: **Level 2**
- Architecture target: **Level 3-ready**
- UI: **web-based**
- UX direction: **hybrid modern SaaS + enterprise clarity**
- Primary device: **desktop**
- Mobile scope in V1: **overview + approvals only**
- System language: **English**
- Stack defaults:
  - Next.js App Router
  - TypeScript
  - Tailwind
  - shadcn/ui
  - Supabase
  - Prisma
  - PostHog
  - OpenTelemetry
  - Vercel

## Read these files first
1. `HUMAN_DECISIONS_AND_STOP_RULES.md`
2. `CODEX_READY_TASK_PACK_M1_001_003.md`
3. `M1_STORY_PACK.md`
4. `FULLSTACK_BUILD_PACK.md` (if included)

## Start order
Start with:
- `M1-STORY-001`
- then `M1-STORY-002`
- then `M1-STORY-003`

## Mandatory stop rule
**Do not proceed past M1-STORY-003 without human review and approval.**

## Do not change on your own
The BMAD/AI build role may not change:
- governance model
- AI level
- tollgate logic
- outcome definition
- risk acceptance
- scope boundaries

## Delivery discipline
Every coding session must:
- reference Story-ID
- restate scope
- list impacted files
- include tests where relevant
- report deviations explicitly

## Goal of M1
Create the first usable slice where a user can:
- log in
- access demo org context
- view the Home dashboard
- work with an Outcome
- experience Tollgate 1 blocking when baseline is missing
- work with a Story
- experience Story validation blocking when Test Definition is missing
- preview an Execution Contract

## Human operator note
After M1-STORY-003, stop and review:
- repo structure
- auth/org model
- core schema
- naming consistency
- implementation quality
- whether to continue into UI stories