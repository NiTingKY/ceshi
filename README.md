# BetterMe Pilates AI Native QA Assignment

Updated: 2026-05-24

This workspace contains a QA design and AI-assisted testing workflow for the BetterMe Pilates funnel:

`Quiz -> Discount / Paywall -> Checkout`

The work focuses on test design quality, repeatable AI/script efficiency, safe production-site exploration, and clear evidence. No real payment was submitted.

## Start Here

| What to review | File |
| --- | --- |
| Final test case set | `docs/test-cases-final.csv` |
| Final case set as JSON | `docs/test-cases-final.json` |
| Reviewer guide mapped to assignment scoring | `docs/final-review-guide.md` |
| Full artifact map | `docs/project-artifacts.md` |
| Incremental delivery narrative | `docs/incremental-delivery-log.md` |
| Funnel observation | `docs/funnel-observation.md` |
| Page taxonomy | `docs/page-taxonomy.md` |
| Risk register | `docs/risk-register.md` |
| Checkout safety record | `docs/checkout-safe-probe.md` |
| AI/script workflow | `docs/ai-generation-workflow.md` |
| Submission checklist | `docs/submission-checklist.md` |
| 5-minute demo walkthrough | `docs/demo-walkthrough.md` |

## Current Deliverables

### Test Cases

The final test case set is:

- `docs/test-cases-final.csv`
- `docs/test-cases-final.json`

It contains 75 cases:

- Quiz Entry: 2
- Single Choice: 17
- Multi Select: 7
- Info Page: 3
- Consent: 2
- Height Input: 4
- Weight Input: 2
- Goal Weight: 2
- Unit Switch: 2
- Wellness Profile: 1
- Event Question: 2
- Event Date: 2
- Loader: 3
- Email Capture: 3
- Name Capture: 3
- Discount: 4
- Paywall: 9
- Checkout: 7

Each final case includes:

- priority
- type
- precondition
- steps
- expected result
- source
- risk references
- evidence references
- refinement notes

### Funnel and Risk Analysis

The observed funnel has been normalized into:

- `docs/funnel-observation.md`
- `docs/page-taxonomy.md`
- `docs/risk-register.md`

The risk register contains 40 risks covering Quiz progression, input validation, consent, loader behavior, discount consistency, Paywall pricing, subscription disclosure, and Checkout safety.

### Safe Checkout Probe

Checkout was explored only through a safety-gated probe:

- `BETTERME_CHECKOUT_PROBE=1`
- no real card entered
- no payment form submitted
- PayPal SDK request blocked and recorded
- TokenEx-hosted card fields captured from iframes

Evidence:

- `docs/checkout-safe-probe.md`
- `exploration/runs/2026-05-24-112646/checkout-summary.md`

Captured fields:

- cardholder name
- card number
- expiration date
- CVV
- `CONTINUE` CTA

## Automation and AI-Native Workflow

The project includes repeatable scripts rather than one-off manual AI prompting.

| Script | Purpose |
| --- | --- |
| `pipeline/explore_betterme.js` | Runs the Playwright funnel exploration and captures evidence |
| `pipeline/case-generator.js` | Generates draft test cases from `exploration/runs/2026-05-24-112646/flow-log.json` |
| `pipeline/final-case-builder.js` | Merges manual and script-generated cases into final CSV/JSON |

AI workflow documentation:

- `docs/ai-generation-workflow.md`
- `prompts/case-generation-v1.md`

The current implementation uses a deterministic script layer and includes a prompt scaffold for later LLM refinement. This keeps the work auditable and repeatable.

## How to Verify

Portable setup:

```powershell
npm install
npm test
npm run audit
```

The commands below use the local Codex runtime path that was used while building this workspace. They are kept as a reproducibility record, but `npm install` plus the `package.json` scripts should be preferred on a fresh machine.

Run helper and generator tests:

```powershell
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\explore-helpers.test.js

$base='C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$base;$base\.pnpm\playwright@1.60.0\node_modules;$base\.pnpm\playwright-core@1.60.0\node_modules"
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\browser-actions.test.js

& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\case-generator.test.js
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\final-case-builder.test.js
```

Check final CSV quality:

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

## How to Re-run Exploration

Portable safe exploration:

```powershell
npm install
npx playwright install chromium
$env:BETTERME_MAX_STEPS='75'
npm run explore
```

If Playwright's bundled browser is unavailable but Microsoft Edge is installed elsewhere, set:

```powershell
$env:BETTERME_BROWSER_EXECUTABLE='C:\Path\To\msedge.exe'
```

Default safe exploration:

```powershell
$base='C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$base;$base\.pnpm\playwright@1.60.0\node_modules;$base\.pnpm\playwright-core@1.60.0\node_modules"
$env:BETTERME_MAX_STEPS='75'
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' pipeline\explore_betterme.js
```

Checkout-safe probe:

```powershell
$base='C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$base;$base\.pnpm\playwright@1.60.0\node_modules;$base\.pnpm\playwright-core@1.60.0\node_modules"
$env:BETTERME_MAX_STEPS='75'
$env:BETTERME_CHECKOUT_PROBE='1'
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' pipeline\explore_betterme.js
```

## Regenerate Cases

Generate draft cases from a run:

```powershell
npm run generate:cases
```

Build final cases:

```powershell
npm run build:final
```

## Safety Notes

- BetterMe is a production site.
- The scripts avoid real payment submission.
- Valid real cards must not be used.
- Checkout probing stops at field and CTA observation.
- Declined-card testing is not enabled in the current implementation.
- Declined-card probing must remain behind a separate explicit gate before any card number is entered.

## Suggested Next Step

The core packaging is now complete. The next optional increment is an LLM refinement dry run:

- feed a small sample from `docs/test-cases-final.json` into `prompts/case-generation-v1.md`
- produce a schema-valid refined sample
- record input, output, assumptions and validation notes
