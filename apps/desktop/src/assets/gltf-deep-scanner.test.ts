import { describe, it } from "node:test";
import assert from "node:assert";
import { scanGLTFBuffer } from "./gltf-deep-scanner";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Fixture path: apps/desktop/src/assets -> apps/desktop/src -> apps/desktop -> apps -> repo root
const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const DESKTOP_SRC_DIR = dirname(TEST_DIR);           // apps/desktop/src
const DESKTOP_DIR = dirname(DESKTOP_SRC_DIR);       // apps/desktop
const APPS_DIR = dirname(DESKTOP_DIR);               // apps
const REPO_ROOT = dirname(APPS_DIR);                 // repo root
const FIXTURE_CAT_GLB = join(REPO_ROOT, "fixtures/manual/visual-assets/imported-gltf-prototype-cat-v1/cat.glb");

// Minimal valid GLB (empty model - just header + empty JSON chunk)
function makeMinimalGLB(): Buffer {
  // GLB header: magic(4) + version(4) + length(4) = 12 bytes
  // Chunk 0: JSON empty object {}
  const jsonText = JSON.stringify({ asset: { version: "2.0" } });
  const jsonBytes = Buffer.from(jsonText, "utf-8");
  const jsonChunk = Buffer.alloc(8 + jsonBytes.length);
  jsonChunk.writeUInt32LE(jsonBytes.length, 0);      // chunkLength
  jsonChunk.writeUInt32LE(0x4E4F534A, 4);           // chunkType = JSON
  jsonBytes.copy(jsonChunk, 8);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);  // magic "glTF"
  header.writeUInt32LE(2, 4);           // version 2
  header.writeUInt32LE(header.length + jsonChunk.length, 8); // total length

  return Buffer.concat([header, jsonChunk]);
}

// GLB with URI reference
function makeGLBWithURI(uri: string): Buffer {
  const jsonText = JSON.stringify({
    asset: { version: "2.0" },
    images: [{ uri }]
  });
  const jsonBytes = Buffer.from(jsonText, "utf-8");
  const jsonChunk = Buffer.alloc(8 + jsonBytes.length);
  jsonChunk.writeUInt32LE(jsonBytes.length, 0);
  jsonChunk.writeUInt32LE(0x4E4F534A, 4);
  jsonBytes.copy(jsonChunk, 8);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(header.length + jsonChunk.length, 8);

  return Buffer.concat([header, jsonChunk]);
}

// GLB with path traversal
function makeGLBWithTraversal(): Buffer {
  const jsonText = JSON.stringify({
    asset: { version: "2.0" },
    images: [{ uri: "../../../etc/passwd" }]
  });
  const jsonBytes = Buffer.from(jsonText, "utf-8");
  const jsonChunk = Buffer.alloc(8 + jsonBytes.length);
  jsonChunk.writeUInt32LE(jsonBytes.length, 0);
  jsonChunk.writeUInt32LE(0x4E4F534A, 4);
  jsonBytes.copy(jsonChunk, 8);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(header.length + jsonChunk.length, 8);

  return Buffer.concat([header, jsonChunk]);
}

// GLB with forbidden extension
function makeGLBWithForbiddenExt(): Buffer {
  const jsonText = JSON.stringify({
    asset: { version: "2.0" },
    images: [{ uri: "malicious.sh" }]
  });
  const jsonBytes = Buffer.from(jsonText, "utf-8");
  const jsonChunk = Buffer.alloc(8 + jsonBytes.length);
  jsonChunk.writeUInt32LE(jsonBytes.length, 0);
  jsonChunk.writeUInt32LE(0x4E4F534A, 4);
  jsonBytes.copy(jsonChunk, 8);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(header.length + jsonChunk.length, 8);

  return Buffer.concat([header, jsonChunk]);
}

// GLB with non-allowlisted extension required
function makeGLBWithBadExtension(): Buffer {
  const jsonText = JSON.stringify({
    asset: { version: "2.0" },
    extensionsRequired: ["VENDOR_extension_not_allowlisted"]
  });
  const jsonBytes = Buffer.from(jsonText, "utf-8");
  const jsonChunk = Buffer.alloc(8 + jsonBytes.length);
  jsonChunk.writeUInt32LE(jsonBytes.length, 0);
  jsonChunk.writeUInt32LE(0x4E4F534A, 4);
  jsonBytes.copy(jsonChunk, 8);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(header.length + jsonChunk.length, 8);

  return Buffer.concat([header, jsonChunk]);
}

