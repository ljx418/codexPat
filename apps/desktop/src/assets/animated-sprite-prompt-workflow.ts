import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";

const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const TOKEN_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{8,}|Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json)\b/i;
const FORBIDDEN_OUTPUT_PATTERN = /\b(?:Authorization|api-token\.json|raw payload|workspace path|config path|provider credential|raw provider response|raw photo|EXIF|GPS)\b/i;

export type AnimatedSpritePromptWorkflowStatus = "accepted" | "rejected";
export type AnimatedSpritePromptWorkflowReasonCode =
  | "animated_sprite_prompt_workflow_ok"
  | "animated_sprite_prompt_frame_count_invalid"
  | "animated_sprite_prompt_fps_invalid";

export type AnimatedSpriteActionStoryboard = {
  actionId: CoreActionId;
  frameFilePattern: string;
  frameCount: number;
  prompt: string;
  motionNotes: string[];
};

export type AnimatedSpritePromptWorkflow = {
  status: AnimatedSpritePromptWorkflowStatus;
  reasonCode: AnimatedSpritePromptWorkflowReasonCode;
  catName: string;
  approvedTraitSummary: string;
  frameCount: number;
  fps: number;
  actionStoryboards: Record<CoreActionId, AnimatedSpriteActionStoryboard>;
  manifestTemplate: string;
  importChecklist: string[];
  safetyNotes: string[];
  evidenceSummary: {
    actionCount: number;
    promptOnly: true;
    providerExecution: false;
    uploadsByDefault: false;
    targetsV89Assembler: true;
  };
};

export function generateAnimatedSpritePromptWorkflow(options: {
  catName?: string;
  approvedTraits?: string;
  frameCount?: number;
  fps?: number;
}): AnimatedSpritePromptWorkflow {
  const frameCount = options.frameCount ?? 8;
  const fps = options.fps ?? 12;
  const catName = sanitizeText(options.catName ?? "", "Animated Sprite Cat", 80);
  const approvedTraitSummary = sanitizeText(options.approvedTraits ?? "", "user-approved cat appearance traits", 360);

  if (!Number.isInteger(frameCount) || frameCount < 2 || frameCount > 24) {
    return rejected("animated_sprite_prompt_frame_count_invalid", catName, approvedTraitSummary, frameCount, fps);
  }
  if (!Number.isInteger(fps) || fps < 1 || fps > 24) {
    return rejected("animated_sprite_prompt_fps_invalid", catName, approvedTraitSummary, frameCount, fps);
  }

  const actionStoryboards = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    buildActionStoryboard(actionId, catName, approvedTraitSummary, frameCount, fps)
  ])) as Record<CoreActionId, AnimatedSpriteActionStoryboard>;

  return {
    status: "accepted",
    reasonCode: "animated_sprite_prompt_workflow_ok",
    catName,
    approvedTraitSummary,
    frameCount,
    fps,
    actionStoryboards,
    manifestTemplate: buildAnimatedSpriteManifestTemplate(safePackId(catName), catName, frameCount, fps),
    importChecklist: [
      "Generate transparent PNG frames for every core action.",
      "Use the exact naming pattern <action>-000.png, <action>-001.png, and so on.",
      "Keep each action folder flat or place all frames in one flat folder before V8.9 assembly.",
      "Do not include text, UI chrome, watermarks, URLs, path references, scripts, or provider metadata in images or filenames.",
      "Run the V8.9 local animated sprite assembler in Desktop Manager with the generated frame folder.",
      "Activate the imported pack on one target PetInstance only.",
      "Proceed to V8.11 visual QA before making any runtime animation quality claim."
    ],
    safetyNotes: [
      "This workflow generates local instructions only.",
      "No provider call is made by default.",
      "Original image bytes and private image metadata are not persisted by this workflow.",
      "Generated assets must pass V8.9 assembly and existing local import validation before activation."
    ],
    evidenceSummary: {
      actionCount: CORE_ACTION_IDS.length,
      promptOnly: true,
      providerExecution: false,
      uploadsByDefault: false,
      targetsV89Assembler: true
    }
  };
}

export function animatedSpritePromptWorkflowHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value);
  return FORBIDDEN_OUTPUT_PATTERN.test(serialized)
    || REMOTE_URL_PATTERN.test(serialized)
    || ABSOLUTE_PATH_PATTERN.test(serialized)
    || TOKEN_PATTERN.test(serialized);
}

