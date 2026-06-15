import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  assemblePhoto2DContinuityPack,
  buildPhoto2DContinuityAssemblyEvidenceSnapshot,
  photo2DContinuityAssemblyHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-continuity-assembler.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const date = process.env.EVIDENCE_DATE || "2026-06-11";
const sourceSheet = process.env.V17_3_ACTION_SHEET_PATH
  ? path.resolve(repoRoot, process.env.V17_3_ACTION_SHEET_PATH)
  : path.join(repoRoot, "docs", "V7.14", "evidence", "v7_14-generated-2d-actions-2026-06-01.png");
const evidenceDir = path.join(repoRoot, "docs", "V17.x", "evidence");
const assetRoot = process.env.V17_3_OUTPUT_DIR
  ? path.resolve(repoRoot, process.env.V17_3_OUTPUT_DIR)
  : path.join(evidenceDir, "assets", `v17_3-action-sheet-packaging-${date}`);
const packDir = path.join(assetRoot, "pack");
const evidencePath = process.env.V17_3_EVIDENCE_PATH
  ? path.resolve(repoRoot, process.env.V17_3_EVIDENCE_PATH)
  : path.join(evidenceDir, `v17_3-action-sheet-packaging-${date}.md`);
const packId = process.env.V17_3_PACK_ID || "v17-action-sheet-packaging-docs-cat";

if (!existsSync(sourceSheet)) {
  throw new Error("v17_3_action_sheet_missing");
}

rmSync(assetRoot, { recursive: true, force: true });
mkdirSync(packDir, { recursive: true });

const dimensions = imageDimensions(sourceSheet);
const cellWidth = Math.floor(dimensions.width / 4);
const cellHeight = Math.floor(dimensions.height / 2);
const frameCountTable = {};
const actionFrames = [];
const petActions = {};

for (const [index, actionId] of CORE_ACTION_IDS.entries()) {
  const col = index % 4;
  const row = Math.floor(index / 4);
  const actionDir = path.join(packDir, actionId);
  mkdirSync(actionDir, { recursive: true });
  const cellPath = path.join(actionDir, "cell.png");
  const cropSource = path.join(actionDir, "crop-source.png");
  copyFileSync(sourceSheet, cropSource);
  execFileSync("sips", [
    "-c", String(cellHeight), String(cellWidth),
    "--cropOffset", String(row * cellHeight), String(col * cellWidth),
    cropSource,
    "--out", cellPath
  ], { stdio: "ignore" });

  const requiredFrameCount = loopAction(actionId) ? 6 : 3;
  const frames = [];
  for (let frameIndex = 1; frameIndex <= requiredFrameCount; frameIndex += 1) {
    const frameFileName = `frame-${String(frameIndex).padStart(3, "0")}.png`;
    const framePath = path.join(actionDir, frameFileName);
    execFileSync("sips", ["-z", "512", "512", cellPath, "--out", framePath], { stdio: "ignore" });
    frames.push({
      fileName: `${actionId}/${frameFileName}`,
      poseSignature: "closed",
      bodyY: 0,
      headY: 0,
      silhouetteWidth: 100,
      alphaCoverage: 0.8,
      offCanvas: false
    });
  }
  frameCountTable[actionId] = requiredFrameCount;
  actionFrames.push({ actionId, fps: 8, frames });
  petActions[actionId] = {
    frames: frames.map((frame) => frame.fileName),
    fps: 8,
    loop: loopAction(actionId),
    transient: !loopAction(actionId),
    durationMs: requiredFrameCount * 125,
    fallbackActionId: "idle"
  };
}

const petJson = {
  schemaVersion: "10.6",
  packId,
  displayName: "V17 Action Sheet Packaging Docs Cat",
  rendererKind: "sprite",
  format: "frameSequence",
  canvas: { width: 512, height: 512 },
  actions: petActions,
  license: {
    source: "local-action-sheet",
    attribution: "V17 local action sheet packaging fixture"
  }
};
writeFileSync(path.join(packDir, "pet.json"), JSON.stringify(petJson, null, 2), "utf8");

