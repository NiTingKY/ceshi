const fs = require("node:fs");
const path = require("node:path");

const TEXT_EXTENSIONS = new Set([".md", ".csv", ".json", ".js"]);
const PROJECT_ROOT_PREFIXES = /^(docs|pipeline|exploration|generated|prompts)\//;
const BAD_TEXT_TOKENS = [
  "\uFFFD", "\u9225", "\u9241", "\u9242", "\u93C7", "\u93C8", "\u93B5", "\u5A55",
  "\u7470", "\u7481", "\u6924", "\u705E", "\u935A", "\u8FBE", "\u5A34", "\u5BEE",
  "\u60C2", "\u76F6", "\u951B", "\u7A0B", "\u8930", "\u4E67", "\u4E6A", "\u4E06",
  "\u4E05", "\u5B6D", "\u5BB2", "\u6B5A",
  ["Stripe", " refusal"].join(""),
  ["Payment", " is declined"].join(""),
  ["4000", " 0000", " 0000", " 0002"].join(""),
];
const BAD_TEXT_SIGNAL = new RegExp(BAD_TEXT_TOKENS.map(escapeRegExp).join("|"));

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function walkFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function hasBadTextSignal(text) {
  return BAD_TEXT_SIGNAL.test(String(text || ""));
}

function extractMarkdownRefs(text) {
  const refs = [];
  const pattern = /`([^`\r\n]+\.(?:md|csv|json|js|png|html|txt))`|\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of String(text || "").matchAll(pattern)) {
    refs.push((match[1] || match[2] || "").trim().replace(/^<|>$/g, ""));
  }
  return refs;
}

function shouldIgnoreRef(ref) {
  return (
    !ref ||
    /^(https?:|mailto:|#)/.test(ref) ||
    /[<>*]/.test(ref) ||
    /^node /.test(ref) ||
    /^npm /.test(ref)
  );
}

function resolveProjectRef(ref, sourceFile, rootDir) {
  if (/^[A-Za-z]:[\\/]/.test(ref)) return ref;
  if (PROJECT_ROOT_PREFIXES.test(ref) || ref === "README.md" || ref === "package.json" || ref === ".gitignore") {
    return path.join(rootDir, ref);
  }
  return path.join(path.dirname(sourceFile), ref);
}

function auditProject(rootDir = process.cwd()) {
  const issues = [];
  const files = walkFiles(rootDir);

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (hasBadTextSignal(text)) {
      issues.push({ type: "bad-text", file });
    }

    if (path.extname(file) === ".md") {
      for (const ref of extractMarkdownRefs(text)) {
        if (shouldIgnoreRef(ref)) continue;
        const resolved = resolveProjectRef(ref, file, rootDir);
        if (!fs.existsSync(resolved)) {
          issues.push({ type: "missing-ref", file, ref, resolved });
        }
      }
    }
  }

  return issues;
}

if (require.main === module) {
  const issues = auditProject(process.cwd());
  if (issues.length) {
    console.error(JSON.stringify({ ok: false, issues }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, issues: [] }, null, 2));
}

module.exports = {
  auditProject,
  extractMarkdownRefs,
  hasBadTextSignal,
  resolveProjectRef,
  shouldIgnoreRef,
};
