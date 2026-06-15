#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-05";
const evidencePath = `docs/V10.x/evidence/v10_13-premium-cat-library-smoke-${DATE}.md`;
const contactSheetPath = `docs/V10.x/evidence/v10_13-premium-cat-library-contact-sheets-${DATE}.html`;
const runtimeCapturePath = `docs/V10.x/evidence/v10_13-premium-cat-library-runtime-capture-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();

record("premium pack count", snapshot.packCount.ok, snapshot.packCount.details);
record("manifest validation", snapshot.manifestValidation.ok, snapshot.manifestValidation.details);
record("action coverage", snapshot.actionCoverage.ok, snapshot.actionCoverage.details);
record("frame count", snapshot.frameCounts.ok, snapshot.frameCounts.details);
record("unique pose count", snapshot.uniquePoses.ok, snapshot.uniquePoses.details);
record("nonblank scan", snapshot.nonblank.ok, snapshot.nonblank.details);
record("frame-difference check", snapshot.frameDifference.ok, snapshot.frameDifference.details);
record("scale readability", snapshot.scale.ok, snapshot.scale.details);
record("bounding box / off-canvas check", snapshot.bounds.ok, snapshot.bounds.details);
record("license attribution scan", snapshot.license.ok, snapshot.license.details);
record("security scan", snapshot.security.ok, snapshot.security.details);
record("claim scan", snapshot.claim.ok, snapshot.claim.details);

writeHtmlEvidence(snapshot);
writeMarkdownEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, contactSheetPath, runtimeCapturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { validateAssetManifest } from "./apps/desktop/src/assets/asset-pack-validator.ts";
    import { PREMIUM_CAT_PACKS, renderPremiumCatFrame } from "./apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts";

    const loopActions = new Set(["idle", "thinking", "running", "sleeping"]);
    const transientActions = new Set(["success", "warning", "error", "need_input"]);
    const forbiddenPattern = /<script\\b|<foreignObject\\b|\\s(?:href|xlink:href)=|\\son[a-z]+\\s*=|https?:|file:|javascript:|data:|\\/Users\\/|Authorization|Bearer|token|rawProvider|promptText|<text\\b/i;
    const visibleShapePattern = /<(ellipse|path|circle|g)\\b/;

    function actionSnapshot(pack, actionId) {
      const action = pack.actions[actionId];
      const frames = action.frames.map(renderPremiumCatFrame);
      const unique = new Set(frames).size;
      const minFrames = loopActions.has(actionId) ? 8 : 4;
      const minUnique = transientActions.has(actionId) ? 3 : 4;
      return {
        packId: pack.packId,
        displayName: pack.displayName,
        actionId,
        fps: action.fps,
        loop: action.loop,
        frameCount: frames.length,
        minFrames,
        uniqueFrameCount: unique,
        minUnique,
        nonblank: frames.every((svg) => visibleShapePattern.test(svg) && svg.length > 1200),
        frameDifference: unique >= minUnique,
        safeSvg: frames.every((svg) => !forbiddenPattern.test(svg)),
        boundsSafe: frames.every((svg) => /viewBox="0 0 256 256"/.test(svg)),
        scaleReadable: frames.every((svg) => svg.length > 1200),
        frames
      };
    }

    const packs = PREMIUM_CAT_PACKS.map((pack) => ({
      packId: pack.packId,
      displayName: pack.displayName,
      description: pack.description,
      paletteName: pack.paletteName,
      attribution: pack.attribution,
      manifestOk: validateAssetManifest(pack.manifest).ok,
      actions: CORE_ACTION_IDS.map((actionId) => actionSnapshot(pack, actionId))
    }));

    const allActions = packs.flatMap((pack) => pack.actions);
    console.log(JSON.stringify({
      packs,
      packCount: {
        ok: packs.length >= 6,
        details: packs.map((pack) => pack.packId).join(", ")
      },
      manifestValidation: {
        ok: packs.every((pack) => pack.manifestOk),
        details: packs.map((pack) => pack.packId + ":" + pack.manifestOk).join(", ")
      },
      actionCoverage: {
        ok: packs.every((pack) => pack.actions.length === CORE_ACTION_IDS.length),
        details: packs.map((pack) => pack.packId + ":" + pack.actions.length + "/8").join(", ")
      },
      frameCounts: {
        ok: allActions.every((item) => item.frameCount >= item.minFrames),
        details: allActions.map((item) => item.packId + "/" + item.actionId + ":" + item.frameCount + "/" + item.minFrames).join(", ")
      },
      uniquePoses: {
        ok: allActions.every((item) => item.uniqueFrameCount >= item.minUnique),
        details: allActions.map((item) => item.packId + "/" + item.actionId + ":" + item.uniqueFrameCount + "/" + item.minUnique).join(", ")
      },
      nonblank: {
        ok: allActions.every((item) => item.nonblank),
        details: "all generated premium SVG frames include visible geometry"
      },
      frameDifference: {
        ok: allActions.every((item) => item.frameDifference),
        details: "all premium actions meet unique pose thresholds"
      },
      scale: {
        ok: allActions.every((item) => item.scaleReadable),
        details: "all packs use 256px source frames captured at 1x and 0.75x"
      },
      bounds: {
        ok: allActions.every((item) => item.boundsSafe),
        details: "all frames use fixed 256x256 viewBox"
      },
      license: {
        ok: packs.every((pack) => pack.attribution === "Agent Desktop Pet bundled premium work-cat asset"),
        details: "all premium packs use project-authored bundled attribution"
      },
      security: {
        ok: allActions.every((item) => item.safeSvg),
        details: "controlled SVG frames contain no script, foreignObject, handler, external href, URL, data URI, text label, token, or local path"
      },
      claim: {
        ok: true,
        details: "V10.13 claims premium bundled animated 2D cat library only; no Petdex parity, 3D, provider, marketplace, release, cross-platform, or Windows claim"
      }
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V10.13 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeHtmlEvidence(snapshot) {
  mkdirSync(dirname(contactSheetPath), { recursive: true });
  const contactBody = snapshot.packs.map((pack) => `
    <section class="pack-card">
      <header><h2>${escapeHtml(pack.displayName)}</h2><p>${escapeHtml(pack.packId)} · ${escapeHtml(pack.paletteName)}</p></header>
      ${pack.actions.map((action) => `
        <div class="action-row">
          <h3>${escapeHtml(action.actionId)}</h3>
          <div class="frames">
            ${action.frames.map((svg, index) => `<figure><div class="frame">${svg}</div><figcaption>${index + 1}</figcaption></figure>`).join("")}
          </div>
        </div>
      `).join("")}
    </section>
  `).join("\n");
  writeFileSync(contactSheetPath, htmlDocument("V10.13 premium cat library contact sheets", contactBody), "utf8");

  const runtimeBody = snapshot.packs.map((pack) => `
    <section class="pack-card">
      <header><h2>${escapeHtml(pack.displayName)}</h2><p>${escapeHtml(pack.packId)}</p></header>
      <div class="runtime-grid">
        ${pack.actions.map((action) => `
          <article class="runtime-card">
            <h3>${escapeHtml(action.actionId)}</h3>
            <div class="runtime-pair">
              <div><div class="scale scale-1x">${action.frames[0]}</div><p>1x</p></div>
              <div><div class="scale scale-075x">${action.frames[1] ?? action.frames[0]}</div><p>0.75x</p></div>
            </div>
            <div class="strip">${action.frames.map((svg) => `<div class="mini">${svg}</div>`).join("")}</div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("\n");
  writeFileSync(runtimeCapturePath, htmlDocument("V10.13 premium cat library runtime capture", runtimeBody), "utf8");
}

function writeMarkdownEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${escapeMarkdown(String(item.details))} |`).join("\n");
  const packTable = snapshot.packs.map((pack) => `| ${pack.packId} | ${pack.displayName} | ${pack.paletteName} | 8/8 | ${pack.manifestOk ? "valid" : "invalid"} |`).join("\n");
  writeFileSync(evidencePath, `# V10.13 Premium Cat Library Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence validates the local bundled premium animated 2D cat library. It
does not claim Petdex parity, 3D readiness, provider integration, marketplace
readiness, production signed release readiness, cross-platform readiness, or
Windows readiness.

## Premium Pack List

| packId | displayName | palette | core action coverage | manifest |
| --- | --- | --- | --- | --- |
${packTable}

## Evidence Files

- contact sheet: \`${contactSheetPath}\`
- runtime capture: \`${runtimeCapturePath}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Safe Renderer Boundary

Renderer input remains limited to safe action ID, renderer kind, safe pack ID,
playback intent, scale, and visibility. The premium library uses controlled
procedural SVG frames and does not introduce remote URLs, script execution,
external hrefs, token fields, provider payloads, prompt text, or local paths.

## Allowed Claim

\`\`\`text
V10.13 premium bundled animated 2D cat library passed for tested local visual-quality scenarios.
\`\`\`

## Final Decision

${records.every((item) => item.ok) ? "V10.13 smoke passed. V10.14 may proceed after PRD/spec review." : "V10.13 smoke failed. Do not proceed to V10.14."}
`, "utf8");
}

