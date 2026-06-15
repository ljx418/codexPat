import { spawnSync } from "node:child_process";

const cases = [];

record("desktop runtime/action unit coverage", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("runtime imported pack baseline", run(["node", "scripts/v5_12_runtime_imported_pack_smoke.mjs"]));
record("nonblank GLTF/canvas baseline", run(["node", "scripts/v5_3_png_nonblank_smoke.mjs", "docs/V5.x/evidence/v5_3-gltf-render-fixture-2026-05-28.png"]));
record("nonblank imported sprite baseline", run(["node", "scripts/v5_3_png_nonblank_smoke.mjs", "docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png"]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "renderer payload safety scan",
  result: /(Authorization|api-token\.json|\/Users\/|raw payload|workspace path|config path|provider payload|prompt text|raw photo|raw Agent payload|raw Codex payload|raw terminal payload|raw MCP payload|raw HTTP payload)/i.test(combined)
    ? "failed"
    : "passed",
  details: "safe fields only: actionId, rendererKind, pack/profile IDs, playback intent, scale, visibility"
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
    details: result.ok ? "ok" : sanitize(result.output),
    output: result.output
  });
}

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/Authorization[^\n]*/gi, "Authorization [redacted]")
    .slice(0, 900);
}
