# BetterMe AI Native QA Project Artifacts

Updated: 2026-05-24

This document is the delivery map for the whole workspace. It explains what each artifact is for, how it was produced, and how it contributes to the final interview assignment.

## Current Delivery Status

| Area | Status | Main artifacts |
| --- | --- | --- |
| Task specification | Available in repo | `docs/task-spec/riqi-ai-native-qa-5-day-challenge.pdf` |
| Funnel exploration | Complete for main Quiz -> Discount -> Paywall path; checkout safely probed | `exploration/runs/2026-05-24-112646`, `docs/funnel-observation.md` |
| Page taxonomy | Complete first version | `docs/page-taxonomy.md` |
| Risk register | Complete first version with 45 risks | `docs/risk-register.md` |
| Test cases | Final merged version available | `docs/test-cases-final.csv`, `docs/test-cases-final.json` |
| Cross-cutting depth | Partly executed with disclosed remaining gaps | `docs/cross-cutting-coverage-status.md`, `generated/2026-05-26-cross-cutting-probe` |
| AI/script efficiency | Repeatable pipeline complete with LLM log and screenshot evidence | `pipeline/ai-native-case-pipeline.js`, `pipeline/case-generator.js`, `pipeline/final-case-builder.js`, `docs/ai-generation-workflow.md`, `docs/llm-refinement-record.md`, `prompts/case-generation-v1.md`, `generated/2026-05-26-ai-native-run` |
| Stage 4 AI collaboration archive | Complete first version | `docs/prompt-evolution-archive.md`, `docs/ai-blind-spots.md`, `docs/coverage-review.md`, `docs/ai-collaboration-retrospective.md`, `docs/architecture-diagram.md` |
| Checkout safety | Safe probe complete; no real payment submitted | `docs/checkout-safe-probe.md`, `exploration/runs/2026-05-24-112646/checkout-summary.md` |
| Handoff and traceability | Ongoing | `docs/context-handoff.md`, `docs/context-handoff-next.md`, `docs/progress-log.md`, `docs/incremental-delivery-log.md` |
| Reviewer entry point | Complete | `README.md`, `docs/final-review-guide.md`, `docs/assignment-alignment.md` |
| Submission packaging | Complete | `docs/submission-checklist.md`, `docs/demo-walkthrough.md`, `docs/branch-coverage-plan.md` |

## Final Test Case Artifacts

| File | Purpose | Notes |
| --- | --- | --- |
| `docs/test-cases-v1.csv` | Manual/AI-assisted first test case set | 74 cases, broader manual coverage |
| `generated/2026-05-24-112646-cases/generated-test-cases.csv` | Script-generated cases from latest run | 51 cases, repeatable output from `exploration/runs/2026-05-24-112646/flow-log.json` |
| `generated/2026-05-26-ai-native-run/generated-test-cases.csv` | Full AI Native pipeline draft output | 51 draft cases produced before human review and final merge |
| `generated/2026-05-26-ai-native-run/final-test-cases.csv` | Full AI Native pipeline final output copy | 106 reviewed cases produced by the pipeline for stage-2 evidence |
| `docs/test-cases-coverage-extension.csv` | Task-book coverage extension set | 31 AI+manual design cases covering compatibility, A11y, localization, performance, analytics and subscription lifecycle |
| `docs/cross-cutting-coverage-status.md` | Cross-cutting execution boundary | Separates partly executed evidence from disclosed design coverage |
| `generated/2026-05-26-cross-cutting-probe/summary.md` | Cross-cutting probe summary | Viewport, DOM/control metadata, local timing and analytics-like inventory from captured pages |
| `docs/test-cases-final.csv` | Final merged delivery set | 106 cases, includes risk refs, evidence refs and refinement notes |
| `docs/test-cases-final.json` | JSON mirror of final cases | Useful for later validation, LLM refinement, or import |

Why final has 106 cases:

