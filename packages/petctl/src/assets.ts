import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { homedir, platform } from "node:os";
import { EXIT_CODES, type CliResult } from "./output.js";

const CORE_ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"] as const;
const SAFE_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;
const SAFE_TEXT_PATTERN = /^[^\u0000-\u001F\u007F]{1,160}$/;
const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const PATH_ESCAPE_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
const SCRIPT_PATTERN = /\b(?:eval|Function|script|javascript:|shell|exec|spawn|chmod|curl|bash|zsh|powershell)\b/i;
const EXECUTABLE_EXT_PATTERN = /\.(?:sh|bash|zsh|command|app|exe|dll|dylib|so|js|mjs|cjs)$/i;
const MAX_SPRITE_FRAMES_PER_ACTION = 48;

type RendererTarget = "sprite" | "gltf";
type StandardAssetManifest = {
  schemaVersion?: unknown;
  packId?: unknown;
  displayName?: unknown;
  rendererKind?: unknown;
  license?: unknown;
  assets?: unknown;
  actions?: unknown;
};

type AssetLintIssue = {
  reasonCode: string;
  field: string;
};

type ImportedPackRecord = {
  packId: string;
  displayName: string;
  rendererKind: RendererTarget;
  copiedAssetIds: string[];
  manifestHash: string;
  createdAt: string;
  activeInstances: string[];
};

type AssetStore = {
  packs: ImportedPackRecord[];
};

export function generateAssetPromptPack(options: {
  name: string;
  description: string;
  renderer: RendererTarget;
}): CliResult {
  const catName = sanitizePromptText(options.name, "Cat");
  const description = sanitizePromptText(options.description, "cat reference");
  const packId = safeId(`personalized-${catName}`.toLowerCase().replace(/[^a-z0-9._-]+/g, "-"));
  const renderer = options.renderer;
  const promptPrefix = renderer === "gltf"
    ? "Create a local GLB/GLTF stylized desktop cat model"
    : "Create a transparent PNG sprite sheet for a stylized desktop cat";
  const prompts: Record<string, string> = {};

  for (const action of CORE_ACTIONS) {
    prompts[action] = [
      promptPrefix,
      `Cat identity: ${catName}.`,
      `Visual reference notes: ${description}.`,
      `Required action: ${action}.`,
      "Use a cute low-distraction desktop companion style.",
      "Keep output suitable for transparent always-on-top desktop rendering.",
      "Do not include text, logos, watermarks, humans, UI, local paths, URLs, tokens, or executable content."
    ].join(" ");
  }
  prompts.texture = [
    "Create consistent texture/material guidance for the same cat.",
    `Cat identity: ${catName}.`,
    `Reference notes: ${description}.`,
    "Preserve coat colors, markings, eye color, and tail traits across all actions.",
    "Output only safe asset production notes; do not include local paths, URLs, credentials, or scripts."
  ].join(" ");
  prompts.manifest = [
    "Create an Agent Desktop Pet asset manifest with schemaVersion 5.8.",
    `packId must be ${packId}.`,
    `rendererKind must be ${renderer}.`,
    `Core actions required: ${CORE_ACTIONS.join(", ")}.`,
    "Use safe asset IDs and relative file names only."
  ].join(" ");

  return {
    ok: true,
    exitCode: EXIT_CODES.success,
    assetPromptPack: {
      packId,
      catName,
      rendererTarget: renderer,
      prompts,
      safetyNotes: [
        "User photos stay outside this prompt pack output.",
        "Use external generation only after explicit user approval.",
        "Generated assets must be imported through manifest validation before rendering."
      ]
    }
  };
}

