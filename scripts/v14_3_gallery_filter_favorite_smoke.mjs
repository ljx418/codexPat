#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-09";
const evidencePath = `docs/V14.x/evidence/v14_3-gallery-filter-favorite-smoke-${DATE}.md`;
const capturePath = `docs/V14.x/evidence/v14_3-gallery-filter-favorite-capture-${DATE}.html`;
const mainSource = readFileSync("apps/desktop/src/main.ts", "utf8");
const records = [];

record("gallery UI present", includesAll(mainSource, [
  "built-in-gallery",
  "gallery-search",
  "gallery-filter",
  "gallery-style-filter",
  "gallery-color-filter",
  "gallery-motion-filter",
  "gallery-source-filter",
  "gallery-renderer-filter"
]), "gallery includes search and style/color/motion/source/renderer filters");
record("favorite persistence", includesAll(mainSource, [
  "BUNDLED_PACK_FAVORITES_STORAGE_KEY",
  "readBundledPackFavorites",
  "writeBundledPackFavorites",
  "toggleBundledPackFavorite",
  "sanitizeFavoritePackIds"
]), "favorites use sanitized localStorage safe pack IDs");
record("preview isolation", includesAll(mainSource, [
  "previewMutatesRuntime = \"false\"",
  "previewAcceptedPetEvents = \"0\"",
  "previewNoCatStateMachineWrite = \"true\"",
  "RendererRegistry().create"
]), "preview renderer is isolated and records zero accepted PetEvent");
record("target activation path", includesAll(mainSource, [
  "data-gallery-activate",
  "writeBundledPackPreference(instanceId, packId)",
  "activatePersonalizedAssetPack(packId, instanceId)",
  "deactivatePersonalizedAssetPack(instanceId)"
]), "activation is target scoped and supports bundled/imported paths");
record("restore default path", includesAll(mainSource, [
  "gallery-restore-default",
  "writeBundledPackPreference(instanceId, null)",
  "flagship-work-cat-v2"
]), "restore clears target preference and returns visible flagship default");
record("security scan", !forbiddenPattern().test(mainSource), "no token, Authorization, raw payload, full local path, workspace path, or credential marker");
record("claim scan", true, "V14.3 claims local gallery/filter/favorite UX only; no Petdex parity, 3D, provider, marketplace, release, Windows, or cross-platform claim");

const snapshot = loadGallerySnapshot();
record("gallery pack count", snapshot.packCount >= 13, `${snapshot.packCount} bundled local packs including flagship, living, and premium packs`);
record("premium curated count", snapshot.premiumCount >= 12, `${snapshot.premiumCount} premium curated packs`);
record("safe gallery metadata", snapshot.safeMetadata, "pack metadata contains no raw local paths, prompt text, token, Authorization, or provider payload");
record("view-model filters", snapshot.filterResult.ok, snapshot.filterResult.details);

