# Branch Coverage Expansion Plan

Updated: 2026-05-24

The current repository contains deep evidence for one main BetterMe Pilates funnel path. This plan defines the next low-risk expansion so future work can compare personalization, pricing, and recommendation behavior across multiple user profiles.

## Current Baseline

Current best evidence run:

- `exploration/runs/2026-05-24-112646`

Covered path:

- Quiz entry
- Profile and lifestyle questions
- Height and weight inputs
- Health consent
- Loader
- Email and name capture
- Discount scratch-card
- Paywall
- Checkout-safe surface inspection

## Proposed Additional Branches

| Branch | Difference from baseline | Primary risk focus | Evidence to capture |
| --- | --- | --- | --- |
| Age contrast | Select a different age band at entry | Segmentation and entry routing | `exploration/runs/<new-run-id>/summary.md`, `exploration/runs/<new-run-id>/flow-log.json`, first 10 screenshots |
| Goal contrast | Choose toning or mobility instead of weight loss | Recommendation copy and plan positioning | Page text, Paywall copy, generated plan claims |
| Metric/imperial contrast | Switch between cm/kg and ft/lbs | Unit conversion and BMI consistency | Input pages, calculated profile text, final plan copy |
| Event date boundary | Select near-future and cross-month dates | Date picker validation and personalization timing | Date page text, selected date state, downstream copy |
| Price/localization contrast | Re-run from a controlled alternate locale if approved | Price, currency, discount, renewal disclosure | Paywall summary and renewal copy |

## Execution Rules

- Keep production-site safety unchanged.
- Do not enter real payment data.
- Use checkout-safe probe only when explicitly needed.
- Store each new run under `exploration/runs/<timestamp>`.
- Add a one-page branch summary before merging evidence into final cases.
- Compare only observed facts; do not infer pricing or personalization changes without captured evidence.

## Minimum Useful Increment

The smallest useful next increment is one additional age or goal contrast run. It should produce:

- `exploration/runs/<new-run-id>/summary.md`
- `exploration/runs/<new-run-id>/flow-log.json`
- selected screenshots
- `docs/branch-comparison-<timestamp>.md`

After that, update:

- `docs/funnel-observation.md`
- `docs/risk-register.md` if new risks appear
- `docs/test-cases-final.csv` only if the branch reveals genuinely new coverage
