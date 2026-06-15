const CORE_ACTIONS = [
  "idle",
  "thinking",
  "running",
  "success",
  "warning",
  "error",
  "need_input",
  "sleeping"
] as const;

const LOOP_ACTIONS = new Set(["idle", "thinking", "running", "sleeping"]);
const PRIORITY_ACTIONS = new Set(["error", "need_input"]);
const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const TOKEN_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{8,}|Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json)\b/i;
const PRIVATE_METADATA_PATTERN = /\b(?:exif|gps|latitude|longitude|geotag|location|raw photo|source filename|photo path|owner identity|provider payload|credential|clipboard|screen text)\b/i;

export type Photo2DCoreActionId = typeof CORE_ACTIONS[number];

export type Photo2DPromptFrameIntent = "loop" | "transient" | "priority";

export type Photo2DTraitPromptReasonCode =
  | "prompt_pack_ready"
  | "traits_approval_required"
  | "trait_schema_invalid"
  | "prompt_pack_generation_failed";

export type SafeCatTraits = {
  traitId: string;
  coatColor: string;
  pattern: string;
  eyeColor?: string;
  faceShape?: string;
  bodyBuild?: string;
  tailNotes?: string;
  distinctiveNotes?: string;
  approved: boolean;
  approvedAt?: string;
};

export type Photo2DActionPromptSummary = {
  actionId: Photo2DCoreActionId;
  promptDigest: string;
  safeSummary: string;
  frameIntent: Photo2DPromptFrameIntent;
  expectedFrameCount: number;
};

export type Photo2DPromptPack = {
  promptPackId: string;
  traitId: string;
  actionPrompts: Record<Photo2DCoreActionId, Photo2DActionPromptSummary>;
  createdAt: string;
  safetySummary: {
    fullPromptPrinted: false;
    storesRawPhoto: false;
    uploadsByDefault: false;
    includesProviderCall: false;
    includesSourcePath: false;
    includesExifGps: false;
  };
};

export type Photo2DTraitPromptPackResult =
  | {
    status: "accepted";
    reasonCode: "prompt_pack_ready";
    approvedTraits: SafeCatTraits;
    promptPack: Photo2DPromptPack;
  }
  | {
    status: "rejected";
    reasonCode: Exclude<Photo2DTraitPromptReasonCode, "prompt_pack_ready">;
    approvedTraits?: SafeCatTraits;
  };

export function generatePhoto2DTraitPromptPack(options: {
  traits?: Partial<SafeCatTraits> | null;
  createdAt?: string;
}): Photo2DTraitPromptPackResult {
  if (!options.traits?.approved) {
    return {
      status: "rejected",
      reasonCode: "traits_approval_required"
    };
  }

  const approvedTraits = normalizeTraits(options.traits);
  if (!approvedTraits || hasUnsafeTraits(approvedTraits)) {
    return {
      status: "rejected",
      reasonCode: "trait_schema_invalid"
    };
  }

  const createdAt = sanitizeTimestamp(options.createdAt);
  const promptPackId = safeId(`photo2d_prompts_${approvedTraits.traitId}`);
  const actionPrompts = Object.fromEntries(CORE_ACTIONS.map((actionId) => [
    actionId,
    buildActionPromptSummary(approvedTraits, actionId)
  ])) as Record<Photo2DCoreActionId, Photo2DActionPromptSummary>;

  if (Object.keys(actionPrompts).length !== CORE_ACTIONS.length) {
    return {
      status: "rejected",
      reasonCode: "prompt_pack_generation_failed",
      approvedTraits
    };
  }

  return {
    status: "accepted",
    reasonCode: "prompt_pack_ready",
    approvedTraits,
    promptPack: {
      promptPackId,
      traitId: approvedTraits.traitId,
      actionPrompts,
      createdAt,
      safetySummary: {
        fullPromptPrinted: false,
        storesRawPhoto: false,
        uploadsByDefault: false,
        includesProviderCall: false,
        includesSourcePath: false,
        includesExifGps: false
      }
    }
  };
}

export function buildPhoto2DTraitPromptEvidenceSnapshot(result: Photo2DTraitPromptPackResult) {
  if (result.status !== "accepted") {
    return {
      status: result.status,
      reasonCode: result.reasonCode
    };
  }

  return {
    status: result.status,
    reasonCode: result.reasonCode,
    approvedTraitTable: {
      traitId: result.approvedTraits.traitId,
      safeTraitFields: Object.keys(result.approvedTraits).sort(),
      coatColor: result.approvedTraits.coatColor,
      pattern: result.approvedTraits.pattern,
      eyeColor: result.approvedTraits.eyeColor,
      faceShape: result.approvedTraits.faceShape,
      bodyBuild: result.approvedTraits.bodyBuild,
      tailNotes: result.approvedTraits.tailNotes,
      distinctiveNotes: result.approvedTraits.distinctiveNotes,
      approved: result.approvedTraits.approved,
      hasApprovedAt: Boolean(result.approvedTraits.approvedAt)
    },
    promptPack: {
      promptPackId: result.promptPack.promptPackId,
      traitId: result.promptPack.traitId,
      createdAt: result.promptPack.createdAt,
      actionCount: Object.keys(result.promptPack.actionPrompts).length,
      actionCoverage: CORE_ACTIONS.map((actionId) => ({
        actionId,
        promptDigest: result.promptPack.actionPrompts[actionId].promptDigest,
        safeSummary: result.promptPack.actionPrompts[actionId].safeSummary,
        frameIntent: result.promptPack.actionPrompts[actionId].frameIntent,
        expectedFrameCount: result.promptPack.actionPrompts[actionId].expectedFrameCount
      })),
      fullPromptPrinted: result.promptPack.safetySummary.fullPromptPrinted,
      safetySummary: result.promptPack.safetySummary
    }
  };
}

