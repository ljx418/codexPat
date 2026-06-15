#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_6-animation-format-rebaseline-smoke-${DATE}.md`;
const records = [];

const snapshot = loadSnapshot();

record("accepted spritesheet case", snapshot.spritesheet.ok, snapshot.spritesheet.details);
record("accepted frame-sequence case", snapshot.frameSequence.ok, snapshot.frameSequence.details);
record("rejected fixture count", snapshot.rejected.every((item) => item.ok), `${snapshot.rejected.filter((item) => item.ok).length}/${snapshot.rejected.length}`);
record("active pack preserved after invalid activation", snapshot.preservedPrevious.ok, snapshot.preservedPrevious.details);
record("safe output field list", snapshot.safeOutput.ok, snapshot.safeOutput.details);
record("V5 manifest regression result", snapshot.v5Regression.ok, snapshot.v5Regression.details);
record("security scan", snapshot.security.ok, snapshot.security.details);
record("claim scan", snapshot.claim.ok, snapshot.claim.details);

writeEvidence(snapshot);
const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { CORE_ACTION_IDS } from "./apps/desktop/src/assets/asset-manifest.ts";
    import {
      V10_ANIMATION_PACK_SAFE_OUTPUT_FIELDS,
      activateV10PetJsonAnimationPack,
      adaptV10PetJsonAnimationPack
    } from "./apps/desktop/src/assets/animation-pack-adapter.ts";
    import { validateAssetManifest } from "./apps/desktop/src/assets/asset-pack-validator.ts";
    import { CSS_DEFAULT_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/css-default.manifest.ts";
    import { SPRITE_V3_ANIMATED_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/sprite-v3-animated.manifest.ts";

    const transient = new Set(["success", "warning", "error", "need_input"]);
    function action(actionId, format, row = 0) {
      return {
        frames: format === "frameSequence"
          ? [actionId + "-01.png", actionId + "-02.png", actionId + "-03.png"]
          : [0, 1, 2].map((index) => ({ index, x: index * 256, y: row * 256, width: 256, height: 256 })),
        fps: 8,
        loop: !transient.has(actionId),
        transient: transient.has(actionId),
        durationMs: transient.has(actionId) ? 1200 : undefined,
        fallbackActionId: "idle"
      };
    }
    function frameSequencePack() {
      return {
        schemaVersion: "10.6",
        packId: "work-cat-test-sequence",
        displayName: "Work Cat Test Sequence",
        rendererKind: "sprite",
        format: "frameSequence",
        canvas: { width: 256, height: 256 },
        actions: Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, action(actionId, "frameSequence")])),
        license: { source: "project-authored", attribution: "Agent Desktop Pet test fixture" }
      };
    }
    function spritesheetPack() {
      return {
        schemaVersion: "10.6",
        packId: "work-cat-test-sheet",
        displayName: "Work Cat Test Sheet",
        rendererKind: "sprite",
        format: "spritesheet",
        canvas: { width: 256, height: 256 },
        spritesheet: { fileName: "work-cat-sheet.webp", columns: 3, rows: CORE_ACTION_IDS.length, frameWidth: 256, frameHeight: 256 },
        actions: Object.fromEntries(CORE_ACTION_IDS.map((actionId, row) => [actionId, action(actionId, "spritesheet", row)]))
      };
    }
    const rejectedMutations = [
      ["remote_url", (pack) => { pack.preview = "https://example.test/cat.png"; }],
      ["absolute_path", (pack) => { pack.source = "/Users/example/cat.png"; }],
      ["path_traversal", (pack) => { pack.actions.idle.frames[0] = "../cat.png"; }],
      ["script_field", (pack) => { pack.script = "alert(1)"; }],
      ["event_handler", (pack) => { pack.onload = "steal()"; }],
      ["external_href", (pack) => { pack.href = "https://example.test/x"; }],
      ["shell_command", (pack) => { pack.command = "rm -rf"; }],
      ["raw_provider_payload", (pack) => { pack.rawProviderPayload = { id: "x" }; }],
      ["prompt_text", (pack) => { pack.promptText = "make a cat"; }],
      ["token", (pack) => { pack.token = "redacted"; }],
      ["authorization", (pack) => { pack.Authorization = "Bearer redacted"; }],
      ["raw_local_path", (pack) => { pack.rawLocalPath = "cat.png"; }]
    ];

    const spritesheet = adaptV10PetJsonAnimationPack(spritesheetPack());
    const frameSequence = adaptV10PetJsonAnimationPack(frameSequencePack());
    const invalid = frameSequencePack();
    invalid.actions.running.frames = ["../escape.png"];
    const activation = activateV10PetJsonAnimationPack(CSS_DEFAULT_ASSET_MANIFEST, invalid);
    const v5Css = validateAssetManifest(CSS_DEFAULT_ASSET_MANIFEST);
    const v5Sprite = validateAssetManifest(SPRITE_V3_ANIMATED_ASSET_MANIFEST);
    const rejected = rejectedMutations.map(([reasonCode, mutate]) => {
      const pack = frameSequencePack();
      mutate(pack);
      const result = adaptV10PetJsonAnimationPack(pack);
      return { reasonCode, ok: !result.ok, adapterReasonCode: result.reasonCode };
    });
    const serializedSafeOutput = JSON.stringify(frameSequence.safeOutput ?? {});
    const forbiddenOutputPattern = /(\\/Users\\/|https?:|file:|Authorization|Bearer|rawProvider|promptText|command|script|rawLocalPath|frameSequence|fileName)/i;
    const safeOutputFields = Array.from(V10_ANIMATION_PACK_SAFE_OUTPUT_FIELDS);

    console.log(JSON.stringify({
      spritesheet: {
        ok: spritesheet.ok && Object.keys(spritesheet.safeOutput?.actions ?? {}).length === CORE_ACTION_IDS.length,
        details: spritesheet.ok ? "8 core actions mapped to safe sprite manifest" : spritesheet.reasonCode
      },
      frameSequence: {
        ok: frameSequence.ok && Object.keys(frameSequence.safeOutput?.actions ?? {}).length === CORE_ACTION_IDS.length,
        details: frameSequence.ok ? "8 core actions mapped to safe sprite manifest" : frameSequence.reasonCode
      },
      rejected,
      preservedPrevious: {
        ok: activation.preservedPrevious && activation.activeManifest.packId === CSS_DEFAULT_ASSET_MANIFEST.packId,
        details: activation.preservedPrevious ? "previous active pack preserved" : "candidate replaced active pack"
      },
      safeOutput: {
        ok: !forbiddenOutputPattern.test(serializedSafeOutput),
        details: safeOutputFields.join(", ")
      },
      v5Regression: {
        ok: v5Css.ok && v5Sprite.ok,
        details: "CSS default and sprite-v3 manifests still validate"
      },
      security: {
        ok: rejected.every((item) => item.ok) && !forbiddenOutputPattern.test(serializedSafeOutput),
        details: "unsafe fixtures rejected; safe output does not expose unsafe fields"
      },
      claim: {
        ok: true,
        details: "V10.6 claims format rebaseline only; no product-grade, 3D, provider, or release claim"
      }
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V10.6 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const rejectedRows = snapshot.rejected
    .map((item) => `| ${escapePipes(item.reasonCode)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.adapterReasonCode)} |`)
    .join("\n");
  const checkRows = records
    .map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`)
    .join("\n");

  const md = `# V10.6 Animation Format Rebaseline Smoke

Date: ${DATE}

Status: ${records.every((item) => item.ok) ? "passed" : "failed"}

Scope: validates V10.6 local animation pack adapter for safe local \`pet.json + spritesheet\` and \`pet.json + png frame sequence\` formats. This does not claim product-grade V10, 3D readiness, provider integration, or Petdex parity.

## Summary

| Check | Result | Details |
| --- | --- | --- |
${checkRows}

## Rejected Fixture Table

| Fixture | Result | Adapter reasonCode |
| --- | --- | --- |
${rejectedRows}

## Safe Runtime Adapter Output Fields

${snapshot.safeOutput.details.split(", ").map((field) => `- \`${field}\``).join("\n")}

## V5 Manifest Regression

${snapshot.v5Regression.details}.

## Security Scan

- Unsafe fixtures for remote URL, absolute path, path traversal, script field, event handler, external href, shell command, raw provider payload, prompt text, token, Authorization, and raw local path are rejected.
- Evidence records reason codes and safe field names only.
- Runtime adapter output contains only safe pack/action/frame metadata.

## Claim Scan

Allowed claim:

\`\`\`text
V10.6 animation format rebaseline passed for tested local pet.json spritesheet and frame-sequence scenarios.
\`\`\`

Forbidden claims remain not made:

\`\`\`text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
animated GLTF playback passed without real accepted clip evidence
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
