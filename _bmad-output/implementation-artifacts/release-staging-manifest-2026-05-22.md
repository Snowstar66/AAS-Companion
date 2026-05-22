# Release Staging Manifest: Control Mirror

Date: 2026-05-22
Status: Ready for selective staging

## Purpose

This manifest defines the release boundary for the Control Mirror work after Epic 16 UX polish. It is intended to keep the product, test and documentation changes reviewable while excluding generated local build state.

## Stage

### Control Mirror Product Surface

- `apps/web/src/app/(protected)/control-mirror/`
- `apps/web/src/lib/control-mirror/`
- `apps/web/src/app/(protected)/intake/actions.ts`
- `apps/web/src/app/(protected)/intake/page.tsx`
- `apps/web/src/components/intake/source-connection-wizard.tsx`
- `apps/web/src/components/layout/app-language.data.ts`
- `apps/web/src/components/layout/sidebar.tsx`
- `packages/domain/src/control-mirror*.ts`
- `packages/domain/src/index.ts`
- `packages/domain/src/navigation.ts`
- `packages/domain/src/pricing.ts`
- `packages/api/src/control-mirror.ts`
- `packages/api/src/index.ts`

### Persistence and Repository Layer

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260521213000_control_mirror_human_review_queue/`
- `packages/db/prisma/migrations/20260521224500_control_mirror_human_review_decisions/`
- `packages/db/prisma/migrations/20260522103500_control_mirror_evidence_pack_exports/`
- `packages/db/prisma/migrations/20260522111500_control_mirror_export_acceptance_decisions/`
- `packages/db/prisma/migrations/20260522124500_control_mirror_acceptance_revoked_decision/`
- `packages/db/prisma/migrations/20260522132000_control_mirror_export_retention_state/`
- `packages/db/prisma/migrations/20260522140500_control_mirror_export_download_events/`
- `packages/db/src/index.ts`
- `packages/db/src/repositories/control-mirror-export-repository.ts`
- `packages/db/src/repositories/control-mirror-human-review-repository.ts`
- `packages/db/src/repositories/control-mirror-repository.ts`
- `packages/db/src/repositories/control-mirror-snapshot-repository.ts`

### Supporting App UX and Tests

- `apps/web/src/app/(protected)/epics/[epicId]/page.tsx`
- `apps/web/src/app/(protected)/framing/page.tsx`
- `apps/web/src/app/(protected)/outcomes/[outcomeId]/page.tsx`
- `apps/web/src/app/(protected)/pricing/page.tsx`
- `apps/web/src/app/(protected)/review/page.tsx`
- `apps/web/src/app/(protected)/workspace/page.tsx`
- `apps/web/src/components/framing/framing-outcome-section.tsx`
- `apps/web/src/components/home/home-dashboard-hero.tsx`
- `apps/web/src/components/workspace/delivery-story-workspace.tsx`
- `apps/web/src/components/workspace/framing-value-spine-tree.tsx`
- `apps/web/src/components/workspace/story-idea-workspace.tsx`
- `apps/web/src/lib/workspace/story-ux.ts`
- `apps/web/src/test/*.test.tsx`
- `apps/web/src/test/control-mirror*.test.*`
- `apps/web/src/test/story-ux.test.ts`

### Browser UX QA

- `apps/web/e2e/control-mirror.spec.ts`
- `apps/web/playwright.config.ts`

### Documentation and Planning Artifacts

- `docs/features/aas-control-mirror.md`
- `docs/aas-companion-ux-spec.md`
- `imports/bmad-log-visualizer-aas-framing-import.json`
- `_bmad-output/planning-artifacts/aas-control-mirror*.md`
- `_bmad-output/implementation-artifacts/*.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Release Hygiene

- `.gitignore`

## Do Not Stage

- `apps/web/tsconfig.tsbuildinfo`
- `.next-dev-control-mirror*.log`
- `docs/photosanonymousavatars.jpg`
- `docs/photosofavatars.jpg`
- `docs/photosofhumans.jpg`
- `apps/web/.next/`
- `apps/web/test-results/`
- `playwright-report/`

## Verification Snapshot

- `pnpm test`: pass, 46 files and 200 tests.
- `pnpm --filter @aas-companion/web build`: pass.
- `pnpm --filter @aas-companion/web test:e2e -- control-mirror.spec.ts --reporter=line --timeout=45000`: pass, 2 browser UX tests, using installed Chrome and an externally managed Next dev server.
