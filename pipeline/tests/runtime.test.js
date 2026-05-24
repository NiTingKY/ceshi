const test = require("node:test");
const assert = require("node:assert/strict");

const {
  browserLaunchOptions,
  defaultBrowserExecutablePath,
} = require("../runtime");

test("browserLaunchOptions uses explicit browser executable when provided", () => {
  const options = browserLaunchOptions({ browserExecutable: "C:\\Browsers\\edge.exe" });

  assert.deepEqual(options, {
    headless: true,
    executablePath: "C:\\Browsers\\edge.exe",
  });
});

test("browserLaunchOptions omits executablePath when no executable is available", () => {
  const options = browserLaunchOptions({
    browserExecutable: "",
    defaultExecutablePath: "",
  });

  assert.deepEqual(options, { headless: true });
});

test("defaultBrowserExecutablePath returns an empty string for a missing path", () => {
  assert.equal(defaultBrowserExecutablePath("Z:\\not-real\\browser.exe"), "");
});
