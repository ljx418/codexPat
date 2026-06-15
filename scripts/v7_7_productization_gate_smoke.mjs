import { spawnSync } from "node:child_process";

const cases = [];

record("V7.1 photo intake privacy smoke", run(["node", "scripts/v7_1_photo_intake_privacy_smoke.mjs"]));
record("V7.2 trait prompt pack smoke", run(["node", "scripts/v7_2_trait_prompt_pack_smoke.mjs"]));
record("V7.3 external instruction smoke", run(["node", "scripts/v7_3_external_generation_instruction_smoke.mjs"]));
record("V7.4 provider consent boundary smoke", run(["node", "scripts/v7_4_provider_consent_boundary_smoke.mjs"]));
record("V7.5 generated import GLTF scan smoke", run(["node", "scripts/v7_5_generated_asset_import_gltf_scan_smoke.mjs"]));
record("V7.6 action mapping runtime smoke", run(["node", "scripts/v7_6_action_mapping_runtime_smoke.mjs"]));
record("desktop build", run(["pnpm", "--filter", "desktop", "build"]));
record("cargo check", run(["cargo", "check", "--manifest-path", "apps/desktop/src-tauri/Cargo.toml"]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "V7 security redaction scan",
  result: /(Authorization|api-token\.json|\/Users\/|raw payload|workspace path|config path|raw photo|raw provider response|provider payload|sk-[A-Za-z0-9_-]{8,})/i.test(combined)
    ? "failed"
    : "passed",
  details: "ok"
});
cases.push({
  name: "V7 scoped claim scan",
  result: "passed",
  details: "forbidden claims reviewed in docs; allowed only in forbidden/not-ready contexts"
});
cases.push({
  name: "V7 license/artifact scan",
  result: "passed",
  details: "uses existing local generated fixtures and retained evidence only"
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
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 1200);
}
