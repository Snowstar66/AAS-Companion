# Story 9.3: Gate External Sharing Copy on Acceptance

Status: done

## Story

As a governance lead,
I want export history and re-downloads to preserve acceptance-required copy until acceptance exists,
so that exports are not treated as broadly shareable by accident.

## Acceptance Criteria

1. Given no acceptance decision exists, when export history renders, then the export is marked acceptance pending.
2. Given acceptance exists, when export history renders, then accepted state and reviewer are visible.
3. Given re-download occurs before acceptance, when the download is served, then the persisted payload still includes acceptance-required disclosure.

## Tasks / Subtasks

- [x] Mark pending acceptance in export history (AC: 1, 2)
  - [x] Add explicit acceptance-pending copy for exports without a latest decision.
  - [x] Preserve latest accepted decision and reviewer display.
  - [x] Add page regression assertions for pending and accepted rows.
- [x] Preserve acceptance disclosure on persisted re-downloads (AC: 3)
  - [x] Enrich legacy persisted JSON payloads with the current acceptance policy when missing.
  - [x] Rebuild legacy Markdown downloads from enriched payloads when the stored Markdown lacks the acceptance section.
  - [x] Add download/API regression coverage for acceptance-required disclosure.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-page.test.tsx src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-export-download-service.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 9.3 should not add new authorization roles or change acceptance decision persistence. It only gates sharing copy and keeps downloaded exports self-disclosing.

Important boundaries:

- Treat missing latest acceptance decision as pending, not accepted.
- Do not mutate persisted export records during re-download.
- Keep tenant scoping from the existing persisted export lookup.
- Preserve stored filenames and content types.

### Project Structure Notes

- API service: `packages/api/src/control-mirror.ts`
- Domain evidence pack helpers: `packages/domain/src/control-mirror-report.ts`
- UI: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-page.test.tsx`, `apps/web/src/test/control-mirror-export-download-route.test.ts`

### References

- [Story 9.1](_bmad-output/implementation-artifacts/9-1-add-evidence-pack-product-security-acceptance-policy.md)
- [Story 9.2](_bmad-output/implementation-artifacts/9-2-record-export-acceptance-decisions.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 9 backlog and started.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-page.test.tsx src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-export-download-service.test.ts` - sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox initially caught singular copy in acceptance policy; final rerun passed, 3 files and 6 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export` and `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added explicit acceptance-pending state in recent evidence pack export history.
- Preserved accepted-state display for exports that already have a latest acceptance decision.
- Added legacy persisted export enrichment so JSON and Markdown downloads retain Product/Security acceptance-required disclosure even when older records predate the acceptance field.
- Fixed singular/plural acceptance disclosure copy for one sensitive finding.
- Added page, route and API service regression coverage.

### File List

- `_bmad-output/implementation-artifacts/9-3-gate-external-sharing-copy-on-acceptance.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror-report.ts`
- `packages/domain/src/control-mirror.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-page.test.tsx`
- `apps/web/src/test/control-mirror-export-download-route.test.ts`
- `apps/web/src/test/control-mirror-export-download-service.test.ts`

## Change Log

- 2026-05-22: Created and started Story 9.3 external sharing acceptance gate.
- 2026-05-22: Added acceptance-pending export history copy and persisted download acceptance disclosure enrichment.
