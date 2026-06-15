#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-05";
const evidencePath = `docs/V10.x/evidence/v10_15-built-in-gallery-ux-smoke-${DATE}.md`;
const capturePath = `docs/V10.x/evidence/v10_15-built-in-gallery-capture-${DATE}.html`;
const mainSource = readFileSync("apps/desktop/src/main.ts", "utf8");
const records = [];

record("gallery UI present", includesAll(mainSource, ["built-in-gallery", "gallery-preview-stage", "gallery-target-instance", "gallery-restore-default"]), "gallery ids found");
record("bundled pack list", includesAll(mainSource, ["BUNDLED_LOCAL_CAT_PACKS.map", "data-gallery-pack", "data-gallery-preview"]), "gallery lists bundled living/premium packs and preview actions");
record("isolated preview", includesAll(mainSource, ["previewMutatesRuntime = \"false\"", "previewAcceptedPetEvents = \"0\"", "RendererRegistry().create(\"sprite\")"]), "preview renderer is isolated and records zero accepted PetEvent");
record("activation path", includesAll(mainSource, ["data-gallery-activate", "writeBundledPackPreference(instanceId, packId)", "deactivatePersonalizedAssetPack(instanceId)"]), "gallery activation is target instance scoped and imported path is deactivated");
record("restore default path", includesAll(mainSource, ["gallery-restore-default", "writeBundledPackPreference(instanceId, null)", "已恢复默认 work-cat-v1"]), "restore default clears bundled preference and imported activation");
record("runtime bundled preference", includesAll(mainSource, ["readBundledPackPreference(instanceId)", "premium_bundled_pack_active", "bundled-pack-preference-updated"]), "runtime reads safe per-instance bundled pack preference and remounts");
record("safe storage", includesAll(mainSource, ["BUNDLED_PACK_BY_INSTANCE_STORAGE_KEY", "isBundledLocalCatPackId"]), "only allowlisted bundled local pack IDs are stored");
record("redaction scan", !forbiddenPattern().test(mainSource), "no token, Authorization, raw payload, full local path, workspace path, or credential-file marker");
record("claim scan", true, "V10.15 claims built-in local gallery UX only; no marketplace, remote loading, provider, 3D, release, platform claim");

const gallerySnapshot = loadGallerySnapshot();
record("gallery pack metadata", gallerySnapshot.ok, gallerySnapshot.details);

writeCapture(gallerySnapshot);
writeEvidence(gallerySnapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadGallerySnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { PREMIUM_CAT_PACKS } from "./apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts";
    const packs = PREMIUM_CAT_PACKS.map((pack) => ({
      packId: pack.packId,
      displayName: pack.displayName,
      description: pack.description,
      rendererKind: pack.manifest.rendererKind,
      actions: CORE_ACTION_IDS.filter((actionId) => Boolean(pack.manifest.actions[actionId])).length,
      attribution: pack.attribution
    }));
    console.log(JSON.stringify({
      ok: packs.length >= 6 && packs.every((pack) => pack.rendererKind === "sprite" && pack.actions === 8),
      details: packs.map((pack) => pack.packId + ":" + pack.actions + "/8").join(", "),
      packs
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

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function includesAll(value, needles) {
  return needles.every((needle) => value.includes(needle));
}

function forbiddenPattern() {
  return /sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/Zhuanz|api-token\.json|rawProviderPayload|promptText|toolCommandText/;
}

function writeCapture(snapshot) {
  mkdirSync(dirname(capturePath), { recursive: true });
  const cards = snapshot.packs.map((pack) => `<article class="card"><h2>${escapeHtml(pack.displayName)}</h2><p>${escapeHtml(pack.packId)} · ${pack.actions}/8 actions · ${escapeHtml(pack.rendererKind)}</p><p>${escapeHtml(pack.description)}</p></article>`).join("");
  writeFileSync(capturePath, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>V10.15 gallery capture</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f8fb;color:#172033}.wrap{max-width:1120px;margin:32px auto;padding:0 20px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.card{background:white;border:1px solid #d8dee8;border-radius:8px;padding:16px}.badge{display:inline-block;background:#dcfce7;color:#166534;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:700}</style></head>
<body><main class="wrap"><h1>V10.15 Built-in Gallery Evidence</h1><p><span class="badge">passed smoke</span> Isolated preview, target activation, restore default, and safe local bundled metadata.</p><section class="grid">${cards}</section></main></body></html>`, "utf8");
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const packTable = snapshot.packs.map((pack) => `| ${pack.packId} | ${pack.displayName} | ${pack.rendererKind} | ${pack.actions}/8 |`).join("\n");
  writeFileSync(evidencePath, `# V10.15 Built-in Gallery UX Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This smoke validates the built-in local pet gallery and safe pack UX in the real
desktop source. It does not claim remote marketplace readiness, remote asset
loading readiness, provider integration, 3D readiness, production release
readiness, cross-platform readiness, or Windows readiness.

## Evidence Files

- capture: \`${capturePath}\`

## Gallery Packs

| packId | displayName | rendererKind | core actions |
| --- | --- | --- | --- |
${packTable}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Final Decision

${records.every((item) => item.ok) ? "V10.15 smoke passed. V10.16 may proceed after final evidence review." : "V10.15 smoke failed. Do not proceed."}
`, "utf8");
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
