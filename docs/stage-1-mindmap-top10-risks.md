# Stage 1 Mind Map and Top 10 Risks

Updated: 2026-05-26

This is the compressed stage-one deliverable: a funnel mind map with P0/P1/P2 risk labels plus a Top 10 risk table. The full risk register remains in `docs/risk-register.md`.

Mind map image:

![BetterMe funnel risk mind map](stage-1-mindmap-top10-risks.svg)

Mermaid source for the same funnel structure is available in `docs/funnel-state-map.mmd`; the reviewer-facing Markdown version is `docs/funnel-state-map.md`.

## Top 10 Risks

| Rank | Risk ID | Priority | Funnel area | Risk summary | Business impact | Coverage |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `R-036` | P0 | Checkout | Automation or user action enters third-party payment flow without guardrails | Real payment, financial harm, unsafe test execution | `TC-CO-001`, checkout safe probe, payment-domain blocking |
| 2 | `R-037` | P0 | Checkout | Declined-card probing runs without a hard safety gate | Production payment risk and candidate liability | `TC-CO-003`, explicit no-card-entry boundary |
| 3 | `R-034` | P0 | Paywall | Auto-renewal terms are hidden or unclear before purchase | Compliance complaints, refunds, chargebacks | `TC-PW-004`, renewal-copy evidence |
| 4 | `R-033` | P0 | Paywall | Original price, discounted price, total, or per-day price is inconsistent | Billing trust and revenue risk | `TC-PW-002`, `TC-PW-003` |
| 5 | `R-029` | P0 | Discount / Paywall | Promo code or discount does not carry from scratch card to Paywall | Price dispute and conversion loss | `TC-DS-002`, Paywall summary |
| 6 | `R-014` | P0 | Quiz Consent | User can continue without health-data consent | Health-data compliance risk | `TC-IN-005`, consent gate cases |
| 7 | `R-010` | P0 | Quiz Input | Height below 90 cm or above 243 cm is accepted | Invalid health calculations and credibility loss | `TC-IN-001` to `TC-IN-004` |
| 8 | `R-011` | P0 | Quiz Unit Switch | cm/ft or kg/lb unit state mixes or converts incorrectly | Wrong BMI and personalization | `TC-IN-011`, `TC-IN-012` |
| 9 | `R-023` | P0 | Email Capture | Empty or invalid email is accepted | Account creation and delivery failure | `TC-CP-001` to `TC-CP-003` |
| 10 | `R-041` | P1 | Cross-cutting | Responsive/browser differences hide CTAs, plan cards, or checkout controls | Users cannot complete funnel on key devices | `TC-XC-001` to `TC-XC-006`, cross-cutting probe |

## Risk Basis

- Main evidence run: `exploration/runs/2026-05-24-112646`
- Funnel taxonomy: `docs/page-taxonomy.md`
- Paywall and Checkout evidence: `docs/funnel-observation.md`, `docs/checkout-safe-probe.md`
- Cross-cutting evidence: `docs/cross-cutting-coverage-status.md`, `generated/2026-05-26-cross-cutting-probe/summary.md`
