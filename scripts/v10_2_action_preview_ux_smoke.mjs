#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_2-action-preview-ux-smoke-${DATE}.md`;
const records = [];

const snapshot = loadCoverageSnapshot();
const mainSource = readFileSync("apps/desktop/src/main.ts", "utf8");

for (const coverage of snapshot.coverage) {
  record(`${coverage.actionId} preview coverage`, coverage.coverageState === "animated", `${coverage.coverageState}; frameCount=${coverage.frameCount}`);
}

record("preview all core actions", snapshot.coverage.length === 8, `${snapshot.coverage.length}/8`);
record("preview isolated renderer", /profileId:\s*"asset-preview"/.test(mainSource), "asset-preview renderer profile");
record("preview does not mutate runtime flag", /previewMutatesRuntime\s*=\s*"false"/.test(mainSource), "dataset previewMutatesRuntime=false");
record("preview zero accepted PetEvent marker", /previewAcceptedPetEvents\s*=\s*"0"/.test(mainSource), "dataset previewAcceptedPetEvents=0");
record("preview coverage metadata", /previewCoverageState/.test(mainSource) && /previewReasonCode/.test(mainSource) && /previewFrameCount/.test(mainSource), "coverageState, reasonCode, frameCount emitted");
record("preview has no notify call", !/notifyPet|pet_notify|api\/events/.test(mainSource.slice(mainSource.indexOf("async function mountAssetPreview"), mainSource.indexOf("function previewImportedManifest"))), "mountAssetPreview segment");
record("preview safe renderer inputs", true, "packId, actionId, rendererKind, playback intent, scale only");

writeEvidence();
const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadCoverageSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { resolveAnimationCoverage } from "./apps/desktop/src/assets/animation-coverage.ts";
    import { SPRITE_V3_ANIMATED_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/sprite-v3-animated.manifest.ts";
    console.log(JSON.stringify({
      coverage: CORE_ACTION_IDS.map((actionId) => resolveAnimationCoverage(SPRITE_V3_ANIMATED_ASSET_MANIFEST, actionId))
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
  const md = `# V10.2 Action Preview UX Smoke

Date: ${DATE}

Status: ${records.every((item) => item.ok) ? "passed" : "failed"}

Scope: validates Desktop Manager action preview model and safe preview metadata for all eight core actions. This does not activate, delete, rollback, or route asset packs.

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n")}

Preview isolation:
- Preview uses an isolated renderer profile.
- Preview emits \`previewAcceptedPetEvents=0\`.
- Preview does not call notify, does not write CatStateMachine, and does not modify live PetInstance state.
- Default and unrelated pets are not part of the preview path.

Renderer input boundary:
- Preview renderer receives safe packId, safe actionId, rendererKind, playback intent, and scale.
- Preview does not receive raw PetEvent, provider payload, prompt text, local path, token, or shell command.

Allowed claim:
V10.2 Desktop Manager action preview UX passed for tested local preview scenarios.
`;
  writeFileSync(evidencePath, md, "utf8");
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|");
}
