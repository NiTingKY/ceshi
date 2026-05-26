const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  auditProject,
  extractMarkdownRefs,
  hasBadTextSignal,
  parseCsvHeaders,
  resolveProjectRef,
  shouldIgnoreRef,
} = require("../project-audit");

test("hasBadTextSignal detects mojibake and legacy declined-card claims", () => {
  assert.equal(hasBadTextSignal("BetterMe Pilates Funnel Observation"), false);
  assert.equal(hasBadTextSignal(["杩", "欐 BetterMe Pilates 婕忔枟", "娴", "嬭瘯", "璁", "捐"].join("")), true);
  assert.equal(hasBadTextSignal("这次 BetterMe Pilates 漏斗测试设计"), false);
  assert.equal(hasBadTextSignal(["Stripe", " refusal test card is rejected"].join("")), true);
});

test("extractMarkdownRefs finds inline-code artifact references", () => {
  const refs = extractMarkdownRefs("Open `docs/test-cases-final.csv` and `flow-log.json`.");

  assert.deepEqual(refs, ["docs/test-cases-final.csv", "flow-log.json"]);
});

test("shouldIgnoreRef skips placeholders and glob patterns", () => {
  assert.equal(shouldIgnoreRef("generated/<run-id>-cases/generated-test-cases.csv"), true);
  assert.equal(shouldIgnoreRef("exploration/runs/<timestamp>/flow-log.json"), true);
  assert.equal(shouldIgnoreRef("pages/*.txt"), true);
  assert.equal(shouldIgnoreRef("docs/test-cases-final.csv"), false);
});

test("resolveProjectRef resolves project-root refs from nested docs", () => {
  const root = "C:\\repo";
  const file = "C:\\repo\\docs\\guide.md";
  const resolved = resolveProjectRef("pipeline/case-generator.js", file, root);

  assert.equal(resolved, path.join(root, "pipeline/case-generator.js"));
});

test("parseCsvHeaders reads the final case schema header", () => {
  const headers = parseCsvHeaders('"id","module","submodule"\n"TC-1","Quiz","Quiz - Entry"\n');

  assert.deepEqual(headers, ["id", "module", "submodule"]);
});

test("auditProject validates final case traceability and checkout safety", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "project-audit-"));
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });

  fs.writeFileSync(path.join(root, "docs", "risk-register.md"), [
    "| ID | Module | Risk | Impact | Priority | Suggested coverage |",
    "| --- | --- | --- | --- | --- | --- |",
    "| R-001 | Checkout | Real payment submission is triggered | Financial harm | P0 | Safe probe only |",
  ].join("\n"));
  fs.writeFileSync(path.join(root, "docs", "checkout-safe-probe.md"), "# Safe checkout probe\n");
  fs.writeFileSync(path.join(root, "docs", "test-cases-final.csv"), [
    "\"id\",\"module\",\"submodule\",\"priority\",\"type\",\"title\",\"precondition\",\"steps\",\"expected\",\"source\",\"riskRefs\",\"evidence\",\"refinementNotes\"",
    "\"TC-001\",\"Checkout\",\"Checkout\",\"P0\",\"Safety\",\"Checkout submits payment\",\"Checkout is visible\",\"Enter card details and submit payment\",\"Payment succeeds\",\"manual\",\"R-999\",\"docs/missing-evidence.md\",\"unsafe row\"",
    "\"TC-002\",\"Paywall\",\"Paywall\",\"P0\",\"Pricing\",\"Price visible\",\"Paywall is visible\",\"Inspect price\",\"Price is visible\",\"manual\",\"\",\"docs/checkout-safe-probe.md\",\"missing risk\"",
    "\"TC-003\",\"Quiz\",\"\",\"P1\",\"Functional\",\"Quiz evidence missing\",\"Quiz is visible\",\"Tap option\",\"Next page loads\",\"manual\",\"R-001\",\"\",\"missing evidence\"",
    "\"TC-004\",\"Height Input\",\"Quiz - Height Input\",\"P1\",\"Boundary\",\"Invalid module\",\"Quiz is visible\",\"Enter 89\",\"Validation appears\",\"manual\",\"R-001\",\"docs/checkout-safe-probe.md\",\"invalid module\"",
  ].join("\n"));

  const issueTypes = auditProject(root).map((issue) => issue.type);

  assert.ok(issueTypes.includes("final-case-unknown-risk"));
  assert.ok(issueTypes.includes("final-case-missing-risk"));
  assert.ok(issueTypes.includes("final-case-missing-evidence"));
  assert.ok(issueTypes.includes("final-case-missing-evidence-file"));
  assert.ok(issueTypes.includes("final-case-invalid-module"));
  assert.ok(issueTypes.includes("final-case-missing-submodule"));
  assert.ok(issueTypes.includes("checkout-safety-boundary"));
});
