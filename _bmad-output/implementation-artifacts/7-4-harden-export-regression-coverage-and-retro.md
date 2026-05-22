# Story 7.4: Harden Export Regression Coverage and Retro

Status: done

## Story

As a Delivery Lead,
I want export regression coverage and lessons captured,
so that the next slice can build on a known stable export contract.

## Acceptance Criteria

1. Given JSON and Markdown exports exist, when targeted tests run, then route, payload and page disclosure coverage all pass.
2. Given Epic 7 is complete, when retrospective is written, then follow-up risks and next recommendations are captured.
3. Given build validation runs, when the web app builds, then the export route remains included.

## Tasks / Subtasks

- [x] Harden export regression coverage (AC: 1)
  - [x] Cover the `format=md` route alias.
  - [x] Run JSON payload, Markdown payload, filename/version, route and page disclosure tests together.
- [x] Run build validation (AC: 3)
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm --filter @aas-companion/web build`
- [x] Complete Epic 7 retrospective (AC: 2)
  - [x] Create Epic 7 retro with outcomes, risks and recommended next slice.
  - [x] Mark Epic 7 and retrospective complete in sprint status.

## Dev Notes

Story 7.4 should close Epic 7 with regression validation and retrospective capture. Keep code changes limited to missing regression coverage discovered during this story.

Important boundaries:

- Do not add new export formats.
- Do not change export payload schema unless tests expose a defect.
- Keep retrospective concise and actionable.

### Project Structure Notes

- Route tests: `apps/web/src/test/control-mirror-export-route.test.ts`
- Export tests: `apps/web/src/test/control-mirror-evidence-pack.test.ts`, `apps/web/src/test/control-mirror-evidence-pack-markdown.test.ts`, `apps/web/src/test/control-mirror-evidence-pack-format.test.ts`
- Page disclosure tests: `apps/web/src/test/control-mirror-page.test.tsx`
- Retro: `_bmad-output/implementation-artifacts/epic-7-retro-2026-05-22.md`

### References

- [Epic 7 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-7-evidence-pack-route-and-format-hardening.md)
- [Story 7.1](_bmad-output/implementation-artifacts/7-1-add-evidence-pack-export-route-tests.md)
- [Story 7.2](_bmad-output/implementation-artifacts/7-2-add-markdown-evidence-pack-export-format.md)
- [Story 7.3](_bmad-output/implementation-artifacts/7-3-harden-export-filename-and-version-metadata.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 7 backlog.
- Started export regression hardening and Epic 7 closure.
- `pnpm test -- src/test/control-mirror-evidence-pack.test.ts src/test/control-mirror-evidence-pack-markdown.test.ts src/test/control-mirror-evidence-pack-format.test.ts src/test/control-mirror-export-route.test.ts src/test/control-mirror-page.test.tsx` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 11 tests across 5 files. Existing React non-boolean attribute warnings remain.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.
- Epic 7 retrospective created.

### Completion Notes List

- Added `format=md` alias regression coverage for Markdown route exports.
- Ran the combined export regression suite across JSON payload, Markdown payload, filename/version metadata, route behavior and page disclosure.
- Completed Epic 7 retrospective with residual risks and recommended next options.

### File List

- `_bmad-output/implementation-artifacts/7-4-harden-export-regression-coverage-and-retro.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/epic-7-retro-2026-05-22.md`
- `apps/web/src/test/control-mirror-export-route.test.ts`

## Change Log

- 2026-05-22: Created and started Story 7.4 export regression coverage and retro.
- 2026-05-22: Hardened export regression coverage and completed Epic 7 retrospective.
