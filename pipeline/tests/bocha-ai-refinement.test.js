const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  buildPrompt,
  bochaPayload,
  estimateTokens,
  extractProviderOutput,
  normalizeLog,
  runBochaRefinement,
} = require("../bocha-ai-refinement");

test("estimateTokens returns a conservative positive count", () => {
  assert.equal(estimateTokens("abcd"), 1);
  assert.equal(estimateTokens("abcde"), 2);
});

test("buildPrompt summarizes cases without requiring the full CSV", () => {
  const prompt = buildPrompt({
    cases: [
      { id: "TC-1", priority: "P0", module: "Checkout", type: "Safety", title: "Safe probe", riskRefs: "R-001", source: "manual" },
      { id: "TC-2", priority: "P1", module: "Paywall", type: "Pricing", title: "Price visible", riskRefs: "R-002", source: "AI" },
    ],
    riskMarkdown: "| R-001 | Checkout | Unsafe payment | Harm | P0 | Safe probe |",
  });
  const parsed = JSON.parse(prompt);

  assert.equal(parsed.caseCount, 2);
  assert.equal(parsed.moduleCounts.Checkout, 1);
  assert.equal(parsed.sourceCounts.manual, 1);
  assert.equal(parsed.sampleP0Cases[0].id, "TC-1");
});

test("bochaPayload requests a non-streaming answer", () => {
  assert.deepEqual(bochaPayload("review this").answer, true);
  assert.deepEqual(bochaPayload("review this").stream, false);
});

test("normalizeLog redacts key material and records accounting", () => {
  const log = normalizeLog({
    endpoint: "https://api.bochaai.com/v1/ai-search",
    payload: bochaPayload("review this"),
    responseJson: { answer: "{\"coverageVerdict\":\"ok\"}" },
    durationMs: 123.4,
    status: 200,
  });

  assert.equal(log.safety.apiKeyLogged, false);
  assert.equal(log.accounting.billableApiCalls, 1);
  assert.equal(log.response.providerReturnedUsage, false);
  assert.match(log.response.output, /coverageVerdict/);
});

test("extractProviderOutput prefers Bocha answer messages over source payloads", () => {
  const output = extractProviderOutput({
    messages: [
      {
        role: "assistant",
        type: "source",
        content_type: "webpage",
        content: JSON.stringify({ value: [{ name: "source", summary: "source summary" }] }),
      },
      {
        role: "assistant",
        type: "answer",
        content_type: "markdown",
        content: "Final quality review output",
      },
    ],
  });

  assert.equal(output, "Final quality review output");
});

test("extractProviderOutput can summarize Bocha source messages", () => {
  const output = extractProviderOutput({
    messages: [
      {
        role: "assistant",
        type: "source",
        content_type: "webpage",
        content: JSON.stringify({ value: [{ name: "source", summary: "source summary" }] }),
      },
    ],
  });

  assert.match(output, /source summary/);
});

test("runBochaRefinement writes llm-log.json through injected fetch", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bocha-refine-"));
  const casesPath = path.join(root, "cases.json");
  const riskPath = path.join(root, "risk.md");
  const outputPath = path.join(root, "llm-log.json");
  fs.writeFileSync(casesPath, JSON.stringify([
    { id: "TC-1", priority: "P0", module: "Checkout", type: "Safety", title: "Safe probe", riskRefs: "R-001", source: "manual" },
  ]));
  fs.writeFileSync(riskPath, "| R-001 | Checkout | Unsafe payment | Harm | P0 | Safe probe |");

  const fetchImpl = async (url, options) => {
    assert.equal(url, "https://api.bochaai.com/v1/ai-search");
    assert.equal(options.headers.Authorization, "Bearer test-key");
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ answer: "Use safer checkout wording and add accessibility coverage." }),
    };
  };

  const result = await runBochaRefinement({
    apiKey: "test-key",
    casesPath,
    riskPath,
    outputPath,
    fetchImpl,
  });

  assert.equal(result.outputPath, outputPath);
  assert.equal(fs.existsSync(outputPath), true);
  const saved = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert.equal(saved.provider, "bocha");
  assert.equal(saved.safety.apiKeyLogged, false);
});
