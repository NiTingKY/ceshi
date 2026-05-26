# AI Collaboration Record

Updated: 2026-05-26

This is the compressed stage-four deliverable. It merges the four required AI-collaboration blocks into one reviewable document:

1. Prompt evolution archive
2. AI blind spots
3. AI critic coverage review
4. Collaboration retrospective

Detailed supporting files remain in the repository for auditability:

- `docs/prompt-evolution-archive.md`
- `docs/ai-blind-spots.md`
- `docs/coverage-review.md`
- `docs/ai-collaboration-retrospective.md`
- `prompts/case-generation-v1.md`
- `prompts/case-generation-v2.md`
- `prompts/case-generation-v3.md`
- `generated/2026-05-26-ai-native-run/llm-log.json`

## 1. Prompt Evolution

The prompt work moved through three concrete versions rather than one large copy-paste request.

| Version | Goal | Problem found | Human change |
| --- | --- | --- | --- |
| v1 | Generate cases from observed BetterMe pages | Output became a page-by-page list with repeated "click option and continue" cases | Reframed the task around Quiz page prototypes |
| v2 | Classify pages and attach risk IDs | Model mixed single-select and multi-select behavior, invented risk IDs, and gave generic invalid-input cases | Forced source-bound risk IDs and exact observed boundaries |
| v3 | Refine existing cases only | Model still needed guardrails around production payment and unobserved regions/devices | Required stable IDs, no invented facts, JSON-style review output and human accept/reject decisions |

Representative prompt files:

- `prompts/case-generation-v1.md`
- `prompts/case-generation-v2.md`
- `prompts/case-generation-v3.md`

Accepted improvements:

- Quiz pages are classified by prototype instead of brute force.
- Boundary cases use observed values such as `89/90/243/244`.
- Checkout suggestions are safety-gated and do not submit real payment.
- Final cases keep risk and evidence traceability.

Rejected or reframed outputs:

- Generic "invalid input" cases without values.
- Imagined currencies, regions, or device results.
- Declined-card execution as a default production test.
- Any model suggestion that would merge into the CSV without human review.

## 2. AI Blind Spots

The model was useful for broad enumeration and wording, but it missed or weakened judgment-heavy cases.

| Case | AI blind spot | Human correction |
| --- | --- | --- |
| `TC-QZ-009` | Assumed multi-select can continue without selection | Added empty-selection blocking |
| `TC-QZ-014` | Treated `None of the above` as a normal checkbox | Added mutual-exclusion check |
| `TC-QZ-025` | Treated visual headings such as `WITH MEAT` as selectable options | Added non-clickable heading case |
| `TC-IN-001` to `TC-IN-004` | Suggested generic height invalid values | Added exact `89/90/243/244` boundary values |
| `TC-IN-005` | Focused on mechanics, not health-data compliance | Added consent-gate P0 case |
| `TC-CP-005` | Missed personalization/XSS risk in the name field | Added escaping case |
| `TC-PW-003` | Repeated visible prices without reconciling per-day math | Added price consistency case |
| `TC-PW-004` | Treated subscription disclosure as footer text | Added renewal-term visibility P0 case |
| `TC-CO-001` | Suggested normal checkout automation | Added payment-domain blocking and no-submit boundary |
| `TC-CO-003` | Treated declined-card probing as default | Reframed as "must stay disabled unless explicitly gated" |

Pattern summary:

- AI is weak where visual hierarchy matters.
- AI does not know observed numeric boundaries unless evidence is supplied.
- AI needs strong safety constraints around production payment flows.
- AI can suggest coverage, but humans must decide whether execution is safe.

## 3. AI Critic Coverage Review

The full case set was reviewed by SiliconFlow `Qwen/Qwen3-8B` through a repeatable script:

- Script: `pipeline/siliconflow-llm-refinement.js`
- Latest pipeline log: `generated/2026-05-26-ai-native-run/llm-log.json`
- Model: `Qwen/Qwen3-8B`
- HTTP status: `200`
- Duration: `83034 ms`
- Prompt tokens: `4519`
- Completion tokens: `1744`
- Total tokens: `6263`

Human decisions:

| AI suggestion | Decision | Reason |
| --- | --- | --- |
| Add page-prototype documentation | Adopted | `docs/page-taxonomy.md` maps the observed path into stable page types |
| Add exact height boundaries | Adopted | Final cases use observed min/max and min-1/max+1 values |
| Add Paywall pricing and renewal disclosure | Adopted | Final cases cover plan count, HKD prices, per-day math and renewal copy |
| Add accessibility and compatibility matrix | Partly executed | Cases exist and `pipeline/cross-cutting-probe.js` adds viewport/control evidence |
| Add localization across regions | Disclosed | HKD path is observed; true cross-region execution needs approved safe-region setup |
| Add declined-card test | Reframed | Production payment probing remains disabled without an explicit hard gate |
| Claim Checkout had no P0 cases | Rejected | Final CSV already contains P0 Checkout safety and validation cases |

The model output is treated as review evidence, not as an automatic source of truth.

## 4. Collaboration Retrospective

AI helped most with organizing scattered evidence into repeatable structure. The project first used Playwright to collect page text, screenshots, iframe metadata and flow logs. Then scripts converted those logs into draft cases and a final CSV with risk and evidence links. AI was useful for grouping repeated Quiz pages, reminding me about Paywall commercial risks, and improving CSV-ready wording.

AI was less reliable where the task required product judgment. It could not infer visual hierarchy from text alone, so headings could be mistaken for answer options. It suggested broad "invalid input" tests until exact evidence was supplied. It also needed hard constraints around Checkout because a generic model naturally suggests entering cards, submitting declined-card tests, or checking payment failure paths. On a production site, those are not safe defaults.

The parts that should stay human-owned are risk priority, compliance interpretation, production safety boundaries, subscription and renewal commitments, price-dispute judgment, and final accept/reject decisions. AI can propose "test countdown expiry", but a person must decide whether to execute it in production, simulate it in a safe environment, or keep it as design coverage.

Final human contribution remains intentionally high:

- Final cases: 106
- `AI+manual`: 56
- `manual`: 18
- Human-reviewed or human-original: 74/106 = 69.8%

This is above the assignment threshold and matches the intended AI Native pattern: use AI to accelerate evidence organization and coverage review, while keeping QA judgment and production safety under human control.
