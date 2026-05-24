const fs = require("node:fs");

const WINDOWS_EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

function defaultBrowserExecutablePath(candidate = WINDOWS_EDGE_PATH) {
  return fs.existsSync(candidate) ? candidate : "";
}

function browserLaunchOptions(options = {}) {
  const browserExecutable = options.browserExecutable ?? process.env.BETTERME_BROWSER_EXECUTABLE;
  const defaultExecutablePath = Object.prototype.hasOwnProperty.call(options, "defaultExecutablePath")
    ? options.defaultExecutablePath
    : defaultBrowserExecutablePath();
  const executablePath = browserExecutable || defaultExecutablePath;
  const launchOptions = { headless: true };

  if (executablePath) launchOptions.executablePath = executablePath;
  return launchOptions;
}

module.exports = {
  browserLaunchOptions,
  defaultBrowserExecutablePath,
};
