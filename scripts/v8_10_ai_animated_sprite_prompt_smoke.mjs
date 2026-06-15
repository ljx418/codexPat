import { spawnSync } from "node:child_process";

const cases = [];

record("desktop V8.10 unit coverage", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("real animated sprite prompt workflow", run([
  "pnpm",
  "--filter",
  "desktop",
  "exec",
  "node",
  "--import",
  "tsx",
  "--eval",
  [
    "import { generateAnimatedSpritePromptWorkflow, animatedSpritePromptWorkflowHasForbiddenContent } from './src/assets/animated-sprite-prompt-workflow.ts';",
    "const result = generateAnimatedSpritePromptWorkflow({",
    "catName: 'Orange Tabby',",
    "approvedTraits: 'warm orange fur, amber eyes, white chest, curled tail, playful companion',",
    "frameCount: 6,",
    "fps: 12",
    "});",
    "if (result.status !== 'accepted' || result.reasonCode !== 'animated_sprite_prompt_workflow_ok') process.exit(2);",
    "if (result.evidenceSummary.actionCount !== 8) process.exit(3);",
    "if (!result.evidenceSummary.promptOnly || result.evidenceSummary.providerExecution) process.exit(4);",
    "if (Object.keys(result.actionStoryboards).length !== 8) process.exit(5);",
    "if (animatedSpritePromptWorkflowHasForbiddenContent(result)) process.exit(6);",
    "const manifest = JSON.parse(result.manifestTemplate);",
    "if (manifest.rendererKind !== 'sprite' || manifest.assets.idle.frameFiles.length !== 6) process.exit(7);",
    "console.log(JSON.stringify({ status: result.status, reasonCode: result.reasonCode, actionCount: result.evidenceSummary.actionCount, frameCount: result.frameCount, fps: result.fps, providerExecution: result.evidenceSummary.providerExecution }, null, 2));"
  ].join("")
]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "security redaction scan",
  result: /(Authorization|api-token\.json|\/Users\/|raw payload|workspace path|config path|provider credential|raw provider response|raw photo|EXIF|GPS|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,})/i.test(combined)
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
      return `status=${parsed.status} reasonCode=${parsed.reasonCode} actionCount=${parsed.actionCount} frameCount=${parsed.frameCount} fps=${parsed.fps} providerExecution=${parsed.providerExecution}`;
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
