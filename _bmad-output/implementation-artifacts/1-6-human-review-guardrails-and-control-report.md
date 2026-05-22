# Story 1.6: Human Review, Guardrails and Control Report

Status: done

## Story

As a mandate holder, I want critical conformance gaps turned into auditable Human Review items and a Control Mirror report so that proceed, pause, downgrade or release recommendations are evidence-based.

## Acceptance Criteria

- [x] Given Control Mirror detects a critical conformance gap, when the gap requires a human decision, then a Human Review item is persisted or linked with decision format and affected Outcome/Epic/Story.
- [x] Given conformance checks have run, when I generate a Control Mirror report, then it includes active project, approved Framing version, snapshot id, requested AI level, achieved AI level, evidence summaries, open Human Review items and recommended next control step.
- [x] Given requested AI level is Level 2 or Level 3, when commercial guardrails are checked, then missing baseline, Value Spine, risk ledger, mandate, AIDA/AQA capacity, test evidence or governance funding evidence is flagged.

## Tasks / Subtasks

- [x] Extend Control Mirror domain model with guardrail findings, linked Human Review decision format and report-ready summary.
- [x] Include Value Owner / mandate data in the Control Mirror read model.
- [x] Render guardrails, enriched Human Review items and report preview in the Control Mirror page.
- [x] Add focused domain and page coverage for guardrail flags, linked review items and report fields.
- [x] Run targeted tests and production build.

## Dev Agent Record

### Implementation Notes

- Human Review items are linked to the existing `/review` surface with stable Control Mirror item identifiers and source finding ids. No new persistence table was introduced for MVP because the acceptance criterion allows persisted or linked items, and the current review model is tollgate/signoff centered.
- Guardrails are checked only for requested Level 2 or Level 3 claims. Level 3 additionally requires AIDA/AQA capacity evidence.
- The report preview is generated from the same deterministic dashboard data so the displayed recommendation, blocking gaps and evidence summaries cannot drift from the calculated Control Mirror state.

### Debug Log

- `pnpm build:web-runtime-packages` initially failed because report summary status literals were widened to `string`; fixed by typing the summary array as `ControlMirrorReportSummaryItem[]`.
- The first sandboxed Vitest run failed because Windows sandboxing denied access to `vitest.config.ts`; reran the same command with approved escalation.
- Page test needed `getAllByText` for `level 2` / `level 3` after guardrail rows made those labels visible in multiple places.

### Completion Notes

- Control Mirror now flags missing baseline, Value Spine, risk ledger, mandate, AIDA/AQA capacity, test evidence and governance funding evidence for higher AI-level claims.
- Human Review recommendations now include source finding linkage, affected object, concise decision format, alternatives, risks and a `/review` link.
- Control report preview now includes active project, Framing version, snapshot id, AI levels, release readiness, review counts, scope drift, untraced artifacts, risk/decision summaries and blocking gaps.

### File List

- `packages/domain/src/control-mirror.ts`
- `packages/db/src/repositories/control-mirror-repository.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `_bmad-output/implementation-artifacts/1-6-human-review-guardrails-and-control-report.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-21: Implemented Story 1.6 guardrails, linked Human Review decision format and report preview.

## Verification

- `pnpm build:web-runtime-packages` - passed
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - passed, 11 tests
- `pnpm --filter @aas-companion/web build` - passed
