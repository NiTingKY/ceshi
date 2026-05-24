# BetterMe AI Native QA Project Artifacts

Updated: 2026-05-24

This document is the delivery map for the whole workspace. It explains what each artifact is for, how it was produced, and how it contributes to the final interview assignment.

## Current Delivery Status

| Area | Status | Main artifacts |
| --- | --- | --- |
| Funnel exploration | Complete for main Quiz -> Discount -> Paywall path; checkout safely probed | `exploration/runs/2026-05-24-112646`, `docs/funnel-observation.md` |
| Page taxonomy | Complete first version | `docs/page-taxonomy.md` |
| Risk register | Complete first version with 40 risks | `docs/risk-register.md` |
| Test cases | Final merged version available | `docs/test-cases-final.csv`, `docs/test-cases-final.json` |
| AI/script efficiency | Repeatable script layer complete; LLM refinement scaffold ready | `pipeline/case-generator.js`, `pipeline/final-case-builder.js`, `docs/ai-generation-workflow.md`, `prompts/case-generation-v1.md` |
| Checkout safety | Safe probe complete; no real payment submitted | `docs/checkout-safe-probe.md`, `exploration/runs/2026-05-24-112646/checkout-summary.md` |
| Handoff and traceability | Ongoing | `docs/context-handoff.md`, `docs/context-handoff-next.md`, `docs/progress-log.md`, `docs/incremental-delivery-log.md` |
| Reviewer entry point | Complete | `README.md`, `docs/final-review-guide.md` |
| Submission packaging | Complete | `docs/submission-checklist.md`, `docs/demo-walkthrough.md` |

## Final Test Case Artifacts

| File | Purpose | Notes |
| --- | --- | --- |
| `docs/test-cases-v1.csv` | Manual/AI-assisted first test case set | 74 cases, broader manual coverage |
| `generated/2026-05-24-112646-cases/generated-test-cases.csv` | Script-generated cases from latest run | 51 cases, repeatable output from `exploration/runs/2026-05-24-112646/flow-log.json` |
| `docs/test-cases-final.csv` | Final merged delivery set | 75 cases, includes risk refs, evidence refs and refinement notes |
| `docs/test-cases-final.json` | JSON mirror of final cases | Useful for later validation, LLM refinement, or import |

Why final has 75 cases:

- It keeps the 74-case manual v1 set.
- It adds 1 script-derived checkout iframe safety case because the live probe captured TokenEx-hosted card fields that were not explicitly represented in v1.

## Exploration Artifacts

| File or directory | Purpose | Status |
| --- | --- | --- |
| `exploration/runs/2026-05-24-112646` | Latest checkout-safe probe run | Current best evidence and the run intended for repository submission |
| Earlier local runs | Early baselines and Paywall experiments | Kept out of Git to avoid a very large repository |
| `exploration/runs/<run-id>/summary.md` | Human-readable page sequence | Used by taxonomy and case design |
| `exploration/runs/<run-id>/flow-log.json` | Structured page/action log | Used by case generator |
| `exploration/runs/<run-id>/paywall-summary.md` | Discount and Paywall summary | Used by final case evidence |
| `exploration/runs/<run-id>/checkout-summary.md` | Checkout-safe payment surface summary | Used by Checkout final cases |
| `screenshots/` | Visual evidence | Used for manual review and demo |
| `pages/` | Captured text/HTML | Used for debugging and extraction |

## Pipeline Scripts

| File | Purpose | Verification |
| --- | --- | --- |
| `pipeline/explore_betterme.js` | Main Playwright funnel explorer | Covered indirectly by helper/action tests and live runs |
| `pipeline/explore-helpers.js` | Page text extraction, stage classification, summaries, safe URL blocking | `pipeline/tests/explore-helpers.test.js` |
| `pipeline/browser-actions.js` | Click helpers, consent handling, scratch gesture, payment surface inspection | `pipeline/tests/browser-actions.test.js` |
| `pipeline/case-generator.js` | Converts `exploration/runs/2026-05-24-112646/flow-log.json` into generated CSV/JSON test cases | `pipeline/tests/case-generator.test.js` |
| `pipeline/final-case-builder.js` | Merges v1/manual cases with script output and adds risk/evidence fields | `pipeline/tests/final-case-builder.test.js` |
| `pipeline/runtime.js` | Provides portable browser launch configuration with optional `BETTERME_BROWSER_EXECUTABLE` override | `pipeline/tests/runtime.test.js` |
| `pipeline/project-audit.js` | Checks for mojibake, old declined-card claims, and broken concrete artifact references | `pipeline/tests/project-audit.test.js` |
| `pipeline/playwright-runtime.md` | Runtime commands and environment notes | Updated with checkout-safe probe mode |

## Documentation Artifacts

| File | Purpose | Incremental role |
| --- | --- | --- |
| `docs/funnel-observation.md` | Summarizes observed funnel states and commercial/paywall facts | Updated after Paywall and Checkout probes |
| `docs/page-taxonomy.md` | Defines page types and page sequence | Supports test design and generator rules |
| `docs/risk-register.md` | Lists 40 product/QA risks | Used by final case riskRefs |
| `docs/checkout-safe-probe.md` | Documents checkout probe boundary and results | Proves no real payment submission |
| `docs/ai-generation-workflow.md` | Explains repeatable script layer and future LLM slot | Supports AI efficiency scoring |
| `docs/context-handoff-next.md` | Fresh handoff after Paywall/Checkout/case-generation progress | Avoids original mojibake issue |
| `docs/progress-log.md` | Chronological activity log | Continues to grow each round |
| `docs/incremental-delivery-log.md` | Curated incremental delivery narrative | Created for final reviewer readability |
| `docs/final-review-guide.md` | Maps artifacts to assignment scoring areas | Created as reviewer checklist |
| `docs/submission-checklist.md` | Final pre-submission checklist | Created for packaging and quality gate |
| `docs/demo-walkthrough.md` | Suggested 5-minute presentation script | Created for interview/demo delivery |

## Prompt Artifacts

| File | Purpose |
| --- | --- |
| `prompts/case-generation-v1.md` | Prompt draft for future LLM refinement of script-generated cases |

## Runtime Packaging

| File | Purpose |
| --- | --- |
| `package.json` | Portable npm scripts and Playwright dev dependency for fresh-machine setup |
| `.gitignore` | Keeps dependency folders, logs, and local worktrees out of Git |

Useful commands:

```powershell
npm test
npm run audit
npm run generate:cases
npm run build:final
```

## Verification Commands

```powershell
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\explore-helpers.test.js

$base='C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$base;$base\.pnpm\playwright@1.60.0\node_modules;$base\.pnpm\playwright-core@1.60.0\node_modules"
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\browser-actions.test.js

& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\case-generator.test.js
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test pipeline\tests\final-case-builder.test.js
```

## Next Best Increment

The next useful increment is an LLM-refinement simulation or implementation:

1. Use `prompts/case-generation-v1.md`.
2. Feed `docs/test-cases-final.json` plus selected page snippets.
3. Produce an LLM review notes file or a future refined CSV artifact.
4. Record input/output metadata in a log file.

If avoiding real LLM calls, create a documented dry-run showing the prompt, input sample, expected schema, and validation rules.
