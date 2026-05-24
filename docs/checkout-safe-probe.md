# BetterMe Checkout Safe Probe Record

Updated: 2026-05-24

Current best evidence run: `exploration/runs/2026-05-24-112646`

## Safety Boundary

- Probe mode is explicitly enabled with `BETTERME_CHECKOUT_PROBE=1`.
- Default exploration still stops at the Paywall and does not enter the payment component.
- Probe mode allows one click on the lower `GET MY PLAN` CTA from the Paywall.
- The probe collects field metadata, buttons, iframe URLs, and blocked payment-domain requests.
- It does not enter card data, click the checkout form `CONTINUE` button, or submit payment.

## Result

| Item | Result |
| --- | --- |
| Stop reason | reached paywall or checkout safety boundary |
| Checkout probe enabled | yes |
| Paywall pages captured | 2 |
| Checkout pages captured by body text | 0 |
| Payment surfaces captured by DOM/frame probe | 12 |
| Payment gateway requests blocked | 1 |

## Captured Payment Surface

Fields:

- cardholder name
- card number
- expiration date
- cvv

Submit CTA:

- `CONTINUE`

Payment / hosted components:

- Credit card fields are hosted by TokenEx iframes.
- Captured `eu1-htp.tokenex.com/iframe/v3...` frames for card data and CVV.
- PayPal SDK request was blocked:
  - `https://www.paypal.com/sdk/js?...`

## Raw Field Signals

| placeholder | name | autocomplete | Notes |
| --- | --- | --- | --- |
| `MM/YY` | `expirationDate` | `cc-exp` | Main page expiry input |
|  | `cc-name` | `cc-name` | TokenEx iframe cardholder |
|  | `cc-exp` | `cc-exp` | TokenEx iframe expiry |
| `XXXX XXXX XXXX XXXX` | `cardNumber` | `cc-number` | TokenEx iframe card number |
| `CVV` | `Data` | `cc-csc` | TokenEx iframe CVV |

## Test Design Value

- Checkout is not a separate full-page URL; it expands as an embedded payment component inside the Paywall page.
- `body.innerText` is not enough to detect payment fields; frame/input metadata is required.
- Card fields are TokenEx-hosted, so declined-card probing needs an additional explicit test boundary before any card value is entered.
- PayPal is a third-party wallet entrance; current automation blocks its SDK request and does not enter the external wallet.

## Follow-Up Safety Recommendation

1. Keep declined-card testing out of the default suite.
2. If a declined-card PoC is approved, add a hard gate such as `BETTERME_ALLOW_DECLINE_CARD_PROBE=1`.
3. Validate empty form, invalid expiry, and invalid CVV locally before considering declined-card behavior.
4. Never test successful payment, never use real cards, and never bypass TokenEx or wallet provider boundaries.
