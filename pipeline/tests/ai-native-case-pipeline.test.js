const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { runAiNativeCasePipeline } = require("../ai-native-case-pipeline");

function writeCsv(filePath, rows) {
  const headers = ["id", "module", "priority", "type", "title", "precondition", "steps", "expected", "source"];
  const csv = [
    headers.map((header) => `"${header}"`).join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] || "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  fs.writeFileSync(filePath, `${csv}\n`, "utf8");
}

test("runAiNativeCasePipeline generates cases, LLM log, final cases, summary, and screenshots", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-pipeline-"));
  const runDir = path.join(root, "run");
  const docsDir = path.join(root, "docs");
  const outputDir = path.join(root, "generated", "run");
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(path.join(runDir, "flow-log.json"), JSON.stringify([
    { step: 1, lines: ["What is your goal?", "Lose weight", "Build strength"] },
    { step: 2, lines: ["Choose all that apply", "Arms", "Legs", "NEXT STEP"] },
    { step: 3, paymentSurface: { inputs: [{ autocomplete: "cc-number" }], buttons: ["CONTINUE"] }, lines: ["Card number", "CONTINUE"] },
  ]), "utf8");
  fs.writeFileSync(path.join(runDir, "summary.md"), "# Summary\n");
  fs.writeFileSync(path.join(runDir, "checkout-summary.md"), "# Checkout\n");
  fs.writeFileSync(path.join(runDir, "paywall-summary.md"), "# Paywall\n");
  fs.writeFileSync(path.join(docsDir, "risk-register.md"), "| R-001 | Checkout | Unsafe payment | Harm | P0 | Safe probe |\n", "utf8");
  writeCsv(path.join(docsDir, "test-cases-v1.csv"), [
    {
      id: "TC-1",
      module: "Quiz Entry",
      priority: "P0",
      type: "Functional",
      title: "Manual baseline case",
      precondition: "Entry is visible",
      steps: "Start",
      expected: "Quiz starts",
      source: "manual",
    },
  ]);

  const screenshotCalls = [];
  const result = await runAiNativeCasePipeline({
    apiKey: "secret-test-key",
    runDir,
    manualCsvPath: path.join(docsDir, "test-cases-v1.csv"),
    riskPath: path.join(docsDir, "risk-register.md"),
    outputDir,
    finalCsvPath: path.join(outputDir, "final-test-cases.csv"),
    finalJsonPath: path.join(outputDir, "final-test-cases.json"),
    extensionPaths: [],
    llmRunner: async ({ outputPath }) => {
      fs.writeFileSync(outputPath, JSON.stringify({
        provider: "siliconflow",
        model: "Qwen/Qwen3-8B",
        status: 200,
        durationMs: 1234,
        request: { messages: [{ role: "user", content: "review" }] },
        response: { output: "{\"coverageVerdict\":\"ok\"}", providerReturnedUsage: true },
        accounting: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        safety: { apiKeyLogged: false },
      }, null, 2), "utf8");
      return { outputPath, log: JSON.parse(fs.readFileSync(outputPath, "utf8")) };
    },
    screenshotRenderer: async ({ title, sourcePath, outputPath }) => {
      screenshotCalls.push({ title, sourcePath, outputPath });
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, `screenshot:${title}`, "utf8");
      return outputPath;
    },
  });

  assert.equal(result.generated.caseCount > 0, true);
  assert.equal(result.final.finalCount >= 2, true);
  assert.equal(fs.existsSync(path.join(outputDir, "pipeline-run-summary.md")), true);
  assert.equal(fs.existsSync(path.join(outputDir, "llm-log.json")), true);
  assert.equal(fs.existsSync(path.join(outputDir, "screenshots", "01-pipeline-run-summary.png")), true);
  assert.equal(fs.existsSync(path.join(outputDir, "screenshots", "02-generated-cases-csv.png")), true);
  assert.equal(fs.existsSync(path.join(outputDir, "screenshots", "03-final-cases-csv.png")), true);
  assert.equal(screenshotCalls.length, 3);

  const summary = fs.readFileSync(path.join(outputDir, "pipeline-run-summary.md"), "utf8");
  assert.match(summary, /AI Native Case Pipeline Run/);
  assert.match(summary, /Qwen\/Qwen3-8B/);
  assert.doesNotMatch(summary, /secret-test-key/);
  assert.doesNotMatch(fs.readFileSync(path.join(outputDir, "llm-log.json"), "utf8"), /secret-test-key/);
});

test("runAiNativeCasePipeline can reuse an existing LLM log for evidence regeneration", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-pipeline-reuse-"));
  const runDir = path.join(root, "run");
  const docsDir = path.join(root, "docs");
  const outputDir = path.join(root, "generated", "run");
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(path.join(runDir, "flow-log.json"), JSON.stringify([
    { step: 1, lines: ["What is your goal?", "Lose weight", "Build strength"] },
  ]), "utf8");
  fs.writeFileSync(path.join(docsDir, "risk-register.md"), "| R-001 | Entry | Wrong flow | Harm | P0 | Start case |\n", "utf8");
  writeCsv(path.join(docsDir, "test-cases-v1.csv"), [
    {
      id: "TC-1",
      module: "Quiz Entry",
      priority: "P0",
      type: "Functional",
      title: "Manual baseline case",
      precondition: "Entry is visible",
      steps: "Start",
      expected: "Quiz starts",
      source: "manual",
    },
  ]);
  fs.writeFileSync(path.join(outputDir, "llm-log.json"), JSON.stringify({
    provider: "siliconflow",
    model: "Qwen/Qwen3-8B",
    status: 200,
    durationMs: 999,
    accounting: { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
    safety: { apiKeyLogged: false },
  }), "utf8");

  let llmRunnerCalled = false;
  const result = await runAiNativeCasePipeline({
    runDir,
    manualCsvPath: path.join(docsDir, "test-cases-v1.csv"),
    riskPath: path.join(docsDir, "risk-register.md"),
    outputDir,
    finalCsvPath: path.join(outputDir, "final-test-cases.csv"),
    finalJsonPath: path.join(outputDir, "final-test-cases.json"),
    extensionPaths: [],
    reuseExistingLlmLog: true,
    llmRunner: async () => {
      llmRunnerCalled = true;
      throw new Error("llm runner should not be called");
    },
    screenshotRenderer: async ({ outputPath }) => {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, "png", "utf8");
      return outputPath;
    },
  });

  assert.equal(llmRunnerCalled, false);
  assert.equal(result.llmLogPath, path.join(outputDir, "llm-log.json"));
  const summary = fs.readFileSync(path.join(outputDir, "pipeline-run-summary.md"), "utf8");
  assert.match(summary, /Total tokens: 3/);
});
