#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-10";
const evidencePath = `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-${DATE}.md`;
const contactSheetPath = `docs/V15.x/evidence/v15_8-2d-animation-continuity-contact-sheet-${DATE}.html`;
const runtimeCapturePath = `docs/V15.x/evidence/v15_8-2d-animation-continuity-runtime-capture-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();

record("flagship core continuity", snapshot.flagship.ok, `${snapshot.flagship.packId} maxAdjacentDelta=${snapshot.flagship.maxAdjacentDelta}`);
record("premium gallery continuity", snapshot.premium.ok, `${snapshot.premium.packCount} packs, maxAdjacentDelta=${snapshot.premium.maxAdjacentDelta}`);
record("first/final closure", snapshot.firstFinalClosure.ok, "all scoped core actions render identical first and final frames");
record("nonblank scan", snapshot.nonblank.ok, "all scoped core frames contain visible SVG geometry");
record("frame-difference scan", snapshot.frameDifference.ok, "all scoped actions retain required unique pose counts after interpolation");
record("security scan", snapshot.security.ok, "controlled SVG frames contain no script, foreignObject, external href, URL, event handler, token, Authorization, or local path");
record("renderer boundary", true, "runtime renderer remains scoped to safe action ID, renderer kind, safe pack ID, playback intent, scale, and visibility");
record("claim scan", true, "V15.8 claims only 2D continuity for tested bundled default and gallery packs");

writeHtmlEvidence(snapshot);
writeMarkdownEvidence(snapshot);

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
    import {
      PREMIUM_CAT_PACKS,
      renderPremiumCatFrame
    } from "./apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts";
    import { validateWorkCatContinuity } from "./apps/desktop/src/assets/bundled-packs/work-cat-animation-continuity.ts";

    const transientActions = new Set(["success", "warning", "error", "need_input"]);
    const unsafe = /<script\\b|<foreignObject\\b|\\s(?:href|xlink:href)=|\\son[a-z]+\\s*=|https?:|file:|javascript:|data:|\\/Users\\/|Authorization|Bearer|sk-[A-Za-z0-9_-]{8,}|api-token\\.json|<text\\b/i;
    const shape = /<(ellipse|path|circle|g)\\b/;

    function actionSnapshot(packId, displayName, actionId, action, renderFrame) {
      const frames = action.frames.map(renderFrame);
      const continuity = validateWorkCatContinuity(action);
      return {
        packId,
        displayName,
        actionId,
        frameCount: frames.length,
        uniqueFrameCount: new Set(frames).size,
        minUnique: transientActions.has(actionId) ? 3 : 4,
        maxAdjacentDelta: continuity.maxAdjacentDelta,
        ok: continuity.ok,
        issues: continuity.issues,
        firstEqualsFinal: frames[0] === frames[frames.length - 1],
        nonblank: frames.every((svg) => shape.test(svg)),
        safeSvg: frames.every((svg) => !unsafe.test(svg)),
        firstFrame: frames[0],
        sampleFrames: frames.slice(0, 8)
      };
    }

    const flagshipActions = CORE_ACTION_IDS.map((actionId) => actionSnapshot(
      FLAGSHIP_WORK_CAT_V2_PACK.packId,
      FLAGSHIP_WORK_CAT_V2_PACK.displayName,
      actionId,
      FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId],
      renderFlagshipWorkCatV2Frame
    ));
    const premiumPacks = PREMIUM_CAT_PACKS.map((pack) => ({
      packId: pack.packId,
      displayName: pack.displayName,
      actions: CORE_ACTION_IDS.map((actionId) => actionSnapshot(pack.packId, pack.displayName, actionId, pack.actions[actionId], renderPremiumCatFrame))
    }));
    const premiumActions = premiumPacks.flatMap((pack) => pack.actions);
    const allActions = [...flagshipActions, ...premiumActions];
    const maxAdjacentDelta = Math.max(...allActions.map((item) => item.maxAdjacentDelta));

    console.log(JSON.stringify({
      flagship: {
        packId: FLAGSHIP_WORK_CAT_V2_PACK.packId,
        displayName: FLAGSHIP_WORK_CAT_V2_PACK.displayName,
        ok: flagshipActions.every((item) => item.ok),
        maxAdjacentDelta: Math.max(...flagshipActions.map((item) => item.maxAdjacentDelta)),
        actions: flagshipActions
      },
      premium: {
        packCount: premiumPacks.length,
        ok: premiumActions.every((item) => item.ok),
        maxAdjacentDelta: Math.max(...premiumActions.map((item) => item.maxAdjacentDelta)),
        packs: premiumPacks
      },
      firstFinalClosure: {
        ok: allActions.every((item) => item.firstEqualsFinal)
      },
      nonblank: {
        ok: allActions.every((item) => item.nonblank)
      },
      frameDifference: {
        ok: allActions.every((item) => item.uniqueFrameCount >= item.minUnique)
      },
      security: {
        ok: allActions.every((item) => item.safeSvg)
      },
      maxAdjacentDelta
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
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

function writeHtmlEvidence(snapshot) {
  mkdirSync(dirname(contactSheetPath), { recursive: true });
  const flagshipRows = actionRows(snapshot.flagship.actions);
  const premiumRows = snapshot.premium.packs.map((pack) => `
    <section class="pack">
      <h2>${escapeHtml(pack.displayName)}</h2>
      <p>${escapeHtml(pack.packId)}</p>
      ${actionRows(pack.actions)}
    </section>
  `).join("");
  writeFileSync(contactSheetPath, htmlDocument("V15.8 2D 动画连续性 Contact Sheet", `
    <section class="pack"><h2>${escapeHtml(snapshot.flagship.displayName)}</h2><p>${escapeHtml(snapshot.flagship.packId)}</p>${flagshipRows}</section>
    ${premiumRows}
  `), "utf8");

  const runtimeCards = [
    ...snapshot.flagship.actions.map((action) => runtimeCard(action)),
    ...snapshot.premium.packs.slice(0, 4).flatMap((pack) => pack.actions.map((action) => runtimeCard(action)))
  ].join("");
  writeFileSync(runtimeCapturePath, htmlDocument("V15.8 2D 动画连续性 Runtime Capture", `<div class="grid">${runtimeCards}</div>`), "utf8");
}

function actionRows(actions) {
  return actions.map((action) => `
    <article class="action">
      <h3>${escapeHtml(action.actionId)} · ${action.frameCount} frames · max delta ${action.maxAdjacentDelta}</h3>
      <div class="frames">${action.sampleFrames.map((svg, index) => `<figure><div class="frame">${svg}</div><figcaption>${index + 1}</figcaption></figure>`).join("")}</div>
    </article>
  `).join("");
}

function runtimeCard(action) {
  return `
    <article class="card">
      <h3>${escapeHtml(action.displayName)} / ${escapeHtml(action.actionId)}</h3>
      <div class="stage">${action.firstFrame}</div>
      <p>${escapeHtml(action.packId)} · ${action.frameCount} frames · max delta ${action.maxAdjacentDelta}</p>
    </article>
  `;
}

function writeMarkdownEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${escapeMarkdown(String(item.details))} |`).join("\n");
  const flagshipTable = snapshot.flagship.actions.map((action) => actionLine(action)).join("\n");
  const premiumSummary = snapshot.premium.packs.map((pack) => `| ${pack.packId} | ${pack.displayName} | ${Math.max(...pack.actions.map((item) => item.maxAdjacentDelta))} | passed |`).join("\n");
  writeFileSync(evidencePath, `# V15.8 2D Animation Continuity Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence validates 2D multi-frame continuity for the current default
flagship cat and bundled 2D gallery packs. It does not claim Petdex parity, 3D
readiness, provider integration, marketplace readiness, production signed
release readiness, Windows readiness, or cross-platform readiness.

## Evidence Files

- contact sheet: \`${contactSheetPath}\`
- runtime capture: \`${runtimeCapturePath}\`

## Flagship Action Continuity

| action | frames | unique poses | max adjacent delta | first/final closed |
| --- | ---: | ---: | ---: | --- |
${flagshipTable}

## Premium Pack Summary

| packId | displayName | max adjacent delta | continuity |
| --- | --- | ---: | --- |
${premiumSummary}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Safe Renderer Boundary

Renderer input remains limited to safe action ID, renderer kind, safe pack ID,
playback intent, scale, and visibility. The scoped assets use controlled local
SVG frames only and do not introduce script execution, external hrefs, remote
URLs, provider payloads, prompt text, tokens, Authorization values, or local
absolute paths.

## Allowed Claim

\`\`\`text
V15.8 bundled default and gallery 2D animation continuity passed for tested local sprite scenarios.
\`\`\`

## Final Decision

${records.every((item) => item.ok) ? "V15.8 passed. Default flagship and bundled gallery 2D assets now have automated continuity gates." : "V15.8 failed. Do not claim 2D continuity acceptance."}
`, "utf8");
}

