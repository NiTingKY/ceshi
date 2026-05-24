const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  extractMarkdownRefs,
  hasBadTextSignal,
  resolveProjectRef,
  shouldIgnoreRef,
} = require("../project-audit");

test("hasBadTextSignal detects mojibake and legacy declined-card claims", () => {
  assert.equal(hasBadTextSignal("BetterMe Pilates Funnel Observation"), false);
  assert.equal(hasBadTextSignal(String.fromCharCode(0x5A34, 0x5BEE, 0x76F6)), true);
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
