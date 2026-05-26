# SiliconFlow Qwen3-8B Refinement Record

Updated: 2026-05-26

This record closes the AI Native workflow loop with a real SiliconFlow `Qwen/Qwen3-8B` chat-completions call. The result is treated as review evidence and is not automatically merged into the final test cases.

## Purpose

The deterministic scripts already generate and merge cases from browser evidence. The SiliconFlow refinement step adds a real model-backed review to identify coverage gaps, unsafe checkout wording risks, AI blind spots, and task-book alignment issues while preserving traceability.

Prompt scaffold:

- `prompts/case-generation-v1.md`

Input candidates:

- `docs/test-cases-final.json`
- `docs/risk-register.md`
- summarized module/source/type counts
- selected P0 cases

Script:

- `pipeline/siliconflow-llm-refinement.js`
- `pipeline/bocha-ai-refinement.js`

Output log:

- `generated/2026-05-24-112646-cases/llm-log.json`

## Real Model Run Result

Latest run:

- Provider: SiliconFlow
- Model: `Qwen/Qwen3-8B`
- Endpoint: `https://api.siliconflow.cn/v1/chat/completions`
- HTTP status: 200
- Duration: 57594 ms
- Billable API calls recorded by script: 1
- Provider usage metadata returned: true
- Prompt tokens: 4455
- Completion tokens: 1047
- Total tokens: 5502
- API key logged: false

The provider returned this structured review output:

```json
{
  "coverageVerdict": "Partial coverage with notable gaps in Event Date, Loader, and Unit Switch modules",
  "strongAreas": [
    "Quiz Entry (P0 coverage of age band flow)",
    "Single Choice (17 cases covering core functionality)",
    "Email Capture (3 P0 validation cases)"
  ],
  "highValueGaps": [
    "Event Date module lacks P1/P2 coverage for date selection anomalies",
    "Loader module needs validation for stalled progress indicators",
    "Unit Switch module requires more comprehensive conversion validation"
  ],
  "unsafeOrOverclaimRisks": [
    "Checkout module has no P0 cases despite critical safety boundary requirements",
    "Security risk in Name Capture (R-025/R-026) only has 1 P0 case"
  ],
  "suggestedCaseAdditions": [
    {
      "module": "Event Date",
      "priority": "P1",
      "title": "Date picker rejects past dates",
      "reason": "Addresses R-018 risk with explicit date validation"
    }
  ],
  "nextStep": "Implement suggested P1/P2 cases for Event Date and Loader modules, then validate unit conversion accuracy in Unit Switch flows"
}
```

## Prompt Input Shape

The script sends a summarized JSON prompt rather than the full CSV. This keeps the API call reproducible and avoids leaking unnecessary local files:

```json
{
  "objective": "Review a BetterMe Pilates QA case set and return a concise JSON quality review.",
  "knownBoundary": "Production checkout must not submit payment or use real card data.",
  "caseCount": 75,
  "moduleCounts": {},
  "sourceCounts": {},
  "typeCounts": {},
  "sampleP0Cases": [],
  "riskSample": [],
  "expectedOutput": {}
}
```

## Human Review Rules

Accept a model suggestion only if all rules pass:

- Case `id` is unchanged.
- `riskRefs` only contain IDs defined in `docs/risk-register.md`.
- Existing `evidence` references are preserved or strengthened.
- Checkout text does not instruct the tester to enter a real card or submit payment.
- The expected result is observable from the product or current evidence.
- The LLM does not invent prices, claims, regions, devices, or bugs.

## Review Decision

The SiliconFlow output is useful as coverage-review evidence, especially for Event Date, Loader, and Unit Switch expansion. One model claim is rejected: it says Checkout has no P0 cases, but `docs/test-cases-final.csv` includes P0 Checkout safety and validation cases. This confirms that model output must be reviewed against the full CSV before any merge. The concrete next action is to improve Event Date, Loader, Unit Switch, accessibility, localization, and subscription-lifecycle coverage in a separate case-design pass.
