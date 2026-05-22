# Story 7.3: Harden Export Filename and Version Metadata

Status: done

## Story

As an AQA,
I want deterministic filename and version behavior,
so that exported artifacts remain auditable across snapshots and future schema changes.

## Acceptance Criteria

1. Given project or snapshot names contain unsafe characters, when an export filename is built, then the filename is sanitized and stable.
2. Given an export is generated, when the payload is inspected, then schema version and generated timestamp remain present.
3. Given tests need deterministic timestamps, when the export builder is called with an injected timestamp, then the payload uses that timestamp.

## Tasks / Subtasks

- [x] Add filename helper coverage (AC: 1)
  - [x] Cover unsafe project/snapshot characters.
  - [x] Cover fallback filename parts for blank project/snapshot values.
  - [x] Use the shared helper from the export route.
- [x] Add version/timestamp metadata coverage (AC: 2, 3)
  - [x] Assert schema version remains present.
  - [x] Assert injected string timestamp is preserved.
  - [x] Assert injected Date timestamp is converted deterministically.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-evidence-pack-format.test.ts src/test/control-mirror-export-route.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 7.3 should harden existing export behavior without changing the default JSON route or the Markdown format added in Story 7.2.

Important boundaries:

- Do not add persisted export history in this story.
- Do not expose test-only generated timestamps through the public web route.
- Keep filename behavior shared between JSON and Markdown route responses.

### Project Structure Notes

- Domain helper: `packages/domain/src/control-mirror-report.ts`
- Domain exports: `packages/domain/src/control-mirror.ts`
- Export route: `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- Tests: `apps/web/src/test/control-mirror-evidence-pack-format.test.ts`, `apps/web/src/test/control-mirror-export-route.test.ts`

### References

- [Epic 7 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-7-evidence-pack-route-and-format-hardening.md)
- [Story 7.1](_bmad-output/implementation-artifacts/7-1-add-evidence-pack-export-route-tests.md)
- [Story 7.2](_bmad-output/implementation-artifacts/7-2-add-markdown-evidence-pack-export-format.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 7 backlog.
- Started filename/version metadata hardening.
- `pnpm test -- src/test/control-mirror-evidence-pack-format.test.ts src/test/control-mirror-export-route.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox first confirmed red test for missing filename helper, final rerun passed, 5 tests.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added `buildControlMirrorEvidencePackFileName()` domain helper for JSON/Markdown export filenames.
- Updated the export route to use the shared filename helper.
- Added filename sanitization/fallback coverage.
- Added schema version and deterministic generatedAt coverage for string and Date inputs.

### File List

- `_bmad-output/implementation-artifacts/7-3-harden-export-filename-and-version-metadata.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror-report.ts`
- `packages/domain/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- `apps/web/src/test/control-mirror-evidence-pack-format.test.ts`
- `apps/web/src/test/control-mirror-export-route.test.ts`

## Change Log

- 2026-05-22: Created and started Story 7.3 export filename/version metadata hardening.
- 2026-05-22: Added shared export filename helper and version/timestamp regression coverage.
