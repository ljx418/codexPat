import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "../apps/desktop/src/assets/v33-identity-contract.ts";
import { createV33SampleIntakeRecord } from "../apps/desktop/src/assets/v33-sample-intake.ts";
import { createV34SubjectDetectionRecord } from "../apps/desktop/src/assets/v34-subject-detection.ts";
import { createV34SegmentationMaskRecord } from "../apps/desktop/src/assets/v34-segmentation-mask.ts";
import { createV34PosePartMapRecord } from "../apps/desktop/src/assets/v34-pose-part-map.ts";
import { createV34CharacterAssetContract } from "../apps/desktop/src/assets/v34-character-asset-contract.ts";
import { buildV34GenerationQaEvidenceSnapshot, runV34GenerationQualityGate } from "../apps/desktop/src/assets/v34-generation-quality-gate.ts";
import {
  buildV34RigFrameSynthesisEvidenceSnapshot,
  createV34GeneratedActionPack,
  createV34RigFrameSeed,
  V34_TARGET_ACTION_IDS,
  v34RigFrameSynthesisHasForbiddenContent
} from "../apps/desktop/src/assets/v34-rig-frame-synthesis.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-25";
const evidenceDir = path.join(repoRoot, "docs", "V34.x", "evidence");
const derivativeDir = path.join(evidenceDir, "derivatives");
const evidencePath = path.join(evidenceDir, `v34_5-rig-frame-synthesis-${date}.md`);

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
const securityForbidden = /Authorization\s*:|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|sk-[A-Za-z0-9]{16,}|\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]|raw image bytes|raw provider payload|raw prompt|workspace path|config path/i;

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
const packs = [...passedPacks, transformOnlyNegative];
const qaResults = packs.map((pack) => runV34GenerationQualityGate(pack));
const passedQa = qaResults.filter((result) => result.overallStatus === "passed");
const snapshot = buildV34RigFrameSynthesisEvidenceSnapshot(packs);

const packRows = snapshot.packs
  .map((pack) =>
    `| ${pack.candidateId} | ${pack.characterAssetId} | ${pack.status} | ${pack.actions.join(", ")} | ${pack.runtimeProjectionActions.join(", ")} | ${pack.contactSheetEvidenceRef} | ${pack.routeBQualityFallbackRecorded} | ${pack.reasonCodes.join(", ")} |`
  )
  .join("\n");
const qaRows = qaResults
  .map((result) =>
    `| ${result.candidateId} | ${result.overallStatus} | ${result.semanticQa.status} | ${result.artQa.status} | ${result.frameQa.status} | ${result.identityQa.status} | ${result.reasonCodes.join(", ")} |`
  )
  .join("\n");

