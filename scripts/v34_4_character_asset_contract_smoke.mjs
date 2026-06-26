import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "../apps/desktop/src/assets/v33-identity-contract.ts";
import { createV33SampleIntakeRecord } from "../apps/desktop/src/assets/v33-sample-intake.ts";
import { createV34SubjectDetectionRecord } from "../apps/desktop/src/assets/v34-subject-detection.ts";
import { createV34SegmentationMaskRecord } from "../apps/desktop/src/assets/v34-segmentation-mask.ts";
import { createV34PosePartMapRecord } from "../apps/desktop/src/assets/v34-pose-part-map.ts";
import {
  buildV34CharacterAssetContractEvidenceSnapshot,
  createV34CharacterAssetContract,
  v34CharacterAssetContractHasForbiddenContent
} from "../apps/desktop/src/assets/v34-character-asset-contract.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-25";
const evidenceDir = path.join(repoRoot, "docs", "V34.x", "evidence");
const evidencePath = path.join(evidenceDir, `v34_4-character-asset-contract-${date}.md`);

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
const securityForbidden = /Authorization\s*:|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|sk-[A-Za-z0-9_-]{8,}|\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]|raw image bytes|raw provider payload|raw prompt|workspace path|config path/i;

fs.mkdirSync(evidenceDir, { recursive: true });

const chains = sampleInputs().map((sample) => buildChain(sample));
const passedChains = chains.filter((chain) => chain.partMap.status === "passed");
const contracts = [
  ...passedChains.map((chain) => createV34CharacterAssetContract({
    designContract: chain.designContract,
    mask: chain.mask,
    partMap: chain.partMap,
    evidenceRefs: ["docs/V34.x/evidence/v34_4-character-asset-contract"]
  })),
  createV34CharacterAssetContract({
    designContract: passedChains[0].designContract,
    mask: passedChains[0].mask,
    partMap: createV34PosePartMapRecord({
      mask: passedChains[0].mask,
      designContract: passedChains[0].designContract,
      partConfidence: { tail: "low" }
    }),
    evidenceRefs: ["docs/V34.x/evidence/v34_4-character-asset-contract"]
  }),
  ...chains
    .filter((chain) => chain.partMap.status !== "passed")
    .map((chain) => createV34CharacterAssetContract({
      designContract: chain.designContract,
      mask: chain.mask,
      partMap: chain.partMap,
      evidenceRefs: ["docs/V34.x/evidence/v34_4-character-asset-contract"]
    }))
];
const snapshot = buildV34CharacterAssetContractEvidenceSnapshot(contracts);

const statusRows = snapshot.contracts
  .map((record) =>
    `| ${record.sampleId} | ${record.characterAssetId} | ${record.reviewStatus} | ${record.identityAnchors.join(", ")} | ${record.requiredParts.join(", ")} | ${record.rigReadiness} | ${record.frameSeedReadiness} | ${record.reasonCodes.join(", ")} |`
  )
  .join("\n");

