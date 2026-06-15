import {
  CORE_ACTION_IDS,
  type AssetManifest,
  type AssetManifestAction,
  type AssetManifestAsset,
  type CoreActionId,
  type ManifestValidationIssue,
  type PlaybackPriority
} from "./asset-manifest";
import { validateAssetManifest } from "./asset-pack-validator";

export type V10PetJsonFormat = "spritesheet" | "frameSequence";

export type V10PetJsonFrameRect = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type V10PetJsonAction = {
  frames: Array<string | V10PetJsonFrameRect>;
  fps: number;
  loop: boolean;
  transient: boolean;
  durationMs?: number;
  fallbackActionId?: CoreActionId;
};

export type V10PetJsonPack = {
  schemaVersion: "10.6";
  packId: string;
  displayName: string;
  rendererKind: "sprite";
  format: V10PetJsonFormat;
  canvas: {
    width: number;
    height: number;
  };
  spritesheet?: {
    fileName: string;
    columns: number;
    rows: number;
    frameWidth: number;
    frameHeight: number;
  };
  actions: Record<CoreActionId, V10PetJsonAction>;
  license?: {
    attribution: string;
    source: "project-authored" | "user-provided" | "generated-local" | "generated-provider";
  };
};

export type AnimationPackAdapterReasonCode =
  | "accepted"
  | "pet_json_not_object"
  | "field_invalid"
  | "renderer_kind_unsupported"
  | "format_unsupported"
  | "core_action_missing"
  | "spritesheet_required"
  | "spritesheet_invalid"
  | "frame_sequence_invalid"
  | "frame_rect_invalid"
  | "frame_count_invalid"
  | "fps_invalid"
  | "canvas_invalid"
  | "forbidden_content"
  | "manifest_validation_failed";

export type AnimationPackAdapterIssue = {
  reasonCode: AnimationPackAdapterReasonCode;
  field: string;
  message: string;
};

export type SafeAnimationPackAdapterOutput = {
  packId: string;
  rendererKind: "sprite";
  actions: Record<CoreActionId, {
    assetId: string;
    frameCount: number;
    fps: number;
    loop: boolean;
    transient: boolean;
    durationMs?: number;
    fallbackActionId?: CoreActionId;
  }>;
};

export type AnimationPackAdapterResult = {
  ok: boolean;
  reasonCode: AnimationPackAdapterReasonCode;
  manifest?: AssetManifest;
  safeOutput?: SafeAnimationPackAdapterOutput;
  errors: AnimationPackAdapterIssue[];
  warnings: AnimationPackAdapterIssue[];
};

export type AnimationPackActivationResult = {
  activeManifest: AssetManifest;
  adapterResult: AnimationPackAdapterResult;
  preservedPrevious: boolean;
};

const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const SAFE_DISPLAY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,79}$/;
const SAFE_FILENAME_PATTERN = /^[a-z0-9][a-z0-9._-]{0,95}\.(png|webp)$/;
const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const PATH_ESCAPE_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
const SCRIPT_LIKE_PATTERN = /\b(?:eval|Function|script|javascript:|shell|exec|spawn|chmod|curl|bash|zsh|powershell)\b/i;
const EXECUTABLE_EXT_PATTERN = /\.(?:sh|bash|zsh|command|app|exe|dll|dylib|so|js|mjs|cjs)$/i;
const FORBIDDEN_KEY_PATTERN = /(?:raw|payload|provider|prompt|token|authorization|workspace|config|href|onload|onclick|command|script|shell|localpath|sourcepath)/i;
const TRANSIENT_ACTIONS = new Set<CoreActionId>(["success", "warning", "error", "need_input"]);
const MAX_FRAMES_PER_ACTION = 48;

