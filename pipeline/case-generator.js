const fs = require("node:fs");
const path = require("node:path");

const HEADERS = ["id", "module", "priority", "type", "title", "precondition", "steps", "expected", "source"];
const SECTION_HEADERS = /^(My Profile|Activity|Lifestyle|Lifestyle & Habits|Health|Nutrition|PILATES FOR BEGINNERS|SELECT YOUR AGE TO START|1-MINUTE QUIZ)$/i;

function hasPaymentSurface(record) {
  const surface = record.paymentSurface || {};
  const hasCardInput = (surface.inputs || []).some((input) => {
    const text = [input.placeholder, input.name, input.ariaLabel, input.autocomplete].filter(Boolean).join(" ");
    return /cardNumber|cc-number|cc-name|cc-exp|cc-csc|cvv|cvc|card number/i.test(text);
  });
  const hasCreditCardButton = (surface.buttons || []).some((button) => /Credit card.*(Card number|Security code|CONTINUE)/i.test(button));
  return Boolean(hasCardInput || hasCreditCardButton);
}

function classifyPageRecord(record) {
  const lines = record.lines || [];
  const text = lines.join(" ");

  if (hasPaymentSurface(record)) return "checkout_surface";
  if (record.stage === "discount" || /Scratch to reveal|discount|Promo code/i.test(text)) return "discount";
  if (record.stage === "paywall" || /HK\$|\$\s?\d|GET MY PLAN|per day|1-Week Trial/i.test(text)) return "paywall";
  if (/Creating your .*Plan|\d{1,3}%/.test(text)) return "loader";
  if (/I consent to .*health onboarding data/i.test(text)) return "health_consent_input";
  if (/email/i.test(text)) return "email_input";
  if (/name/i.test(text) && /CONTINUE/i.test(text)) return "name_input";
  if (/cm|kg|lbs|ft|weight|tall/i.test(text) && /NEXT STEP/i.test(text)) return "unit_input";
  if (/Choose all that apply/i.test(text)) return "multi_select";
  if (/CONTINUE/i.test(text)) return "info";
  if (lines.some((line) => /\?$/.test(line)) && pageOptions(record).length >= 2) return "single_select";
  return "info";
}

function pageQuestion(record) {
  const lines = record.lines || [];
  return lines.find((line) => /\?$/.test(line)) || lines[0] || `Step ${record.step}`;
}

function pageOptions(record) {
  return (record.lines || [])
    .filter((line) => !/\?$/.test(line))
    .filter((line) => !SECTION_HEADERS.test(line))
    .filter((line) => !/^(Choose all that apply|NEXT STEP|CONTINUE)$/i.test(line))
    .slice(0, 6);
}

function caseId(step, index) {
  return `AUTO-${String(step).padStart(3, "0")}-${String(index).padStart(2, "0")}`;
}

