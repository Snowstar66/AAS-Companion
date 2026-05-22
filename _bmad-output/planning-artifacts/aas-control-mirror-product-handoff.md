---
artifact: product-handoff
feature: AAS Control Mirror
outcome_id: OUT-CM-001
source_reference: docs/features/aas-control-mirror.md
role: Product / PM / Value Owner Proxy
execution_mode: simulated role reasoning
created: 2026-05-21
status: complete-for-ux-and-architecture-handoff
depends_on:
  - _bmad-output/planning-artifacts/aas-control-mirror-analyst-handoff.md
---

# AAS Control Mirror - Product Handoff

## Execution Statement

This handoff was produced in simulated role reasoning by the same Codex session coordinating the BMAD run. It is not independent Product approval.

## Product Decision Frame

AAS Control Mirror exists to help delivery leaders and mandate holders decide whether AI-accelerated work should continue, pause, downgrade, request exception approval, or proceed toward release.

The product must answer the seven governing questions from `docs/features/aas-control-mirror.md`:

1. Are we designing the right thing against approved Framing?
2. Are we building the right thing against Outcome -> Epic -> Story -> Test?
3. How far have Design and Build progressed?
4. Which artifacts lack traceability?
5. What evidence supports the requested AI Acceleration Level?
6. What gaps require Human Review?
7. What is the actually achieved AI level based on evidence?

## Product Outcome

Outcome `OUT-CM-001` remains the governing outcome:

AAS Companion shall provide a parallel control function that verifies whether BMAD/AAS design and build artifacts remain aligned with approved Framing, Value Spine, AI Acceleration Level, risk posture and test evidence, enabling delivery leaders and mandate holders to make evidence-based decisions about continuing, pausing, downgrading or releasing AI-accelerated work.

## MVP Product Shape

The MVP should be a new governed workspace named either `Control Mirror` or `Delivery Conformance`. Product recommendation: use `Control Mirror` as the visible navigation label and `Delivery Conformance` as explanatory vocabulary inside the page.

The first release should support one active AAS project context and one current Control Mirror snapshot at a time, with previous snapshots visible enough to understand refresh history.

## MVP Backlog Priority

Use the backlog order from the governing reference:

| Priority | Story | Product rationale |
| --- | --- | --- |
| 1 | CM-01.1 Connect project root | Establishes source registration and user mandate to scan. |
| 2 | CM-01.2 Refresh project snapshot | Makes Control Mirror ongoing rather than one-time import. |
| 3 | CM-01.3 Create artifact manifest | Core evidence substrate for all later conformance. |
| 4 | CM-02.1 Normalize BMAD artifacts | Converts source files into AAS-governable concepts. |
| 5 | CM-03.1 Compare design against Framing | Protects Outcome-before-output. |
| 6 | CM-03.3 Requested vs Achieved AI Level | Prevents Level 2/3 overstatement. |
| 7 | CM-04.1 Design Progress | Shows whether design is ready for build. |
| 8 | CM-05.1 Right-built detection | Answers whether build output maps to Value Spine. |
| 9 | CM-06.2 Test Evidence Coverage | Makes verification visible. |
| 10 | CM-08.1 Executive Dashboard | Gives mandate holders an operating view. |
| 11 | CM-09.1 Control Mirror Report | Packages decisions and evidence. |

## Release Readiness Decision Needs

Release readiness must be one of:

- Ready
- Conditional
- Blocked
- Downgrade required
- Human approval required

Every recommendation must include:

- Reason.
- Blocking gaps.
- Residual risks.
- Required approvals.
- Suggested next action.
- Evidence references.

Ready must be impossible when release-impacting implementation artifacts are untraced, required test evidence is missing, or residual risk lacks human acceptance.

## Executive Dashboard Requirements

The dashboard must show:

- Framing Alignment percentage.
- Value Spine Coverage percentage.
- Design Readiness percentage.
- Build Conformance percentage.
- Test Evidence Coverage percentage.
- Untraced Artifact Count.
- Scope Drift Count.
- Open Human Review Items.
- Requested AI Level.
- Achieved AI Level.
- Release Readiness.

Each aggregate must drill down to underlying artifacts, checks and Human Review needs. No percentage should be presented without visible explanation of how it was calculated.

## Human Review Decision Categories

Human Review is required or recommended for:

- Scope drift.
- Untraced implementation artifact.
- Missing test evidence on release-impacting Story.
- AI level evidence mismatch.
- Unaccepted risk.
- Architecture deviation.
- Security or data concern.
- Material UX impact.
- Release blocker.

Decision responses:

- APPROVE
- APPROVE WITH CONDITION
- REJECT
- DEFER
- REQUEST CHANGE

## Product Guardrails

- AI must not approve release.
- AI must not accept residual risk.
- AI must not override approved scope-out.
- AI must not claim Level 2 or Level 3 without required evidence.
- Untraced runtime/application artifacts are delivery or release risk until classified.
- Final reporting must distinguish requested AI level from achieved AI level.

## MVP Acceptance Policy

For the MVP to be acceptable:

- Users can register or upload a source.
- A snapshot and artifact manifest are created.
- Artifacts are classified and normalized.
- Design artifacts are compared with approved Framing.
- Build artifacts can be classified as right-built, weakly traced, unverified or untraced.
- Test evidence coverage is calculated.
- Requested and achieved AI level are shown separately.
- Critical gaps create or suggest Human Review items.
- Executive dashboard exists.
- Control report can be generated.

## Product Open Questions For UX And Architecture

| Question | Why it matters |
| --- | --- |
| Should first MVP support uploaded zip, manual files, or both? | Determines first source registration UX and backend scope. |
| Should snapshot history be visible in the first dashboard or only current snapshot? | Affects trust and refresh mental model. |
| Should Human Review items be real persisted review records in MVP or generated report actions first? | Affects data model and workflow integration. |
| What is the minimum useful drill-down for executives? | Prevents shallow metrics. |
| How should achieved AI level be worded when evidence is partial? | Avoids false assurance. |

## Handoff To UX

UX should design a control-plane workspace that makes the current conformance state scannable, lets users drill from aggregate score to artifact evidence, and makes Human Review decisions close to the detected gap.

## Handoff To Architecture

Architecture should define snapshot, manifest, normalization, conformance checks, AI-level evidence rules, refresh model, persistence boundaries and local scanning constraints before any development story is created.
