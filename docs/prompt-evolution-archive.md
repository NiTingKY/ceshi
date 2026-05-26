# Stage 4 Prompt Evolution Archive

Updated: 2026-05-26

This archive records how the AI prompt was iterated for the BetterMe Pilates QA assignment. It is a process artifact for stage 4 of the original task specification and now maps to concrete prompt files plus the real SiliconFlow `Qwen/Qwen3-8B` model log.

Related artifacts:

- Prompt v1: `prompts/case-generation-v1.md`
- Prompt v2: `prompts/case-generation-v2.md`
- Prompt v3: `prompts/case-generation-v3.md`
- Real model record: `docs/llm-refinement-record.md`
- Real model log: `generated/2026-05-24-112646-cases/llm-log.json`
- Final cases: `docs/test-cases-final.csv`
- Risk register: `docs/risk-register.md`
- Evidence run: `exploration/runs/2026-05-24-112646`

## Case 1: Quiz Page Classification

Goal: Turn 30-50 observed Quiz pages into stable page prototypes instead of brute-forcing one case per page.

### Prompt v1: `prompts/case-generation-v1.md`

```text
Generate test cases for all observed BetterMe quiz pages from the page log.
```

Raw output pattern:

- One case per visible page.
- Repeated titles such as "click option and continue".
- No distinction between single-select, multi-select, info pages, unit input, or loader.
- Missing evidence references.

Why it was not enough:

- The task specification explicitly asks to classify pages into 5-8 prototypes and deep-test representative pages.
- A page-by-page list inflates volume but does not demonstrate test-design judgment.
- The output did not explain why target zones, sensitive areas, diet headings, and consent should be tested differently.

### Prompt v2: `prompts/case-generation-v2.md`

```text
Using the observed page log, classify the Quiz pages into prototypes. For each prototype, generate representative Happy, Negative, Boundary, and Resilience cases. Preserve page evidence and attach risk IDs from the risk register.
```

Raw output pattern:

- Better grouping into option pages, input pages, and loader pages.
- Still merged multi-select and single-select behavior.
- Suggested generic "invalid input" without concrete values.
- Risk IDs were sometimes invented.

Why it still needed work:

- Multi-select pages need `None of the above` exclusivity and empty-selection validation.
- Unit input pages need exact observed boundaries such as `89/90/243/244`.
- Risk IDs must come from `docs/risk-register.md`, not model memory.

### Prompt v3: `prompts/case-generation-v3.md`

```text
You are refining an existing BetterMe QA case set. Use only these sources: page taxonomy, risk register, final CSV draft, and captured run summaries. Keep case IDs stable. Do not invent pages, prices, regions, devices, or risk IDs. Classify Quiz pages by prototype, then improve only title, steps, expected result, and missing risk links. Flag anything requiring manual review.
```

Accepted improvement:

- The final structure separates `Single Choice`, `Multi Select`, `Info Page`, `Height Input`, `Weight Input`, `Unit Switch`, `Consent`, `Loader`, `Email Capture`, and `Name Capture`.
- Representative cases such as `TC-QZ-014`, `TC-IN-001` to `TC-IN-004`, and `TC-IN-005` are marked as human-reviewed where compliance or boundary judgment is involved.
- Final evidence remains tied to `docs/page-taxonomy.md`, `docs/risk-register.md`, and `exploration/runs/2026-05-24-112646/summary.md`.

Human decision:

- Adopt the classification approach.
- Reject generic invalid-input wording.
- Manually add exact boundary values, consent behavior, and `None of the above` exclusivity checks.

## Case 2: Paywall Pricing and Subscription Disclosure

Goal: Generate Paywall cases that verify prices, discounted prices, per-day prices, renewal terms, timer behavior, and policy links.

### Prompt v1: `prompts/case-generation-v1.md`

```text
Create Paywall test cases for BetterMe.
```

Raw output pattern:

- Suggested generic "verify payment page opens" and "verify price displays".
- No concrete HKD prices.
- Did not mention renewal terms or original crossed price.
- Included unsafe payment-submit language.

Why it was not enough:

- The observed Paywall has concrete plan data: HK$98 to HK$70, HK$280 to HK$196, HK$588 to HK$420, and renewal copy of HK$280 every 4 weeks.
- The assignment grades commercial understanding, so pricing and subscription disclosure need explicit coverage.
- Any instruction to submit payment is unsafe on the production site.