function buildActionStoryboard(
  actionId: CoreActionId,
  catName: string,
  approvedTraitSummary: string,
  frameCount: number,
  fps: number
): AnimatedSpriteActionStoryboard {
  const frameFilePattern = `${actionId}-000.png ... ${actionId}-${String(frameCount - 1).padStart(3, "0")}.png`;
  const motionNotes = motionNotesForAction(actionId);
  return {
    actionId,
    frameFilePattern,
    frameCount,
    motionNotes,
    prompt: [
      `Create ${frameCount} transparent PNG animation frames for a desktop companion cat action.`,
      `Cat identity: ${catName}.`,
      `Approved traits: ${approvedTraitSummary}.`,
      `Action: ${actionId}.`,
      `Frame names must be ${frameFilePattern}.`,
      `Target playback: ${fps} fps.`,
      `Motion notes: ${motionNotes.join(" ")}`,
      "Maintain consistent coat colors, markings, eye color, proportions, camera angle, lighting, and scale across every frame.",
      "Keep the cat centered with transparent background and at least 4 px visual margin.",
      "Do not include humans, UI, text, watermark, URLs, path references, scripts, secrets, provider metadata, or executable content."
    ].join(" ")
  };
}

function motionNotesForAction(actionId: CoreActionId) {
  const notes: Record<CoreActionId, string[]> = {
    idle: ["gentle breathing", "subtle tail sway", "calm eyes"],
    thinking: ["head tilt", "slow blink", "curious ear movement"],
    running: ["small paw steps in place", "tail counter-swing", "focused pose"],
    success: ["happy hop", "bright eyes", "tail lift"],
    warning: ["alert ears", "cautious lean back", "small tail flick"],
    error: ["surprised posture", "ears lowered", "soft recovery pose"],
    need_input: ["looking upward", "paw raised", "inviting expression"],
    sleeping: ["curled resting pose", "slow breathing", "closed eyes"]
  };
  return notes[actionId];
}

function buildAnimatedSpriteManifestTemplate(packId: string, catName: string, frameCount: number, fps: number) {
  const assets = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    {
      assetId: actionId,
      kind: "sprite",
      fileName: `${actionId}-000.png`,
      frameFiles: Array.from({ length: frameCount }, (_, index) => `${actionId}-${String(index).padStart(3, "0")}.png`),
      fps
    }
  ]));
  const actions = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    {
      assetId: actionId,
      loop: actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping",
      priority: actionId === "error" || actionId === "need_input" ? "urgent" : actionId === "idle" || actionId === "sleeping" ? "base" : "transient"
    }
  ]));
  return JSON.stringify({
    schemaVersion: "5.8",
    packId,
    displayName: `${catName} Animated Sprite Pack`,
    rendererKind: "sprite",
    license: {
      type: "user-generated",
      attribution: `${catName} local animated sprite asset pack`
    },
    assets,
    actions
  }, null, 2);
}

function rejected(
  reasonCode: AnimatedSpritePromptWorkflowReasonCode,
  catName: string,
  approvedTraitSummary: string,
  frameCount: number,
  fps: number
): AnimatedSpritePromptWorkflow {
  return {
    status: "rejected",
    reasonCode,
    catName,
    approvedTraitSummary,
    frameCount,
    fps,
    actionStoryboards: {} as Record<CoreActionId, AnimatedSpriteActionStoryboard>,
    manifestTemplate: "",
    importChecklist: [],
    safetyNotes: [],
    evidenceSummary: {
      actionCount: 0,
      promptOnly: true,
      providerExecution: false,
      uploadsByDefault: false,
      targetsV89Assembler: true
    }
  };
}

function sanitizeText(value: string, fallback: string, maxLength: number) {
  const sanitized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  if (!sanitized || REMOTE_URL_PATTERN.test(sanitized) || ABSOLUTE_PATH_PATTERN.test(sanitized) || TOKEN_PATTERN.test(sanitized)) {
    return fallback;
  }
  return sanitized;
}

function safePackId(catName: string) {
  const normalized = `animated-${catName.toLowerCase()}`
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return /^[a-z0-9._-]{1,64}$/.test(normalized) ? normalized : "animated-sprite-cat";
}
