# Human Decisions and Stop Rules

This file defines what has already been approved by the human tollgate and what still requires explicit human decision.

## Decisions already approved
The following decisions are considered approved for implementation start:

### Product and governance
- The product is an **AAS Control Plane**
- AAS is the governing operating layer
- BMAD is the build execution method
- Human Mandate remains in force
- Value Spine is mandatory
- No AI-governed delivery without traceability

### AI level and maturity
- Initial operating AI level is **Level 2**
- Architecture should be **Level 3-ready**
- The system may accelerate later, but not before governance maturity is proven

### Product shape
- The system is **web-based**
- The UI should be **modern, clear, enterprise-usable**
- Desktop is the primary working environment
- Mobile in V1 is limited to overview and approvals

### Technical defaults
- Next.js App Router
- TypeScript
- Tailwind
- shadcn/ui
- Supabase
- Prisma
- PostHog
- OpenTelemetry
- Vercel

### Language
- Product/system language: **English**

---

## Human-only decisions
The following decisions may **not** be taken by AI roles or BMAD build roles:

### Governance
- Final outcome ownership
- Risk acceptance
- AI level changes
- Tollgate approvals
- Exception approval
- Release approval

### Scope and direction
- Change in product scope
- Change in architectural direction
- Change in governance model
- Change in multi-tenant strategy
- Change in auth strategy beyond approved defaults

### Policy
- Allowed vs prohibited AI tools
- Protected branch automation rights
- Production environment permissions
- Data visibility boundaries

---

## Mandatory stop rule

### Stop after M1-STORY-003
Implementation must stop after:
- M1-STORY-001
- M1-STORY-002
- M1-STORY-003

A human review must happen before continuing.

### Why this stop exists
Because after these three stories, the project has established:
- repo foundation
- auth and org context
- core persistence model

At that point, continuing without review creates unnecessary risk of:
- structural mistakes
- naming drift
- incorrect role modeling
- avoidable UI rework
- governance drift

---

## Human review checklist after M1-STORY-003

The human reviewer must check:

### Repository and platform
- Is the repo structure clean and scalable?
- Are package boundaries sensible?
- Are the scripts clear and reproducible?

### Auth and org model
- Is organization scoping explicit and safe?
- Are roles represented correctly?
- Is the protected route model acceptable?

### Domain model
- Are Outcome, Story and Tollgate modeled correctly?
- Are the status names clear?
- Are the fields aligned with AAS?
- Is traceability possible?

### Engineering quality
- Is TypeScript strict mode enforced?
- Are validation boundaries clear?
- Are repositories separated from UI?
- Are tests present and meaningful?

### Go / no-go decision
The human reviewer decides:
- continue into UI stories
- revise stories 001-003
- pause for architecture correction

---

## Non-negotiable implementation rules

### The build role may not:
- approve tollgates
- accept risk
- redefine outcome
- bypass Story-ID discipline
- remove audit or validation logic
- silently widen scope

### The build role must:
- work story by story
- name Story-ID in commits and summaries
- report deviations
- report unresolved questions
- stop when blocked by governance or architecture constraints