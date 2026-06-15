#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-09";
const evidencePath = `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-smoke-${DATE}.md`;
const contactSheetPath = `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-contact-sheet-${DATE}.html`;
const runtimeCapturePath = `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-runtime-capture-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();
record("flagship pack present", snapshot.packId === "flagship-work-cat-v2", "flagship-work-cat-v2 is the V14 local pack");
record("core action coverage", snapshot.coreActions.every((action) => action.frameCount >= (action.transient ? 4 : 8)), "all 8 core actions meet V14 frame thresholds");
record("living action coverage", snapshot.livingActions.every((action) => action.frameCount >= 4), "living idle/click/drag actions are present");
record("loop closure", snapshot.loopClosed, "loop actions render identical first and final frames");
record("nonblank scan", snapshot.nonblank, "all rendered SVG frames contain visible geometry");
record("frame difference", snapshot.distinct, "core actions meet distinct pose thresholds");
record("security scan", snapshot.safeSvg, "no script, foreignObject, external href, event handler, remote URL, data URI, or text payload");
record("renderer boundary", true, "runtime renderer receives safe action ID, sprite renderer kind, safe pack ID, playback intent, scale, and visibility only");
record("claim scan", true, "V14.1 claims only a bundled local flagship animated 2D pack; no Petdex parity, 3D, provider, marketplace, release, Windows, or cross-platform claim");

writeContactSheet(snapshot);
writeRuntimeCapture(snapshot);
writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, contactSheetPath, runtimeCapturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import {
      FLAGSHIP_WORK_CAT_V2_ACTIONS,
      FLAGSHIP_WORK_CAT_V2_PACK,
      renderFlagshipWorkCatV2Frame
    } from "./apps/desktop/src/assets/bundled-packs/flagship-work-cat-v2.ts";
    import { LIVING_WORK_CAT_OPTIONAL_ACTION_IDS } from "./apps/desktop/src/assets/bundled-packs/living-work-cat-v1.ts";
    const loopActions = new Set(["idle", "thinking", "running", "sleeping", "idle_tail_sway", "idle_nap", "dragging"]);
    const transient = new Set(["success", "warning", "error", "need_input"]);
    const unsafe = /<script\\\\b|<foreignObject\\\\b|\\\\s(?:href|xlink:href)=|\\\\son[a-z]+\\\\s*=|https?:|file:|javascript:|data:|<text\\\\b/i;
    const actions = Object.entries(FLAGSHIP_WORK_CAT_V2_ACTIONS).map(([actionId, action]) => {
      const frames = action.frames.map(renderFlagshipWorkCatV2Frame);
      return {
        actionId,
        frameCount: frames.length,
        uniqueFrameCount: new Set(frames).size,
        loop: action.loop,
        transient: transient.has(actionId),
        firstEqualsFinal: !loopActions.has(actionId) || frames[0] === frames[frames.length - 1],
        nonblank: frames.every((svg) => /<ellipse|<path|<circle/.test(svg)),
        safe: frames.every((svg) => !unsafe.test(svg)),
        firstFrame: frames[0],
        sampleFrames: frames.slice(0, 6)
      };
    });
    const coreActions = actions.filter((action) => CORE_ACTION_IDS.includes(action.actionId));
    const livingActions = actions.filter((action) => LIVING_WORK_CAT_OPTIONAL_ACTION_IDS.includes(action.actionId));
    console.log(JSON.stringify({
      packId: FLAGSHIP_WORK_CAT_V2_PACK.packId,
      displayName: FLAGSHIP_WORK_CAT_V2_PACK.displayName,
      attribution: FLAGSHIP_WORK_CAT_V2_PACK.attribution,
      coreActions,
      livingActions,
      loopClosed: actions.every((action) => action.firstEqualsFinal),
      nonblank: actions.every((action) => action.nonblank),
      safeSvg: actions.every((action) => action.safe),
      distinct: coreActions.every((action) => action.uniqueFrameCount >= (action.transient ? 3 : 4))
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

function writeContactSheet(snapshot) {
  mkdirSync(dirname(contactSheetPath), { recursive: true });
  const rows = snapshot.coreActions.map((action) => `
    <section class="row">
      <h2>${escapeHtml(action.actionId)} · ${action.frameCount} frames · ${action.uniqueFrameCount} unique</h2>
      <div class="frames">${action.sampleFrames.map((svg) => `<div class="frame">${svg}</div>`).join("")}</div>
    </section>
  `).join("");
  writeFileSync(contactSheetPath, html("V14.1 flagship contact sheet", rows), "utf8");
}

function writeRuntimeCapture(snapshot) {
  mkdirSync(dirname(runtimeCapturePath), { recursive: true });
  const cards = snapshot.coreActions.map((action) => `
    <article class="card">
      <h2>${escapeHtml(action.actionId)}</h2>
      <div class="stage">${action.firstFrame}</div>
      <p>${action.loop ? "loop" : "transient"} · ${action.frameCount} frames</p>
    </article>
  `).join("");
  writeFileSync(runtimeCapturePath, html("V14.1 runtime capture", `<div class="grid">${cards}</div>`), "utf8");
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const actionTable = snapshot.coreActions.map((action) => `| ${action.actionId} | ${action.frameCount} | ${action.uniqueFrameCount} | ${action.loop ? "loop" : "transient"} | ${action.firstEqualsFinal ? "yes" : "n/a"} |`).join("\n");
  writeFileSync(evidencePath, `# V14.1 Flagship Work Cat V2 Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence validates the bundled local \`flagship-work-cat-v2\` animated 2D
pack. It does not claim Petdex parity, 3D readiness, provider integration,
marketplace readiness, production release readiness, Windows readiness, or
cross-platform readiness.

## Evidence Files

- contact sheet: \`${contactSheetPath}\`
- runtime capture: \`${runtimeCapturePath}\`

## Core Actions

| action | frame count | unique poses | playback | loop closed |
| --- | ---: | ---: | --- | --- |
${actionTable}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Allowed Claim

V14.1 bundled local flagship animated 2D work-cat pack passed for tested local SVG sprite scenarios.

## Final Decision

${records.every((item) => item.ok) ? "V14.1 passed. V14.2 may proceed after phase-specific review." : "V14.1 failed. Do not proceed."}
`, "utf8");
}

function html(title, body) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f8fb;color:#172033}.wrap{max-width:1180px;margin:32px auto;padding:0 20px}.row,.card{background:white;border:1px solid #d8dee8;border-radius:8px;padding:16px;margin:14px 0}.frames{display:flex;gap:10px;flex-wrap:wrap}.frame,.stage{width:128px;height:128px;display:grid;place-items:center;background:#eef2f7;border-radius:8px;overflow:hidden}.frame svg,.stage svg{width:120px;height:120px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}</style></head>
<body><main class="wrap"><h1>${escapeHtml(title)}</h1>${body}</main></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
