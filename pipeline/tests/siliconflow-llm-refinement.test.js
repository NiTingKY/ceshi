const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  DEFAULT_ENDPOINT,
  DEFAULT_MODEL,
  buildMessages,
  buildReviewInput,
  normalizeLog,
  runSiliconFlowRefinement,
  siliconFlowPayload,
} = require("../siliconflow-llm-refinement");

test("buildReviewInput summarizes case set and preserves safety boundary", () => {
  const reviewInput = buildReviewInput({
    cases: [
      { id: "TC-1", priority: "P0", module: "Checkout", type: "Safety", title: "Safe probe", riskRefs: "R-001", source: "manual" },
      { id: "TC-2", priority: "P1", module: "Paywall", type: "Pricing", title: "Price visible", riskRefs: "R-002", source: "AI" },
    ],
    riskMarkdown: "| R-001 | Checkout | Unsafe payment | Harm | P0 | Safe probe |",
  });

  assert.equal(reviewInput.caseSet.count, 2);
  assert.equal(reviewInput.caseSet.moduleCounts.Checkout, 1);
  assert.equal(reviewInput.caseSet.sourceCounts.manual, 1);
  assert.equal(reviewInput.caseSet.p0Samples[0].id, "TC-1");
  assert.equal(reviewInput.safetyBoundary.realPaymentSubmitted, false);
});

test("buildMessages requests strict JSON and includes the review input", () => {
  const messages = buildMessages({ caseSet: { count: 1 } });

  assert.equal(messages.length, 2);
  assert.match(messages[0].content, /strict JSON only/);
  assert.match(messages[1].content, /caseSet/);
});

test("siliconFlowPayload uses Qwen3-8B and non-streaming defaults", () => {
  const payload = siliconFlowPayload({
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: "review" }],
  });

  assert.equal(payload.model, "Qwen/Qwen3-8B");
  assert.equal(payload.stream, false);
  assert.equal(payload.temperature, 0.2);
});

test("normalizeLog records provider usage token accounting", () => {
  const log = normalizeLog({
    endpoint: DEFAULT_ENDPOINT,
    payload: siliconFlowPayload({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: "review" }],
    }),
    responseJson: {
      choices: [{ message: { content: "{\"coverageVerdict\":\"ok\"}" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    },
    durationMs: 99.6,
    status: 200,
  });

  assert.equal(log.provider, "siliconflow");
  assert.equal(log.accounting.tokenAccounting, "provider-reported");
  assert.equal(log.accounting.totalTokens, 30);
  assert.equal(log.safety.apiKeyLogged, false);
});

test("runSiliconFlowRefinement writes llm-log.json through injected fetch", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "siliconflow-refine-"));
  const casesPath = path.join(root, "cases.json");
  const riskPath = path.join(root, "risk.md");
  const outputPath = path.join(root, "llm-log.json");
  fs.writeFileSync(casesPath, JSON.stringify([
    { id: "TC-1", priority: "P0", module: "Checkout", type: "Safety", title: "Safe probe", riskRefs: "R-001", source: "manual" },
  ]));
  fs.writeFileSync(riskPath, "| R-001 | Checkout | Unsafe payment | Harm | P0 | Safe probe |");

  const fetchImpl = async (url, options) => {
    assert.equal(url, DEFAULT_ENDPOINT);
    assert.equal(options.headers.Authorization, "Bearer test-key");
    const body = JSON.parse(options.body);
    assert.equal(body.model, DEFAULT_MODEL);
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        choices: [{ message: { content: "{\"coverageVerdict\":\"ok\"}" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 11, completion_tokens: 7, total_tokens: 18 },
      }),
    };
  };

  const result = await runSiliconFlowRefinement({
    apiKey: "test-key",
    casesPath,
    riskPath,
    outputPath,
    fetchImpl,
  });

  assert.equal(result.outputPath, outputPath);
  assert.equal(fs.existsSync(outputPath), true);
  const saved = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert.equal(saved.provider, "siliconflow");
  assert.equal(saved.accounting.totalTokens, 18);
});
