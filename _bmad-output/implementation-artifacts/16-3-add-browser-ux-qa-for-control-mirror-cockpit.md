# Story 16.3: Add Browser UX QA for Control Mirror Cockpit

Date: 2026-05-22
Status: done

## User Story

As a maintainer, I want browser-level UX coverage for the Control Mirror cockpit so that desktop and mobile layout quality does not depend only on component tests.

## Acceptance Criteria

1. Given the Control Mirror page opens on desktop, when the first viewport renders, then source judged, control posture, human decisions and evidence gaps are visible.
2. Given the page opens on mobile, when the executive cockpit renders, then the same control signals remain usable and no horizontal overflow is present.
3. Given the Value Spine diagram renders, when browser QA checks it, then the SVG is nonblank and untraced artifacts are shown outside the approved spine.
4. Given local Playwright bundled browsers are unavailable, when `PLAYWRIGHT_USE_INSTALLED_CHROME=1` is set, then the spec can run against installed Chrome.

## Implementation

- Added `apps/web/e2e/control-mirror.spec.ts`
  - Desktop cockpit visibility and no-horizontal-overflow checks.
  - Mobile cockpit visibility and no-horizontal-overflow checks.
  - SVG bounding-box checks for the Value Spine diagram.
- Updated `apps/web/playwright.config.ts`
  - Added `PLAYWRIGHT_USE_INSTALLED_CHROME=1` fallback.
  - Added `PLAYWRIGHT_SKIP_WEBSERVER=1` for running against a manually started dev server.
  - Disabled video when using installed Chrome fallback because bundled Playwright ffmpeg may also be unavailable.

## Verification

- Browser UX QA, run against installed Chrome and live Next dev server on port 3001:
  - `PLAYWRIGHT_USE_INSTALLED_CHROME=1`
  - `PLAYWRIGHT_SKIP_WEBSERVER=1`
  - `pnpm --filter @aas-companion/web test:e2e -- control-mirror.spec.ts --reporter=line --timeout=45000`
  - Pass: 2 tests.

## Notes

`pnpm exec playwright install chromium` was attempted but blocked by the local certificate chain (`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`). The fallback keeps TLS strict and uses the locally installed Chrome instead of disabling certificate validation.
