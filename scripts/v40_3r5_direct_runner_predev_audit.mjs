import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING,
  createLocalImageCandidateOrchestrator
} from "../apps/desktop/src/assets/v40-local-image-candidate-orchestrator.ts";
import { createDirectDiffusersFrameRunner } from "../apps/desktop/src/assets/v40-direct-local-image-model.ts";
import {
  V40_NO_WEBUI_ACTION_IDS,
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan
} from "../apps/desktop/src/assets/v40-no-webui-workflow-contract.ts";

const phaseDate = "2026-07-01";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const pythonBin = path.join(repoRoot, ".v40-runner-venv", "bin", "python");
const safeOutputDirRef = "docs/V40.x/evidence/assets/v40-3r6-controlled-candidates";
const prePhaseRef = `docs/V40.x/evidence/v40_3r5-pre-phase-development-and-acceptance-plan-${phaseDate}.md`;
const evidenceRef = `docs/V40.x/evidence/v40_3r5-direct-runner-predev-audit-${phaseDate}.md`;
const summaryRef = `docs/V40.x/evidence/v40_3r5-direct-runner-predev-audit-${phaseDate}.json`;

const sourceSamples = [
  {
    sampleId: "v38_a_cat_public",
    displayName: "A-Cat public tested sample",
    sampleKind: "tested_cat",
    sourceRef: "docs/V38.x/evidence/assets/v38_a_cat_public/sanitized.png",
    baselineV39Ref: "/v39/v38_a_cat_public/contact-sheet.svg",
    consentBoundary: "public_sample",
    licenseStatus: "usable",
    retentionRule: "safe_relative_refs_only",
    sourceLicenseSummary: "v38_public_sanitized_derivative_ready",
    identityAnchors: ["soft gray brown coat", "subtle tabby mask", "medium striped tail", "green eyes"],
    reasonCodes: ["v38_public_sanitized_derivative_ready"]
  },
  {
    sampleId: "v38_tuxedo_public",
    displayName: "Tuxedo public tested sample",
    sampleKind: "tested_cat",
    sourceRef: "docs/V38.x/evidence/assets/v38_tuxedo_public/sanitized.png",
    baselineV39Ref: "/v39/v38_tuxedo_public/contact-sheet.svg",
    consentBoundary: "public_sample",
    licenseStatus: "usable",
    retentionRule: "safe_relative_refs_only",
    sourceLicenseSummary: "v38_public_sanitized_derivative_ready",
    identityAnchors: ["black and white tuxedo coat", "white muzzle", "white chest", "dark curved tail"],
    reasonCodes: ["v38_public_sanitized_derivative_ready"]
  },
  {
    sampleId: "v38_negative_dog_public",
    displayName: "negative non-cat public metadata",
    sampleKind: "negative_or_blocked",
    sourceRef: null,
    baselineV39Ref: null,
    consentBoundary: "public_sample",
    licenseStatus: "blocked",
    retentionRule: "safe_relative_refs_only",
    sourceLicenseSummary: "negative_non_cat_rejected",
    identityAnchors: [],
    reasonCodes: ["negative_non_cat_rejected"]
  }
];

const actionPoseTemplates = {
  idle: "centered full-body cat, relaxed standing or sitting, tiny breathing-ready pose",
  walk: "side-readable full-body cat, alternating paw intent, tail counter-balance",
  jump: "crouch-to-airborne full-body cat, clear vertical motion intent",
  sleep: "curled single cat, closed-eye sleeping silhouette, no duplicate subject",
  eat: "head dip toward small bowl, front paws braced, body remains cat-like",
  play: "front paw raised, playful tail curve, readable toy/play energy without extra subjects",
  alert: "ears up, wide eyes, tense body, readable surprise pose",
  celebrate: "happy upright or lifted expression, tail arc, positive completion pose"
};

function fileExists(relRef) {
  if (!relRef || relRef.startsWith("/")) return true;
  return fs.existsSync(path.join(repoRoot, relRef));
}

function pythonImportAvailable(moduleName) {
  if (!fs.existsSync(pythonBin)) return false;
  try {
    execFileSync(pythonBin, ["-c", `import ${moduleName}`], {
      cwd: repoRoot,
      stdio: ["ignore", "ignore", "ignore"],
      timeout: 120000
    });
    return true;
  } catch {
    return false;
  }
}

