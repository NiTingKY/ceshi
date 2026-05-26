const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const DEFAULT_CASES_PATH = path.join("docs", "test-cases-final.json");
const DEFAULT_RISK_PATH = path.join("docs", "risk-register.md");
const DEFAULT_OUTPUT_PATH = path.join("generated", "2026-05-24-112646-cases", "llm-log.json");
const DEFAULT_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen3-8B";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function groupCounts(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function pickCases(cases, priority, limit) {
  return cases
    .filter((testCase) => testCase.priority === priority)
    .slice(0, limit)
    .map((testCase) => ({
      id: testCase.id,
      module: testCase.module,
      priority: testCase.priority,
      type: testCase.type,
      title: testCase.title,
      source: testCase.source,
      riskRefs: testCase.riskRefs,
    }));
}

function extractRiskSummary(markdown, limit = 20) {
  return String(markdown || "")
    .split(/\r?\n/)
    .filter((line) => /^\| R-\d{3} \|/.test(line))
    .slice(0, limit)
    .map((line) => {
      const cells = line.split("|").map((cell) => cell.trim()).filter(Boolean);
      return {
        id: cells[0],
        module: cells[1],
        risk: cells[2],
        priority: cells[4],
      };
    });
}

function buildReviewInput({ cases, riskMarkdown }) {
  return {
    assignmentContext: "BetterMe Pilates AI Native QA challenge. Target funnel is Quiz -> Discount / Paywall -> Checkout. The production checkout safety boundary must be preserved.",
    requestedOutput: "Return strict JSON only. Do not use markdown. Review coverage and propose safe next actions; do not rewrite the final CSV automatically.",
    safetyBoundary: {
      realPaymentSubmitted: false,
      realCardDataEntered: false,
      declinedCardProbeDefault: "disabled unless an explicit hard gate exists",
    },
    caseSet: {
      count: cases.length,
      moduleCounts: groupCounts(cases, "module"),
      sourceCounts: groupCounts(cases, "source"),
      typeCounts: groupCounts(cases, "type"),
      priorityCounts: groupCounts(cases, "priority"),
      p0Samples: pickCases(cases, "P0", 22),
      p1Samples: pickCases(cases, "P1", 10),
    },
    riskSample: extractRiskSummary(riskMarkdown),
    expectedSchema: {
      coverageVerdict: "string",
      strongAreas: ["string"],
      highValueGaps: ["string"],
      unsafeOrOverclaimRisks: ["string"],
      suggestedCaseAdditions: [
        {
          module: "string",
          priority: "P0|P1|P2",
          title: "string",
          reason: "string",
        },
      ],
      humanDecisionHints: ["string"],
      nextStep: "string",
    },
  };
}

