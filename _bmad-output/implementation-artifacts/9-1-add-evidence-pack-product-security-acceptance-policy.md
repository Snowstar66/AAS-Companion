# Story 9.1: Add Evidence Pack Product/Security Acceptance Policy

Status: done

## Story

As a governance reviewer,
I want each evidence pack to disclose Product/Security acceptance requirements,
so that persisted exports are not shared as approved artifacts before the right review happens.

## Acceptance Criteria

1. Given an evidence pack is built, when the payload is inspected, then it includes Product/Security acceptance status, required reviewers and checklist items.
2. Given Markdown export is built, when it is inspected, then acceptance requirements are rendered without raw source text.
3. Given Control Mirror renders the report/export area, when export guidance is visible, then Product/Security acceptance status and required review surfaces are visible.

## Tasks / Subtasks

- [x] Add domain acceptance policy (AC: 1)
  - [x] Add deterministic Product/Security acceptance block to evidence pack payload.
  - [x] Include required reviewers, checklist items and sharing disclosure.
  - [x] Keep raw source text excluded.
- [x] Render acceptance policy in Markdown and UI (AC: 2, 3)
  - [x] Add Markdown section for Product/Security acceptance.
  - [x] Show acceptance status and checklist near export guidance on Control Mirror.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-evidence-pack-markdown.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 9.1 should add acceptance posture only. Do not add acceptance decision persistence yet.

Important boundaries:

- Do not add new database tables in this story.
- Do not mark exports accepted automatically.
- Do not include raw source text.
- Preserve existing JSON/Markdown routes and persisted export history.

### Project Structure Notes

- Domain model: `packages/domain/src/control-mirror-report.ts`
- Page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-evidence-pack.test.ts`, `apps/web/src/test/control-mirror-evidence-pack-markdown.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 9 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-9-product-security-acceptance.md)
- [Epic 8 retro](_bmad-output/implementation-artifacts/epic-8-retro-2026-05-22.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 9 backlog.
- Started Product/Security acceptance policy implementation.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-evidence-pack-markdown.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 5 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including export routes. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added deterministic Product/Security acceptance policy to evidence pack payloads.
- Added Markdown Product/Security Acceptance section.
- Added Control Mirror UI panel showing acceptance status, required reviewers and checklist.
- Added regression coverage for payload, Markdown and page disclosure.

### File List

- `_bmad-output/implementation-artifacts/9-1-add-evidence-pack-product-security-acceptance-policy.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/aas-control-mirror-epic-9-product-security-acceptance.md`
- `packages/domain/src/control-mirror-report.ts`
- `packages/domain/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-evidence-pack.test.ts`
- `apps/web/src/test/control-mirror-evidence-pack-markdown.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 9.1 acceptance policy.
- 2026-05-22: Added evidence pack Product/Security acceptance policy.
