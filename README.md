# BetterMe Pilates AI Native QA Assignment

Updated: 2026-05-24

This workspace contains a QA design and AI-assisted testing workflow for the BetterMe Pilates funnel:

`Quiz -> Discount / Paywall -> Checkout`

The work focuses on test design quality, repeatable AI/script efficiency, safe production-site exploration, and clear evidence. No real payment was submitted.

## Start Here

| What to review | File |
| --- | --- |
| Original task specification | `docs/task-spec/riqi-ai-native-qa-5-day-challenge.pdf` |
| Final test case set | `docs/test-cases-final.csv` |
| Final case set as JSON | `docs/test-cases-final.json` |
| Assignment alignment matrix | `docs/assignment-alignment.md` |
| Reviewer guide mapped to assignment scoring | `docs/final-review-guide.md` |
| Full artifact map | `docs/project-artifacts.md` |
| Incremental delivery narrative | `docs/incremental-delivery-log.md` |
| Funnel observation | `docs/funnel-observation.md` |
| Page taxonomy | `docs/page-taxonomy.md` |
| Stage 1 and 2 task-book mapping | `docs/stage-1-2-task-book-mapping.md` |
| Risk register | `docs/risk-register.md` |
| Checkout safety record | `docs/checkout-safe-probe.md` |
| AI/script workflow | `docs/ai-generation-workflow.md` |
| LLM refinement dry-run | `docs/llm-refinement-record.md` |
| Stage 4 prompt evolution archive | `docs/prompt-evolution-archive.md` |
| Stage 4 AI blind spot list | `docs/ai-blind-spots.md` |
| Stage 4 coverage review | `docs/coverage-review.md` |
| Stage 4 AI collaboration retrospective | `docs/ai-collaboration-retrospective.md` |
| Branch coverage expansion plan | `docs/branch-coverage-plan.md` |
| Submission checklist | `docs/submission-checklist.md` |
| Demo walkthrough | `docs/demo-walkthrough.md` |

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
| `pipeline/siliconflow-llm-refinement.js` | Calls SiliconFlow `Qwen/Qwen3-8B` for a reproducible LLM review and writes `generated/2026-05-24-112646-cases/llm-log.json` |
| `pipeline/bocha-ai-refinement.js` | Optional Bocha AI Search dry-run script |

AI workflow documentation:

- `docs/ai-generation-workflow.md`
- `prompts/case-generation-v1.md`
- `prompts/case-generation-v2.md`
- `prompts/case-generation-v3.md`
- `docs/llm-refinement-record.md`
- `docs/prompt-evolution-archive.md`
- `docs/ai-blind-spots.md`
- `docs/coverage-review.md`
- `docs/ai-collaboration-retrospective.md`

The current implementation uses a deterministic script layer plus a real SiliconFlow `Qwen/Qwen3-8B` model call for the review step. This keeps the work auditable and repeatable while preserving human review before any model suggestion is merged into the final cases.

Run the SiliconFlow LLM review:

```powershell
$env:SILICONFLOW_API_KEY='<your key>'
npm run llm:siliconflow
```

Optional Bocha API dry-run:

```powershell
$env:BOCHA_API_KEY='<your key>'
npm run llm:bocha
```

Output:

- `generated/2026-05-24-112646-cases/llm-log.json`

The log records provider, endpoint, prompt, output, duration, API call count, estimated token usage, and whether the provider returned explicit usage metadata.

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

The next highest-value increment is the real LLM refinement step required by the task specification:

- call a model from a repeatable script instead of a manual chat
- write input, output, token count and duration to a local log
- validate the refined output before merging anything into the final cases
