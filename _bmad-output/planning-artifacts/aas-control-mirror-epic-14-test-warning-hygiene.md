# Epic 14: Test Warning Hygiene

Datum: 2026-05-22
Status: Done

## Mål

Sänka brusnivån i den gröna release-gaten så att framtida testfel blir lättare att se.

## Scope

- Ta bort React DOM-varningar från sidebarens global style-injektion i Vitest.
- Täta framing page-testets actionmockar så sidan inte loggar kontrollerade renderfel på grund av saknade exports.
- Behåll fullsviten grön efter ändringen.

## Acceptance Criteria

1. Given sidebaren renderas i Vitest, when global guidance CSS injiceras, then React får inte non-boolean `jsx`/`global` DOM-attribut.
2. Given framing cockpit-testet renderar vald Framing-sektion, when sidan läser framing/outcome actions, then testmocken innehåller de importer som sidan behöver.
3. Given full release-gate körs, when `pnpm test` och webbuild körs, then båda passerar.

## Out Of Scope

Async Server Component-varningar i page-tests kvarstår. De behöver en separat strukturell test-helper eller en rendering boundary-ändring eftersom de kommer från serverkomponenter som körs genom React Testing Librarys klientrendering.
