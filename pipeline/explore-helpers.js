const FOOTER_MARKERS = /^(Docs|FAQ|Terms and Conditions of use|Privacy Policy|Subscription Policy|Money-Back Policy|e-Privacy Settings|We will be glad|Quiz:|support@|here)$/i;
const SECTION_HEADERS = /^(My Profile|Activity|Lifestyle|Lifestyle & Habits|Health|Nutrition|PILATES FOR BEGINNERS|SELECT YOUR AGE TO START|1-MINUTE QUIZ|Over 10 million people|have chosen BetterMe|Please review before continuing)$/i;
const GROUP_HEADINGS = /^(WITH MEAT|WITHOUT MEAT|WITH FISH|WITHOUT FISH|POPULAR|RECOMMENDED)$/i;
const CONTINUE_ACTIONS = /^(CONTINUE|Continue|Next|NEXT|OK|Got it|Submit|Done|See my plan|Get my plan|Show my plan|NEXT STEP)$/i;
const CHECKOUT_SIGNALS = /card number|cvv|cvc|expiration date|secure checkout|payment method|apple pay|google pay|paypal|total due|Start my plan|Pay|Complete purchase/i;
const PAYWALL_SIGNALS = /\$\s?\d|USD|trial for|per day|choose your plan|3-month plan|monthly plan|subscription/i;
const PAYMENT_GATEWAY_DOMAINS = /stripe\.com|paypal\.com|pay\.google\.com|apple-pay-gateway|checkout\.shopify|adyen\.com|braintreegateway\.com/i;

const PREFERRED_SINGLE_ANSWERS = [
  /^Age: 30-39$/i,
  /^CONTINUE$/i,
  /^Lose weight$/i,
  /^Mid-sized$/i,
  /^Toned$/i,
  /^I gain and lose weight easily$/i,
  /^Less than a year ago$/i,
  /^I'm just starting out$/i,
  /^Pretty flexible$/i,
  /^I'm slightly out of breath but can talk$/i,
  /^Almost every day$/i,
  /^9 to 5$/i,
  /^I spend most of the day sitting$/i,
  /^High and steady$/i,
  /^2 to 6 glasses \(16-48 oz\)$/i,
  /^7-8 hours$/i,
  /^Between 6 and 8 am$/i,
  /^Between noon and 2 pm$/i,
  /^Between 6 and 8 pm$/i,
  /^Traditional$/i,
  /^No events any time soon$/i,
  /^No$/i,
  /^At home$/i,
  /^None$/i,
  /^Female$/i,
  /^Woman$/i,
  /^Average$/i,
];

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractMainLines(text) {
  const rawLines = String(text || "")
    .split(/\n+/)
    .map(clean)
    .filter(Boolean);
  const lines = [];
  for (const line of rawLines) {
    if (FOOTER_MARKERS.test(line)) break;
    lines.push(line);
  }
  return lines;
}

function isQuestion(line) {
  return /[?？]$/.test(line);
}

function isNonAnswer(line) {
  return (
    SECTION_HEADERS.test(line) ||
    GROUP_HEADINGS.test(line) ||
    CONTINUE_ACTIONS.test(line) ||
    /^Having something to look forward to can be a great motivator/i.test(line) ||
    /^Choose all that apply$/i.test(line) ||
    /^By choosing/i.test(line) ||
    isQuestion(line)
  );
}

function chooseNextAction(lines) {
  if (classifyFunnelStage(lines) === "discount") {
    return { type: "scratch", targets: ["Scratch it off"] };
  }

  if (lines.some((line) => /^\d{1,3}%$/.test(line)) && lines.some((line) => /Creating your .*Plan/i.test(line))) {
    return { type: "wait", targets: [] };
  }

  if (lines.some((line) => /^Choose all that apply$/i.test(line))) {
    const options = lines.filter((line) => !isNonAnswer(line));
    return { type: "multi", targets: [...options.slice(0, 2), "NEXT STEP"] };
  }

  for (const preferred of PREFERRED_SINGLE_ANSWERS) {
    const hit = lines.find((line) => preferred.test(line));
    if (hit) return { type: "single", targets: [hit] };
  }

  const questionIndex = Math.max(...lines.map((line, index) => (isQuestion(line) ? index : -1)));
  const candidate = lines
    .slice(questionIndex >= 0 ? questionIndex + 1 : 0)
    .find((line) => !isNonAnswer(line) && line.length <= 90);

  return candidate ? { type: "single", targets: [candidate] } : { type: "stop", targets: [] };
}

function isStopPage(lines) {
  const mainText = lines.filter((line) => !FOOTER_MARKERS.test(line)).join(" ");
  return classifyFunnelStage(lines) !== "discount" && (CHECKOUT_SIGNALS.test(mainText) || PAYWALL_SIGNALS.test(mainText));
}

