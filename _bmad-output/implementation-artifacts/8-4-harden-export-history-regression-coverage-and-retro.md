# Story 8.4: Harden Export History Regression Coverage and Retro

Status: done

## Story

As an AQA,
I want export history coverage and lessons captured,
so that persisted audit artifacts remain reliable.

## Acceptance Criteria

1. Given export history is implemented, when targeted tests run, then create, list and re-download flows are covered.
2. Given build validation runs, when the web app builds, then export routes remain included.
3. Given Epic 8 is complete, when retrospective is written, then follow-up risks and next recommendations are captured.

## Tasks / Subtasks

- [x] Run combined export history regression (AC: 1)
  - [x] Cover evidence pack payload and Markdown serialization.
  - [x] Cover export creation route, persisted download route, repository create/list/get and page history disclosure.
- [x] Run build validation (AC: 2)
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm --filter @aas-companion/web build`
- [x] Complete Epic 8 retrospective (AC: 3)
  - [x] Create Epic 8 retro with outcomes, risks and recommended next slice.
  - [x] Mark Epic 8 and retrospective complete in sprint status.

## Dev Notes

Story 8.4 should close Epic 8 with regression validation and retrospective capture. Keep code changes limited to any regression gaps discovered during this story.

Important boundaries:

- Do not add delete/edit lifecycle for export history.
- Do not add new export formats.
- Keep retrospective actionable and focused on persisted audit history.

### Project Structure Notes

- Export tests: `apps/web/src/test/control-mirror-evidence-pack*.test.ts`, `apps/web/src/test/control-mirror-export*.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`
- Retro: `_bmad-output/implementation-artifacts/epic-8-retro-2026-05-22.md`

### References

- [Story 8.1](_bmad-output/implementation-artifacts/8-1-add-evidence-pack-export-history-persistence.md)
- [Story 8.2](_bmad-output/implementation-artifacts/8-2-list-recent-evidence-pack-exports.md)
- [Story 8.3](_bmad-output/implementation-artifacts/8-3-redownload-persisted-evidence-pack-exports.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 8 backlog.
- Started export history regression hardening and Epic 8 closure.
- `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-evidence-pack-markdown.test.ts src/test/control-mirror-evidence-pack-format.test.ts src/test/control-mirror-export-route.test.ts src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-export-history.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 18 tests across 7 files. Existing React non-boolean attribute warnings remain.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.
- Epic 8 retrospective created.

### Completion Notes List

- Ran combined export history regression across payload, Markdown, format metadata, export route, persisted download route, repository history and page disclosure.
- Completed Epic 8 retrospective with residual risks and recommended next options.

### File List

- `_bmad-output/implementation-artifacts/8-4-harden-export-history-regression-coverage-and-retro.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/epic-8-retro-2026-05-22.md`

## Change Log

- 2026-05-22: Created and started Story 8.4 export history regression coverage and retro.
- 2026-05-22: Completed export history regression gate and Epic 8 retrospective.
