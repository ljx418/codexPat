import { CORE_ACTION_IDS, type AssetManifest, type CoreActionId } from "./asset-manifest";
import {
  adaptV10PetJsonAnimationPack,
  type SafeAnimationPackAdapterOutput,
  type V10PetJsonFrameRect,
  type V10PetJsonPack
} from "./animation-pack-adapter";

export type V19MotionSheetSourceMode =
  | "local_motion_sheet_import"
  | "provider_single_motion_sheet"
  | "provider_independent_actions";

export type V19MotionSheetReasonCode =
  | "accepted"
  | "remote_url_rejected"
  | "absolute_path_rejected"
  | "path_traversal_rejected"
  | "raw_local_path_rejected"
  | "external_href_rejected"
  | "script_field_rejected"
  | "event_handler_rejected"
  | "shell_command_rejected"
  | "credential_field_rejected"
  | "raw_provider_payload_rejected"
  | "prompt_private_text_rejected"
  | "renderer_kind_invalid"
  | "sheet_row_count_invalid"
  | "sheet_column_count_invalid"
  | "action_coverage_incomplete"
  | "blank_action_frames"
  | "frame_off_canvas"
  | "image_decode_failed"
  | "image_size_limit_exceeded"
  | "license_confirmation_required"
  | "provider_motion_sheet_missing"
  | "provider_output_not_single_sheet"
  | "loop_closure_failed"
  | "frame_delta_spike"
  | "same_cat_identity_failed"
  | "scale_readability_failed"
  | "qa_failed_pack_blocked"
  | "target_pet_required"
  | "pet_instance_not_found"
  | "activation_failed"
  | "previous_pack_preserved"
  | "rollback_succeeded"
  | "field_invalid"
  | "manifest_import_failed";

export type V19MotionSheetActionSpec = {
  actionId: CoreActionId;
  row: number;
  frameStart: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  fallbackActionId: CoreActionId;
};

export type V19MotionSheetQaMetrics = {
  actionId: CoreActionId;
  nonblank: boolean;
  offCanvas: boolean;
  firstFinalClosed: boolean;
  meanFrameDelta: number;
  maxFrameDelta: number;
  bboxCenterShiftPx: number;
  bboxAreaChangeRatio: number;
  uniquePoseCount: number;
  sameCatState: "passed" | "failed";
  scaleReadability: "passed" | "failed";
};

export type V19MotionSheetInput = {
  schemaVersion: "19.0";
  packId: string;
  displayName: string;
  rendererKind: "sprite" | "frameSequence";
  sourceMode: V19MotionSheetSourceMode;
  licenseConfirmation: boolean;
  layout: {
    rows: number;
    columns: number;
    frameWidth: number;
    frameHeight: number;
    fileName: string;
    imageType: "png" | "webp";
  };
  actions: V19MotionSheetActionSpec[];
  qa: V19MotionSheetQaMetrics[];
};

export type V19MotionSheetIssue = {
  reasonCode: Exclude<V19MotionSheetReasonCode, "accepted" | "rollback_succeeded">;
  field: string;
};

export type V19MotionSheetActionQaResult = V19MotionSheetQaMetrics & {
  amplitudeState: "passed" | "failed";
  reasonCode: V19MotionSheetReasonCode;
};

export type V19MotionSheetValidationResult =
  | {
    status: "accepted";
    reasonCode: "accepted";
    packId: string;
    petJson: V10PetJsonPack;
    manifest: AssetManifest;
    safeRendererOutput: SafeAnimationPackAdapterOutput;
    qaTable: Record<CoreActionId, V19MotionSheetActionQaResult>;
    safeOutputFields: readonly string[];
    issues: [];
    preservedPreviousActivePack: false;
  }
  | {
    status: "rejected" | "blocked";
    reasonCode: Exclude<V19MotionSheetReasonCode, "accepted" | "rollback_succeeded">;
    packId: string;
    qaTable: Partial<Record<CoreActionId, V19MotionSheetActionQaResult>>;
    issues: V19MotionSheetIssue[];
    preservedPreviousActivePack: true;
  };

export type V19PetInstanceAssignment = {
  instanceId: string;
  displayName: string;
  activePackId: string;
  isDefault?: boolean;
};

