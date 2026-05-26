# Assignment Alignment Matrix

Updated: 2026-05-26

This matrix maps the current repository to the Riqi Technology AI Native QA challenge task specification at `docs/task-spec/riqi-ai-native-qa-5-day-challenge.pdf`, plus the repository's reviewer guide and submission checklist.

## Alignment Summary

| Requirement area | Current status | Evidence | Gap or boundary |
| --- | --- | --- | --- |
| Final test case set | Complete | `docs/test-cases-final.csv`, `docs/test-cases-final.json` | Final set has 75 cases; future runs can add branch comparisons. |
| Test coverage breadth | Complete for main funnel | `docs/page-taxonomy.md`, `docs/funnel-observation.md`, `docs/risk-register.md` | Deep evidence is concentrated on one main user profile path. |
| Risk-based thinking | Complete | `docs/risk-register.md` | Risk count is 40 and final cases reference risk IDs. |
| Stage 1 and 2 task-book mapping | Complete first version | `docs/stage-1-2-task-book-mapping.md` | Compatibility, accessibility, localization and subscription lifecycle remain disclosed gaps. |
| AI Native workflow | Mostly complete | `docs/ai-generation-workflow.md`, `pipeline/case-generator.js`, `pipeline/final-case-builder.js`, `pipeline/siliconflow-llm-refinement.js`, `pipeline/bocha-ai-refinement.js`, `prompts/case-generation-v1.md`, `prompts/case-generation-v2.md`, `prompts/case-generation-v3.md` | SiliconFlow `Qwen/Qwen3-8B` call is implemented and logged; suggestions still require human review before case merge. |
| Stage 4 AI collaboration archive | Complete first version | `docs/prompt-evolution-archive.md`, `docs/ai-blind-spots.md`, `docs/coverage-review.md`, `docs/ai-collaboration-retrospective.md` | These process documents are evidence-based and should be refreshed if Bocha suggestions are merged into final cases. |
| Script-assisted efficiency | Complete | `pipeline/`, `generated/2026-05-24-112646-cases/` | Generator is deterministic and repeatable from the captured run log. |
| Browser exploration evidence | Complete for current best run | `exploration/runs/2026-05-24-112646/summary.md`, `exploration/runs/2026-05-24-112646/flow-log.json`, `screenshots/`, `pages/` | Earlier exploratory runs are intentionally excluded from Git to keep repository size controlled. |
| Paywall and checkout understanding | Complete within safety boundary | `docs/funnel-observation.md`, `docs/checkout-safe-probe.md`, `exploration/runs/2026-05-24-112646/paywall-summary.md`, `exploration/runs/2026-05-24-112646/checkout-summary.md` | No real card entry, no payment submission, no declined-card PoC. |
| Production-site safety | Complete | `docs/checkout-safe-probe.md`, `pipeline/browser-actions.js`, `pipeline/explore-helpers.js` | Payment-sensitive testing requires explicit approval before expanding scope. |
| Verification and quality gate | Complete | `package.json`, `pipeline/project-audit.js`, `pipeline/tests/` | Audit now checks artifact links, final cases, risk references, evidence references, and payment safety text. |
| Reviewer handoff | Complete | `README.md`, `docs/task-spec/riqi-ai-native-qa-5-day-challenge.pdf`, `docs/final-review-guide.md`, `docs/demo-walkthrough.md`, `docs/submission-checklist.md` | Original task specification is now stored in the repository for future reference. |
| Remote repository submission | Complete | Git remote `https://github.com/NiTingKY/ceshi.git`, branch `codex/remediate-project-issues` | Current local branch should remain synchronized with remote before final submission. |

## Delivery Evidence by Scoring Area

| Scoring area | How this project demonstrates it |
| --- | --- |
| Test design quality | Final cases include priority, type, precondition, steps, expected result, risk references, evidence references, and refinement notes. |
| Product understanding | The funnel is normalized from real captured pages into stable page types and risk categories. |
| AI Native mindset | The workflow converts browser evidence into structured cases, documents prompt v1/v2/v3 evolution, records AI blind spots, and runs a controlled SiliconFlow `Qwen/Qwen3-8B` review with provider token usage. |
| Engineering repeatability | `npm test`, `npm run audit`, `npm run generate:cases`, and `npm run build:final` make the process reproducible. |
| Safety judgment | Checkout probing is gated, external payment requests are blocked or recorded, and the project avoids real payment submission. |
| Communication | README, final review guide, submission checklist, demo notes, and this alignment matrix give reviewers a direct path through the work. |

## Current Completion Judgment

The project is strong on QA design, AI-assisted workflow documentation, and safe exploratory automation. The main remaining task-book gaps are broader compatibility/localization/accessibility evidence, demo video, architecture diagram, and optional stage 5 automation.