// GLB with meshes/materials/textures
function makeRichGLB(): Buffer {
  const meshes = Array(10).fill(null).map((_, i) => ({
    primitives: [{}]
  }));
  const materials = Array(5).fill(null).map(() => ({}));
  const textures = Array(3).fill(null).map(() => ({}));
  const animations = Array(2).fill(null).map(() => ({ channels: [], samplers: [] }));
  const nodes = Array(20).fill(null).map(() => ({ mesh: 0 }));

  const jsonText = JSON.stringify({
    asset: { version: "2.0" },
    meshes,
    materials,
    textures,
    animations,
    nodes
  });
  const jsonBytes = Buffer.from(jsonText, "utf-8");
  const jsonChunk = Buffer.alloc(8 + jsonBytes.length);
  jsonChunk.writeUInt32LE(jsonBytes.length, 0);
  jsonChunk.writeUInt32LE(0x4E4F534A, 4);
  jsonBytes.copy(jsonChunk, 8);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(header.length + jsonChunk.length, 8);

  return Buffer.concat([header, jsonChunk]);
}

describe("GLTFDeepScanner", () => {
  it("accepts minimal valid GLB", () => {
    const glb = makeMinimalGLB();
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, true, `expected ok but got errors: ${JSON.stringify(result.errors)}`);
    assert.ok(result.stats);
    assert.strictEqual(result.stats.meshCount, 0);
  });

  it("rejects GLB with https URI", () => {
    const glb = makeGLBWithURI("https://evil.com/model.glb");
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "uri_rejected"), `expected uri_rejected: ${JSON.stringify(result.errors)}`);
  });

  it("rejects GLB with file:// URI", () => {
    const glb = makeGLBWithURI("file:///private/etc/passwd");
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "uri_rejected"), `expected uri_rejected: ${JSON.stringify(result.errors)}`);
  });

  it("rejects GLB with javascript: URI", () => {
    const glb = makeGLBWithURI("javascript:alert(1)");
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "uri_rejected"), `expected uri_rejected: ${JSON.stringify(result.errors)}`);
  });

  it("rejects GLB with data: URI", () => {
    const glb = makeGLBWithURI("data:text/html,<script>alert(1)</script>");
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "uri_rejected"), `expected uri_rejected: ${JSON.stringify(result.errors)}`);
  });

  it("rejects GLB with path traversal", () => {
    const glb = makeGLBWithTraversal();
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "path_traversal_rejected"), `expected path_traversal_rejected: ${JSON.stringify(result.errors)}`);
  });

  it("rejects GLB with forbidden .sh extension", () => {
    const glb = makeGLBWithForbiddenExt();
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "forbidden_extension"), `expected forbidden_extension: ${JSON.stringify(result.errors)}`);
  });

  it("rejects GLB with non-allowlisted extensionsRequired", () => {
    const glb = makeGLBWithBadExtension();
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "extensions_required_not_allowlisted"), `expected extensions_required_not_allowlisted: ${JSON.stringify(result.errors)}`);
  });

  it("allows GLB with allowlisted extension", () => {
    const jsonText = JSON.stringify({
      asset: { version: "2.0" },
      extensionsRequired: ["KHR_draco_mesh_compression"]
    });
    const jsonBytes = Buffer.from(jsonText, "utf-8");
    const jsonChunk = Buffer.alloc(8 + jsonBytes.length);
    jsonChunk.writeUInt32LE(jsonBytes.length, 0);
    jsonChunk.writeUInt32LE(0x4E4F534A, 4);
    jsonBytes.copy(jsonChunk, 8);

    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546C67, 0);
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(header.length + jsonChunk.length, 8);

    const glb = Buffer.concat([header, jsonChunk]);
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, true, `expected ok but got: ${JSON.stringify(result.errors)}`);
  });

  it("counts meshes/materials/textures/animations/nodes", () => {
    const glb = makeRichGLB();
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, true);
    assert.ok(result.stats);
    assert.strictEqual(result.stats.meshCount, 10);
    assert.strictEqual(result.stats.materialCount, 5);
    assert.strictEqual(result.stats.textureCount, 3);
    assert.strictEqual(result.stats.animationCount, 2);
    assert.strictEqual(result.stats.nodeCount, 20);
  });

  it("accepts fixture cat.glb", () => {
    const result = scanGLTFBuffer(
      readFileSync(FIXTURE_CAT_GLB)
    );
    assert.strictEqual(result.ok, true, `fixture scan failed: ${JSON.stringify(result.errors)}`);
    assert.ok(result.stats);
    assert.ok(result.stats.meshCount >= 0);
  });

  it("rejects invalid GLB magic", () => {
    const bad = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const result = scanGLTFBuffer(bad);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "invalid_glb_magic" || e.code === "invalid_json_chunk"));
  });

  it("rejects JSON with absolute path", () => {
    const glb = makeGLBWithURI("/Users/admin/secret.glb");
    const result = scanGLTFBuffer(glb);
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.code === "absolute_path_rejected"), `expected absolute_path_rejected: ${JSON.stringify(result.errors)}`);
  });
});
