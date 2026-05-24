const test = require("node:test");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const {
  acceptConsentIfPresent,
  clickLastText,
  clickText,
  inspectPaymentSurface,
  scratchDiscountIfPresent,
} = require("../browser-actions");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

test("clickText clicks the clickable parent when visible text is nested in a span", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <button id="next" onclick="document.body.dataset.clicked = 'yes'">
        <span>NEXT STEP</span>
      </button>
    `);

    const clicked = await clickText(page, "NEXT STEP");

    assert.equal(clicked, true);
    assert.equal(await page.locator("body").getAttribute("data-clicked"), "yes");
  } finally {
    await browser.close();
  }
});

test("clickText returns false instead of throwing when the matching button is disabled", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <button disabled>
        <span>NEXT STEP</span>
      </button>
    `);

    const clicked = await clickText(page, "NEXT STEP");

    assert.equal(clicked, false);
  } finally {
    await browser.close();
  }
});

test("clickLastText clicks the last matching clickable element", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <button onclick="document.body.dataset.clicked = 'first'">GET MY PLAN</button>
      <div style="height: 1200px"></div>
      <button onclick="document.body.dataset.clicked = 'last'">GET MY PLAN</button>
    `);

    const clicked = await clickLastText(page, "GET MY PLAN");

    assert.equal(clicked, true);
    assert.equal(await page.locator("body").getAttribute("data-clicked"), "last");
  } finally {
    await browser.close();
  }
});

test("acceptConsentIfPresent checks an unchecked consent checkbox", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <label>
        <input type="checkbox" id="consent">
        I consent to BetterMe processing my health onboarding data
      </label>
    `);

    const accepted = await acceptConsentIfPresent(page);

    assert.equal(accepted, true);
    assert.equal(await page.locator("#consent").isChecked(), true);
  } finally {
    await browser.close();
  }
});

test("scratchDiscountIfPresent drags across the visible scratch area", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <div
        id="scratch"
        style="width: 220px; height: 90px; margin: 40px"
        onpointermove="document.body.dataset.scratched = 'yes'"
      >
        Scratch it off
      </div>
    `);

    const scratched = await scratchDiscountIfPresent(page);

    assert.equal(scratched, true);
    assert.equal(await page.locator("body").getAttribute("data-scratched"), "yes");
  } finally {
    await browser.close();
  }
});

test("inspectPaymentSurface captures visible inputs and button text without submitting", async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <form>
        <input placeholder="Card number" name="cardnumber">
        <input placeholder="Expiry date" name="exp-date">
        <input placeholder="CVV" name="cvc">
        <button>CONTINUE</button>
      </form>
    `);

    const surface = await inspectPaymentSurface(page);

    assert.deepEqual(surface.inputs.map((input) => input.placeholder), [
      "Card number",
      "Expiry date",
      "CVV",
    ]);
    assert.equal(surface.buttons.includes("CONTINUE"), true);
  } finally {
    await browser.close();
  }
});
