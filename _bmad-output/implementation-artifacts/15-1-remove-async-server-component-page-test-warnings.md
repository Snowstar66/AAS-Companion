# Story 15.1: Remove Async Server Component Page Test Warnings

Datum: 2026-05-22
Status: Done

## User Story

Som maintainer vill jag att page-testernas fullsvit är grön utan React async Server Component-varningar så att testoutputen åter blir en tydlig release-signal.

## Acceptance Criteria

1. Given Outcome page-testet renderar `OutcomeWorkspacePage`, when Framing-sektionen visas, then value-owner-fältet renderas synkront och Tollgate-undersektionen mockas bort från testets scope.
2. Given Framing page-testet öppnar aktiv Framing, when route-resultatet renderas, then vald Framing-sektion är redan server-renderad och testet assertar på färdigt innehåll.
3. Given Review page-testet öppnar backlog och import workspace, when route-resultatet renderas, then aktiv framing review workspace är server-renderad och ingen async Client Component-varning skrivs.
4. Given full release-gate körs, when `pnpm test` och webbuild körs, then båda passerar.

## Implementation

- `apps/web/src/components/framing/framing-outcome-section.tsx`
  - Ersatte interna async `DeferredValueOwnerField` med synkron `ValueOwnerField`.
  - Lade till optional `valueOwners` prop och behöll fallback när owner-data saknas.
- `apps/web/src/app/(protected)/outcomes/[outcomeId]/page.tsx`
  - Hämtar value owners parallellt med outcome workspace och skickar in dem till `FramingOutcomeSection`.
- `apps/web/src/app/(protected)/framing/page.tsx`
  - Hämtar value owners tillsammans med vald outcome.
  - Invokerar `SelectedFramingOutcomeSection` via `await` innan JSX-returen.
- `apps/web/src/app/(protected)/review/page.tsx`
  - Invokerar `ActiveFramingReviewWorkspace` via `await` innan JSX-returen.
- Page-tests
  - Mockar Tollgate-undersektionen där den inte är testets fokus.
  - Uppdaterar assertions från loading fallback till färdig server-renderad workspace.
  - Lade till regression för att value-owner-fältet faller tillbaka stabilt när owner lookup misslyckas.

## Verification

- `pnpm test -- src/test/framing-cockpit.test.tsx src/test/outcome-workspace-page.test.tsx`
  - Pass: 2 testfiler, 5 tester.
- `pnpm test -- src/test/review-queue-page.test.tsx`
  - Pass: 1 testfil, 2 tester.
- `pnpm test -- src/test/framing-cockpit.test.tsx src/test/outcome-workspace-page.test.tsx src/test/review-queue-page.test.tsx`
  - Pass: 3 testfiler, 7 tester.
- `pnpm test`
  - Pass: 46 testfiler, 200 tester.
- `pnpm --filter @aas-companion/web build`
  - Pass.

## Notes

Fullsviten passerar nu utan de tidigare React-varningarna för:

- `ActiveFramingReviewWorkspace`
- `DeferredValueOwnerField`
- `OutcomeTollgateApprovalSection`
- `SelectedFramingOutcomeSection`
