const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCoverageStatusRows,
  classifyCoverageStatus,
  summarizeNetworkSignals,
  summarizeViewportChecks,
} = require("../cross-cutting-probe");

test("classifyCoverageStatus separates executed evidence from design coverage", () => {
  assert.equal(classifyCoverageStatus({ executed: true, blockedBy: "" }), "executed");
  assert.equal(classifyCoverageStatus({ executed: false, blockedBy: "requires Safari device" }), "design-disclosed");
});

test("summarizeViewportChecks reports stable dimensions and missing horizontal overflow", () => {
  const checks = summarizeViewportChecks([
    { name: "mobile", width: 375, height: 812, scrollWidth: 375, bodyTextLength: 1200 },
    { name: "tablet", width: 768, height: 1024, scrollWidth: 820, bodyTextLength: 900 },
  ]);

  assert.deepEqual(checks, [
    { name: "mobile", width: 375, height: 812, horizontalOverflow: false, bodyTextCaptured: true },
    { name: "tablet", width: 768, height: 1024, horizontalOverflow: true, bodyTextCaptured: true },
  ]);
});

test("summarizeNetworkSignals redacts query strings and groups analytics-like requests", () => {
  const summary = summarizeNetworkSignals([
    "https://example.com/collect?email=a@example.com",
    "https://analytics.example.com/event/quiz-answer?card=1234",
    "https://cdn.example.com/app.js",
  ]);

  assert.deepEqual(summary.analyticsLikeHosts, ["analytics.example.com", "example.com"]);
  assert.deepEqual(summary.redactedUrls, [
    "https://example.com/collect",
    "https://analytics.example.com/event/quiz-answer",
    "https://cdn.example.com/app.js",
  ]);
});

test("buildCoverageStatusRows names the remaining disclosed gaps", () => {
  const rows = buildCoverageStatusRows({ probeSummaryPath: "generated/probe/summary.md" });

  assert.equal(rows.length, 5);
  assert.ok(rows.some((row) => row.area === "Compatibility" && row.status === "partly-executed"));
  assert.ok(rows.some((row) => row.area === "Localization" && /safe-region/.test(row.remainingGap)));
  assert.ok(rows.some((row) => row.area === "Subscription lifecycle" && /staging/.test(row.remainingGap)));
});
