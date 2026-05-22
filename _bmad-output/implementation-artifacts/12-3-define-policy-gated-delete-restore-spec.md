# Story 12.3: Define Policy-Gated Delete/Restore Spec

Status: done

## Story

As Product/Security,
I want delete and restore behavior specified before implementation,
so that destructive retention lifecycle actions do not bypass governance.

## Acceptance Criteria

1. Given archived exports exist, when policy is drafted, then delete eligibility, legal hold and restore rules are documented.
2. Given destructive actions are not yet implemented, when Epic 12 completes, then there is no new hard delete route for evidence pack exports.
3. Given future implementation starts, when a story is created, then it includes explicit authority, audit and migration requirements.

## Tasks / Subtasks

- [x] Draft retention lifecycle policy spec (AC: 1, 3)
  - [x] Document delete eligibility rules.
  - [x] Document legal hold rules.
  - [x] Document restore rules.
  - [x] Document future authority, audit and migration requirements.
- [x] Confirm no destructive export route exists (AC: 2)
  - [x] Search Control Mirror export route/action/API surfaces for hard delete behavior.
  - [x] Record verification result in story debug log.
- [x] Update tracking
  - [x] Mark Epic 12 stories complete when policy spec and verification are complete.

## Dev Notes

Story 12.3 is documentation/specification only. Do not implement delete, restore, legal hold persistence or new routes in this story.

Important boundaries:

- The current implemented lifecycle is active -> archived, with persisted download and audit history preserved.
- Future destructive actions must require explicit Product/Security policy signoff.
- Any future delete/restore implementation must preserve or explicitly migrate audit history.
- This story should leave the application behavior unchanged.

### Project Structure Notes

- Policy spec output: `_bmad-output/planning-artifacts/aas-control-mirror-retention-delete-restore-policy.md`
- Route/API surfaces to verify: `apps/web/src/app/(protected)/control-mirror`, `packages/api/src/control-mirror.ts`, `packages/db/src/repositories/control-mirror-export-repository.ts`

### References

- [Epic 12 Plan](_bmad-output/planning-artifacts/aas-control-mirror-epic-12-retention-policy-administration.md)
- [Epic 11 Retro](_bmad-output/implementation-artifacts/epic-11-retro-2026-05-22.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from Epic 12 backlog and started.
- `rg -n "delete|hard delete|restore|remove|ControlMirrorEvidencePackExport.*delete|controlMirrorEvidencePackExport\\.delete|deleteControlMirrorEvidencePackExport|restoreControlMirrorEvidencePackExport" "apps/web/src/app/(protected)/control-mirror" packages/api/src/control-mirror.ts packages/db/src/repositories/control-mirror-export-repository.ts` - no export delete/restore implementation found; matches are snapshot deleted-count display/copy only.

### Completion Notes List

- Created retention delete/restore policy draft covering delete eligibility, legal hold, restore, authority, audit and migration requirements.
- Verified Control Mirror export route/action/API/repository surfaces do not contain hard delete or restore behavior for evidence pack exports.
- Left application behavior unchanged.

### File List

- `_bmad-output/implementation-artifacts/12-3-define-policy-gated-delete-restore-spec.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/aas-control-mirror-retention-delete-restore-policy.md`

## Change Log

- 2026-05-22: Created and started Story 12.3 policy-gated delete/restore spec.
- 2026-05-22: Drafted retention delete/restore policy and verified no destructive export route exists.
