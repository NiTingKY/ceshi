# AI / Script Test Case Generation Workflow

Updated: 2026-05-24

## Goal

Provide a repeatable generation layer that turns captured BetterMe funnel runs into structured test case drafts. This is the stable script layer before adding an LLM refinement step.

## Current Implementation

Script:

- `pipeline/case-generator.js`

Input:

- `exploration/runs/<timestamp>/flow-log.json`

Outputs:

- `generated/<run-id>-cases/generated-test-cases.csv`
- `generated/<run-id>-cases/generated-test-cases.json`
- `generated/<run-id>-cases/case-generation-log.json`

Latest generated output:

- `generated/2026-05-24-112646-cases/generated-test-cases.csv`
- `generated/2026-05-24-112646-cases/generated-test-cases.json`
- `generated/2026-05-24-112646-cases/case-generation-log.json`

## Command

```powershell
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' pipeline\case-generator.js `
  'C:\Users\bao\Documents\测试开发萧山\exploration\runs\2026-05-24-112646' `
  'C:\Users\bao\Documents\测试开发萧山\generated\2026-05-24-112646-cases'
```

## Latest Result

- Generated cases: 51
- CSV parse check: 51 rows
- Module distribution:
  - Checkout: 1
  - Consent: 2
  - Content: 9
  - Discount: 2
  - Input: 4
  - Loader: 5
  - Quiz: 28

## Rule-Based Classification

The generator currently maps observed pages into these page types:

- `single_select`
- `multi_select`
- `health_consent_input`
- `unit_input`
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

Coverage:

- Page classification.
- Deterministic case generation.
- Section header filtering.
- CSV escaping.

Latest verification:

- `case-generator.test.js`: 4/4 pass
- Full helper/action tests also pass as of this update.
