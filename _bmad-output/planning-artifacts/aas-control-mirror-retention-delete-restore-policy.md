---
created: 2026-05-22
status: draft
source_epic: epic-12-retention-policy-administration
---

# AAS Control Mirror Retention Delete/Restore Policy

## Purpose

This policy defines the preconditions for any future destructive lifecycle action on persisted Control Mirror evidence pack exports.

Current implementation supports:

- `active` exports
- archive with actor, timestamp and reason
- archived export download with disclosure
- re-download audit events
- readable actor labels in export history
- retention review due/reviewed display

Current implementation intentionally does not support hard delete, restore or legal hold persistence.

## Policy Principles

1. Evidence pack exports are audit artifacts, not disposable files.
2. Archive is the default lifecycle action for stale exports.
3. Delete must be exceptional, policy-gated and auditable.
4. Restore must preserve original creation, archive and download audit history.
5. Legal hold must override expiry and delete eligibility.
6. Tenant scoping must be enforced on every lifecycle transition.

## Delete Eligibility Rules

An export may become delete-eligible only when all conditions are true:

- The export is already archived.
- The archive reason is present and human-readable.
- The export is past its retention review due date or has a completed retention review.
- No legal hold is active for the export, project, organization, customer, contract or related governance review.
- Product/Security policy has explicitly allowed deletion for this artifact class.
- A human actor with delete authority submits the delete request.
- The delete request includes a rationale that is stored as an audit event before deletion.

Delete must remain blocked when any condition is true:

- The export is active.
- The export is the latest share-ready evidence pack for the project.
- The export is linked to an open Human Review item, unresolved acceptance change request or audit investigation.
- The export is within an active legal hold.
- The application cannot write the delete audit event.

## Legal Hold Rules

Legal hold should be modeled before delete implementation.

Minimum required fields:

- `holdState`: `none`, `active`, `released`
- `holdReason`
- `holdAppliedBy`
- `holdAppliedAt`
- `holdReleasedBy`
- `holdReleasedAt`
- `holdReleaseReason`

Legal hold behavior:

- Active legal hold blocks hard delete.
- Active legal hold does not block read/download access.
- Active legal hold should be visible in export history and export detail views.
- Legal hold changes must be append-only audited.

## Restore Rules

Restore should mean moving an archived export back to active circulation. It must not recreate payload or erase archive history.

Restore may be allowed only when:

- The export exists and is archived.
- The export has not been hard-deleted.
- The actor has restore authority.
- The restore request includes a rationale.
- A restore audit event is written successfully.

Restore must preserve:

- Original export id
- Original generated/created timestamps
- Original payload and markdown content
- Acceptance decision history
- Download event history
- Archive metadata and archive audit history

## Authority Requirements

Future delete/restore stories must define an explicit authority map before implementation.

Minimum authority expectations:

- Archive: governance operator roles such as `value_owner`, `delivery_lead`, `architect`, `aida`, `aqa`.
- Restore: same or stricter than archive.
- Delete: Product/Security-approved authority, preferably Party Role Directory assignment rather than coarse membership role.
- Legal hold apply/release: Security/privacy or governance lead authority.

Server actions must fail closed before persistence if authority is missing.

## Audit Requirements

Future destructive lifecycle work must introduce append-only audit events before mutating/deleting state.

Required event fields:

- event id
- organization id
- export id
- event type
- actor id
- rationale
- prior state
- resulting state
- created timestamp

Download audit events must remain intact even if an export becomes archived, restored or delete-eligible.

## Migration Requirements

Future implementation should use additive migrations first:

- Add legal hold fields or legal hold event table.
- Add lifecycle event table if archive/restore/delete history needs richer audit than current export fields.
- Add indexes for organization, export, actor and created timestamp.
- Do not drop existing payload columns until a separate migration and export retention policy explicitly approves it.

## Future Story Guardrails

Any future delete/restore implementation story must include:

- Acceptance criteria for tenant scoping.
- Acceptance criteria for authority failure.
- Acceptance criteria for audit-write failure.
- Acceptance criteria proving active/latest share-ready exports cannot be hard-deleted.
- Route/action/API/repository tests.
- Web build verification that export routes remain present.

## Non-Goals

This policy does not implement:

- hard delete
- restore
- legal hold persistence
- retention scheduler
- automatic expiry
- data retention windows by customer contract

Those should be separate implementation stories after Product/Security signoff.
