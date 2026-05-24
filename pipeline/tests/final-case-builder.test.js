const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildFinalCases,
  inferEvidence,
  inferRiskRefs,
  parseCsv,
  toCsv,
} = require("../final-case-builder");

test("parseCsv reads quoted commas and newlines", () => {
  const rows = parseCsv('"id","title","steps"\n"TC-1","A, B","line1\nline2"\n');

  assert.deepEqual(rows, [{ id: "TC-1", title: "A, B", steps: "line1\nline2" }]);
});

test("inferRiskRefs maps case modules and titles to risk ids", () => {
  assert.equal(inferRiskRefs({ module: "Checkout", title: "Declined-card probe remains disabled without explicit gate" }), "R-036; R-037; R-038");
  assert.equal(inferRiskRefs({ module: "Checkout", title: "Checkout payment fields are captured without submitting payment" }), "R-036; R-037; R-038");
  assert.equal(inferRiskRefs({ module: "Discount", title: "Promo code is carried to Paywall" }), "R-028; R-029; R-030; R-031; R-032; R-033; R-034; R-035");
  assert.equal(inferRiskRefs({ module: "Height Input", title: "Height below minimum is rejected" }), "R-010; R-011; R-014; R-015");
  assert.equal(inferRiskRefs({ module: "Consent", title: "Health data consent is required" }), "R-014; R-015");
});

test("inferEvidence links cases to observed artifacts", () => {
  assert.match(inferEvidence({ module: "Paywall", title: "Paywall displays three plans" }), /paywall-summary/);
  assert.match(inferEvidence({ module: "Checkout", title: "Empty card form cannot submit" }), /checkout-summary/);
});

test("buildFinalCases preserves manual cases and appends non-duplicate generated checkout coverage", () => {
  const manual = [
    { id: "TC-QZ-001", module: "Quiz Entry", priority: "P0", type: "Functional", title: "Start quiz", precondition: "", steps: "", expected: "", source: "AI+manual" },
    { id: "TC-CO-001", module: "Checkout", priority: "P0", type: "Safety", title: "Payment domains are blocked during automation", precondition: "", steps: "", expected: "", source: "manual" },
  ];
  const generated = [
    { id: "AUTO-046-01", module: "Checkout", priority: "P0", type: "Safety", title: "Checkout payment fields are captured without submitting payment", precondition: "", steps: "", expected: "", source: "script-generated" },
    { id: "AUTO-003-01", module: "Quiz", priority: "P1", type: "Functional", title: "Answer single-choice page: What is your main goal?", precondition: "", steps: "", expected: "", source: "script-generated" },
  ];

  const finalCases = buildFinalCases(manual, generated);

  assert.equal(finalCases.length, 3);
  assert.equal(finalCases[0].id, "TC-QZ-001");
  assert.equal(finalCases[2].id, "AUTO-046-01");
  assert.equal(finalCases[2].source, "script-generated+review-needed");
  assert.ok(finalCases.every((testCase) => "riskRefs" in testCase));
  assert.ok(finalCases.every((testCase) => "evidence" in testCase));
});

test("toCsv emits final schema", () => {
  const csv = toCsv([
    {
      id: "TC-1",
      module: "Quiz",
      priority: "P1",
      type: "Functional",
      title: "Title",
      precondition: "Pre",
      steps: "Steps",
      expected: "Expected",
      source: "manual",
      riskRefs: "R-001",
      evidence: "docs/page-taxonomy.md",
      refinementNotes: "Kept",
    },
  ]);

  assert.match(csv, /^"id","module","priority","type","title","precondition","steps","expected","source","riskRefs","evidence","refinementNotes"/);
});
