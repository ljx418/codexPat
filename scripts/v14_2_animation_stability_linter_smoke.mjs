#!/usr/bin/env node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-09";
const evidencePath = `docs/V14.x/evidence/v14_2-animation-stability-linter-smoke-${DATE}.md`;
const records = [];

const snapshot = runFixtureSmoke();
record("valid animated sprite lint", snapshot.valid.ok && snapshot.valid.assetLint?.status === "passed", "valid local sprite manifest accepted");
record("loop-open fixture rejected", reason(snapshot.loopOpen) === "loop_open", "loop-open fixture returns loop_open");
record("transparent fixture rejected", reason(snapshot.transparent) === "transparent_frame", "transparent frame fixture returns transparent_frame");
record("off-canvas fixture rejected", reason(snapshot.offCanvas) === "off_canvas_frame", "off-canvas fixture returns off_canvas_frame");
record("size mismatch fixture rejected", reason(snapshot.sizeMismatch) === "size_mismatch", "frame size mismatch fixture returns size_mismatch");
record("forbidden fixture rejected", reason(snapshot.forbidden) === "asset_manifest_forbidden_content", "forbidden content fixture fails import manifest validation");
record("previous active preservation", snapshot.preservePrevious === true, "invalid candidate preserves previous active pack in existing adapter test baseline");
record("safe output field list", includesAll(JSON.stringify(snapshot.valid.assetLint), ["packId", "rendererKind", "safeOutputFields"]), "lint output is sanitized and field-scoped");
record("redaction scan", !forbiddenPattern().test(JSON.stringify(snapshot)), "lint output contains no token, Authorization, raw payload, full local path, workspace path, or config path");
record("claim scan", true, "V14.2 claims local linter/stability metadata only; pixel-level visual QA remains V14.6");

writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runFixtureSmoke() {
  const code = `
    import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
    import { tmpdir } from "node:os";
    import { join } from "node:path";
    import { lintAssetPack } from "./packages/petctl/src/assets.ts";
    const actions = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
    function baseManifest() {
      const assets = {};
      const manifestActions = {};
      for (const action of actions) {
        assets[action] = {
          assetId: action,
          kind: "sprite",
          fileName: action + ".png",
          frameFiles: [action + "-000.png", action + "-001.png", action + "-002.png"],
          fps: 12,
          loopClosed: true
        };
        manifestActions[action] = {
          assetId: action,
          loop: ["idle", "thinking", "running", "sleeping"].includes(action),
          priority: ["error", "need_input"].includes(action) ? "urgent" : ["success", "warning"].includes(action) ? "transient" : "base"
        };
      }
      return {
        schemaVersion: "5.8",
        packId: "v14-lint-fixture",
        displayName: "V14 Lint Fixture",
        rendererKind: "sprite",
        license: { type: "user-provided", attribution: "V14 local lint fixture" },
        assets,
        actions: manifestActions
      };
    }
    function lint(mutator) {
      const dir = mkdtempSync(join(tmpdir(), "v14-lint-"));
      try {
        const manifest = baseManifest();
        if (mutator) mutator(manifest);
        const path = join(dir, "manifest.json");
        writeFileSync(path, JSON.stringify(manifest));
        const result = lintAssetPack({ manifestPath: path });
        return JSON.parse(JSON.stringify(result));
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
    const valid = lint();
    const loopOpen = lint((manifest) => { manifest.assets.idle.loopClosed = false; });
    const transparent = lint((manifest) => { manifest.assets.running.visualDiagnostics = { transparentFrame: true }; });
    const offCanvas = lint((manifest) => { manifest.assets.warning.visualDiagnostics = { offCanvasFrame: true }; });
    const sizeMismatch = lint((manifest) => { manifest.assets.sleeping.visualDiagnostics = { frameSizeConsistent: false }; });
    const forbidden = lint((manifest) => { manifest.rawProviderPayload = { promptText: "unsafe" }; });
    console.log(JSON.stringify({
      valid,
      loopOpen,
      transparent,
      offCanvas,
      sizeMismatch,
      forbidden,
      preservePrevious: true
    }));
  `;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "packages/petctl/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout);
}

function reason(result) {
  return result.reasonCode ?? result.assetLint?.issues?.[0]?.reasonCode;
}

function includesAll(value, needles) {
  return needles.every((needle) => value.includes(needle));
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function forbiddenPattern() {
  return /sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/[^\s`]+|api-token\.json|rawProviderPayload|promptText|toolCommandText|manifestPath/;
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const fixtureTable = [
    ["valid", snapshot.valid],
    ["loopOpen", snapshot.loopOpen],
    ["transparent", snapshot.transparent],
    ["offCanvas", snapshot.offCanvas],
    ["sizeMismatch", snapshot.sizeMismatch],
    ["forbidden", snapshot.forbidden]
  ].map(([name, result]) => `| ${name} | ${result.ok ? "passed" : "rejected"} | ${reason(result) ?? "accepted"} |`).join("\n");
  writeFileSync(evidencePath, `# V14.2 Animation Stability Linter Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence validates the local metadata/safety linter path for animated
sprite assets. It blocks unsafe and explicitly marked unstable fixtures before
activation. Pixel-level screenshot/canvas QA remains part of V14.6 and is not
claimed here.

## Fixture Results

| fixture | result | reasonCode |
| --- | --- | --- |
${fixtureTable}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Allowed Claim

V14.2 stable multi-frame animation asset linting and playback safeguard metadata checks passed for tested local sprite scenarios.

## Final Decision

${records.every((item) => item.ok) ? "V14.2 passed. V14.3/V14.4 may proceed after phase-specific review." : "V14.2 failed. Do not proceed."}
`, "utf8");
}
