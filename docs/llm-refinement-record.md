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
- `generated/2026-05-26-ai-native-run/llm-log.json`

## Real Model Run Result

Latest run:

- Provider: SiliconFlow
- Model: `Qwen/Qwen3-8B`
- Endpoint: `https://api.siliconflow.cn/v1/chat/completions`
- HTTP status: 200
- Duration: 83034 ms
- Billable API calls recorded by script: 1
- Provider usage metadata returned: true
- Prompt tokens: 4519
- Completion tokens: 1744
- Total tokens: 6263
- API key logged: false

The provider returned this structured review output:

```json
{
  "coverageVerdict": "Partial coverage with critical risks addressed but gaps in navigation resilience and edge case validation",
  "strongAreas": [
    "Comprehensive P0 validation for input boundaries (height, weight, email)",
    "Mutual exclusivity checks for single/multi-select elements",
    "Health data consent compliance testing"
  ],
  "highValueGaps": [
    "No test cases for cross-month date selection (R-019)",
    "Incomplete handling of P2 risks in navigation (R-002, R-017, R-019)",
    "Missing validation for goal weight > current weight (R-013)",
    "Loader performance edge cases (R-020) require more detailed testing"
  ],
  "unsafeOrOverclaimRisks": [],
  "suggestedCaseAdditions": [
    {
      "module": "Event Date",
      "priority": "P1",
      "title": "Invalid date range selection prevents form submission",
      "reason": "Risk R-018 requires explicit validation of date constraints"
    }
  ],
  "nextStep": "Prioritize adding test cases for R-019 (cross-month date selection) and R-013 (goal weight > current weight). Review script-generated+review-needed case for potential safety boundary violations."
}
```

## Prompt Input Shape

The script sends a summarized JSON prompt rather than the full CSV. This keeps the API call reproducible and avoids leaking unnecessary local files:

```json
{
  "objective": "Review a BetterMe Pilates QA case set and return a concise JSON quality review.",
  "knownBoundary": "Production checkout must not submit payment or use real card data.",
  "caseCount": 106,
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

The SiliconFlow output is useful as coverage-review evidence, especially for Paywall/Checkout resilience, Event Date, Loader, navigation consistency, and manual safety review. Earlier model output incorrectly claimed Checkout had no P0 cases; the current pipeline run no longer repeats that claim, but the review rule remains the same: every model suggestion must be checked against the full CSV before merge. The concrete next action is Demo video packaging and optional executable P0 automation.
