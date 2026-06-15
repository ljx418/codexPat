import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeProviderOutput, validateCoverageTable } from "./asset-normalizer";
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scanGLTFPath } from "./gltf-deep-scanner";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const DESKTOP_SRC_DIR = dirname(TEST_DIR);
const DESKTOP_DIR = dirname(DESKTOP_SRC_DIR);
const APPS_DIR = dirname(DESKTOP_DIR);
const REPO_ROOT = dirname(APPS_DIR);
const FIXTURE_CAT_GLB = join(REPO_ROOT, "fixtures/manual/visual-assets/imported-gltf-prototype-cat-v1/cat.glb");

describe("AssetNormalizer", () => {
  const outputDir = "/tmp/v8_3_test_normalizer";

  it("normalizes fixture cat.glb successfully", () => {
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true });
    }

    const result = normalizeProviderOutput(FIXTURE_CAT_GLB, outputDir, {
      packId: "test-cat-pack",
      version: "1.0.0",
      providerName: "Tripo3D",
      licenseType: "Tripo3D trial",
      licenseAttribution: "Generated via Tripo3D API"
    });

    assert.strictEqual(result.ok, true, `normalization failed: ${JSON.stringify(result.errors)}`);
    assert.ok(result.manifest, "manifest should be set");
    assert.ok(result.scanResult, "scanResult should be set");
    assert.ok(result.coverageTable, "coverageTable should be set");
    assert.ok(result.outputPath, "outputPath should be set");

    const manifest = result.manifest!;
    assert.strictEqual(manifest.schemaVersion, "5.8");
    assert.strictEqual(manifest.packId, "test-cat-pack");
    assert.strictEqual(manifest.rendererKind, "gltf");
    assert.ok((manifest as any).displayName, "displayName should be set");
    const assetEntry = Object.values(manifest.assets)[0] as any;
    assert.ok(assetEntry?.fileName, "asset entry should include fileName");

    const actionIds = Object.keys(manifest.actions);
    assert.ok(actionIds.includes("idle"));
    assert.ok(actionIds.includes("thinking"));
    assert.ok(actionIds.includes("running"));
    assert.ok(actionIds.includes("success"));
    assert.ok(actionIds.includes("warning"));
    assert.ok(actionIds.includes("error"));
    assert.ok(actionIds.includes("need_input"));
    assert.ok(actionIds.includes("sleeping"));

    assert.ok(existsSync(result.outputPath!), "output GLB should exist");
    assert.strictEqual(result.scanResult!.ok, true);

    const table = result.coverageTable!;
    assert.strictEqual(table.idle.state, "static_fallback");
    assert.strictEqual(table.success.state, "static_fallback");
    assert.strictEqual(table.error.state, "static_fallback");

    rmSync(outputDir, { recursive: true });
  });

  it("rejects non-existent file", () => {
    const result = normalizeProviderOutput("/nonexistent/file.glb", "/tmp/v8_3_test");
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors.some(e => e.includes("file_not_found")));
  });

  it("validates coverage table with no blocked actions", () => {
    const table = normalizeProviderOutput(FIXTURE_CAT_GLB, "/tmp/v8_3_coverage").coverageTable!;
    const result = validateCoverageTable(table);
    assert.strictEqual(result.ok, true);
    assert.deepStrictEqual(result.blockedActions, []);
  });

  it("detects blocked actions in coverage table", () => {
    const blockedTable = {
      idle: { actionId: "idle", state: "clip_present" as const, assetId: "cat", fallbackReason: null },
      thinking: { actionId: "thinking", state: "blocked" as const, assetId: null, fallbackReason: "missing" },
      running: { actionId: "running", state: "clip_present" as const, assetId: "cat", fallbackReason: null },
      success: { actionId: "success", state: "blocked" as const, assetId: null, fallbackReason: "missing" },
      warning: { actionId: "warning", state: "clip_present" as const, assetId: "cat", fallbackReason: null },
      error: { actionId: "error", state: "clip_present" as const, assetId: "cat", fallbackReason: null },
      need_input: { actionId: "need_input", state: "blocked" as const, assetId: null, fallbackReason: "missing" },
      sleeping: { actionId: "sleeping", state: "clip_present" as const, assetId: "cat", fallbackReason: null }
    };

    const result = validateCoverageTable(blockedTable as any);
    assert.strictEqual(result.ok, false);
    assert.deepStrictEqual(result.blockedActions.sort(), ["thinking", "need_input", "success"].sort());
  });
});

describe("GLTFDeepScanner integration", () => {
  it("scans fixture cat.glb and passes", () => {
    const result = scanGLTFPath(FIXTURE_CAT_GLB);
    assert.strictEqual(result.ok, true, `scan should pass: ${JSON.stringify(result.errors)}`);
    assert.ok(result.stats);
    assert.ok(result.scannedAt);
  });
});
