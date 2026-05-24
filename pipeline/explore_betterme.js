const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { browserLaunchOptions } = require("./runtime");
const {
  clean,
  extractMainLines,
  chooseNextAction,
  classifyFunnelStage,
  extractCheckoutSummary,
  extractCheckoutSummaryFromSurface,
  extractDiscountSummary,
  findCheckoutProbeAction,
  isStopPage,
  shouldBlockPaymentUrl,
  inputValueForPage,
} = require("./explore-helpers");
const {
  acceptConsentIfPresent,
  clickLastText,
  clickText,
  inspectPaymentSurface,
  scratchDiscountIfPresent,
} = require("./browser-actions");

const TARGET_URL = "https://betterme-pilates.com/first-page-brand-palette?flow=2117";
const MAX_STEPS = Number(process.env.BETTERME_MAX_STEPS || 80);
const CHECKOUT_PROBE = process.env.BETTERME_CHECKOUT_PROBE === "1";

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`,
  ].join("-");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function appendProgress(message) {
  ensureDir("docs");
  fs.appendFileSync(
    path.join("docs", "progress-log.md"),
    `\n## ${new Date().toISOString()}\n${message.trim()}\n`,
    "utf8",
  );
}

async function fillVisibleInputs(page, lines, events) {
  const mainText = lines.join("\n");
  if (/I consent to .*processing my health onboarding data/i.test(mainText)) {
    const accepted = await acceptConsentIfPresent(page);
    events.push({ type: "consent", accepted });
  }

  const inputs = page.locator("input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea");
  const count = await inputs.count();
  let filled = false;

  for (let index = 0; index < count; index += 1) {
    const input = inputs.nth(index);
    if (!(await input.isVisible().catch(() => false))) continue;
    const placeholder = clean((await input.getAttribute("placeholder").catch(() => "")) || "");
    const value = inputValueForPage(mainText, placeholder);
    await input.fill(value, { timeout: 5000 }).catch(() => {});
    events.push({ type: "fill", index, placeholder, value });
    filled = true;
  }

  return filled;
}

async function capturePage(page, runDir, step, actionBeforeCapture) {
  const stepName = String(step).padStart(2, "0");
  const text = await page.locator("body").innerText({ timeout: 7000 }).catch((error) => String(error));
  const lines = extractMainLines(text);
  const title = await page.title().catch(() => "");
  const url = page.url();

  await page.screenshot({
    path: path.join(runDir, "screenshots", `${stepName}.png`),
    fullPage: true,
  }).catch(() => {});

  fs.writeFileSync(path.join(runDir, "pages", `${stepName}.txt`), text, "utf8");
  fs.writeFileSync(path.join(runDir, "pages", `${stepName}.html`), await page.content(), "utf8");

  const paymentSurface = await inspectPaymentSurface(page).catch(() => ({ frameUrls: [], inputs: [], buttons: [] }));

  return {
    step,
    actionBeforeCapture,
    url,
    title,
    stage: classifyFunnelStage(lines),
    lines,
    paymentSurface,
    mainPreview: clean(lines.join(" ")).slice(0, 1000),
  };
}

function writeSummary(runDir, log, stopReason) {
  const pages = log.filter((entry) => entry.lines);
  const summaryLines = [
    "# BetterMe Exploration Summary",
    "",
    `- Stop reason: ${stopReason}`,
    `- Pages captured: ${pages.length}`,
    "",
    "## Page Sequence",
    "",
  ];

  for (const page of pages) {
    const question = page.lines.find((line) => /[?？]$/.test(line)) || page.lines[0] || "(empty)";
    const answers = page.lines
      .filter((line) => !/[?？]$/.test(line))
      .slice(1, 8)
      .join(" | ");
    summaryLines.push(`- Step ${page.step}: ${question}`);
    if (answers) summaryLines.push(`  - Visible choices/text: ${answers}`);
  }

  fs.writeFileSync(path.join(runDir, "summary.md"), `${summaryLines.join("\n")}\n`, "utf8");
}

