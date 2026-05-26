# AI Native Pipeline Architecture

Updated: 2026-05-26

This diagram shows how the repository turns a production funnel observation into a reviewable test case package. It highlights the AI call points, safety gate, and human review points required by the task specification.

```mermaid
flowchart TD
    A["BetterMe Pilates production funnel<br/>Quiz -> Discount / Paywall -> Checkout"] --> B["Playwright safe exploration<br/>pipeline/explore_betterme.js"]
    B --> C["Safety controls<br/>BETTERME_CHECKOUT_PROBE gate<br/>payment-domain blocking<br/>no real card entry"]
    B --> D["Captured evidence<br/>exploration/runs/2026-05-24-112646/flow-log.json<br/>page text and screenshots<br/>paywall-summary.md<br/>checkout-summary.md"]

    D --> E["Page taxonomy and risk analysis<br/>docs/page-taxonomy.md<br/>docs/funnel-observation.md<br/>docs/risk-register.md"]
    D --> F["Deterministic case generation<br/>pipeline/case-generator.js"]
    F --> G["Generated draft cases<br/>generated-test-cases.csv/json<br/>case-generation-log.json"]

    E --> H["Manual QA design and review<br/>boundary values<br/>payment safety<br/>compliance judgment<br/>risk priority"]
    G --> H
    H --> I["Final case builder<br/>pipeline/final-case-builder.js"]
    I --> J["Final deliverables<br/>docs/test-cases-final.csv<br/>docs/test-cases-final.json"]

    J --> K["LLM coverage review<br/>pipeline/siliconflow-llm-refinement.js<br/>Qwen/Qwen3-8B"]
    K --> L["Model log<br/>generated/2026-05-24-112646-cases/llm-log.json<br/>prompt, output, duration, token usage"]
    L --> M["Human accept / reject / defer decisions<br/>docs/coverage-review.md<br/>docs/llm-refinement-record.md"]
    M --> N["Stage 4 process archive<br/>prompt evolution<br/>AI blind spots<br/>coverage review<br/>collaboration retrospective"]
```

## Data Flow

| Step | Artifact or script | Role |
| --- | --- | --- |
| Production observation | `pipeline/explore_betterme.js` | Drives the funnel and captures evidence without completing payment |
| Safety boundary | `pipeline/browser-actions.js`, `pipeline/explore-helpers.js` | Blocks or records payment-sensitive requests and stops at checkout observation |
| Evidence store | `exploration/runs/2026-05-24-112646` | Keeps raw page text, screenshots, structured flow logs, Paywall facts, and Checkout facts |
| Test design basis | `docs/page-taxonomy.md`, `docs/risk-register.md` | Converts raw pages into prototypes and risk IDs |
| Draft generation | `pipeline/case-generator.js` | Produces repeatable draft cases from `exploration/runs/2026-05-24-112646/flow-log.json` |
| Human intervention | `docs/test-cases-v1.csv`, review notes | Adds judgment-heavy cases such as compliance, boundary values, pricing, and payment safety |
| Final assembly | `pipeline/final-case-builder.js` | Merges manual and generated cases, adds risk refs and evidence refs |
| AI review | `pipeline/siliconflow-llm-refinement.js` | Calls an LLM as a critic, not as an automatic merger |
| Review record | `docs/coverage-review.md`, `docs/llm-refinement-record.md` | Records which model suggestions are adopted, rejected, or deferred |

## Human Control Points

- The script never submits real payment and does not enter real card data.
- Declined-card probing is disabled unless a separate explicit gate is added.
- LLM output is logged for auditability, but no suggestion is merged into the final CSV without human review.
- Manual review owns business risk priority, compliance interpretation, pricing judgment, and production safety boundaries.