export function importAssetPack(options: {
  manifestPath: string;
  name?: string;
  storePath?: string;
  storageRoot?: string;
  now?: Date;
}): CliResult {
  const manifestPath = resolve(options.manifestPath);
  if (!existsSync(manifestPath)) {
    return failure("asset_manifest_not_found", "asset manifest not found");
  }
  let parsed: StandardAssetManifest;
  const rawManifest = readFileSync(manifestPath, "utf8");
  try {
    parsed = JSON.parse(rawManifest) as StandardAssetManifest;
  } catch {
    return failure("asset_manifest_invalid_json", "asset manifest is invalid json");
  }

  const validation = validateImportManifest(parsed);
  if (!validation.ok) {
    return failure(validation.reasonCode, validation.reason);
  }

  const packId = parsed.packId as string;
  const rendererKind = parsed.rendererKind as RendererTarget;
  const displayName = sanitizePromptText(options.name ?? String(parsed.displayName ?? packId), packId);
  const manifestDir = dirname(manifestPath);
  const storageRoot = options.storageRoot ?? defaultAssetStorageRoot();
  const targetDir = join(storageRoot, packId);
  const copiedAssetIds: string[] = [];

  mkdirSync(targetDir, { recursive: true });
  const copiedFiles = new Set<string>();
  for (const [assetId, asset] of Object.entries(parsed.assets as Record<string, unknown>)) {
    const fileNames = assetFileNames(asset, rendererKind);
    if (!fileNames.ok) return failure(fileNames.reasonCode, fileNames.reason);
    for (const fileName of fileNames.fileNames) {
      if (copiedFiles.has(fileName)) continue;
      const source = join(manifestDir, fileName);
      if (!existsSync(source)) {
        return failure("asset_file_not_found", "asset file not found");
      }
      copyFileSync(source, join(targetDir, fileName));
      copiedFiles.add(fileName);
    }
    copiedAssetIds.push(assetId);
  }
  writeFileSync(join(targetDir, "manifest.json"), JSON.stringify(parsed, null, 2));

  const record: ImportedPackRecord = {
    packId,
    displayName,
    rendererKind,
    copiedAssetIds,
    manifestHash: sha256(rawManifest),
    createdAt: (options.now ?? new Date()).toISOString(),
    activeInstances: []
  };
  const storePath = options.storePath ?? defaultAssetStorePath();
  const store = readAssetStore(storePath);
  store.packs = [...store.packs.filter((item) => item.packId !== packId), record];
  writeAssetStore(storePath, store);

  return {
    ok: true,
    exitCode: EXIT_CODES.success,
    assetImport: {
      packId,
      displayName,
      rendererKind,
      copiedAssetIds,
      manifestHash: record.manifestHash,
      appManagedStorage: true
    }
  };
}

export function lintAssetPack(options: {
  manifestPath: string;
}): CliResult {
  const manifestPath = resolve(options.manifestPath);
  if (!existsSync(manifestPath)) {
    return failure("asset_manifest_not_found", "asset manifest not found");
  }
  let parsed: StandardAssetManifest;
  try {
    parsed = JSON.parse(readFileSync(manifestPath, "utf8")) as StandardAssetManifest;
  } catch {
    return failure("asset_manifest_invalid_json", "asset manifest is invalid json");
  }

  const validation = validateImportManifest(parsed);
  if (!validation.ok) {
    return failure(validation.reasonCode, validation.reason);
  }

  const issues = lintVisualStability(parsed);
  if (issues.length > 0) {
    return {
      ok: false,
      exitCode: EXIT_CODES.localValidation,
      reasonCode: issues[0].reasonCode,
      reason: "asset lint failed",
      assetLint: {
        status: "failed",
        packId: parsed.packId,
        rendererKind: parsed.rendererKind,
        issues,
        safeOutputFields: V14_ASSET_LINT_SAFE_OUTPUT_FIELDS
      }
    };
  }

  return {
    ok: true,
    exitCode: EXIT_CODES.success,
    assetLint: {
      status: "passed",
      packId: parsed.packId,
      rendererKind: parsed.rendererKind,
      coreActions: CORE_ACTIONS.length,
      safeOutputFields: V14_ASSET_LINT_SAFE_OUTPUT_FIELDS
    }
  };
}

export function listAssetPacks(options: { storePath?: string } = {}): CliResult {
  const store = readAssetStore(options.storePath ?? defaultAssetStorePath());
  return {
    ok: true,
    exitCode: EXIT_CODES.success,
    assetPacks: store.packs.map((pack) => ({
      packId: pack.packId,
      displayName: pack.displayName,
      rendererKind: pack.rendererKind,
      copiedAssetIds: pack.copiedAssetIds,
      manifestHash: pack.manifestHash,
      createdAt: pack.createdAt,
      activeInstances: pack.activeInstances
    }))
  };
}

