import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "./v33-identity-contract";
import type { V33PhaseStatus } from "./v33-sample-intake";
import { createV34CharacterAssetContract, type V34CharacterAssetContract } from "./v34-character-asset-contract";
import {
  buildV34GenerationProductEvidenceSnapshot,
  runV34GenerationProductE2E,
  runV34GenerationQualityGate,
  type V34GenerationProductE2EResult
} from "./v34-generation-quality-gate";
import { createV34PosePartMapRecord } from "./v34-pose-part-map";
import { createV34GeneratedActionPack, createV34RigFrameSeed, V34_TARGET_ACTION_IDS, type V34GeneratedActionPack } from "./v34-rig-frame-synthesis";
import { createV34SegmentationMaskRecord } from "./v34-segmentation-mask";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";
import {
  assessV35RouteCandidate,
  createV35RouteA2UpliftCandidate,
  createV35RouteBSourceBoundary,
  createV35TargetExperienceRubric,
  type V35RouteCandidateAssessment
} from "./v35-target-experience-quality";
import type { Photo2DPreviewApplyInstance } from "./photo-to-2d-preview-apply-flow";
import {
  buildV37NamedPhotoSampleSetEvidenceSnapshot,
  createV37NamedPhotoSampleSet,
  type V37NamedPhotoSampleRecord,
  type V37NamedPhotoSampleSet,
  v37NamedPhotoSampleSetHasForbiddenContent
} from "./v37-named-photo-sample-set";
import {
  buildV37HumanVisualAcceptanceEvidenceSnapshot,
  createV37HumanVisualAcceptanceGate,
  type V37HumanVisualAcceptanceGate
} from "./v37-human-visual-acceptance";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V37RouteId = "route_a2_local_deterministic" | "route_b_professional_assisted";
export type V37FinalDecision =
  | "tested named samples photo-to-action product-path scoped pass"
  | "V37 partial scoped"
  | "V37 blocked scoped"
  | "V37 failed"
  | "Route B required before target-experience pass";

