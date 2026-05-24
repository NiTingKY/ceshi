# Context Handoff

Updated: 2026-05-24

Workspace: `C:\Users\bao\Documents\测试开发萧山`

## Project Purpose

This repository packages a BetterMe Pilates AI-native QA assignment. It demonstrates safe production funnel exploration, risk-based test design, repeatable script-assisted case generation, and clear reviewer-facing evidence.

Target funnel:

`Quiz -> Discount / Paywall -> Checkout`

No real payment was submitted.

## Current Best Evidence

- Current best run: `exploration/runs/2026-05-24-112646`
- Run summary: `exploration/runs/2026-05-24-112646/summary.md`
- Paywall summary: `exploration/runs/2026-05-24-112646/paywall-summary.md`
- Checkout summary: `exploration/runs/2026-05-24-112646/checkout-summary.md`
- Screenshots: `exploration/runs/2026-05-24-112646/screenshots/`
- Captured text and HTML: `exploration/runs/2026-05-24-112646/pages/`

Historical local runs kept out of Git to keep the remote repository small:

- `exploration/runs/2026-05-24-011613`: early stable main-path baseline
- `exploration/runs/2026-05-24-104911`: Paywall/discount run after scratch-card support
- `exploration/runs/2026-05-24-112646`: latest checkout-safe probe and current best evidence

## Main Artifacts

- Entry point: `README.md`
- Artifact map: `docs/project-artifacts.md`
- Final review guide: `docs/final-review-guide.md`
- Demo walkthrough: `docs/demo-walkthrough.md`
- Submission checklist: `docs/submission-checklist.md`
- Final cases: `docs/test-cases-final.csv`
- Final JSON mirror: `docs/test-cases-final.json`
- Page taxonomy: `docs/page-taxonomy.md`
- Risk register: `docs/risk-register.md`
- Funnel observation: `docs/funnel-observation.md`
- Checkout safe probe: `docs/checkout-safe-probe.md`

## Pipeline

| Script | Purpose |
| --- | --- |
| `pipeline/explore_betterme.js` | Runs Playwright exploration and captures evidence. |
| `pipeline/explore-helpers.js` | Cleans text, classifies stages, chooses safe actions, blocks payment URLs. |
| `pipeline/browser-actions.js` | Handles browser clicks, consent, scratch gesture, and payment surface inspection. |
| `pipeline/case-generator.js` | Converts `exploration/runs/2026-05-24-112646/flow-log.json` into generated test cases. |
| `pipeline/final-case-builder.js` | Merges manual and generated cases into final CSV/JSON with risk/evidence refs. |

## Safety Boundary

Allowed:

- Non-payment quiz interactions.
- Discount scratch-card interaction.
- Paywall inspection.
- Checkout field metadata inspection in `BETTERME_CHECKOUT_PROBE=1` mode.

Not allowed:

- Real card entry.
- Successful payment testing.
- Clicking the payment form submit CTA.
- Ungated declined-card probing.

Declined-card testing should only be added behind a separate hard gate, for example `BETTERME_ALLOW_DECLINE_CARD_PROBE=1`, and only if that boundary is explicitly approved.

## Known Gaps

- LLM refinement is scaffolded but not executed against a real model.
- Declined-card PoC is intentionally not implemented.
- Deep exploration covers one main user profile path.
- Cross-region price and localization comparison is not covered.
- Runtime commands were originally tied to the local Codex Node/Playwright cache; `package.json` now provides portable npm scripts for future setup.
