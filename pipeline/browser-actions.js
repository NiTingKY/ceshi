async function clickText(page, text) {
  const clickable = page
    .locator("button, [role=button], a, label")
    .filter({ hasText: text })
    .first();

  if (await clickable.isVisible({ timeout: 800 }).catch(() => false)) {
    const enabled = await clickable.isEnabled({ timeout: 500 }).catch(() => false);
    if (!enabled) return false;
    return await clickable.click({ timeout: 5000 }).then(() => true).catch(() => false);
  }

  const exact = page.getByText(text, { exact: true }).first();
  if (await exact.isVisible({ timeout: 800 }).catch(() => false)) {
    const box = await exact.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      return true;
    }
  }

  const loose = page.getByText(text).first();
  if (await loose.isVisible({ timeout: 800 }).catch(() => false)) {
    const box = await loose.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      return true;
    }
  }

  return false;
}

async function clickLastText(page, text) {
  const clickable = page
    .locator("button, [role=button], a, label")
    .filter({ hasText: text });
  const count = await clickable.count().catch(() => 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const target = clickable.nth(index);
    await target.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    if (!(await target.isVisible({ timeout: 800 }).catch(() => false))) continue;
    const enabled = await target.isEnabled({ timeout: 500 }).catch(() => false);
    if (!enabled) continue;
    return await target.click({ timeout: 5000 }).then(() => true).catch(() => false);
  }

  return clickText(page, text);
}

async function acceptConsentIfPresent(page) {
  const consentText = page.getByText(/I consent to .*processing my health onboarding data/i).first();
  if (!(await consentText.isVisible({ timeout: 500 }).catch(() => false))) return false;

  const checkbox = page.locator("input[type=checkbox]").first();
  if (await checkbox.isVisible({ timeout: 500 }).catch(() => false)) {
    if (!(await checkbox.isChecked().catch(() => false))) {
      await checkbox.check({ timeout: 3000 }).catch(async () => {
        await consentText.click({ timeout: 3000 });
      });
    }
    return true;
  }

  await consentText.click({ timeout: 3000 }).catch(() => {});
  return true;
}

async function scratchDiscountIfPresent(page) {
  const scratchText = page.getByText(/Scratch it off/i).first();
  if (!(await scratchText.isVisible({ timeout: 800 }).catch(() => false))) return false;

  const box = await scratchText.boundingBox().catch(() => null);
  if (!box) return false;

  const startX = box.x + Math.max(8, box.width * 0.15);
  const midY = box.y + box.height / 2;
  const endX = box.x + Math.max(12, box.width * 0.85);

  await page.mouse.move(startX, midY);
  await page.mouse.down();
  await page.mouse.move(endX, midY, { steps: 12 });
  await page.mouse.move(startX, midY + Math.min(24, box.height / 3), { steps: 12 });
  await page.mouse.up();
  return true;
}

async function inspectPaymentSurface(page) {
  const inputs = [];
  const buttons = [];
  const frameUrls = [];

  for (const frame of page.frames()) {
    frameUrls.push(frame.url());

    const frameInputs = frame.locator("input:not([type=hidden]), textarea, select");
    const inputCount = await frameInputs.count().catch(() => 0);
    for (let index = 0; index < inputCount; index += 1) {
      const input = frameInputs.nth(index);
      if (!(await input.isVisible().catch(() => false))) continue;
      inputs.push({
        frameUrl: frame.url(),
        type: (await input.getAttribute("type").catch(() => "")) || "",
        name: (await input.getAttribute("name").catch(() => "")) || "",
        placeholder: (await input.getAttribute("placeholder").catch(() => "")) || "",
        ariaLabel: (await input.getAttribute("aria-label").catch(() => "")) || "",
        autocomplete: (await input.getAttribute("autocomplete").catch(() => "")) || "",
      });
    }

    const frameButtons = frame.locator("button, [role=button], input[type=submit]");
    const buttonCount = await frameButtons.count().catch(() => 0);
    for (let index = 0; index < buttonCount; index += 1) {
      const button = frameButtons.nth(index);
      if (!(await button.isVisible().catch(() => false))) continue;
      const text = (await button.innerText().catch(() => "")) || (await button.getAttribute("value").catch(() => "")) || "";
      const cleanText = String(text).replace(/\s+/g, " ").trim();
      if (cleanText && !buttons.includes(cleanText)) buttons.push(cleanText);
    }
  }

  return { frameUrls, inputs, buttons };
}

module.exports = {
  acceptConsentIfPresent,
  clickLastText,
  clickText,
  inspectPaymentSurface,
  scratchDiscountIfPresent,
};
