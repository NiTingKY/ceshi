# Cross-Cutting Coverage Status

Updated: 2026-05-26

This document separates executed evidence from design-disclosed coverage for the task-book areas that are difficult to fully execute against a production payment funnel: compatibility, accessibility, localization, performance/analytics, and subscription lifecycle.

Primary evidence:

- Final cases: `docs/test-cases-final.csv`
- Coverage extension source: `docs/test-cases-coverage-extension.csv`
- Executable probe summary: `generated/2026-05-26-cross-cutting-probe/summary.md`
- Executable probe JSON: `generated/2026-05-26-cross-cutting-probe/results.json`
- Branch execution plan: `docs/branch-coverage-plan.md`

## Status Matrix

| Area | Final cases | Current status | What is now evidenced | Remaining disclosed gap |
| --- | --- | --- | --- | --- |
| Compatibility | `TC-XC-001` to `TC-XC-006` | Partly executed | Captured pages are rendered at mobile 375, tablet 768, and desktop 1440 sizes by `pipeline/cross-cutting-probe.js`; screenshots and overflow checks are stored under `generated/2026-05-26-cross-cutting-probe/`. | Safari, mobile Safari, Firefox, and WeChat in-app browser still need real-device or approved browser execution. |
| Accessibility | `TC-A11Y-001` to `TC-A11Y-006` | Partly executed | The probe extracts focusable-control counts and unlabeled-control counts from representative captured pages, and Checkout iframe metadata is already documented in `docs/checkout-safe-probe.md`. | Full WCAG review, screen-reader pass, contrast tooling, and axe-style automated audit remain future work. |
| Localization | `TC-LOC-001` to `TC-LOC-005` | Design-disclosed with one observed HKD path | HKD Paywall and Checkout-adjacent currency consistency are observed in the main run and safe Checkout summary. | True cross-region price, currency, policy-link, and translation checks require approved safe-region execution. |
| Performance and analytics | `TC-PERF-001` to `TC-PERF-003`; `TC-AN-001` to `TC-AN-003` | Partly executed | The probe records local render timing for captured pages and inventories analytics-like hosts from saved run metadata without logging sensitive payloads. | Backend event correctness, exact funnel-event names, production analytics validation, and real network throttling still need internal specs or approved execution. |
| Subscription lifecycle | `TC-SUB-001` to `TC-SUB-008` | Design-disclosed | Paywall renewal copy and subscription terms are connected to lifecycle test design without performing a real purchase. | Trial, active, renewal success/failure, grace, cancel, refund, upgrade, and downgrade execution require staging, sandbox billing, or a test account with explicit approval. |

## Reviewer Interpretation

These areas are no longer blank or purely hand-waved: the final CSV contains explicit cases and the probe adds reproducible evidence for the parts that can be checked safely from captured production pages. The remaining gaps are intentionally disclosed because executing them fully would require devices, browsers, regions, internal analytics specifications, or post-purchase subscription states that are outside the safe production-site boundary.

## Next Execution Order

1. Run `npm run probe:cross-cutting` after any new exploration run to refresh viewport, accessibility metadata, local timing, and analytics-like URL inventory.
2. Add one approved locale or region run and update `TC-LOC-*` evidence from design-disclosed to partly executed.
3. Run Safari/mobile Safari/Firefox/WeChat smoke checks manually or through an approved device cloud and attach screenshots.
4. Execute subscription lifecycle cases only in staging, sandbox billing, or an explicitly approved test account.
