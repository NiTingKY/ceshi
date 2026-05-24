const fs = require("node:fs");
const path = require("node:path");

const TEXT_EXTENSIONS = new Set([".md", ".csv", ".json", ".js"]);
const PROJECT_ROOT_PREFIXES = /^(docs|pipeline|exploration|generated|prompts)\//;
const BAD_TEXT_TOKENS = [
  "\uFFFD", "\u9225", "\u9241", "\u9242", "\u93C7", "\u93C8", "\u93B5", "\u5A55",
  "\u7470", "\u7481", "\u6924", "\u705E", "\u935A", "\u8FBE", "\u5A34", "\u5BEE",
  "\u60C2", "\u76F6", "\u951B", "\u7A0B", "\u8930", "\u4E67", "\u4E6A", "\u4E06",
  "\u4E05", "\u5B6D", "\u5BB2", "\u6B5A",
  ["Stripe", " refusal"].join(""),
  ["Payment", " is declined"].join(""),
  ["4000", " 0000", " 0000", " 0002"].join(""),
];
const BAD_TEXT_SIGNAL = new RegExp(BAD_TEXT_TOKENS.map(escapeRegExp).join("|"));
const FINAL_CASE_PATH = path.join("docs", "test-cases-final.csv");
const RISK_REGISTER_PATH = path.join("docs", "risk-register.md");

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function walkFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function hasBadTextSignal(text) {
  return BAD_TEXT_SIGNAL.test(String(text || ""));
}

function extractMarkdownRefs(text) {
  const refs = [];
  const pattern = /`([^`\r\n]+\.(?:md|csv|json|js|png|html|txt))`|\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of String(text || "").matchAll(pattern)) {
    refs.push((match[1] || match[2] || "").trim().replace(/^<|>$/g, ""));
  }
  return refs;
}

function shouldIgnoreRef(ref) {
  return (
    !ref ||
    /^(https?:|mailto:|#)/.test(ref) ||
    /[<>*]/.test(ref) ||
    /^node /.test(ref) ||
    /^npm /.test(ref)
  );
}

function resolveProjectRef(ref, sourceFile, rootDir) {
  if (/^[A-Za-z]:[\\/]/.test(ref)) return ref;
  if (PROJECT_ROOT_PREFIXES.test(ref) || ref === "README.md" || ref === "package.json" || ref === ".gitignore") {
    return path.join(rootDir, ref);
  }
  return path.join(path.dirname(sourceFile), ref);
}

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
  if (!headers) return [];
  return dataRows.map((dataRow) => Object.fromEntries(headers.map((header, index) => [header, dataRow[index] || ""])));
}

function extractRiskIds(markdownText) {
  return new Set([...String(markdownText || "").matchAll(/\|\s*(R-\d{3})\s*\|/g)].map((match) => match[1]));
}

function splitList(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasUnsafeCheckoutInstruction(testCase) {
  const text = [
    testCase.module,
    testCase.title,
    testCase.precondition,
    testCase.steps,
    testCase.expected,
  ].filter(Boolean).join(" ");

  if (!/checkout|payment|card|cvv|cvc/i.test(text)) return false;
  return /(submit payment|payment succeeds|enter card details|enter real card|type card|input card)/i.test(text);
}

function auditFinalCases(rootDir, issues) {
  const finalCasePath = path.join(rootDir, FINAL_CASE_PATH);
  const riskRegisterPath = path.join(rootDir, RISK_REGISTER_PATH);
  if (!fs.existsSync(finalCasePath)) return;

  const cases = parseCsv(fs.readFileSync(finalCasePath, "utf8"));
  if (cases.length !== 75) {
    issues.push({ type: "final-case-count", file: finalCasePath, count: cases.length, expected: 75 });
  }

  const riskIds = fs.existsSync(riskRegisterPath)
    ? extractRiskIds(fs.readFileSync(riskRegisterPath, "utf8"))
    : new Set();

  cases.forEach((testCase, index) => {
    const rowNumber = index + 2;
    const riskRefs = splitList(testCase.riskRefs);
    const evidenceRefs = splitList(testCase.evidence);

    if (!riskRefs.length) {
      issues.push({ type: "final-case-missing-risk", file: finalCasePath, row: rowNumber, id: testCase.id });
    }

    for (const riskRef of riskRefs) {
      if (!riskIds.has(riskRef)) {
        issues.push({ type: "final-case-unknown-risk", file: finalCasePath, row: rowNumber, id: testCase.id, riskRef });
      }
    }

    if (!evidenceRefs.length) {
      issues.push({ type: "final-case-missing-evidence", file: finalCasePath, row: rowNumber, id: testCase.id });
    }

    for (const evidenceRef of evidenceRefs) {
      const resolved = resolveProjectRef(evidenceRef, finalCasePath, rootDir);
      if (!fs.existsSync(resolved)) {
        issues.push({ type: "final-case-missing-evidence-file", file: finalCasePath, row: rowNumber, id: testCase.id, evidenceRef, resolved });
      }
    }

    if (hasUnsafeCheckoutInstruction(testCase)) {
      issues.push({ type: "checkout-safety-boundary", file: finalCasePath, row: rowNumber, id: testCase.id });
    }
  });
}

function auditProject(rootDir = process.cwd()) {
  const issues = [];
  const files = walkFiles(rootDir);

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (hasBadTextSignal(text)) {
      issues.push({ type: "bad-text", file });
    }

    if (path.extname(file) === ".md") {
      for (const ref of extractMarkdownRefs(text)) {
        if (shouldIgnoreRef(ref)) continue;
        const resolved = resolveProjectRef(ref, file, rootDir);
        if (!fs.existsSync(resolved)) {
          issues.push({ type: "missing-ref", file, ref, resolved });
        }
      }
    }
  }

  auditFinalCases(rootDir, issues);

  return issues;
}

if (require.main === module) {
  const issues = auditProject(process.cwd());
  if (issues.length) {
    console.error(JSON.stringify({ ok: false, issues }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, issues: [] }, null, 2));
}

module.exports = {
  auditFinalCases,
  auditProject,
  extractMarkdownRefs,
  extractRiskIds,
  hasBadTextSignal,
  hasUnsafeCheckoutInstruction,
  parseCsv,
  resolveProjectRef,
  shouldIgnoreRef,
};
