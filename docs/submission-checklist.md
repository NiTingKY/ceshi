# Submission Checklist

Updated: 2026-05-26

Use this checklist before packaging or presenting the BetterMe AI Native QA assignment.

## Required Deliverables

- [x] Final test cases are available: `docs/test-cases-final.csv`
- [x] JSON mirror is available: `docs/test-cases-final.json`
- [x] Funnel observation is documented: `docs/funnel-observation.md`
- [x] Page taxonomy is documented: `docs/page-taxonomy.md`
- [x] Stage 1 and 2 task-book mapping is documented: `docs/stage-1-2-task-book-mapping.md`
- [x] Risk register is documented: `docs/risk-register.md`
- [x] Checkout safe probe is documented: `docs/checkout-safe-probe.md`
- [x] Cross-cutting coverage status is documented: `docs/cross-cutting-coverage-status.md`
- [x] Cross-cutting probe evidence is available: `generated/2026-05-26-cross-cutting-probe/summary.md`
- [x] AI/script workflow is documented: `docs/ai-generation-workflow.md`
- [x] Assignment alignment matrix is documented: `docs/assignment-alignment.md`
- [x] SiliconFlow Qwen3-8B refinement is documented: `docs/llm-refinement-record.md`
- [x] Full AI Native pipeline script is available: `pipeline/ai-native-case-pipeline.js`
- [x] Full AI Native pipeline evidence is available: `generated/2026-05-26-ai-native-run/pipeline-run-summary.md`
- [x] Pipeline screenshot evidence is available: `generated/2026-05-26-ai-native-run/screenshots/01-pipeline-run-summary.png`, `generated/2026-05-26-ai-native-run/screenshots/02-generated-cases-csv.png`, `generated/2026-05-26-ai-native-run/screenshots/03-final-cases-csv.png`
- [x] SiliconFlow LLM script is available: `pipeline/siliconflow-llm-refinement.js`
- [x] SiliconFlow LLM log is available after running `npm run llm:siliconflow`: `generated/2026-05-24-112646-cases/llm-log.json`
- [x] Optional Bocha API dry-run script is available: `pipeline/bocha-ai-refinement.js`
- [x] Stage 4 prompt evolution archive is documented: `docs/prompt-evolution-archive.md`
- [x] Stage 4 AI blind spot list is documented: `docs/ai-blind-spots.md`
- [x] Stage 4 coverage review is documented: `docs/coverage-review.md`
- [x] Stage 4 AI collaboration retrospective is documented: `docs/ai-collaboration-retrospective.md`
- [x] Architecture diagram is documented: `docs/architecture-diagram.md`
- [x] Prompt v1/v2/v3 files are available: `prompts/case-generation-v1.md`, `prompts/case-generation-v2.md`, `prompts/case-generation-v3.md`
- [x] Branch coverage expansion plan is documented: `docs/branch-coverage-plan.md`
- [x] Artifact map is documented: `docs/project-artifacts.md`
- [x] Incremental delivery log is documented: `docs/incremental-delivery-log.md`
- [x] Final review guide is documented: `docs/final-review-guide.md`
- [x] Demo walkthrough is documented: `docs/demo-walkthrough.md`

## Quality Checks

- [x] Final case count is 106.
- [x] Every final case has `riskRefs`.
- [x] Every final case has `evidence`.
- [x] Checkout cases explicitly preserve payment safety boundaries.
- [x] Final cases include both manual/AI-assisted and script-generated evidence.
- [x] Risk register has 45 risks.
- [x] Project has a clear reviewer entry point: `README.md`.

## Verification Commands

Run these before submission:

Portable path:

```powershell
npm install
npm test
npm run audit
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

- `pipeline/tests/explore-helpers.test.js`: 17/17 pass
- `pipeline/tests/browser-actions.test.js`: 6/6 pass
- `pipeline/tests/case-generator.test.js`: 4/4 pass
- `pipeline/tests/final-case-builder.test.js`: 5/5 pass
- `pipeline/tests/ai-native-case-pipeline.test.js`: 2/2 pass
- `pipeline/tests/runtime.test.js`: 3/3 pass
- `pipeline/tests/project-audit.test.js`: 5/5 pass
- `pipeline/tests/siliconflow-llm-refinement.test.js`: 5/5 pass
- `pipeline/tests/bocha-ai-refinement.test.js`: 7/7 pass
- full `npm test`: 54/54 pass
- `npm run audit`: 0 issues
- `npm run llm:siliconflow`: writes `generated/2026-05-24-112646-cases/llm-log.json` when `SILICONFLOW_API_KEY` is set
- `npm run pipeline:ai-native`: writes `generated/2026-05-26-ai-native-run`, latest run produced 51 generated draft cases, 106 final reviewed cases, Qwen3-8B HTTP 200 log with 6263 provider-reported tokens, and three screenshot evidence files
- `npm run probe:cross-cutting`: writes `generated/2026-05-26-cross-cutting-probe`, including viewport screenshots, local render metadata, DOM/control metadata and analytics-like URL inventory from captured pages

Remote repository snapshot:

- Remote: `https://github.com/NiTingKY/ceshi.git`
- Branch: `codex/remediate-project-issues`
- Latest reviewed commit: `35ddb57 Add project audit and portable runtime`

Check final case integrity:

```powershell
$final = Import-Csv -LiteralPath 'docs\test-cases-final.csv'
$final.Count
($final | Where-Object { -not $_.riskRefs }).Count
($final | Where-Object { -not $_.evidence }).Count
```

Expected:

- final rows: 106
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
7. `docs/architecture-diagram.md`
8. `generated/2026-05-26-ai-native-run/pipeline-run-summary.md`
9. `generated/2026-05-26-ai-native-run/screenshots/`
10. `docs/incremental-delivery-log.md`

Optional supporting folders:

- `exploration/runs/2026-05-24-112646`
- `generated/2026-05-24-112646-cases`
- `generated/2026-05-26-ai-native-run`
- `generated/2026-05-26-cross-cutting-probe`
- `pipeline/`
- `prompts/`

## Known Gaps to Disclose

- SiliconFlow `Qwen/Qwen3-8B` review is executed and logged with provider-native token usage.
- Model output still requires human review; latest model output included one rejected claim about Checkout P0 coverage.
- Declined-card testing is intentionally not implemented yet.
- Deep exploration covers one main user profile path.
- Branch expansion is planned in `docs/branch-coverage-plan.md`.
- Cross-region price and localization comparison is partly documented but still needs broader safe real-region execution.
- Safari, mobile Safari, Firefox, WeChat in-app browser, full WCAG review, backend analytics validation, and post-purchase subscription lifecycle execution remain disclosed gaps.
