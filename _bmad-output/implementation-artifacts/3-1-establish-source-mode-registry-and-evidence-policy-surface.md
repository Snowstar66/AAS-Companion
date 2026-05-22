# Story 3.1: Establish Source Mode Registry and Evidence Policy Surface

Status: done

## Story

As a Delivery Lead,
I want Control Mirror to show which source modes are supported, planned or blocked and what evidence retention policy applies,
so that I understand exactly what evidence the system can read before I connect anything.

## Acceptance Criteria

1. Given I open Control Mirror source/evidence controls, when source modes are listed, then each mode shows support status, refresh support, retention posture and safety constraints.
2. Given a mode is planned or unsupported, when it is displayed, then it is visible but cannot be selected as if it were live.
3. Given evidence content may contain sensitive data, when the policy is shown, then the UI states whether content is stored as metadata, excerpts, redacted content or not retained.
4. Given the user has not uploaded or selected files, when Control Mirror renders, then it must not imply local files or repositories were scanned.

## Tasks / Subtasks

- [x] Add a domain source-mode registry read model (AC: 1, 2, 3, 4)
  - [x] Define source mode ids, labels, support status, refresh support and retention posture.
  - [x] Include constraints for current imports, manual upload, uploaded zip, folder snapshot and repository root.
  - [x] Keep unsupported/planned modes visible but non-actionable.
- [x] Expose source policy in the Control Mirror dashboard service (AC: 1, 3, 4)
  - [x] Add source policy data to the dashboard read model.
  - [x] Preserve existing snapshot/source summary behavior.
  - [x] Avoid implying unsupported local scanning.
- [x] Surface source policy in Control Mirror UI (AC: 1, 2, 3, 4)
  - [x] Add a compact source/evidence policy panel.
  - [x] Show active vs planned/unsupported modes clearly.
  - [x] Place retention/safety copy near source actions.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover source registry values and support statuses.
  - [x] Cover dashboard/page rendering of policy data.
  - [x] Cover unsupported modes not appearing as active actions.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Epic 3 starts from the Epic 2 retrospective recommendation: broaden evidence ingestion only after source modes, retention posture and safety constraints are explicit. This story should not implement zip extraction or folder/repository scanning. It creates the policy surface that makes later ingestion work safer.

Important boundaries:

- Browser-local project roots cannot be silently scanned.
- Git/repository root is not active unless a real connector or explicit uploaded export exists.
- Uploaded zip is the next candidate mode but extraction/path validation belongs to Story 3.2.
- Evidence retention must be visible before the user connects broader sources.

### Project Structure Notes

- Domain dashboard/read model: `packages/domain/src/control-mirror.ts`
- API service: `packages/api/src/control-mirror.ts`
- Control Mirror page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 3 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-3-source-ingestion-and-evidence-policy.md)
- [Epic 2 retrospective](_bmad-output/implementation-artifacts/epic-2-retro-2026-05-21.md)
- [Control Mirror reference](docs/features/aas-control-mirror.md)
- [Architecture handoff](_bmad-output/planning-artifacts/aas-control-mirror-architecture-handoff.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 2 retrospective recommendation.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - initial parallel run hit a package/dist resolution race; sequential rerun passed, 13 tests. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning remains.

### Completion Notes List

- Added `ControlMirrorSourcePolicy` and a domain-owned `getControlMirrorSourcePolicy()` registry for current imports, manual upload, uploaded zip, folder snapshot and Git/repository root.
- Dashboard read model now carries source policy alongside snapshot metadata.
- Control Mirror source-mode UI now renders active/planned/unsupported modes, retention posture, refresh support and safety constraints from the read model.
- Focused tests cover source policy values and page visibility.

### File List

- `_bmad-output/implementation-artifacts/3-1-establish-source-mode-registry-and-evidence-policy-surface.md`
- `_bmad-output/planning-artifacts/aas-control-mirror-epic-3-source-ingestion-and-evidence-policy.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-21: Implemented Story 3.1 source-mode registry and evidence policy surface.
