# Story 7.2: Add Markdown Evidence Pack Export Format

Status: done

## Story

As a governance reviewer,
I want a readable Markdown export option,
so that evidence packs can be shared in review workflows without inspecting raw JSON.

## Acceptance Criteria

1. Given a Control Mirror evidence pack, when Markdown export is requested, then report summary, findings, Human Review state and retention disclosure are rendered.
2. Given Markdown export is requested, when content is serialized, then raw source text remains excluded.
3. Given the web export route receives a Markdown format request, then it returns a Markdown attachment with appropriate headers.

## Tasks / Subtasks

- [x] Add domain Markdown serializer (AC: 1, 2)
  - [x] Render project, snapshot, AI level, report summary and retention disclosure.
  - [x] Render evidence summaries, conformance findings, guardrail findings and Human Review state.
  - [x] Assert raw source text fields remain absent from Markdown output.
- [x] Add route Markdown format support (AC: 3)
  - [x] Support `?format=markdown` on `/control-mirror/export`.
  - [x] Return `text/markdown; charset=utf-8` with Markdown download filename.
  - [x] Preserve default JSON behavior.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-evidence-pack-markdown.test.ts src/test/control-mirror-export-route.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 7.2 should add Markdown as an additive format. The default export URL must continue returning JSON.

Important boundaries:

- Do not add PDF export in this story.
- Do not include raw uploaded source text or retained excerpts.
- Keep Markdown serialization in the domain package so API/web callers do not duplicate report rendering logic.
- Keep route behavior backwards-compatible for `/control-mirror/export`.

### Project Structure Notes

- Domain serializer: `packages/domain/src/control-mirror-report.ts`
- Domain exports: `packages/domain/src/control-mirror.ts`
- Export route: `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- Tests: `apps/web/src/test/control-mirror-evidence-pack-markdown.test.ts`, `apps/web/src/test/control-mirror-export-route.test.ts`

### References

- [Epic 7 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-7-evidence-pack-route-and-format-hardening.md)
- [Story 7.1](_bmad-output/implementation-artifacts/7-1-add-evidence-pack-export-route-tests.md)
- [Story 6.1](_bmad-output/implementation-artifacts/6-1-add-control-mirror-evidence-pack-export-model.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 7 backlog.
- Started Markdown evidence pack export implementation.
- `pnpm test -- src/test/control-mirror-evidence-pack-markdown.test.ts src/test/control-mirror-export-route.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox first confirmed red tests for missing Markdown support, final rerun passed, 4 tests.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added `buildControlMirrorEvidencePackMarkdown()` in the domain report module.
- Exported the Markdown builder from `@aas-companion/domain`.
- Added `?format=markdown` / `?format=md` route support returning Markdown attachments.
- Preserved default JSON export behavior and JSON filename.
- Added Markdown domain and route regression coverage.

### File List

- `_bmad-output/implementation-artifacts/7-2-add-markdown-evidence-pack-export-format.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror-report.ts`
- `packages/domain/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/export/route.ts`
- `apps/web/src/test/control-mirror-evidence-pack-markdown.test.ts`
- `apps/web/src/test/control-mirror-export-route.test.ts`

## Change Log

- 2026-05-22: Created and started Story 7.2 Markdown evidence pack export format.
- 2026-05-22: Added Markdown evidence pack export format and route support.
