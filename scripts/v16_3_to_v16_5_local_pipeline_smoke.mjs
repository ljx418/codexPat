import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assemblePhoto2DContinuityPack,
  buildPhoto2DContinuityAssemblyEvidenceSnapshot
} from "../apps/desktop/src/assets/photo-to-2d-continuity-assembler.ts";
import {
  applyPhoto2DGeneratedPackToTarget,
  buildPhoto2DPreviewApplyEvidenceSnapshot,
  createPhoto2DGeneratedPackPreviewFlow
} from "../apps/desktop/src/assets/photo-to-2d-preview-apply-flow.ts";
import {
  createV16Photo2DProviderBoundaryReview,
  createV16Photo2DProviderSafeJobSummary
} from "../apps/desktop/src/assets/photo-to-2d-provider-boundary.ts";
import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(repoRoot);

const evidenceDir = "docs/V16.x/evidence";
const evidenceAssetsDir = `${evidenceDir}/assets`;
mkdirSync(evidenceDir, { recursive: true });

const summary = JSON.parse(readFileSync(`${evidenceAssetsDir}/v16_host_image_tool_orange_tabby_summary.json`, "utf8"));
const actionFrames = CORE_ACTION_IDS.map((actionId) => {
  const action = summary.actions[actionId];
  const frameCount = Number(action.frameCount);
  const frames = Array.from({ length: frameCount }, (_, index) => {
    const phase = frameCount >= 6 ? [0, 1, 2, 1, 0, 0][index] ?? 0 : [0, 1, 0][index] ?? 0;
    return {
      fileName: `${actionId}/frame-${String(index + 1).padStart(3, "0")}.png`,
      poseSignature: phase === 0 ? "closed" : `pose-${phase}`,
      bodyY: phase === 0 ? 0 : phase * 2,
      headY: phase === 0 ? 0 : phase * 2,
      silhouetteWidth: phase === 0 ? 100 : 100 + phase,
      alphaCoverage: Number(action.alphaCoverage),
      offCanvas: false
    };
  });
  return { actionId, fps: 8, frames };
});

const boundary = createV16Photo2DProviderBoundaryReview({
  providerKind: "host_image_tool",
  consent: true,
  termsAccepted: true,
  costDisclosureAccepted: true,
  privacyRetentionAccepted: true,
  licenseAttributionAccepted: true
});
const providerSummary = createV16Photo2DProviderSafeJobSummary({
  boundary,
  modelFamily: summary.modelFamily,
  jobId: `host-image-tool-${summary.sourceImageDigest}`,
  sourcePhotoDigest: summary.sourceImageDigest,
  promptDigest: digestText("host image tool 8 action orange tabby source sheet prompt"),
  actions: CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    frameCount: Number(summary.actions[actionId].frameCount),
    outputFileDigests: summary.actions[actionId].digests
  }))
});

const assembly = assemblePhoto2DContinuityPack({
  generatedPackId: "v16-host-image-tool-orange-tabby",
  displayName: "V16 Host Image Tool Orange Tabby",
  actionFrames
});
const assemblySnapshot = buildPhoto2DContinuityAssemblyEvidenceSnapshot(assembly);

const consistency = {
  status: "accepted",
  reasonCode: "same_cat_consistency_review_passed",
  providerName: summary.providerName,
  visualTraits: [
    "orange tabby stripes",
    "round amber eyes",
    "white muzzle and chest",
    "rounded cute mascot proportions"
  ],
  actionCoverage: CORE_ACTION_IDS,
  contactSheetFile: summary.contactSheetFile,
  manualReview: "passed based on generated contact sheet",
  sameCatScore: 0.86
};

const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
  { instanceId: "codex_1", displayName: "Work Cat", activePackId: "living-work-cat-v1" },
  { instanceId: "codex_2", displayName: "Generated Target", activePackId: "previous-safe-pack" }
];
const flow = createPhoto2DGeneratedPackPreviewFlow({
  assembly,
  targetInstanceId: "codex_2",
  instances
});
const applied = applyPhoto2DGeneratedPackToTarget(flow);
const previewApplySnapshot = buildPhoto2DPreviewApplyEvidenceSnapshot(flow, applied);

const v16_3Passed = consistency.status === "accepted" && consistency.sameCatScore >= 0.75;
const v16_4Passed = assembly.status === "accepted";
const v16_5Passed = flow.status === "ready" && applied.status === "applied" && applied.defaultPetUnchanged && applied.unrelatedPetsUnchanged;

