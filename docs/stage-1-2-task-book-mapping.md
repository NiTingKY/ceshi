# Stage 1 and Stage 2 Task-Book Mapping

Updated: 2026-05-26

This document maps the original Riqi Technology AI Native QA task-book requirements for stage 1 and stage 2 to concrete project artifacts. It is intended to make the first two scoring stages reviewable without requiring the reviewer to infer coverage from scattered files.

Task specification stored in repo:

- `docs/task-spec/riqi-ai-native-qa-5-day-challenge.pdf`

Current best evidence run:

- `exploration/runs/2026-05-24-112646`

## Stage 1: Funnel and Risk Analysis

| Task-book requirement | Project implementation | Evidence | Current judgment |
| --- | --- | --- | --- |
| Map Quiz -> Paywall -> Checkout funnel states | Main path is documented as 46 observed steps from age entry through embedded checkout surface | `docs/page-taxonomy.md`, `docs/funnel-observation.md`, `exploration/runs/2026-05-24-112646/summary.md` | Covered for one main profile path |
| Document Quiz fields, units, options, and page types | Quiz pages are grouped into prototypes: entry, info, single-select, multi-select, unit input, consent, result/chart, date selector, loader, email/name capture | `docs/page-taxonomy.md` | Covered by prototype, not page-by-page brute force |
| Cover state transitions such as forward/back/refresh/close-reopen/timeout/network interruption | Refresh/back/re-entry risks are represented in final cases and risk register; multi-tab and close-reopen are designed but not deeply evidenced | `docs/risk-register.md`, `docs/test-cases-final.csv`, `docs/branch-coverage-plan.md` | Partially covered; deeper state matrix remains future work |
| Document Paywall plans, prices, timer, exit/policy behavior | Observed HKD plans, discounted prices, per-day prices, renewal copy, countdown and policy/FAQ areas are documented | `docs/funnel-observation.md`, `exploration/runs/2026-05-24-112646/paywall-summary.md` | Covered for observed HKD path |
| Document Checkout fields, payment methods, and error states safely | TokenEx card fields and wallet entrances are observed without real card entry; invalid card-state tests are design cases, not executed payment tests | `docs/checkout-safe-probe.md`, `exploration/runs/2026-05-24-112646/checkout-summary.md` | Covered within safety boundary |
| Provide P0/P1/P2 risk list | 45 risks are listed and final cases reference risk IDs | `docs/risk-register.md`, `docs/test-cases-final.csv` | Covered |
| Include probability, business impact, and coverage method | Risk table has impact and coverage; probability is added below as a reviewer-facing supplement | `docs/risk-register.md`, this document | Covered by supplement |

## Stage 1 Risk Probability Supplement

The original risk table keeps the readable six-column format used by the final cases. This supplement adds probability language required by the task book. Probability is a design estimate based on funnel criticality, observed UI complexity, third-party dependency, and production payment risk.

| Risk IDs | Probability | Business impact | Coverage method |
| --- | --- | --- | --- |
| `R-001`, `R-002` | Medium | Funnel start, user segmentation, legal return path | Entry cases, legal-link return checks |
| `R-003` to `R-005` | Medium | Quiz answer accuracy and mobile usability | Single-select and info-page prototype cases |
| `R-006` to `R-008` | High | Personalization quality and conflicting profile data | Empty multi-select, multi-answer, `None` exclusivity cases |
| `R-009` | Medium | Wrong diet preference or blocked progress | Diet heading non-clickable case |
| `R-010` to `R-016` | High | Health calculation validity, compliance, BMI credibility | Boundary values, unit switch, consent, BMI/result cases |
| `R-017` to `R-019` | Medium | Event-based plan personalization | Event copy, future/past date, cross-month design cases |
| `R-020` to `R-022` | Medium | Abandonment, timeout, automation misclicks | Loader progress, refresh, wait-only cases |
| `R-023` to `R-026` | High | Account creation, contactability, XSS/display risk | Email validation, name validation, special-character escaping |
| `R-027` | Medium | Recommendation trust | Result/chart consistency cases |
| `R-028` to `R-030` | High | Discount conversion and price consistency | Scratch-card, promo carryover, refresh/re-entry cases |
| `R-031` to `R-035` | High | Revenue, billing trust, subscription disclosure, refund policy | Paywall price, per-day price, renewal copy, timer and policy cases |
| `R-036` to `R-038` | High | Production payment safety and checkout quality | Payment-domain blocking, safe probe, invalid local validation design |
| `R-039`, `R-040` | Medium | Session continuity, region/currency consistency | Refresh/back/re-entry cases and localization design matrix |
| `R-041` to `R-045` | Medium | Compatibility, accessibility, performance, analytics, subscription lifecycle | Coverage-extension cases in `docs/test-cases-coverage-extension.csv` |