export function adaptV10PetJsonAnimationPack(input: unknown): AnimationPackAdapterResult {
  const errors: AnimationPackAdapterIssue[] = [];
  const warnings: AnimationPackAdapterIssue[] = [];

  if (!isRecord(input)) {
    return failed("pet_json_not_object", "$", "pet.json must be an object", errors, warnings);
  }

  scanForbidden(input, "$", errors);

  if (input.schemaVersion !== "10.6") {
    errors.push(issue("field_invalid", "schemaVersion", "schemaVersion must be 10.6"));
  }
  validateSafeString(input.packId, "packId", SAFE_ID_PATTERN, "field_invalid", errors);
  validateSafeString(input.displayName, "displayName", SAFE_DISPLAY_PATTERN, "field_invalid", errors);
  if (input.rendererKind !== "sprite") {
    errors.push(issue("renderer_kind_unsupported", "rendererKind", "rendererKind must be sprite"));
  }
  if (input.format !== "spritesheet" && input.format !== "frameSequence") {
    errors.push(issue("format_unsupported", "format", "format must be spritesheet or frameSequence"));
  }
  validateCanvas(input.canvas, errors);

  if (!isRecord(input.actions)) {
    errors.push(issue("field_invalid", "actions", "actions must be an object"));
  }

  if (input.format === "spritesheet") {
    validateSpritesheet(input, errors);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      reasonCode: firstReasonCode(errors),
      errors,
      warnings
    };
  }

  const pack = input as unknown as V10PetJsonPack;
  const manifestAssets: Record<string, AssetManifestAsset> = {};
  const manifestActions: Partial<Record<CoreActionId, AssetManifestAction>> = {};
  const safeActions = {} as SafeAnimationPackAdapterOutput["actions"];

  for (const actionId of CORE_ACTION_IDS) {
    const action = pack.actions[actionId];
    if (!isRecord(action)) {
      errors.push(issue("core_action_missing", `actions.${actionId}`, "required core action is missing"));
      continue;
    }

    const actionErrors = validateAction(pack, actionId, action);
    errors.push(...actionErrors);
    if (actionErrors.length > 0) {
      continue;
    }

    const assetId = actionId;
    const frameFiles = normalizedFrameFiles(pack, actionId, action);
    manifestAssets[assetId] = {
      assetId,
      kind: "sprite",
      fileName: pack.format === "spritesheet" ? pack.spritesheet?.fileName : frameFiles[0],
      frameFiles,
      fps: action.fps
    };
    manifestActions[actionId] = withoutUndefined({
      assetId,
      loop: action.loop,
      priority: priorityForAction(actionId, action),
      durationMs: action.durationMs
    });
    safeActions[actionId] = {
      assetId,
      frameCount: frameFiles.length,
      fps: action.fps,
      loop: action.loop,
      transient: action.transient,
      ...("durationMs" in action && typeof action.durationMs === "number" ? { durationMs: action.durationMs } : {}),
      fallbackActionId: action.fallbackActionId
    };
  }

  if (errors.length > 0) {
    return {
      ok: false,
      reasonCode: firstReasonCode(errors),
      errors,
      warnings
    };
  }

  const manifest: AssetManifest = {
    schemaVersion: "5.0",
    packId: pack.packId,
    version: "10.6.0",
    rendererKind: "sprite",
    license: {
      type: pack.license?.source ?? "user-provided",
      attribution: pack.license?.attribution ?? `${pack.displayName} local animation pack`
    },
    assets: manifestAssets,
    actions: manifestActions
  };

  const validation = validateAssetManifest(manifest);
  if (!validation.ok) {
    return {
      ok: false,
      reasonCode: "manifest_validation_failed",
      errors: [
        ...errors,
        ...validation.errors.map(fromManifestIssue)
      ],
      warnings: [
        ...warnings,
        ...validation.warnings.map(fromManifestIssue)
      ]
    };
  }

  return {
    ok: true,
    reasonCode: "accepted",
    manifest,
    safeOutput: {
      packId: pack.packId,
      rendererKind: "sprite",
      actions: safeActions
    },
    errors,
    warnings: [
      ...warnings,
      ...validation.warnings.map(fromManifestIssue)
    ]
  };
}

export function activateV10PetJsonAnimationPack(
  currentManifest: AssetManifest,
  candidate: unknown
): AnimationPackActivationResult {
  const adapterResult = adaptV10PetJsonAnimationPack(candidate);
  if (!adapterResult.ok || !adapterResult.manifest) {
    return {
      activeManifest: currentManifest,
      adapterResult,
      preservedPrevious: true
    };
  }

  return {
    activeManifest: adapterResult.manifest,
    adapterResult,
    preservedPrevious: false
  };
}