export type V19MotionSheetPreviewFlow =
  | {
    status: "ready";
    reasonCode: "accepted";
    packId: string;
    targetInstanceId: string;
    previewActions: Array<{
      actionId: CoreActionId;
      coverageState: "animated";
      frameCount: number;
      amplitudeState: "passed";
      fallbackActionId: CoreActionId;
    }>;
    previewSafety: {
      acceptedPetEvents: 0;
      callsNotify: false;
      writesCatStateMachine: false;
      mutatesLivePetInstance: false;
    };
    safeRendererInputFields: string[];
    beforeAssignments: Record<string, string>;
  }
  | {
    status: "blocked";
    reasonCode: Exclude<V19MotionSheetReasonCode, "accepted" | "rollback_succeeded">;
    packId: string;
    targetInstanceId?: string;
    previousPackPreserved: true;
  };

export type V19MotionSheetApplyResult =
  | {
    status: "applied";
    reasonCode: "accepted";
    packId: string;
    targetInstanceId: string;
    afterAssignments: Record<string, string>;
    targetChanged: true;
    defaultPetUnchanged: boolean;
    unrelatedPetsUnchanged: boolean;
    acceptedPetEvents: 0;
    callsNotify: false;
    writesCatStateMachine: false;
  }
  | {
    status: "rolled_back";
    reasonCode: "rollback_succeeded";
    packId: string;
    targetInstanceId: string;
    afterAssignments: Record<string, string>;
  }
  | {
    status: "blocked";
    reasonCode: Exclude<V19MotionSheetReasonCode, "accepted" | "rollback_succeeded">;
    packId: string;
    targetInstanceId?: string;
    previousPackPreserved: true;
  };

const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const SAFE_DISPLAY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,79}$/;
const SAFE_SHEET_FILE_PATTERN = /^[a-z0-9][a-z0-9._-]{0,95}\.(png|webp)$/;
const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const PATH_ESCAPE_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
const EXTERNAL_HREF_KEY_PATTERN = /href/i;
const SCRIPT_KEY_PATTERN = /(?:script|javascript|eval|function)/i;
const EVENT_HANDLER_KEY_PATTERN = /^on[A-Z_a-z-]/;
const SHELL_KEY_PATTERN = /(?:shell|command|exec|spawn|bash|zsh|powershell|curl|chmod)/i;
const CREDENTIAL_KEY_PATTERN = /(?:token|authorization|credential|apikey|api_key|secret)/i;
const RAW_PROVIDER_KEY_PATTERN = /(?:raw.*provider|provider.*payload|raw.*payload|http.*payload)/i;
const PROMPT_TEXT_KEY_PATTERN = /(?:prompt|promptText|privateText)/i;
const SHEET_ROWS = 8;
const SHEET_COLUMNS = 9;
const MAX_SHEET_EDGE = 4096;
const REQUIRED_AMPLITUDE_ACTIONS = new Set<CoreActionId>(["running", "success", "error", "need_input"]);

export function validateV19MotionSheet(input: unknown): V19MotionSheetValidationResult {
  const packId = safePackId(input);
  const issues: V19MotionSheetIssue[] = [];

  if (!isRecord(input)) {
    return rejected(packId, "field_invalid", [{ field: "$", reasonCode: "field_invalid" }], {});
  }

  scanForbidden(input, "$", issues);
  validateTopLevel(input, issues);

  const qaTable = buildQaTable(input);
  const qaIssues = validateQaTable(qaTable);
  issues.push(...qaIssues);

  if (issues.length > 0) {
    const reason = issues[0].reasonCode;
    const status = reason === "provider_motion_sheet_missing" || reason === "provider_output_not_single_sheet"
      ? "blocked"
      : "rejected";
    return {
      status,
      reasonCode: reason,
      packId,
      qaTable,
      issues,
      preservedPreviousActivePack: true
    };
  }

  const petJson = buildPetJson(input as V19MotionSheetInput);
  const adapted = adaptV10PetJsonAnimationPack(petJson);
  if (!adapted.ok || !adapted.manifest || !adapted.safeOutput) {
    return rejected(packId, "manifest_import_failed", [
      { field: "petJson", reasonCode: "manifest_import_failed" }
    ], qaTable);
  }

  return {
    status: "accepted",
    reasonCode: "accepted",
    packId,
    petJson,
    manifest: adapted.manifest,
    safeRendererOutput: adapted.safeOutput,
    qaTable: qaTable as Record<CoreActionId, V19MotionSheetActionQaResult>,
    safeOutputFields: V19_SAFE_OUTPUT_FIELDS,
    issues: [],
    preservedPreviousActivePack: false
  };
}