function writePaywallSummary(runDir, log, stopReason) {
  const pages = log.filter((entry) => entry.lines);
  const discountPages = pages.filter((entry) => entry.stage === "discount");
  const paywallPages = pages.filter((entry) => entry.stage === "paywall" || entry.stage === "checkout");
  const lines = [
    "# BetterMe Paywall / Checkout-Adjacent Summary",
    "",
    `- Stop reason: ${stopReason}`,
    `- Discount pages captured: ${discountPages.length}`,
    `- Paywall/checkout safety pages captured: ${paywallPages.length}`,
    "",
    "## Discount Signals",
    "",
  ];

  for (const page of discountPages) {
    const discount = extractDiscountSummary(page.lines);
    lines.push(`- Step ${page.step}: ${page.lines[0] || "(empty)"}`);
    if (discount.discountPercent) lines.push(`  - Discount: ${discount.discountPercent}`);
    if (discount.promoCode) lines.push(`  - Promo code: ${discount.promoCode}`);
    lines.push(`  - Applied automatically: ${discount.appliedAutomatically ? "yes" : "no"}`);
    if (discount.countdownValue) lines.push(`  - Visible countdown/value: ${discount.countdownValue}`);
  }

  lines.push("", "## Safety Boundary Pages", "");
  for (const page of paywallPages) {
    lines.push(`- Step ${page.step}: ${page.lines[0] || "(empty)"}`);
    lines.push(`  - Stage: ${page.stage}`);
    lines.push(`  - URL: ${page.url}`);
    lines.push(`  - Signals: ${page.lines.slice(0, 10).join(" | ")}`);
  }

  fs.writeFileSync(path.join(runDir, "paywall-summary.md"), `${lines.join("\n")}\n`, "utf8");
}

