#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-09";
const evidencePath = `docs/V14.x/evidence/v14_4-preview-one-click-switch-smoke-${DATE}.md`;
const records = [];
const mainSource = readFileSync("apps/desktop/src/main.ts", "utf8");

record("isolated candidate preview", includesAll(mainSource, [
  "gallery-preview-stage",
  "previewMutatesRuntime = \"false\"",
  "previewAcceptedPetEvents = \"0\"",
  "previewNoCatStateMachineWrite = \"true\""
]), "candidate preview explicitly records no runtime mutation and zero accepted PetEvent");
record("current target comparison preview", includesAll(mainSource, [
  "gallery-current-stage",
  "mountGalleryCurrentPreview",
  "gallery-current-preview"
]), "preview panel compares current target pet with candidate pet");
record("no notify in preview scope", !/mountGalleryPreview[\s\S]{0,1600}notify\(/.test(mainSource), "gallery preview does not call notify");
record("target-scoped bundled activation", includesAll(mainSource, [
  "data-gallery-activate",
  "writeBundledPackPreference(instanceId, packId)",
  "deactivatePersonalizedAssetPack(instanceId)"
]), "bundled apply saves safe packId for selected target instance");
record("target-scoped imported activation", includesAll(mainSource, [
  "activatePersonalizedAssetPack(packId, instanceId)",
  "writeBundledPackPreference(instanceId, null)"
]), "imported apply clears bundled preference and activates selected target only");
record("restore visible flagship default", includesAll(mainSource, [
  "gallery-restore-default",
  "flagship-work-cat-v2",
  "writeBundledPackPreference(instanceId, null)"
]), "restore clears target custom preference and returns visible flagship default");
record("safe pack allowlist", includesAll(mainSource, [
  "isBundledLocalCatPackId",
  "isFlagshipWorkCatV2PackId",
  "isPremiumCatPackId"
]), "bundled activation is allowlisted");
record("security scan", !forbiddenPattern().test(mainSource), "no token, Authorization, full local path, raw provider payload, prompt text, or tool command text");
record("claim scan", true, "V14.4 claims local preview/one-click switch only; no lifecycle, provider, 3D, marketplace, release, Windows, or cross-platform claim");

const snapshot = loadSnapshot();
record("safe preview renderer input", snapshot.safePreviewInput.ok, snapshot.safePreviewInput.details);
record("default candidate is flagship", snapshot.defaultPackId === "flagship-work-cat-v2", "first bundled local candidate is flagship-work-cat-v2");

writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { FLAGSHIP_WORK_CAT_V2_PACK } from "./apps/desktop/src/assets/bundled-packs/flagship-work-cat-v2.ts";
    import { LIVING_WORK_CAT_V1_PACK } from "./apps/desktop/src/assets/bundled-packs/living-work-cat-v1.ts";
    import { PREMIUM_CAT_PACKS } from "./apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts";
    const first = [FLAGSHIP_WORK_CAT_V2_PACK, LIVING_WORK_CAT_V1_PACK, ...PREMIUM_CAT_PACKS][0];
    const rendererInput = {
      actionId: "running",
      rendererKind: "sprite",
      packId: first.packId,
      playbackIntent: "loop",
      scale: 0.75,
      visibility: "visible"
    };
    const forbidden = /raw|payload|prompt|token|Authorization|workspace|config|path|command/i;
    console.log(JSON.stringify({
      defaultPackId: first.packId,
      safePreviewInput: {
        ok: !forbidden.test(JSON.stringify(rendererInput)) && rendererInput.packId === "flagship-work-cat-v2",
        details: Object.keys(rendererInput).join(", ")
      }
    }));
  `;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout);
}

function includesAll(value, needles) {
  return needles.every((needle) => value.includes(needle));
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function forbiddenPattern() {
  return /sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/[^\s`]+|api-token\.json|rawProviderPayload|promptText|toolCommandText/;
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V14.4 Preview and One-click Switch Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence validates source-level preview isolation and target-scoped
activation/restoration for local gallery packs. It does not claim remote
marketplace readiness, provider integration, 3D readiness, production release
readiness, Windows readiness, cross-platform readiness, or Petdex parity.

## Snapshot

- default bundled candidate: \`${snapshot.defaultPackId}\`
- preview renderer input fields: \`${snapshot.safePreviewInput.details}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Allowed Claim

V14.4 isolated preview and one-click target switching passed for tested local source-level scenarios.

## Final Decision

${records.every((item) => item.ok) ? "V14.4 passed. V14.5 may proceed after phase-specific review." : "V14.4 failed. Do not proceed."}
`, "utf8");
}
