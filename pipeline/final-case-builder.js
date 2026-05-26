const fs = require("node:fs");
const path = require("node:path");

const FINAL_HEADERS = [
  "id",
  "module",
  "submodule",
  "priority",
  "type",
  "title",
  "precondition",
  "steps",
  "expected",
  "source",
  "riskRefs",
  "evidence",
  "refinementNotes",
];

const MODULE_GROUPS = {
  "Quiz Entry": "Quiz",
  "Single Choice": "Quiz",
  "Multi Select": "Quiz",
  "Info Page": "Quiz",
  Consent: "Quiz",
  "Height Input": "Quiz",
  "Weight Input": "Quiz",
  "Goal Weight": "Quiz",
  "Unit Switch": "Quiz",
  "Wellness Profile": "Quiz",
  "Event Question": "Quiz",
  "Event Date": "Quiz",
  Loader: "Quiz",
  "Email Capture": "Quiz",
  "Name Capture": "Quiz",
  Discount: "Paywall",
  Paywall: "Paywall",
  Checkout: "Checkout",
  "Cross-cutting": "Cross-cutting",
  Subscription: "Subscription",
};

const TOP_LEVEL_MODULES = new Set(["Quiz", "Paywall", "Checkout", "Cross-cutting", "Subscription"]);

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value !== "")) rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  return dataRows.map((dataRow) => Object.fromEntries(headers.map((header, index) => [header, dataRow[index] || ""])));
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function inferRiskRefs(testCase) {
  const text = `${testCase.module || ""} ${testCase.type || ""} ${testCase.title || ""}`.toLowerCase();
  const risks = [];

  if (includesAny(text, [/quiz entry|age/])) risks.push("R-001", "R-002");
  if (includesAny(text, [/single choice|main goal|physical build|dream body|pilates|exercise|walk|schedule|energy|water|sleep|meal|diet/])) risks.push("R-003", "R-004", "R-005");
  if (includesAny(text, [/multi|target zones|sensitive|bad habits|life events|none of the above/])) risks.push("R-006", "R-007", "R-008");
  if (includesAny(text, [/diet group|with meat/])) risks.push("R-009");
  if (includesAny(text, [/height|unit|cm|ft/])) risks.push("R-010", "R-011", "R-014", "R-015");
  if (includesAny(text, [/\bconsent\b|health data|onboarding data/])) risks.push("R-014", "R-015");
  if (includesAny(text, [/\bweight\b|\bgoal weight\b|\bbmi\b|\bwellness\b/])) risks.push("R-012", "R-013", "R-016", "R-027");
  if (includesAny(text, [/event/])) risks.push("R-017", "R-018", "R-019");
  if (includesAny(text, [/loader|generation|progress/])) risks.push("R-020", "R-021", "R-022");
  if (includesAny(text, [/email/])) risks.push("R-023", "R-024");
  if (includesAny(text, [/name|escaped|xss/])) risks.push("R-025", "R-026");
  if (includesAny(text, [/discount|promo|scratch/])) risks.push("R-028", "R-029", "R-030");
  if (includesAny(text, [/paywall|price|plan|renewal|money-back|countdown/])) risks.push("R-031", "R-032", "R-033", "R-034", "R-035");
  if (includesAny(text, [/checkout|payment|card|stripe|paypal|expiry|cvv|cvc|wallet|refusal/])) risks.push("R-036", "R-037", "R-038");
  if (includesAny(text, [/refresh|back|session|order/])) risks.push("R-039");
  if (includesAny(text, [/region|currency|locali[sz]ation|locale|language|tax|hkd|usd/])) risks.push("R-040");
  if (includesAny(text, [/compatibility|viewport|mobile|tablet|desktop|chrome|safari|firefox|wechat|responsive/])) risks.push("R-041");
  if (includesAny(text, [/a11y|accessibility|keyboard|focus|aria|contrast|screen reader|error message/])) risks.push("R-042");
  if (includesAny(text, [/performance|slow network|load|latency|timing|web vitals/])) risks.push("R-043");
  if (includesAny(text, [/analytics|event tracking|tracking|telemetry|utm|funnel event/])) risks.push("R-044");
  if (includesAny(text, [/subscription|trial|active|renewal|grace|cancel|refund|upgrade|downgrade/])) risks.push("R-045");

  return [...new Set(risks)].join("; ");
}

