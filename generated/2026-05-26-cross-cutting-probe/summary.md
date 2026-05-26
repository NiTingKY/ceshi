# Cross-Cutting Evidence Probe

Generated at: 2026-05-26T15:05:39.362Z
Source run: `exploration/runs/2026-05-24-112646`

## Scope

This probe adds executable evidence for selected cross-cutting checks by rendering captured BetterMe funnel pages at representative viewports and extracting safe DOM metadata. It does not claim real Safari, WeChat, cross-region billing, or post-purchase subscription execution.

## Representative Pages

| Label | Step | Stage | URL |
| --- | ---: | --- | --- |
| quiz | 1 | quiz | https://betterme-pilates.com/first-page-brand-palette?flow=2117 |
| paywall | 45 | paywall | https://betterme-pilates.com/checkout-personalized-generated-brand-palette?order=cb3bcea6-8cb2-42d0-b39c-86cf63180c22 |
| checkout | 46 | paywall | https://betterme-pilates.com/checkout-personalized-generated-brand-palette?order=cb3bcea6-8cb2-42d0-b39c-86cf63180c22 |

## Viewport Checks

| Page | Viewport | Horizontal overflow | Body text captured | Focusable controls | Unlabeled controls | Local render ms |
| --- | --- | --- | --- | ---: | ---: | ---: |
| quiz | mobile-375 375x812 | no | yes | 40 | 2 | 56 |
| quiz | tablet-768 768x1024 | no | yes | 40 | 2 | 59 |
| quiz | desktop-1440 1440x900 | no | yes | 40 | 2 | 49 |
| paywall | mobile-375 375x812 | yes | yes | 55 | 1 | 53 |
| paywall | tablet-768 768x1024 | yes | yes | 55 | 1 | 58 |
| paywall | desktop-1440 1440x900 | yes | yes | 55 | 1 | 55 |
| checkout | mobile-375 375x812 | yes | yes | 58 | 2 | 55 |
| checkout | tablet-768 768x1024 | yes | yes | 58 | 2 | 54 |
| checkout | desktop-1440 1440x900 | yes | yes | 58 | 2 | 55 |

## Analytics-Like Network Inventory

- Analytics-like hosts observed in captured run metadata: none detected in saved metadata
- Redacted URL count: 9

## Coverage Status

| Area | Cases | Status | Remaining gap |
| --- | --- | --- | --- |
| Compatibility | TC-XC-001 to TC-XC-006 | partly-executed | Safari, mobile Safari, Firefox, and WeChat still need real-device or approved browser execution. |
| Accessibility | TC-A11Y-001 to TC-A11Y-006 | partly-executed | Basic keyboard/control metadata is probed; full WCAG review or axe-style audit remains future work. |
| Localization | TC-LOC-001 to TC-LOC-005 | design-disclosed | Real currency and locale comparison needs approved safe-region execution. |
| Performance and analytics | TC-PERF-001 to TC-PERF-003; TC-AN-001 to TC-AN-003 | partly-executed | Local render timing and analytics-like request inventory exist; backend event correctness needs internal analytics spec. |
| Subscription lifecycle | TC-SUB-001 to TC-SUB-008 | design-disclosed | Post-purchase lifecycle execution requires staging, sandbox billing, or a test account with explicit approval. |

## Safety Boundary

- No real card data entered.
- No payment submitted.
- Checkout observations remain limited to captured fields, iframe metadata, and safe visual checks.
