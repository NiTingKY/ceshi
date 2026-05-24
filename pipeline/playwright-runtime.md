# Playwright Runtime Notes

This workspace uses the bundled Codex Node.js runtime plus its pnpm-installed Playwright packages.

PowerShell command:

```powershell
$base='C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$base;$base\.pnpm\playwright@1.60.0\node_modules;$base\.pnpm\playwright-core@1.60.0\node_modules"
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' pipeline\explore_betterme.js
```

The script launches the local Microsoft Edge executable and blocks common payment domains before reaching checkout-sensitive areas.

Checkout-safe probe mode:

```powershell
$base='C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:NODE_PATH="$base;$base\.pnpm\playwright@1.60.0\node_modules;$base\.pnpm\playwright-core@1.60.0\node_modules"
$env:BETTERME_MAX_STEPS='75'
$env:BETTERME_CHECKOUT_PROBE='1'
& 'C:\Users\bao\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' pipeline\explore_betterme.js
```

This mode clicks one Paywall `GET MY PLAN` CTA, captures visible payment fields and embedded frame inputs, blocks common payment gateway domains, and stops before any payment form submission.