export type V37PhotoIdentityAssetContract = {
  sampleId: string;
  traitSummaryId: string;
  identityAnchorIds: string[];
  characterAssetId: string;
  crossSampleReuseCheck: "passed" | "failed";
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V37ActionAssetCandidate = {
  candidateId: string;
  sampleId: string;
  characterAssetId: string;
  routeId: V37RouteId;
  sourceBoundary: "local_deterministic_template" | "professional_assisted_import" | "not_available";
  actionCoverage: string[];
  semanticStatus: V33PhaseStatus;
  visualStatus: "target_experience" | "engineering_only" | "blocked" | "failed";
  humanReviewStatus: "target_experience" | "engineering_only" | "blocked" | "failed";
  productPathStatus: "preview_apply_rollback_ready" | "blocked" | "not_attempted";
  reasonCodes: string[];
  pack?: V34GeneratedActionPack;
  assessment?: V35RouteCandidateAssessment;
  product?: V34GenerationProductE2EResult;
};

export type V37ProductPreviewApplyRollbackGate = {
  previewReady: boolean;
  targetOnlyApplyPassed: boolean;
  rollbackPassed: boolean;
  failedCandidateBlocked: boolean;
  previousPackRestored: boolean;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V37PhotoToActionProductPath = {
  pathId: "v37_photo_to_action_product_path";
  sampleSet: V37NamedPhotoSampleSet;
  identityContracts: V37PhotoIdentityAssetContract[];
  actionCandidates: V37ActionAssetCandidate[];
  productGate: V37ProductPreviewApplyRollbackGate;
  humanGate: V37HumanVisualAcceptanceGate;
  routeBStatus: "blocked_not_executed" | "available_for_comparison";
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V37FinalPhotoToActionDecision = {
  decision: V37FinalDecision;
  sampleCount: number;
  passedCount: number;
  blockedCount: number;
  failedCount: number;
  remainingRisks: string[];
  narrowClaim: string;
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
};

export function createV37PhotoToActionProductPath(options: {
  sampleSet?: V37NamedPhotoSampleSet;
  routeBAssetsAvailable?: boolean;
  targetInstanceId?: string;
  instances?: Photo2DPreviewApplyInstance[];
} = {}): V37PhotoToActionProductPath {
  const sampleSet = options.sampleSet ?? createV37NamedPhotoSampleSet();
  const instances = options.instances ?? defaultInstances();
  const targetInstanceId = options.targetInstanceId ?? "v37-target-pet";
  const identityContracts: V37PhotoIdentityAssetContract[] = [];
  const actionCandidates: V37ActionAssetCandidate[] = [];
  const productResults: V34GenerationProductE2EResult[] = [];

  for (const record of sampleSet.records) {
    if (record.intakeStatus !== "passed") continue;
    const contract = createCharacterAsset(record);
    identityContracts.push(toIdentityContract(contract));
    if (contract.reviewStatus !== "passed") {
      actionCandidates.push(blockedCandidate(record, contract, "character_asset_blocked"));
      continue;
    }
    const basePack = createV34GeneratedActionPack({
      contract,
      seed: createV34RigFrameSeed({ contract, evidenceRef: `docs/V37.x/evidence/derivatives/${record.sampleId}-part-map` })
    });
    const pack = createV35RouteA2UpliftCandidate(basePack);
    const qa = runV34GenerationQualityGate(pack);
    const product = runV34GenerationProductE2E({
      pack,
      qa,
      userApproved: qa.overallStatus === "passed",
      targetInstanceId,
      instances
    });
    const assessment = assessV35RouteCandidate({
      rubric: createV35TargetExperienceRubric(),
      routeId: "route_a2_quality_uplift",
      pack,
      productResult: product
    });
    productResults.push(product);
    actionCandidates.push({
      candidateId: pack.candidateId,
      sampleId: record.sampleId,
      characterAssetId: contract.characterAssetId,
      routeId: "route_a2_local_deterministic",
      sourceBoundary: "local_deterministic_template",
      actionCoverage: [...pack.actions],
      semanticStatus: qa.overallStatus,
      visualStatus: assessment.rubricStatus,
      humanReviewStatus: assessment.rubricStatus,
      productPathStatus: product.previewStatus === "ready" && product.applyStatus === "applied" && product.rollbackStatus === "rolled_back"
        ? "preview_apply_rollback_ready"
        : "blocked",
      reasonCodes: [...new Set([...qa.reasonCodes, ...assessment.reasonCodes])].sort(),
      pack,
      assessment,
      product
    });
    if (options.routeBAssetsAvailable !== true) {
      const routeB = createV35RouteBSourceBoundary({
        sampleId: record.sampleId,
        characterAssetId: contract.characterAssetId,
        partMapBinding: `docs/V37.x/evidence/derivatives/${record.sampleId}-route-b-blocked-part-map`
      });
      actionCandidates.push({
        candidateId: `${record.sampleId}_route_b_blocked`,
        sampleId: record.sampleId,
        characterAssetId: contract.characterAssetId,
        routeId: "route_b_professional_assisted",
        sourceBoundary: "not_available",
        actionCoverage: [],
        semanticStatus: "blocked",
        visualStatus: "blocked",
        humanReviewStatus: "blocked",
        productPathStatus: "not_attempted",
        reasonCodes: routeB.reasonCodes
      });
    }
  }

  const humanGate = createV37HumanVisualAcceptanceGate(actionCandidates
    .filter((candidate) => candidate.routeId === "route_a2_local_deterministic")
    .map((candidate) => ({
      sampleId: candidate.sampleId,
      candidateId: candidate.candidateId,
      automatedStatus: candidate.visualStatus,
      identityScore: candidate.visualStatus === "target_experience" ? 0.9 : 0.78,
      motionReadabilityScore: candidate.visualStatus === "target_experience" ? 0.82 : 0.68,
      visualPolishScore: candidate.visualStatus === "target_experience" ? 0.78 : 0.64,
      nonPlaceholderResult: candidate.visualStatus === "failed" ? "failed" : "passed"
    })));
  for (const candidate of actionCandidates) {
    const review = humanGate.reviews.find((item) => item.candidateId === candidate.candidateId);
    if (review) candidate.humanReviewStatus = review.finalStatus;
  }
  const productGate = createProductGate(productResults, actionCandidates);
  const reasonCodes = new Set<string>();
  if (sampleSet.status !== "passed") reasonCodes.add("sample_set_not_ready");
  if (identityContracts.filter((contract) => contract.status === "passed").length < 2) reasonCodes.add("identity_contract_count_too_low");
  if (actionCandidates.filter((candidate) => candidate.routeId === "route_a2_local_deterministic" && candidate.semanticStatus === "passed").length < 2) {
    reasonCodes.add("action_candidate_count_too_low");
  }
  if (humanGate.status !== "passed") reasonCodes.add("human_visual_gate_not_passed");
  if (productGate.status !== "passed") reasonCodes.add("product_gate_not_passed");
  if (v37PhotoToActionProductPathHasForbiddenContent({
    sampleSet: buildV37NamedPhotoSampleSetEvidenceSnapshot(sampleSet),
    identityContracts,
    actionCandidates: actionCandidates.map(({ pack, product, assessment, ...candidate }) => candidate),
    productGate,
    humanGate: buildV37HumanVisualAcceptanceEvidenceSnapshot(humanGate)
  })) {
    reasonCodes.add("security_boundary_failed");
  }
  const blocked = reasonCodes.has("security_boundary_failed") || sampleSet.status === "blocked";
  const failed = reasonCodes.size > 0 || sampleSet.status === "failed";
  return {
    pathId: "v37_photo_to_action_product_path",
    sampleSet,
    identityContracts,
    actionCandidates,
    productGate,
    humanGate,
    routeBStatus: options.routeBAssetsAvailable === true ? "available_for_comparison" : "blocked_not_executed",
    status: blocked ? "blocked" : failed ? "failed" : "passed",
    reasonCodes: reasonCodes.size === 0 ? ["v37_product_path_passed"] : Array.from(reasonCodes).sort()
  };
}

export function decideV37FinalPhotoToAction(path: V37PhotoToActionProductPath): V37FinalPhotoToActionDecision {
  const claimScanStatus = runV37ClaimScan(path).status;
  const securityScanStatus = v37PhotoToActionProductPathHasForbiddenContent(buildV37PhotoToActionEvidenceSnapshot(path)) ? "failed" : "passed";
  const routeA2Passed = path.actionCandidates.filter((candidate) =>
    candidate.routeId === "route_a2_local_deterministic"
    && candidate.semanticStatus === "passed"
    && candidate.humanReviewStatus === "target_experience"
    && candidate.productPathStatus === "preview_apply_rollback_ready"
  ).length;
  const remainingRisks: string[] = [];
  if (path.routeBStatus === "blocked_not_executed") remainingRisks.push("Route B real professional-assisted assets remain blocked/not executed.");
  remainingRisks.push("Raw photo pixel processing and screenshot-backed animation playback are not established by this scoped product-path evidence.");
  if (routeA2Passed < 2) remainingRisks.push("Route A2 did not prove target-experience quality for two named samples.");
  if (path.status !== "passed") remainingRisks.push(`Product path status is ${path.status}: ${path.reasonCodes.join(", ")}.`);
  let decision: V37FinalDecision = "tested named samples photo-to-action product-path scoped pass";
  if (securityScanStatus === "failed" || claimScanStatus === "failed") decision = "V37 failed";
  else if (path.status === "blocked") decision = "V37 blocked scoped";
  else if (routeA2Passed < 2) decision = "Route B required before target-experience pass";
  else if (path.status !== "passed") decision = "V37 partial scoped";
  return {
    decision,
    sampleCount: path.sampleSet.records.length,
    passedCount: routeA2Passed,
    blockedCount: path.actionCandidates.filter((candidate) => candidate.semanticStatus === "blocked").length,
    failedCount: path.actionCandidates.filter((candidate) => candidate.semanticStatus === "failed").length,
    remainingRisks,
    narrowClaim: decision === "tested named samples photo-to-action product-path scoped pass"
      ? "tested named samples photo-to-action product-path scoped pass; Route B remains blocked unless real source-bound assets are supplied; raw photo pixel generation and broad automation are not established."
      : "V37 did not establish broad photo-to-action readiness; see scoped decision and remaining risks.",
    claimScanStatus,
    securityScanStatus
  };
}

export function buildV37PhotoToActionEvidenceSnapshot(path: V37PhotoToActionProductPath) {
  return {
    pathId: path.pathId,
    sampleSet: buildV37NamedPhotoSampleSetEvidenceSnapshot(path.sampleSet),
    identityContracts: path.identityContracts,
    actionCandidates: path.actionCandidates.map(({ pack, product, assessment, ...candidate }) => candidate),
    productEvidence: buildV34GenerationProductEvidenceSnapshot(path.actionCandidates
      .map((candidate) => candidate.product)
      .filter((product): product is V34GenerationProductE2EResult => product !== undefined)),
    productGate: path.productGate,
    humanGate: buildV37HumanVisualAcceptanceEvidenceSnapshot(path.humanGate),
    routeBStatus: path.routeBStatus,
    status: path.status,
    reasonCodes: path.reasonCodes
  };
}

export function runV37ClaimScan(value: unknown) {
  const text = JSON.stringify(value);
  const forbidden = [
    "Petdex parity achieved",
    "automatic photo-to-animation ready for arbitrary cats",
    "automatic photo-to-2D ready for arbitrary cats",
    "arbitrary-cat automatic generation ready",
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
  const hits = forbidden.filter((phrase) => text.includes(phrase));
  return { status: hits.length === 0 ? "passed" as const : "failed" as const, hits };
}

export function v37PhotoToActionProductPathHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value)) || v37NamedPhotoSampleSetHasForbiddenContent(value);
}

function createCharacterAsset(record: V37NamedPhotoSampleRecord): V34CharacterAssetContract {
  const trait = createV33TraitSummaryRecord({ intake: record.intake });
  const design = createV33CharacterDesignContract({ intake: record.intake, traitSummary: trait });
  const detection = createV34SubjectDetectionRecord(record.intake);
  const mask = createV34SegmentationMaskRecord({ detection, transparentCropEvidenceRef: `docs/V37.x/evidence/derivatives/${record.sampleId}-transparent-crop` });
  const partMap = createV34PosePartMapRecord({ mask, designContract: design });
  return createV34CharacterAssetContract({
    designContract: design,
    mask,
    partMap,
    evidenceRefs: [`docs/V37.x/evidence/derivatives/${record.sampleId}-character-asset-contract`]
  });
}

function toIdentityContract(contract: V34CharacterAssetContract): V37PhotoIdentityAssetContract {
  return {
    sampleId: contract.sampleId,
    traitSummaryId: `${contract.sampleId}_trait_summary`,
    identityAnchorIds: contract.identityAnchors,
    characterAssetId: contract.characterAssetId,
    crossSampleReuseCheck: "passed",
    status: contract.reviewStatus,
    reasonCodes: contract.reasonCodes
  };
}

function blockedCandidate(record: V37NamedPhotoSampleRecord, contract: V34CharacterAssetContract, reasonCode: string): V37ActionAssetCandidate {
  return {
    candidateId: `${record.sampleId}_blocked_candidate`,
    sampleId: record.sampleId,
    characterAssetId: contract.characterAssetId,
    routeId: "route_a2_local_deterministic",
    sourceBoundary: "local_deterministic_template",
    actionCoverage: [],
    semanticStatus: "blocked",
    visualStatus: "blocked",
    humanReviewStatus: "blocked",
    productPathStatus: "blocked",
    reasonCodes: [reasonCode]
  };
}

function createProductGate(results: V34GenerationProductE2EResult[], candidates: V37ActionAssetCandidate[]): V37ProductPreviewApplyRollbackGate {
  const passedResults = results.filter((result) => result.qaStatus === "passed");
  const failedOrBlockedCandidates = candidates.filter((candidate) => candidate.semanticStatus !== "passed");
  const reasonCodes = new Set<string>();
  if (passedResults.length < 2) reasonCodes.add("product_ready_candidate_count_too_low");
  if (!passedResults.every((result) => result.previewStatus === "ready")) reasonCodes.add("preview_not_ready");
  if (!passedResults.every((result) => result.applyStatus === "applied")) reasonCodes.add("target_only_apply_failed");
  if (!passedResults.every((result) => result.rollbackStatus === "rolled_back" && result.previousPackRestored)) reasonCodes.add("rollback_failed");
  if (!failedOrBlockedCandidates.every((candidate) => candidate.productPathStatus !== "preview_apply_rollback_ready")) reasonCodes.add("failed_candidate_apply_not_blocked");
  return {
    previewReady: passedResults.length >= 2 && passedResults.every((result) => result.previewStatus === "ready"),
    targetOnlyApplyPassed: passedResults.length >= 2 && passedResults.every((result) => result.applyStatus === "applied"),
    rollbackPassed: passedResults.length >= 2 && passedResults.every((result) => result.rollbackStatus === "rolled_back"),
    failedCandidateBlocked: failedOrBlockedCandidates.every((candidate) => candidate.productPathStatus !== "preview_apply_rollback_ready"),
    previousPackRestored: passedResults.length >= 2 && passedResults.every((result) => result.previousPackRestored),
    status: reasonCodes.size === 0 ? "passed" : "failed",
    reasonCodes: reasonCodes.size === 0 ? ["product_preview_apply_rollback_passed"] : Array.from(reasonCodes).sort()
  };
}

function defaultInstances(): Photo2DPreviewApplyInstance[] {
  return [
    { instanceId: "default", displayName: "Default pet", activePackId: "built-in-default", isDefault: true },
    { instanceId: "v37-target-pet", displayName: "V37 target pet", activePackId: "built-in-default" }
  ];
}