const V14_ASSET_LINT_SAFE_OUTPUT_FIELDS = [
  "status",
  "packId",
  "rendererKind",
  "coreActions",
  "issues.reasonCode",
  "issues.field",
  "safeOutputFields"
] as const;

function lintVisualStability(manifest: StandardAssetManifest): AssetLintIssue[] {
  const issues: AssetLintIssue[] = [];
  const assets = manifest.assets as Record<string, unknown>;
  const actions = manifest.actions as Record<string, unknown>;

  for (const actionId of CORE_ACTIONS) {
    const action = actions[actionId];
    if (!isRecord(action) || typeof action.assetId !== "string") {
      issues.push({ reasonCode: "core_action_missing", field: `actions.${actionId}` });
      continue;
    }
    const asset = assets[action.assetId];
    if (!isRecord(asset)) {
      issues.push({ reasonCode: "asset_missing", field: `assets.${action.assetId}` });
      continue;
    }
    if (action.loop === true && asset.loopClosed === false) {
      issues.push({ reasonCode: "loop_open", field: `assets.${action.assetId}.loopClosed` });
    }
    if (asset.transparentFrame === true || isRecord(asset.visualDiagnostics) && asset.visualDiagnostics.transparentFrame === true) {
      issues.push({ reasonCode: "transparent_frame", field: `assets.${action.assetId}.visualDiagnostics.transparentFrame` });
    }
    if (asset.offCanvasFrame === true || isRecord(asset.visualDiagnostics) && asset.visualDiagnostics.offCanvasFrame === true) {
      issues.push({ reasonCode: "off_canvas_frame", field: `assets.${action.assetId}.visualDiagnostics.offCanvasFrame` });
    }
    if (asset.frameSizeConsistent === false || isRecord(asset.visualDiagnostics) && asset.visualDiagnostics.frameSizeConsistent === false) {
      issues.push({ reasonCode: "size_mismatch", field: `assets.${action.assetId}.visualDiagnostics.frameSizeConsistent` });
    }
    if (asset.fallbackFlashRisk === true || isRecord(asset.visualDiagnostics) && asset.visualDiagnostics.fallbackFlashRisk === true) {
      issues.push({ reasonCode: "fallback_flash_risk", field: `assets.${action.assetId}.visualDiagnostics.fallbackFlashRisk` });
    }
  }

  return issues;
}

export function activateAssetPack(options: {
  packId: string;
  instanceId: string;
  storePath?: string;
}): CliResult {
  if (!SAFE_ID_PATTERN.test(options.packId)) {
    return failure("asset_pack_invalid", "asset pack id is invalid");
  }
  if (!/^(default|codex_[A-Za-z0-9._-]{1,80})$/.test(options.instanceId)) {
    return failure("instance_id_invalid", "instance id is invalid");
  }
  const storePath = options.storePath ?? defaultAssetStorePath();
  const store = readAssetStore(storePath);
  const pack = store.packs.find((item) => item.packId === options.packId);
  if (!pack) {
    return failure("asset_pack_not_found", "asset pack not found");
  }
  for (const item of store.packs) {
    item.activeInstances = item.activeInstances.filter((instanceId) => instanceId !== options.instanceId);
  }
  pack.activeInstances = Array.from(new Set([...pack.activeInstances, options.instanceId]));
  writeAssetStore(storePath, store);
  return {
    ok: true,
    exitCode: EXIT_CODES.success,
    assetActivation: {
      packId: pack.packId,
      instanceId: options.instanceId,
      rendererKind: pack.rendererKind
    }
  };
}

export function renameAssetPack(options: {
  packId: string;
  name: string;
  storePath?: string;
}): CliResult {
  if (!SAFE_ID_PATTERN.test(options.packId)) {
    return failure("asset_pack_invalid", "asset pack id is invalid");
  }
  const displayName = sanitizePromptText(options.name, "");
  if (!displayName || !SAFE_TEXT_PATTERN.test(displayName) || scanForbidden(displayName)) {
    return failure("asset_display_name_invalid", "asset display name is invalid");
  }
  const storePath = options.storePath ?? defaultAssetStorePath();
  const store = readAssetStore(storePath);
  const pack = store.packs.find((item) => item.packId === options.packId);
  if (!pack) {
    return failure("asset_pack_not_found", "asset pack not found");
  }
  pack.displayName = displayName;
  writeAssetStore(storePath, store);
  return {
    ok: true,
    exitCode: EXIT_CODES.success,
    assetRename: {
      packId: pack.packId,
      displayName: pack.displayName,
      rendererKind: pack.rendererKind
    }
  };
}

