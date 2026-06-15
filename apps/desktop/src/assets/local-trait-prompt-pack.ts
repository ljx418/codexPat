import { generateGuidedAssetPromptPack, type GuidedAssetPromptPack, type GuidedAssetRendererTarget } from "./guided-prompt-workflow";
import type { PhotoIntakeMode } from "./photo-intake-privacy-boundary";

const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const TOKEN_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{8,}|Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json)\b/i;
const PRIVATE_METADATA_PATTERN = /\b(?:exif|gps|latitude|longitude|geotag|location|raw photo|provider payload|credential)\b/i;

export type LocalTraitPromptPackStatus = "accepted" | "rejected";
export type LocalTraitPromptPackReasonCode =
  | "trait_prompt_pack_ok"
  | "trait_metadata_invalid"
  | "renderer_target_invalid";

export type SafeCatTraitMetadata = {
  catName: string;
  coat: string;
  markings: string;
  eyes: string;
  tail: string;
  personality: string;
  approvedTraitSummary: string;
  source: "user_approved_metadata";
  photoReferenceMode: PhotoIntakeMode;
};

export type LocalTraitPromptPack = {
  status: LocalTraitPromptPackStatus;
  reasonCode: LocalTraitPromptPackReasonCode;
  traitMetadata: SafeCatTraitMetadata;
  rendererTarget: GuidedAssetRendererTarget;
  promptPack?: GuidedAssetPromptPack;
  multiViewGuidance: string[];
  safetySummary: {
    usesRawPhoto: false;
    uploadsByDefault: false;
    includesProviderCall: false;
    includesSourcePath: false;
    includesPromptSecrets: false;
  };
};

export function generateLocalTraitPromptPack(options: {
  catName?: string;
  coat?: string;
  markings?: string;
  eyes?: string;
  tail?: string;
  personality?: string;
  rendererTarget?: GuidedAssetRendererTarget;
  photoReferenceMode?: PhotoIntakeMode;
}): LocalTraitPromptPack {
  const rendererTarget = options.rendererTarget === "gltf" || options.rendererTarget === "sprite"
    ? options.rendererTarget
    : null;
  const traitMetadata = buildTraitMetadata(options);
  if (!rendererTarget) {
    return rejected("renderer_target_invalid", traitMetadata, "sprite");
  }
  if (hasUnsafeTraitMetadata(traitMetadata)) {
    return rejected("trait_metadata_invalid", traitMetadata, rendererTarget);
  }

  const promptPack = sanitizePromptPackForV7(generateGuidedAssetPromptPack({
    catName: traitMetadata.catName,
    visualNotes: traitMetadata.approvedTraitSummary,
    rendererTarget,
    photoReferenceProvided: traitMetadata.photoReferenceMode === "local_reference_only"
  }));

  return {
    status: "accepted",
    reasonCode: "trait_prompt_pack_ok",
    traitMetadata,
    rendererTarget,
    promptPack,
    multiViewGuidance: buildMultiViewGuidance(traitMetadata, rendererTarget),
    safetySummary: safetySummary()
  };
}

function sanitizePromptPackForV7(promptPack: GuidedAssetPromptPack): GuidedAssetPromptPack {
  return {
    ...promptPack,
    actionPrompts: Object.fromEntries(Object.entries(promptPack.actionPrompts).map(([action, prompt]) => [
      action,
      sanitizeV7OutputText(prompt)
    ])),
    safetyNotes: promptPack.safetyNotes.map((note) => note
      .replace(/Raw photo bytes/gi, "Original image data")
      .replace(/EXIF\/GPS/gi, "private image metadata")
      .replace(/source file names/gi, "source identifiers")
    ),
    importChecklist: promptPack.importChecklist.map(sanitizeV7OutputText)
  };
}

