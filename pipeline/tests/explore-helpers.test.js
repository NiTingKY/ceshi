const test = require("node:test");
const assert = require("node:assert/strict");

const {
  extractMainLines,
  chooseNextAction,
  classifyFunnelStage,
  extractCheckoutSummary,
  extractDiscountSummary,
  findCheckoutProbeAction,
  isStopPage,
  shouldBlockPaymentUrl,
  inputValueForPage,
} = require("../explore-helpers");

test("extractMainLines removes footer policy links from captured page text", () => {
  const text = [
    "My Profile",
    "What is your main goal?",
    "Lose weight",
    "Increase muscle strength",
    "Docs",
    "FAQ",
    "Subscription Policy",
  ].join("\n");

  assert.deepEqual(extractMainLines(text), [
    "My Profile",
    "What is your main goal?",
    "Lose weight",
    "Increase muscle strength",
  ]);
});

test("chooseNextAction skips diet group headings and clicks the concrete diet option", () => {
  const lines = [
    "Nutrition",
    "What type of diet do you prefer?",
    "WITH MEAT",
    "Traditional",
    "I enjoy everything",
    "Keto",
    "I prefer high-fat low-carb meals",
    "WITHOUT MEAT",
    "Vegetarian",
  ];

  assert.deepEqual(chooseNextAction(lines), {
    type: "single",
    targets: ["Traditional"],
  });
});

test("chooseNextAction handles multi-select pages by selecting answers then NEXT STEP", () => {
  const lines = [
    "Activity",
    "What are your target zones?",
    "Choose all that apply",
    "Belly",
    "Butt",
    "Legs",
    "Chest",
    "NEXT STEP",
  ];

  assert.deepEqual(chooseNextAction(lines), {
    type: "multi",
    targets: ["Belly", "Butt", "NEXT STEP"],
  });
});

test("chooseNextAction skips explanatory copy on event pages", () => {
  const lines = [
    "Almost There",
    "Do you have an important event coming up?",
    "Having something to look forward to can be a great motivator for reaching your goal",
    "Vacation",
    "Wedding",
    "Holiday",
    "Sporting event",
    "Reunion",
    "Birthday",
    "Other",
    "No events any time soon",
  ];

  assert.deepEqual(chooseNextAction(lines), {
    type: "single",
    targets: ["No events any time soon"],
  });
});

test("chooseNextAction treats fullwidth question marks as question text", () => {
  const lines = [
    "你的主要目标是什么？",
    "Option A",
    "Option B",
  ];

  assert.deepEqual(chooseNextAction(lines), {
    type: "single",
    targets: ["Option A"],
  });
});

test("chooseNextAction waits on progress loader pages", () => {
  const lines = [
    "3%",
    "Creating your Pilates Plan for Beginners",
    "Your Pilates Plan for Beginners is ready!",
  ];

  assert.deepEqual(chooseNextAction(lines), {
    type: "wait",
    targets: [],
  });
});

test("isStopPage ignores footer subscription policy but stops on real checkout signals", () => {
  assert.equal(
    isStopPage([
      "My Profile",
      "What is your main goal?",
      "Lose weight",
      "Subscription Policy",
    ]),
    false,
  );

  assert.equal(
    isStopPage(["Secure checkout", "Card number", "CVV", "Start my plan"]),
    true,
  );
});

test("scratch-card discount page is safe to capture and continue with a scratch action", () => {
  const lines = [
    "Scratch to reveal your special discount!",
    "We want you to start your journey",
    "30",
    "%",
    "discount",
    "Promo code",
    "qa_may26",
    "Applied automatically at checkout",
    "Scratch it off",
  ];

  assert.equal(classifyFunnelStage(lines), "discount");
  assert.equal(isStopPage(lines), false);
  assert.deepEqual(chooseNextAction(lines), {
    type: "scratch",
    targets: ["Scratch it off"],
  });
});

test("checkout payment form remains a hard safety stop", () => {
  const lines = [
    "Secure checkout",
    "3-month plan",
    "$19.99",
    "Card number",
    "Expiration date",
    "CVV",
    "Start my plan",
  ];

  assert.equal(classifyFunnelStage(lines), "checkout");
  assert.equal(isStopPage(lines), true);
});