### Prompt v2: `prompts/case-generation-v2.md`

```text
Using the captured Paywall summary, create cases for plan count, default selection, original price, discounted price, per-day price, timer, renewal copy, refund policy, FAQ, and direct bypass attempts. Do not submit payment.
```

Raw output pattern:

- Included pricing and timer areas.
- Mixed observed Paywall facts with imagined currencies and tax behavior.
- Treated bypass attempts as executable exploitation steps rather than safe checks.

Why it still needed work:

- Currency and price assertions must stay within observed HKD evidence.
- Bypass coverage should be framed as risk design, not invasive production probing.
- Timer expiry may need simulation or a defined test environment, not uncontrolled waiting in production.

### Prompt v3: `prompts/case-generation-v3.md`

```text
Refine only Paywall cases using `docs/funnel-observation.md` and `exploration/runs/2026-05-24-112646/paywall-summary.md`. Preserve HKD values exactly as observed. Keep bypass and timer-expiry cases as design cases unless a safe test environment exists. Add renewal disclosure and money-back-policy reachability. Do not instruct payment submission.
```

Accepted improvement:

- Final Paywall cases `TC-PW-001` to `TC-PW-009` cover plan visibility, discount consistency, per-day pricing, renewal terms, selection state, countdown, expiry definition, money-back link, and FAQ behavior.
- Manual cases remain in place for `TC-PW-003`, `TC-PW-005`, `TC-PW-006`, `TC-PW-007`, and `TC-PW-008` because these require product judgment or safe-environment confirmation.

Human decision:

- Adopt specific HKD pricing checks.
- Reject invented cross-region assertions for the current run.
- Keep local-time tampering and direct bypass as future risk coverage unless a non-production environment is provided.

## Case 3: Checkout Safety and Payment Validation

Goal: Cover Checkout validation without submitting a real payment or entering real card data.

### Prompt v1: `prompts/case-generation-v1.md`

```text
Generate checkout tests including card number, CVV, expiry, declined card, and payment methods.
```

Raw output pattern:

- Suggested entering card numbers and submitting forms.
- Did not distinguish TokenEx-hosted card fields from normal DOM inputs.
- Did not include route blocking or a production-site safety boundary.

Why it was not enough:

- The target is a production funnel and the task explicitly warns against real payment.
- Checkout fields are hosted through third-party iframes, so naive DOM instructions are unreliable.
- Declined-card probing must be gated, even if the task mentions a known declined test card as one possible safe method.

### Prompt v2: `prompts/case-generation-v2.md`

```text
Generate Checkout cases from the safe probe output. Cover field presence, empty validation, invalid expiry, invalid CVC, third-party wallet visibility, declined-card safety gate, and blocked payment domains. Do not enter card data unless an explicit environment gate is enabled.
```

Raw output pattern:

- Correctly emphasized safe probe mode.
- Still used ambiguous wording such as "try invalid card".
- Did not preserve the iframe evidence source.

Why it still needed work:

- The final artifact must prove no real card was entered.
- The TokenEx iframe observation should be linked as evidence.
- The declined-card case should verify the safety gate, not run by default.

### Prompt v3: `prompts/case-generation-v3.md`

```text
Refine Checkout cases using only `docs/checkout-safe-probe.md` and `exploration/runs/2026-05-24-112646/checkout-summary.md`. State that no real card was entered and no payment was submitted. Keep declined-card testing disabled by default. Use iframe/payment-surface language and add evidence references.
```

Accepted improvement:

- Final Checkout cases `TC-CO-001` to `TC-CO-006` and `AUTO-046-01` cover blocked payment domains, empty validation, explicit declined-card gate, invalid expiry/CVC design cases, wallet entrance visibility, and TokenEx field capture.
- `AUTO-046-01` is kept as `script-generated+review-needed` because it came from repeatable probe output and still needs human confirmation before being treated as a manual test case.

Human decision:

- Adopt the safety-first checkout framing.
- Reject any case that instructs real payment submission.
- Preserve the current boundary until a payment sandbox or written approval exists.

## Versioning Decision

The repository now keeps all three prompt versions as separate files. `pipeline/siliconflow-llm-refinement.js` implements the v3 review style and writes `generated/2026-05-24-112646-cases/llm-log.json` with input, output, duration, and provider token usage.
