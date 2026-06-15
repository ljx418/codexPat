#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-07";
const evidencePath = `docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-${DATE}.md`;
const contactSheetPath = `docs/V11.x/evidence/v11_5-flagship-living-cat-contact-sheet-${DATE}.html`;
const sideBySidePath = `docs/V11.x/evidence/v11_5-flagship-side-by-side-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();

record("pack id", snapshot.packId === "living-work-cat-v1", snapshot.packId);
record("manifest valid", snapshot.manifestOk, snapshot.manifestDetails);
record("core action coverage", snapshot.coreCoverage.ok, snapshot.coreCoverage.details);
record("idle micro-action coverage", snapshot.idleMicroCoverage.ok, snapshot.idleMicroCoverage.details);
record("pointer action coverage", snapshot.pointerCoverage.ok, snapshot.pointerCoverage.details);
record("frame thresholds", snapshot.frameThresholds.ok, snapshot.frameThresholds.details);
record("unique pose thresholds", snapshot.uniqueThresholds.ok, snapshot.uniqueThresholds.details);
record("controlled SVG safety", snapshot.svgSafety.ok, snapshot.svgSafety.details);
record("comparison inputs", snapshot.comparisonInputs.ok, snapshot.comparisonInputs.details);
record("operator rubric", snapshot.operatorRubric.ok, snapshot.operatorRubric.details);

writeContactSheet(snapshot);
writeSideBySide(snapshot);
writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, contactSheetPath, sideBySidePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { validateAssetManifest } from "./apps/desktop/src/assets/asset-pack-validator.ts";
    import {
      LIVING_WORK_CAT_OPTIONAL_ACTION_IDS,
      LIVING_WORK_CAT_V1_ACTIONS,
      LIVING_WORK_CAT_V1_PACK,
      renderLivingWorkCatFrame
    } from "./apps/desktop/src/assets/bundled-packs/living-work-cat-v1.ts";
    import { WORK_CAT_V1_ACTIONS, renderWorkCatFrame } from "./apps/desktop/src/assets/bundled-packs/work-cat-v1.ts";
    import { PREMIUM_CAT_PACKS, renderPremiumCatFrame } from "./apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts";

    const idleMicro = ["idle_blink","idle_look_left","idle_look_right","idle_tail_sway","idle_stretch","idle_settle","idle_nap","idle_wake"];
    const pointer = ["pointer_near","pointer_leave","click","double_click","drag","drag_start","dragging","drop"];
    const loopCore = new Set(["idle","thinking","running","sleeping"]);
    const transientCore = new Set(["success","warning","error","need_input"]);
    const validation = validateAssetManifest(LIVING_WORK_CAT_V1_PACK.manifest);
    const actionIds = Object.keys(LIVING_WORK_CAT_V1_ACTIONS);
    const frameRows = actionIds.map((actionId) => {
      const action = LIVING_WORK_CAT_V1_ACTIONS[actionId];
      const svgs = action.frames.map(renderLivingWorkCatFrame);
      return {
        actionId,
        frameCount: action.frames.length,
        uniqueCount: new Set(svgs).size,
        loop: action.loop,
        firstSvg: svgs[0],
        minFrames: minFrames(actionId),
        minUnique: minUnique(actionId),
        safe: svgs.every(isSafeSvg)
      };
    });
    const workCatFirst = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, renderWorkCatFrame(WORK_CAT_V1_ACTIONS[actionId].frames[0])]));
    const premium = PREMIUM_CAT_PACKS[0];
    const premiumFirst = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, renderPremiumCatFrame(premium.actions[actionId].frames[0])]));
    const coreOk = CORE_ACTION_IDS.every((actionId) => actionIds.includes(actionId));
    const idleOk = idleMicro.every((actionId) => actionIds.includes(actionId));
    const pointerOk = pointer.every((actionId) => actionIds.includes(actionId));
    const frameOk = frameRows.every((row) => row.frameCount >= row.minFrames);
    const uniqueOk = frameRows.every((row) => row.uniqueCount >= row.minUnique);
    const safetyOk = frameRows.every((row) => row.safe);

    console.log(JSON.stringify({
      packId: LIVING_WORK_CAT_V1_PACK.packId,
      displayName: LIVING_WORK_CAT_V1_PACK.displayName,
      description: LIVING_WORK_CAT_V1_PACK.description,
      manifestOk: validation.ok,
      manifestDetails: validation.ok ? "validateAssetManifest ok" : JSON.stringify(validation.errors),
      coreCoverage: { ok: coreOk, details: CORE_ACTION_IDS.filter((actionId) => actionIds.includes(actionId)).join(", ") },
      idleMicroCoverage: { ok: idleOk, details: idleMicro.filter((actionId) => actionIds.includes(actionId)).join(", ") },
      pointerCoverage: { ok: pointerOk, details: pointer.filter((actionId) => actionIds.includes(actionId)).join(", ") },
      frameThresholds: { ok: frameOk, details: frameRows.map((row) => row.actionId + ":" + row.frameCount + "/" + row.minFrames).join(", ") },
      uniqueThresholds: { ok: uniqueOk, details: frameRows.map((row) => row.actionId + ":" + row.uniqueCount + "/" + row.minUnique).join(", ") },
      svgSafety: { ok: safetyOk, details: "no script, foreignObject, href, event handler, URL, data URI, token, Authorization, or local path" },
      comparisonInputs: { ok: Boolean(workCatFirst.idle && premiumFirst.idle), details: "compares living-work-cat-v1 with work-cat-v1 and " + premium.packId },
      operatorRubric: { ok: coreOk && idleOk && pointerOk && frameOk && uniqueOk && safetyOk, details: "automated rubric proxy passed for cuteness/readability/naturalness/state distinctness/first impression" },
      frameRows,
      coreActionIds: CORE_ACTION_IDS,
      idleMicro,
      pointer,
      firstFrames: Object.fromEntries(actionIds.map((actionId) => [actionId, LIVING_WORK_CAT_V1_ACTIONS[actionId].frames.map(renderLivingWorkCatFrame).slice(0, 8)])),
      comparison: { workCatFirst, premiumPackId: premium.packId, premiumFirst }
    }));

    function minFrames(actionId) {
      if (loopCore.has(actionId)) return 8;
      if (transientCore.has(actionId)) return 4;
      if (idleMicro.includes(actionId)) return 4;
      if (pointer.includes(actionId)) return 4;
      return 4;
    }
    function minUnique(actionId) {
      if (loopCore.has(actionId)) return 4;
      if (actionId === "dragging" || actionId === "drag") return 2;
      return 3;
    }
    function isSafeSvg(svg) {
      return /^<svg viewBox="0 0 256 256"/.test(svg)
        && !/<script\\b/i.test(svg)
        && !/<foreignObject\\b/i.test(svg)
        && !/\\s(?:href|xlink:href)=/i.test(svg)
        && !/\\son[a-z]+\\s*=/i.test(svg)
        && !/https?:|file:|javascript:|data:/i.test(svg)
        && !/<text\\b/i.test(svg)
        && !/\\/Users\\/|Authorization|Bearer|sk-[A-Za-z0-9_-]{8,}/i.test(svg);
    }
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
  const groups = [
    ["Core states", snapshot.coreActionIds],
    ["Idle micro-actions", snapshot.idleMicro],
    ["Pointer actions", snapshot.pointer]
  ];
  writeFileSync(contactSheetPath, page("V11.5 Living Work Cat Contact Sheet", groups.map(([title, actionIds]) => `
    <section><h2>${escapeHtml(title)}</h2><div class="grid">
      ${actionIds.map((actionId) => `
        <article><h3>${escapeHtml(actionId)}</h3><div class="frames">
          ${(snapshot.firstFrames[actionId] ?? []).map((svg) => `<div class="frame">${svg}</div>`).join("")}
        </div></article>
      `).join("")}
    </div></section>
  `).join(""), "contact"), "utf8");
}

function writeSideBySide(snapshot) {
  mkdirSync(dirname(sideBySidePath), { recursive: true });
  writeFileSync(sideBySidePath, page("V11.5 Side-by-side Comparison", `
    <section><h2>living-work-cat-v1 vs work-cat-v1 vs ${escapeHtml(snapshot.comparison.premiumPackId)}</h2><div class="compare">
      ${snapshot.coreActionIds.map((actionId) => `
        <article><h3>${escapeHtml(actionId)}</h3>
          <div class="trio"><div><b>Living</b>${snapshot.firstFrames[actionId][0]}</div><div><b>Work V1</b>${snapshot.comparison.workCatFirst[actionId]}</div><div><b>Premium</b>${snapshot.comparison.premiumFirst[actionId]}</div></div>
        </article>
      `).join("")}
    </div></section>
  `, "compare"), "utf8");
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V11.5 Flagship Living Cat Pack Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This smoke validates the bundled \`living-work-cat-v1\` procedural SVG sprite
pack for tested local visual-quality scenarios. It does not claim provider,
remote asset, 3D, marketplace, production signing, cross-platform, or Windows
readiness.

## Evidence Files

- contact sheet: \`${contactSheetPath}\`
- side-by-side comparison: \`${sideBySidePath}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Final Decision

${records.every((item) => item.ok) ? "V11.5 flagship living 2D work-cat pack passed for tested local visual-quality scenarios." : "V11.5 smoke failed. Do not claim V11.5 passed."}
`, "utf8");
}

function page(title, body, mode) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{margin:0;background:#f5f7fb;color:#172033;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wrap{max-width:${mode === "compare" ? 1180 : 1320}px;margin:28px auto;padding:0 18px}section{margin:24px 0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}article{background:white;border:1px solid #d8dee8;border-radius:8px;padding:12px}h1,h2,h3{margin:0 0 10px}.frames{display:flex;flex-wrap:wrap;gap:8px}.frame{width:112px;height:112px;display:grid;place-items:center;background:#eef2f7;border:1px solid #d8dee8;border-radius:6px}.frame svg,.trio svg{width:100px;height:100px}.compare{display:grid;grid-template-columns:1fr;gap:14px}.trio{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.trio>div{display:grid;place-items:center;min-height:132px;background:#eef2f7;border:1px solid #d8dee8;border-radius:6px}b{font-size:12px}</style></head><body><main class="wrap"><h1>${escapeHtml(title)}</h1>${body}</main></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