## Stage 2: Final Test Case Set

| Task-book requirement | Project implementation | Evidence | Current judgment |
| --- | --- | --- | --- |
| Provide CSV/Excel-style case set | Final CSV and JSON mirror contain 106 cases | `docs/test-cases-final.csv`, `docs/test-cases-final.json` | Covered |
| Include required fields | Final schema has id, module, submodule, priority, type, title, precondition, steps, expected, source, riskRefs, evidence, refinementNotes | `docs/test-cases-final.csv` | Covered; `module` uses the task-book top-level modules and `submodule` keeps the detailed page or feature area |
| Use source tags and maintain human contribution | Source distribution is `AI` 31, `AI+manual` 56, `manual` 18, `script-generated+review-needed` 1 | `docs/test-cases-final.csv` | Covered; manual or AI+manual is 74/106 = 69.8% |
| Classify 30-50 Quiz pages into prototypes | Observed main path has 46 steps; Quiz-like pages are normalized into stable prototypes | `docs/page-taxonomy.md` | Covered |
| Pick representative pages per prototype for deeper tests | Multi-select, consent, unit input, loader, email/name, discount, Paywall, and Checkout have representative deep cases | `docs/test-cases-final.csv`, `docs/page-taxonomy.md` | Covered for main path |
| Cover equivalence classes and boundary values | Height boundaries `89/90/243/244`, empty email, invalid email, empty weight, same goal/current weight, special-name injection | `docs/test-cases-final.csv` | Covered; deeper conversion matrix remains future work |
| Cover unit switching | Height and weight unit-switch cases exist | `TC-IN-011`, `TC-IN-012` in `docs/test-cases-final.csv` | Covered first pass |
| Cover abnormal inputs | Empty email/name, invalid email, script-like name, invalid Checkout expiry/CVC design cases | `docs/test-cases-final.csv` | Covered first pass |
| Cover cross-flow states | Refresh loader, refresh discount, back from Paywall, terms/privacy return, back/forward answer persistence | `docs/test-cases-final.csv` | Covered first pass; multi-tab/close-reopen remain future work |
| Cover Paywall price/timer/renewal/policy | Nine Paywall cases cover plans, discounts, per-day price, renewal copy, selection, timer, expiry, policy, FAQ | `TC-PW-001` to `TC-PW-009` | Covered |
| Cover Checkout formatting and payment safety | Seven Checkout cases cover payment blocking, empty form, declined-card gate, invalid expiry/CVC, wallet entrance, TokenEx field capture | `TC-CO-001` to `TC-CO-006`, `AUTO-046-01` | Covered within safety boundary |
| Cover responsive, compatibility, accessibility, localization, performance, analytics | 23 Cross-cutting extension cases cover these areas; the cross-cutting probe adds viewport screenshots, DOM/control metadata, local render timing and analytics-like URL inventory from captured pages | `docs/test-cases-coverage-extension.csv`, `docs/test-cases-final.csv`, `docs/cross-cutting-coverage-status.md`, `generated/2026-05-26-cross-cutting-probe/summary.md` | Partly executed for Chromium/captured-page checks; Safari, WeChat, real locale and backend analytics remain disclosed gaps |
| Cover subscription lifecycle design | 8 Subscription extension cases cover trial, active, renewal failure, cancel, refund, upgrade/downgrade and abandonment states | `TC-SUB-001` to `TC-SUB-008` in `docs/test-cases-final.csv`, `docs/cross-cutting-coverage-status.md` | Covered as design matrix; execution requires staging or sandbox billing |

## Human Review Notes

- The final case set is intentionally not all AI-generated. The task book values AI Native efficiency plus human QA judgment.
- SiliconFlow `Qwen/Qwen3-8B` review is logged in `generated/2026-05-24-112646-cases/llm-log.json`, but model output is not merged without human review.
- The latest model incorrectly claimed Checkout lacked P0 cases. This document and `docs/coverage-review.md` mark that as rejected because final CSV already includes P0 Checkout cases.
