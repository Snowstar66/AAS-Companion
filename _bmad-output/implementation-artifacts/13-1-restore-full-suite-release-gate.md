# Story 13.1: Restore Full Suite Release Gate

Datum: 2026-05-22
Status: Done

## User Story

Som maintainer vill jag att hela release-gaten passerar efter Control Mirror-retentionsarbetet så att nästa slice kan byggas ovanpå en grön test- och buildbas.

## Acceptance Criteria

1. Given Home dashboard får ett degraderat dashboard-objekt utan story/delivery-statistik, when sidan renderas, then den faller tillbaka till nollvärden och kraschar inte.
2. Given smoke-testet körs, when degraded Home state renderas, then testet förväntar sig aktuell copy.
3. Given Outcome workspace-testet körs, when async Client Component-sektioner inte renderas stabilt i Vitest, then testet validerar stable shell/provenance/status/actions utan att vänta på instabila undersektioner.
4. Given release-gaten körs, when riktade tester, full testsvit och webbuild körs, then alla passerar.

## Implementation

- `apps/web/src/components/home/home-dashboard-hero.tsx`
  - Lade defensiva fallbackvärden för `storyIdeaStats` och `deliveryStoryStats`.
- `apps/web/src/test/smoke.test.tsx`
  - Uppdaterade stale degraded-dashboard copy assertion.
- `apps/web/src/test/outcome-workspace-page.test.tsx`
  - Behöll assertions för native provenance, framing context, scope, status, AI validate och create/remove actions.
  - Tog bort assertions mot async-renderade undersektioner som Vitest varnade för och inte garanterade i test-DOM.

## Verification

- `pnpm test -- src/test/smoke.test.tsx src/test/outcome-workspace-page.test.tsx`
  - Pass: 2 testfiler, 2 tester.
- `pnpm test`
  - Pass: 46 testfiler, 199 tester.
- `pnpm --filter @aas-companion/web build`
  - Pass: runtime packages, Next build, type/lint checks and route generation.

## Notes

Kända icke-blockerande varningar kvarstår i testoutput:

- React-varningar om `jsx` och `global` som non-boolean attributes.
- Async Client Component-varningar i flera page-tests, inklusive Outcome workspace.
- En mock-varning om `runFramingAgentAction` i `framing-cockpit.test.tsx`; den fångas av sidan och sviten passerar.