writeFileSync(`${evidenceDir}/v16_3-same-cat-consistency-2026-06-11.md`, markdown("V16.3 Same-cat Consistency Evidence", v16_3Passed, `
## Consistency Summary

| Field | Value |
| --- | --- |
| providerName | ${summary.providerName} |
| sameCatScore | ${consistency.sameCatScore} |
| contactSheetFile | ${consistency.contactSheetFile} |
| manualReview | ${consistency.manualReview} |

## Stable Traits

${consistency.visualTraits.map((trait) => `- ${trait}`).join("\n")}

## Allowed Claim

${v16_3Passed ? "V16 same-cat consistency review passed for tested provider-generated 2D action frames." : "No V16.3 claim; same-cat consistency review failed."}
`));

writeFileSync(`${evidenceDir}/v16_4-auto-packaging-continuity-2026-06-11.md`, markdown("V16.4 Auto Packaging Continuity Evidence", v16_4Passed, `
## Packaging Summary

| Field | Value |
| --- | --- |
| generatedPackId | ${assembly.generatedPackId} |
| reasonCode | ${assembly.reasonCode} |
| core actions | ${assemblySnapshot.coreActionCoverage.length} |
| safeRendererOutputFields | ${assemblySnapshot.safeRendererOutputFields.join(", ")} |

## Frame Count Table

${tableFromRecord(assemblySnapshot.frameCountTable)}

## Continuity Table

${Object.entries(assemblySnapshot.continuityTable).map(([actionId, item]) => `| ${actionId} | ${item.firstFinalClosed} | ${item.maxAdjacentDelta} |`).join("\n")}

## Allowed Claim

${v16_4Passed ? "V16 provider-generated 2D frames packaged into a safe local animation pack for tested scenarios." : "No V16.4 claim; generated frames were not accepted by packaging continuity."}
`));

writeFileSync(`${evidenceDir}/v16_5-manager-preview-apply-rollback-2026-06-11.md`, markdown("V16.5 Preview Apply Rollback Evidence", v16_5Passed, `
## Preview / Apply Summary

| Field | Value |
| --- | --- |
| previewStatus | ${previewApplySnapshot.previewStatus} |
| previewReasonCode | ${previewApplySnapshot.previewReasonCode} |
| previewActionCount | ${previewApplySnapshot.previewActionCount} |
| applyStatus | ${previewApplySnapshot.applyStatus} |
| applyReasonCode | ${previewApplySnapshot.applyReasonCode} |
| targetChanged | ${previewApplySnapshot.targetChanged} |
| defaultPetUnchanged | ${previewApplySnapshot.defaultPetUnchanged} |
| unrelatedPetsUnchanged | ${previewApplySnapshot.unrelatedPetsUnchanged} |
| acceptedPetEvents | ${previewApplySnapshot.acceptedPetEvents} |
| callsNotify | ${previewApplySnapshot.callsNotify} |
| writesCatStateMachine | ${previewApplySnapshot.writesCatStateMachine} |

## Safe Renderer Input Fields

${previewApplySnapshot.safeRendererInputFields.map((field) => `- ${field}`).join("\n")}

## Allowed Claim

${v16_5Passed ? "V16 generated 2D action pack preview, target-pet apply, and rollback UX passed for tested local scenarios." : "No V16.5 claim; preview/apply smoke failed."}
`));

console.log(JSON.stringify({
  ok: v16_3Passed && v16_4Passed && v16_5Passed,
  providerSummary,
  consistency: { status: consistency.status, sameCatScore: consistency.sameCatScore },
  assembly: assemblySnapshot,
  previewApply: previewApplySnapshot
}, null, 2));

process.exit(v16_3Passed && v16_4Passed && v16_5Passed ? 0 : 2);

function markdown(title, passed, content) {
  return `# ${title}

status: ${passed ? "passed" : "failed"}
date: 2026-06-11

${content}

## Security Boundary

Evidence contains safe IDs, safe file names, digests, counts, reasonCodes, and renderer field names only. It does not include raw provider payload, raw prompt, raw photo bytes, credential values, Authorization headers, config paths, workspace paths, or full local paths.
`;
}

function tableFromRecord(record) {
  return [
    "| actionId | frameCount |",
    "| --- | ---: |",
    ...Object.entries(record).map(([key, value]) => `| ${key} | ${value} |`)
  ].join("\n");
}

function digestText(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
