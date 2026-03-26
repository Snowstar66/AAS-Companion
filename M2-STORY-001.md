# M2-STORY-001

## Title
Create Artifact Intake workspace

## Story Type
Feature

## Value Intent
Provide a dedicated workspace for ingesting external delivery artifacts before they are interpreted and mapped into the AAS model.

## Summary
Create an Artifact Intake workspace where users can upload, register and inspect incoming source artifacts such as BMAD PRDs, epic files, story files and mixed markdown bundles.

## Acceptance Criteria
- a new route exists for Artifact Intake
- user can upload one or more markdown files
- uploaded files are grouped into an intake session
- intake session is persisted and reloadable
- file metadata is stored, including:
  - file name
  - upload timestamp
  - uploader
  - organization context
  - source type status
- intake session has status states:
  - uploaded
  - source classification pending
  - source classified
  - parsing pending
  - parsed
  - mapping pending
  - human review required
  - promoted
  - blocked
- uploaded files are organization-scoped
- unsupported file types are rejected with clear feedback
- activity events are created for:
  - intake session creation
  - file upload
  - file rejection

## AI Usage Scope
- CODE
- TEST

## Test Definition
- unit
- integration
- e2e smoke

## Definition of Done
- Artifact Intake workspace is reachable from the app shell
- uploads work in demo/development mode
- intake sessions persist across reload
- file metadata is visible and usable
- activity logging exists for upload-related events

## Scope In
- intake route
- upload UI
- intake session model
- file metadata persistence
- session status model
- activity events for intake lifecycle

## Scope Out
- semantic parsing
- AAS mapping
- compliance analysis
- promotion into Framing/Design

## Constraints
- uploads must remain tenant-scoped
- no governed objects are created in this story
- unsupported files must be rejected clearly
- uploaded source files must remain traceable to intake session

## Required Evidence
- screenshots of intake workspace
- upload demo
- example persisted intake session
- example activity events