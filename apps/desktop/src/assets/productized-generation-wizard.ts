import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import {
  buildV26PackPreviewApplyEvidenceSnapshot,
  runV26PackPreviewApplyRollback,
  v26FrameSet,
  type V26PackPreviewApplyResult
} from "./pack-preview-apply-rollback";
import {
  buildV29QualityGateEvidenceSnapshot,
  runV29QualityGateV2,
  type V29ActionQualityMetrics,
  type V29QualityGateResult
} from "./quality-gate-v2";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V29WizardState =
  | "photo_required"
  | "checking"
  | "generating"
  | "qa_running"
  | "preview_ready"
  | "apply_ready"
  | "blocked"
  | "applied"
  | "rolled_back";

export type V29WizardReasonCode =
  | "wizard_photo_required"
  | "wizard_generation_ready"
  | "wizard_generation_blocked"
  | "wizard_preview_ready"
  | "qa_failed_candidate_blocked"
  | "apply_target_missing"
  | "apply_target_only_passed"
  | "rollback_passed"
  | "previous_pack_preserved"
  | "security_scan_failed";

export type V29WizardInstance = {
  instanceId: string;
  displayName: string;
  activePackId: string;
  isDefault?: boolean;
};

export type V29ProductizedWizardInput = {
  safeSampleId: string;
  photoSelected: boolean;
  candidateId: string;
  safePackId: string;
  displayName: string;
  candidateMetrics: V29ActionQualityMetrics[];
  userApproved: boolean;
  targetInstanceId: string | null;
  instances: V29WizardInstance[];
};

export type V29ProductizedWizardResult = {
  status: "passed" | "blocked" | "failed";
  states: V29WizardState[];
  reasonCodes: V29WizardReasonCode[];
  safeSampleId: string;
  qualityGate: ReturnType<typeof buildV29QualityGateEvidenceSnapshot>;
  previewApply: ReturnType<typeof buildV26PackPreviewApplyEvidenceSnapshot> | null;
  previewSafety: {
    acceptedPetEvents: 0;
    callsNotify: false;
    writesCatStateMachine: false;
    mutatesLivePetInstance: false;
  };
};

export function runV29ProductizedGenerationWizard(input: V29ProductizedWizardInput): V29ProductizedWizardResult {
  const states: V29WizardState[] = [];
  const reasonCodes = new Set<V29WizardReasonCode>();
  const safeSampleId = safeId(input.safeSampleId, "v29_sample");

  if (!input.photoSelected) {
    states.push("photo_required", "blocked");
    reasonCodes.add("wizard_photo_required");
    reasonCodes.add("previous_pack_preserved");
    return result("blocked", states, reasonCodes, safeSampleId, rejectedQuality(input), null);
  }

  states.push("checking", "generating", "qa_running");
  reasonCodes.add("wizard_generation_ready");

  const qualityGate = runV29QualityGateV2({
    candidateId: input.candidateId,
    safePackId: input.safePackId,
    actions: input.candidateMetrics
  });
  const qualitySnapshot = buildV29QualityGateEvidenceSnapshot(qualityGate);

  if (qualityGate.status !== "accepted") {
    states.push("blocked");
    reasonCodes.add("qa_failed_candidate_blocked");
    reasonCodes.add("previous_pack_preserved");
    return result("blocked", states, reasonCodes, safeSampleId, qualitySnapshot, null);
  }

  states.push("preview_ready");
  reasonCodes.add("wizard_preview_ready");

  if (!input.targetInstanceId) {
    states.push("blocked");
    reasonCodes.add("apply_target_missing");
    reasonCodes.add("previous_pack_preserved");
    return result("blocked", states, reasonCodes, safeSampleId, qualitySnapshot, null);
  }

  states.push("apply_ready");
  const previewApplyRaw = runPreviewApply(input, qualityGate);
  const previewApply = buildV26PackPreviewApplyEvidenceSnapshot(previewApplyRaw);

  if (previewApplyRaw.status !== "passed") {
    states.push("blocked");
    reasonCodes.add("previous_pack_preserved");
    return result("blocked", states, reasonCodes, safeSampleId, qualitySnapshot, previewApply);
  }

  states.push("applied", "rolled_back");
  reasonCodes.add("apply_target_only_passed");
  reasonCodes.add("rollback_passed");

  const finalResult = result("passed", states, reasonCodes, safeSampleId, qualitySnapshot, previewApply);
  if (productizedWizardHasForbiddenContent(finalResult)) {
    return {
      ...finalResult,
      status: "failed",
      reasonCodes: [...finalResult.reasonCodes, "security_scan_failed"].sort() as V29WizardReasonCode[]
    };
  }
  return finalResult;
}

export function productizedWizardHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function runPreviewApply(input: V29ProductizedWizardInput, qualityGate: V29QualityGateResult): V26PackPreviewApplyResult {
  const actionFrames = CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, loopFrameCount(actionId)));
  return runV26PackPreviewApplyRollback({
    v25Accepted: qualityGate.status === "accepted",
    userApproved: input.userApproved,
    generatedPackId: qualityGate.safePackId,
    displayName: input.displayName,
    actionFrames,
    targetInstanceId: input.targetInstanceId ?? "",
    instances: input.instances
  });
}

function result(
  status: V29ProductizedWizardResult["status"],
  states: V29WizardState[],
  reasonCodes: Set<V29WizardReasonCode>,
  safeSampleId: string,
  qualityGate: V29ProductizedWizardResult["qualityGate"],
  previewApply: V29ProductizedWizardResult["previewApply"]
): V29ProductizedWizardResult {
  return {
    status,
    states,
    reasonCodes: Array.from(reasonCodes).sort(),
    safeSampleId,
    qualityGate,
    previewApply,
    previewSafety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    }
  };
}

function rejectedQuality(input: V29ProductizedWizardInput) {
  return buildV29QualityGateEvidenceSnapshot(runV29QualityGateV2({
    candidateId: input.candidateId,
    safePackId: input.safePackId,
    actions: input.candidateMetrics
  }));
}

function loopFrameCount(actionId: CoreActionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping" ? 6 : 3;
}

function safeId(value: string, fallback: string) {
  return /^[A-Za-z0-9._-]{1,96}$/.test(value) ? value : fallback;
}
