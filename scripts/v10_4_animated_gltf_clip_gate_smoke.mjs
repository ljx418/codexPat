#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_4-animated-gltf-clip-gate-smoke-${DATE}.md`;
const records = [];
const snapshot = loadClipSnapshot();

record("full accepted clips detected", snapshot.full.coverageState === "animated" && snapshot.full.missingClips.length === 0, JSON.stringify(safeSummary(snapshot.full)));
record("unknown clips ignored", snapshot.partial.ignoredClipCount === 1 && snapshot.partial.acceptedClips.length === 2, JSON.stringify(safeSummary(snapshot.partial)));
record("partial clips require fallback", snapshot.partial.coverageState === "fallback" && snapshot.partial.reasonCode === "gltf_clip_missing", JSON.stringify(safeSummary(snapshot.partial)));
record("static GLB/GLTF is not animated", snapshot.staticGltf.coverageState === "static" && snapshot.staticGltf.reasonCode === "gltf_static_or_partial", JSON.stringify(safeSummary(snapshot.staticGltf)));
record("safe coverage output", !JSON.stringify(snapshot).match(/raw|\/Users\/|Authorization|token|prompt|provider|workspace|config/i), "safe clip names and counts only");

writeEvidence();
const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, animatedGltfClaim: "excluded", failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadClipSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { classifyGltfClipCoverage } from "./apps/desktop/src/assets/animation-coverage.ts";
    console.log(JSON.stringify({
      full: classifyGltfClipCoverage(CORE_ACTION_IDS),
      partial: classifyGltfClipCoverage(["idle", "thinking", "walk-cycle"]),
      staticGltf: classifyGltfClipCoverage([])
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

function safeSummary(value) {
  return {
    coverageState: value.coverageState,
    reasonCode: value.reasonCode,
    acceptedClipCount: value.acceptedClips.length,
    ignoredClipCount: value.ignoredClipCount,
    missingClipCount: value.missingClips.length
  };
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeEvidence() {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const md = `# V10.4 Animated GLTF Clip Gate Smoke

Date: ${DATE}

Status: excluded-for-animated-gltf-claim

Scope: validates static clip coverage detection and safe labeling only. No real animated GLB/GLTF fixture was used, so animated GLTF playback is excluded rather than passed.

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n")}

Clip gate:
- Accepted clip names are limited to idle, thinking, running, success, warning, error, need_input, sleeping.
- Unknown clip names are ignored for claim purposes.
- Static GLB/GLTF is labeled static / partial and must not be labeled animated.
- Missing clips require visible fallback and cannot hide the cat.

Security boundary:
- Coverage output records safe counts and labels only.
- It does not include raw GLTF JSON chunk, source path, provider payload, prompt text, token, or Authorization header.

Allowed claim:
V10.4 animated GLTF clip gate detection and static/partial labeling completed.

Forbidden claim:
V10.4 animated GLTF playback passed is not made because no real animated GLTF runtime fixture was accepted.
`;
  writeFileSync(evidencePath, md, "utf8");
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|");
}