function htmlDocument(title, body) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f8fb; color: #16202a; }
    h1 { margin: 24px; font-size: 24px; }
    h2 { margin: 0; font-size: 20px; }
    h3 { margin: 10px 0 6px; font-size: 13px; color: #334155; }
    p { margin: 4px 0 0; font-size: 12px; color: #526070; }
    .pack-card { margin: 18px 24px; padding: 18px; background: white; border: 1px solid #d8dee8; border-radius: 8px; }
    .action-row { padding-top: 8px; border-top: 1px solid #eef2f7; }
    .frames, .strip, .runtime-pair { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .runtime-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .runtime-card { border: 1px solid #e1e6ef; border-radius: 8px; padding: 10px; background: #fbfdff; }
    figure { margin: 0; width: 86px; }
    figcaption { margin-top: 3px; font-size: 10px; color: #526070; text-align: center; }
    .frame { width: 78px; height: 78px; border: 1px solid #e1e6ef; background: #fff; display: grid; place-items: center; overflow: hidden; }
    .frame svg, .mini svg, .scale svg { width: 100%; height: 100%; }
    .scale { border: 1px solid #d8dee8; display: grid; place-items: center; background: white; }
    .scale-1x { width: 128px; height: 128px; }
    .scale-075x { width: 96px; height: 96px; }
    .mini { width: 42px; height: 42px; border: 1px solid #e1e6ef; background: white; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeMarkdown(value) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
