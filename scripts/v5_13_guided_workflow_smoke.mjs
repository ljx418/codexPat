import { spawnSync } from "node:child_process";

const cases = [];

record("desktop guided workflow tests", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("petctl real-data prompt pack baseline", run([
  "node",
  "packages/petctl/dist/cli.js",
  "asset",
  "prompt-pack",
  "--name",
  "Orange Tabby",
  "--description",
  "orange tabby amber eyes white chest curled tail playful jumping and yarn-ball actions",
  "--renderer",
  "sprite",
  "--json"
]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "security redaction scan",
  result: /(Authorization|api-token\.json|\/Users\/|raw payload|workspace path|config path|raw photo|EXIF|GPS|provider payload|sk-[A-Za-z0-9_-]{8,})/i.test(combined)
    ? "failed"
    : "passed",
  details: "ok"
});

const failed = cases.filter((item) => item.result === "failed");
console.log(JSON.stringify({
  status: failed.length ? "failed" : "passed",
  cases: cases.map(({ output, ...item }) => item)
}, null, 2));
if (failed.length) {
  process.exit(1);
}

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`
  };
}

function record(name, result) {
  cases.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.ok ? summarize(result.output) : sanitize(result.output),
    output: result.output
  });
}

function summarize(value) {
  try {
    const parsed = JSON.parse(String(value).trim().split("\n").at(-1) || "{}");
    if (parsed.assetPromptPack) {
      const actionCount = Object.keys(parsed.assetPromptPack.prompts || {}).filter((key) => key !== "texture" && key !== "manifest").length;
      return `actionCount=${actionCount} rendererTarget=${parsed.assetPromptPack.rendererTarget}`;
    }
    if (typeof parsed === "object" && parsed && "actionCount" in parsed) {
      return `actionCount=${parsed.actionCount} rendererTarget=${parsed.rendererTarget} checklistCount=${parsed.checklistCount}`;
    }
  } catch {
    // fall through
  }
  return "ok";
}

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/Authorization[^\n]*/gi, "Authorization [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 600);
}
