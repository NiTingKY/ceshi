# Demo Walkthrough Notes

Updated: 2026-05-24

This is a suggested walkthrough for presenting the project.

## 1-Minute Version

Say:

> This repository is a BetterMe Pilates AI Native QA delivery package. The final output is 106 traceable test cases, a 45-risk register, Playwright-based funnel evidence, a safe checkout probe, and a repeatable AI Native pipeline that generates draft cases, runs Qwen3-8B review, and builds final CSV/JSON output.

Open:

- `README.md`
- `docs/assignment-alignment.md`
- `docs/test-cases-final.csv`

Close with:

> The main boundary is explicit: checkout was inspected safely without real card entry or payment submission, and LLM refinement is documented as a dry-run rather than overclaimed as a live model result.

## 3-Minute Version

1. Open `docs/assignment-alignment.md` and show the requirement-to-artifact mapping.
2. Open `docs/test-cases-final.csv` and show 106 cases with `riskRefs` and `evidence`.
3. Open `docs/risk-register.md` and show the 40 risk IDs.
4. Open `docs/checkout-safe-probe.md` and explain the safety boundary.
5. Open `docs/llm-refinement-record.md` and explain how LLM output would be reviewed before merging.

## 5-Minute Version

## 0:00 - 0:30 Opening

Say:

> This project is a QA design and AI-assisted testing workflow for the BetterMe Pilates funnel: Quiz, Discount/Paywall and Checkout. The goal was not to prove real bugs, but to show test design ability, safe production exploration, and repeatable AI/script efficiency.

Open:

- `README.md`
- `docs/assignment-alignment.md`

Point out:

- final test case set
- assignment alignment matrix
- risk register
- checkout safety record
- AI/script workflow
- incremental delivery log

## 0:30 - 1:30 Final Test Case Set

Open:

- `docs/test-cases-final.csv`

Say:

> The final case set has 106 cases. It keeps the broader manual/AI-assisted v1 coverage, adds script-derived checkout iframe evidence, and adds coverage-extension cases for compatibility, accessibility, localization, performance, analytics and subscription lifecycle. Each case includes priority, type, precondition, steps, expected result, source, risk references and evidence references.

Show:

- Filter or scan `priority=P0`.
- Show Checkout, Paywall, Consent, Input and Discount modules.
- Show `riskRefs` and `evidence` columns.

## 1:30 - 2:10 Funnel and Risk Understanding

Open:

- `docs/page-taxonomy.md`
- `docs/risk-register.md`

Say:

> The funnel was first captured with Playwright and then normalized into reusable page types: single-select, multi-select, consent input, unit input, loader, discount, Paywall and checkout surface. The risk register has 45 risks, and the final test cases reference those risk IDs.

Point out:

- page categories
- R-014/R-015 consent risks
- R-028/R-030 discount risks
- R-031/R-038 Paywall/Checkout risks

## 2:10 - 3:00 Checkout Safety

Open:

- `docs/checkout-safe-probe.md`
- `exploration/runs/2026-05-24-112646/checkout-summary.md`

Say:

> Checkout was handled with a hard safety boundary. The probe mode is explicitly gated by `BETTERME_CHECKOUT_PROBE=1`. It expands the embedded checkout component, captures visible payment fields and frames, blocks PayPal SDK, and stops without entering any card or submitting payment.

Point out:

- captured fields: cardholder name, card number, expiration date, CVV
- TokenEx iframes
- blocked PayPal request
- no real payment submitted

## 3:00 - 4:00 AI / Script Efficiency

Open:

- `docs/ai-generation-workflow.md`
- `docs/llm-refinement-record.md`
- `pipeline/case-generator.js`
- `pipeline/final-case-builder.js`
- `generated/2026-05-24-112646-cases/generated-test-cases.csv`

Say:

> Instead of only asking AI to write cases manually, I built a repeatable script layer. It parses `exploration/runs/2026-05-24-112646/flow-log.json`, classifies pages, generates draft cases, and then merges them with manually reviewed cases while adding risk and evidence traceability. I also ran a real SiliconFlow `Qwen/Qwen3-8B` review and logged the prompt, output, duration, and token usage before applying any human decisions.

Point out:

- generated 51 script-derived cases
- final merged 106 cases
- prompt v1/v2/v3 and real LLM review logs exist, with human accept/reject rules

## 4:00 - 4:40 Incremental Process

Open:

- `docs/incremental-delivery-log.md`

Say:

> This log shows the project was built incrementally: first safe exploration, then Quiz stabilization, then Discount and Paywall, then Checkout-safe probe, then generated cases, then final case merge, and finally reviewer packaging.

Point out:

- Increment 4 checkout safe probe
- Increment 5 script-generated cases
- Increment 6 final merged cases
- Increment 7 reviewer entry point

## 4:40 - 5:00 Verification

Open:

- `docs/submission-checklist.md`

Say:

> The verification commands are listed here. The latest state has all test files passing, the final CSV has 106 rows, and every case has risk and evidence fields.

Point out:

- 16/16 helper tests
- 6/6 browser action tests
- 4/4 case generator tests
- 5/5 final case builder tests
- final rows: 106
- missing risk/evidence: 0

## If Asked About Gaps

Say:

> The known gaps are intentionally documented. LLM refinement is scaffolded but not executed against a real model, declined-card testing is not enabled by default, and only one main user profile path has deep exploration. I kept those boundaries explicit to avoid overclaiming.

Reference:

- `docs/final-review-guide.md`
- `docs/submission-checklist.md`

## If Asked Why This Is AI Native

Say:

> The AI-native part is not just generated text. The workflow creates structured evidence, converts it into machine-readable cases, adds risk and evidence mapping, and keeps prompt scaffolding for LLM refinement. That makes the process repeatable when the product changes.
