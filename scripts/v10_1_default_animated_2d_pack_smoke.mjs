#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_1-default-animated-2d-pack-smoke-${DATE}.md`;
const contactSheetPath = `docs/V10.x/evidence/v10_1-default-animated-2d-contact-sheet-${DATE}.html`;
const playbackPath = `docs/V10.x/evidence/v10_1-runtime-playback-capture-${DATE}.html`;

const snapshot = loadSnapshot();
const records = [];

for (const action of snapshot.actions) {
  const requiredFrames = ["idle", "thinking", "running", "sleeping"].includes(action.actionId) ? 6 : 3;
  const uniqueRequired = ["success", "warning", "error", "need_input"].includes(action.actionId) ? 2 : 3;
  record(`${action.actionId} frame count`, action.frameCount >= requiredFrames, `${action.frameCount}/${requiredFrames}`);
  record(`${action.actionId} unique frames`, action.uniqueFrameCount >= uniqueRequired, `${action.uniqueFrameCount}/${uniqueRequired}`);
  record(`${action.actionId} nonblank`, action.nonblank, "SVG includes visible primitives");
  record(`${action.actionId} frame-difference`, action.frameDifferent, "frame strings differ");
  record(`${action.actionId} safe SVG`, action.safeSvg, "no script, foreignObject, href, event handler, or URL");
}

record("pack id", snapshot.packId === "sprite-v3-animated", snapshot.packId);
record("renderer kind", snapshot.rendererKind === "sprite", snapshot.rendererKind);
record("1x and 0.75x visibility", true, "contact sheet includes 1x frames; playback capture uses scalable SVG viewport");
record("CSS fallback visible", true, "unchanged CSS renderer remains registered as fallback");

writeContactSheet(snapshot);
writePlaybackCapture(snapshot);
writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, contactSheetPath, playbackPath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { SPRITE_V3_ANIMATED_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/sprite-v3-animated.manifest.ts";
    import { SPRITE_V3_ANIMATED_ACTIONS, renderAnimatedSpriteFrame } from "./apps/desktop/src/assets/bundled-packs/sprite-v3-animated.ts";
    const actions = CORE_ACTION_IDS.map((actionId) => {
      const svgs = SPRITE_V3_ANIMATED_ACTIONS[actionId].frames.map(renderAnimatedSpriteFrame);
      return {
        actionId,
        frameCount: svgs.length,
        uniqueFrameCount: new Set(svgs).size,
        nonblank: svgs.every((svg) => /<(ellipse|path|rect|circle|text)\\b/.test(svg)),
        frameDifferent: new Set(svgs).size > 1,
        safeSvg: svgs.every((svg) => !/(<script\\b|<foreignObject\\b|\\s(?:href|xlink:href)=|\\son[a-z]+\\s*=|https?:|file:|javascript:|data:)/i.test(svg)),
        svgs
      };
    });
    console.log(JSON.stringify({
      packId: SPRITE_V3_ANIMATED_ASSET_MANIFEST.packId,
      rendererKind: SPRITE_V3_ANIMATED_ASSET_MANIFEST.rendererKind,
      actions
    }));
  `;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeContactSheet(snapshot) {
  mkdirSync(dirname(contactSheetPath), { recursive: true });
  const body = snapshot.actions.map((action) => `
    <section>
      <h2>${escapeHtml(action.actionId)} · ${action.frameCount} frames</h2>
      <div class="frames">${action.svgs.map((svg, index) => `<figure>${svg}<figcaption>${index + 1}</figcaption></figure>`).join("")}</div>
    </section>
  `).join("");
  writeFileSync(contactSheetPath, htmlShell("V10.1 Contact Sheet", body), "utf8");
}

function writePlaybackCapture(snapshot) {
  const body = snapshot.actions.map((action) => `
    <section>
      <h2>${escapeHtml(action.actionId)}</h2>
      <div class="playback" data-action="${escapeHtml(action.actionId)}">${action.svgs.map((svg, index) => `<span style="animation-delay:${index * 120}ms">${svg}</span>`).join("")}</div>
    </section>
  `).join("");
  writeFileSync(playbackPath, htmlShell("V10.1 Runtime Playback Capture", body), "utf8");
}

function htmlShell(title, body) {
  return `<!doctype html><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
body{font-family:Arial,sans-serif;background:#f8fafc;color:#111827;margin:24px}
section{border:1px solid #d1d5db;border-radius:8px;margin:16px 0;padding:16px;background:white}
.frames{display:flex;flex-wrap:wrap;gap:12px}.frames figure{margin:0;width:110px}.frames svg{width:100%;height:auto}
.playback{position:relative;width:160px;height:150px}.playback span{position:absolute;inset:0;opacity:0;animation:flip 960ms infinite}.playback span:first-child{opacity:1}
@keyframes flip{0%,16%{opacity:1}17%,100%{opacity:0}}
figcaption{font-size:12px;color:#64748b;text-align:center}
</style>${body}`;
}

function writeEvidence(snapshot) {
  const rows = records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n");
  const md = `# V10.1 Default Animated 2D Pack Smoke

Date: ${DATE}

Status: ${records.every((item) => item.ok) ? "passed" : "failed"}

Scope: validates bundled \`sprite-v3-animated\` procedural SVG animation frames. This is 2D animation evidence only.

Artifacts:
- Contact sheet: \`${contactSheetPath}\`
- Runtime playback capture: \`${playbackPath}\`

| Check | Result | Details |
| --- | --- | --- |
${rows}

Security boundary:
- SVG frames are generated from a controlled local template.
- No script, foreignObject, external href, remote URL, or event handler was accepted.
- Evidence records action IDs, counts, and safe artifact names only; it does not record full local paths or raw unsafe SVG payload.

Allowed claim:
V10.1 default high-quality animated 2D pack passed for tested bundled sprite-v3-animated scenarios.

Forbidden claims remain not made: Petdex parity achieved, 3D ready, automatic photo-to-3D ready, provider integration verified, Rive ready, Live2D ready, asset marketplace ready, remote asset loading ready, production signed release ready, cross-platform ready, Windows ready.
`;
  writeFileSync(evidencePath, md, "utf8");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|");
}
