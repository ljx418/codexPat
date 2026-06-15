import { readFileSync } from "node:fs";
import { join } from "node:path";
import { existsSync } from "node:fs";

export type GLTFDeepScanStats = {
  fileSizeBytes: number;
  meshCount: number;
  materialCount: number;
  textureCount: number;
  animationCount: number;
  nodeCount: number;
  totalByteLength: number;
};

export type GLTFDeepScanError =
  | "file_not_found"
  | "invalid_glb_magic"
  | "invalid_glb_version"
  | "invalid_json_chunk"
  | "uri_rejected"
  | "external_bin_rejected"
  | "absolute_path_rejected"
  | "path_traversal_rejected"
  | "forbidden_extension"
  | "extensions_required_not_allowlisted"
  | "file_size_exceeded"
  | "mesh_count_exceeded"
  | "material_count_exceeded"
  | "texture_count_exceeded"
  | "animation_count_exceeded"
  | "node_count_exceeded"
  | "animation_duration_exceeded";

export type GLTFDeepScanWarning =
  | "large_file"
  | "high_mesh_count"
  | "high_material_count";

export type GLTFDeepScanResult = {
  ok: boolean;
  errors: Array<{ code: GLTFDeepScanError; field: string; reason: string }>;
  warnings: Array<{ code: GLTFDeepScanWarning; field: string; reason: string }>;
  stats: GLTFDeepScanStats | null;
  scannedAt: string;
};

// Limits
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_MESH_COUNT = 256;
const MAX_MATERIAL_COUNT = 128;
const MAX_TEXTURE_COUNT = 64;
const MAX_ANIMATION_COUNT = 32;
const MAX_NODE_COUNT = 1024;
const MAX_ANIMATION_DURATION_SECONDS = 30;
const MAX_TOTAL_BYTE_LENGTH = 100 * 1024 * 1024; // 100MB

// Allowlisted extensions
const ALLOWLISTED_EXTENSIONS = new Set([
  "KHR_draco_mesh_compression",
  "KHR_meshopt_compression",
  "EXT_meshopt_compression",
  "KHR_texture_transform",
  "KHR_texture_basisu",
  "EXT_texture_webp",
  "MSFT_texture_dds"
]);

// Forbidden URI patterns
// Only reject URIs in actual resource reference fields (buffers, images, shaders)
// NOT in metadata fields like generator, copyright, author, etc.
const URI_RESOURCE_PATTERN = /\b(?:https?:\/\/|file:\/\/|javascript:|data:|wasm:)/i;
// Broader pattern for any string that looks like an external ref
const FORBIDDEN_URI_PATTERNS = [
  /\b(?:https?|wss?|file):\/\//i,           // external URI
  /^(?:https?|wss?|file|data|javascript):/i // string starting with URI scheme
];
// Forbidden path patterns
// Unix absolute path: starts with / but not protocol (https://, file://)
// Windows absolute path: drive letter followed by \ or / (C:\, D:/)
const ABSOLUTE_PATH_PATTERN = /(?:^|\s)[\/~](?!:\/\/)|(?:^|\s)[A-Za-z]:[\\/]/;
const PATH_TRAVERSAL_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
const FORBIDDEN_EXTENSION_PATTERN = /\.(?:sh|bash|zsh|command|app|exe|dll|dylib|so|js|mjs|cjs|py|rb|php|pl|html?|css)$/i;
const EXTERNAL_BIN_PATTERN = /"uri"\s*:\s*"[^"]+\.bin"/i;

interface GLTFJson {
  asset?: { version?: string };
  scene?: number;
  scenes?: unknown[];
  nodes?: unknown[];
  meshes?: unknown[];
  materials?: unknown[];
  textures?: unknown[];
  images?: unknown[];
  animations?: unknown[];
  accessors?: unknown[];
  bufferViews?: unknown[];
  buffers?: unknown[];
  extensionsRequired?: string[];
  extensionsUsed?: string[];
  [key: string]: unknown;
}