function classifyFunnelStage(lines) {
  const mainText = lines.filter((line) => !FOOTER_MARKERS.test(line)).join(" ");
  if (CHECKOUT_SIGNALS.test(mainText)) return "checkout";
  if (PAYWALL_SIGNALS.test(mainText)) return "paywall";
  if (/Scratch to reveal|Scratch it off/i.test(mainText)) return "discount";
  if (/Creating your .*Plan/i.test(mainText)) return "loader";
  return "quiz";
}

function extractDiscountSummary(lines) {
  const percentIndex = lines.findIndex((line, index) => /^\d{1,2}$/.test(line) && lines[index + 1] === "%");
  const promoIndex = lines.findIndex((line) => /^Promo code$/i.test(line));
  const countdown = [...lines].reverse().find((line) => /^\d{1,2}$/.test(line));

  return {
    discountPercent: percentIndex >= 0 ? `${lines[percentIndex]}%` : "",
    promoCode: promoIndex >= 0 ? lines[promoIndex + 1] || "" : "",
    appliedAutomatically: lines.some((line) => /Applied automatically at checkout/i.test(line)),
    countdownValue: countdown || "",
  };
}

function findCheckoutProbeAction(lines) {
  const stage = classifyFunnelStage(lines);
  if (stage !== "paywall") return "";
  return lines.find((line) => /^GET MY PLAN$/i.test(line)) || "";
}

function extractCheckoutSummary(lines, blockedRequests = []) {
  const foundFields = [];
  const wallets = [];
  const submitCtas = [];

  const fieldMatchers = [
    [/^e-?mail$|email address/i, "email"],
    [/cardholder|name on card|cc-name/i, "cardholder name"],
    [/card number|cardnumber|cc-number/i, "card number"],
    [/expiration date|expiry|exp\.?|cc-exp/i, "expiration date"],
    [/cvv|cvc|security code|cc-csc/i, "cvv"],
    [/zip code|postal code/i, "zip/postal code"],
    [/country/i, "country"],
  ];

  const walletMatchers = [
    [/apple pay/i, "apple pay"],
    [/google pay/i, "google pay"],
    [/paypal/i, "paypal"],
  ];

  for (const line of lines) {
    for (const [pattern, label] of fieldMatchers) {
      if (pattern.test(line) && !foundFields.includes(label)) foundFields.push(label);
    }
    for (const [pattern, label] of walletMatchers) {
      if (pattern.test(line) && !wallets.includes(label)) wallets.push(label);
    }
    if (/^(Pay\s|Pay$|Start my plan|Complete purchase|CONTINUE$)/i.test(line) && !/^PayPal$/i.test(line) && !submitCtas.includes(line)) {
      submitCtas.push(line);
    }
  }

  return {
    stage: classifyFunnelStage(lines),
    fields: ["email", "cardholder name", "card number", "expiration date", "cvv", "zip/postal code", "country"]
      .filter((field) => foundFields.includes(field)),
    wallets: ["apple pay", "google pay", "paypal"].filter((wallet) => wallets.includes(wallet)),
    submitCtas,
    blockedRequests,
  };
}

function extractCheckoutSummaryFromSurface(surface, blockedRequests = []) {
  const surfaceLines = [
    ...(surface.inputs || []).flatMap((input) => [
      input.placeholder,
      input.name,
      input.ariaLabel,
      input.autocomplete,
    ]),
    ...(surface.buttons || []),
  ].filter(Boolean);
  const summary = extractCheckoutSummary(surfaceLines, blockedRequests);
  return {
    ...summary,
    stage: summary.fields.length || summary.submitCtas.length ? "checkout" : summary.stage,
    frameUrls: surface.frameUrls || [],
    rawInputs: surface.inputs || [],
    rawButtons: surface.buttons || [],
  };
}

function shouldBlockPaymentUrl(url) {
  return PAYMENT_GATEWAY_DOMAINS.test(String(url || ""));
}

function inputValueForPage(mainText, placeholder = "") {
  const placeholderText = String(placeholder || "").toLowerCase();
  if (/name/.test(placeholderText)) return "QA Tester";
  if (/email/.test(placeholderText)) return "qa.betterme.test@example.com";

  const haystack = `${mainText || ""} ${placeholder || ""}`.toLowerCase();
  if (/email/.test(haystack)) return "qa.betterme.test@example.com";
  if (/height|cm|tall|ft|inch/.test(haystack)) return "170";
  if (/(goal|target|desired|dream).*(weight|kg|lb)|(weight|kg|lb).*(goal|target|desired|dream)/.test(haystack)) return "62";
  if (/weight|kg|lb/.test(haystack)) return "70";
  if (/age/.test(haystack)) return "35";
  return "70";
}

module.exports = {
  clean,
  extractMainLines,
  chooseNextAction,
  classifyFunnelStage,
  extractCheckoutSummary,
  extractCheckoutSummaryFromSurface,
  extractDiscountSummary,
  findCheckoutProbeAction,
  isStopPage,
  shouldBlockPaymentUrl,
  inputValueForPage,
};