export const V10_ANIMATION_PACK_SAFE_OUTPUT_FIELDS = [
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

function validateAction(pack: V10PetJsonPack, actionId: CoreActionId, action: V10PetJsonAction): AnimationPackAdapterIssue[] {
  const errors: AnimationPackAdapterIssue[] = [];

  if (!Array.isArray(action.frames) || action.frames.length < 1 || action.frames.length > MAX_FRAMES_PER_ACTION) {
    errors.push(issue("frame_count_invalid", `actions.${actionId}.frames`, "frames must contain 1 to 48 entries"));
    return errors;
  }

  if (!Number.isInteger(action.fps) || action.fps < 1 || action.fps > 24) {
    errors.push(issue("fps_invalid", `actions.${actionId}.fps`, "fps must be an integer between 1 and 24"));
  }
  if (typeof action.loop !== "boolean") {
    errors.push(issue("field_invalid", `actions.${actionId}.loop`, "loop must be boolean"));
  }
  if (typeof action.transient !== "boolean") {
    errors.push(issue("field_invalid", `actions.${actionId}.transient`, "transient must be boolean"));
  }
  if (typeof action.durationMs !== "undefined" && (!Number.isInteger(action.durationMs) || Number(action.durationMs) < 250 || Number(action.durationMs) > 10000)) {
    errors.push(issue("field_invalid", `actions.${actionId}.durationMs`, "durationMs must be an integer between 250 and 10000"));
  }
  if ("fallbackActionId" in action && !CORE_ACTION_IDS.includes(action.fallbackActionId as CoreActionId)) {
    errors.push(issue("field_invalid", `actions.${actionId}.fallbackActionId`, "fallbackActionId must be a core action"));
  }

  action.frames.forEach((frame, index) => {
    if (pack.format === "frameSequence") {
      if (typeof frame !== "string" || !SAFE_FILENAME_PATTERN.test(frame)) {
        errors.push(issue("frame_sequence_invalid", `actions.${actionId}.frames[${index}]`, "frame sequence entry must be a safe image file name"));
      }
      return;
    }
    if (!isFrameRect(frame) || !isValidFrameRect(pack, frame)) {
      errors.push(issue("frame_rect_invalid", `actions.${actionId}.frames[${index}]`, "spritesheet frame rect must stay within sheet bounds"));
    }
  });

  return errors;
}

function validateCanvas(canvas: unknown, errors: AnimationPackAdapterIssue[]) {
  if (!isRecord(canvas)) {
    errors.push(issue("canvas_invalid", "canvas", "canvas is required"));
    return;
  }
  for (const key of ["width", "height"] as const) {
    const value = canvas[key];
    if (!Number.isInteger(value) || Number(value) < 64 || Number(value) > 512) {
      errors.push(issue("canvas_invalid", `canvas.${key}`, "canvas width and height must be integers between 64 and 512"));
    }
  }
}

function validateSpritesheet(input: Record<string, unknown>, errors: AnimationPackAdapterIssue[]) {
  if (!isRecord(input.spritesheet)) {
    errors.push(issue("spritesheet_required", "spritesheet", "spritesheet metadata is required"));
    return;
  }
  const sheet = input.spritesheet;
  validateSafeString(sheet.fileName, "spritesheet.fileName", SAFE_FILENAME_PATTERN, "spritesheet_invalid", errors);
  for (const key of ["columns", "rows", "frameWidth", "frameHeight"] as const) {
    const value = sheet[key];
    if (!Number.isInteger(value) || Number(value) < 1) {
      errors.push(issue("spritesheet_invalid", `spritesheet.${key}`, "spritesheet numeric fields must be positive integers"));
    }
  }
  if (isRecord(input.canvas)) {
    if (sheet.frameWidth !== input.canvas.width || sheet.frameHeight !== input.canvas.height) {
      errors.push(issue("spritesheet_invalid", "spritesheet", "spritesheet frame size must match canvas"));
    }
  }
  if (Number(sheet.columns) * Number(sheet.frameWidth) > 4096 || Number(sheet.rows) * Number(sheet.frameHeight) > 4096) {
    errors.push(issue("spritesheet_invalid", "spritesheet", "spritesheet dimensions exceed limit"));
  }
}

function normalizedFrameFiles(pack: V10PetJsonPack, actionId: CoreActionId, action: V10PetJsonAction) {
  if (pack.format === "frameSequence") {
    return action.frames as string[];
  }
  return action.frames.map((_, index) => `${actionId}-${String(index + 1).padStart(2, "0")}.png`);
}

function priorityForAction(actionId: CoreActionId, action: V10PetJsonAction): PlaybackPriority {
  if (actionId === "error" || actionId === "need_input") {
    return "urgent";
  }
  if (action.transient || TRANSIENT_ACTIONS.has(actionId)) {
    return "transient";
  }
  return "base";
}

function scanForbidden(value: unknown, field: string, errors: AnimationPackAdapterIssue[]) {
  if (typeof value === "string") {
    if (
      REMOTE_URL_PATTERN.test(value) ||
      ABSOLUTE_PATH_PATTERN.test(value) ||
      PATH_ESCAPE_PATTERN.test(value) ||
      SCRIPT_LIKE_PATTERN.test(value) ||
      EXECUTABLE_EXT_PATTERN.test(value)
    ) {
      errors.push(issue("forbidden_content", field, "forbidden content rejected"));
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${field}[${index}]`, errors));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    const nestedField = `${field}.${safeFieldName(key)}`;
    if (FORBIDDEN_KEY_PATTERN.test(key)) {
      errors.push(issue("forbidden_content", nestedField, "forbidden field rejected"));
    }
    scanForbidden(nested, nestedField, errors);
  }
}

function isValidFrameRect(pack: V10PetJsonPack, rect: V10PetJsonFrameRect) {
  const sheet = pack.spritesheet;
  if (!sheet) return false;
  const sheetWidth = sheet.columns * sheet.frameWidth;
  const sheetHeight = sheet.rows * sheet.frameHeight;
  return Number.isInteger(rect.index) &&
    rect.index >= 0 &&
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.width === sheet.frameWidth &&
    rect.height === sheet.frameHeight &&
    rect.x + rect.width <= sheetWidth &&
    rect.y + rect.height <= sheetHeight;
}

function isFrameRect(value: unknown): value is V10PetJsonFrameRect {
  return isRecord(value) &&
    Number.isInteger(value.index) &&
    Number.isInteger(value.x) &&
    Number.isInteger(value.y) &&
    Number.isInteger(value.width) &&
    Number.isInteger(value.height);
}

function validateSafeString(
  value: unknown,
  field: string,
  pattern: RegExp,
  reasonCode: AnimationPackAdapterReasonCode,
  errors: AnimationPackAdapterIssue[]
) {
  if (typeof value !== "string" || !pattern.test(value)) {
    errors.push(issue(reasonCode, field, "field is not a safe string"));
  }
}

function failed(
  reasonCode: AnimationPackAdapterReasonCode,
  field: string,
  message: string,
  errors: AnimationPackAdapterIssue[],
  warnings: AnimationPackAdapterIssue[]
): AnimationPackAdapterResult {
  return {
    ok: false,
    reasonCode,
    errors: [issue(reasonCode, field, message), ...errors],
    warnings
  };
}

function fromManifestIssue(item: ManifestValidationIssue): AnimationPackAdapterIssue {
  return {
    reasonCode: item.code === "forbidden_content" ? "forbidden_content" : "manifest_validation_failed",
    field: item.field,
    message: item.reason
  };
}

function firstReasonCode(errors: AnimationPackAdapterIssue[]): AnimationPackAdapterReasonCode {
  return errors[0]?.reasonCode ?? "field_invalid";
}

function issue(reasonCode: AnimationPackAdapterReasonCode, field: string, message: string): AnimationPackAdapterIssue {
  return { reasonCode, field, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeFieldName(value: string) {
  return /^[A-Za-z0-9._-]{1,80}$/.test(value) ? value : "field";
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, nested]) => typeof nested !== "undefined")) as T;
}
