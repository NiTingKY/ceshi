const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const DEFAULT_CASES_PATH = path.join("docs", "test-cases-final.json");
const DEFAULT_RISK_PATH = path.join("docs", "risk-register.md");
const DEFAULT_OUTPUT_PATH = path.join("generated", "2026-05-24-112646-cases", "llm-log.json");
const DEFAULT_ENDPOINT = "https://api.bochaai.com/v1/ai-search";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function estimateTokens(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return Math.ceil(String(text || "").length / 4);
}

function groupCounts(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function pickP0Cases(cases, limit = 18) {
  return cases
    .filter((testCase) => testCase.priority === "P0")
    .slice(0, limit)
    .map((testCase) => ({
      id: testCase.id,
      module: testCase.module,
      type: testCase.type,
      title: testCase.title,
      riskRefs: testCase.riskRefs,
    }));
}

function extractRiskSummary(markdown, limit = 16) {
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

function buildPrompt({ cases, riskMarkdown }) {
  const input = {
    objective: "Review a BetterMe Pilates QA case set and return a concise JSON quality review. Focus on missing coverage, unsafe checkout wording, AI blind spots, and stage-3/stage-4 task-book alignment. Use English only.",
    knownBoundary: "Production checkout must not submit payment or use real card data. Declined-card probing must stay disabled unless explicitly gated.",
    caseCount: cases.length,
    moduleCounts: groupCounts(cases, "module"),
    sourceCounts: groupCounts(cases, "source"),
    typeCounts: groupCounts(cases, "type"),
    sampleP0Cases: pickP0Cases(cases),
    riskSample: extractRiskSummary(riskMarkdown),
    expectedOutput: {
      coverageVerdict: "one sentence",
      highValueGaps: ["short gap"],
      safeAdoptions: ["short action"],
      rejectOrDefer: ["short reason"],
      nextStep: "one sentence",
    },
  };

  return JSON.stringify(input, null, 2);
}

function bochaPayload(prompt) {
  return {
    query: prompt,
    answer: true,
    stream: false,
    freshness: "noLimit",
    count: 8,
  };
}

function extractProviderOutput(responseJson) {
  const candidates = [
    responseJson.answer,
    responseJson.data && responseJson.data.answer,
    responseJson.data && responseJson.data.message,
    responseJson.data && responseJson.data.summary,
    responseJson.message,
    responseJson.msg,
  ].filter(Boolean);

  if (candidates.length) return String(candidates[0]);

  if (Array.isArray(responseJson.messages)) {
    const answerMessages = responseJson.messages
      .filter((message) => (
        message &&
        message.role === "assistant" &&
        (/answer|text|markdown/i.test(String(message.type || "")) ||
          /answer|text|markdown/i.test(String(message.content_type || "")))
      ))
      .map((message) => message.content)
      .filter(Boolean);

    if (answerMessages.length) {
      return answerMessages.map(normalizeMessageContent).join("\n").trim();
    }
  }

  const snippets = [];
  const sourceMessages = Array.isArray(responseJson.messages)
    ? responseJson.messages
      .filter((message) => message && message.type === "source")
      .flatMap((message) => {
        const parsed = tryParseJson(message.content);
        return Array.isArray(parsed && parsed.value) ? parsed.value : [];
      })
    : [];
  const values = sourceMessages.length
    ? sourceMessages
    : responseJson.data && (responseJson.data.webPages || responseJson.data.results || responseJson.data.items);
  if (Array.isArray(values)) {
    for (const item of values.slice(0, 5)) {
      snippets.push([item.name, item.title, item.snippet, item.summary].filter(Boolean).join(" - "));
    }
  }

  return snippets.filter(Boolean).join("\n") || JSON.stringify(responseJson).slice(0, 4000);
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeMessageContent(content) {
  const parsed = tryParseJson(content);
  if (!parsed) return String(content);
  if (typeof parsed === "string") return parsed;
  if (typeof parsed.text === "string") return parsed.text;
  if (typeof parsed.answer === "string") return parsed.answer;
  if (typeof parsed.value === "string") return parsed.value;
  return JSON.stringify(parsed);
}

function normalizeLog({ endpoint, payload, responseJson, durationMs, status }) {
  const providerOutput = extractProviderOutput(responseJson);
  const prompt = payload.query;
  const providerUsage = responseJson.usage || responseJson.data && responseJson.data.usage || null;

  return {
    generatedAt: new Date().toISOString(),
    provider: "bocha",
    endpoint,
    status,
    durationMs: Math.round(durationMs),
    request: {
      answer: payload.answer,
      stream: payload.stream,
      freshness: payload.freshness,
      count: payload.count,
      prompt,
      estimatedPromptTokens: estimateTokens(prompt),
    },
    response: {
      output: providerOutput,
      estimatedOutputTokens: estimateTokens(providerOutput),
      providerUsage,
      providerReturnedUsage: Boolean(providerUsage),
    },
    accounting: {
      billableApiCalls: 1,
      tokenAccounting: providerUsage ? "provider-reported" : "estimated-from-character-count",
      estimatedTotalTokens: estimateTokens(prompt) + estimateTokens(providerOutput),
    },
    safety: {
      realPaymentSubmitted: false,
      realCardDataEntered: false,
      apiKeyLogged: false,
    },
  };
}

async function callBocha({ apiKey, endpoint, payload, fetchImpl = fetch }) {
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
    const error = new Error(`Bocha API returned HTTP ${response.status}`);
    error.status = response.status;
    error.responseJson = responseJson;
    error.durationMs = durationMs;
    throw error;
  }

  return { responseJson, durationMs, status: response.status };
}

async function runBochaRefinement({
  apiKey = process.env.BOCHA_API_KEY,
  endpoint = process.env.BOCHA_API_ENDPOINT || DEFAULT_ENDPOINT,
  casesPath = DEFAULT_CASES_PATH,
  riskPath = DEFAULT_RISK_PATH,
  outputPath = DEFAULT_OUTPUT_PATH,
  fetchImpl = fetch,
} = {}) {
  if (!apiKey) {
    throw new Error("Missing BOCHA_API_KEY. Set it in the environment before running the Bocha dry-run.");
  }

  const cases = readJson(casesPath);
  const riskMarkdown = fs.readFileSync(riskPath, "utf8");
  const prompt = buildPrompt({ cases, riskMarkdown });
  const payload = bochaPayload(prompt);
  const { responseJson, durationMs, status } = await callBocha({ apiKey, endpoint, payload, fetchImpl });
  const log = normalizeLog({ endpoint, payload, responseJson, durationMs, status });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(log, null, 2), "utf8");

  return { outputPath, log };
}

if (require.main === module) {
  runBochaRefinement({
    casesPath: process.argv[2] || DEFAULT_CASES_PATH,
    riskPath: process.argv[3] || DEFAULT_RISK_PATH,
    outputPath: process.argv[4] || DEFAULT_OUTPUT_PATH,
  })
    .then(({ outputPath, log }) => {
      console.log(JSON.stringify({
        outputPath,
        provider: log.provider,
        status: log.status,
        durationMs: log.durationMs,
        estimatedTotalTokens: log.accounting.estimatedTotalTokens,
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
  buildPrompt,
  bochaPayload,
  estimateTokens,
  extractProviderOutput,
  normalizeLog,
  runBochaRefinement,
};
