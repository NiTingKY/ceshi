# AI / Script Test Case Generation Workflow

Updated: 2026-05-24

## Goal

Provide a repeatable generation layer that turns captured BetterMe funnel runs into structured test case drafts. This is the deterministic script layer before any optional LLM refinement step.

## Current Implementation

Script:

- `pipeline/case-generator.js`
- `pipeline/siliconflow-llm-refinement.js`
- `pipeline/bocha-ai-refinement.js`

Input:

- `exploration/runs/2026-05-24-112646/flow-log.json`

Outputs:

- `generated/2026-05-24-112646-cases/generated-test-cases.csv`
- `generated/2026-05-24-112646-cases/generated-test-cases.json`
- `generated/2026-05-24-112646-cases/case-generation-log.json`
- `generated/2026-05-24-112646-cases/llm-log.json`

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

Run SiliconFlow Qwen3-8B review:

```powershell
$env:SILICONFLOW_API_KEY='<your key>'
npm run llm:siliconflow
```

Run optional Bocha AI Search dry-run:

```powershell
$env:BOCHA_API_KEY='<your key>'
npm run llm:bocha
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

## SiliconFlow LLM Refinement

Prompt draft:

- `prompts/case-generation-v1.md`
- `prompts/case-generation-v2.md`
- `prompts/case-generation-v3.md`

Prompt version intent:

- v1 refines script-generated cases while preserving IDs and payment safety.
- v2 reviews task-book coverage by stage and separates safe adoptions from rejected/deferred suggestions.
- v3 is aligned with the SiliconFlow `Qwen/Qwen3-8B` script and asks for strict JSON review output.

Implemented model call:

1. Feed normalized generated cases plus selected page snippets.
2. Ask SiliconFlow `Qwen/Qwen3-8B` for a structured quality review over missing coverage, unsafe checkout wording, AI blind spots, and task-book alignment.
3. Preserve IDs and source traceability by using summary input rather than rewriting the final CSV automatically.
4. Write model input/output, duration, API call count, provider token usage, and finish reason to `generated/2026-05-24-112646-cases/llm-log.json`.
5. Keep the output as review evidence until a human chooses which suggestions to merge.

Boundary:

- SiliconFlow `Qwen/Qwen3-8B` is used as the main real LLM call.
- The latest SiliconFlow run returned provider-native usage: 4455 prompt tokens, 1047 completion tokens, 5502 total tokens.
- The API key is read from `SILICONFLOW_API_KEY` and is not written to the log.
- Bocha remains as an optional Search/AI Search dry-run, not the main stage-3 LLM evidence.

## Verification

Tests:

- `pipeline/tests/case-generator.test.js`
- `pipeline/tests/final-case-builder.test.js`
- `pipeline/tests/siliconflow-llm-refinement.test.js`
- `pipeline/tests/bocha-ai-refinement.test.js`
- `pipeline/tests/project-audit.test.js`

Coverage:

- Page classification.
- Deterministic case generation.
- Section header filtering.
- CSV escaping.
- Final case merge behavior.
- Basic artifact quality audit.

Latest verification is captured in `docs/submission-checklist.md`.