export function activateV19MotionSheetPack(
  currentManifest: AssetManifest,
  candidate: unknown
) {
  const result = validateV19MotionSheet(candidate);
  if (result.status !== "accepted") {
    return {
      activeManifest: currentManifest,
      validation: result,
      preservedPrevious: true as const
    };
  }
  return {
    activeManifest: result.manifest,
    validation: result,
    preservedPrevious: false as const
  };
}

export function createV19MotionSheetPreviewFlow(options: {
  validation: V19MotionSheetValidationResult;
  targetInstanceId?: string;
  instances: V19PetInstanceAssignment[];
}): V19MotionSheetPreviewFlow {
  const validation = options.validation;
  const packId = validation.packId;
  if (validation.status !== "accepted") {
    return blockedPreview(packId, validation.reasonCode, options.targetInstanceId);
  }
  if (!options.targetInstanceId || !SAFE_ID_PATTERN.test(options.targetInstanceId)) {
    return blockedPreview(packId, "target_pet_required", options.targetInstanceId);
  }
  if (!options.instances.some((item) => item.instanceId === options.targetInstanceId)) {
    return blockedPreview(packId, "pet_instance_not_found", options.targetInstanceId);
  }

  return {
    status: "ready",
    reasonCode: "accepted",
    packId,
    targetInstanceId: options.targetInstanceId,
    previewActions: CORE_ACTION_IDS.map((actionId) => ({
      actionId,
      coverageState: "animated" as const,
      frameCount: validation.safeRendererOutput.actions[actionId].frameCount,
      amplitudeState: "passed" as const,
      fallbackActionId: "idle" as const
    })),
    previewSafety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    },
    safeRendererInputFields: [
      "safeActionId",
      "rendererKind",
      "safePackId",
      "playbackIntent",
      "scale",
      "visibility"
    ],
    beforeAssignments: assignmentMap(options.instances)
  };
}

export function applyV19MotionSheetToTarget(flow: V19MotionSheetPreviewFlow): V19MotionSheetApplyResult {
  if (flow.status !== "ready") {
    return {
      status: "blocked",
      reasonCode: flow.reasonCode,
      packId: flow.packId,
      targetInstanceId: flow.targetInstanceId,
      previousPackPreserved: true
    };
  }

  const afterAssignments = { ...flow.beforeAssignments, [flow.targetInstanceId]: flow.packId };
  return {
    status: "applied",
    reasonCode: "accepted",
    packId: flow.packId,
    targetInstanceId: flow.targetInstanceId,
    afterAssignments,
    targetChanged: true,
    defaultPetUnchanged: flow.targetInstanceId === "default" || flow.beforeAssignments.default === afterAssignments.default,
    unrelatedPetsUnchanged: Object.entries(flow.beforeAssignments)
      .filter(([instanceId]) => instanceId !== flow.targetInstanceId)
      .every(([instanceId, packId]) => afterAssignments[instanceId] === packId),
    acceptedPetEvents: 0,
    callsNotify: false,
    writesCatStateMachine: false
  };
}

export function rollbackV19MotionSheet(flow: V19MotionSheetPreviewFlow): V19MotionSheetApplyResult {
  if (flow.status !== "ready") {
    return {
      status: "blocked",
      reasonCode: flow.reasonCode,
      packId: flow.packId,
      targetInstanceId: flow.targetInstanceId,
      previousPackPreserved: true
    };
  }
  return {
    status: "rolled_back",
    reasonCode: "rollback_succeeded",
    packId: flow.packId,
    targetInstanceId: flow.targetInstanceId,
    afterAssignments: { ...flow.beforeAssignments }
  };
}

