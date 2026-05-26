# Case Generation Prompt v2

You are reviewing the BetterMe Pilates AI Native QA case set against the original task-book requirements.

## Task-Book Context

The assignment requires:

- Quiz / Paywall / Checkout funnel coverage.
- Quiz pages grouped into prototypes instead of brute-force page-by-page cases.
- Risk-based cases with P0/P1/P2 priority and linked risk IDs.
- Case fields: case ID, module, submodule or page type, priority, type, precondition, steps, expected result, source tag, linked risk ID.
- Human contribution must remain visible through `[AI+manual]` and `[manual]` style source tags.
- Checkout must preserve production safety: no real payment, no real card, no ungated declined-card probing.

## Inputs

You will receive summarized JSON from:

- `docs/test-cases-final.json`
- `docs/risk-register.md`
- `docs/page-taxonomy.md`
- `docs/funnel-observation.md`
- `docs/checkout-safe-probe.md`

## Review Task

Review coverage quality. Do not rewrite the final CSV. Return only concise review suggestions that a human can accept, reject, or defer.

Focus on:

1. Missing task-book coverage by stage:
   - Stage 1 funnel map / risk register.
   - Stage 2 test case set.
   - Stage 3 AI efficiency script.
   - Stage 4 AI collaboration archive.
2. Missing case design areas:
   - Quiz prototype grouping.
   - Equivalence classes and boundary values.
   - Forward/back/refresh/close-reopen/multi-tab/network interruption.
   - Paywall prices, timer, renewal copy, exit intent, bypass design.
   - Checkout formatting, Luhn, CVV, expiry, third-party wallet, declined-card safety gate.
   - Responsive, compatibility, accessibility, localization, performance, analytics.
   - Subscription lifecycle design cases.
3. Any unsafe or overclaiming language.

## Output Schema

Return strict JSON only:

```json
{
  "coverageVerdict": "one concise sentence",
  "stageGaps": [
    {
      "stage": "Stage 1|Stage 2|Stage 3|Stage 4|Stage 5",
      "gap": "short gap",
      "priority": "P0|P1|P2",
      "evidence": "which project artifact showed the gap"
    }
  ],
  "safeAdoptions": [
    {
      "action": "short action",
      "reason": "why it is safe and useful"
    }
  ],
  "rejectOrDefer": [
    {
      "suggestion": "short suggestion",
      "decision": "reject|defer",
      "reason": "why"
    }
  ],
  "nextStep": "one concrete next step"
}
```

## Constraints

- Use only the provided project artifacts.
- Do not invent prices, currencies, devices, regions, screenshots, bugs, or risk IDs.
- Do not suggest entering a real card or submitting payment.
- Treat declined-card testing as disabled unless a separate hard gate exists.
- Flag model uncertainty plainly.