function parseGLB(buffer: Buffer): GLTFJson | null {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // GLB magic: 0x46546C67 ("glTF")
  const magic = view.getUint32(0, true);
  if (magic !== 0x46546C67) {
    return null;
  }

  // Version must be 2
  const version = view.getUint32(4, true);
  if (version !== 2) {
    return null;
  }

  // Length
  const length = view.getUint32(8, true);
  if (length !== buffer.byteLength) {
    return null;
  }

  // Chunk 0: JSON
  const chunkLength = view.getUint32(12, true);
  const chunkType = view.getUint32(16, true);

  // 0x4E4F534A = "JSON"
  if (chunkType !== 0x4E4F534A) {
    return null;
  }

  const jsonBytes = buffer.slice(20, 20 + chunkLength);
  const jsonText = jsonBytes.toString("utf-8");
  return JSON.parse(jsonText) as GLTFJson;
}

function parseGLTF(buffer: Buffer): GLTFJson | null {
  try {
    const text = buffer.toString("utf-8");
    return JSON.parse(text) as GLTFJson;
  } catch {
    return null;
  }
}

function countArrayLength(obj: unknown): number {
  return Array.isArray(obj) ? obj.length : 0;
}

// Fields that contain external URI references (resource locations)
// Path format: $.images[0].uri -> convert to images[].uri for matching
const URI_RESOURCE_FIELD_PATTERNS = [
  /^\$\.buffers\[\]\.uri$/,
  /^\$\.images\[\]\.uri$/,
  /^\$\.shaders\[\]\.uri$/,
  /^\$\.extensions\[\]$/,
  /^\$\.extensionsUsed\[\]$/,
  /^\$\.extensionsRequired\[\]$/
];

function isUriField(path: string): boolean {
  // Convert indexed path to wildcard: $.images[0].uri -> $.images[].uri
  const wildcardPath = path.replace(/\[(\d+)\]/g, "[]");
  return URI_RESOURCE_FIELD_PATTERNS.some(p => p.test(wildcardPath));
}

function scanURIs(obj: unknown, path: string, errors: GLTFDeepScanResult["errors"]): void {
  if (typeof obj === "string") {
    // Only reject URIs in resource reference fields
    if (isUriField(path)) {
      if (URI_RESOURCE_PATTERN.test(obj)) {
        errors.push({ code: "uri_rejected", field: path, reason: `external URI rejected in resource field: ${obj.substring(0, 50)}` });
      }
      // Also reject javascript: and data: in resource fields regardless of pattern
      if (/^(javascript|data):/i.test(obj)) {
        errors.push({ code: "uri_rejected", field: path, reason: `forbidden URI scheme rejected: ${obj.substring(0, 50)}` });
      }
    }
    // Reject absolute paths in any context
    if (ABSOLUTE_PATH_PATTERN.test(obj)) {
      errors.push({ code: "absolute_path_rejected", field: path, reason: `absolute path rejected: ${obj}` });
    }
    if (PATH_TRAVERSAL_PATTERN.test(obj)) {
      errors.push({ code: "path_traversal_rejected", field: path, reason: `path traversal rejected: ${obj}` });
    }
    if (FORBIDDEN_EXTENSION_PATTERN.test(obj)) {
      errors.push({ code: "forbidden_extension", field: path, reason: `forbidden extension rejected: ${obj}` });
    }
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => scanURIs(item, `${path}[${i}]`, errors));
    return;
  }

  if (obj !== null && typeof obj === "object") {
    for (const [key, val] of Object.entries(obj)) {
      scanURIs(val, `${path}.${key}`, errors);
    }
  }
}

function computeStats(gltf: GLTFJson): GLTFDeepScanStats {
  let totalByteLength = 0;

  if (Array.isArray(gltf.buffers)) {
    for (const buf of gltf.buffers) {
      if (buf && typeof buf === "object" && "byteLength" in buf) {
        totalByteLength += Number((buf as { byteLength?: number }).byteLength || 0);
      }
    }
  }

  return {
    fileSizeBytes: 0, // filled by caller
    meshCount: countArrayLength(gltf.meshes),
    materialCount: countArrayLength(gltf.materials),
    textureCount: countArrayLength(gltf.textures),
    animationCount: countArrayLength(gltf.animations),
    nodeCount: countArrayLength(gltf.nodes),
    totalByteLength
  };
}