export function buildV19MotionSheetEvidenceSnapshot(
  validation: V19MotionSheetValidationResult,
  preview?: V19MotionSheetPreviewFlow,
  apply?: V19MotionSheetApplyResult
) {
  return {
    status: validation.status,
    reasonCode: validation.reasonCode,
    packId: validation.packId,
    actionCoverage: CORE_ACTION_IDS.filter((actionId) => validation.qaTable[actionId]),
    qaTable: Object.fromEntries(Object.entries(validation.qaTable).map(([actionId, item]) => [actionId, {
      actionId: item.actionId,
      nonblank: item.nonblank,
      offCanvas: item.offCanvas,
      firstFinalClosed: item.firstFinalClosed,
      meanFrameDelta: item.meanFrameDelta,
      maxFrameDelta: item.maxFrameDelta,
      bboxCenterShiftPx: item.bboxCenterShiftPx,
      bboxAreaChangeRatio: item.bboxAreaChangeRatio,
      uniquePoseCount: item.uniquePoseCount,
      sameCatState: item.sameCatState,
      scaleReadability: item.scaleReadability,
      amplitudeState: item.amplitudeState,
      reasonCode: item.reasonCode
    }])),
    issueTable: validation.issues.map((item) => ({
      reasonCode: item.reasonCode,
      field: item.field
    })),
    preservedPreviousActivePack: validation.preservedPreviousActivePack,
    safeOutputFields: validation.status === "accepted" ? validation.safeOutputFields : [],
    previewStatus: preview?.status ?? "not-run",
    previewReasonCode: preview?.reasonCode ?? "previous_pack_preserved",
    previewActionCount: preview?.status === "ready" ? preview.previewActions.length : 0,
    previewSafety: preview?.status === "ready" ? preview.previewSafety : {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    },
    safeRendererInputFields: preview?.status === "ready" ? preview.safeRendererInputFields : [],
    applyStatus: apply?.status ?? "not-run",
    applyReasonCode: apply?.reasonCode ?? "previous_pack_preserved",
    targetChanged: apply?.status === "applied" ? apply.targetChanged : false,
    defaultPetUnchanged: apply?.status === "applied" ? apply.defaultPetUnchanged : true,
    unrelatedPetsUnchanged: apply?.status === "applied" ? apply.unrelatedPetsUnchanged : true
  };
}

export function v19EvidenceHasForbiddenContent(value: unknown) {
  return /Authorization|api-token\.json|raw payload|raw provider response|raw photo|prompt private|prompt text|\/Users\/|\/private\/|\/Volumes\/|workspace path|config path|sk-[A-Za-z0-9_-]{8,}|https?:\/\/|file:\/\//i.test(JSON.stringify(value));
}

export const V19_SAFE_OUTPUT_FIELDS = [
  "packId",
  "rendererKind",
  "actions.actionId",
  "actions.assetId",
  "actions.frameCount",
  "actions.fps",
  "actions.loop",
  "actions.transient",
  "actions.durationMs",
  "actions.fallbackActionId"
] as const;

function validateTopLevel(input: Record<string, unknown>, issues: V19MotionSheetIssue[]) {
  if (input.sourceMode === "provider_independent_actions") {
    issues.push({ field: "sourceMode", reasonCode: "provider_output_not_single_sheet" });
  }
  if (input.sourceMode === "provider_single_motion_sheet" && !input.layout) {
    issues.push({ field: "layout", reasonCode: "provider_motion_sheet_missing" });
  }
  if (input.schemaVersion !== "19.0") {
    issues.push({ field: "schemaVersion", reasonCode: "field_invalid" });
  }
  if (typeof input.packId !== "string" || !SAFE_ID_PATTERN.test(input.packId)) {
    issues.push({ field: "packId", reasonCode: "field_invalid" });
  }
  if (typeof input.displayName !== "string" || !SAFE_DISPLAY_PATTERN.test(input.displayName)) {
    issues.push({ field: "displayName", reasonCode: "field_invalid" });
  }
  if (input.rendererKind !== "sprite" && input.rendererKind !== "frameSequence") {
    issues.push({ field: "rendererKind", reasonCode: "renderer_kind_invalid" });
  }
  if (input.licenseConfirmation !== true) {
    issues.push({ field: "licenseConfirmation", reasonCode: "license_confirmation_required" });
  }
  validateLayout(input.layout, issues);
  validateActions(input.actions, issues);
}

