---
title: 'Control Mirror MVP'
type: 'feature'
created: '2026-05-21'
status: 'done'
baseline_commit: '242ab545258ec5ff7f48e7f76932db0ee89e3586'
context:
  - docs/features/aas-control-mirror.md
  - _bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md
  - docs/aas-companion-ux-spec.md
---

# Control Mirror MVP

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** AAS Companion has governed Framing, Import, Human Review, Governance and Value Spine surfaces, but no Control Mirror workspace that summarizes whether downstream design/build evidence is aligned, traced, verified and safe to continue.

**Approach:** Implement a first Control Mirror slice without new persistence: derive a conformance dashboard from existing Outcome/Epic/Story, Artifact Intake, Tollgate and Signoff data. Keep source registration honest by linking to existing Import for manual artifacts and marking zip/folder/Git refresh as planned source modes.

## Boundaries & Constraints

**Always:** preserve tenant scope via `organizationId`; distinguish requested AI level from achieved AI level; treat untraced or unverified work as review/release risk; keep implementation traceable to Control Mirror planning artifacts; reuse existing AAS UI shell and navigation.

**Ask First:** adding a Prisma migration; adding new dependencies; executing uploaded code; claiming persisted snapshot refresh or automatic release approval.

**Never:** implement AI release approval, accept residual risk automatically, hide missing evidence behind green aggregate scores, or treat Mermaid diagrams as screenshots.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Existing governed project | Outcomes, epics, stories, intake sessions and tollgates exist | Control Mirror route shows source summary, conformance metrics, evidence checks, Human Review needs and report preview | Missing optional evidence lowers achieved level or readiness instead of throwing |
| No project data | Organization exists but no spine/import data exists | Dashboard renders an empty conformance state with calls to Import/Framing | Service returns an empty state rather than crashing |
| Level 3 requested without evidence | Outcome requests level 3 but handoffs/signoffs/workflow evidence are missing | Achieved level is lower and downgrade/review guidance is visible | Missing evidence becomes Human Review item |

</frozen-after-approval>

## Code Map

- `packages/domain/src/control-mirror.ts` -- deterministic conformance calculation and types.
- `packages/db/src/repositories/control-mirror-repository.ts` -- tenant-scoped read model from existing tables.
- `packages/api/src/control-mirror.ts` -- service wrapper and API export.
- `apps/web/src/app/(protected)/control-mirror/page.tsx` -- new workspace route.
- `packages/domain/src/navigation.ts`, `apps/web/src/components/layout/sidebar.tsx`, `apps/web/src/components/layout/app-language.data.ts` -- navigation entry.
- `apps/web/src/test/control-mirror-page.test.tsx`, `apps/web/src/test/control-mirror-rules.test.ts` -- coverage.

## Tasks & Acceptance

**Execution:**
- [ ] `packages/domain/src/control-mirror.ts` -- add scoring, achieved AI level and Human Review recommendation rules.
- [ ] `packages/domain/src/index.ts` -- export Control Mirror domain functions.
- [ ] `packages/db/src/repositories/control-mirror-repository.ts` and `packages/db/src/index.ts` -- add read model over existing project, intake, tollgate and signoff tables.
- [ ] `packages/api/src/control-mirror.ts` and `packages/api/src/index.ts` -- expose tenant-scoped service result.
- [ ] `apps/web/src/app/(protected)/control-mirror/page.tsx` -- implement dashboard using existing AppShell, cards, badges, tables and links.
- [ ] Navigation files -- add Control Mirror route and localized copy.
- [ ] Tests -- add domain rule tests and page render tests.

**Acceptance Criteria:**
- Given an active project exists, when the user opens `/control-mirror`, then they see Control Mirror as a governed workspace with requested AI level, achieved AI level and release readiness.
- Given story or test evidence is missing, when conformance is calculated, then the dashboard shows gaps and Human Review recommendations instead of green readiness.
- Given existing artifact intake sessions exist, when the dashboard loads, then source/manifest summary reflects scanned files and candidate state from existing intake data.

## Spec Change Log

## Verification

**Commands:**
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` -- expected: new rule and page tests pass.
- `pnpm --filter @aas-companion/web build` -- expected: Next build succeeds after runtime package sync.
