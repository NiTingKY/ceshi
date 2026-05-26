# AI Native Case Pipeline Run

Generated at: 2026-05-26T15:06:33.850Z

## Purpose

This run demonstrates that the stage 2 case set is produced through a repeatable AI-native pipeline: structured browser evidence becomes draft cases, Qwen/Qwen3-8B reviews coverage, and a final builder writes the reviewed CSV/JSON package.

## Inputs

- Evidence run: `exploration/runs/2026-05-24-112646`
- Flow log: `exploration/runs/2026-05-24-112646/flow-log.json`
- Risk register: `docs/risk-register.md`

## Outputs

- Generated draft CSV: `generated/2026-05-26-ai-native-run/generated-test-cases.csv`
- Generated draft JSON: `generated/2026-05-26-ai-native-run/generated-test-cases.json`
- Case generation log: `generated/2026-05-26-ai-native-run/case-generation-log.json`
- LLM call log: `generated/2026-05-26-ai-native-run/llm-log.json`
- Final CSV: `generated/2026-05-26-ai-native-run/final-test-cases.csv`
- Final JSON: `generated/2026-05-26-ai-native-run/final-test-cases.json`

## Counts

- Script-generated draft cases: 51
- Final reviewed cases: 106
- Final source distribution: AI+manual=56, AI=31, manual=18, script-generated+review-needed=1

## SiliconFlow Review

- Provider: siliconflow
- Model: Qwen/Qwen3-8B
- HTTP status: 200
- Duration: 83034 ms
- Prompt tokens: 4519
- Completion tokens: 1744
- Total tokens: 6263
- API key logged: no

## Screenshot Evidence

- Pipeline run summary: `generated/2026-05-26-ai-native-run/screenshots/01-pipeline-run-summary.png`
- Generated draft cases CSV: `generated/2026-05-26-ai-native-run/screenshots/02-generated-cases-csv.png`
- Final reviewed cases CSV: `generated/2026-05-26-ai-native-run/screenshots/03-final-cases-csv.png`

## Human Review Boundary

- LLM output is treated as review evidence and is not merged without human judgment.
- Payment-sensitive behavior remains gated: no real card data, no real payment submission, and declined-card probing stays disabled by default.