function validateLayout(layout: unknown, issues: V19MotionSheetIssue[]) {
  if (!isRecord(layout)) {
    issues.push({ field: "layout", reasonCode: "field_invalid" });
    return;
  }
  if (layout.rows !== SHEET_ROWS) {
    issues.push({ field: "layout.rows", reasonCode: "sheet_row_count_invalid" });
  }
  if (layout.columns !== SHEET_COLUMNS) {
    issues.push({ field: "layout.columns", reasonCode: "sheet_column_count_invalid" });
  }
  if (!Number.isInteger(layout.frameWidth) || Number(layout.frameWidth) < 64 || Number(layout.frameWidth) > 512) {
    issues.push({ field: "layout.frameWidth", reasonCode: "field_invalid" });
  }
  if (!Number.isInteger(layout.frameHeight) || Number(layout.frameHeight) < 64 || Number(layout.frameHeight) > 512) {
    issues.push({ field: "layout.frameHeight", reasonCode: "field_invalid" });
  }
  if (Number(layout.frameWidth) * Number(layout.columns) > MAX_SHEET_EDGE || Number(layout.frameHeight) * Number(layout.rows) > MAX_SHEET_EDGE) {
    issues.push({ field: "layout", reasonCode: "image_size_limit_exceeded" });
  }
  if (typeof layout.fileName !== "string" || !SAFE_SHEET_FILE_PATTERN.test(layout.fileName)) {
    issues.push({ field: "layout.fileName", reasonCode: "field_invalid" });
  }
}

function validateActions(actions: unknown, issues: V19MotionSheetIssue[]) {
  if (!Array.isArray(actions)) {
    issues.push({ field: "actions", reasonCode: "field_invalid" });
    return;
  }
  const byAction = new Map<string, V19MotionSheetActionSpec>();
  for (const action of actions) {
    if (!isRecord(action)) {
      issues.push({ field: "actions", reasonCode: "field_invalid" });
      continue;
    }
    if (typeof action.actionId === "string") {
      byAction.set(action.actionId, action as V19MotionSheetActionSpec);
    }
  }
  for (const [index, action] of actions.entries()) {
    if (!isRecord(action) || !CORE_ACTION_IDS.includes(action.actionId as CoreActionId)) {
      issues.push({ field: `actions[${index}].actionId`, reasonCode: "field_invalid" });
      continue;
    }
    if (!Number.isInteger(action.row) || Number(action.row) < 1 || Number(action.row) > SHEET_ROWS) {
      issues.push({ field: `actions.${action.actionId}.row`, reasonCode: "field_invalid" });
    }
    if (!Number.isInteger(action.frameStart) || Number(action.frameStart) < 0 || Number(action.frameStart) >= SHEET_COLUMNS) {
      issues.push({ field: `actions.${action.actionId}.frameStart`, reasonCode: "field_invalid" });
    }
    if (!Number.isInteger(action.frameCount) || Number(action.frameCount) < 6 || Number(action.frameCount) > SHEET_COLUMNS) {
      issues.push({ field: `actions.${action.actionId}.frameCount`, reasonCode: "action_coverage_incomplete" });
    }
    if (!Number.isInteger(action.fps) || Number(action.fps) < 1 || Number(action.fps) > 24) {
      issues.push({ field: `actions.${action.actionId}.fps`, reasonCode: "field_invalid" });
    }
    if (action.fallbackActionId && !CORE_ACTION_IDS.includes(action.fallbackActionId as CoreActionId)) {
      issues.push({ field: `actions.${action.actionId}.fallbackActionId`, reasonCode: "field_invalid" });
    }
  }
  for (const actionId of CORE_ACTION_IDS) {
    if (!byAction.has(actionId)) {
      issues.push({ field: `actions.${actionId}`, reasonCode: "action_coverage_incomplete" });
    }
  }
}