export function deleteAssetPack(options: {
  packId: string;
  storePath?: string;
  storageRoot?: string;
}): CliResult {
  if (!SAFE_ID_PATTERN.test(options.packId)) {
    return failure("asset_pack_invalid", "asset pack id is invalid");
  }
  const storePath = options.storePath ?? defaultAssetStorePath();
  const storageRoot = options.storageRoot ?? defaultAssetStorageRoot();
  const store = readAssetStore(storePath);
  const pack = store.packs.find((item) => item.packId === options.packId);
  if (!pack) {
    return failure("asset_pack_not_found", "asset pack not found");
  }
  const wasActive = pack.activeInstances.length > 0;
  store.packs = store.packs.filter((item) => item.packId !== options.packId);
  rmSync(join(storageRoot, options.packId), { recursive: true, force: true });
  writeAssetStore(storePath, store);
  return {
    ok: true,
    exitCode: EXIT_CODES.success,
    assetDelete: {
      packId: pack.packId,
      rendererKind: pack.rendererKind,
      wasActive
    }
  };
}

function validateImportManifest(manifest: StandardAssetManifest): { ok: true } | { ok: false; reasonCode: string; reason: string } {
  const forbidden = scanForbidden(manifest);
  if (forbidden) return { ok: false, reasonCode: "asset_manifest_forbidden_content", reason: "asset manifest contains forbidden content" };
  if (manifest.schemaVersion !== "5.8") return { ok: false, reasonCode: "asset_manifest_schema_invalid", reason: "asset manifest schema is invalid" };
  if (typeof manifest.packId !== "string" || !SAFE_ID_PATTERN.test(manifest.packId)) return { ok: false, reasonCode: "asset_pack_invalid", reason: "asset pack id is invalid" };
  if (typeof manifest.displayName !== "string" || !SAFE_TEXT_PATTERN.test(manifest.displayName)) return { ok: false, reasonCode: "asset_display_name_invalid", reason: "asset display name is invalid" };
  if (manifest.rendererKind !== "sprite" && manifest.rendererKind !== "gltf") return { ok: false, reasonCode: "asset_renderer_invalid", reason: "asset renderer is invalid" };
  if (!isRecord(manifest.license)) return { ok: false, reasonCode: "asset_license_missing", reason: "asset license is missing" };
  if (!isRecord(manifest.assets) || !isRecord(manifest.actions)) return { ok: false, reasonCode: "asset_manifest_invalid", reason: "asset manifest is invalid" };

  for (const action of CORE_ACTIONS) {
    const actionEntry = manifest.actions[action];
    if (!isRecord(actionEntry) || typeof actionEntry.assetId !== "string") {
      return { ok: false, reasonCode: "core_action_missing", reason: "required core action is missing" };
    }
    if (!isRecord(manifest.assets[actionEntry.assetId])) {
      return { ok: false, reasonCode: "asset_missing", reason: "action asset does not exist" };
    }
  }

  for (const [assetId, asset] of Object.entries(manifest.assets)) {
    if (!SAFE_ID_PATTERN.test(assetId) || !isRecord(asset)) return { ok: false, reasonCode: "asset_manifest_invalid", reason: "asset manifest is invalid" };
    const fileNames = assetFileNames(asset, manifest.rendererKind);
    if (!fileNames.ok) return fileNames;
  }
  return { ok: true };
}