function writeCheckoutSummary(runDir, log, blockedRequests, stopReason) {
  const pages = log.filter((entry) => entry.lines);
  const checkoutPages = pages.filter((entry) => entry.stage === "checkout");
  const paymentSurfacePages = pages.filter((entry) => {
    const surface = entry.paymentSurface || {};
    const summary = extractCheckoutSummaryFromSurface(surface, []);
    return summary.fields.length || summary.submitCtas.length;
  });
  const paywallPages = pages.filter((entry) => entry.stage === "paywall");
  const latestCheckout = checkoutPages.at(-1);
  const latestSurfacePage = latestCheckout || paymentSurfacePages.at(-1);
  const summary = latestCheckout
    ? extractCheckoutSummary(latestCheckout.lines, blockedRequests)
    : latestSurfacePage
      ? extractCheckoutSummaryFromSurface(latestSurfacePage.paymentSurface, blockedRequests)
      : { stage: "", fields: [], wallets: [], submitCtas: [], blockedRequests, frameUrls: [], rawInputs: [], rawButtons: [] };

  const lines = [
    "# BetterMe Checkout Safe Probe Summary",
    "",
    `- Stop reason: ${stopReason}`,
    `- Checkout probe enabled: ${CHECKOUT_PROBE ? "yes" : "no"}`,
    `- Paywall pages captured: ${paywallPages.length}`,
    `- Checkout pages captured: ${checkoutPages.length}`,
    `- Payment surfaces captured: ${paymentSurfacePages.length}`,
    `- Payment gateway requests blocked: ${blockedRequests.length}`,
    "",
    "## Captured Payment Surface",
    "",
    `- Stage: ${summary.stage || "not reached"}`,
    `- Fields: ${summary.fields.length ? summary.fields.join(", ") : "not captured"}`,
    `- Wallets: ${summary.wallets.length ? summary.wallets.join(", ") : "not captured"}`,
    `- Submit CTAs: ${summary.submitCtas.length ? summary.submitCtas.join(" | ") : "not captured"}`,
    "",
    "## Blocked Requests",
    "",
  ];

  if (blockedRequests.length) {
    for (const requestUrl of blockedRequests) lines.push(`- ${requestUrl}`);
  } else {
    lines.push("- None observed");
  }

  if (latestSurfacePage) {
    lines.push("", "## Checkout Page", "", `- URL: ${latestSurfacePage.url}`, `- Title: ${latestSurfacePage.title}`);
    lines.push(`- Signals: ${latestSurfacePage.lines.slice(0, 30).join(" | ")}`);
    if (summary.rawInputs?.length) {
      lines.push("", "## Raw Inputs", "");
      for (const input of summary.rawInputs) {
        lines.push(`- placeholder="${input.placeholder}" name="${input.name}" aria-label="${input.ariaLabel}" autocomplete="${input.autocomplete}"`);
      }
    }
    if (summary.rawButtons?.length) {
      lines.push("", "## Raw Buttons", "", `- ${summary.rawButtons.join(" | ")}`);
    }
  }

  fs.writeFileSync(path.join(runDir, "checkout-summary.md"), `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const runDir = path.resolve("exploration", "runs", timestamp());
  ensureDir(path.join(runDir, "screenshots"));
  ensureDir(path.join(runDir, "pages"));

  const log = [];
  const blockedRequests = [];
  let stopReason = "max steps reached";
  let checkoutProbeUsed = false;

  const browser = await chromium.launch(browserLaunchOptions());

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: "en-US",
    });

    const page = await context.newPage();
    await page.route("**/*", (route) => {
      const requestUrl = route.request().url();
      if (shouldBlockPaymentUrl(requestUrl)) {
        blockedRequests.push(requestUrl);
        return route.abort();
      }
      return route.continue();
    }).catch(() => {});
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    await page.getByText(/Allow All|Accept All|Close/i).first().click({ timeout: 1500 }).catch(() => {});

    for (let step = 1; step <= MAX_STEPS; step += 1) {
      await page.waitForTimeout(1200);
      const pageInfo = await capturePage(page, runDir, step, log.at(-1)?.action || "start");
      log.push(pageInfo);

      if (CHECKOUT_PROBE && pageInfo.stage === "paywall" && !checkoutProbeUsed) {
        const probeAction = findCheckoutProbeAction(pageInfo.lines);
        if (probeAction) {
          checkoutProbeUsed = true;
          const clicked = await clickLastText(page, probeAction);
          log.push({ step, action: "checkout probe click", target: probeAction, clicked });
          if (!clicked) {
            stopReason = "checkout probe CTA not clickable";
            log.push({ step, action: "STOP", reason: stopReason });
            break;
          }
          await page.waitForTimeout(3500);
          await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
          continue;
        }
      }

      if (step > 5 && isStopPage(pageInfo.lines)) {
        stopReason = "reached paywall or checkout safety boundary";
        log.push({ step, action: "STOP", reason: stopReason });
        break;
      }

      const events = [];
      const filled = await fillVisibleInputs(page, pageInfo.lines, events);
      if (filled) {
        const continuation = pageInfo.lines.find((line) =>
          /^(Continue|Next|Submit|Done|OK|NEXT STEP|See my plan|Get my plan|Show my plan)$/i.test(line),
        );
        if (continuation) {
          const clicked = await clickText(page, continuation);
          log.push({ step, action: "filled inputs then continued", clicked, continuation, events });
        } else {
          log.push({ step, action: "filled inputs without continuation", events });
        }
        continue;
      }

      const action = chooseNextAction(pageInfo.lines);
      if (action.type === "wait") {
        log.push({ step, action: "wait", reason: "loader or progress page" });
        await page.waitForTimeout(2500);
        continue;
      }

      if (action.type === "scratch") {
        const scratched = await scratchDiscountIfPresent(page);
        log.push({ step, action: "scratch", scratched, targets: action.targets });
        if (!scratched) {
          stopReason = "scratch-card action target not found";
          log.push({ step, action: "STOP", reason: stopReason });
          break;
        }
        await page.waitForTimeout(2500);
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        continue;
      }

      if (action.type === "stop" || action.targets.length === 0) {
        stopReason = "no safe next action found";
        log.push({ step, action: "STOP", reason: stopReason });
        break;
      }

      const clickedTargets = [];
      for (const target of action.targets) {
        const clicked = await clickText(page, target);
        clickedTargets.push({ target, clicked });
        await page.waitForTimeout(500);
      }
      log.push({ step, action: action.type, clickedTargets });
      if (clickedTargets.some((target) => !target.clicked)) {
        stopReason = `target not clickable: ${clickedTargets.find((target) => !target.clicked).target}`;
        log.push({ step, action: "STOP", reason: stopReason });
        break;
      }
      await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(runDir, "flow-log.json"), JSON.stringify(log, null, 2), "utf8");
  writeSummary(runDir, log, stopReason);
  writePaywallSummary(runDir, log, stopReason);
  writeCheckoutSummary(runDir, log, blockedRequests, stopReason);
  appendProgress(`- Ran BetterMe exploration script.\n- Output: \`${runDir}\`\n- Result: ${stopReason}`);

  console.log(JSON.stringify({ ok: true, runDir, stopReason }, null, 2));
}

main().catch((error) => {
  appendProgress(`- BetterMe exploration script failed.\n- Error: ${error.stack || error.message}`);
  console.error(error);
  process.exit(1);
});