function buildQaTable(input: Record<string, unknown>) {
  const table: Partial<Record<CoreActionId, V19MotionSheetActionQaResult>> = {};
  if (!Array.isArray(input.qa)) {
    return table;
  }
  for (const item of input.qa) {
    if (!isRecord(item) || !CORE_ACTION_IDS.includes(item.actionId as CoreActionId)) {
      continue;
    }
    const actionId = item.actionId as CoreActionId;
    const metrics = item as unknown as V19MotionSheetQaMetrics;
    const amplitudeState = passesAmplitude(metrics) ? "passed" : "failed";
    table[actionId] = {
      ...metrics,
      amplitudeState,
      reasonCode: amplitudeState === "passed" ? "accepted" : "qa_failed_pack_blocked"
    };
  }
  return table;
}

function validateQaTable(table: Partial<Record<CoreActionId, V19MotionSheetActionQaResult>>) {
  const issues: V19MotionSheetIssue[] = [];
  for (const actionId of CORE_ACTION_IDS) {
    const item = table[actionId];
    if (!item) {
      issues.push({ field: `qa.${actionId}`, reasonCode: "action_coverage_incomplete" });
      continue;
    }
    if (!item.nonblank) {
      issues.push({ field: `qa.${actionId}.nonblank`, reasonCode: "blank_action_frames" });
    }
    if (item.offCanvas) {
      issues.push({ field: `qa.${actionId}.offCanvas`, reasonCode: "frame_off_canvas" });
    }
    if (!item.firstFinalClosed) {
      issues.push({ field: `qa.${actionId}.firstFinalClosed`, reasonCode: "loop_closure_failed" });
    }
    if (item.maxFrameDelta > 160) {
      issues.push({ field: `qa.${actionId}.maxFrameDelta`, reasonCode: "frame_delta_spike" });
    }
    if (item.sameCatState !== "passed") {
      issues.push({ field: `qa.${actionId}.sameCatState`, reasonCode: "same_cat_identity_failed" });
    }
    if (item.scaleReadability !== "passed") {
      issues.push({ field: `qa.${actionId}.scaleReadability`, reasonCode: "scale_readability_failed" });
    }
  }
  const passed = CORE_ACTION_IDS.filter((actionId) => table[actionId]?.amplitudeState === "passed");
  if (passed.length < 6) {
    issues.push({ field: "qa.amplitude", reasonCode: "qa_failed_pack_blocked" });
  }
  for (const actionId of REQUIRED_AMPLITUDE_ACTIONS) {
    if (table[actionId]?.amplitudeState !== "passed") {
      issues.push({ field: `qa.${actionId}.amplitude`, reasonCode: "qa_failed_pack_blocked" });
    }
  }
  return issues;
}

function passesAmplitude(item: V19MotionSheetQaMetrics) {
  const uniquePoseThreshold = item.actionId === "success" ? 3 : 4;
  if (item.uniquePoseCount < uniquePoseThreshold) {
    return false;
  }
  return (item.meanFrameDelta >= 22 && item.maxFrameDelta >= 35) || item.bboxCenterShiftPx >= 18;
}

function buildPetJson(input: V19MotionSheetInput): V10PetJsonPack {
  return {
    schemaVersion: "10.6",
    packId: input.packId,
    displayName: input.displayName,
    rendererKind: "sprite",
    format: "spritesheet",
    canvas: {
      width: input.layout.frameWidth,
      height: input.layout.frameHeight
    },
    spritesheet: {
      fileName: input.layout.fileName,
      columns: input.layout.columns,
      rows: input.layout.rows,
      frameWidth: input.layout.frameWidth,
      frameHeight: input.layout.frameHeight
    },
    actions: Object.fromEntries(input.actions.map((action) => [
      action.actionId,
      {
        frames: frameRectsForAction(input, action),
        fps: action.fps,
        loop: action.loop,
        transient: !action.loop,
        durationMs: Math.round(1000 * action.frameCount / action.fps),
        fallbackActionId: action.fallbackActionId
      }
    ])) as V10PetJsonPack["actions"],
    license: {
      source: input.sourceMode === "provider_single_motion_sheet" ? "generated-provider" : "user-provided",
      attribution: `${input.displayName} V19 motion sheet`
    }
  };
}

