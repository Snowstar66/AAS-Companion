# Story 3.3: Apply Retention and Redaction Policy to Evidence Storage

Status: done

## Story

As an AQA,
I want Control Mirror to store only policy-compliant evidence content,
so that uploaded logs or repository exports do not create hidden privacy/security risk.

## Acceptance Criteria

1. Given evidence content is parsed, when it is stored, then retention mode determines whether full content, excerpt, redacted excerpt or metadata-only data is persisted.
2. Given possible secrets or sensitive values are detected, when evidence is normalized, then the stored excerpt is redacted or the item is marked for Human Review.
3. Given a report is generated, when it references source evidence, then it must disclose whether source text was retained, redacted or omitted.

## Tasks / Subtasks

- [x] Add domain retention/redaction policy helpers (AC: 1, 2, 3)
  - [x] Map Control Mirror source types to retention modes.
  - [x] Redact likely secrets and credentials before excerpt retention.
  - [x] Return disclosure metadata for retained, redacted and omitted source text.
- [x] Apply policy during snapshot persistence (AC: 1, 2)
  - [x] Store redacted excerpts for uploaded snapshots.
  - [x] Store metadata-only or omitted content when policy requires it.
  - [x] Include retention metadata in artifact/evidence lineage.
- [x] Surface retention disclosure in dashboard/report (AC: 2, 3)
  - [x] Expose retention metadata on normalized evidence summaries.
  - [x] Add Human Review signal for sensitive retained evidence.
  - [x] Show report disclosure for retained, redacted or omitted source text.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover redaction helper behavior.
  - [x] Cover uploaded snapshot persistence with sensitive content.
  - [x] Cover dashboard/report retention disclosure.
- [x] Run verification
  - [x] `pnpm build:web-runtime-packages`
  - [x] `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-uploaded-snapshot-guardrails.test.ts src/test/control-mirror-page.test.tsx`
  - [x] `pnpm --filter @aas-companion/web build`

## Dev Notes

Story 3.3 tightens the evidence boundary created in Stories 3.1 and 3.2. It should not add new broad storage tables unless existing artifact/evidence metadata cannot carry the policy state.

Important boundaries:

- Do not store uploaded source content beyond policy-compliant excerpts.
- Redaction must run before excerpt persistence.
- Metadata-only and not-retained modes must not persist source text.
- Human Review should know when sensitive content was detected even if the stored excerpt is redacted.
- Reports must say whether source text was retained, redacted or omitted.

### Project Structure Notes

- Domain retention helpers: `packages/domain/src/control-mirror.ts`
- Snapshot persistence: `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- Dashboard repository mapping: `packages/db/src/repositories/control-mirror-repository.ts`
- Control Mirror page: `apps/web/src/app/(protected)/control-mirror/page.tsx`
- Focused tests: `apps/web/src/test/control-mirror-rules.test.ts`, `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`, `apps/web/src/test/control-mirror-page.test.tsx`

### References

- [Epic 3 plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-3-source-ingestion-and-evidence-policy.md)
- [Story 3.1](_bmad-output/implementation-artifacts/3-1-establish-source-mode-registry-and-evidence-policy-surface.md)
- [Story 3.2](_bmad-output/implementation-artifacts/3-2-add-uploaded-snapshot-intake-guardrails.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 3 backlog.
- `pnpm build:web-runtime-packages` - passed.
- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-uploaded-snapshot-guardrails.test.ts src/test/control-mirror-page.test.tsx` - passed, 18 tests. Existing React warning about non-boolean `jsx/global` remains.
- `pnpm --filter @aas-companion/web build` - passed. Existing Next ESLint plugin warning and webpack cache snapshot warnings remain.

### Completion Notes List

- Added Control Mirror retention/redaction policy helpers for source-type retention modes, excerpt omission and likely secret redaction.
- Snapshot persistence now applies retention policy before storing source excerpts and carries policy metadata through artifact JSON and normalized evidence lineage.
- Dashboard/report now disclose evidence retention state, and sensitive findings create a Human Review signal.
- Focused tests cover redaction, sensitive uploaded snapshot persistence and dashboard/report disclosure.

### File List

- `_bmad-output/implementation-artifacts/3-3-apply-retention-and-redaction-policy-to-evidence-storage.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/domain/src/control-mirror.ts`
- `packages/db/src/repositories/control-mirror-snapshot-repository.ts`
- `packages/db/src/repositories/control-mirror-repository.ts`
- `apps/web/src/app/(protected)/control-mirror/page.tsx`
- `apps/web/src/test/control-mirror-rules.test.ts`
- `apps/web/src/test/control-mirror-uploaded-snapshot-guardrails.test.ts`
- `apps/web/src/test/control-mirror-page.test.tsx`

## Change Log

- 2026-05-21: Started Story 3.3 retention and redaction policy.
- 2026-05-21: Implemented Story 3.3 retention and redaction policy.
