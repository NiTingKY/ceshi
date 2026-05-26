const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const { browserLaunchOptions } = require("./runtime");

const DEFAULT_RUN_DIR = path.join("exploration", "runs", "2026-05-24-112646");
const DEFAULT_OUTPUT_DIR = path.join("generated", "2026-05-26-cross-cutting-probe");
const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function classifyCoverageStatus({ executed, blockedBy }) {
  if (executed) return "executed";
  if (blockedBy) return "design-disclosed";
  return "planned";
}

function summarizeViewportChecks(rawChecks) {
  return rawChecks.map((check) => ({
    name: check.name,
    width: check.width,
    height: check.height,
    horizontalOverflow: Number(check.scrollWidth || 0) > Number(check.width || 0) + 2,
    bodyTextCaptured: Number(check.bodyTextLength || 0) > 0,
  }));
}

function redactUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return `${url.origin}${url.pathname}`;
  } catch {
    return String(rawUrl || "").split("?")[0];
  }
}

function summarizeNetworkSignals(urls) {
  const redactedUrls = [...new Set(urls.map(redactUrl).filter(Boolean))];
  const analyticsLikeHosts = [...new Set(redactedUrls
    .filter((url) => /analytics|collect|event|track|telemetry|gtm|google|facebook|tiktok/i.test(url))
    .map((url) => {
      try {
        return new URL(url).hostname;
      } catch {
        return "";
      }
    })
    .filter(Boolean))].sort();

  return { analyticsLikeHosts, redactedUrls };
}

function selectRepresentativePages(flowLog) {
  const pages = flowLog.filter((entry) => entry.lines && entry.step);
  const firstByStage = (stage) => pages.find((entry) => entry.stage === stage);
  const quiz = firstByStage("quiz") || pages[0];
  const paywall = firstByStage("paywall") || pages.find((entry) => /paywall|plan|price/i.test((entry.lines || []).join(" ")));
  const checkout = firstByStage("checkout") || [...pages].reverse().find((entry) => {
    const surface = entry.paymentSurface || {};
    return (surface.inputs || []).length || /checkout|payment|card|cvv/i.test((entry.lines || []).join(" "));
  });

  return [
    { label: "quiz", entry: quiz },
    { label: "paywall", entry: paywall },
    { label: "checkout", entry: checkout },
  ].filter((item) => item.entry);
}

async function inspectLocalPage({ browser, htmlPath, label, viewport, screenshotDir }) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  try {
    await page.route(/^https?:\/\//, (route) => route.abort()).catch(() => {});
    const html = fs.readFileSync(htmlPath, "utf8");
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.screenshot({
      path: path.join(screenshotDir, `${label}-${viewport.name}.png`),
      fullPage: false,
    }).catch(() => {});

    const metrics = await page.evaluate(() => {
      const focusables = [...document.querySelectorAll("a, button, input, select, textarea, [tabindex]")];
      const unlabeledControls = focusables.filter((element) => {
        const text = (element.innerText || element.value || "").trim();
        const aria = element.getAttribute("aria-label") || element.getAttribute("aria-labelledby") || "";
        const placeholder = element.getAttribute("placeholder") || "";
        return !text && !aria && !placeholder;
      }).length;
      const timing = performance.getEntriesByType("navigation")[0];
      return {
        scrollWidth: document.documentElement.scrollWidth,
        bodyTextLength: document.body.innerText.length,
        focusableCount: focusables.length,
        unlabeledControls,
        renderMs: timing ? Math.round(timing.loadEventEnd - timing.startTime) : 0,
      };
    });

    return { label, ...viewport, ...metrics };
  } finally {
    await page.close();
  }
}

async function runCrossCuttingProbe({
  runDir = DEFAULT_RUN_DIR,
  outputDir = DEFAULT_OUTPUT_DIR,
  viewports = VIEWPORTS,
} = {}) {
  ensureDir(outputDir);
  const screenshotDir = path.join(outputDir, "screenshots");
  ensureDir(screenshotDir);

  const flowLog = readJson(path.join(runDir, "flow-log.json"), []);
  const representatives = selectRepresentativePages(flowLog);
  const networkUrls = [];
  const rawViewportChecks = [];
  const browser = await require("playwright").chromium.launch(browserLaunchOptions());

  try {
    for (const representative of representatives) {
      const htmlPath = path.join(runDir, "pages", `${String(representative.entry.step).padStart(2, "0")}.html`);
      if (!fs.existsSync(htmlPath)) continue;
      for (const viewport of viewports) {
        rawViewportChecks.push(await inspectLocalPage({
          browser,
          htmlPath,
          label: representative.label,
          viewport,
          screenshotDir,
        }));
      }
    }
  } finally {
    await browser.close();
  }

  for (const entry of flowLog) {
    if (entry.url) networkUrls.push(entry.url);
    for (const frameUrl of entry.paymentSurface?.frameUrls || []) networkUrls.push(frameUrl);
  }

  const results = {
    generatedAt: new Date().toISOString(),
    sourceRun: runDir.replace(/\\/g, "/"),
    representativePages: representatives.map((item) => ({
      label: item.label,
      step: item.entry.step,
      stage: item.entry.stage,
      url: item.entry.url,
    })),
    viewportChecks: summarizeViewportChecks(rawViewportChecks),
    rawViewportChecks,
    networkSignals: summarizeNetworkSignals(networkUrls),
    coverageStatus: buildCoverageStatusRows({ probeSummaryPath: path.join(outputDir, "summary.md").replace(/\\/g, "/") }),
    safetyBoundary: {
      realCardEntered: false,
      paymentSubmitted: false,
      checkoutProbeOnly: true,
    },
  };

  const resultsPath = path.join(outputDir, "results.json");
  const summaryPath = path.join(outputDir, "summary.md");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), "utf8");
  fs.writeFileSync(summaryPath, renderSummary(results), "utf8");
  return { outputDir, resultsPath, summaryPath, screenshotDir, results };
}

