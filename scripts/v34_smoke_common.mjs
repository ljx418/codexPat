import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "../apps/desktop/src/assets/v33-identity-contract.ts";
import { createV33SampleIntakeRecord } from "../apps/desktop/src/assets/v33-sample-intake.ts";
import { createV34CharacterAssetContract } from "../apps/desktop/src/assets/v34-character-asset-contract.ts";
import {
  buildV34GenerationProductEvidenceSnapshot,
  buildV34GenerationQaEvidenceSnapshot,
  runV34GenerationProductE2E,
  runV34GenerationQualityGate
} from "../apps/desktop/src/assets/v34-generation-quality-gate.ts";
import { createV34PosePartMapRecord } from "../apps/desktop/src/assets/v34-pose-part-map.ts";
import {
  buildV34RigFrameSynthesisEvidenceSnapshot,
  createV34GeneratedActionPack,
  createV34RigFrameSeed,
  V34_TARGET_ACTION_IDS,
  v34RigFrameSynthesisHasForbiddenContent
} from "../apps/desktop/src/assets/v34-rig-frame-synthesis.ts";
import { createV34SegmentationMaskRecord } from "../apps/desktop/src/assets/v34-segmentation-mask.ts";
import { createV34SubjectDetectionRecord } from "../apps/desktop/src/assets/v34-subject-detection.ts";

const __filename = fileURLToPath(import.meta.url);
export const repoRoot = path.resolve(path.dirname(__filename), "..");
export const date = "2026-06-25";
export const evidenceDir = path.join(repoRoot, "docs", "V34.x", "evidence");
export const derivativeDir = path.join(evidenceDir, "derivatives");

const claimForbidden = [
  "Petdex parity achieved",
  "automatic photo-to-animation ready for arbitrary cats",
  "automatic photo-to-2D ready for arbitrary cats",
  "provider integration verified",
  "3D ready",
  "production signed release ready",
  "Windows ready",
  "cross-platform ready",
  "MCP ready",
  "Claude Code integration verified",
  "OS-level Codex window binding ready",
  "all Codex workflows verified"
];

const securityForbidden = /Authorization\s*:|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|(?:^|[^a-z])sk-[A-Za-z0-9_-]{16,}|\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]|raw photo bytes|raw image bytes|raw provider payload|raw prompt|workspace path|config path/i;

export function buildV34Context() {
  fs.mkdirSync(derivativeDir, { recursive: true });
  const chains = [
    buildChain(clearSample("v34_clear_orange_tabby", "orange", "tabby")),
    buildChain(clearSample("v34_clear_calico", "calico", "patched")),
    buildChain(clearSample("v34_clear_silver_tabby", "silver", "tabby"))
  ];
  const passedContracts = chains.map((chain) => chain.contract).filter((contract) => contract.reviewStatus === "passed");
  const passedPacks = passedContracts.slice(0, 2).map((contract) => {
    const seed = createV34RigFrameSeed({ contract });
    const pack = createV34GeneratedActionPack({ contract, seed });
    writeDerivativeEvidence(pack);
    return pack;
  });
  const transformOnlyNegative = (() => {
    const contract = passedContracts[2];
    const seed = createV34RigFrameSeed({ contract });
    const pack = createV34GeneratedActionPack({ contract, seed, transformOnly: true });
    writeDerivativeEvidence(pack);
    return pack;
  })();
  const missingTargetNegative = (() => {
    const contract = passedContracts[2];
    const seed = createV34RigFrameSeed({ contract });
    const pack = createV34GeneratedActionPack({ contract, seed, missingTargetAction: "play" });
    writeDerivativeEvidence(pack);
    return pack;
  })();
  const packs = [...passedPacks, transformOnlyNegative, missingTargetNegative];
  const qaResults = packs.map((pack) => runV34GenerationQualityGate(pack));
  const productResults = packs.map((pack, index) => runV34GenerationProductE2E({
    pack,
    qa: qaResults[index],
    userApproved: true,
    targetInstanceId: "v34-target-pet",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "v34-target-pet", displayName: "V34 Target", activePackId: "previous-pack" },
      { instanceId: "v34-unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
    ]
  }));
  return {
    chains,
    passedContracts,
    packs,
    passedPacks,
    transformOnlyNegative,
    missingTargetNegative,
    qaResults,
    productResults,
    rigSnapshot: buildV34RigFrameSynthesisEvidenceSnapshot(packs),
    productSnapshot: buildV34GenerationProductEvidenceSnapshot(productResults),
    qaSnapshots: qaResults.map((result) => buildV34GenerationQaEvidenceSnapshot(result))
  };
}

export function v34ProductPathPassed(context) {
  return context.passedContracts.length >= 3
    && context.rigSnapshot.passedCount >= 2
    && context.productSnapshot.passedCandidateCount >= 2
    && context.productSnapshot.previewReadyCount >= 2
    && context.productSnapshot.appliedCount >= 2
    && context.productSnapshot.rolledBackCount >= 2
    && context.productSnapshot.blockedFailedCandidateCount >= 2
    && context.productSnapshot.targetOnlyApplyPassed
    && context.productSnapshot.rollbackPassed
    && context.productSnapshot.diagnosticsSafe
    && !v34RigFrameSynthesisHasForbiddenContent(context.rigSnapshot);
}

export function productRows(context) {
  return context.productResults
    .map((result) =>
      `| ${result.candidateId} | ${result.sampleId} | ${result.characterAssetId} | ${result.qaStatus} | ${result.previewStatus} | ${result.applyStatus} | ${result.rollbackStatus} | ${result.failedCandidateBlocked} | ${result.diagnosticsSafe} |`
    )
    .join("\n");
}