function assetFileNames(asset: unknown, rendererKind: unknown): { ok: true; fileNames: string[] } | { ok: false; reasonCode: string; reason: string } {
  if (!isRecord(asset)) return { ok: false, reasonCode: "asset_manifest_invalid", reason: "asset manifest is invalid" };
  const fileNames: string[] = [];
  if (typeof asset.fileName === "string") {
    if (!isSafeFileName(asset.fileName, rendererKind)) {
      return { ok: false, reasonCode: "asset_file_invalid", reason: "asset file name is invalid" };
    }
    fileNames.push(asset.fileName);
  }
  if (rendererKind === "sprite" && "frameFiles" in asset) {
    if (!Array.isArray(asset.frameFiles) || asset.frameFiles.length < 2 || asset.frameFiles.length > MAX_SPRITE_FRAMES_PER_ACTION) {
      return { ok: false, reasonCode: "asset_frame_files_invalid", reason: "asset frame files are invalid" };
    }
    const seen = new Set<string>();
    for (const frameFile of asset.frameFiles) {
      if (typeof frameFile !== "string" || !isSafeFileName(frameFile, rendererKind) || seen.has(frameFile)) {
        return { ok: false, reasonCode: "asset_frame_files_invalid", reason: "asset frame files are invalid" };
      }
      seen.add(frameFile);
      fileNames.push(frameFile);
    }
  }
  if (rendererKind === "sprite" && fileNames.length > 0) {
    if ("fps" in asset && (!Number.isInteger(asset.fps) || Number(asset.fps) < 1 || Number(asset.fps) > 24)) {
      return { ok: false, reasonCode: "asset_fps_invalid", reason: "asset fps is invalid" };
    }
    return { ok: true, fileNames };
  }
  if (fileNames.length === 1) return { ok: true, fileNames };
  return { ok: false, reasonCode: "asset_file_invalid", reason: "asset file name is invalid" };
}

function isSafeFileName(fileName: string, rendererKind: unknown) {
  if (!/^[A-Za-z0-9._-]{1,96}$/.test(fileName)) return false;
  if (REMOTE_URL_PATTERN.test(fileName) || ABSOLUTE_PATH_PATTERN.test(fileName) || PATH_ESCAPE_PATTERN.test(fileName) || SCRIPT_PATTERN.test(fileName) || EXECUTABLE_EXT_PATTERN.test(fileName)) return false;
  if (rendererKind === "sprite") return /\.png$/i.test(fileName);
  return /\.(?:glb|gltf)$/i.test(fileName);
}

function scanForbidden(value: unknown): boolean {
  if (typeof value === "string") {
    return REMOTE_URL_PATTERN.test(value) || ABSOLUTE_PATH_PATTERN.test(value) || PATH_ESCAPE_PATTERN.test(value) || SCRIPT_PATTERN.test(value) || EXECUTABLE_EXT_PATTERN.test(value);
  }
  if (Array.isArray(value)) return value.some(scanForbidden);
  if (!isRecord(value)) return false;
  for (const [key, nested] of Object.entries(value)) {
    if (/(?:raw|payload|prompt|photo|path|token|authorization|workspace|config|transcript)/i.test(key)) return true;
    if (scanForbidden(nested)) return true;
  }
  return false;
}

function readAssetStore(path: string): AssetStore {
  if (!existsSync(path)) return { packs: [] };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<AssetStore>;
    return { packs: Array.isArray(parsed.packs) ? parsed.packs.filter(isImportedPackRecord) : [] };
  } catch {
    return { packs: [] };
  }
}

function writeAssetStore(path: string, store: AssetStore) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(store, null, 2));
}

function defaultAssetStorageRoot() {
  return join(defaultAppDataDir(), "asset-packs");
}

function defaultAssetStorePath() {
  return join(defaultAppDataDir(), "personalized-assets.json");
}

function defaultAppDataDir() {
  const appId = "agent-desktop-pet";
  if (platform() === "darwin") return join(homedir(), "Library", "Application Support", appId);
  return join(process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share"), appId);
}

function failure(reasonCode: string, reason: string): CliResult {
  return { ok: false, exitCode: EXIT_CODES.localValidation, reasonCode, reason };
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function safeId(value: string) {
  const normalized = value.replace(/^-+|-+$/g, "").slice(0, 48);
  return SAFE_ID_PATTERN.test(normalized) ? normalized : "personalized-cat";
}

function sanitizePromptText(value: string, fallback: string) {
  const sanitized = value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!sanitized || REMOTE_URL_PATTERN.test(sanitized) || ABSOLUTE_PATH_PATTERN.test(sanitized)) return fallback;
  return sanitized;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isImportedPackRecord(value: unknown): value is ImportedPackRecord {
  return isRecord(value) &&
    typeof value.packId === "string" &&
    typeof value.displayName === "string" &&
    (value.rendererKind === "sprite" || value.rendererKind === "gltf") &&
    Array.isArray(value.copiedAssetIds) &&
    typeof value.manifestHash === "string" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.activeInstances);
}
