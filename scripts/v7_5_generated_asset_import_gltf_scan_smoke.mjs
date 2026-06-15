import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const cases = [];

record("generated sprite fixture coverage", checkFixture("fixtures/manual/visual-assets/imported-static-orange-tabby-v1/manifest.json", "sprite"));
record("generated GLTF fixture coverage", checkFixture("fixtures/manual/visual-assets/imported-gltf-prototype-cat-v1/manifest.json", "gltf"));
record("tauri asset import and GLTF deep scan tests", run(["cargo", "test", "--manifest-path", "apps/desktop/src-tauri/Cargo.toml", "asset_import"]));
record("desktop unit tests", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("V5.12 runtime imported pack baseline", run(["node", "scripts/v5_12_runtime_imported_pack_smoke.mjs"]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "security redaction scan",
  result: /(Authorization|api-token\.json|\/Users\/|raw payload|workspace path|config path|raw GLTF|raw JSON chunk|raw Agent payload|raw Codex payload|raw terminal payload|raw MCP payload|raw HTTP payload)/i.test(combined)
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

function checkFixture(path, rendererKind) {
  if (!existsSync(path)) {
    return { ok: false, output: `${path} missing` };
  }
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  const coreActions = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
  const actionsOk = coreActions.every((action) => manifest.actions?.[action]?.assetId && manifest.assets?.[manifest.actions[action].assetId]);
  const filesOk = Object.values(manifest.assets || {}).every((asset) => existsSync(path.replace(/manifest\.json$/, asset.fileName)));
  return {
    ok: manifest.rendererKind === rendererKind && actionsOk && filesOk,
    output: JSON.stringify({ rendererKind: manifest.rendererKind, actionsOk, filesOk })
  };
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