- It keeps the 74-case manual v1 set.
- It adds 1 script-derived checkout iframe safety case because the live probe captured TokenEx-hosted card fields that were not explicitly represented in v1.
- It adds 31 task-book coverage-extension cases for cross-cutting and subscription lifecycle requirements.

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
| `pipeline/ai-native-case-pipeline.js` | Orchestrates draft generation, SiliconFlow review, final case build, run summary, and screenshot evidence | `pipeline/tests/ai-native-case-pipeline.test.js` |
| `pipeline/cross-cutting-probe.js` | Renders captured pages at representative viewports and extracts safe cross-cutting metadata | `pipeline/tests/cross-cutting-probe.test.js` |
| `pipeline/explore-helpers.js` | Page text extraction, stage classification, summaries, safe URL blocking | `pipeline/tests/explore-helpers.test.js` |
| `pipeline/browser-actions.js` | Click helpers, consent handling, scratch gesture, payment surface inspection | `pipeline/tests/browser-actions.test.js` |
| `pipeline/case-generator.js` | Converts `exploration/runs/2026-05-24-112646/flow-log.json` into generated CSV/JSON test cases | `pipeline/tests/case-generator.test.js` |
| `pipeline/final-case-builder.js` | Merges v1/manual cases with script output and adds risk/evidence fields | `pipeline/tests/final-case-builder.test.js` |
| `pipeline/siliconflow-llm-refinement.js` | Calls SiliconFlow `Qwen/Qwen3-8B` and writes a reproducible model log with prompt, output, duration and provider token usage | `pipeline/tests/siliconflow-llm-refinement.test.js` |
| `pipeline/bocha-ai-refinement.js` | Calls Bocha AI Search and writes an optional API dry-run log | `pipeline/tests/bocha-ai-refinement.test.js` |
| `pipeline/runtime.js` | Provides portable browser launch configuration with optional `BETTERME_BROWSER_EXECUTABLE` override | `pipeline/tests/runtime.test.js` |
| `pipeline/project-audit.js` | Checks for mojibake, old declined-card claims, broken concrete artifact references, final case traceability, risk IDs, evidence files, and checkout safety text | `pipeline/tests/project-audit.test.js` |
| `pipeline/playwright-runtime.md` | Runtime commands and environment notes | Updated with checkout-safe probe mode |

## Documentation Artifacts

| File | Purpose | Incremental role |
| --- | --- | --- |
| `docs/funnel-observation.md` | Summarizes observed funnel states and commercial/paywall facts | Updated after Paywall and Checkout probes |
| `docs/page-taxonomy.md` | Defines page types and page sequence | Supports test design and generator rules |
| `docs/stage-1-2-task-book-mapping.md` | Maps original stage 1 and stage 2 requirements to project artifacts, including probability supplement and current gaps | Makes first two scoring stages directly reviewable |
| `docs/risk-register.md` | Lists 40 product/QA risks | Used by final case riskRefs |
| `docs/checkout-safe-probe.md` | Documents checkout probe boundary and results | Proves no real payment submission |
| `docs/ai-generation-workflow.md` | Explains repeatable script layer and LLM review slot | Supports AI efficiency scoring |
| `docs/llm-refinement-record.md` | Documents real SiliconFlow refinement logs and review rules | Closes the AI Native loop without overclaiming model authority |
| `docs/prompt-evolution-archive.md` | Records three prompt iteration cases with v1/v2/v3 prompts, raw-output problems, and human decisions | Stage 4 prompt evolution archive |
| `docs/ai-blind-spots.md` | Lists 15 AI-missed or AI-weakened test cases and the manual fixes | Stage 4 AI blind spot list |
| `docs/coverage-review.md` | Records AI critic suggestions and human adopt/reject/defer decisions | Stage 4 coverage review |
| `docs/ai-collaboration-retrospective.md` | 800-1500 Chinese-character retrospective on where AI helped, hurt, and should not be trusted | Stage 4 collaboration retrospective |
| `docs/architecture-diagram.md` | Shows the script data flow, AI call points, safety gate, and human intervention points | Required architecture diagram |
| `docs/assignment-alignment.md` | Maps understood challenge requirements to concrete artifacts | Makes task-completion review direct and auditable |
| `docs/branch-coverage-plan.md` | Defines the next profile-branch expansion path | Discloses and plans around the current single-path evidence boundary |
| `docs/context-handoff-next.md` | Fresh handoff after Paywall/Checkout/case-generation progress | Avoids original mojibake issue |
| `docs/progress-log.md` | Chronological activity log | Continues to grow each round |
| `docs/incremental-delivery-log.md` | Curated incremental delivery narrative | Created for final reviewer readability |
| `docs/final-review-guide.md` | Maps artifacts to assignment scoring areas | Created as reviewer checklist |
| `docs/submission-checklist.md` | Final pre-submission checklist | Created for packaging and quality gate |
| `docs/demo-walkthrough.md` | Suggested 5-minute presentation script | Created for interview/demo delivery |

## Prompt Artifacts

| File | Purpose |
| --- | --- |
| `prompts/case-generation-v1.md` | Initial prompt draft for LLM refinement of script-generated cases |
| `prompts/case-generation-v2.md` | Task-book coverage review prompt with stage gaps and accept/defer decisions |
| `prompts/case-generation-v3.md` | SiliconFlow-style strict JSON review prompt aligned with `pipeline/siliconflow-llm-refinement.js` |

## Runtime Packaging

| File | Purpose |
| --- | --- |
| `package.json` | Portable npm scripts and Playwright dev dependency for fresh-machine setup |
| `.gitignore` | Keeps dependency folders, logs, and local worktrees out of Git |

Useful commands:

```powershell
npm test
npm run audit
npm run pipeline:ai-native
npm run probe:cross-cutting
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

The next useful increment is one branch-coverage run from `docs/branch-coverage-plan.md`, preferably an age or goal contrast path. After capturing the run, add a branch comparison note and only update final cases if the new path reveals genuinely new coverage.