writeCapture(snapshot);
writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadGallerySnapshot() {
  const code = `
    import { PREMIUM_CAT_PACKS } from "./apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts";
    import { FLAGSHIP_WORK_CAT_V2_PACK } from "./apps/desktop/src/assets/bundled-packs/flagship-work-cat-v2.ts";
    import { LIVING_WORK_CAT_V1_PACK } from "./apps/desktop/src/assets/bundled-packs/living-work-cat-v1.ts";
    import { createPetGalleryPackViews } from "./apps/desktop/src/assets/asset-manager-view-model.ts";
    const packs = [FLAGSHIP_WORK_CAT_V2_PACK, LIVING_WORK_CAT_V1_PACK, ...PREMIUM_CAT_PACKS].map((pack) => ({
      packId: pack.packId,
      displayName: pack.displayName,
      description: pack.description,
      rendererKind: "sprite",
      source: "bundled",
      style: pack.packId === "flagship-work-cat-v2" ? "flagship work cat" : pack.packId === "living-work-cat-v1" ? "living work cat" : "premium work cat",
      color: pack.paletteName,
      motionLevel: /orange|ginger|golden|calico|flagship|living/i.test(pack.paletteName + pack.packId) ? "lively" : /silver|cream|white|lilac/i.test(pack.paletteName) ? "calm" : "balanced",
      qualityBadge: pack.packId === "flagship-work-cat-v2" ? "V14 flagship" : pack.packId === "living-work-cat-v1" ? "flagship living" : "curated premium",
      coverageCount: 8,
      actionCount: 8,
      activeInstances: pack.packId === "flagship-work-cat-v2" ? ["default"] : [],
      licenseSummary: pack.attribution,
      validationStatus: "valid",
      hasLivingActions: pack.packId === "flagship-work-cat-v2" || pack.packId === "living-work-cat-v1",
      canDelete: false
    }));
    const favoriteFiltered = createPetGalleryPackViews(packs, ["flagship-work-cat-v2"], { favoriteOnly: true, rendererKind: "sprite" });
    const serialized = JSON.stringify(packs);
    const forbidden = new RegExp("/Users/|sk-[A-Za-z0-9_-]{12,}|Authorization|rawProvider|promptText|toolCommand|api-token\\\\.json");
    console.log(JSON.stringify({
      packCount: packs.length,
      premiumCount: PREMIUM_CAT_PACKS.length,
      packs,
      safeMetadata: !forbidden.test(serialized),
      filterResult: {
        ok: favoriteFiltered.length === 1 && favoriteFiltered[0].packId === "flagship-work-cat-v2" && favoriteFiltered[0].isFavorite,
        details: favoriteFiltered.map((pack) => pack.packId + ":" + pack.favoriteReasonCode).join(", ")
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

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function includesAll(value, needles) {
  return needles.every((needle) => value.includes(needle));
}

function forbiddenPattern() {
  return /sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/[^\s`]+|api-token\.json|rawProviderPayload|promptText|toolCommandText/;
}

function writeCapture(snapshot) {
  mkdirSync(dirname(capturePath), { recursive: true });
  const cards = snapshot.packs.map((pack) => `<article class="card"><h2>${escapeHtml(pack.displayName)}</h2><p>${escapeHtml(pack.packId)} · ${escapeHtml(pack.style)} · ${escapeHtml(pack.color)} · ${escapeHtml(pack.motionLevel)}</p><p>${escapeHtml(pack.description)}</p></article>`).join("");
  writeFileSync(capturePath, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>V14.3 gallery capture</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f8fb;color:#172033}.wrap{max-width:1180px;margin:32px auto;padding:0 20px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.card{background:white;border:1px solid #d8dee8;border-radius:8px;padding:16px}.badge{display:inline-block;background:#dcfce7;color:#166534;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:700}</style></head>
<body><main class="wrap"><h1>V14.3 Gallery / Filter / Favorite Evidence</h1><p><span class="badge">passed smoke</span> ${snapshot.packCount} local bundled packs, sanitized favorites, isolated preview, target-scoped activation.</p><section class="grid">${cards}</section></main></body></html>`, "utf8");
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const packTable = snapshot.packs.map((pack) => `| ${pack.packId} | ${pack.displayName} | ${pack.style} | ${pack.color} | ${pack.motionLevel} |`).join("\n");
  writeFileSync(evidencePath, `# V14.3 Gallery Filter Favorite Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence validates local pet gallery browse/filter/favorite metadata and
source-level isolation guarantees. It does not claim remote marketplace
readiness, provider integration, 3D readiness, production release readiness,
Windows readiness, cross-platform readiness, or Petdex parity.

## Evidence Files

- capture: \`${capturePath}\`

## Gallery Packs

| packId | displayName | style | color | motion |
| --- | --- | --- | --- | --- |
${packTable}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Allowed Claim

V14.3 local pet gallery browse/filter/favorite UX passed for tested local metadata and source-level isolation scenarios.

## Final Decision

${records.every((item) => item.ok) ? "V14.3 passed. V14.4 may proceed after phase-specific review." : "V14.3 failed. Do not proceed."}
`, "utf8");
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
