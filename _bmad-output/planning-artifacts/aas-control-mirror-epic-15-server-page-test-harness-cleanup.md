# Epic 15: Server Page Test Harness Cleanup

Datum: 2026-05-22
Status: Done

## Mål

Ta bort de kvarvarande React async Server Component-varningarna från page-testernas release-gate utan att försämra route-beteendet.

## Scope

- Flytta value-owner-hämtning för Framing/Outcome upp till page/server-lagret och rendera value-owner-selecten synkront.
- Rendera vald Framing-sektion och aktiv Human Review import-workspace via `await` i page-funktionerna i stället för som nested async komponenter i React Testing Library.
- Mocka Tollgate-undersektionen i page-tests där den inte är testets huvudkontrakt.
- Uppdatera page-testförväntningar från loading fallback till färdigrenderad server-output.

## Acceptance Criteria

1. Given Framing, Outcome och Review page-tests körs, when React Testing Library renderar page-resultatet, then outputen saknar async Server Component-varningar.
2. Given value-owner-data inte kan hämtas, when Framing/Outcome renderas, then value-owner-fältet visar fallback utan runtime-krasch.
3. Given release-gaten körs, when `pnpm test` och `pnpm --filter @aas-companion/web build` körs, then båda passerar.

## Beslut

- Behåll page-funktionerna som den server-async boundary som hämtar data.
- Undvik att klientrenderade tester behöver hantera nested async komponenter.
- Testa page-kontrakt mot färdig server-output, inte mot Suspense fallback när sidan redan inväntar datat.