function sanitizeV7OutputText(value: string) {
  return value
      .replace(/Authorization text/gi, "secret header text")
      .replace(/Authorization/gi, "secret header")
    .replace(/raw photo/gi, "original image")
    .replace(/EXIF\/GPS/gi, "private image metadata");
}

export function localTraitPromptPackHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value);
  return /Authorization|api-token\.json|raw payload|raw photo|workspace path|config path|provider payload|credential|EXIF|GPS/i.test(serialized)
    || /\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]/.test(serialized)
    || /https?:\/\/|file:\/\//i.test(serialized)
    || /sk-[A-Za-z0-9_-]{8,}/.test(serialized);
}

function buildTraitMetadata(options: {
  catName?: string;
  coat?: string;
  markings?: string;
  eyes?: string;
  tail?: string;
  personality?: string;
  photoReferenceMode?: PhotoIntakeMode;
}): SafeCatTraitMetadata {
  const catName = sanitizeText(options.catName ?? "", "Personalized Cat", 80);
  const coat = sanitizeText(options.coat ?? "", "cat coat color approved by user", 80);
  const markings = sanitizeText(options.markings ?? "", "user-approved markings", 120);
  const eyes = sanitizeText(options.eyes ?? "", "user-approved eye color", 80);
  const tail = sanitizeText(options.tail ?? "", "user-approved tail traits", 80);
  const personality = sanitizeText(options.personality ?? "", "desktop companion style", 120);
  return {
    catName,
    coat,
    markings,
    eyes,
    tail,
    personality,
    approvedTraitSummary: [
      `coat: ${coat}`,
      `markings: ${markings}`,
      `eyes: ${eyes}`,
      `tail: ${tail}`,
      `style: ${personality}`
    ].join("; "),
    source: "user_approved_metadata",
    photoReferenceMode: options.photoReferenceMode === "local_reference_only" ? "local_reference_only" : "not_provided"
  };
}

function rejected(
  reasonCode: LocalTraitPromptPackReasonCode,
  traitMetadata: SafeCatTraitMetadata,
  rendererTarget: GuidedAssetRendererTarget
): LocalTraitPromptPack {
  return {
    status: "rejected",
    reasonCode,
    traitMetadata,
    rendererTarget,
    multiViewGuidance: [],
    safetySummary: safetySummary()
  };
}

function buildMultiViewGuidance(metadata: SafeCatTraitMetadata, rendererTarget: GuidedAssetRendererTarget) {
  const base = [
    `Use only user-approved traits for ${metadata.catName}.`,
    `Keep identity consistent: ${metadata.approvedTraitSummary}.`,
    "Create front, side, and three-quarter reference notes before making action assets.",
    "Do not include source paths, photo filenames, URLs, watermarks, provider metadata, scripts, or secret header text."
  ];
  if (rendererTarget === "gltf") {
    return [
      ...base,
      "For GLTF/GLB, create a local single-file asset with accepted action clip names only.",
      "Do not use external buffers, textures, images, data URIs, or required extensions outside the project allowlist."
    ];
  }
  return [
    ...base,
    "For sprite, create transparent PNG files named by accepted action IDs only.",
    "Keep silhouette and scale consistent across every action."
  ];
}

function safetySummary(): LocalTraitPromptPack["safetySummary"] {
  return {
    usesRawPhoto: false,
    uploadsByDefault: false,
    includesProviderCall: false,
    includesSourcePath: false,
    includesPromptSecrets: false
  };
}

function sanitizeText(value: string, fallback: string, maxLength: number) {
  const sanitized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return sanitized || fallback;
}

function hasUnsafeTraitMetadata(metadata: SafeCatTraitMetadata) {
  return Object.values(metadata).some((value) => typeof value === "string" && (
    REMOTE_URL_PATTERN.test(value)
    || ABSOLUTE_PATH_PATTERN.test(value)
    || TOKEN_PATTERN.test(value)
    || PRIVATE_METADATA_PATTERN.test(value)
  ));
}
