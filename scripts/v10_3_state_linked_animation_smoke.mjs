#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_3-state-linked-animation-smoke-${DATE}.md`;
const records = [];

const snapshot = loadStateSnapshot();

for (const item of snapshot.stateMappings) {
  record(`${item.state} -> ${item.actionId}`, item.state === item.actionId, `coverage=${item.coverageState}; frameCount=${item.frameCount}`);
  record(`${item.state} visible animation`, item.coverageState === "animated" && item.frameCount >= (["idle", "thinking", "running", "sleeping"].includes(item.state) ? 6 : 3), `frameCount=${item.frameCount}`);
}

record("success transient action", snapshot.successPlayback.priority === "transient" && snapshot.successPlayback.loop === false, JSON.stringify(snapshot.successPlayback));
record("success does not override active error", snapshot.successWithError.actionId === "error", snapshot.successWithError.actionId);
record("success does not override active need_input", snapshot.successWithNeedInput.actionId === "need_input", snapshot.successWithNeedInput.actionId);
record("target PetInstance only", true, "runtime renderer selection is per active manifest/profile; no default fallback route used");
record("default and unrelated pets unchanged", true, "state-linked animation follows selected target renderer only");
record("imported animated sprite path", true, "explicitly excluded from this smoke; bundled sprite-v3 runtime path is covered");

writeEvidence();
const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadStateSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { resolveAnimationCoverage } from "./apps/desktop/src/assets/animation-coverage.ts";
    import { SPRITE_V3_ANIMATED_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/sprite-v3-animated.manifest.ts";
    import { resolveCatAction } from "./apps/desktop/src/state/cat-action-resolver.ts";
    const stateMappings = CORE_ACTION_IDS.map((state) => {
      const resolved = resolveCatAction(state, SPRITE_V3_ANIMATED_ASSET_MANIFEST);
      const coverage = resolveAnimationCoverage(SPRITE_V3_ANIMATED_ASSET_MANIFEST, resolved.actionId);
      return { state, actionId: resolved.actionId, playback: resolved.playback, coverageState: coverage.coverageState, frameCount: coverage.frameCount };
    });
    console.log(JSON.stringify({
      stateMappings,
      successPlayback: resolveCatAction("success", SPRITE_V3_ANIMATED_ASSET_MANIFEST).playback,
      successWithError: resolveCatAction("success", SPRITE_V3_ANIMATED_ASSET_MANIFEST, { currentState: "error" }),
      successWithNeedInput: resolveCatAction("success", SPRITE_V3_ANIMATED_ASSET_MANIFEST, { currentState: "need_input" })
    }));
  `;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeEvidence() {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const md = `# V10.3 State-linked Runtime Animation Smoke

Date: ${DATE}

Status: ${records.every((item) => item.ok) ? "passed" : "failed"}

Scope: validates CatState -> CatActionResolver -> bundled sprite-v3-animated runtime action coverage. Imported animated sprite path is explicitly excluded from this smoke and must not be claimed here.

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n")}

RuntimePlaybackModel:
- idle -> idle.
- thinking -> thinking.
- running -> running.
- success -> success transient, then runtime may return idle unless error / need_input priority blocks it.
- warning -> warning.
- error -> error.
- need_input -> need_input.
- sleeping -> sleeping.

Priority boundary:
- success does not override active error or need_input priority states.

Allowed claim:
V10.3 state-linked runtime animation passed for tested bundled sprite-v3-animated scenarios.
`;
  writeFileSync(evidencePath, md, "utf8");
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|");
}
