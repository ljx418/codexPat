import { invoke } from "@tauri-apps/api/core";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Test that the provider GLB from V8.2 can be loaded by GLTFLoader in a Node.js context
// This verifies the GLB is not corrupt and has valid glTF structure

// We use a minimal GLTFLoader check without Three.js (which requires a browser)
// Instead, verify the GLB structure is valid and parseable

export type GLBRuntimeCheck = {
  ok: boolean;
  packId: string;
  glbSize: number;
  glbMagicValid: boolean;
  glbVersion: number;
  jsonChunkValid: boolean;
  meshCount: number;
  materialCount: number;
  textureCount: number;
  animationCount: number;
  nodeCount: number;
  errors: string[];
};

export function checkGLBRuntime(glbPath: string, packId: string): GLBRuntimeCheck {
  const errors: string[] = [];

  if (!existsSync(glbPath)) {
    return {
      ok: false,
      packId,
      glbSize: 0,
      glbMagicValid: false,
      glbVersion: 0,
      jsonChunkValid: false,
      meshCount: 0,
      materialCount: 0,
      textureCount: 0,
      animationCount: 0,
      nodeCount: 0,
      errors: [`GLB file not found: ${glbPath}`]
    };
  }

  const buffer = readFileSync(glbPath);
  const fileSize = buffer.byteLength;

  // Check GLB magic
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const magic = view.getUint32(0, true);
  const glbMagicValid = magic === 0x46546C67; // "glTF"

  if (!glbMagicValid) {
    errors.push("Invalid GLB magic number");
  }

  // Check version
  const version = view.getUint32(4, true);
  const glbVersion = version;

  if (version !== 2) {
    errors.push(`GLB version ${version} is not supported (expected 2)`);
  }

  // Check length
  const length = view.getUint32(8, true);
  if (length !== fileSize) {
    errors.push(`GLB length mismatch: header says ${length}, actual ${fileSize}`);
  }

  // Parse JSON chunk
  let jsonChunkValid = false;
  let meshCount = 0;
  let materialCount = 0;
  let textureCount = 0;
  let animationCount = 0;
  let nodeCount = 0;

  if (glbMagicValid && version === 2) {
    const chunkLength = view.getUint32(12, true);
    const chunkType = view.getUint32(16, true);

    // JSON chunk type is 0x4E4F534A
    if (chunkType === 0x4E4F534A) {
      jsonChunkValid = true;
      const jsonBytes = buffer.slice(20, 20 + chunkLength);
      try {
        const json = JSON.parse(jsonBytes.toString("utf-8"));
        meshCount = Array.isArray(json.meshes) ? json.meshes.length : 0;
        materialCount = Array.isArray(json.materials) ? json.materials.length : 0;
        textureCount = Array.isArray(json.textures) ? json.textures.length : 0;
        animationCount = Array.isArray(json.animations) ? json.animations.length : 0;
        nodeCount = Array.isArray(json.nodes) ? json.nodes.length : 0;
      } catch (e) {
        errors.push(`Failed to parse GLB JSON chunk: ${e}`);
        jsonChunkValid = false;
      }
    } else {
      errors.push(`GLB first chunk is not JSON (type: ${chunkType})`);
    }
  }

  return {
    ok: errors.length === 0 && glbMagicValid && jsonChunkValid,
    packId,
    glbSize: fileSize,
    glbMagicValid,
    glbVersion,
    jsonChunkValid,
    meshCount,
    materialCount,
    textureCount,
    animationCount,
    nodeCount,
    errors
  };
}

// Verify CSS fallback cat is available
export type FallbackCheck = {
  ok: boolean;
  cssFallbackExists: boolean;
  cssFallbackPath: string | null;
};

export function checkCSSFallback(): FallbackCheck {
  const TEST_DIR = dirname(fileURLToPath(import.meta.url));
  const DESKTOP_SRC_DIR = dirname(TEST_DIR);
  const DESKTOP_DIR = dirname(DESKTOP_SRC_DIR);
  const PUBLIC_DIR = join(DESKTOP_DIR, "public");

  // Check for CSS cat fallback in bundled packs
  const cssFallbackPath = join(DESKTOP_DIR, "src/assets/bundled-packs/css-default.manifest.ts");

  return {
    ok: existsSync(cssFallbackPath) || existsSync(join(PUBLIC_DIR, "assets/3d")),
    cssFallbackExists: existsSync(cssFallbackPath),
    cssFallbackPath: cssFallbackPath
  };
}

type RuntimeAssetData = {
  packId: string;
  actionId: string;
  assetId: string;
  rendererKind: string;
  mimeType: string;
  base64: string;
};

const PREVIEW_SIZE = 184;

export async function capturePackPreview(
  packId: string,
  actionId: string = "idle"
): Promise<string> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error("capturePackPreview requires a browser/Tauri runtime with DOM access");
  }

  // Validate pack + action via the dedicated Tauri command.
  await invoke<string>("capture_glb_preview", { packId, actionId });

  // Pull the actual GLB bytes for off-screen WebGL rendering.
  const data = await invoke<RuntimeAssetData>("runtime_personalized_asset_data", {
    packId,
    actionId
  });

  const bytes = decodeBase64(data.base64);

  // Dynamic imports so this module stays loadable in Node.js test contexts.
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  type GLTFType = import("three/examples/jsm/loaders/GLTFLoader.js").GLTF;

  const canvas = document.createElement("canvas");
  canvas.width = PREVIEW_SIZE;
  canvas.height = PREVIEW_SIZE;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setSize(PREVIEW_SIZE, PREVIEW_SIZE);
  renderer.setPixelRatio(1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.set(0, 3.8, 1.1);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x99aabb, 2.2));

  const objectUrl = URL.createObjectURL(new Blob([bytes as BlobPart], { type: data.mimeType }));
  try {
    const gltf = await new Promise<GLTFType>((resolve, reject) => {
      new GLTFLoader().load(objectUrl, resolve, undefined, (err) => reject(err));
    });
    normalizeModelForViewport(gltf.scene, camera);
    scene.add(gltf.scene);
    renderer.render(scene, camera);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
    renderer.dispose();
  }
}

function decodeBase64(value: string): Uint8Array {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function normalizeModelForViewport(
  model: {
    rotation: { set: (x: number, y: number, z: number) => void };
    updateMatrixWorld: (force?: boolean) => void;
    position: { sub: (v: { x: number; y: number; z: number }) => void };
    scale: { setScalar: (s: number) => void };
  },
  camera: {
    position: { set: (x: number, y: number, z: number) => void };
    lookAt: (x: number, y: number, z: number) => void;
    updateProjectionMatrix: () => void;
  }
) {
  model.rotation.set(0, 0, 0);
  model.updateMatrixWorld(true);
  // Conservative uniform scale that fits most imported cat-style models.
  model.scale.setScalar(0.9);
  camera.updateProjectionMatrix();
}