export function photo2DTraitPromptPackHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value)
    .replace(/promptDigest|promptPack|PromptPack|fullPromptPrinted|prompt_pack_ready/g, "")
    .replace(/includesExifGps|approvedAt|hasApprovedAt/g, "");
  return /Authorization|api-token\.json|raw payload|raw photo|raw provider response|source filename|source path|photo path|workspace path|config path|provider payload|credential|prompt text|raw prompt|promptText/i.test(serialized)
    || /\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]/.test(serialized)
    || /https?:\/\/|file:\/\//i.test(serialized)
    || /sk-[A-Za-z0-9_-]{8,}/.test(serialized)
    || /\b(?:gps|latitude|longitude|geotag|location|raw exif|exif payload|exif data)\b/i.test(serialized);
}

function normalizeTraits(input: Partial<SafeCatTraits>): SafeCatTraits | null {
  const traitId = safeId(input.traitId ?? "");
  const coatColor = sanitizeTraitValue(input.coatColor ?? "", 80);
  const pattern = sanitizeTraitValue(input.pattern ?? "", 100);
  if (!traitId || !coatColor || !pattern) {
    return null;
  }

  return {
    traitId,
    coatColor,
    pattern,
    eyeColor: sanitizeOptionalTraitValue(input.eyeColor, 80),
    faceShape: sanitizeOptionalTraitValue(input.faceShape, 100),
    bodyBuild: sanitizeOptionalTraitValue(input.bodyBuild, 100),
    tailNotes: sanitizeOptionalTraitValue(input.tailNotes, 120),
    distinctiveNotes: sanitizeOptionalTraitValue(input.distinctiveNotes, 160),
    approved: true,
    approvedAt: sanitizeTimestamp(input.approvedAt)
  };
}

function buildActionPromptSummary(traits: SafeCatTraits, actionId: Photo2DCoreActionId): Photo2DActionPromptSummary {
  const frameIntent = frameIntentForAction(actionId);
  const expectedFrameCount = frameIntent === "loop" ? 6 : 3;
  const safeSummary = [
    actionId,
    `same cat with ${traits.coatColor} coat`,
    `${traits.pattern} pattern`,
    traits.eyeColor ? `${traits.eyeColor} eyes` : null,
    traits.faceShape ? `${traits.faceShape} face` : null,
    traits.bodyBuild ? `${traits.bodyBuild} body` : null,
    traits.tailNotes ? `${traits.tailNotes} tail` : null,
    traits.distinctiveNotes ? `safe notes: ${traits.distinctiveNotes}` : null,
    `${expectedFrameCount} frame ${frameIntent} sprite intent`
  ].filter(Boolean).join("; ");

  const digestSource = [
    traits.traitId,
    actionId,
    traits.coatColor,
    traits.pattern,
    traits.eyeColor,
    traits.faceShape,
    traits.bodyBuild,
    traits.tailNotes,
    traits.distinctiveNotes,
    frameIntent,
    expectedFrameCount
  ].join("|");

  return {
    actionId,
    promptDigest: digest(digestSource),
    safeSummary,
    frameIntent,
    expectedFrameCount
  };
}

function frameIntentForAction(actionId: Photo2DCoreActionId): Photo2DPromptFrameIntent {
  if (LOOP_ACTIONS.has(actionId)) return "loop";
  if (PRIORITY_ACTIONS.has(actionId)) return "priority";
  return "transient";
}

function sanitizeTraitValue(value: string, maxLength: number) {
  const sanitized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return sanitized;
}

function sanitizeOptionalTraitValue(value: string | undefined, maxLength: number) {
  const sanitized = sanitizeTraitValue(value ?? "", maxLength);
  return sanitized || undefined;
}

function sanitizeTimestamp(value: string | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    ? value
    : "2026-06-10T00:00:00.000Z";
}

function safeId(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(normalized) ? normalized : "";
}

function hasUnsafeTraits(traits: SafeCatTraits) {
  return Object.values(traits).some((value) => typeof value === "string" && (
    REMOTE_URL_PATTERN.test(value)
    || ABSOLUTE_PATH_PATTERN.test(value)
    || TOKEN_PATTERN.test(value)
    || PRIVATE_METADATA_PATTERN.test(value)
  ));
}

function digest(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `prompt_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

