const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildFinalCases,
  inferEvidence,
  inferRiskRefs,
  inferSubmodule,
  inferTopLevelModule,
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
  assert.match(inferEvidence({ module: "Cross-cutting", type: "Compatibility", title: "Mobile 375 viewport preserves quiz CTA reachability" }), /cross-cutting-probe\/summary/);
  assert.match(inferEvidence({ module: "Subscription", title: "Renewal failure enters grace period without immediate data loss" }), /cross-cutting-coverage-status/);
});

test("inferTopLevelModule and inferSubmodule map detailed modules to task-book schema", () => {
  assert.equal(inferTopLevelModule({ module: "Height Input" }), "Quiz");
  assert.equal(inferSubmodule({ module: "Height Input" }), "Quiz - Height Input");
  assert.equal(inferTopLevelModule({ module: "Discount" }), "Paywall");
  assert.equal(inferSubmodule({ module: "Discount" }), "Paywall - Discount");
  assert.equal(inferTopLevelModule({ module: "Checkout" }), "Checkout");
  assert.equal(inferSubmodule({ module: "Checkout" }), "Checkout");
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
  assert.equal(finalCases[0].module, "Quiz");
  assert.equal(finalCases[0].submodule, "Quiz - Quiz Entry");
  assert.equal(finalCases[2].id, "AUTO-046-01");
  assert.equal(finalCases[2].module, "Checkout");
  assert.equal(finalCases[2].submodule, "Checkout");
  assert.equal(finalCases[2].source, "script-generated+review-needed");
  assert.ok(finalCases.every((testCase) => "riskRefs" in testCase));
  assert.ok(finalCases.every((testCase) => "evidence" in testCase));
});

test("buildFinalCases appends coverage extension cases after generated safety evidence", () => {
  const manual = [
    { id: "TC-QZ-001", module: "Quiz Entry", priority: "P0", type: "Functional", title: "Start quiz", precondition: "", steps: "", expected: "", source: "AI+manual" },
  ];
  const generated = [
    { id: "AUTO-046-01", module: "Checkout", priority: "P0", type: "Safety", title: "Checkout payment fields are captured without submitting payment", precondition: "", steps: "", expected: "", source: "script-generated" },
  ];
  const extension = [
    { id: "TC-XC-001", module: "Cross-cutting", priority: "P1", type: "Compatibility", title: "Mobile 375 viewport preserves quiz CTA reachability", precondition: "", steps: "", expected: "", source: "AI+manual" },
    { id: "TC-SUB-001", module: "Subscription", priority: "P1", type: "Functional", title: "Trial-to-active subscription state has clear renewal terms", precondition: "", steps: "", expected: "", source: "AI+manual" },
  ];

  const finalCases = buildFinalCases(manual, generated, extension);

  assert.equal(finalCases.length, 4);
  assert.equal(finalCases[2].id, "TC-XC-001");
  assert.equal(finalCases[3].id, "TC-SUB-001");
  assert.match(finalCases[2].riskRefs, /R-041/);
  assert.match(finalCases[3].riskRefs, /R-045/);
  assert.match(finalCases[2].evidence, /cross-cutting-probe/);
  assert.match(finalCases[3].refinementNotes, /Coverage extension/);
});

test("toCsv emits final schema", () => {
  const csv = toCsv([
    {
      id: "TC-1",
      module: "Quiz",
      submodule: "Quiz - Entry",
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

  assert.match(csv, /^"id","module","submodule","priority","type","title","precondition","steps","expected","source","riskRefs","evidence","refinementNotes"/);
});
