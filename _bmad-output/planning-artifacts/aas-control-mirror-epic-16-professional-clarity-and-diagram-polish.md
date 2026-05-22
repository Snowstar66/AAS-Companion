# Epic 16: Professional Clarity and Diagram Polish

Date: 2026-05-22
Status: done

## Epic Goal

Make Control Mirror clear enough for executive review and professional enough for UX handoff by replacing generic logical diagrams with decision-oriented diagrams that show system boundaries, evidence flow, human authority, AI-level downgrade logic and release-readiness lifecycle.

## Problem

The previous Control Mirror reference pack was implementation-ready, but its diagrams were mostly generic Mermaid flowcharts. They were useful for agent reasoning, yet not strong enough as a polished UX and stakeholder communication layer.

## Acceptance Criteria

1. Given a stakeholder opens the Control Mirror reference pack, when they read the diagram section, then they can understand source boundary, mandate baseline, Control Mirror checks, decision surfaces and human authority.
2. Given UX or implementation agents use the handoff, when they design the dashboard, then first-viewport quality requirements are explicit and evidence-backed.
3. Given AI level claims are evaluated, when evidence is missing, then downgrade logic and Human Review responsibility are visible.
4. Given release evidence is exported, when the lifecycle is reviewed, then acceptance, download audit, retention and archive states are understandable.
5. Given the Value Spine view is designed, when untraced artifacts exist, then they are visibly outside the approved spine with mapping/review actions.

## Stories

### 16.1 Rewrite Control Mirror diagrams into executive-grade Mermaid set

Status: done

Replace generic diagrams with a polished set covering:

- System boundary and trust model.
- Human Review decision flow.
- AI level evidence and downgrade logic.
- Evidence pack lifecycle.
- Design evidence pipeline.
- Build conformance decision flow.
- Executive dashboard first viewport.
- Value Spine coverage map.

### 16.2 Apply executive UX quality bar to Control Mirror page

Status: done

Bring the same quality bar into the running page:

- Add first-viewport signals for source judged, control posture, human decisions and evidence gaps.
- Show evidence gaps as risk before the user opens detailed tables.
- Show untraced artifacts outside the Value Spine in the page diagram.
- Add regression assertions so the cockpit cues remain visible.

### 16.3 Add browser UX QA for Control Mirror cockpit

Status: done

Add Playwright coverage for the professional UX bar:

- Verify desktop first viewport shows source judged, control posture, human decisions and evidence gaps.
- Verify mobile layout remains usable without horizontal overflow.
- Verify the Value Spine SVG renders and shows untraced artifacts outside the spine.
- Add a Playwright config fallback for local installed Chrome when bundled Playwright browsers are unavailable.

## Verification Plan

- Run `git diff --check`.
- Count Mermaid fences and inspect changed diagram blocks.
- No app build is required for documentation-only diagram changes.