function inferEvidence(testCase) {
  const text = `${testCase.module || ""} ${testCase.type || ""} ${testCase.title || ""}`.toLowerCase();
  if (/checkout|payment|card|stripe|paypal|cvv|cvc/.test(text)) {
    return "docs/checkout-safe-probe.md; exploration/runs/2026-05-24-112646/checkout-summary.md";
  }
  if (/compatibility|viewport|mobile|tablet|desktop|chrome|edge|safari|firefox|wechat|responsive|a11y|accessibility|keyboard|focus|aria|contrast|performance|analytics|tracking|telemetry|web vitals|slow network/.test(text)) {
    return "docs/cross-cutting-coverage-status.md; generated/2026-05-26-cross-cutting-probe/summary.md; generated/2026-05-26-cross-cutting-probe/results.json";
  }
  if (/locali[sz]ation|locale|language|region|currency|date format|translated|hkd|usd/.test(text)) {
    return "docs/cross-cutting-coverage-status.md; docs/branch-coverage-plan.md; docs/funnel-observation.md";
  }
  if (/subscription|trial|active|renewal|grace|cancel|refund|upgrade|downgrade/.test(text)) {
    return "docs/cross-cutting-coverage-status.md; docs/funnel-observation.md; docs/risk-register.md";
  }
  if (/paywall|price|plan|renewal|money-back|countdown|discount|promo|scratch/.test(text)) {
    return "docs/funnel-observation.md; exploration/runs/2026-05-24-112646/paywall-summary.md";
  }
  if (/risk|consent|height|weight|bmi|email|name|loader|event|multi|single|quiz|input/.test(text)) {
    return "docs/page-taxonomy.md; docs/risk-register.md; exploration/runs/2026-05-24-112646/summary.md";
  }
  return "docs/page-taxonomy.md; docs/funnel-observation.md";
}

function inferTopLevelModule(testCase) {
  const moduleName = testCase.module || "";
  if (TOP_LEVEL_MODULES.has(moduleName)) return moduleName;
  return MODULE_GROUPS[moduleName] || "Cross-cutting";
}

function inferSubmodule(testCase) {
  const moduleName = testCase.module || "";
  const topLevelModule = inferTopLevelModule(testCase);
  if (!moduleName) return topLevelModule;
  if (moduleName === topLevelModule) return topLevelModule;
  return `${topLevelModule} - ${moduleName}`;
}

function normalizeCase(testCase, notes) {
  return {
    id: testCase.id,
    module: inferTopLevelModule(testCase),
    submodule: inferSubmodule(testCase),
    priority: testCase.priority,
    type: testCase.type,
    title: testCase.title,
    precondition: testCase.precondition,
    steps: testCase.steps,
    expected: testCase.expected,
    source: testCase.source,
    riskRefs: inferRiskRefs(testCase),
    evidence: inferEvidence(testCase),
    refinementNotes: notes,
  };
}

function buildFinalCases(manualCases, generatedCases, extensionCases = []) {
  const finalCases = manualCases.map((testCase) => normalizeCase(testCase, "Manual v1 retained; risk and evidence fields added by final-case-builder."));
  const existingTitles = new Set(finalCases.map((testCase) => `${testCase.module}|${testCase.title}`.toLowerCase()));

  for (const generated of generatedCases) {
    const key = `${generated.module}|${generated.title}`.toLowerCase();
    const isCheckoutSurface = /checkout payment fields are captured/i.test(generated.title || "");
    if (!isCheckoutSurface || existingTitles.has(key)) continue;
    finalCases.push(normalizeCase(
      { ...generated, source: `${generated.source}+review-needed` },
      "Added from repeatable script output because it captures checkout iframe field evidence not covered in manual v1.",
    ));
    existingTitles.add(key);
  }

  for (const extension of extensionCases) {
    const key = `${extension.module}|${extension.title}`.toLowerCase();
    if (existingTitles.has(key)) continue;
    finalCases.push(normalizeCase(
      extension,
      "Coverage extension added for task-book compatibility, accessibility, localization, performance/analytics, or subscription-lifecycle requirements.",
    ));
    existingTitles.add(key);
  }

  return finalCases;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function toCsv(cases) {
  return `${[
    FINAL_HEADERS.map(csvCell).join(","),
    ...cases.map((testCase) => FINAL_HEADERS.map((header) => csvCell(testCase[header])).join(",")),
  ].join("\n")}\n`;
}

function writeFinalCases(manualPath, generatedPath, outputCsvPath, outputJsonPath, extensionPaths = []) {
  const manualCases = parseCsv(fs.readFileSync(manualPath, "utf8"));
  const generatedCases = parseCsv(fs.readFileSync(generatedPath, "utf8"));
  const extensionCases = extensionPaths.flatMap((extensionPath) => parseCsv(fs.readFileSync(extensionPath, "utf8")));
  const finalCases = buildFinalCases(manualCases, generatedCases, extensionCases);
  fs.mkdirSync(path.dirname(outputCsvPath), { recursive: true });
  fs.writeFileSync(outputCsvPath, toCsv(finalCases), "utf8");
  fs.writeFileSync(outputJsonPath, JSON.stringify(finalCases, null, 2), "utf8");
  return { finalCount: finalCases.length, outputCsvPath, outputJsonPath };
}

if (require.main === module) {
  const [manualPath, generatedPath, outputCsvPath, outputJsonPath, ...extensionPaths] = process.argv.slice(2);
  if (!manualPath || !generatedPath || !outputCsvPath || !outputJsonPath) {
    console.error("Usage: node pipeline/final-case-builder.js <manualCsv> <generatedCsv> <outputCsv> <outputJson> [extensionCsv...]");
    process.exit(1);
  }
  console.log(JSON.stringify(writeFinalCases(manualPath, generatedPath, outputCsvPath, outputJsonPath, extensionPaths), null, 2));
}

module.exports = {
  buildFinalCases,
  inferSubmodule,
  inferEvidence,
  inferRiskRefs,
  inferTopLevelModule,
  parseCsv,
  toCsv,
  writeFinalCases,
};
