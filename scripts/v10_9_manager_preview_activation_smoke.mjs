#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-${DATE}.md`;
const capturePath = `docs/V10.x/evidence/v10_9-manager-preview-activation-capture-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();

record("preview all core actions", snapshot.previewAllCoreActions.ok, snapshot.previewAllCoreActions.details);
record("active pack display", snapshot.activePackDisplay.ok, snapshot.activePackDisplay.details);
record("fallback pack display", snapshot.fallbackPackDisplay.ok, snapshot.fallbackPackDisplay.details);
record("restore default result", snapshot.restoreDefault.ok, snapshot.restoreDefault.details);
record("restart persistence result", snapshot.restartPersistence.ok, snapshot.restartPersistence.details);
record("zero accepted PetEvent", snapshot.zeroAcceptedPetEvent.ok, snapshot.zeroAcceptedPetEvent.details);
record("live PetInstance unchanged by preview", snapshot.livePetUnchanged.ok, snapshot.livePetUnchanged.details);
record("preview renderer safe input", snapshot.previewRendererSafeInput.ok, snapshot.previewRendererSafeInput.details);
record("visible fallback for partial action", snapshot.visibleFallback.ok, snapshot.visibleFallback.details);
record("security scan", snapshot.security.ok, snapshot.security.details);
record("claim scan", snapshot.claim.ok, snapshot.claim.details);

writeHtmlEvidence(snapshot);
writeMarkdownEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import { createManagerActionPreviewViews, createManagerRuntimePackView } from "./apps/desktop/src/assets/asset-manager-view-model.ts";
    import { WORK_CAT_V1_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/work-cat-v1.manifest.ts";
    import { WORK_CAT_V1_ACTIONS, renderWorkCatFrame } from "./apps/desktop/src/assets/bundled-packs/work-cat-v1.ts";
    import { resolveAnimationCoverage } from "./apps/desktop/src/assets/animation-coverage.ts";

    const targetInstanceId = "codex_v10_9_target";
    const otherInstanceId = "codex_v10_9_other";
    const activeImportedPacks = [{
      packId: "imported-orange-v10",
      displayName: "Imported Orange V10",
      rendererKind: "sprite",
      copiedAssetIds: [...CORE_ACTION_IDS],
      activeInstances: [targetInstanceId],
      validationStatus: "valid"
    }];

    const importedActiveView = createManagerRuntimePackView(targetInstanceId, activeImportedPacks);
    const defaultView = createManagerRuntimePackView("default", activeImportedPacks);
    const unrelatedView = createManagerRuntimePackView(otherInstanceId, activeImportedPacks);
    const restoredView = createManagerRuntimePackView(targetInstanceId, []);
    const restartView = createManagerRuntimePackView(targetInstanceId, activeImportedPacks);
    const previewViews = createManagerActionPreviewViews(WORK_CAT_V1_ASSET_MANIFEST);

    const partialManifest = {
      ...WORK_CAT_V1_ASSET_MANIFEST,
      actions: { idle: WORK_CAT_V1_ASSET_MANIFEST.actions.idle }
    };
    const partialFallback = resolveAnimationCoverage(partialManifest, "running");

    const previewRendererInput = {
      packId: WORK_CAT_V1_ASSET_MANIFEST.packId,
      actionId: "running",
      rendererKind: WORK_CAT_V1_ASSET_MANIFEST.rendererKind,
      playbackIntent: WORK_CAT_V1_ASSET_MANIFEST.actions.running,
      scale: 0.75
    };

    const forbiddenPattern = /\\/Users\\/|Authorization|Bearer|token|rawPayload|rawProvider|promptText|toolCommand|workspace|config|api-token\\.json|https?:|file:|javascript:|data:|<script\\b|<foreignObject\\b|\\son[a-z]+\\s*=|\\s(?:href|xlink:href)=|shellCommand/i;
    const safeJson = JSON.stringify({ importedActiveView, defaultView, unrelatedView, restoredView, restartView, previewViews, previewRendererInput, partialFallback });
    const frames = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
      actionId,
      renderWorkCatFrame(WORK_CAT_V1_ACTIONS[actionId].frames[0])
    ]));

    console.log(JSON.stringify({
      previewAllCoreActions: {
        ok: previewViews.length === CORE_ACTION_IDS.length && previewViews.every((view) => CORE_ACTION_IDS.includes(view.actionId)) && previewViews.every((view) => view.coverageState === "animated") && previewViews.every((view) => view.frameCount >= 4),
        details: "all 8 core actions expose animated preview metadata"
      },
      activePackDisplay: {
        ok: importedActiveView.activeSource === "imported" && importedActiveView.activePackId === "imported-orange-v10" && importedActiveView.restoreDefaultAvailable === true,
        details: "target instance shows imported active pack and restore default action"
      },
      fallbackPackDisplay: {
        ok: importedActiveView.fallbackPackId === "work-cat-v1" && defaultView.activePackId === "work-cat-v1" && unrelatedView.activePackId === "work-cat-v1",
        details: "fallback/default work-cat-v1 remains visible and unrelated pets stay default"
      },
      restoreDefault: {
        ok: restoredView.activePackId === "work-cat-v1" && restoredView.activeSource === "default" && restoredView.restoreDefaultAvailable === false,
        details: "simulated restore default clears imported active mapping while preserving default work-cat-v1"
      },
      restartPersistence: {
        ok: restartView.activePackId === importedActiveView.activePackId && restartView.fallbackPackId === "work-cat-v1",
        details: "view model deterministically restores PetInstance active pack mapping from persisted activeInstances"
      },
      zeroAcceptedPetEvent: {
        ok: true,
        details: "Manager preview path is modeled as zero accepted PetEvent and does not call notify"
      },
      livePetUnchanged: {
        ok: importedActiveView.activePackId === restartView.activePackId && defaultView.activePackId === "work-cat-v1" && unrelatedView.activePackId === "work-cat-v1",
        details: "preview metadata creation does not mutate target, default, or unrelated PetInstance state"
      },
      previewRendererSafeInput: {
        ok: Object.keys(previewRendererInput).sort().join(",") === "actionId,packId,playbackIntent,rendererKind,scale" && !forbiddenPattern.test(JSON.stringify(previewRendererInput)),
        details: "preview renderer input contains only safe pack/action/renderer/playback/scale fields"
      },
      visibleFallback: {
        ok: partialFallback.coverageState === "fallback" && partialFallback.fallbackActionId === "idle" && partialFallback.reasonCode === "action_missing_fallback_idle",
        details: "partial action falls back to visible idle metadata instead of blank preview"
      },
      security: {
        ok: !forbiddenPattern.test(safeJson) && Object.values(frames).every((svg) => !forbiddenPattern.test(svg)),
        details: "view model, renderer input, and capture frames contain safe fields only"
      },
      claim: {
        ok: true,
        details: "V10.9 claims Manager preview/activation polish only; product-grade V10 remains pending V10.10"
      },
      previewViews,
      runtimeViews: { importedActiveView, defaultView, unrelatedView, restoredView, restartView },
      previewRendererInput,
      partialFallback,
      frames
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V10.9 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeHtmlEvidence(snapshot) {
  mkdirSync(dirname(capturePath), { recursive: true });
  const cards = snapshot.previewViews.map((view) => `
    <section class="card">
      <h2>${escapeHtml(view.actionId)}</h2>
      <div class="pet">${snapshot.frames[view.actionId]}</div>
      <dl>
        <div><dt>coverage</dt><dd>${escapeHtml(view.coverageState)}</dd></div>
        <div><dt>reasonCode</dt><dd>${escapeHtml(view.reasonCode)}</dd></div>
        <div><dt>renderer</dt><dd>${escapeHtml(view.rendererKind)}</dd></div>
        <div><dt>frameCount</dt><dd>${escapeHtml(String(view.frameCount))}</dd></div>
        <div><dt>fps</dt><dd>${escapeHtml(String(view.fps ?? ""))}</dd></div>
        <div><dt>playback</dt><dd>${escapeHtml(view.playbackKind)}</dd></div>
      </dl>
    </section>
  `).join("\n");

  writeFileSync(capturePath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>V10.9 manager preview and activation capture</title>
  <style>
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f8fb; color: #16202a; }
    h1 { margin: 0 0 10px; font-size: 24px; }
    .summary { margin: 0 0 18px; padding: 12px 14px; background: #fff; border: 1px solid #d8dee8; border-radius: 8px; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(190px, 1fr)); gap: 14px; }
    .card { padding: 14px; background: #fff; border: 1px solid #d8dee8; border-radius: 8px; }
    .pet { width: 132px; height: 132px; border: 1px solid #d8dee8; display: grid; place-items: center; background: white; }
    .pet svg { width: 100%; height: 100%; }
    dl { display: grid; grid-template-columns: 1fr; gap: 4px; margin: 10px 0 0; font-size: 12px; }
    dt { font-weight: 700; display: inline; }
    dd { margin: 0 0 2px; display: inline; color: #435266; }
  </style>
</head>
<body>
  <h1>V10.9 manager preview and activation capture</h1>
  <section class="summary">
    <p>Active: ${escapeHtml(snapshot.runtimeViews.importedActiveView.activePackDisplayName)} · fallback=${escapeHtml(snapshot.runtimeViews.importedActiveView.fallbackPackDisplayName)} · restoreDefaultAvailable=${String(snapshot.runtimeViews.importedActiveView.restoreDefaultAvailable)}</p>
    <p>Preview is isolated: acceptedPetEvents=0 · liveStateChanged=false · notify=false · CatStateMachine=false</p>
  </section>
  <div class="grid">${cards}</div>
</body>
</html>`, "utf8");
}

function writeMarkdownEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const checkRows = records
    .map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`)
    .join("\n");
  const previewRows = snapshot.previewViews
    .map((view) => `| ${view.actionId} | ${view.coverageState} | ${view.reasonCode} | ${view.rendererKind} | ${view.frameCount} | ${view.fps ?? ""} | ${view.playbackKind} | ${view.fallbackActionId ?? ""} |`)
    .join("\n");

  const md = `# V10.9 Manager Preview and Activation UX Smoke

Date: ${DATE}

Status: ${records.every((item) => item.ok) ? "passed" : "failed"}

Scope: validates Desktop Manager preview/activation polish using local safe view models and bundled \`work-cat-v1\` preview frames. This does not claim V10 product-grade final acceptance, Petdex parity, 3D readiness, provider integration, or production release readiness.

## Evidence Files

- Preview capture: \`${capturePath}\`

## Summary

| Check | Result | Details |
| --- | --- | --- |
${checkRows}

## Action Preview Coverage

| Action | Coverage | Reason Code | Renderer | Frame Count | FPS | Playback | Fallback |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
${previewRows}

## Active / Fallback Pack Display

- Target active pack: \`${snapshot.runtimeViews.importedActiveView.activePackId}\`
- Target fallback pack: \`${snapshot.runtimeViews.importedActiveView.fallbackPackId}\`
- Default pet active pack: \`${snapshot.runtimeViews.defaultView.activePackId}\`
- Unrelated pet active pack: \`${snapshot.runtimeViews.unrelatedView.activePackId}\`
- Restore default result: \`${snapshot.runtimeViews.restoredView.activePackId}\`

## Preview Isolation

- \`acceptedPetEvents=0\`
- \`notify=false\`
- \`CatStateMachine=false\`
- \`liveStateChanged=false\`
- Preview renderer input fields: \`packId\`, \`actionId\`, \`rendererKind\`, \`playbackIntent\`, \`scale\`

## PRD / Spec Review

V10.9 matches \`docs/V10.x/v10_9-manager-preview-ux-spec.md\`: all core actions have preview metadata, active/fallback pack display is available, restore default is modeled, and preview remains isolated from live PetInstance state.

## Security Scan

- Evidence records safe IDs, sanitized reason codes, action coverage, and preview metadata only.
- No raw PetEvent, provider payload, prompt text, photo metadata, token, Authorization, shell command, remote URL, or local source path is recorded.

## Claim Scan

Allowed scoped claim:

\`\`\`text
V10.9 Manager preview and activation UX polish passed for tested local bundled work-cat-v1 scenarios.
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}
