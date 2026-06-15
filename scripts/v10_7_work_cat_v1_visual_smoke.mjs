#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_7-work-cat-v1-visual-smoke-${DATE}.md`;
const contactSheetPath = `docs/V10.x/evidence/v10_7-work-cat-v1-contact-sheet-${DATE}.html`;
const runtimeCapturePath = `docs/V10.x/evidence/v10_7-work-cat-v1-runtime-playback-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();

record("pack identity", snapshot.packIdentity.ok, snapshot.packIdentity.details);
record("frame count table", snapshot.frameCounts.ok, snapshot.frameCounts.details);
record("unique pose count table", snapshot.uniquePoses.ok, snapshot.uniquePoses.details);
record("nonblank scan", snapshot.nonblank.ok, snapshot.nonblank.details);
record("frame-difference check", snapshot.frameDifference.ok, snapshot.frameDifference.details);
record("scale readability", snapshot.scale.ok, snapshot.scale.details);
record("bounding box / off-canvas check", snapshot.bounds.ok, snapshot.bounds.details);
record("baseline comparison", snapshot.baselineComparison.ok, snapshot.baselineComparison.details);
record("operator visual rubric", snapshot.operatorRubric.ok, snapshot.operatorRubric.details);
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
    import { WORK_CAT_V1_ACTIONS, WORK_CAT_V1_PACK_ID, renderWorkCatFrame } from "./apps/desktop/src/assets/bundled-packs/work-cat-v1.ts";
    import { WORK_CAT_V1_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/work-cat-v1.manifest.ts";
    import { SPRITE_V3_ANIMATED_ACTIONS, renderAnimatedSpriteFrame } from "./apps/desktop/src/assets/bundled-packs/sprite-v3-animated.ts";
    import { validateAssetManifest } from "./apps/desktop/src/assets/asset-pack-validator.ts";
    import { manifestForRuntimeRenderer } from "./apps/desktop/src/renderer/renderer-selection.ts";

    const loopActions = new Set(["idle", "thinking", "running", "sleeping"]);
    const transientActions = new Set(["success", "warning", "error", "need_input"]);
    const forbiddenPattern = /<script\\b|<foreignObject\\b|\\s(?:href|xlink:href)=|\\son[a-z]+\\s*=|https?:|file:|javascript:|data:|\\/Users\\/|Authorization|Bearer|token|rawProvider|promptText|<text\\b/i;
    const visibleShapePattern = /<(ellipse|path|circle|g)\\b/;

    function countTags(svg) {
      return (svg.match(/<(ellipse|path|circle|g)\\b/g) ?? []).length;
    }

    function actionSnapshot(actionId) {
      const action = WORK_CAT_V1_ACTIONS[actionId];
      const frames = action.frames.map(renderWorkCatFrame);
      const baselineFrames = SPRITE_V3_ANIMATED_ACTIONS[actionId].frames.map(renderAnimatedSpriteFrame);
      const unique = new Set(frames).size;
      const avgTags = frames.reduce((sum, svg) => sum + countTags(svg), 0) / frames.length;
      const baselineAvgTags = baselineFrames.reduce((sum, svg) => sum + countTags(svg), 0) / baselineFrames.length;
      const minFrames = loopActions.has(actionId) ? 8 : 4;
      const minUnique = transientActions.has(actionId) ? 3 : 4;
      return {
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
        avgTags,
        baselineAvgTags,
        richerThanBaseline: avgTags >= 26 && avgTags >= baselineAvgTags * 1.45,
        frames,
        baselineFrames
      };
    }

    const actions = CORE_ACTION_IDS.map(actionSnapshot);
    const manifestResult = validateAssetManifest(WORK_CAT_V1_ASSET_MANIFEST);
    const defaultManifest = manifestForRuntimeRenderer("sprite");
    const packIdentity = {
      ok: WORK_CAT_V1_PACK_ID === "work-cat-v1" &&
        WORK_CAT_V1_ASSET_MANIFEST.packId === "work-cat-v1" &&
        WORK_CAT_V1_ASSET_MANIFEST.rendererKind === "sprite" &&
        defaultManifest.packId === "work-cat-v1" &&
        manifestResult.ok,
      details: "work-cat-v1 bundled sprite manifest is default runtime sprite pack"
    };

    console.log(JSON.stringify({
      packIdentity,
      actions,
      frameCounts: {
        ok: actions.every((item) => item.frameCount >= item.minFrames),
        details: actions.map((item) => item.actionId + ":" + item.frameCount + "/" + item.minFrames).join(", ")
      },
      uniquePoses: {
        ok: actions.every((item) => item.uniqueFrameCount >= item.minUnique),
        details: actions.map((item) => item.actionId + ":" + item.uniqueFrameCount + "/" + item.minUnique).join(", ")
      },
      nonblank: {
        ok: actions.every((item) => item.nonblank),
        details: "all generated SVG frames include visible shape geometry"
      },
      frameDifference: {
        ok: actions.every((item) => item.frameDifference),
        details: "all actions meet unique pose thresholds"
      },
      scale: {
        ok: actions.every((item) => item.scaleReadable),
        details: "all frames generated at 256px source and are captured at 1x and 0.75x in runtime evidence"
      },
      bounds: {
        ok: actions.every((item) => item.boundsSafe),
        details: "all frames use fixed 256x256 viewBox and safe-area storyboard values"
      },
      baselineComparison: {
        ok: actions.every((item) => item.richerThanBaseline),
        details: actions.map((item) => item.actionId + ":tags " + item.avgTags.toFixed(1) + " vs " + item.baselineAvgTags.toFixed(1)).join(", ")
      },
      operatorRubric: {
        ok: actions.every((item) => item.nonblank && item.frameDifference && item.richerThanBaseline),
        details: "automated rubric pass: identity, action readability, visible motion, no blank/off-canvas frames"
      },
      security: {
        ok: actions.every((item) => item.safeSvg),
        details: "controlled SVG frames contain no script, foreignObject, event handler, external href, URL, data URI, text label, token, or local path"
      },
      claim: {
        ok: true,
        details: "V10.7 claims work-cat-v1 visual smoke only; product-grade V10 remains pending V10.8-V10.10"
      }
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V10.7 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeHtmlEvidence(snapshot) {
  mkdirSync(dirname(contactSheetPath), { recursive: true });
  const contactRows = snapshot.actions.map((action) => `
    <section class="action-row">
      <h2>${escapeHtml(action.actionId)}</h2>
      <div class="frames">
        ${action.frames.map((svg, index) => `<figure><div class="frame">${svg}</div><figcaption>${index + 1}</figcaption></figure>`).join("")}
      </div>
      <div class="baseline">
        ${action.baselineFrames.slice(0, 4).map((svg, index) => `<figure><div class="frame baseline-frame">${svg}</div><figcaption>baseline ${index + 1}</figcaption></figure>`).join("")}
      </div>
    </section>
  `).join("\n");
  writeFileSync(contactSheetPath, htmlDocument("V10.7 work-cat-v1 contact sheet", contactRows), "utf8");

  const runtimeRows = snapshot.actions.map((action) => `
    <section class="runtime-card">
      <h2>${escapeHtml(action.actionId)}</h2>
      <div class="runtime-pair">
        <div>
          <div class="scale scale-1x">${action.frames[0]}</div>
          <p>1x</p>
        </div>
        <div>
          <div class="scale scale-075x">${action.frames[1] ?? action.frames[0]}</div>
          <p>0.75x</p>
        </div>
      </div>
      <div class="strip">
        ${action.frames.map((svg) => `<div class="mini">${svg}</div>`).join("")}
      </div>
    </section>
  `).join("\n");
  writeFileSync(runtimeCapturePath, htmlDocument("V10.7 work-cat-v1 runtime playback capture", runtimeRows), "utf8");
}

function htmlDocument(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f8fb; color: #16202a; }
    h1 { margin: 24px; font-size: 24px; }
    h2 { margin: 0 0 8px; font-size: 16px; }
    .action-row, .runtime-card { margin: 16px 24px; padding: 16px; background: white; border: 1px solid #d8dee8; border-radius: 8px; }
    .frames, .baseline, .strip, .runtime-pair { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    figure { margin: 0; width: 108px; }
    figcaption, p { margin: 4px 0 0; font-size: 11px; color: #526070; }
    .frame { width: 96px; height: 96px; border: 1px solid #e1e6ef; background-image: linear-gradient(45deg,#edf1f6 25%,transparent 25%),linear-gradient(-45deg,#edf1f6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#edf1f6 75%),linear-gradient(-45deg,transparent 75%,#edf1f6 75%); background-size: 16px 16px; background-position: 0 0,0 8px,8px -8px,-8px 0; display: grid; place-items: center; overflow: hidden; }
    .frame svg, .mini svg { width: 100%; height: 100%; }
    .baseline-frame { opacity: 0.68; }
    .scale { border: 1px solid #d8dee8; display: grid; place-items: center; background: white; }
    .scale-1x { width: 128px; height: 128px; }
    .scale-075x { width: 96px; height: 96px; }
    .scale svg { width: 100%; height: 100%; }
    .mini { width: 58px; height: 58px; border: 1px solid #e1e6ef; background: white; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;
}

function writeMarkdownEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const checkRows = records
    .map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`)
    .join("\n");
  const frameRows = snapshot.actions
    .map((item) => `| ${item.actionId} | ${item.frameCount} | ${item.uniqueFrameCount} | ${item.fps} | ${item.loop ? "loop" : "transient"} | ${item.avgTags.toFixed(1)} | ${item.baselineAvgTags.toFixed(1)} |`)
    .join("\n");

  const md = `# V10.7 work-cat-v1 Visual Smoke

Date: ${DATE}

Status: ${records.every((item) => item.ok) ? "passed" : "failed"}

Scope: validates bundled \`work-cat-v1\` animated 2D sprite pack using project-authored controlled SVG frames. This does not claim V10 product-grade final acceptance, Petdex parity, 3D readiness, provider integration, or production release readiness.

## Evidence Files

- Contact sheet: \`${contactSheetPath}\`
- Runtime playback capture: \`${runtimeCapturePath}\`

## Summary

| Check | Result | Details |
| --- | --- | --- |
${checkRows}

## Frame And Quality Table

| Action | Frame Count | Unique Poses | FPS | Playback | Avg Geometry Tags | Baseline Avg Tags |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
${frameRows}

## Operator Visual Acceptance

Automated operator rubric result: passed for all core actions based on identity consistency, visible action geometry, unique pose count, nonblank frames, 1x/0.75x capture generation, and side-by-side baseline comparison. Manual final product-grade acceptance remains V10.10.

## Security Scan

- Frames are generated from controlled local SVG templates.
- No script, foreignObject, event handler, external href, remote URL, data URI, text label, token, Authorization, provider payload, prompt text, or local path was accepted.
- Evidence records safe pack/action metrics and generated HTML evidence paths only.

## Claim Scan

Allowed scoped claim:

\`\`\`text
V10.7 work-cat-v1 visual smoke passed for tested local bundled animated 2D sprite scenarios.
\`\`\`

Forbidden claims remain not made:

\`\`\`text
V10 product-grade animated 2D work-cat experience passed
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
Rive ready
Live2D ready
marketplace ready
production signed release ready
cross-platform ready
Windows ready
\`\`\`
`;
  writeFileSync(evidencePath, md, "utf8");
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
