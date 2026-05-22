# AAS Control Mirror Post-Implementation QA

Date: 2026-05-21

## Scope

Reviewed the completed MVP Control Mirror implementation across the deterministic domain rules, Control Mirror page, focused tests and BMAD sprint artifacts.

## Findings

### Resolved During QA

- **AI Risk Ledger guardrail was too permissive.**
  - Before: a normal Outcome `riskProfile` satisfied the commercial `risk_ledger` guardrail.
  - Risk: Control Mirror could fail to flag a missing AI Risk Ledger while still allowing higher AI-level claims to look better evidenced than they are.
  - Fix: the guardrail now requires imported `ai_risk_ledger` artifact evidence or a signoff evidence reference that explicitly mentions a risk ledger / risk register / AI risk.
  - Coverage: added a unit test proving an Outcome risk profile alone does not satisfy the AI Risk Ledger guardrail.

- **Governance funding evidence matching was too broad.**
  - Before: any artifact or signoff reference containing `governance` could satisfy the funding guardrail.
  - Risk: generic governance evidence could be mistaken for commercial funding / Margin Gate evidence.
  - Fix: matching now requires funding, Margin Gate, commercial, or the explicit phrase `governance funding`.

## Verification

- `pnpm test -- src/test/control-mirror-rules.test.ts src/test/control-mirror-page.test.tsx` - passed, 11 tests
- `pnpm --filter @aas-companion/web build` - passed

## Residual Notes

- The current Human Review integration links generated Control Mirror review items into `/review` with stable ids. It does not create a new persisted Human Review table in this MVP.
- Existing warnings remain unrelated to this feature pass:
  - React test warnings for non-boolean `jsx` / `global` attributes.
  - Webpack cache snapshot warnings during Next build.
  - Next ESLint plugin warning.
