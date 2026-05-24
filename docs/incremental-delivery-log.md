# Incremental Delivery Log

Updated: 2026-05-24

This log is a reviewer-friendly narrative of how the workspace grew over time. It complements `docs/progress-log.md`, which is closer to raw execution history.

## Increment 1: Establish Safe Web Exploration

Outcome:

- Built a Playwright-based BetterMe funnel explorer.
- Captured screenshots, text, HTML, URL, title and action logs per step.
- Stopped before payment-sensitive actions.

Key artifacts:

- `pipeline/explore_betterme.js`
- `pipeline/explore-helpers.js`
- `pipeline/browser-actions.js`
- `pipeline/playwright-runtime.md`
- `exploration/runs/2026-05-24-011613`

Why it matters:

- The assignment asks for AI Native testing, but high-quality AI output depends on observed product structure.
- This increment created reproducible evidence instead of relying on one-off manual browsing.

## Increment 2: Stabilize Quiz Automation

Problems found and handled:

- Footer `Subscription Policy` was misread as a Paywall signal.
- Text nested in spans required clicking parent controls.
- Health onboarding consent blocked height continuation.
- Diet group headers such as `WITH MEAT` were not real answers.
- Loader percentage text such as `3%` needed waiting, not clicking.

Key artifacts:

- `pipeline/tests/explore-helpers.test.js`
- `pipeline/tests/browser-actions.test.js`

Why it matters:

- These fixes made the exploration script robust enough to use as a data collection tool.

## Increment 3: Capture Discount and Paywall

Outcome:

- Added scratch-card support.
- Captured discount and Paywall details.
- Observed 30% discount and promo code `qa_may26`.
- Captured HKD plan pricing and auto-renewal copy.

Key artifacts:

- `exploration/runs/2026-05-24-104911`
- `docs/funnel-observation.md`
- `docs/page-taxonomy.md`
- `docs/risk-register.md`
- `docs/test-cases-v1.csv`

Why it matters:

- This turned the raw funnel path into page taxonomy, risk analysis and an initial 74-case test suite.

## Increment 4: Add Checkout-Safe Probe

Outcome:

- Added `BETTERME_CHECKOUT_PROBE=1`.
- Clicked one Paywall CTA in a controlled mode.
- Captured embedded checkout fields without entering card data.
- Recorded TokenEx iframe card fields.
- Blocked PayPal SDK.

Key artifacts:

- `docs/checkout-safe-probe.md`
- `exploration/runs/2026-05-24-112646/checkout-summary.md`

Safety statement:

- No real card was entered.
- No payment form was submitted.
- No successful payment was attempted.

Why it matters:

- Checkout coverage is necessary, but production-payment safety is non-negotiable.

## Increment 5: Add Repeatable Script-Generated Cases

Outcome:

- Added `pipeline/case-generator.js`.
- Generated 51 cases from `flow-log.json`.
- Added generator tests.
- Added AI workflow and prompt scaffold.

Key artifacts:

- `generated/2026-05-24-112646-cases/generated-test-cases.csv`
- `generated/2026-05-24-112646-cases/generated-test-cases.json`
- `docs/ai-generation-workflow.md`
- `prompts/case-generation-v1.md`

Why it matters:

- This addresses the "repeatable AI/script efficiency" requirement: the pipeline can regenerate drafts from fresh runs.

## Increment 6: Merge Final Test Case Delivery Set

Outcome:

- Added `pipeline/final-case-builder.js`.
- Merged the 74-case manual v1 set with script evidence.
- Produced 75 final cases.
- Added risk references, evidence references and refinement notes.

Key artifacts:

- `docs/test-cases-final.csv`
- `docs/test-cases-final.json`
- `pipeline/tests/final-case-builder.test.js`

Why it matters:

- The final case set now shows both human judgment and repeatable automation evidence.
- Each case points to risks and evidence, making review easier.

## Current Completion Snapshot

| Deliverable | Status |
| --- | --- |
| Funnel state map | Done |
| Page taxonomy | Done |
| Risk register | Done |
| Test case final set | Done, 75 cases |
| AI/script generation pipeline | Done, rule-based layer |
| AI prompt scaffold | Done, v1 |
| Checkout safe probe | Done |
| README/final packaging | Done |
| Demo script or video notes | Done |

## Recommended Next Increment

Create the final README and reviewer guide:

- What was built.
- How to run verification.
- Where the final test cases are.
- How safety boundaries were enforced.
- How AI/script generation improved efficiency.

## Increment 7: Add Reviewer Entry Point

Outcome:

- Added root `README.md`.
- Added `docs/final-review-guide.md`.
- Updated project artifact map and this incremental log.

Key artifacts:

- `README.md`
- `docs/final-review-guide.md`
- `docs/project-artifacts.md`

Why it matters:

- The project now has a clear first page for reviewers.
- Scoring areas are mapped to concrete artifacts.
- Verification commands and safety boundaries are visible without digging through implementation files.

## Increment 8: Add Submission Checklist and Demo Walkthrough

Outcome:

- Added `docs/submission-checklist.md`.
- Added `docs/demo-walkthrough.md`.
- Updated README, final review guide and artifact map.

Key artifacts:

- `docs/submission-checklist.md`
- `docs/demo-walkthrough.md`

Why it matters:

- The project now has a pre-submission quality gate.
- The demo notes give a clear 5-minute path through the deliverables.
- Known gaps and safety boundaries are explicitly disclosed.
