const CORE_ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"] as const;
const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const TOKEN_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{8,}|Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json)\b/i;

export type GuidedAssetRendererTarget = "sprite" | "gltf";

export type GuidedAssetPromptPack = {
  packId: string;
  catName: string;
  rendererTarget: GuidedAssetRendererTarget;
  photoReferenceMode: "not_provided" | "local_reference_only";
  actionPrompts: Record<string, string>;
  manifestTemplate: string;
  importChecklist: string[];
  safetyNotes: string[];
  evidenceSummary: {
    actionCount: number;
    rendererTarget: GuidedAssetRendererTarget;
    storesRawPhoto: false;
    uploadsByDefault: false;
    includesProviderCall: false;
    photoReferenceMode: "not_provided" | "local_reference_only";
  };
};

export function generateGuidedAssetPromptPack(options: {
  catName: string;
  visualNotes: string;
  rendererTarget: GuidedAssetRendererTarget;
  photoReferenceProvided?: boolean;
}): GuidedAssetPromptPack {
  const catName = sanitizeText(options.catName, "Personalized Cat", 80);
  const visualNotes = sanitizeText(options.visualNotes, "user-approved cat appearance notes", 360);
  const rendererTarget = options.rendererTarget === "gltf" ? "gltf" : "sprite";
  const photoReferenceMode = options.photoReferenceProvided ? "local_reference_only" : "not_provided";
  const packId = safePackId(catName);
  const actionPrompts: Record<string, string> = {};
  const rendererInstruction = rendererTarget === "gltf"
    ? "Create local single-file GLB/GLTF-compatible cat action assets with no external buffers, textures, URLs, scripts, or path references."
    : "Create transparent PNG cat action sprites with no background, text, logos, URLs, scripts, or path references.";

  for (const action of CORE_ACTIONS) {
    actionPrompts[action] = [
      rendererInstruction,
      `Cat identity: ${catName}.`,
      `Approved visual notes: ${visualNotes}.`,
      `Photo reference mode: ${photoReferenceMode === "local_reference_only" ? "optional local reference only, not uploaded or persisted by this app" : "no photo reference provided"}.`,
      `Required action/state: ${action}.`,
      "Keep the same cat identity, coat colors, markings, eye color, and tail traits across every action.",
      "Use a cute low-distraction desktop companion style suitable for an always-on-top pet.",
      "Do not include humans, UI chrome, watermarks, local paths, URLs, tokens, Authorization text, executable code, or provider metadata."
    ].join(" ");
  }

  return {
    packId,
    catName,
    rendererTarget,
    photoReferenceMode,
    actionPrompts,
    manifestTemplate: buildManifestTemplate(packId, catName, rendererTarget),
    importChecklist: [
      "Generate one asset for each required core action.",
      `Name files ${rendererTarget === "sprite" ? "<action>.png" : "<action>.glb"} using idle, thinking, running, success, warning, error, need_input, sleeping.`,
      "Keep all assets local and avoid external textures, buffers, URLs, scripts, and absolute paths.",
      "Create manifest.json from the template and verify every action points to a local relative file name.",
      "Import the manifest through Desktop Manager, then activate the imported pack on one target PetInstance.",
      "If a photo was used as reference, keep it outside this app unless a future explicit upload/retention consent flow is accepted.",
      "Confirm the target pet renders the imported pack and unrelated pets remain unchanged."
    ],
    safetyNotes: [
      "V6.5 does not upload photos by default.",
      "V6.5 does not generate 3D assets locally.",
      "Raw photo bytes, EXIF/GPS, source file names, and full paths are not stored by this generated prompt pack.",
      "Generated assets must still pass local import validation and V5.12 runtime rendering validation."
    ],
    evidenceSummary: {
      actionCount: CORE_ACTIONS.length,
      rendererTarget,
      storesRawPhoto: false,
      uploadsByDefault: false,
      includesProviderCall: false,
      photoReferenceMode
    }
  };
}

function buildManifestTemplate(packId: string, catName: string, rendererTarget: GuidedAssetRendererTarget) {
  const extension = rendererTarget === "sprite" ? "png" : "glb";
  const assets = Object.fromEntries(CORE_ACTIONS.map((action) => [
    action,
    {
      assetId: action,
      kind: rendererTarget,
      fileName: `${action}.${extension}`
    }
  ]));
  const actions = Object.fromEntries(CORE_ACTIONS.map((action) => [
    action,
    {
      assetId: action,
      loop: action === "idle" || action === "thinking" || action === "running" || action === "sleeping",
      priority: action === "error" || action === "need_input" ? "interrupt" : action === "idle" || action === "sleeping" ? "base" : "transient"
    }
  ]));
  return JSON.stringify({
    schemaVersion: "5.8",
    packId,
    displayName: `${catName} ${rendererTarget.toUpperCase()} Pack`,
    rendererKind: rendererTarget,
    license: {
      type: "user-provided",
      attribution: `${catName} user generated local asset pack`
    },
    assets,
    actions
  }, null, 2);
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
  const normalized = `guided-${catName.toLowerCase()}`
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return /^[a-z0-9._-]{1,64}$/.test(normalized) ? normalized : "guided-personalized-cat";
}