function buildMessages(reviewInput) {
  return [
    {
      role: "system",
      content: [
        "You are a senior QA test architect reviewing an AI Native testing assignment.",
        "Return strict JSON only.",
        "Do not suggest real payment submission, real card usage, or ungated declined-card probing.",
        "Prefer concrete, safe, task-book-aligned recommendations.",
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify(reviewInput, null, 2),
    },
  ];
}

function siliconFlowPayload({ model, messages }) {
  return {
    model,
    messages,
    stream: false,
    temperature: 0.2,
    max_tokens: 1200,
  };
}

function extractOutput(responseJson) {
  return responseJson &&
    responseJson.choices &&
    responseJson.choices[0] &&
    responseJson.choices[0].message &&
    responseJson.choices[0].message.content
    ? responseJson.choices[0].message.content.trim()
    : JSON.stringify(responseJson).slice(0, 4000);
}

function extractReasoning(responseJson) {
  return responseJson &&
    responseJson.choices &&
    responseJson.choices[0] &&
    responseJson.choices[0].message &&
    responseJson.choices[0].message.reasoning_content
    ? responseJson.choices[0].message.reasoning_content
    : "";
}

function normalizeLog({ endpoint, payload, responseJson, durationMs, status }) {
  const output = extractOutput(responseJson);
  const reasoning = extractReasoning(responseJson);
  const usage = responseJson.usage || null;

  return {
    generatedAt: new Date().toISOString(),
    provider: "siliconflow",
    model: payload.model,
    endpoint,
    status,
    durationMs: Math.round(durationMs),
    request: {
      stream: payload.stream,
      temperature: payload.temperature,
      maxTokens: payload.max_tokens,
      messages: payload.messages,
    },
    response: {
      output,
      reasoning,
      finishReason: responseJson.choices && responseJson.choices[0] && responseJson.choices[0].finish_reason || null,
      usage,
      providerReturnedUsage: Boolean(usage),
    },
    accounting: {
      billableApiCalls: 1,
      tokenAccounting: usage ? "provider-reported" : "missing-provider-usage",
      promptTokens: usage && usage.prompt_tokens || null,
      completionTokens: usage && usage.completion_tokens || null,
      totalTokens: usage && usage.total_tokens || null,
    },
    safety: {
      realPaymentSubmitted: false,
      realCardDataEntered: false,
      apiKeyLogged: false,
    },
  };
}

async function callSiliconFlow({ apiKey, endpoint, payload, fetchImpl = fetch }) {
  const started = performance.now();
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let responseJson;
  try {
    responseJson = JSON.parse(text);
  } catch (error) {
    responseJson = { rawText: text, parseError: error.message };
  }
  const durationMs = performance.now() - started;

  if (!response.ok) {
    const error = new Error(`SiliconFlow API returned HTTP ${response.status}`);
    error.status = response.status;
    error.responseJson = responseJson;
    error.durationMs = durationMs;
    throw error;
  }

  return { responseJson, durationMs, status: response.status };
}

async function runSiliconFlowRefinement({
  apiKey = process.env.SILICONFLOW_API_KEY,
  endpoint = process.env.SILICONFLOW_API_ENDPOINT || DEFAULT_ENDPOINT,
  model = process.env.SILICONFLOW_MODEL || DEFAULT_MODEL,
  casesPath = DEFAULT_CASES_PATH,
  riskPath = DEFAULT_RISK_PATH,
  outputPath = DEFAULT_OUTPUT_PATH,
  fetchImpl = fetch,
} = {}) {
  if (!apiKey) {
    throw new Error("Missing SILICONFLOW_API_KEY. Set it in the environment before running the SiliconFlow LLM refinement.");
  }

  const cases = readJson(casesPath);
  const riskMarkdown = fs.readFileSync(riskPath, "utf8");
  const reviewInput = buildReviewInput({ cases, riskMarkdown });
  const messages = buildMessages(reviewInput);
  const payload = siliconFlowPayload({ model, messages });
  const { responseJson, durationMs, status } = await callSiliconFlow({ apiKey, endpoint, payload, fetchImpl });
  const log = normalizeLog({ endpoint, payload, responseJson, durationMs, status });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(log, null, 2), "utf8");

  return { outputPath, log };
}

if (require.main === module) {
  runSiliconFlowRefinement({
    casesPath: process.argv[2] || DEFAULT_CASES_PATH,
    riskPath: process.argv[3] || DEFAULT_RISK_PATH,
    outputPath: process.argv[4] || DEFAULT_OUTPUT_PATH,
  })
    .then(({ outputPath, log }) => {
      console.log(JSON.stringify({
        outputPath,
        provider: log.provider,
        model: log.model,
        status: log.status,
        durationMs: log.durationMs,
        promptTokens: log.accounting.promptTokens,
        completionTokens: log.accounting.completionTokens,
        totalTokens: log.accounting.totalTokens,
        providerReturnedUsage: log.response.providerReturnedUsage,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.message);
      if (error.responseJson) console.error(JSON.stringify(error.responseJson, null, 2));
      process.exit(1);
    });
}

module.exports = {
  DEFAULT_ENDPOINT,
  DEFAULT_MODEL,
  buildMessages,
  buildReviewInput,
  extractOutput,
  normalizeLog,
  runSiliconFlowRefinement,
  siliconFlowPayload,
};
