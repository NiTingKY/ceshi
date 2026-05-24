# Submission Checklist

Updated: 2026-05-24

Use this checklist before packaging or presenting the BetterMe AI Native QA assignment.

## Required Deliverables

- [x] Final test cases are available: `docs/test-cases-final.csv`
- [x] JSON mirror is available: `docs/test-cases-final.json`
- [x] Funnel observation is documented: `docs/funnel-observation.md`
- [x] Page taxonomy is documented: `docs/page-taxonomy.md`
- [x] Risk register is documented: `docs/risk-register.md`
- [x] Checkout safe probe is documented: `docs/checkout-safe-probe.md`
- [x] AI/script workflow is documented: `docs/ai-generation-workflow.md`
- [x] Artifact map is documented: `docs/project-artifacts.md`
- [x] Incremental delivery log is documented: `docs/incremental-delivery-log.md`
- [x] Final review guide is documented: `docs/final-review-guide.md`
- [x] Demo walkthrough is documented: `docs/demo-walkthrough.md`

## Quality Checks

- [x] Final case count is 75.
- [x] Every final case has `riskRefs`.
- [x] Every final case has `evidence`.
- [x] Checkout cases explicitly preserve payment safety boundaries.
- [x] Final cases include both manual/AI-assisted and script-generated evidence.
- [x] Risk register has 40 risks.
- [x] Project has a clear reviewer entry point: `README.md`.

## Verification Commands

Run these before submission:

Portable path:

```powershell
npm install
npm test
```

Original local Codex-runtime commands:

```powershell
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\explore-helpers.test.js

$base='C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$base;$base\.pnpm\playwright@1.60.0\node_modules;$base\.pnpm\playwright-core@1.60.0\node_modules"
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\browser-actions.test.js

& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\case-generator.test.js
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\final-case-builder.test.js
```

Expected latest verification:

- `explore-helpers.test.js`: 16/16 pass
- `browser-actions.test.js`: 6/6 pass
- `case-generator.test.js`: 4/4 pass
- `final-case-builder.test.js`: 5/5 pass

Check final case integrity:

```powershell
$final = Import-Csv -LiteralPath 'docs\test-cases-final.csv'
$final.Count
($final | Where-Object { -not $_.riskRefs }).Count
($final | Where-Object { -not $_.evidence }).Count
```

Expected:

- final rows: 75
- missing risk refs: 0
- missing evidence refs: 0

## Safety Checks

- [x] No real card was used.
- [x] No payment form was submitted.
- [x] Checkout probing is gated by `BETTERME_CHECKOUT_PROBE=1`.
- [x] PayPal SDK request was blocked and recorded.
- [x] TokenEx iframe fields were observed without entering payment data.
- [x] Declined-card PoC is not enabled by default.

## Packaging Notes

Recommended files to highlight in submission:

1. `README.md`
2. `docs/final-review-guide.md`
3. `docs/test-cases-final.csv`
4. `docs/risk-register.md`
5. `docs/checkout-safe-probe.md`
6. `docs/ai-generation-workflow.md`
7. `docs/incremental-delivery-log.md`

Optional supporting folders:

- `exploration/runs/2026-05-24-112646`
- `generated/2026-05-24-112646-cases`
- `pipeline/`
- `prompts/`

## Known Gaps to Disclose

- LLM refinement is scaffolded but not executed against a real model.
- Declined-card testing is intentionally not implemented yet.
- Deep exploration covers one main user profile path.
- Cross-region price and localization comparison is not covered.
