# Release Hygiene Notes: Control Mirror + Page Harness

Date: 2026-05-22
Status: Ready for staging review

## Scope

This note captures the current commit boundary after the Control Mirror implementation run, page-test harness cleanup, Epic 16 professional UX polish and release-boundary staging pass.

## Cleaned Up

- Added `.next-dev*.log` to `.gitignore` so local Next dev-server logs do not appear in release status.
- Left existing generated/log files on disk; only Git visibility was adjusted.
- Verified the post-Epic 15 gate before this note:
  - `pnpm test` passed: 46 files, 200 tests.
  - `pnpm --filter @aas-companion/web build` passed.
- Added Epic 16 UX polish after the initial staging note:
  - Professional Mermaid/control diagrams.
  - First-viewport Control Mirror cockpit signals.
  - Browser UX QA for desktop and mobile.
- Added a dedicated staging manifest so reviewers can separate product changes, verification assets and generated local build state.

## Suggested Staging Groups

1. Control Mirror product implementation:
   - `apps/web/src/app/(protected)/control-mirror/`
   - `apps/web/src/lib/control-mirror/`
   - `packages/domain/src/control-mirror*.ts`
   - `packages/api/src/control-mirror.ts`
   - `packages/db/src/repositories/control-mirror*.ts`
   - Control Mirror tests under `apps/web/src/test/control-mirror*.test.*`
   - Control Mirror browser UX QA under `apps/web/e2e/control-mirror.spec.ts`
   - `apps/web/playwright.config.ts` fallback flags for local installed Chrome and externally managed dev server.

2. Control Mirror persistence:
   - `packages/db/prisma/schema.prisma`
   - `packages/db/prisma/migrations/20260521*_control_mirror*/`
   - `packages/db/prisma/migrations/20260522*_control_mirror*/`
   - `packages/db/src/index.ts`
   - `packages/api/src/index.ts`
   - `packages/domain/src/index.ts`

3. Integration and navigation polish:
   - Modified app pages outside Control Mirror.
   - Workspace/story/value-spine UX support files.
   - Navigation and language data updates.
   - Related page tests.

4. BMAD and product documentation:
   - `_bmad-output/`
   - `docs/features/aas-control-mirror.md`
   - `docs/aas-companion-ux-spec.md`
   - `imports/bmad-log-visualizer-aas-framing-import.json`
   - Epic 16 planning/implementation/retro artifacts.

5. Release hygiene:
   - `.gitignore`
   - This release hygiene note.
   - `_bmad-output/implementation-artifacts/release-staging-manifest-2026-05-22.md`

## Explicitly Excluded From Staging

- `apps/web/tsconfig.tsbuildinfo`
  - Reason: tracked TypeScript incremental build cache changed by local build verification.
  - Release posture: do not include in the product commit unless a reviewer intentionally wants to normalize tracked build metadata in a separate cleanup.
- `.next-dev-control-mirror*.log`
  - Reason: local dev-server logs.
  - Release posture: ignored by `.gitignore`; leave on disk if present.
- `docs/photosanonymousavatars.jpg`, `docs/photosofavatars.jpg`, `docs/photosofhumans.jpg`
  - Reason: unreferenced local image artifacts outside the Control Mirror release boundary.
  - Release posture: do not stage with this release.

## Review Notes

- `apps/web/tsconfig.tsbuildinfo` remains modified after build activity and should stay out of the Control Mirror release boundary.
- The `.next-dev-control-mirror*.log` files are now ignored and should not be staged.
- Playwright bundled browser install was blocked locally by `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`; browser UX QA passed using installed Chrome with TLS left strict.

## Final Verification

- `pnpm test`
  - Pass: 46 test files, 200 tests.
- `pnpm --filter @aas-companion/web build`
  - Pass.
- `PLAYWRIGHT_USE_INSTALLED_CHROME=1` and `PLAYWRIGHT_SKIP_WEBSERVER=1` with live Next dev server on port 3001:
  - `pnpm --filter @aas-companion/web test:e2e -- control-mirror.spec.ts --reporter=line --timeout=45000`
  - Pass: 2 browser UX tests.
