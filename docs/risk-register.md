# BetterMe Pilates Risk Register

Updated: 2026-05-24

Current best evidence run: `exploration/runs/2026-05-24-112646`

| ID | Module | Risk | Impact | Priority | Suggested coverage |
| --- | --- | --- | --- | --- | --- |
| R-001 | Entry | Age option click does not enter the quiz or branches to the wrong flow | Funnel cannot start or user segmentation is wrong | P0 | Cover all 4 age bands |
| R-002 | Entry | Terms / Privacy links disrupt the quiz state or block return | Compliance entry damages conversion flow | P2 | Link open mode and return recovery |
| R-003 | Single choice | Only text is clickable, not the full option card | Poor mobile usability | P1 | Card edge and label click |
| R-004 | Single choice | Selection state is lost after back/forward navigation | User answer editing fails | P1 | Back/forward recovery |
| R-005 | Info page | Informational copy is treated as an answer | Automation or user flow can get stuck | P1 | Only allow primary continue |
| R-006 | Multi-select | `NEXT STEP` works with no selected option | Missing data creates bad recommendations | P0 | Empty selection blocking |
| R-007 | Multi-select | `None of the above` can be selected with other options | Profile logic conflict | P1 | None exclusivity |
| R-008 | Multi-select | Selection upper/lower limits are unclear | Downstream personalization is unstable | P2 | 0/1/many selection combinations |
| R-009 | Nutrition | Group headings such as `WITH MEAT` are treated as options | User cannot advance or wrong preference is saved | P1 | Group headings are non-clickable |
| R-010 | Input | Height below 90 cm or above 243 cm is accepted | Health calculation becomes invalid | P0 | 89/90/243/244 boundary values |
| R-011 | Input | cm/ft conversion is wrong or unit state is mixed | BMI and plan calculations are wrong | P0 | Unit switch and backfill |
| R-012 | Input | kg/lbs conversion changes current or goal weight incorrectly | Personalization is inaccurate | P0 | Current and goal weight conversion |
| R-013 | Input | Goal weight above current weight still produces a weight-loss plan | Recommendation conflicts with goal | P1 | Gain/maintain/loss combinations |
| R-014 | Consent | User can continue without health data consent | Compliance risk | P0 | Unchecked consent blocking |
| R-015 | Consent | CTA stays disabled after consent is checked | Main flow is blocked | P0 | Consent state and CTA state |
| R-016 | BMI | Extreme inputs create misleading BMI copy | Health recommendation credibility drops | P1 | Low/normal/overweight/obese bands |
| R-017 | Event | Explanatory copy is treated as an event answer | Flow can get stuck | P2 | Copy is non-selectable |
| R-018 | Date | Past dates are selectable | Event plan is invalid | P1 | Past date blocking |
| R-019 | Date | Cross-month selection loses chosen date | Personalization data is wrong | P2 | Month/year boundary behavior |
| R-020 | Loader | Loader percentage stalls for too long | User abandons | P1 | Timeout and retry behavior |
| R-021 | Loader | Refresh during loader restarts the full quiz | User loses progress | P1 | Refresh recovery |
| R-022 | Loader | Percentage text is clicked as a CTA | Automation misclicks | P2 | Loader is wait-only |
| R-023 | Email | Empty or invalid email is accepted | Account or delivery failure | P0 | Empty, missing `@`, invalid domain |
| R-024 | Email | Existing or repeated email handling is unclear | User cannot continue or duplicate order risk | P1 | Duplicate email scenario |
| R-025 | Name | Special characters in name are not escaped | XSS or display risk | P0 | `<script>`, emoji, long names |
| R-026 | Results | Name is not injected correctly into plan page | Personalization breaks | P2 | Name display validation |
| R-027 | Results | Weight graph does not match goal/current weight | Recommendation trust drops | P1 | Chart data consistency |
| R-028 | Discount | Scratch-card cannot reveal the discount | Paywall conversion drops | P0 | Mouse, touch, and click fallback |
| R-029 | Discount | Promo code is not carried to Paywall | Price dispute risk | P0 | Discount-to-Paywall price linkage |
| R-030 | Discount | Refresh/back/revisit creates a different discount | Price consistency risk | P1 | Refresh/back/re-entry |
| R-031 | Paywall | Countdown expiry behavior is unclear | Offer and price dispute risk | P1 | Expired countdown behavior |
| R-032 | Paywall | Default plan selection is unclear or too expensive by mistake | Complaint and refund risk | P0 | Default selected plan and price confirmation |
| R-033 | Paywall | Original price, discounted price, or daily price is inconsistent | Billing trust risk | P0 | Original/discount/day price validation |
| R-034 | Paywall | Renewal copy is hidden or unclear | Compliance and complaint risk | P0 | Renewal terms visibility |
| R-035 | Paywall | Money-back policy link is unreachable | Refund claim cannot be verified | P1 | Link navigation and return |
| R-036 | Checkout | Purchase CTA enters third-party payment flow without guardrails | Automation may submit real payment | P0 | Route blocking for payment domains |
| R-037 | Checkout | Declined-card testing is attempted without a hard safety gate | Unsafe production payment testing | P0 | Keep declined-card PoC disabled unless explicitly gated |
| R-038 | Checkout | Card / expiry / CVV validation is missing | Payment form quality risk | P0 | Empty and invalid local validation only |
| R-039 | Cross-flow | Refresh, back, close, or re-entry loses order/session state | User loses purchase context | P1 | Session recovery |
| R-040 | Cross-flow | Region, currency, or taxes are inconsistent | International commerce risk | P1 | Region/currency matrix |
| R-041 | Compatibility | Responsive viewport or browser differences hide CTAs, plan cards, or checkout controls | Users cannot complete funnel on key devices | P1 | Mobile/tablet/desktop and Chrome/Safari/Firefox/WeChat matrix |
| R-042 | Accessibility | Keyboard, focus, ARIA, error announcements, or contrast are insufficient | Users relying on assistive technology cannot complete flow | P1 | Keyboard, focus, accessible names, contrast and reduced-motion cases |
| R-043 | Performance | Entry, loader, Paywall, or Checkout load too slowly or stall under poor network | Abandonment and duplicate attempts increase | P1 | Load thresholds, slow network, loader timeout and recovery |
| R-044 | Analytics | Funnel events are missing, duplicated, or leak sensitive/payment data | Growth attribution and compliance reporting become unreliable | P1 | Quiz, Paywall, Checkout-safe event inspection |
| R-045 | Subscription | Trial, renewal, grace period, cancellation, refund, upgrade, or downgrade states are inconsistent | Billing disputes and compliance issues | P1 | Subscription lifecycle state-transition cases |

## Current Safety Boundary

Allowed:

- Quiz non-payment interactions.
- Discount scratch-card interaction.
- Paywall information capture.
- Checkout field inspection with no card entry and no payment submission.

Not allowed in the current implementation:

- Real payment submission.
- Real valid cards.
- Ungated declined-card probing.
- Bypassing TokenEx, PayPal, or other payment security boundaries.