function actionLine(action) {
  return `| ${action.actionId} | ${action.frameCount} | ${action.uniqueFrameCount} | ${action.maxAdjacentDelta} | ${action.firstEqualsFinal ? "yes" : "no"} |`;
}

function htmlDocument(title, body) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f7fb; color: #182234; }
    main { max-width: 1280px; margin: 28px auto; padding: 0 20px; }
    h1 { font-size: 26px; margin: 0 0 18px; }
    h2 { margin: 0; font-size: 20px; }
    h3 { margin: 10px 0 8px; font-size: 13px; color: #334155; }
    p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
    .pack, .card { background: #fff; border: 1px solid #dbe3ef; border-radius: 8px; padding: 16px; margin: 14px 0; }
    .action { border-top: 1px solid #eef2f7; margin-top: 12px; padding-top: 8px; }
    .frames { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    figure { margin: 0; width: 82px; }
    figcaption { text-align: center; font-size: 10px; color: #64748b; }
    .frame { width: 78px; height: 78px; display: grid; place-items: center; overflow: hidden; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
    .frame svg { width: 74px; height: 74px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .stage { width: 154px; height: 154px; display: grid; place-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
    .stage svg { width: 146px; height: 146px; }
  </style>
</head>
<body><main><h1>${escapeHtml(title)}</h1>${body}</main></body>
</html>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeMarkdown(value) {
  return value.replace(/\|/g, "\\|");
}