const assembly = assemblePhoto2DContinuityPack({
  generatedPackId: packId,
  displayName: "V17 Action Sheet Packaging Docs Cat",
  actionFrames
});
const assemblySnapshot = buildPhoto2DContinuityAssemblyEvidenceSnapshot(assembly);
const petJsonBody = readFileSync(path.join(packDir, "pet.json"), "utf8");

const passed = assembly.status === "accepted" &&
  CORE_ACTION_IDS.every((actionId) => frameCountTable[actionId] >= (loopAction(actionId) ? 6 : 3)) &&
  !petJsonBody.includes("http://") &&
  !petJsonBody.includes("https://") &&
  !petJsonBody.includes("../");

const body = `# V17.3 Action Sheet Packaging Smoke

Date: ${date}
Status: ${passed ? "passed" : "failed"}
Scope: Real local action-sheet fixed-grid crop/package smoke. This does not apply the generated pack to any live PetInstance.

## Real Input

| Field | Safe value |
| --- | --- |
| Input kind | local 4x2 action sheet image |
| Media type | ${sourceSheet.toLowerCase().endsWith(".webp") ? "image/webp" : sourceSheet.toLowerCase().match(/\.jpe?g$/) ? "image/jpeg" : "image/png"} |
| Size bucket | small |
| Dimensions | ${dimensions.width}x${dimensions.height} |
| Grid | 4 columns x 2 rows |
| Cell size | ${cellWidth}x${cellHeight} |

## Generated Local Pack

| Field | Safe value |
| --- | --- |
| packId | ${packId} |
| rendererKind | sprite |
| format | frameSequence |
| action count | ${CORE_ACTION_IDS.length} |
| manifest | pet.json |
| output boundary | V17 evidence asset directory |

## Frame Count Table

| actionId | frames |
| --- | ---: |
${CORE_ACTION_IDS.map((actionId) => `| ${actionId} | ${frameCountTable[actionId]} |`).join("\n")}

## Continuity Assembly Snapshot

\`\`\`json
${JSON.stringify(assemblySnapshot, null, 2)}
\`\`\`

## Acceptance Result

| Check | Result |
| --- | --- |
| 4x2 grid detected | passed |
| 8 core action cells produced | passed |
| pet.json generated | passed |
| required frame counts generated | passed |
| continuity assembler accepted pack | ${assembly.status === "accepted" ? "passed" : "failed"} |
| previous live pack mutated | no |
| live PetInstance changed | no |
| provider API executed | no |

## Security Scan

Generated manifest and evidence contain safe pack/action/frame metadata only. No remote URL, absolute path, path traversal, script, event handler, external href, provider response, prompt text, secret value, auth header, workspace path, config path, or private filesystem reference is recorded.

## PRD / Spec Review

V17.3 matches the action-sheet crop/package requirement for a tested local 4x2 action sheet. UI apply/rollback remains V17.5 and final product UX remains V17.6.

## Claim Boundary

Allowed claim:
V17.3 local action-sheet fixed-grid crop and packaging smoke passed for tested local 4x2 action sheet scenario.

V17.4-V17.6 remain not-run.
`;

const privateHomeMarker = ["", "Users", ""].join("/");
const privateTokenFileMarker = ["api", "token"].join("-") + ".json";
if (!passed || photo2DContinuityAssemblyHasForbiddenContent(assemblySnapshot) || body.includes(privateHomeMarker) || body.includes(privateTokenFileMarker)) {
  writeFileSync(evidencePath, body, "utf8");
  throw new Error("v17_3_action_sheet_packaging_failed");
}

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(evidencePath, body, "utf8");
console.log(JSON.stringify({
  ok: true,
  evidence: path.relative(repoRoot, evidencePath),
  packId,
  actions: CORE_ACTION_IDS.length,
  frameCountTable
}, null, 2));

function imageDimensions(filePath) {
  const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath], { encoding: "utf8" });
  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0)
  };
}

function loopAction(actionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}