function buildCoverageStatusRows({ probeSummaryPath }) {
  return [
    {
      area: "Compatibility",
      cases: "TC-XC-001 to TC-XC-006",
      status: "partly-executed",
      evidence: probeSummaryPath,
      remainingGap: "Safari, mobile Safari, Firefox, and WeChat still need real-device or approved browser execution.",
    },
    {
      area: "Accessibility",
      cases: "TC-A11Y-001 to TC-A11Y-006",
      status: "partly-executed",
      evidence: probeSummaryPath,
      remainingGap: "Basic keyboard/control metadata is probed; full WCAG review or axe-style audit remains future work.",
    },
    {
      area: "Localization",
      cases: "TC-LOC-001 to TC-LOC-005",
      status: "design-disclosed",
      evidence: "docs/branch-coverage-plan.md",
      remainingGap: "Real currency and locale comparison needs approved safe-region execution.",
    },
    {
      area: "Performance and analytics",
      cases: "TC-PERF-001 to TC-PERF-003; TC-AN-001 to TC-AN-003",
      status: "partly-executed",
      evidence: probeSummaryPath,
      remainingGap: "Local render timing and analytics-like request inventory exist; backend event correctness needs internal analytics spec.",
    },
    {
      area: "Subscription lifecycle",
      cases: "TC-SUB-001 to TC-SUB-008",
      status: "design-disclosed",
      evidence: "docs/cross-cutting-coverage-status.md",
      remainingGap: "Post-purchase lifecycle execution requires staging, sandbox billing, or a test account with explicit approval.",
    },
  ];
}

function renderSummary(results) {
  const lines = [
    "# Cross-Cutting Evidence Probe",
    "",
    `Generated at: ${results.generatedAt}`,
    `Source run: \`${results.sourceRun}\``,
    "",
    "## Scope",
    "",
    "This probe adds executable evidence for selected cross-cutting checks by rendering captured BetterMe funnel pages at representative viewports and extracting safe DOM metadata. It does not claim real Safari, WeChat, cross-region billing, or post-purchase subscription execution.",
    "",
    "## Representative Pages",
    "",
    "| Label | Step | Stage | URL |",
    "| --- | ---: | --- | --- |",
    ...results.representativePages.map((page) => `| ${page.label} | ${page.step} | ${page.stage} | ${page.url} |`),
    "",
    "## Viewport Checks",
    "",
    "| Page | Viewport | Horizontal overflow | Body text captured | Focusable controls | Unlabeled controls | Local render ms |",
    "| --- | --- | --- | --- | ---: | ---: | ---: |",
    ...results.rawViewportChecks.map((check) => `| ${check.label} | ${check.name} ${check.width}x${check.height} | ${check.scrollWidth > check.width + 2 ? "yes" : "no"} | ${check.bodyTextLength > 0 ? "yes" : "no"} | ${check.focusableCount} | ${check.unlabeledControls} | ${check.renderMs} |`),
    "",
    "## Analytics-Like Network Inventory",
    "",
    `- Analytics-like hosts observed in captured run metadata: ${results.networkSignals.analyticsLikeHosts.length ? results.networkSignals.analyticsLikeHosts.join(", ") : "none detected in saved metadata"}`,
    `- Redacted URL count: ${results.networkSignals.redactedUrls.length}`,
    "",
    "## Coverage Status",
    "",
    "| Area | Cases | Status | Remaining gap |",
    "| --- | --- | --- | --- |",
    ...results.coverageStatus.map((row) => `| ${row.area} | ${row.cases} | ${row.status} | ${row.remainingGap} |`),
    "",
    "## Safety Boundary",
    "",
    "- No real card data entered.",
    "- No payment submitted.",
    "- Checkout observations remain limited to captured fields, iframe metadata, and safe visual checks.",
    "",
  ];
  return lines.join("\n");
}

if (require.main === module) {
  runCrossCuttingProbe()
    .then((result) => {
      console.log(JSON.stringify({
        outputDir: result.outputDir,
        summaryPath: result.summaryPath,
        resultsPath: result.resultsPath,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}

module.exports = {
  buildCoverageStatusRows,
  classifyCoverageStatus,
  renderSummary,
  runCrossCuttingProbe,
  summarizeNetworkSignals,
  summarizeViewportChecks,
};
