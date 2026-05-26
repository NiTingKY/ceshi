# Stage 4 Coverage Review

Updated: 2026-05-26

This document records the required "AI as critic" review over the full case set, then records the human decision for each suggestion. The repository now includes real SiliconFlow `Qwen/Qwen3-8B` model calls at `generated/2026-05-24-112646-cases/llm-log.json` and `generated/2026-05-26-ai-native-run/llm-log.json`; this review also preserves earlier human decisions based on `docs/test-cases-final.csv`, `docs/risk-register.md`, and the original task specification stored at `docs/task-spec/riqi-ai-native-qa-5-day-challenge.pdf`.

## Reviewed Inputs

- Final case set: `docs/test-cases-final.csv`
- Case count: 106
- Source distribution: `AI` 31, `AI+manual` 56, `manual` 18, `script-generated+review-needed` 1
- Manual or AI+manual ratio: 74/106 = 69.8%
- Risk register: `docs/risk-register.md`, 45 risks
- Evidence run: `exploration/runs/2026-05-24-112646`
- API log: `generated/2026-05-26-ai-native-run/llm-log.json`

## SiliconFlow Qwen3-8B Critic Result

Latest SiliconFlow result:

- Verdict: partial coverage with critical P0 risks addressed, but gaps still exist in some high-value resilience and navigation scenarios.
- Suggested gaps: Paywall/Checkout resilience, navigation consistency, Event Date constraints, and loader performance thresholds.
- Suggested additions: Paywall plan-selection edge cases, safe Checkout error-state handling, date picker past-date checks, and loader timeout alert behavior.
- Accounting: 1 API call, 83034 ms, 4519 prompt tokens, 1744 completion tokens, 6263 total tokens.
- Human correction: an earlier model run incorrectly claimed Checkout had no P0 cases. Final CSV already includes P0 Checkout safety and validation cases, so that earlier model statement remains rejected.

## AI Critic Suggestions and Human Decisions

| AI critic suggestion | Human decision | Reason |
| --- | --- | --- |
| Add page-prototype documentation instead of relying only on cases | Adopted | `docs/page-taxonomy.md` classifies observed pages into prototypes and maps the 46-step main path |
| Add exact height boundary values | Adopted | Final cases use `89/90/243/244`, tied to observed validation behavior |
| Add weight unit-switch cases | Adopted | `TC-IN-012` covers kg/lb state preservation; deeper conversion matrices remain future work |
| Add explicit health-data consent cases | Adopted | `TC-IN-005` and `TC-IN-006` cover unchecked and checked consent behavior |
| Add Paywall plan price and original-price checks | Adopted | `TC-PW-001` to `TC-PW-003` cover plan count, HKD discounted prices, and per-day consistency |
| Add subscription renewal disclosure coverage | Adopted | `TC-PW-004` verifies recurring HK$280 every 4 weeks notice before purchase decision |
| Add countdown expiry and local-time tampering | Partially adopted | `TC-PW-007` covers deterministic expiry behavior; local-time tampering is not executed without a safe test environment |
| Add direct Paywall/Checkout bypass attempts through URL, localStorage, cookie, or DOM | Deferred | This is relevant risk coverage, but the current production-site boundary avoids invasive bypass probing |
| Add checkout declined-card test using the known declined card | Reframed | `TC-CO-003` verifies declined-card probing remains disabled without an explicit hard gate |
| Add third-party wallet coverage | Adopted with safety boundary | `TC-CO-006` checks wallet entrances but does not invoke real wallet flows |
| Add localization across two languages/regions | Adopted with disclosure | `docs/test-cases-coverage-extension.csv` adds locale, currency, date-format, translation-overflow, and policy-link cases; HKD path is observed, while full real-region execution remains future work |
| Add accessibility cases for keyboard, focus, ARIA, and contrast | Partly executed | `docs/test-cases-coverage-extension.csv` adds the cases and `generated/2026-05-26-cross-cutting-probe/summary.md` records captured-page control metadata; full WCAG/axe review remains future work |
| Add browser/device compatibility matrix | Partly executed | `docs/test-cases-coverage-extension.csv` adds mobile/tablet/desktop/browser cases and the cross-cutting probe renders captured pages at 375, 768 and 1440 widths; Safari, mobile Safari, Firefox and WeChat still need real-device execution |
| Add performance and analytics cases | Partly executed | The cross-cutting probe records local render timing and analytics-like URL inventory from saved run metadata; backend event correctness still needs internal analytics specs |
| Add subscription lifecycle design: trial, active, renewal failure, cancel, refund, upgrade/downgrade | Adopted as design coverage | `TC-SUB-001` to `TC-SUB-008` cover lifecycle state-transition expectations without requiring real purchase |
| Add at least 10 P0 cases as Playwright/Cypress automation | Deferred optional | This belongs to optional stage 5, not the required stage 4 documentation pass |
| Add Event Date date picker anomaly cases | Adopted for next pass | The model correctly identified that Event Date coverage can be deeper beyond current two cases |
| Add Loader stalled-progress timing threshold | Adopted for next pass | Current loader cases cover progress and refresh, but not a strict timing threshold |
| Add deeper Unit Switch conversion matrix | Adopted for next pass | Current unit cases cover state preservation, but not exact numerical conversion accuracy |
| Treat "Checkout has no P0 cases" as a finding | Rejected | Final CSV already has P0 Checkout cases including `TC-CO-001`, `TC-CO-002`, `TC-CO-003`, `TC-CO-004`, `TC-CO-005`, and `AUTO-046-01` |

## Coverage Strengths

- The final set covers the primary funnel: Quiz -> Discount -> Paywall -> Checkout.
- Every final case has `riskRefs` and `evidence`.
- P0 coverage is strong in consent, input validation, pricing, subscription disclosure, discount, and checkout safety.
- Checkout handling is appropriately conservative for a production payment flow.
- Human contribution is clearly above the original task's elimination threshold.

## Remaining Gaps

These are not stage 4 blockers, but they should be disclosed for full task-book alignment:

- Live SiliconFlow LLM call exists with token count and duration, but model suggestions still require human review.
- Prompt v2/v3 are archived as process versions, not separate runnable prompt files.
- Accessibility coverage is partly executed through captured-page control metadata, but a full WCAG/axe/screen-reader pass remains future work.
- Some localization and currency comparison cases remain design-disclosed until separate safe-region runs are approved.
- Browser/device compatibility now has captured-page viewport evidence for 375/768/1440 widths, but Safari, mobile Safari, Firefox, and WeChat still need real-device execution evidence.
- Subscription lifecycle is represented as design coverage, but post-purchase execution remains out of scope without staging or sandbox billing.
- Demo video is still outside this stage 4 pass; the architecture diagram is now available at `docs/architecture-diagram.md`.

## Human Review Conclusion

The current case set is strong enough to demonstrate QA design judgment for the main funnel and now includes explicit task-book coverage plus partial executable evidence for compatibility, accessibility, performance and analytics inventory. The highest-value next work is Demo video packaging, safe-region localization execution, and optional executable P0 automation.
