# Stage 4 Coverage Review

Updated: 2026-05-26

This document records the required "AI as critic" review over the full case set, then records the human decision for each suggestion. The repository now includes a real SiliconFlow `Qwen/Qwen3-8B` model call at `generated/2026-05-24-112646-cases/llm-log.json`; this review also preserves earlier human decisions based on `docs/test-cases-final.csv`, `docs/risk-register.md`, and the original task specification stored at `docs/task-spec/riqi-ai-native-qa-5-day-challenge.pdf`.

## Reviewed Inputs

- Final case set: `docs/test-cases-final.csv`
- Case count: 75
- Source distribution: `AI` 31, `AI+manual` 25, `manual` 18, `script-generated+review-needed` 1
- Manual or AI+manual ratio: 43/75 = 57.3%
- Risk register: `docs/risk-register.md`, 40 risks
- Evidence run: `exploration/runs/2026-05-24-112646`
- API dry-run log: `generated/2026-05-24-112646-cases/llm-log.json`

## SiliconFlow Qwen3-8B Critic Result

Latest SiliconFlow result:

- Verdict: partial coverage with notable gaps in Event Date, Loader, and Unit Switch modules.
- Suggested gaps: date picker anomalies, stalled loader progress, and deeper unit conversion validation.
- Suggested additions: Event Date past-date rejection, cross-month date selection, loader timing threshold, weight unit conversion accuracy.
- Accounting: 1 API call, 57594 ms, 4455 prompt tokens, 1047 completion tokens, 5502 total tokens.
- Human correction: the model incorrectly claimed Checkout has no P0 cases. Final CSV already includes P0 Checkout safety and validation cases, so that model statement is rejected.

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
| Add localization across two languages/regions | Deferred | Current evidence is one observed HKD path; cross-region comparison needs separate safe runs |
| Add accessibility cases for keyboard, focus, ARIA, and contrast | Deferred | Current final set has limited explicit a11y coverage; this is a real gap for a later pass |
| Add browser/device compatibility matrix | Deferred | Current evidence is browser-automation focused; responsive/device matrix is documented as needed but not executed |
| Add performance and analytics cases | Deferred | Loader and funnel resilience are covered, but analytics/performance instrumentation is not verified |
| Add subscription lifecycle design: trial, active, renewal failure, cancel, refund, upgrade/downgrade | Deferred | The task asks for design coverage, but current product access only reaches pre-purchase Checkout safely |
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
- Accessibility coverage is not deep enough.
- Localization and currency comparison are not executed.
- Browser/device compatibility is designed but not evidenced across Chrome, Safari, Firefox, mobile Safari, or WeChat.
- Subscription lifecycle cases are not fully represented.
- Demo video and architecture diagram are still outside this stage 4 pass.

## Human Review Conclusion

The current case set is strong enough to demonstrate QA design judgment for the main funnel, especially around risk traceability and production payment safety. It is not yet a complete implementation of every original task-book item. The highest-value next work is to add compatibility, accessibility, localization, subscription-lifecycle, Event Date, Loader timing, and Unit Switch conversion cases.