test("paywall with applied promo code is not treated as scratch-card discount", () => {
  const lines = [
    "Get your Pilates Plan for Beginners now!",
    "Your promo code is applied!",
    "qa_may26",
    "1-Week Trial",
    "4-WEEK PLAN",
    "HK$98.00",
    "HK$70.00",
    "per day",
    "GET MY PLAN",
  ];

  assert.equal(classifyFunnelStage(lines), "paywall");
  assert.equal(isStopPage(lines), true);
});

test("extractDiscountSummary captures discount and promo code signals", () => {
  const lines = [
    "Scratch to reveal your special discount!",
    "30",
    "%",
    "discount",
    "Promo code",
    "qa_may26",
    "Applied automatically at checkout",
    "6",
  ];

  assert.deepEqual(extractDiscountSummary(lines), {
    discountPercent: "30%",
    promoCode: "qa_may26",
    appliedAutomatically: true,
    countdownValue: "6",
  });
});

test("findCheckoutProbeAction allows one safe transition from paywall CTA", () => {
  const lines = [
    "Get your Pilates Plan for Beginners now!",
    "1-Week Trial",
    "HK$70.00",
    "GET MY PLAN",
    "Without cancellation, before the selected discounted intro plan ends",
  ];

  assert.equal(findCheckoutProbeAction(lines), "GET MY PLAN");
});

test("findCheckoutProbeAction does not click payment submission CTAs", () => {
  const lines = [
    "Secure checkout",
    "Card number",
    "Expiration date",
    "CVV",
    "Pay HK$70.00",
  ];

  assert.equal(findCheckoutProbeAction(lines), "");
});

test("extractCheckoutSummary captures payment fields and wallet entrances", () => {
  const lines = [
    "Secure checkout",
    "Email",
    "Card number",
    "Expiration date",
    "CVV",
    "ZIP code",
    "PayPal",
    "Apple Pay",
    "Pay HK$70.00",
  ];

  assert.deepEqual(extractCheckoutSummary(lines, ["https://js.stripe.com/v3"]), {
    stage: "checkout",
    fields: ["email", "card number", "expiration date", "cvv", "zip/postal code"],
    wallets: ["apple pay", "paypal"],
    submitCtas: ["Pay HK$70.00"],
    blockedRequests: ["https://js.stripe.com/v3"],
  });
});

test("extractCheckoutSummaryFromSurface maps payment iframe autocomplete fields", () => {
  const surface = {
    frameUrls: ["https://eu1-htp.tokenex.com/iframe/v3"],
    inputs: [
      { placeholder: "", name: "cc-name", ariaLabel: "", autocomplete: "cc-name" },
      { placeholder: "", name: "cc-exp", ariaLabel: "", autocomplete: "cc-exp" },
      { placeholder: "XXXX XXXX XXXX XXXX", name: "cardNumber", ariaLabel: "", autocomplete: "cc-number" },
      { placeholder: "CVV", name: "Data", ariaLabel: "", autocomplete: "cc-csc" },
    ],
    buttons: ["Credit card Card number Expiry date Security code CONTINUE", "CONTINUE"],
  };

  const { extractCheckoutSummaryFromSurface } = require("../explore-helpers");
  const summary = extractCheckoutSummaryFromSurface(surface, []);

  assert.deepEqual(summary.fields, ["cardholder name", "card number", "expiration date", "cvv"]);
  assert.deepEqual(summary.submitCtas, ["CONTINUE"]);
});

test("shouldBlockPaymentUrl blocks common payment gateway domains", () => {
  assert.equal(shouldBlockPaymentUrl("https://js.stripe.com/v3"), true);
  assert.equal(shouldBlockPaymentUrl("https://www.paypal.com/sdk/js"), true);
  assert.equal(shouldBlockPaymentUrl("https://pay.google.com/gp/p/js/pay.js"), true);
  assert.equal(shouldBlockPaymentUrl("https://betterme-pilates.com/checkout"), false);
});

test("inputValueForPage returns safe deterministic values for common fields", () => {
  assert.equal(inputValueForPage("What is your height?", "cm"), "170");
  assert.equal(inputValueForPage("What is your target weight?", "kg"), "62");
  assert.equal(inputValueForPage("Enter your email", "email"), "qa.betterme.test@example.com");
  assert.equal(inputValueForPage("Enter your email to get your plan", "Name"), "QA Tester");
});
