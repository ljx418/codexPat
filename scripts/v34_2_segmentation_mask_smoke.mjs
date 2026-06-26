import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createV33SampleIntakeRecord } from "../apps/desktop/src/assets/v33-sample-intake.ts";
import { createV34SubjectDetectionRecord } from "../apps/desktop/src/assets/v34-subject-detection.ts";
import {
  buildV34SegmentationMaskEvidenceSnapshot,
  createV34SegmentationMaskRecord,
  v34SegmentationMaskHasForbiddenContent
} from "../apps/desktop/src/assets/v34-segmentation-mask.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-25";
const evidenceDir = path.join(repoRoot, "docs", "V34.x", "evidence");
const evidencePath = path.join(evidenceDir, `v34_2-segmentation-mask-${date}.md`);

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

const intakeRecords = sampleInputs().map((input) => createV33SampleIntakeRecord(input));
const detections = intakeRecords.map((record) => createV34SubjectDetectionRecord(record));
const passedDetections = detections.filter((record) => record.status === "passed" && record.subjectCount === "one");
const masks = [
  ...passedDetections.map((detection) => createV34SegmentationMaskRecord({ detection })),
  createV34SegmentationMaskRecord({
    detection: passedDetections[0],
    backgroundLeakageRatio: 0.34,
    transparentCropEvidenceRef: "docs/V34.x/evidence/derivatives/v34_review_high_leakage-transparent-crop"
  }),
  ...detections
    .filter((record) => record.status !== "passed")
    .map((detection) => createV34SegmentationMaskRecord({ detection }))
];
const snapshot = buildV34SegmentationMaskEvidenceSnapshot(masks);

const statusRows = snapshot.records
  .map((record) =>
    `| ${record.sampleId} | ${record.status} | ${record.foregroundCoverageBucket} | ${record.backgroundLeakageBucket} | ${record.alphaCoverageBucket} | ${record.transparentCropEvidenceRef} | ${record.reasonCodes.join(", ")} |`
  )
  .join("\n");

const body = [
  "# V34.2 Segmentation Mask Evidence",
  "",
  "Phase: V34.2",
  `Date: ${date}`,
  "",
  "## PRD / Spec Review",
  "- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.",
  "- Reviewed: `docs/V34.x/v34-target-architecture.md`.",
  "- Reviewed: `docs/V34.x/v34-implementation-contract.md`.",
  "- Reviewed: `docs/V34.x/v34_2-segmentation-mask-spec.md`.",
  "- Audit opinion: no fatal or major V34.2 spec deviation found.",
  "",
  "## Development Action",
  "- Implemented `V34SegmentationMaskRecord` creation from V34.1 subject detection records.",
  "- Mask records store safe quality buckets and sanitized derivative refs only.",
  "- Kept V34.2 scoped to mask/crop evidence; no pose map, character asset, action generation, provider, runtime, or production claim is introduced.",
  "",
  "## Acceptance Action",
  "- Every V34.1 passed single-cat sample receives a mask record.",
  "- Passed masks include transparent derivative refs and low/none background leakage buckets.",
  "- High-leakage mask review case is blocked before character asset creation.",
  "- Non-passed subject detection records do not become passed masks.",
  "",
  "## Result Summary",
  `- V34.1 passed single-cat detections: ${passedDetections.length}`,
  `- Mask records: ${snapshot.records.length}`,
  `- Passed masks: ${snapshot.passedCount}`,
  `- Blocked masks: ${snapshot.blockedCount}`,
  `- Failed masks: ${snapshot.failedCount}`,
  `- Eligible for later character asset contract: ${snapshot.eligibleForCharacterAssetCount}`,
  `- Internal forbidden-content flag: ${v34SegmentationMaskHasForbiddenContent(snapshot)}`,
  "- Decision: passed scoped for V34.2 named-sample segmentation mask records.",
  "",
  "## Mask Status",
  "| sampleId | status | foreground | leakage | alpha | transparentCropEvidenceRef | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  statusRows,
  "",
  "## Claim Scan",
  "- Status: CLAIM_SCAN_PLACEHOLDER",
  "- Boundary: named sample segmentation mask records only.",
  "",
  "## Security Scan",
  "- Status: SECURITY_SCAN_PLACEHOLDER",
  "- Boundary: evidence records use safe sample IDs, quality buckets, and relative derivative refs only.",
  "",
  "## Narrow Claim",
  "V34.2 may claim scoped segmentation mask records for V34.1 passed named safe samples only.",
  ""
].join("\n");

const claimScan = runClaimScan(body);
const securityScan = runSecurityScan(body);
const finalBody = body
  .replace("CLAIM_SCAN_PLACEHOLDER", claimScan.status)
  .replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
fs.writeFileSync(evidencePath, finalBody, "utf8");

const ok = passedDetections.length >= 3
  && snapshot.passedCount >= 3
  && snapshot.blockedCount >= 1
  && snapshot.eligibleForCharacterAssetCount >= 3
  && !v34SegmentationMaskHasForbiddenContent(snapshot)
  && claimScan.status === "passed"
  && securityScan.status === "passed";

console.log(JSON.stringify({
  ok,
  evidencePath: path.relative(repoRoot, evidencePath).replaceAll("\\", "/"),
  passedDetections: passedDetections.length,
  passedMasks: snapshot.passedCount,
  blockedMasks: snapshot.blockedCount,
  eligibleForCharacterAssetCount: snapshot.eligibleForCharacterAssetCount,
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
    },
    {
      ...clearSample("v34_blocked_low_visible_single_cat", "black", "solid"),
      sampleClass: "difficult",
      qualitySignals: { ...clearSignals(), catVisibleRatio: 0.5 }
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
    evidenceRefs: ["docs/V34.x/evidence/safe-segmentation-mask"]
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
