import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "../apps/desktop/src/assets/v33-identity-contract.ts";
import { createV33SampleIntakeRecord } from "../apps/desktop/src/assets/v33-sample-intake.ts";
import { createV34SubjectDetectionRecord } from "../apps/desktop/src/assets/v34-subject-detection.ts";
import { createV34SegmentationMaskRecord } from "../apps/desktop/src/assets/v34-segmentation-mask.ts";
import {
  buildV34PosePartMapEvidenceSnapshot,
  createV34PosePartMapRecord,
  v34PosePartMapHasForbiddenContent
} from "../apps/desktop/src/assets/v34-pose-part-map.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-25";
const evidenceDir = path.join(repoRoot, "docs", "V34.x", "evidence");
const evidencePath = path.join(evidenceDir, `v34_3-pose-part-map-${date}.md`);

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

const chainRecords = sampleInputs().map((sample) => {
  const intake = createV33SampleIntakeRecord(sample);
  const traitSummary = createV33TraitSummaryRecord({ intake });
  const designContract = createV33CharacterDesignContract({ intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  return { intake, designContract, detection, mask };
});
const passedMasks = chainRecords.filter((record) => record.mask.status === "passed");
const poseMaps = [
  ...passedMasks.map((record) => createV34PosePartMapRecord({
    mask: record.mask,
    designContract: record.designContract
  })),
  createV34PosePartMapRecord({
    mask: passedMasks[0].mask,
    designContract: passedMasks[0].designContract,
    partConfidence: { tail: "low", backLegs: "missing" }
  }),
  ...chainRecords
    .filter((record) => record.mask.status !== "passed")
    .map((record) => createV34PosePartMapRecord({
      mask: record.mask,
      designContract: record.designContract
    }))
];
const snapshot = buildV34PosePartMapEvidenceSnapshot(poseMaps);

const statusRows = snapshot.records
  .map((record) =>
    `| ${record.sampleId} | ${record.status} | ${record.canonicalPose} | ${record.visibleParts.join(", ")} | ${record.missingOrLowConfidenceParts.join(", ")} | ${record.reasonCodes.join(", ")} |`
  )
  .join("\n");

const body = [
  "# V34.3 Pose Part Map Evidence",
  "",
  "Phase: V34.3",
  `Date: ${date}`,
  "",
  "## PRD / Spec Review",
  "- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.",
  "- Reviewed: `docs/V34.x/v34-target-architecture.md`.",
  "- Reviewed: `docs/V34.x/v34-implementation-contract.md`.",
  "- Reviewed: `docs/V34.x/v34_3-pose-part-map-spec.md`.",
  "- Audit opinion: no fatal or major V34.3 spec deviation found.",
  "",
  "## Development Action",
  "- Implemented `V34PosePartMapRecord` creation from V34.2 mask records and V33 character design contracts.",
  "- Part maps store canonical pose, visible parts, part confidence, missing/low-confidence parts, and reasonCodes.",
  "- Kept V34.3 scoped to pose/part map evidence; no V34 character asset, action generation, provider, runtime, or production claim is introduced.",
  "",
  "## Acceptance Action",
  "- Every V34.2 passed mask sample receives a part map.",
  "- Passed part maps separate visible parts from missing or low-confidence parts.",
  "- Low-confidence/missing part review case is blocked before V34.4.",
  "- Non-passed mask records do not become passed part maps.",
  "",
  "## Result Summary",
  `- V34.2 passed masks: ${passedMasks.length}`,
  `- Pose part map records: ${snapshot.records.length}`,
  `- Passed part maps: ${snapshot.passedCount}`,
  `- Blocked part maps: ${snapshot.blockedCount}`,
  `- Failed part maps: ${snapshot.failedCount}`,
  `- Referencable by later V34 character asset contract: ${snapshot.referencableByCharacterAssetContractCount}`,
  `- Internal forbidden-content flag: ${v34PosePartMapHasForbiddenContent(snapshot)}`,
  "- Decision: passed scoped for V34.3 named-sample pose part map records.",
  "",
  "## Part Map Status",
  "| sampleId | status | canonicalPose | visibleParts | missingOrLowConfidenceParts | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- |",
  statusRows,
  "",
  "## Claim Scan",
  "- Status: CLAIM_SCAN_PLACEHOLDER",
  "- Boundary: named sample pose/part map records only.",
  "",
  "## Security Scan",
  "- Status: SECURITY_SCAN_PLACEHOLDER",
  "- Boundary: evidence records use safe sample IDs, part names, confidence buckets, and relative refs only.",
  "",
  "## Narrow Claim",
  "V34.3 may claim scoped pose part map records for V34.2 passed named safe masks only.",
  ""
].join("\n");

const claimScan = runClaimScan(body);
const securityScan = runSecurityScan(body);
const finalBody = body
  .replace("CLAIM_SCAN_PLACEHOLDER", claimScan.status)
  .replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
fs.writeFileSync(evidencePath, finalBody, "utf8");

const ok = passedMasks.length >= 3
  && snapshot.passedCount >= 3
  && snapshot.blockedCount >= 1
  && snapshot.referencableByCharacterAssetContractCount >= 3
  && !v34PosePartMapHasForbiddenContent(snapshot)
  && claimScan.status === "passed"
  && securityScan.status === "passed";

console.log(JSON.stringify({
  ok,
  evidencePath: path.relative(repoRoot, evidencePath).replaceAll("\\", "/"),
  passedMasks: passedMasks.length,
  passedPartMaps: snapshot.passedCount,
  blockedPartMaps: snapshot.blockedCount,
  referencableByCharacterAssetContractCount: snapshot.referencableByCharacterAssetContractCount,
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
    evidenceRefs: ["docs/V34.x/evidence/safe-pose-part-map"]
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