export function actionRows(context) {
  return context.passedPacks
    .flatMap((pack) => pack.targetActionFrames.map((action) => ({
      candidateId: pack.candidateId,
      targetActionId: action.targetActionId,
      runtimeCoreActionId: action.runtimeCoreActionId,
      frameCount: action.frameCount,
      localPartMotionScore: action.localPartMotionScore,
      transformOnly: action.mostlyWholeImageTransform
    })))
    .map((action) =>
      `| ${action.candidateId} | ${action.targetActionId} | ${action.runtimeCoreActionId} | ${action.frameCount} | ${action.localPartMotionScore} | ${action.transformOnly} |`
    )
    .join("\n");
}

export function runClaimScan(text) {
  const hits = claimForbidden.filter((phrase) => text.includes(phrase));
  return {
    status: hits.length === 0 ? "passed" : "failed",
    hits
  };
}

export function runSecurityScan(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return {
    status: securityForbidden.test(text) ? "failed" : "passed"
  };
}

export function safeRelative(absPath) {
  return path.relative(repoRoot, absPath).replaceAll("\\", "/");
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

export function fileExists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

function writeDerivativeEvidence(pack) {
  fs.writeFileSync(path.join(repoRoot, pack.manifestRef), JSON.stringify({
    candidateId: pack.candidateId,
    characterAssetId: pack.characterAssetId,
    rendererKind: pack.rendererKind,
    targetActions: pack.actions,
    runtimeProjectionActions: pack.runtimeCoreProjection.actions,
    frameCountByAction: pack.frameCountByAction,
    semanticEquivalenceClaimed: pack.runtimeCoreProjection.semanticEquivalenceClaimed,
    routeBQualityFallbackRecorded: pack.routeBQualityFallbackRecorded
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(repoRoot, pack.contactSheetEvidenceRef), contactSheetSvg(pack), "utf8");
  fs.writeFileSync(path.join(repoRoot, pack.playbackEvidenceRef), playbackSummary(pack), "utf8");
}

function contactSheetSvg(pack) {
  const swatches = pack.targetActionFrames.map((action, index) => {
    const x = 24 + (index % 4) * 180;
    const y = 48 + Math.floor(index / 4) * 128;
    const color = pack.status === "passed" ? ["#f4a261", "#8ecae6", "#e76f51", "#90be6d"][index % 4] : "#b8b8b8";
    const motion = Math.round(action.localPartMotionScore * 100);
    return `<g><rect x="${x}" y="${y}" width="140" height="92" rx="8" fill="${color}" opacity="0.92"/><circle cx="${x + 70}" cy="${y + 38}" r="24" fill="#fff7e6"/><path d="M${x + 46} ${y + 28} l12 -18 l10 20" fill="#fff7e6"/><path d="M${x + 82} ${y + 28} l12 -18 l10 20" fill="#fff7e6"/><path d="M${x + 46} ${y + 66} q${20 + index * 2} ${motion / 2} 48 0" stroke="#2f2f2f" stroke-width="4" fill="none"/><text x="${x}" y="${y + 116}" font-family="Arial" font-size="14" fill="#222">${action.targetActionId} -> ${action.runtimeCoreActionId}</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="340" viewBox="0 0 760 340"><rect width="760" height="340" fill="#f8f6f0"/><text x="24" y="28" font-family="Arial" font-size="18" fill="#222">${pack.candidateId} Route A2 contact sheet</text>${swatches}</svg>`;
}

function playbackSummary(pack) {
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${pack.candidateId}</title><body><h1>V34 Route A2 Playback Summary</h1><p>candidateId: ${pack.candidateId}</p><p>characterAssetId: ${pack.characterAssetId}</p><p>status: ${pack.status}</p><ul>${pack.targetActionFrames.map((action) => `<li>${action.targetActionId} -> ${action.runtimeCoreActionId}: ${action.frameCount} frames, local motion ${action.localPartMotionScore}</li>`).join("")}</ul><p>Route B fallback remains recorded for target-quality comparison.</p></body></html>`;
}

function buildChain(sample) {
  const intake = createV33SampleIntakeRecord(sample);
  const traitSummary = createV33TraitSummaryRecord({ intake });
  const designContract = createV33CharacterDesignContract({ intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  const partMap = createV34PosePartMapRecord({ mask, designContract });
  const contract = createV34CharacterAssetContract({
    designContract,
    mask,
    partMap,
    evidenceRefs: ["docs/V34.x/evidence/v34-product-path"]
  });
  return { intake, traitSummary, designContract, detection, mask, partMap, contract };
}

function clearSample(sampleId, coatColor, pattern) {
  return {
    sampleId,
    sampleClass: "clear",
    catName: "Named Cat",
    approvedTraits: `${coatColor} ${pattern}, compact body, round face, amber eyes, visible tail`,
    localReferenceConsent: true,
    photo: { mediaType: "image/png", sizeBytes: 1_300_000, fileExtension: "png" },
    width: 1024,
    height: 1024,
    qualitySignals: {
      blurScore: 0.82,
      catCount: 1,
      catVisibleRatio: 0.82,
      occlusionScore: 0.08,
      backgroundComplexity: 0.28,
      bodyVisible: true,
      tailVisible: true
    },
    visualHints: {
      coatColor,
      pattern,
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V34.x/evidence/safe-v34-sample"]
  };
}

export { V34_TARGET_ACTION_IDS };