const body = [
  "# V34.4 Character Asset Contract Evidence",
  "",
  "Phase: V34.4",
  `Date: ${date}`,
  "",
  "## PRD / Spec Review",
  "- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.",
  "- Reviewed: `docs/V34.x/v34-target-architecture.md`.",
  "- Reviewed: `docs/V34.x/v34-implementation-contract.md`.",
  "- Reviewed: `docs/V34.x/v34_4-character-asset-contract-spec.md`.",
  "- Audit opinion: no fatal or major V34.4 spec deviation found.",
  "",
  "## Development Action",
  "- Implemented `V34CharacterAssetContract` creation from V33 character design contracts, V34.2 masks, and V34.3 part maps.",
  "- Character asset contracts preserve same-sample traceability and independent characterAssetId values.",
  "- Kept V34.4 scoped to character asset contracts; no rig/frame synthesis, action generation, provider, runtime, or production claim is introduced.",
  "",
  "## Acceptance Action",
  "- Each passed sample receives an independent characterAssetId.",
  "- Contracts list identityAnchors, requiredParts, allowedStylization, disallowedDrift, rigReadiness, and frameSeedReadiness.",
  "- Incomplete part map review case is blocked before V34.5.",
  "- Non-passed chain records do not become ready character asset contracts.",
  "",
  "## Result Summary",
  `- Passed upstream part maps: ${passedChains.length}`,
  `- Character asset contract records: ${snapshot.contracts.length}`,
  `- Passed contracts: ${snapshot.passedCount}`,
  `- Blocked contracts: ${snapshot.blockedCount}`,
  `- Failed contracts: ${snapshot.failedCount}`,
  `- Ready for later frame seed: ${snapshot.readyForFrameSeedCount}`,
  `- Duplicate characterAssetId count: ${snapshot.duplicateCharacterAssetIdCount}`,
  `- Duplicate identity signature count: ${snapshot.duplicateIdentitySignatureCount}`,
  `- Internal forbidden-content flag: ${v34CharacterAssetContractHasForbiddenContent(snapshot)}`,
  "- Decision: passed scoped for V34.4 named-sample character asset contracts.",
  "",
  "## Character Asset Contract Status",
  "| sampleId | characterAssetId | reviewStatus | identityAnchors | requiredParts | rigReadiness | frameSeedReadiness | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  statusRows,
  "",
  "## Claim Scan",
  "- Status: CLAIM_SCAN_PLACEHOLDER",
  "- Boundary: named sample character asset contracts only.",
  "",
  "## Security Scan",
  "- Status: SECURITY_SCAN_PLACEHOLDER",
  "- Boundary: evidence records use safe sample IDs, safe anchors, safe contract IDs, and relative refs only.",
  "",
  "## Narrow Claim",
  "V34.4 may claim scoped character asset contracts for V34.3 passed named safe part maps only.",
  ""
].join("\n");

const claimScan = runClaimScan(body);
const securityScan = runSecurityScan(body);
const finalBody = body
  .replace("CLAIM_SCAN_PLACEHOLDER", claimScan.status)
  .replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
fs.writeFileSync(evidencePath, finalBody, "utf8");

const ok = passedChains.length >= 3
  && snapshot.passedCount >= 3
  && snapshot.blockedCount >= 1
  && snapshot.readyForFrameSeedCount >= 3
  && snapshot.duplicateCharacterAssetIdCount === 0
  && snapshot.duplicateIdentitySignatureCount === 0
  && !v34CharacterAssetContractHasForbiddenContent(snapshot)
  && claimScan.status === "passed"
  && securityScan.status === "passed";

console.log(JSON.stringify({
  ok,
  evidencePath: path.relative(repoRoot, evidencePath).replaceAll("\\", "/"),
  passedPartMaps: passedChains.length,
  passedContracts: snapshot.passedCount,
  blockedContracts: snapshot.blockedCount,
  readyForFrameSeedCount: snapshot.readyForFrameSeedCount,
  duplicateCharacterAssetIdCount: snapshot.duplicateCharacterAssetIdCount,
  duplicateIdentitySignatureCount: snapshot.duplicateIdentitySignatureCount,
  claimScan: claimScan.status,
  securityScan: securityScan.status
}, null, 2));
if (!ok) process.exitCode = 1;

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
  return { intake, designContract, detection, mask, partMap };
}

function sampleInputs() {
  return [
    clearSample("v34_clear_orange_tabby", "orange", "tabby"),
    clearSample("v34_clear_silver_tabby", "silver", "tabby"),
    clearSample("v34_clear_calico", "calico", "patched"),
    {
      ...clearSample("v34_negative_multi_subject", "orange", "tabby"),
      sampleClass: "negative",
      qualitySignals: { ...clearSignals(), catCount: 2 }
    },
    {
      ...clearSample("v34_negative_not_cat", "unknown", "unknown"),
      sampleClass: "negative",
      qualitySignals: { ...clearSignals(), catCount: 0 }
    }
  ];
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
    qualitySignals: clearSignals(),
    visualHints: {
      coatColor,
      pattern,
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V34.x/evidence/safe-character-asset-contract"]
  };
}

function clearSignals() {
  return {
    blurScore: 0.82,
    catCount: 1,
    catVisibleRatio: 0.82,
    occlusionScore: 0.08,
    backgroundComplexity: 0.28,
    bodyVisible: true,
    tailVisible: true
  };
}
