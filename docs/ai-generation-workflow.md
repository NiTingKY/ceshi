# AI / Script Test Case Generation Workflow

Updated: 2026-05-24

## Goal

Provide a repeatable generation layer that turns captured BetterMe funnel runs into structured test case drafts. This is the deterministic script layer before any optional LLM refinement step.

## Current Implementation

Script:

- `pipeline/case-generator.js`

Input:

- `exploration/runs/2026-05-24-112646/flow-log.json`

Outputs:

- `generated/2026-05-24-112646-cases/generated-test-cases.csv`
- `generated/2026-05-24-112646-cases/generated-test-cases.json`
- `generated/2026-05-24-112646-cases/case-generation-log.json`

## Commands

Portable command:

```powershell
npm run generate:cases
```

Equivalent direct Node command:

```powershell
node pipeline/case-generator.js `
  exploration/runs/2026-05-24-112646 `
  generated/2026-05-24-112646-cases
```

Build final merged cases:

```powershell
npm run build:final
```

## Latest Result

- Generated cases: 51
- CSV parse check: 51 rows
- Module distribution:
  - Checkout: 1
  - Consent: 2
  - Content: 11
  - Discount: 2
  - Input: 4
  - Loader: 5
  - Quiz: 26

## Rule-Based Classification

The generator maps observed pages into these page types:

- `single_select`
- `multi_select`
- `health_consent_input`
- `unit_input`
- `email_input`
- `name_input`
- `loader`
- `discount`
- `paywall`
- `checkout_surface`
- `info`

The checkout classifier uses frame/input metadata, not only visible body text, because payment fields are hosted in TokenEx iframes.

## LLM Refinement Slot

Prompt draft:

- `prompts/case-generation-v1.md`

Planned LLM step:

1. Feed normalized generated cases plus selected page snippets.
2. Ask the model to improve titles, preconditions, expected results, and risk tags.
3. Preserve IDs and source traceability.
4. Write model input/output and metadata to `generated/<run-id>-cases/llm-log.json`.
5. Run schema validation and duplicate checks before accepting LLM output.

## Verification

Tests:

- `pipeline/tests/case-generator.test.js`
- `pipeline/tests/final-case-builder.test.js`
- `pipeline/tests/project-audit.test.js`

Coverage:

- Page classification.
- Deterministic case generation.
- Section header filtering.
- CSV escaping.
- Final case merge behavior.
- Basic artifact quality audit.

Latest verification is captured in `docs/submission-checklist.md`.
