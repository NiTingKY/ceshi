# Stage 4 AI Blind Spot List

Updated: 2026-05-25

This document lists cases that generic AI output missed, weakened, or made unsafe before human review. It explains what the model lacked and how the final case set corrected the gap.

Source artifacts:

- `docs/test-cases-final.csv`
- `docs/page-taxonomy.md`
- `docs/risk-register.md`
- `docs/funnel-observation.md`
- `docs/checkout-safe-probe.md`
- `exploration/runs/2026-05-24-112646`

| Final case | Blind spot | Why AI missed it | Human correction |
| --- | --- | --- | --- |
| `TC-QZ-009` | Empty multi-select should block continuation | Generic generation assumed every question has a default or can continue after any tap | Added explicit empty-selection validation for target zones, linked to `R-006` |
| `TC-QZ-014` | `None of the above` must be mutually exclusive | The model treated all multi-select options as independent checkboxes | Added conflict-state check for sensitive areas and linked to `R-007` |
| `TC-QZ-025` | Diet group heading such as `WITH MEAT` is not an answer | AI flattened visible text and could not infer visual grouping from text alone | Added a case that taps heading area and verifies it is non-selectable, linked to `R-009` |
| `TC-IN-001` | Height below 90 cm must be rejected | Generic boundary output did not know the observed min value | Used captured validation range and added `89` as min-1 |
| `TC-IN-004` | Height above 243 cm must be rejected | Generic boundary output suggested "very tall" without exact value | Used observed max range and added `244` as max+1 |
| `TC-IN-005` | Health data consent is a compliance gate | Generic quiz cases focused on form mechanics, not privacy/health consent | Added manual P0 compliance case requiring unchecked consent to block continuation |
| `TC-IN-010` | Goal weight equal to current weight needs intentional handling | AI assumed all users are in a weight-loss journey | Added maintain-weight contradiction check so personalization does not produce a misleading loss plan |
| `TC-CP-005` | Name field can become an XSS/display risk | AI produced "enter normal name" only and missed personalization injection | Added `<script>alert(1)</script>` escaping case linked to `R-025` |
| `TC-DS-003` | Discount refresh should preserve promo state | AI covered scratch success but not re-entry consistency | Added refresh/recovery case for promo-code consistency linked to `R-030` and `R-039` |
| `TC-PW-003` | Per-day price must reconcile with discounted total or approved rounding | AI repeated visible prices without checking commercial consistency | Added manual pricing judgment case linked to `R-033` |
| `TC-PW-004` | Auto-renewal terms must be visible before purchase decision | AI treated subscription disclosure as generic footer copy | Added P0 compliance case for HK$280 every 4 weeks renewal notice |
| `TC-PW-007` | Countdown expiry behavior must be deterministic | AI suggested waiting or changing local time without safety context | Added boundary/design case that requires a safe test env or defined expiry behavior |
| `TC-CO-001` | Payment domains must be blocked during automation | AI generated checkout actions without production-site guardrails | Added safety case that records blocked Stripe/PayPal requests and avoids payment completion |
| `TC-CO-003` | Declined-card probing must be disabled by default | AI saw a declined test card as a normal test input | Added explicit safety-gate case instead of default card entry |
| `AUTO-046-01` | Checkout fields are inside third-party iframes | Text-only AI could not see TokenEx iframe structure | Kept script-derived field-capture case with review-needed source and checkout evidence |

## Pattern Summary

The AI was most useful for broad case enumeration and wording cleanup. It was weakest where the answer depended on:

- visual hierarchy, such as headings versus selectable options;
- captured numeric boundaries, such as `90` and `243`;
- production safety judgment around payment flows;
- compliance interpretation for health data and renewal terms;
- stateful funnel behavior after refresh, back, or re-entry;
- third-party iframe/payment architecture.

The final case set therefore keeps a high manual-review ratio: `AI+manual` plus `manual` accounts for 74 of 106 final cases, or 69.8%. This is intentionally above the task specification's minimum threshold for human contribution.
