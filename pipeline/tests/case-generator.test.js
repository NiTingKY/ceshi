const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyPageRecord,
  generateCasesFromLog,
  toCsv,
} = require("../case-generator");

test("classifyPageRecord maps observed page records to stable page types", () => {
  assert.equal(
    classifyPageRecord({
      stage: "quiz",
      lines: ["What are your target zones?", "Choose all that apply", "Belly", "NEXT STEP"],
    }),
    "multi_select",
  );

  assert.equal(
    classifyPageRecord({
      stage: "quiz",
      lines: ["How tall are you?", "cm", "I consent to BetterMe processing my health onboarding data"],
    }),
    "health_consent_input",
  );

  assert.equal(
    classifyPageRecord({
      stage: "paywall",
      lines: ["1-Week Trial", "HK$70.00", "GET MY PLAN"],
    }),
    "paywall",
  );

  assert.equal(
    classifyPageRecord({
      stage: "paywall",
      paymentSurface: {
        inputs: [{ autocomplete: "cc-number", placeholder: "XXXX XXXX XXXX XXXX" }],
        buttons: ["CONTINUE"],
      },
      lines: ["GET MY PLAN"],
    }),
    "checkout_surface",
  );

  assert.equal(
    classifyPageRecord({
      stage: "quiz",
      paymentSurface: { inputs: [], buttons: ["CONTINUE"] },
      lines: ["Tired of lengthy, ineffective workouts? Restrictive diets leave you frustrated?", "Helpful marketing copy", "CONTINUE"],
    }),
    "info",
  );
});

test("generateCasesFromLog creates deterministic cases from representative records", () => {
  const log = [
    { step: 1, stage: "quiz", lines: ["What is your main goal?", "Lose weight", "Improve posture"] },
    { step: 2, stage: "quiz", lines: ["What are your target zones?", "Choose all that apply", "Belly", "Butt", "NEXT STEP"] },
    { step: 3, stage: "discount", lines: ["Scratch to reveal your special discount!", "30", "%", "discount"] },
    { step: 4, stage: "paywall", lines: ["1-Week Trial", "HK$70.00", "GET MY PLAN"] },
  ];

  const cases = generateCasesFromLog(log);

  assert.deepEqual(
    cases.map((testCase) => testCase.id),
    ["AUTO-001-01", "AUTO-002-01", "AUTO-002-02", "AUTO-003-01", "AUTO-004-01"],
  );
  assert.equal(cases[0].module, "Quiz");
  assert.equal(cases[1].type, "Validation");
  assert.equal(cases[3].module, "Discount");
  assert.equal(cases[4].module, "Paywall");
});

test("generateCasesFromLog filters section headers from action examples", () => {
  const cases = generateCasesFromLog([
    {
      step: 3,
      stage: "quiz",
      lines: ["My Profile", "What is your main goal?", "Lose weight", "Improve posture"],
    },
  ]);

  assert.match(cases[0].steps, /Lose weight/);
  assert.doesNotMatch(cases[0].steps, /My Profile/);
});

test("toCsv escapes commas, quotes and newlines", () => {
  const csv = toCsv([
    {
      id: "AUTO-001-01",
      module: "Quiz",
      priority: "P1",
      type: "Functional",
      title: "Question with comma, and quote",
      precondition: "Page is visible",
      steps: "Tap \"Lose weight\"\nContinue",
      expected: "Next page loads",
      source: "script",
    },
  ]);

  assert.equal(
    csv,
    [
      '"id","module","priority","type","title","precondition","steps","expected","source"',
      '"AUTO-001-01","Quiz","P1","Functional","Question with comma, and quote","Page is visible","Tap ""Lose weight""\nContinue","Next page loads","script"',
      "",
    ].join("\n"),
  );
});
