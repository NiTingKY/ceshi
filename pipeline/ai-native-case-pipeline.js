const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const { writeGeneratedCases } = require("./case-generator");
const { writeFinalCases, parseCsv } = require("./final-case-builder");
const { browserLaunchOptions } = require("./runtime");
const { runSiliconFlowRefinement } = require("./siliconflow-llm-refinement");

const DEFAULT_RUN_DIR = path.join("exploration", "runs", "2026-05-24-112646");
const DEFAULT_OUTPUT_DIR = path.join("generated", "2026-05-26-ai-native-run");
const DEFAULT_MANUAL_CSV = path.join("docs", "test-cases-v1.csv");
const DEFAULT_RISK_PATH = path.join("docs", "risk-register.md");
const DEFAULT_EXTENSION_CSV = path.join("docs", "test-cases-coverage-extension.csv");

function projectPath(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

function readCaseCount(csvPath) {
  return parseCsv(fs.readFileSync(csvPath, "utf8")).length;
}

function writeRunSummary({
  outputDir,
  runDir,
  generated,
  final,
  llmLogPath,
  llmLog,
  screenshotPaths,
}) {
  const summaryPath = path.join(outputDir, "pipeline-run-summary.md");
  const sourceCounts = groupCounts(JSON.parse(fs.readFileSync(final.outputJsonPath, "utf8")), "source");
  const lines = [
    "# AI Native Case Pipeline Run",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Purpose",
    "",
    "This run demonstrates that the stage 2 case set is produced through a repeatable AI-native pipeline: structured browser evidence becomes draft cases, Qwen/Qwen3-8B reviews coverage, and a final builder writes the reviewed CSV/JSON package.",
    "",
    "## Inputs",
    "",
    `- Evidence run: \`${projectPath(path.resolve(runDir))}\``,
    `- Flow log: \`${projectPath(path.resolve(runDir, "flow-log.json"))}\``,
    `- Risk register: \`${projectPath(path.resolve(DEFAULT_RISK_PATH))}\``,
    "",
    "## Outputs",
    "",
    `- Generated draft CSV: \`${projectPath(generated.csvPath)}\``,
    `- Generated draft JSON: \`${projectPath(generated.jsonPath)}\``,
    `- Case generation log: \`${projectPath(generated.logPath)}\``,
    `- LLM call log: \`${projectPath(llmLogPath)}\``,
    `- Final CSV: \`${projectPath(final.outputCsvPath)}\``,
    `- Final JSON: \`${projectPath(final.outputJsonPath)}\``,
    "",
    "## Counts",
    "",
    `- Script-generated draft cases: ${generated.caseCount}`,
    `- Final reviewed cases: ${final.finalCount}`,
    `- Final source distribution: ${Object.entries(sourceCounts).map(([key, value]) => `${key}=${value}`).join(", ")}`,
    "",
    "## SiliconFlow Review",
    "",
    `- Provider: ${llmLog.provider || "unknown"}`,
    `- Model: ${llmLog.model || "unknown"}`,
    `- HTTP status: ${llmLog.status || "unknown"}`,
    `- Duration: ${llmLog.durationMs || "unknown"} ms`,
    `- Prompt tokens: ${llmLog.accounting && llmLog.accounting.promptTokens || "unknown"}`,
    `- Completion tokens: ${llmLog.accounting && llmLog.accounting.completionTokens || "unknown"}`,
    `- Total tokens: ${llmLog.accounting && llmLog.accounting.totalTokens || "unknown"}`,
    `- API key logged: ${llmLog.safety && llmLog.safety.apiKeyLogged ? "yes" : "no"}`,
    "",
    "## Screenshot Evidence",
    "",
    `- Pipeline run summary: \`${projectPath(screenshotPaths.summary)}\``,
    `- Generated draft cases CSV: \`${projectPath(screenshotPaths.generatedCsv)}\``,
    `- Final reviewed cases CSV: \`${projectPath(screenshotPaths.finalCsv)}\``,
    "",
    "## Human Review Boundary",
    "",
    "- LLM output is treated as review evidence and is not merged without human judgment.",
    "- Payment-sensitive behavior remains gated: no real card data, no real payment submission, and declined-card probing stays disabled by default.",
  ];
  fs.writeFileSync(summaryPath, `${lines.join("\n")}\n`, "utf8");
  return summaryPath;
}

function groupCounts(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownToHtml(markdown) {
  const blocks = String(markdown || "").split(/\n{2,}/);
  return blocks.map((block) => {
    if (/^# /.test(block)) return `<h1>${htmlEscape(block.replace(/^# /, ""))}</h1>`;
    if (/^## /.test(block)) return `<h2>${htmlEscape(block.replace(/^## /, ""))}</h2>`;
    if (/^- /m.test(block)) {
      return `<ul>${block.split(/\r?\n/).filter(Boolean).map((line) => `<li>${htmlEscape(line.replace(/^- /, ""))}</li>`).join("")}</ul>`;
    }
    return `<p>${htmlEscape(block)}</p>`;
  }).join("\n");
}

function csvToHtml(csvText, maxRows = 35) {
  const rows = parseCsv(csvText).slice(0, maxRows);
  if (!rows.length) return "<p>No rows</p>";
  const headers = Object.keys(rows[0]);
  return [
    "<table>",
    `<thead><tr>${headers.map((header) => `<th>${htmlEscape(header)}</th>`).join("")}</tr></thead>`,
    `<tbody>${rows.map((row) => `<tr>${headers.map((header) => `<td>${htmlEscape(row[header])}</td>`).join("")}</tr>`).join("")}</tbody>`,
    "</table>",
  ].join("\n");
}

function renderEvidenceHtml({ title, sourcePath, outputPath }) {
  const text = fs.readFileSync(sourcePath, "utf8");
  const ext = path.extname(sourcePath).toLowerCase();
  const body = ext === ".csv" ? csvToHtml(text) : markdownToHtml(text);
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${htmlEscape(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #17202a; background: #f7f9fb; }
    h1 { font-size: 30px; margin: 0 0 18px; }
    h2 { font-size: 20px; margin: 24px 0 8px; }
    p, li { font-size: 14px; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; background: white; font-size: 12px; }
    th, td { border: 1px solid #d6dde6; padding: 7px 8px; vertical-align: top; }
    th { background: #e9eef5; text-align: left; position: sticky; top: 0; }
    td { max-width: 260px; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <h1>${htmlEscape(title)}</h1>
  ${body}
</body>
</html>`;
  fs.writeFileSync(outputPath, html, "utf8");
  return outputPath;
}

async function defaultScreenshotRenderer({ title, sourcePath, outputPath }) {
  const { chromium } = require("playwright");
  const htmlPath = outputPath.replace(/\.png$/i, ".html");
  renderEvidenceHtml({ title, sourcePath, outputPath: htmlPath });
  const browser = await chromium.launch(browserLaunchOptions());
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.resolve(htmlPath)).href);
    await page.screenshot({ path: outputPath, fullPage: false });
  } finally {
    await browser.close();
  }
  return outputPath;
}

async function runAiNativeCasePipeline({
  apiKey = process.env.SILICONFLOW_API_KEY,
  runDir = DEFAULT_RUN_DIR,
  manualCsvPath = DEFAULT_MANUAL_CSV,
  riskPath = DEFAULT_RISK_PATH,
  outputDir = DEFAULT_OUTPUT_DIR,
  finalCsvPath = path.join(outputDir, "final-test-cases.csv"),
  finalJsonPath = path.join(outputDir, "final-test-cases.json"),
  extensionPaths = fs.existsSync(DEFAULT_EXTENSION_CSV) ? [DEFAULT_EXTENSION_CSV] : [],
  reuseExistingLlmLog = process.env.AI_NATIVE_REUSE_LLM_LOG === "1",
  llmRunner = runSiliconFlowRefinement,
  screenshotRenderer = defaultScreenshotRenderer,
} = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const generated = writeGeneratedCases(path.resolve(runDir), path.resolve(outputDir));
  const final = writeFinalCases(
    path.resolve(manualCsvPath),
    generated.csvPath,
    path.resolve(finalCsvPath),
    path.resolve(finalJsonPath),
    extensionPaths.map((extensionPath) => path.resolve(extensionPath)),
  );
  const llmLogPath = path.resolve(outputDir, "llm-log.json");
  const llmResult = reuseExistingLlmLog && fs.existsSync(llmLogPath)
    ? { outputPath: llmLogPath, log: JSON.parse(fs.readFileSync(llmLogPath, "utf8")) }
    : await llmRunner({
      apiKey,
      casesPath: final.outputJsonPath,
      riskPath: path.resolve(riskPath),
      outputPath: llmLogPath,
    });
  const llmLog = llmResult.log;

  const screenshotsDir = path.join(outputDir, "screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });
  const screenshotPaths = {
    summary: path.join(screenshotsDir, "01-pipeline-run-summary.png"),
    generatedCsv: path.join(screenshotsDir, "02-generated-cases-csv.png"),
    finalCsv: path.join(screenshotsDir, "03-final-cases-csv.png"),
  };
  const summaryPath = writeRunSummary({
    outputDir: path.resolve(outputDir),
    runDir,
    generated,
    final,
    llmLogPath,
    llmLog,
    screenshotPaths,
  });

  await screenshotRenderer({ title: "AI Native Pipeline Run Summary", sourcePath: summaryPath, outputPath: screenshotPaths.summary });
  await screenshotRenderer({ title: `Generated Draft Cases (${readCaseCount(generated.csvPath)} rows)`, sourcePath: generated.csvPath, outputPath: screenshotPaths.generatedCsv });
  await screenshotRenderer({ title: `Final Reviewed Cases (${final.finalCount} rows)`, sourcePath: final.outputCsvPath, outputPath: screenshotPaths.finalCsv });

  return {
    outputDir: path.resolve(outputDir),
    generated,
    final,
    llmLogPath,
    summaryPath,
    screenshotPaths,
  };
}

if (require.main === module) {
  runAiNativeCasePipeline()
    .then((result) => {
      console.log(JSON.stringify({
        outputDir: result.outputDir,
        generatedCaseCount: result.generated.caseCount,
        finalCaseCount: result.final.finalCount,
        llmLogPath: result.llmLogPath,
        summaryPath: result.summaryPath,
        screenshots: result.screenshotPaths,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  csvToHtml,
  defaultScreenshotRenderer,
  markdownToHtml,
  renderEvidenceHtml,
  runAiNativeCasePipeline,
  writeRunSummary,
};
