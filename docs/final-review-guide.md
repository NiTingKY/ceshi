# Final Review Guide

Updated: 2026-05-24

This guide maps the workspace artifacts to the expected BetterMe AI Native QA assignment scoring areas.

## 1. Test Case Set

Primary artifact:

- `docs/test-cases-final.csv`

Supporting artifacts:

- `docs/test-cases-final.json`
- `docs/assignment-alignment.md`
- `docs/page-taxonomy.md`
- `docs/stage-1-2-task-book-mapping.md`
- `docs/risk-register.md`
- `docs/funnel-observation.md`
- `docs/checkout-safe-probe.md`
- `docs/submission-checklist.md`
- `docs/demo-walkthrough.md`

What this demonstrates:

- 75 final cases across Quiz, Discount, Paywall and Checkout.
- Each case has priority, type, precondition, steps, expected result, source, risk references and evidence references.
- Coverage includes positive, negative, validation, compliance, pricing, resilience and safety scenarios.

Recommended review path:

1. Open `docs/test-cases-final.csv`.
2. Filter by `priority=P0`.
3. Check Checkout, Paywall, Consent, Input and Discount modules first.
4. Cross-check `riskRefs` against `docs/risk-register.md`.
5. Cross-check `evidence` against the referenced observation docs.
6. Use `docs/stage-1-2-task-book-mapping.md` to compare stage 1 and stage 2 task-book requirements against the current artifacts.

## 2. AI / Script Efficiency

Primary artifacts:

- `pipeline/case-generator.js`
- `pipeline/final-case-builder.js`
- `pipeline/siliconflow-llm-refinement.js`
- `pipeline/bocha-ai-refinement.js`
- `docs/ai-generation-workflow.md`
- `docs/llm-refinement-record.md`
- `prompts/case-generation-v1.md`
- `prompts/case-generation-v2.md`
- `prompts/case-generation-v3.md`

Generated outputs:

- `generated/2026-05-24-112646-cases/generated-test-cases.csv`
- `generated/2026-05-24-112646-cases/generated-test-cases.json`
- `generated/2026-05-24-112646-cases/case-generation-log.json`
- `generated/2026-05-24-112646-cases/llm-log.json`

What this demonstrates:

- Test case drafts are generated from structured run logs, not manually copied from ad hoc AI chat.
- The workflow has a deterministic script layer and a SiliconFlow `Qwen/Qwen3-8B` LLM call that records prompt, output, duration and provider token accounting.
- The final case builder adds risk and evidence traceability.

Verification:

- `pipeline/tests/case-generator.test.js`
- `pipeline/tests/final-case-builder.test.js`
- `pipeline/tests/siliconflow-llm-refinement.test.js`
- `pipeline/tests/bocha-ai-refinement.test.js`
- `pipeline/tests/project-audit.test.js`

## 3. AI Collaboration Process Archive

Primary artifacts:

- `docs/prompt-evolution-archive.md`
- `docs/ai-blind-spots.md`
- `docs/coverage-review.md`
- `docs/ai-collaboration-retrospective.md`
- `docs/incremental-delivery-log.md`
- `docs/progress-log.md`
- `docs/context-handoff-next.md`
- `docs/ai-generation-workflow.md`
- `docs/llm-refinement-record.md`
- `prompts/case-generation-v1.md`

What this demonstrates:

- The work was built incrementally.
- Exploration problems and fixes were recorded.
- Later stages build on earlier artifacts instead of regenerating from scratch.
- Prompt scaffolding and dry-run review rules exist for future LLM refinement.
- The four required stage 4 process documents are now split into independently reviewable files.

Suggested reviewer angle:

- Read `docs/incremental-delivery-log.md` first to see the staged evolution.
- Use `docs/progress-log.md` for raw chronological evidence.

## 4. Funnel and Risk Understanding

Primary artifacts:

- `docs/funnel-observation.md`
- `docs/page-taxonomy.md`
- `docs/risk-register.md`
- `exploration/runs/2026-05-24-112646/summary.md`
- `exploration/runs/2026-05-24-112646/paywall-summary.md`
- `exploration/runs/2026-05-24-112646/checkout-summary.md`

What this demonstrates:

- The funnel was observed directly through browser automation.
- Quiz page types were categorized.
- Paywall pricing, discount and subscription terms were captured.
- Checkout fields were observed safely.
- Risks were connected back to final test cases.

## 5. Optional Automation PoC

Primary artifacts:

- `pipeline/explore_betterme.js`
- `pipeline/browser-actions.js`
- `pipeline/explore-helpers.js`
- `pipeline/playwright-runtime.md`
- `pipeline/tests/browser-actions.test.js`
- `pipeline/tests/explore-helpers.test.js`

What this demonstrates:

- The browser automation can collect screenshots, page text, HTML and structured logs.
- It handles real-world UI friction such as cookie prompts, nested button text, disabled buttons, consent checkboxes, loader pages and scratch-card interaction.
- Checkout probing is guarded by an explicit environment variable.

Safety boundary:

- No real card.
- No successful payment.
- Payment submission is not automated.

## Suggested 5-Minute Walkthrough

1. Show `README.md` as the entry point.
2. Open `docs/assignment-alignment.md` to map requirements to artifacts.
3. Open `docs/test-cases-final.csv` and point out 75 cases with risk/evidence columns.
4. Open `docs/risk-register.md` and show the risk IDs referenced by cases.
5. Open `docs/checkout-safe-probe.md` and explain the safe checkout boundary.
6. Open `docs/llm-refinement-record.md` to explain the AI Native refinement gate.
7. Run or cite `npm test` and `npm run audit`.

## Current Known Gaps

- LLM refinement has a dry-run record but has not been executed against a real model.
- Declined-card PoC is intentionally not enabled yet.
- Only one main user profile path has been deeply explored.
- Branch expansion is planned in `docs/branch-coverage-plan.md`.
- Cross-region price comparison is not covered.

## Recommended Final Polish

Core packaging is complete:

- demo script: `docs/demo-walkthrough.md`
- submission checklist: `docs/submission-checklist.md`
- assignment alignment: `docs/assignment-alignment.md`

Optional final polish:

- execute one branch-coverage run from `docs/branch-coverage-plan.md`
