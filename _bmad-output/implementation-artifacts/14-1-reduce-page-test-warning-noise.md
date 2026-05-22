# Story 14.1: Reduce Page Test Warning Noise

Datum: 2026-05-22
Status: Done

## User Story

Som maintainer vill jag att page-testernas output innehåller mindre irrelevant brus så att nästa verkliga regression syns tydligare.

## Acceptance Criteria

1. Given `AppSidebar` renderas i testmiljön, when guidance CSS läggs på sidan, then React varnar inte för `jsx` och `global` som non-boolean DOM-attribut.
2. Given `framing-cockpit.test.tsx` renderar FramingPage, when `SelectedFramingOutcomeSection` läser action-importer, then mocken innehåller de exports som sidan importerar.
3. Given verifiering körs, when riktade tester, full `pnpm test` och webbuild körs, then alla passerar.

## Implementation

- `apps/web/src/components/layout/sidebar.tsx`
  - Ersatte `style jsx global` med vanlig `<style>` eftersom regeln redan är global CSS och Vitest inte kör Nexts styled-jsx-transform.
- `apps/web/src/test/framing-cockpit.test.tsx`
  - Lade till framing action-mockar för `analyzeJourneyCoverageAction`, `runFramingAgentAction`, `saveDownstreamAiInstructionsAction` och `saveJourneyContextsAction`.
  - Lade till outcome action-mock för `saveOutcomeWorkspaceInlineAction`.

## Verification

- `pnpm test -- src/test/framing-cockpit.test.tsx src/test/smoke.test.tsx src/test/outcome-workspace-page.test.tsx`
  - Pass: 3 testfiler, 5 tester.
- `pnpm test`
  - Pass: 46 testfiler, 199 tester.
- `pnpm --filter @aas-companion/web build`
  - Pass.

## Remaining Warnings

Kvarvarande varningar är async Server Component-varningar i page-tests:

- `ActiveFramingReviewWorkspace`
- `DeferredValueOwnerField`
- `OutcomeTollgateApprovalSection`
- `SelectedFramingOutcomeSection`

De är fortfarande icke-blockerande, men bör lösas separat om testoutputen ska bli helt tyst.
