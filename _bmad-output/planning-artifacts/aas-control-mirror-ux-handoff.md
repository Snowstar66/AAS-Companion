---
artifact: ux-handoff
feature: AAS Control Mirror
outcome_id: OUT-CM-001
source_reference: docs/features/aas-control-mirror.md
role: UX Designer
execution_mode: simulated role reasoning
created: 2026-05-21
status: complete-for-architecture-handoff
depends_on:
  - _bmad-output/planning-artifacts/aas-control-mirror-analyst-handoff.md
  - _bmad-output/planning-artifacts/aas-control-mirror-product-handoff.md
---

# AAS Control Mirror - UX Handoff

## Execution Statement

This handoff was produced in simulated role reasoning by the same Codex session coordinating the BMAD run. It is not an independent UX approval.

Mermaid diagrams in `docs/features/aas-control-mirror.md` are treated as logical structure sketches only. They are not screenshots and should not be copied as final visual layout.

## UX Intent

Control Mirror should feel like an operational evidence cockpit inside AAS Companion. The user should immediately understand whether the delivery is aligned, traceable, verified and safe to continue.

The experience should stay consistent with `docs/aas-companion-ux-spec.md`: dark sidebar, calm control-plane shell, rounded main surface, restrained status colors, visible source lineage, and guidance that supports method understanding without becoming page documentation.

## Executive UX Quality Bar

The first viewport must answer four questions without requiring the user to interpret raw data:

- What source snapshot is being judged?
- What is aligned, weak, blocked or unknown?
- Which human decisions are required before progress or release?
- What is the safest next control step?

Design quality requirements:

- Every score or status must have a visible path to evidence: source file, snapshot id, affected Outcome/Epic/Story/Test and confidence.
- Amber and red states must include a reason and a recommended action, not only a label.
- Unknown evidence must be treated as risk until classified.
- Untraced artifacts must be visually outside the Value Spine, with direct actions to map, classify or send to Human Review.
- Requested AI level and achieved AI level must sit side by side with downgrade reasons visible.
- The dashboard must never imply AI approval; it can recommend control posture, while approval remains a human decision.
- Dense operational views should use tables, rows and compact badges rather than decorative cards.

## Information Architecture

Add `Control Mirror` as a governed workspace near Import, Human Review, Governance and Value Spine.

Recommended page structure:

1. Snapshot Source
2. Executive Conformance Summary
3. Value Spine Coverage
4. Design Progress
5. Build Conformance
6. Test Evidence
7. AI Level Evidence
8. Human Review Items
9. Control Report

Tabs or segmented controls may be used for the detailed sections. The first screen should show the executive summary and source state, not a marketing hero.

## Primary User Flow

1. User opens Control Mirror for active project.
2. User registers or refreshes a project source.
3. System creates snapshot and artifact manifest.
4. Dashboard shows conformance summary with blockers and unknowns.
5. User drills into a metric, broken link, artifact or Human Review item.
6. User records decisions or exports a Control Report.

## First Screen Layout

The first viewport should contain:

- Page title: `Control Mirror`.
- Active project and approved Framing version.
- Snapshot status and refresh action.
- Requested AI level and achieved AI level.
- Release readiness recommendation.
- Key metric tiles:
  - Framing Alignment
  - Value Spine Coverage
  - Design Readiness
  - Build Conformance
  - Test Evidence
  - Human Review blockers
- A short source manifest summary.

Use the AAS Companion workspace panel pattern, not a landing-page hero.

## Source Registration UX

Source registration should present source options as clear operational choices:

- Upload zip.
- Folder snapshot.
- Git/repository root.
- Manual artifact upload.

Each option should show:

- What will be scanned.
- Whether refresh is supported.
- Security/privacy note.
- Current support status.

Unsupported or deferred source types can appear disabled with an explanation if Product chooses a smaller MVP.

## Dashboard States

Use status language consistently:

- Aligned
- Partially aligned
- Weak value alignment
- Potential scope drift
- Out of scope
- Needs human review
- Right Built
- Built but Unverified
- Built but Weakly Traced
- Untraced Artifact
- Release Risk

Color should assist but not carry meaning alone. Pair amber/red states with icons and explicit text.

## Drill-Down Patterns

Every metric tile should open a details view with:

- Check name.
- Status.
- Affected Outcome/Epic/Story/Test.
- Evidence source path.
- Snapshot id.
- Confidence.
- Human Review recommendation if applicable.

Broken Value Spine links should show the missing link explicitly:

- Outcome missing Epic.
- Epic missing Story.
- Story missing Acceptance Criteria.
- Story missing Test Definition.
- Story missing Test Evidence.
- Implementation missing Story-ID.

## Visualizing Design Progress

Use a pipeline or grouped columns:

- Story Idea
- Classified
- Refined Story
- Acceptance Criteria
- Test Definition
- Architecture / UX Review
- Ready for Build
- Blocked

Items should be cards or rows with stable badges for Outcome, Epic, Story ID, source file and current blocker.

Use the professional Mermaid diagrams in `docs/features/aas-control-mirror.md` as logical UX references. They define the intended evidence flow, decision posture and exception handling, but the final UI should translate them into compact cockpit controls rather than displaying large diagrams as the primary interface.

## Visualizing Build Conformance

Build Conformance should be a table-first view with filtering:

- Artifact path.
- Artifact type.
- Story-ID.
- Epic/Outcome mapping.
- Acceptance criteria status.
- Test evidence status.
- Risk status.
- Conformance status.

The logical flow from the reference diagram can be presented as compact check progression inside the details panel, not necessarily as a large diagram.

## Human Review UX

Human Review items should be decision cards with:

- Decision needed.
- Recommended option.
- Why this creates value.
- Alternatives.
- Risk if approved.
- Risk if not approved.
- Affected Outcome/Epic/Story.
- Whether it blocks implementation or release.
- Suggested response.

Decision buttons should use the standard review vocabulary: Approve, Approve with condition, Reject, Defer, Request change.

## Report UX

Control Report generation should show a preview before export:

- Active project.
- Approved Framing version.
- Snapshot id.
- Requested AI level.
- Achieved AI level.
- Summary metrics.
- Open Human Review items.
- Scope drift items.
- Untraced artifacts.
- AI Risk Ledger summary.
- Decision Log summary.
- Recommended next control step.

Do not label the report as release approval.

## Accessibility And Responsive Notes

- Metric tiles must wrap without text overflow.
- Long file paths need truncation with full path available in details.
- Status tables need mobile card fallback.
- Do not rely on color alone.
- Keep navigation and filters reachable on small screens.
- Avoid nested cards unless representing repeated artifacts within a details panel.

## UX Open Questions For Architecture

| Question | UX impact |
| --- | --- |
| Which source types are real in MVP? | Determines source registration controls and empty states. |
| Are Human Review items persisted? | Determines whether the UX routes into existing Human Review or a Control Mirror-specific queue. |
| Can the system retain file contents, excerpts, or hashes only? | Determines evidence preview behavior. |
| Can conformance checks run synchronously after upload? | Determines loading/progress state. |
| What is the exact confidence model? | Determines score and badge language. |

## Handoff To Architecture

Architecture should define the data objects and service boundaries so UX can map each visible status to a durable source of truth. The UI must never invent conformance state from presentation-only logic.