function findIpAdapterWeight() {
  const root = path.join(repoRoot, ".v40-hf-cache", "hub", "models--h94--IP-Adapter");
  if (!fs.existsSync(root)) return false;
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(next);
      if ((entry.isFile() || entry.isSymbolicLink()) && entry.name === "ip-adapter_sd15.bin" && fs.existsSync(next)) return true;
    }
  }
  return false;
}

function findLocalCheckpoint() {
  const candidates = [
    { label: "dreamshaper-8-local-checkpoint", relHint: ["ComfyUI", "models", "checkpoints", "SD1.5", "dreamshaper_8.safetensors"] },
    { label: "anything-v5-local-checkpoint", relHint: ["models", "Stable-diffusion", "sd1.5", "anything-v5.safetensors"] }
  ];
  const roots = ["/mnt/c/ComfyUI-aki-v2", "/mnt/c/App-webui-aki-v4.10"];
  for (const candidate of candidates) {
    for (const root of roots) {
      const checkpoint = path.join(root, ...candidate.relHint);
      if (fs.existsSync(checkpoint)) return candidate.label;
    }
  }
  return null;
}

function writeText(relRef, body) {
  const abs = path.join(repoRoot, relRef);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${body.trimEnd()}\n`, "utf8");
}

function writeJson(relRef, payload) {
  const abs = path.join(repoRoot, relRef);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

const pythonReady = fs.existsSync(pythonBin);
const moduleAvailability = {
  torch: pythonImportAvailable("torch"),
  diffusers: pythonImportAvailable("diffusers"),
  PIL: pythonImportAvailable("PIL")
};
const modelLabel = findLocalCheckpoint();
const ipAdapterAvailable = findIpAdapterWeight();

const components = [
  { componentId: "python_wrapper", status: pythonReady ? "available" : "missing", safeLabel: "v40-runner-venv-python", reasonCodes: pythonReady ? ["python_wrapper_available"] : ["python_wrapper_missing"] },
  { componentId: "torch", status: moduleAvailability.torch ? "available" : "missing", safeLabel: "torch", reasonCodes: moduleAvailability.torch ? ["torch_available"] : ["torch_missing"] },
  { componentId: "diffusers", status: moduleAvailability.diffusers ? "available" : "missing", safeLabel: "diffusers", reasonCodes: moduleAvailability.diffusers ? ["diffusers_available"] : ["diffusers_missing"] },
  { componentId: "local_checkpoint", status: modelLabel ? "available" : "missing", safeLabel: modelLabel ?? "local-checkpoint-missing", reasonCodes: modelLabel ? ["local_checkpoint_available"] : ["local_checkpoint_missing"] },
  { componentId: "identity_conditioner", status: ipAdapterAvailable ? "available" : "missing", safeLabel: "ip-adapter-sd15", reasonCodes: ipAdapterAvailable ? ["identity_conditioner_available"] : ["identity_conditioner_missing"] },
  { componentId: "image_io", status: moduleAvailability.PIL ? "available" : "missing", safeLabel: "PIL", reasonCodes: moduleAvailability.PIL ? ["image_io_available"] : ["image_io_missing"] }
];

const runner = createDirectDiffusersFrameRunner({
  modelLabel: modelLabel ?? "local-checkpoint-missing",
  outputDirRef: safeOutputDirRef,
  components
});

const sampleRecords = sourceSamples.map((sample) => ({
  sampleId: sample.sampleId,
  sampleKind: sample.sampleKind,
  sourceRef: sample.sourceRef,
  baselineV39Ref: sample.baselineV39Ref,
  consentBoundary: sample.consentBoundary,
  licenseStatus: sample.licenseStatus,
  retentionRule: sample.retentionRule,
  reasonCodes: [
    ...sample.reasonCodes,
    fileExists(sample.sourceRef) ? "source_ref_exists_or_not_required" : "source_ref_missing",
    fileExists(sample.baselineV39Ref) ? "baseline_ref_exists_or_not_required" : "baseline_ref_missing"
  ]
}));

const testedSamples = sourceSamples.filter((sample) => sample.sampleKind === "tested_cat");
const maskCropPlans = testedSamples.map((sample) => ({
  sampleId: sample.sampleId,
  cropStrategy: "subject_centered_square_crop",
  maskStrategy: "subject_silhouette_or_alpha_hint",
  safePreviewRef: sample.sourceRef,
  reasonCodes: ["subject_mask_crop_plan_defined", "raw_photo_bytes_not_recorded"]
}));
const identityAnchorPacks = testedSamples.map((sample) => ({
  sampleId: sample.sampleId,
  anchors: sample.identityAnchors,
  sameCatRequirement: true,
  reasonCodes: ["identity_anchor_pack_defined", "same_cat_requirement_defined"]
}));
const actionPoseConditionPacks = V40_NO_WEBUI_ACTION_IDS.map((actionId) => ({
  actionId,
  poseIntent: actionPoseTemplates[actionId],
  forbiddenFallback: "whole_image_transform",
  reasonCodes: ["action_pose_condition_defined", "transform_only_motion_forbidden"]
}));
const visualReviewRubric = {
  rejectPhotoCardOutput: true,
  rejectIdentityDrift: true,
  rejectWeakActionSemantics: true,
  rejectUnsafeArtifacts: true,
  requireDesktopScaleReadability: true,
  requirePreferenceOverV39: true
};

const orchestrator = createLocalImageCandidateOrchestrator({
  selectedRoute: "new_direct_runner_route_allowed",
  samples: sampleRecords,
  maskCropPlans,
  identityAnchorPacks,
  actionPoseConditionPacks,
  actionNameMapping: V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING,
  runner,
  visualReviewRubric
});
const summary = {
  phase: "V40.3R5",
  decision: orchestrator.decision,
  selectedRoute: "new_direct_runner_route_allowed",
  sampleMatrix: sampleRecords,
  sourceLicenseRecords: sourceSamples.map((sample) => ({
    sampleId: sample.sampleId,
    sourceLicenseSummary: sample.sourceLicenseSummary,
    licenseStatus: sample.licenseStatus,
    retentionRule: sample.retentionRule
  })),
  modelControlInventory: {
    modelLabel: modelLabel ?? "local-checkpoint-missing",
    components
  },
  maskCropPlans,
  identityAnchorPacks,
  actionPoseConditionPacks,
  actionNameMapping: V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING,
  safeRunnerInvocation: {
    runnerId: runner.runnerId,
    route: runner.route,
    outputDirRef: runner.outputDirRef,
    generationAllowed: runner.generationAllowed,
    redactionBoundary: runner.redactionBoundary
  },
  visualReviewRubric,
  generationMayStart: orchestrator.generationMayStart,
  reasonCodes: orchestrator.reasonCodes
};
const claimScan = runV40NoWebUIClaimScan(summary);
const securityScan = runV40NoWebUISecurityScan(summary);
const finalDecision = claimScan.status === "passed" && securityScan.status === "passed"
  ? orchestrator.decision
  : "failed";

const prePhaseBody = [
  "# V40.3R5 Pre-Phase Development And Acceptance Plan",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Objective",
  "Prepare the constrained Direct Local Runner route for one later bounded generation attempt. This phase does not generate candidate images and does not unlock V40.4.",
  "",
  "## Controlling PRD And Specs",
  "- PRD: docs/active/agent_desktop_pet_prd_v40.md.",
  "- Phase spec: docs/V40.x/v40-phase-specs.md.",
  "- Contract: docs/V40.x/v40-implementation-contract.md.",
  "- Evidence checklist: docs/V40.x/v40-evidence-and-scan-checklist.md.",
  "",
  "## Development Plan",
  "- Close the code-entity drift by adding concrete V40 no-WebUI orchestrator and direct-model adapter boundaries.",
  "- Build a real sample matrix from V38/V39 tested public samples.",
  "- Audit local model, control component, output directory, and runner redaction boundaries.",
  "- Define mask/crop plans, identity anchors, eight action pose controls, action-name mapping, and visual rubric before generation.",
  "",
  "## Acceptance Plan",
  "- Pass only when all R5 artifacts exist as safe summaries or safe relative references and scans pass.",
  "- Block when local model/control components, sample source/license evidence, or runner invocation are unavailable.",
  "- Fail when evidence uses prompt-only, template GIF, whole-image transform, WebUI/ComfyUI, provider output, unsafe refs, or forbidden claims.",
  "",
  "## Audit Closure",
  "- Finding: V40 docs referenced LocalImageCandidateOrchestrator and DirectLocalImageModelAdapter while code lacked matching entities.",
  "- Closure: R5 implementation adds the concrete V40 local orchestrator and direct local image model boundaries before the audit can pass.",
  "",
  "## Human Risk Boundary",
  "- No human confirmation is required for R5 because it only records pre-generation audit state.",
  "- Human confirmation is required later if generated R6 assets are visually marginal but automation attempts to treat them as acceptable."
].join("\n");

const evidenceBody = [
  "# V40.3R5 Direct Runner Predev Audit Evidence",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Decision",
  `- Status: ${finalDecision}.`,
  "- Scope: pre-generation audit only.",
  "- V40.4 entry: No-Go.",
  "",
  "## PRD / Spec Review",
  "- V40.3R4 selected constrained `new_direct_runner_route_allowed`.",
  "- R5 may only prove or block pre-generation readiness.",
  "- R6 may start only when R5 is `passed scoped`.",
  "- This evidence does not accept any generated asset and does not prove product readiness.",
  "",
  "## Sample Matrix",
  ...sampleRecords.map((sample) => `- ${sample.sampleId}: ${sample.sampleKind}; license ${sample.licenseStatus}; source ${sample.sourceRef ?? "none"}; baseline ${sample.baselineV39Ref ?? "none"}; reasons ${sample.reasonCodes.join(", ")}.`),
  "",
  "## Local Model / Control Inventory",
  `- Model summary: ${modelLabel ?? "local-checkpoint-missing"}.`,
  ...components.map((component) => `- ${component.componentId}: ${component.status}; label ${component.safeLabel}; reasons ${component.reasonCodes.join(", ")}.`),
  "",
  "## Mask / Crop Plans",
  ...maskCropPlans.map((plan) => `- ${plan.sampleId}: ${plan.cropStrategy}; ${plan.maskStrategy}; preview ${plan.safePreviewRef}; reasons ${plan.reasonCodes.join(", ")}.`),
  "",
  "## Identity Anchor Packs",
  ...identityAnchorPacks.map((pack) => `- ${pack.sampleId}: ${pack.anchors.join(", ")}; reasons ${pack.reasonCodes.join(", ")}.`),
  "",
  "## Action Pose Condition Packs",
  ...actionPoseConditionPacks.map((pack) => `- ${pack.actionId}: ${pack.poseIntent}; fallback rejected ${pack.forbiddenFallback}.`),
  "",
  "## Action Name Mapping",
  ...Object.entries(V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING).map(([state, action]) => `- ${state} -> ${action}`),
  "",
  "## Safe Runner Invocation",
  `- Runner: ${runner.runnerId}.`,
  `- Route: ${runner.route}.`,
  `- Output dir ref: ${runner.outputDirRef || "none"}.`,
  `- Generation allowed for next phase: ${runner.generationAllowed ? "yes" : "no"}.`,
  "- Redaction: safe relative refs only; unredacted prompt text, unredacted runner request bodies, binary image content, source photo bytes, local absolute paths, and terminal transcripts are not written to evidence.",
  "",
  "## Visual Review Rubric",
  "- Reject photo-card output.",
  "- Reject identity drift.",
  "- Reject weak action semantics.",
  "- Reject unsafe artifacts.",
  "- Require desktop-scale readability.",
  "- Require preference over same-sample V39.",
  "",
  "## Claim Scan",
  `- Status: ${claimScan.status}.`,
  `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}.`,
  "",
  "## Security Scan",
  `- Status: ${securityScan.status}.`,
  `- Hits: ${securityScan.hits.length === 0 ? "none" : securityScan.hits.join(", ")}.`,
  "",
  "## Final Phase Result",
  `- Decision: ${finalDecision}.`,
  `- Reason codes: ${orchestrator.reasonCodes.join(", ")}.`
].join("\n");

writeText(prePhaseRef, prePhaseBody);
writeText(evidenceRef, evidenceBody);
writeJson(summaryRef, {
  ...summary,
  claimScan,
  securityScan,
  evidencePath: evidenceRef,
  prePhasePlanPath: prePhaseRef,
  decision: finalDecision
});

console.log(JSON.stringify({
  ok: finalDecision === "passed scoped",
  phase: "V40.3R5",
  decision: finalDecision,
  evidencePath: evidenceRef,
  prePhasePlanPath: prePhaseRef,
  claimScanStatus: claimScan.status,
  securityScanStatus: securityScan.status,
  reasonCodes: orchestrator.reasonCodes
}, null, 2));

if (finalDecision !== "passed scoped") process.exitCode = 1;
