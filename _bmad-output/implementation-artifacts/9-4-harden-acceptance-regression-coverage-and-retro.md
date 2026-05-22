# Story 9.4: Harden Acceptance Regression Coverage and Retro

Status: done

## Story

As an AQA,
I want acceptance policy coverage and lessons captured,
so that export governance remains reliable.

## Acceptance Criteria

1. Given acceptance policy and decisions exist, when targeted tests run, then payload, Markdown, UI and persistence coverage all pass.
2. Given build validation runs, when the web app builds, then export routes remain included.
3. Given Epic 9 is complete, when retrospective is written, then follow-up risks and next recommendations are captured.

## Tasks / Subtasks

- [x] Run acceptance/export regression gate (AC: 1)
  - [x] Run payload and Markdown evidence pack tests.
  - [x] Run export route, download route, download service and persistence/history tests.
  - [x] Run Control Mirror page acceptance-history tests.
- [x] Run build validation (AC: 2)
  - [x] Build runtime packages.
  - [x] Build web app and verify export routes remain listed.
- [x] Capture Epic 9 retrospective (AC: 3)
  - [x] Summarize completed stories and validation.
  - [x] Capture lessons, residual risks and action items.
  - [x] Mark Epic 9 retrospective complete in sprint status.

## Dev Notes

Story 9.4 should not add new feature scope. If regression catches a small defect directly related to Epic 9, fix it and document it.

Important boundaries:

- Keep verification focused on acceptance policy, persisted decisions, export routes and Control Mirror export UI.
- Do not introduce new product workflow beyond the existing acceptance decision events.
- Preserve known non-blocking warning notes rather than treating warning cleanup as part of this story.

### Project Structure Notes

- Evidence pack tests: `apps/web/src/test/control-mirror-evidence-pack*.test.ts`
- Export tests: `apps/web/src/test/control-mirror-export*.test.ts`
- Page test: `apps/web/src/test/control-mirror-page.test.tsx`
- Retrospective output: `_bmad-output/implementation-artifacts/epic-9-retro-2026-05-22.md`

### References

- [Epic 9 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-9-product-security-acceptance.md)
- [Story 9.1](_bmad-output/implementation-artifacts/9-1-add-evidence-pack-product-security-acceptance-policy.md)
- [Story 9.2](_bmad-output/implementation-artifacts/9-2-record-export-acceptance-decisions.md)
- [Story 9.3](_bmad-output/implementation-artifacts/9-3-gate-external-sharing-copy-on-acceptance.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 9 backlog and started.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-evidence-pack-markdown.test.ts src/test/control-mirror-evidence-pack-format.test.ts src/test/control-mirror-export-route.test.ts src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-export-download-service.test.ts src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 8 files and 22 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Ran the full Epic 9 acceptance/export regression gate across evidence pack payload, Markdown, routes, persisted download service, export history and page UI.
- Confirmed production build includes Control Mirror export and persisted export download routes.
- Wrote Epic 9 retrospective with completed stories, validation, residual risks and next recommendations.

### File List

- `_bmad-output/implementation-artifacts/9-4-harden-acceptance-regression-coverage-and-retro.md`
- `_bmad-output/implementation-artifacts/epic-9-retro-2026-05-22.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-22: Created and started Story 9.4 acceptance regression and retrospective.
- 2026-05-22: Completed Epic 9 regression gate and retrospective.