function casesForRecord(record) {
  const type = classifyPageRecord(record);
  const question = pageQuestion(record);
  const options = pageOptions(record);
  const step = record.step || 0;

  if (type === "single_select") {
    return [{
      id: caseId(step, 1),
      module: "Quiz",
      priority: "P1",
      type: "Functional",
      title: `Answer single-choice page: ${question}`,
      precondition: `Step ${step} is visible`,
      steps: `Select one visible option such as "${options[0] || "first option"}"`,
      expected: "Only one answer is selected and the funnel advances to the next expected state",
      source: "script-generated",
    }];
  }

  if (type === "multi_select") {
    return [
      {
        id: caseId(step, 1),
        module: "Quiz",
        priority: "P0",
        type: "Validation",
        title: `Block empty multi-select submission: ${question}`,
        precondition: `Step ${step} is visible`,
        steps: "Do not select any answer and tap NEXT STEP",
        expected: "The page does not advance without at least one valid selection",
        source: "script-generated",
      },
      {
        id: caseId(step, 2),
        module: "Quiz",
        priority: "P1",
        type: "Functional",
        title: `Accept multiple answers: ${question}`,
        precondition: `Step ${step} is visible`,
        steps: `Select "${options[0] || "first option"}" and "${options[1] || "second option"}", then tap NEXT STEP`,
        expected: "Selected answers are retained and the funnel advances",
        source: "script-generated",
      },
    ];
  }

  if (type === "health_consent_input") {
    return [
      {
        id: caseId(step, 1),
        module: "Consent",
        priority: "P0",
        type: "Compliance",
        title: "Health onboarding consent is required before continuation",
        precondition: `Step ${step} is visible`,
        steps: "Enter a valid value without checking consent, then tap NEXT STEP",
        expected: "Continuation is blocked until consent is checked",
        source: "script-generated",
      },
      {
        id: caseId(step, 2),
        module: "Input",
        priority: "P0",
        type: "Validation",
        title: "Height input enforces documented numeric boundaries",
        precondition: `Step ${step} is visible`,
        steps: "Try values below, inside and above the displayed range",
        expected: "Out-of-range values are rejected and valid values can continue after consent",
        source: "script-generated",
      },
    ];
  }

  if (type === "unit_input") {
    return [{
      id: caseId(step, 1),
      module: "Input",
      priority: "P1",
      type: "Functional",
      title: `Validate numeric input page: ${question}`,
      precondition: `Step ${step} is visible`,
      steps: "Enter a valid numeric value, switch units if available, then continue",
      expected: "The value is accepted, unit state is consistent and downstream calculation updates",
      source: "script-generated",
    }];
  }

  if (type === "loader") {
    return [{
      id: caseId(step, 1),
      module: "Loader",
      priority: "P1",
      type: "Resilience",
      title: "Plan generation loader progresses and recovers",
      precondition: `Step ${step} loader is visible`,
      steps: "Wait for progress and refresh once during loading",
      expected: "Progress continues or resumes without restarting the full quiz",
      source: "script-generated",
    }];
  }

  if (type === "discount") {
    return [{
      id: caseId(step, 1),
      module: "Discount",
      priority: "P0",
      type: "Functional",
      title: "Scratch-card reveals discount and promo code",
      precondition: `Step ${step} discount page is visible`,
      steps: "Perform the scratch gesture and observe discount and promo code",
      expected: "Discount percent and promo code are visible and carried to Paywall",
      source: "script-generated",
    }];
  }

  if (type === "paywall") {
    return [{
      id: caseId(step, 1),
      module: "Paywall",
      priority: "P0",
      type: "Pricing",
      title: "Paywall displays plans, discounted prices and renewal terms",
      precondition: `Step ${step} Paywall is visible`,
      steps: "Inspect plan cards, discounted prices, per-day prices, selected plan and renewal copy",
      expected: "Prices and renewal terms are visible before purchase CTA",
      source: "script-generated",
    }];
  }

  if (type === "checkout_surface") {
    return [{
      id: caseId(step, 1),
      module: "Checkout",
      priority: "P0",
      type: "Safety",
      title: "Checkout payment fields are captured without submitting payment",
      precondition: `Step ${step} checkout surface is visible in safe probe mode`,
      steps: "Inspect cardholder, card number, expiry, CVV and payment CTA without entering real card data",
      expected: "Payment fields are present, third-party payment requests are blocked or recorded, and no payment is submitted",
      source: "script-generated",
    }];
  }

  return [{
    id: caseId(step, 1),
    module: "Content",
    priority: "P2",
    type: "Functional",
    title: `Continue informational page: ${question}`,
    precondition: `Step ${step} is visible`,
    steps: "Review content and tap the primary continue CTA",
    expected: "The page renders key content and advances through the intended CTA",
    source: "script-generated",
  }];
}

function generateCasesFromLog(log) {
  return log
    .filter((record) => record && Array.isArray(record.lines))
    .flatMap(casesForRecord);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function toCsv(cases) {
  const lines = [HEADERS.map(csvCell).join(",")];
  for (const testCase of cases) {
    lines.push(HEADERS.map((header) => csvCell(testCase[header])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function writeGeneratedCases(runDir, outputDir = runDir) {
  const log = JSON.parse(fs.readFileSync(path.join(runDir, "flow-log.json"), "utf8"));
  const cases = generateCasesFromLog(log);
  fs.mkdirSync(outputDir, { recursive: true });
  const csvPath = path.join(outputDir, "generated-test-cases.csv");
  const jsonPath = path.join(outputDir, "generated-test-cases.json");
  const logPath = path.join(outputDir, "case-generation-log.json");

  fs.writeFileSync(csvPath, toCsv(cases), "utf8");
  fs.writeFileSync(jsonPath, JSON.stringify(cases, null, 2), "utf8");
  fs.writeFileSync(logPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    inputRunDir: runDir,
    caseCount: cases.length,
    generator: "pipeline/case-generator.js",
  }, null, 2), "utf8");

  return { caseCount: cases.length, csvPath, jsonPath, logPath };
}

if (require.main === module) {
  const runDir = process.argv[2];
  const outputDir = process.argv[3] || runDir;
  if (!runDir) {
    console.error("Usage: node pipeline/case-generator.js <runDir> [outputDir]");
    process.exit(1);
  }
  console.log(JSON.stringify(writeGeneratedCases(path.resolve(runDir), path.resolve(outputDir)), null, 2));
}

module.exports = {
  classifyPageRecord,
  generateCasesFromLog,
  toCsv,
  writeGeneratedCases,
};
