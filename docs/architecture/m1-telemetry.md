# M1 Telemetry Notes

## Scope
- request ID header via middleware
- lightweight request logging for application routes
- PostHog page-view events for:
  - Home
  - Framing
  - Outcome Workspace
  - Story Workspace
  - Execution Contract preview
- audit events from persistence services for:
  - outcome updates
  - tollgate records/submissions
  - story updates
  - execution contract generation

## Event Names
- `home_dashboard_viewed`
- `framing_cockpit_viewed`
- `outcome_workspace_viewed`
- `story_workspace_viewed`
- `execution_contract_viewed`
- `outcome_updated`
- `tollgate_recorded`
- `story_updated`
- `execution_contract_generated`

## M1 Intent
M1 telemetry is intentionally lightweight. It exists to support demo traceability and debugging, not full observability maturity.