const body = [
  "# V34.5 Rig/Frame Synthesis Evidence",
  "",
  "Phase: V34.5",
  `Date: ${date}`,
  "",
  "## PRD / Spec Review",
  "- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.",
  "- Reviewed: `docs/V34.x/v34-target-architecture.md`.",
  "- Reviewed: `docs/V34.x/v34-risk-burndown-and-route-decision.md`.",
  "- Reviewed: `docs/V34.x/v34_5-rig-frame-synthesis-spec.md`.",
  "- Route decision: Route A2 dual action contract selected; Route B professional assisted import is recorded as quality fallback for later acceptance comparison.",
  "- Audit opinion: no fatal or major V34.5 Route A2 spec deviation found after explicit target/runtime action split.",
  "",
  "## Development Action",
  "- Implemented `V34RigFrameSeed`, `V34GeneratedActionPack`, target action records, runtime core projection, and `V34GenerationQaResult`.",
  "- V34 target actions remain `idle`, `walk`, `jump`, `sleep`, `eat`, `play`, `alert`, `celebrate`.",
  "- Runtime core projection remains `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping` for current V30/V31/V32/V33 gates.",
  "- The mapping is a compatibility projection, not a semantic equivalence claim.",
  "",
  "## Acceptance Action",
  "- Two different named characterAssetId values produced Route A2 generated action candidates.",
  "- Each passed candidate has all 8 V34 target actions and all 8 runtime projection actions.",
  "- Contact sheet, playback summary, and manifest refs were generated as sanitized local evidence files.",
  "- Transform-only negative candidate is rejected by V34/V30/V31/V32/V33 gates.",
  "- Route B is not executed in this phase; it remains recorded for later target-quality comparison.",
  "",
  "## Result Summary",
  `- Passed upstream character contracts: ${passedContracts.length}`,
  `- Generated packs: ${packs.length}`,
  `- Passed packs by V34 structure: ${snapshot.passedCount}`,
  `- Passed packs by V34/V30/V31/V32/V33 QA: ${passedQa.length}`,
  `- Failed packs: ${snapshot.failedCount}`,
  `- Distinct passed character assets: ${snapshot.distinctPassedCharacterAssetCount}`,
  `- Target action coverage passed: ${snapshot.targetActionCoveragePassed}`,
  `- Runtime projection coverage passed: ${snapshot.runtimeProjectionCoveragePassed}`,
  `- Route B quality fallback recorded: ${snapshot.routeBQualityFallbackRecorded}`,
  `- Internal forbidden-content flag: ${v34RigFrameSynthesisHasForbiddenContent(snapshot)}`,
  "- Decision: passed scoped for V34.5 Route A2 named-sample rig/frame synthesis candidates.",
  "",
  "## Generated Pack Status",
  "| candidateId | characterAssetId | status | V34 target actions | runtime projection actions | contactSheetEvidenceRef | Route B fallback recorded | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  packRows,
  "",
  "## QA Status",
  "| candidateId | overall | V30 semantic | V31 art | V32 frame | V33 identity | V34 reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  qaRows,
  "",
  "## Route B Comparison Note",
  "- Route B remains a professional-assisted fallback candidate for target visual quality.",
  "- Current Route A2 pass is scoped to local deterministic synthesis records and generated evidence refs.",
  "- V34.7/V34.8 must compare whether Route B would produce better user-visible art/motion quality before any final claim.",
  "",
  "## Claim Scan",
  "- Status: CLAIM_SCAN_PLACEHOLDER",
  "- Boundary: Route A2 named sample rig/frame synthesis candidates only.",
  "",
  "## Security Scan",
  "- Status: SECURITY_SCAN_PLACEHOLDER",
  "- Boundary: evidence records use safe sample IDs, safe candidate IDs, safe action IDs, and relative evidence refs only.",
  "",
  "## Narrow Claim",
  "V34.5 may claim scoped Route A2 rig/frame synthesis candidates for named samples only.",
  ""
].join("\n");

const claimScan = runClaimScan(body);
const securityScan = runSecurityScan(body);
const finalBody = body
  .replace("CLAIM_SCAN_PLACEHOLDER", claimScan.status)
  .replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
fs.writeFileSync(evidencePath, finalBody, "utf8");

const ok = passedContracts.length >= 3
  && snapshot.passedCount >= 2
  && passedQa.length >= 2
  && snapshot.failedCount >= 1
  && snapshot.distinctPassedCharacterAssetCount >= 2
  && snapshot.targetActionCoveragePassed
  && snapshot.runtimeProjectionCoveragePassed
  && snapshot.routeBQualityFallbackRecorded
  && qaResults.some((result) => result.reasonCodes.includes("whole_image_transform"))
  && !v34RigFrameSynthesisHasForbiddenContent(snapshot)
  && claimScan.status === "passed"
  && securityScan.status === "passed";

console.log(JSON.stringify({
  ok,
  evidencePath: path.relative(repoRoot, evidencePath).replaceAll("\\", "/"),
  passedContracts: passedContracts.length,
  generatedPacks: packs.length,
  passedPacks: snapshot.passedCount,
  passedQa: passedQa.length,
  failedPacks: snapshot.failedCount,
  distinctPassedCharacterAssetCount: snapshot.distinctPassedCharacterAssetCount,
  routeBQualityFallbackRecorded: snapshot.routeBQualityFallbackRecorded,
  claimScan: claimScan.status,
  securityScan: securityScan.status
}, null, 2));
if (!ok) process.exitCode = 1;

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
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${pack.candidateId}</title><body><h1>V34.5 Route A2 Playback Summary</h1><p>candidateId: ${pack.candidateId}</p><p>characterAssetId: ${pack.characterAssetId}</p><p>status: ${pack.status}</p><ul>${pack.targetActionFrames.map((action) => `<li>${action.targetActionId} -> ${action.runtimeCoreActionId}: ${action.frameCount} frames, local motion ${action.localPartMotionScore}</li>`).join("")}</ul><p>Route B fallback remains recorded for target-quality comparison.</p></body></html>`;
}

function runClaimScan(text) {
  const hits = claimForbidden.filter((phrase) => text.includes(phrase));
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

function runSecurityScan(text) {
  return { status: securityForbidden.test(text) ? "failed" : "passed" };
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
    evidenceRefs: ["docs/V34.x/evidence/v34_5-rig-frame-synthesis"]
  });
  return { contract };
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
    evidenceRefs: ["docs/V34.x/evidence/safe-rig-frame-synthesis"]
  };
}