function checkExtensions(gltf: GLTFJson, errors: GLTFDeepScanResult["errors"]): void {
  const required = gltf.extensionsRequired;
  if (Array.isArray(required)) {
    for (const ext of required) {
      if (typeof ext === "string" && !ALLOWLISTED_EXTENSIONS.has(ext)) {
        errors.push({
          code: "extensions_required_not_allowlisted",
          field: "extensionsRequired",
          reason: `extension "${ext}" is not allowlisted`
        });
      }
    }
  }
}

function checkLimits(stats: GLTFDeepScanStats, fileSizeBytes: number, errors: GLTFDeepScanResult["errors"], warnings: GLTFDeepScanResult["warnings"]): void {
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    errors.push({ code: "file_size_exceeded", field: "$", reason: `file size ${fileSizeBytes} exceeds ${MAX_FILE_SIZE_BYTES}` });
  } else if (fileSizeBytes > 10 * 1024 * 1024) {
    warnings.push({ code: "large_file", field: "$", reason: `file size ${fileSizeBytes} is large` });
  }

  if (stats.meshCount > MAX_MESH_COUNT) {
    errors.push({ code: "mesh_count_exceeded", field: "meshes", reason: `mesh count ${stats.meshCount} exceeds ${MAX_MESH_COUNT}` });
  } else if (stats.meshCount > 100) {
    warnings.push({ code: "high_mesh_count", field: "meshes", reason: `mesh count ${stats.meshCount} is high` });
  }

  if (stats.materialCount > MAX_MATERIAL_COUNT) {
    errors.push({ code: "material_count_exceeded", field: "materials", reason: `material count ${stats.materialCount} exceeds ${MAX_MATERIAL_COUNT}` });
  } else if (stats.materialCount > 64) {
    warnings.push({ code: "high_material_count", field: "materials", reason: `material count ${stats.materialCount} is high` });
  }

  if (stats.textureCount > MAX_TEXTURE_COUNT) {
    errors.push({ code: "texture_count_exceeded", field: "textures", reason: `texture count ${stats.textureCount} exceeds ${MAX_TEXTURE_COUNT}` });
  }

  if (stats.animationCount > MAX_ANIMATION_COUNT) {
    errors.push({ code: "animation_count_exceeded", field: "animations", reason: `animation count ${stats.animationCount} exceeds ${MAX_ANIMATION_COUNT}` });
  }

  if (stats.nodeCount > MAX_NODE_COUNT) {
    errors.push({ code: "node_count_exceeded", field: "nodes", reason: `node count ${stats.nodeCount} exceeds ${MAX_NODE_COUNT}` });
  }

  if (stats.totalByteLength > MAX_TOTAL_BYTE_LENGTH) {
    errors.push({ code: "file_size_exceeded", field: "buffers", reason: `total byte length ${stats.totalByteLength} exceeds ${MAX_TOTAL_BYTE_LENGTH}` });
  }
}

export function scanGLTFBuffer(buffer: Buffer): GLTFDeepScanResult {
  const errors: GLTFDeepScanResult["errors"] = [];
  const warnings: GLTFDeepScanResult["warnings"] = [];

  const gltf = parseGLB(buffer) ?? parseGLTF(buffer);
  if (!gltf) {
    return {
      ok: false,
      errors: [{ code: "invalid_json_chunk", field: "$", reason: "file is not a valid GLB or GLTF JSON" }],
      warnings,
      stats: null,
      scannedAt: new Date().toISOString()
    };
  }

  const fileSizeBytes = buffer.byteLength;
  const stats = computeStats(gltf);
  stats.fileSizeBytes = fileSizeBytes;

  scanURIs(gltf, "$", errors);
  checkExtensions(gltf, errors);
  checkLimits(stats, fileSizeBytes, errors, warnings);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats,
    scannedAt: new Date().toISOString()
  };
}

export function scanGLTFPath(filePath: string): GLTFDeepScanResult {
  if (!existsSync(filePath)) {
    return {
      ok: false,
      errors: [{ code: "file_not_found", field: "$", reason: `file not found: ${filePath}` }],
      warnings: [],
      stats: null,
      scannedAt: new Date().toISOString()
    };
  }

  const buffer = readFileSync(filePath);
  return scanGLTFBuffer(buffer);
}
