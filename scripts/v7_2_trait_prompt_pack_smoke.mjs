import { spawnSync } from "node:child_process";

const cases = [];

record("desktop V7.2 unit coverage", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("real approved trait prompt pack", run([
  "pnpm",
  "--filter",
  "desktop",
  "exec",
  "node",
  "--import",
  "tsx",
  "--eval",
  [
    "import { generateLocalTraitPromptPack, localTraitPromptPackHasForbiddenContent } from './src/assets/local-trait-prompt-pack.ts';",
    "const result = generateLocalTraitPromptPack({",
    "catName: 'Orange Tabby',",
    "coat: 'warm orange short hair',",
    "markings: 'white chest and tabby stripes',",
    "eyes: 'amber eyes',",
    "tail: 'curled tail',",
    "personality: 'playful desktop companion',",
    "rendererTarget: 'sprite',",
    "photoReferenceMode: 'local_reference_only'",
    "});",
    "if (result.status !== 'accepted' || result.reasonCode !== 'trait_prompt_pack_ok') process.exit(2);",
    "if ((result.promptPack?.evidenceSummary.actionCount ?? 0) !== 8) process.exit(3);",
    "if (localTraitPromptPackHasForbiddenContent(result)) process.exit(4);",
    "console.log(JSON.stringify({ status: result.status, reasonCode: result.reasonCode, rendererTarget: result.rendererTarget, actionCount: result.promptPack?.evidenceSummary.actionCount, guidanceCount: result.multiViewGuidance.length }, null, 2));"
  ].join("")
]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "security redaction scan",
  result: /(Authorization|api-token\.json|\/Users\/|raw payload|workspace path|config path|provider payload|credential|raw photo|EXIF|GPS|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,})/i.test(combined)
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
    if (parsed.status && parsed.reasonCode) {
      return `status=${parsed.status} reasonCode=${parsed.reasonCode} rendererTarget=${parsed.rendererTarget} actionCount=${parsed.actionCount}`;
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
    .slice(0, 900);
}
