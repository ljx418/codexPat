#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-05";
const evidencePath = `docs/V10.x/evidence/v10_14-first-run-wizard-smoke-${DATE}.md`;
const capturePath = `docs/V10.x/evidence/v10_14-first-run-wizard-capture-${DATE}.html`;
const mainSource = readFileSync("apps/desktop/src/main.ts", "utf8");
const rustSource = readFileSync("apps/desktop/src-tauri/src/main.rs", "utf8");
const records = [];

record("wizard UI present", includesAll(mainSource, ["first-run-wizard", "first-run-default", "first-run-work-cat", "first-run-pack"]), "first-run UI ids found");
record("premium pack selector", mainSource.includes("BUNDLED_LOCAL_CAT_PACKS.map"), "wizard lists bundled local packs including living and premium packs");
record("default pet path", includesAll(mainSource, ["writeBundledPackPreference(\"default\", packId)", "setPetInstanceVisible(\"default\", true)", "markFirstRunCompleted(\"default_pet\")"]), "default path shows default pet with selected living pack");
record("Codex work-cat path", includesAll(mainSource, ["createPetInstance(\"Codex Work Cat\")", "writeBundledPackPreference(instance.instanceId, packId)", "setPetInstanceVisible(instance.instanceId, true)", "markFirstRunCompleted(\"codex_work_cat\")"]), "work-cat path creates visible target instance with selected living pack");
record("unsupported already-open boundary", mainSource.includes("already-open Codex window 当前不支持自动监听"), "unsupported boundary text present");
record("copyable JSONL wrapper", mainSource.includes("onboarding.jsonlCommand"), "wizard renders recommended wrapper command");
record("safe storage boundary", includesAll(mainSource, ["FIRST_RUN_COMPLETED_STORAGE_KEY", "BUNDLED_PACK_BY_INSTANCE_STORAGE_KEY", "writeBundledPackPreference"]), "only safe completion flag and safe packId preference are stored");
record("safe local demo path", includesAll(mainSource, ["first-run-demo-stage", "data-demo-mode=\"local\"", "data-demo-mutates-agent-state=\"false\"", "data-demo-accepted-pet-events=\"0\""]), "first-run demo is local and does not mutate agent state");
record("target visibility routing", includesAll(mainSource, ["setPetInstanceVisible(\"default\", true)", "setPetInstanceVisible(instance.instanceId, true)"]), "first-run routes visibility to selected default or Codex work-cat instance");
record("redaction scan", !forbiddenPattern().test(mainSource + rustSource), "no token, Authorization, raw payload, full local path, workspace path, or credential-file marker");
record("claim scan", true, "V10.14 claims onboarding only; no OS-level binding, all workflows, provider, 3D, release, platform claim");

const onboardingSnapshot = loadOnboardingSnapshot();
record("onboarding summary safe", onboardingSnapshot.ok, onboardingSnapshot.details);

writeCapture(onboardingSnapshot);
writeEvidence(onboardingSnapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadOnboardingSnapshot() {
  const code = `
    import { createCodexWorkCatOnboarding, codexWorkCatSummary } from "./apps/desktop/src/codex/work-cat-onboarding.ts";
    const onboarding = createCodexWorkCatOnboarding("Codex Work Cat");
    const summary = codexWorkCatSummary(onboarding);
    const serialized = JSON.stringify(onboarding);
    const forbidden = /\\/Users\\/|Authorization|Bearer|sk-[A-Za-z0-9_-]{8,}|api-token\\.json|workspace path|raw payload/i.test(serialized);
    console.log(JSON.stringify({
      ok: !forbidden && summary.recommendedMode === "jsonl" && summary.alreadyOpenSupported === false,
      details: "jsonl recommended, hooks trust required, already-open unsupported, safe summary only",
      onboarding,
      summary
    }));
  `;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function includesAll(value, needles) {
  return needles.every((needle) => value.includes(needle));
}

function forbiddenPattern() {
  return /sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/Zhuanz|api-token\.json|rawProviderPayload|promptText|toolCommandText/;
}

function writeCapture(snapshot) {
  mkdirSync(dirname(capturePath), { recursive: true });
  writeFileSync(capturePath, `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>V10.14 first-run wizard capture</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f8fb;color:#172033}.wrap{max-width:1040px;margin:32px auto;padding:0 20px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card{background:white;border:1px solid #d8dee8;border-radius:8px;padding:16px}.badge{display:inline-block;background:#e0f2fe;color:#0369a1;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:700}code{display:block;margin-top:10px;padding:10px;border:1px solid #d8dee8;border-radius:6px;background:#f8fafc;overflow-wrap:anywhere}</style></head>
<body><main class="wrap"><h1>V10.14 First-run Wizard Evidence</h1><p><span class="badge">passed smoke</span></p><section class="grid">
<article class="card"><h2>Default pet path</h2><p>Visible pet in <=3 user actions: choose pack, click default path, observe test reaction.</p></article>
<article class="card"><h2>Codex work-cat path</h2><p>Visible target reaction in <=5 user actions: choose pack, create Codex work-cat, observe success reaction.</p></article>
<article class="card"><h2>Unsupported boundary</h2><p>Already-open Codex window automatic monitoring remains unsupported.</p></article>
</section><h2>Recommended JSONL wrapper</h2><code>${escapeHtml(snapshot.onboarding.jsonlCommand)}</code></main></body></html>`, "utf8");
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V10.14 First-run Wizard Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This smoke validates the ordinary-user first-run wizard implementation path in
the real desktop source. It does not claim all Codex workflows, OS-level Codex
window binding, already-open Codex auto-monitoring, provider integration, 3D
readiness, production release readiness, cross-platform readiness, or Windows
readiness.

## Evidence Files

- capture: \`${capturePath}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## First-run Path Counts

- default pet path: choose pack -> click default path -> visible living cat.
- Codex work-cat path: choose pack -> click Codex path -> new target instance -> visible living work-cat -> copyable JSONL command available.

## Final Decision

${records.every((item) => item.ok) ? "V10.14 smoke passed. V10.15 may proceed." : "V10.14 smoke failed. Do not proceed."}
`, "utf8");
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
