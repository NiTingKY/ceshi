# Assignment Alignment Matrix

Updated: 2026-05-24

This matrix maps the current repository to the understood requirements of the Riqi Technology AI Native QA challenge. The original task specification file is not present in this repository, so this document uses the repository's current reviewer guide and submission checklist as the working requirement baseline.

## Alignment Summary

| Requirement area | Current status | Evidence | Gap or boundary |
| --- | --- | --- | --- |
| Final test case set | Complete | `docs/test-cases-final.csv`, `docs/test-cases-final.json` | Final set has 75 cases; future runs can add branch comparisons. |
| Test coverage breadth | Complete for main funnel | `docs/page-taxonomy.md`, `docs/funnel-observation.md`, `docs/risk-register.md` | Deep evidence is concentrated on one main user profile path. |
| Risk-based thinking | Complete | `docs/risk-register.md` | Risk count is 40 and final cases reference risk IDs. |
| AI Native workflow | Mostly complete | `docs/ai-generation-workflow.md`, `pipeline/case-generator.js`, `pipeline/final-case-builder.js`, `prompts/case-generation-v1.md` | LLM refinement is represented by a scaffold and dry-run record, not a live model call. |
| Script-assisted efficiency | Complete | `pipeline/`, `generated/2026-05-24-112646-cases/` | Generator is deterministic and repeatable from the captured run log. |
| Browser exploration evidence | Complete for current best run | `exploration/runs/2026-05-24-112646/summary.md`, `exploration/runs/2026-05-24-112646/flow-log.json`, `screenshots/`, `pages/` | Earlier exploratory runs are intentionally excluded from Git to keep repository size controlled. |
| Paywall and checkout understanding | Complete within safety boundary | `docs/funnel-observation.md`, `docs/checkout-safe-probe.md`, `exploration/runs/2026-05-24-112646/paywall-summary.md`, `exploration/runs/2026-05-24-112646/checkout-summary.md` | No real card entry, no payment submission, no declined-card PoC. |
| Production-site safety | Complete | `docs/checkout-safe-probe.md`, `pipeline/browser-actions.js`, `pipeline/explore-helpers.js` | Payment-sensitive testing requires explicit approval before expanding scope. |
| Verification and quality gate | Complete | `package.json`, `pipeline/project-audit.js`, `pipeline/tests/` | Audit now checks artifact links, final cases, risk references, evidence references, and payment safety text. |
| Reviewer handoff | Complete | `README.md`, `docs/final-review-guide.md`, `docs/demo-walkthrough.md`, `docs/submission-checklist.md` | The original task PDF or document should be added if available. |
| Remote repository submission | Complete | Git remote `https://github.com/NiTingKY/ceshi.git`, branch `codex/remediate-project-issues` | Current local branch should remain synchronized with remote before final submission. |

## Delivery Evidence by Scoring Area

| Scoring area | How this project demonstrates it |
| --- | --- |
| Test design quality | Final cases include priority, type, precondition, steps, expected result, risk references, evidence references, and refinement notes. |
| Product understanding | The funnel is normalized from real captured pages into stable page types and risk categories. |
| AI Native mindset | The workflow converts browser evidence into structured cases, then leaves a controlled LLM refinement slot for wording and coverage review. |
| Engineering repeatability | `npm test`, `npm run audit`, `npm run generate:cases`, and `npm run build:final` make the process reproducible. |
| Safety judgment | Checkout probing is gated, external payment requests are blocked or recorded, and the project avoids real payment submission. |
| Communication | README, final review guide, submission checklist, demo notes, and this alignment matrix give reviewers a direct path through the work. |

## Current Completion Judgment

The project is submission-ready for a challenge focused on QA design, AI-assisted efficiency, and safe exploratory automation. The strongest remaining optional enhancement is a second user-profile branch run, because it would turn the documented branch-coverage plan into additional live evidence.
