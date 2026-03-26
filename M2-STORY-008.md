\# M2-STORY-008



\## Title

Block build progression when imported artifacts are not AAS-compliant



\## Story Type

Governance Feature



\## Value Intent

Prevent interpreted or promoted imported artifacts from reaching build handoff unless compliance and required human decisions are resolved.



\## Summary

Ensure imported artifacts cannot move into build handoff when unresolved compliance gaps remain, and allow valid imported Stories to proceed only under the same governance as natively created Stories.



\## Acceptance Criteria

\- build handoff blocks imported artifacts with unresolved compliance gaps

\- build handoff blocks imported artifacts with unresolved human-only decisions

\- block reasons are clearly shown

\- valid imported Stories can proceed to Execution Contract preview

\- invalid imported Stories are shown in blocked state

\- progression attempts create activity events for:

&#x20; - blocked progression

&#x20; - allowed progression

\- block reasons are classified and understandable

\- blocked state is visible both in Build Handoff and object detail views

\- shared block-reason semantics can be reused where possible across imported and native build-boundary logic



\## AI Usage Scope

\- CODE

\- TEST



\## Test Definition

\- integration

\- e2e



\## Definition of Done

\- build gating works for imported artifacts

\- valid and blocked paths are both demonstrable

\- block reasons are actionable

\- governance is not bypassed through import path

\- imported build-boundary behavior remains consistent with native governance expectations



\## Scope In

\- build gating rules for imported origin

\- blocked state UI

\- block reason model

\- progression activity events

\- build-boundary validation for imported promoted objects



\## Scope Out

\- actual external tool execution

\- release approval logic

\- production deployment controls



\## Constraints

\- no imported artifact may bypass AAS compliance

\- human-only unresolved decisions must remain blocking

\- block reasons must be specific and actionable

\- imported and native artifacts must follow equivalent governance at build boundary

\- imported-specific blocking must extend shared governance semantics rather than invent a separate rule language



\## Required Evidence

\- blocked build demo

\- successful compliant imported story progression demo

\- example block reasons

\- activity log example

\- comparison of equivalent native and imported governance outcome

