# Story 8.3: Re-download Persisted Evidence Pack Exports

Status: done

## Story

As a Delivery Lead,
I want to re-download a persisted export,
so that audit reviewers can retrieve the exact artifact that was generated earlier.

## Acceptance Criteria

1. Given a persisted export exists for my organization, when I request it, then the original content is returned with the stored filename and content type.
2. Given the export belongs to another organization, when I request it, then it is not returned.
3. Given the export id is missing or invalid, when I request it, then the response fails closed.

## Tasks / Subtasks

- [x] Add persisted export lookup (AC: 1, 2)
  - [x] Add tenant-scoped repository lookup by export id.
  - [x] Add API service that serializes stored JSON or Markdown content for download.
- [x] Add protected re-download route (AC: 1, 2, 3)
  - [x] Add `/control-mirror/export/[exportId]` route.
  - [x] Return stored filename, content type and no-store headers.
  - [x] Redirect with fail-closed copy when the record is missing.
- [x] Add page links and tests (AC: 1)
  - [x] Link recent export filenames to the persisted re-download route.
  - [x] Cover route success/failure and page link rendering.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-export-history.test.ts`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 8.3 should re-download persisted exports only. Do not introduce edit/delete/export lifecycle management yet.

Important boundaries:

- Always scope lookup by active organization id.
- Do not return records from other organizations.
- Preserve the stored filename and content type.
- Use `Cache-Control: no-store`.

### Project Structure Notes

- Repository: `packages/db/src/repositories/control-mirror-export-repository.ts`
- API service: `packages/api/src/control-mirror.ts`
- Route: `apps/web/src/app/(protected)/control-mirror/export/[exportId]/route.ts`
- Page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-export-download-route.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`, `apps/web/src/test/control-mirror-export-history.test.ts`

### References

- [Story 8.1](_bmad-output/implementation-artifacts/8-1-add-evidence-pack-export-history-persistence.md)
- [Story 8.2](_bmad-output/implementation-artifacts/8-2-list-recent-evidence-pack-exports.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 8 backlog.
- Started persisted export re-download implementation.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-export-download-route.test.ts src/test/control-mirror-page.test.tsx src/test/control-mirror-export-history.test.ts` - initial sandbox run failed with `Access is denied` resolving `vitest.config.ts`; rerun outside sandbox passed, 8 tests. Existing React non-boolean attribute warnings remain.
- `pnpm --filter @aas-companion/web build` - passed, including `/control-mirror/export/[exportId]`. Existing Next ESLint plugin and webpack cache snapshot warnings remain.

### Completion Notes List

- Added tenant-scoped persisted export lookup by id.
- Added API service for re-downloading stored JSON or Markdown export content.
- Added protected `/control-mirror/export/[exportId]` route with stored headers and fail-closed redirect.
- Linked recent export filenames from the Control Mirror page to persisted download routes.
- Added route, repository and page regression coverage.

### File List

- `_bmad-output/implementation-artifacts/8-3-redownload-persisted-evidence-pack-exports.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/db/src/index.ts`
- `packages/api/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/app/(protected)/control-mirror/export/[exportId]/route.ts`
- `apps/web/src/test/control-mirror-export-download-route.test.ts`
- `apps/web/src/test/control-mirror-export-history.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-22: Created and started Story 8.3 persisted export re-download.
- 2026-05-22: Added persisted export re-download route and page links.
