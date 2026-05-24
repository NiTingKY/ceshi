# LLM Refinement Dry-Run Record

Updated: 2026-05-24

This record closes the AI Native workflow loop without making an unsupported claim that a live model call was used. It shows how the prompt scaffold would refine script-generated or merged cases, what outputs are acceptable, and how a reviewer should validate them before accepting changes.

## Purpose

The deterministic scripts already generate and merge cases from browser evidence. The LLM refinement slot is intended to improve wording, sharpen expected results, and identify missing risk tags while preserving traceability.

Prompt scaffold:

- `prompts/case-generation-v1.md`

Input candidates:

- `docs/test-cases-final.json`
- `generated/2026-05-24-112646-cases/generated-test-cases.json`
- selected page snippets from `exploration/runs/2026-05-24-112646/pages/`

## Dry-Run Input Sample

```json
[
  {
    "id": "TC-QZ-014",
    "module": "Consent",
    "priority": "P0",
    "type": "Compliance",
    "title": "Health data consent is required",
    "precondition": "Height input page is visible",
    "steps": "Enter height without checking consent, then tap NEXT STEP",
    "expected": "The page blocks continuation until consent is checked",
    "riskRefs": "R-014; R-015",
    "evidence": "docs/page-taxonomy.md; docs/risk-register.md; exploration/runs/2026-05-24-112646/summary.md"
  },
  {
    "id": "TC-PW-004",
    "module": "Paywall",
    "priority": "P0",
    "type": "Pricing",
    "title": "Discounted Paywall pricing is visible before purchase",
    "precondition": "Paywall is visible after scratch-card discount",
    "steps": "Inspect plan cards, selected plan, price, per-day price and renewal copy",
    "expected": "Discounted price, original price and renewal copy are visible before purchase CTA",
    "riskRefs": "R-031; R-032; R-033; R-034; R-035",
    "evidence": "docs/funnel-observation.md; exploration/runs/2026-05-24-112646/paywall-summary.md"
  },
  {
    "id": "AUTO-046-01",
    "module": "Checkout",
    "priority": "P0",
    "type": "Safety",
    "title": "Checkout payment fields are captured without submitting payment",
    "precondition": "Checkout surface is visible in safe probe mode",
    "steps": "Inspect cardholder, card number, expiry, CVV and payment CTA without entering real card data",
    "expected": "Payment fields are present and no payment is submitted",
    "riskRefs": "R-036; R-037; R-038",
    "evidence": "docs/checkout-safe-probe.md; exploration/runs/2026-05-24-112646/checkout-summary.md"
  }
]
```

## Expected LLM Output Shape

```json
[
  {
    "id": "TC-QZ-014",
    "title": "Block continuation until health data consent is explicitly checked",
    "steps": "Enter a valid height value, leave the health data consent checkbox unchecked, and tap NEXT STEP.",
    "expected": "The CTA does not advance the funnel and the user remains on the height/consent step until the consent checkbox is checked.",
    "riskRefs": "R-014; R-015",
    "reviewNote": "Sharper compliance wording; preserves original evidence and risk IDs."
  },
  {
    "id": "TC-PW-004",
    "title": "Show discounted plan price, original price, per-day price, and renewal terms before purchase",
    "steps": "Open the Paywall after the discount reveal and inspect each visible plan card, the selected plan state, per-day price, and subscription renewal copy.",
    "expected": "The selected plan clearly displays original and discounted prices, per-day price, purchase CTA, and renewal terms before the user can enter payment details.",
    "riskRefs": "R-031; R-032; R-033; R-034; R-035",
    "reviewNote": "Adds subscription disclosure to the expected result without changing scope."
  },
  {
    "id": "AUTO-046-01",
    "title": "Inspect TokenEx-hosted checkout fields in safe probe mode without payment submission",
    "steps": "Enable the checkout-safe probe, expand the embedded payment component, inspect cardholder name, card number, expiry, CVV, wallet entrances and CTA text, then stop before entering card data.",
    "expected": "The checkout surface exposes the expected card fields and wallet entrances, external payment requests are blocked or recorded, and no card data or payment submission is attempted.",
    "riskRefs": "R-036; R-037; R-038",
    "reviewNote": "Improves third-party iframe and blocked-request traceability."
  }
]
```

## Human Review Rules

Accept an LLM suggestion only if all rules pass:

- Case `id` is unchanged.
- `riskRefs` only contain IDs defined in `docs/risk-register.md`.
- Existing `evidence` references are preserved or strengthened.
- Checkout text does not instruct the tester to enter a real card or submit payment.
- The expected result is observable from the product or current evidence.
- The LLM does not invent prices, claims, regions, devices, or bugs.

## Dry-Run Decision

The sample output is acceptable as wording refinement, but it should not replace the final CSV automatically. A future implementation should write model output to `generated/<run-id>-cases/llm-log.json`, validate it with `pipeline/project-audit.js`, then merge only reviewed fields into a new final case artifact.
