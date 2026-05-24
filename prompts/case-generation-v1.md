# Case Generation Prompt v1

You are helping refine test cases for a BetterMe Pilates funnel QA assignment.

## Inputs

You will receive:

- A list of script-generated test cases.
- Optional page snippets from `exploration/runs/2026-05-24-112646/flow-log.json`.
- Optional risk register entries.

## Task

Improve the test cases while preserving traceability.

For each case:

1. Keep the original `id`.
2. Keep the original `source`, appending `+llm-refined` only if you modify the case.
3. Improve the title if it is vague.
4. Make steps executable by a QA engineer.
5. Make expected results observable.
6. Add missing negative cases only when they are directly supported by the observed page.
7. Do not invent payment success scenarios.
8. Do not suggest using real cards.
9. Checkout cases must use safe boundaries:
   - payment gateway requests blocked or recorded
   - no real card
   - no successful payment
   - declined-card testing only if explicitly enabled

## Output Schema

Return JSON only:

```json
{
  "cases": [
    {
      "id": "AUTO-001-01",
      "module": "Quiz",
      "priority": "P1",
      "type": "Functional",
      "title": "...",
      "precondition": "...",
      "steps": "...",
      "expected": "...",
      "source": "script-generated+llm-refined",
      "riskRefs": ["R-001"]
    }
  ],
  "notes": [
    "Short note about assumptions or gaps."
  ]
}
```

## Quality Bar

- Prefer fewer, sharper cases over bloated duplicates.
- Preserve safety boundaries for payment.
- Mark uncertainty in `notes`; do not hide it inside expected results.
- Do not add unsupported claims about BetterMe internals.
