# BetterMe Funnel State Map

Updated: 2026-05-26

This state map supplements `docs/page-taxonomy.md` with the task-book requested mind-map view of the Quiz -> Discount / Paywall -> Checkout funnel. The Mermaid source is also stored at `docs/funnel-state-map.mmd` so it can be rendered or imported into a mind-map tool as outline content.

```mermaid
mindmap
  root((BetterMe Pilates Funnel))
    Quiz
      Entry / Age
        "Age bands"
        "Terms and Privacy return"
      "Single-select prototype"
        "Main goal"
        "Body profile"
        "Lifestyle questions"
        "Forward and back state"
      "Multi-select prototype"
        "Empty submit blocking"
        "Multiple answers"
        "None exclusivity"
      "Unit input"
        "Height cm and ft/in"
        "Weight kg and lb"
        "Boundary values"
        "BMI and goal logic"
      Consent
        "Health data checkbox"
        "Privacy copy"
        "CTA enabled state"
      "Event and Date"
        "Event choice"
        "Past date blocking"
        "Cross-month selection"
      Loader
        "Progress percentage"
        "Timeout threshold"
        "Refresh recovery"
      "Email and Name"
        "Email format"
        "Repeated email"
        "Name escaping"
    Discount
      "Scratch card"
      "Promo code"
      "Refresh and revisit consistency"
    Paywall
      "Plan count"
      "Default selected plan"
      "Discounted and original prices"
      "Per-day price"
      "Countdown expiry"
      "Renewal copy"
      "Policy and FAQ links"
      "Bypass attempts"
    Checkout
      "TokenEx card iframe"
      "Cardholder name"
      "Card number"
      "Expiry"
      "CVV"
      "PayPal / wallet entrances"
      "Payment-domain blocking"
      "No real payment submission"
    "Cross-flow states"
      "Forward / Back"
      Refresh
      "Close and reopen"
      "Multi-tab"
      "Slow network"
      "Network interruption"
      "Direct URL jump"
      "Responsive viewports"
      "Browser compatibility"
      Accessibility
      Localization
      "Performance and analytics"
      "Subscription lifecycle"
```

## State Transition Coverage

| Area | Transition triggers | Evidence or case-design link |
| --- | --- | --- |
| Quiz | forward, back, refresh, close/reopen, direct URL jump | `docs/page-taxonomy.md`, `docs/test-cases-final.csv` |
| Discount | scratch, continue, refresh, back/re-entry | `docs/funnel-observation.md`, `docs/test-cases-final.csv` |
| Paywall | plan select, countdown expiry, policy navigation, checkout CTA, bypass attempts | `docs/funnel-observation.md`, `docs/test-cases-final.csv` |
| Checkout | field focus, wallet entry, empty validation, invalid local validation, payment-domain block | `docs/checkout-safe-probe.md`, `docs/test-cases-final.csv` |
| Cross-cutting | responsive viewports, browser matrix, keyboard, locale/currency, slow network, analytics, subscription state inference | `docs/test-cases-coverage-extension.csv`, `docs/branch-coverage-plan.md` |

## Reviewer Note

This map is intentionally prototype-based rather than page-by-page. The task book asks candidates not to brute-force every Quiz page, so the map groups repeated Quiz screens into stable interaction types and then links those types to representative deep cases in the final CSV.