function frameRectsForAction(input: V19MotionSheetInput, action: V19MotionSheetActionSpec): V10PetJsonFrameRect[] {
  const frames: V10PetJsonFrameRect[] = [];
  for (let index = 0; index < action.frameCount; index += 1) {
    const column = action.frameStart + index;
    frames.push({
      index,
      x: column * input.layout.frameWidth,
      y: (action.row - 1) * input.layout.frameHeight,
      width: input.layout.frameWidth,
      height: input.layout.frameHeight
    });
  }
  return frames;
}

function scanForbidden(value: unknown, field: string, issues: V19MotionSheetIssue[]) {
  if (typeof value === "string") {
    if (REMOTE_URL_PATTERN.test(value)) {
      issues.push({ field, reasonCode: "remote_url_rejected" });
    }
    if (ABSOLUTE_PATH_PATTERN.test(value)) {
      issues.push({ field, reasonCode: "absolute_path_rejected" });
    }
    if (PATH_ESCAPE_PATTERN.test(value)) {
      issues.push({ field, reasonCode: "path_traversal_rejected" });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${field}[${index}]`, issues));
    return;
  }
  if (!isRecord(value)) {
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    const nestedField = `${field}.${safeFieldName(key)}`;
    if (/localPath|sourcePath|rawLocalPath/i.test(key)) issues.push({ field: nestedField, reasonCode: "raw_local_path_rejected" });
    if (EXTERNAL_HREF_KEY_PATTERN.test(key)) issues.push({ field: nestedField, reasonCode: "external_href_rejected" });
    if (SCRIPT_KEY_PATTERN.test(key)) issues.push({ field: nestedField, reasonCode: "script_field_rejected" });
    if (EVENT_HANDLER_KEY_PATTERN.test(key)) issues.push({ field: nestedField, reasonCode: "event_handler_rejected" });
    if (SHELL_KEY_PATTERN.test(key)) issues.push({ field: nestedField, reasonCode: "shell_command_rejected" });
    if (CREDENTIAL_KEY_PATTERN.test(key)) issues.push({ field: nestedField, reasonCode: "credential_field_rejected" });
    if (RAW_PROVIDER_KEY_PATTERN.test(key)) issues.push({ field: nestedField, reasonCode: "raw_provider_payload_rejected" });
    if (PROMPT_TEXT_KEY_PATTERN.test(key)) issues.push({ field: nestedField, reasonCode: "prompt_private_text_rejected" });
    scanForbidden(nested, nestedField, issues);
  }
}

function rejected(
  packId: string,
  reasonCode: Exclude<V19MotionSheetReasonCode, "accepted" | "rollback_succeeded">,
  issues: V19MotionSheetIssue[],
  qaTable: Partial<Record<CoreActionId, V19MotionSheetActionQaResult>>
): V19MotionSheetValidationResult {
  return {
    status: reasonCode === "provider_motion_sheet_missing" || reasonCode === "provider_output_not_single_sheet" ? "blocked" : "rejected",
    reasonCode,
    packId,
    qaTable,
    issues,
    preservedPreviousActivePack: true
  };
}

function blockedPreview(
  packId: string,
  reasonCode: Exclude<V19MotionSheetReasonCode, "accepted" | "rollback_succeeded">,
  targetInstanceId?: string
): V19MotionSheetPreviewFlow {
  return {
    status: "blocked",
    reasonCode,
    packId,
    targetInstanceId,
    previousPackPreserved: true
  };
}

function assignmentMap(instances: V19PetInstanceAssignment[]) {
  return Object.fromEntries(instances
    .filter((item) => SAFE_ID_PATTERN.test(item.instanceId))
    .map((item) => [item.instanceId, SAFE_ID_PATTERN.test(item.activePackId) ? item.activePackId : "unknown-pack"]));
}

function safePackId(input: unknown) {
  if (isRecord(input) && typeof input.packId === "string" && SAFE_ID_PATTERN.test(input.packId)) {
    return input.packId;
  }
  return "v19-motion-sheet";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeFieldName(value: string) {
  return /^[A-Za-z0-9._-]{1,80}$/.test(value) ? value : "field";
}
