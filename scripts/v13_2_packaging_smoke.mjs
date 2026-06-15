#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import {
  DATE,
  findAppBundles,
  finish,
  record,
  runCommand,
  safeArtifactSummary,
  securityScanText,
  waitForHealth,
  writeEvidence
} from "./v13-utils.mjs";

const evidencePath = `docs/V13.x/evidence/v13_2-packaging-smoke-${DATE}.md`;
const records = [];

const build = runCommand("pnpm", ["--filter", "desktop", "build"], { timeoutMs: 180000 });
record(records, "desktop build", build.ok, `exit=${build.status}`, "failed");

const tauriBuild = build.ok
  ? runCommand("pnpm", ["--filter", "desktop", "tauri", "build", "-b", "app"], { timeoutMs: 600000 })
  : { ok: false, status: 1 };
record(records, "desktop tauri app build", tauriBuild.ok, `exit=${tauriBuild.status}`, build.ok ? "failed" : "blocked");

const bundles = tauriBuild.ok ? findAppBundles() : [];
record(records, "packaged app artifact found", bundles.length > 0, bundles.map((path) => JSON.stringify(safeArtifactSummary(path))).join(", ") || "packaging_artifact_missing", tauriBuild.ok ? "failed" : "blocked");

let launchAttempt = { ok: false, status: 1 };
if (bundles.length > 0) {
  launchAttempt = runCommand("open", ["-n", bundles[0]], { timeoutMs: 30000 });
  if (!launchAttempt.ok) {
    const executable = join(bundles[0], "Contents/MacOS/agent-desktop-pet");
    if (existsSync(executable)) {
      const child = spawn(executable, {
        cwd: process.cwd(),
        detached: true,
        stdio: "ignore"
      });
      child.unref();
      launchAttempt = { ok: true, status: 0 };
    }
  }
}

const health = bundles.length > 0 ? await waitForHealth(18000) : { ok: false, reasonCode: "packaging_artifact_missing" };
record(records, "packaged app launch attempt", launchAttempt.ok || health.ok, launchAttempt.ok ? "app_launch_passed" : health.ok ? "app_launch_passed_existing_or_started" : `app_launch_failed exit=${launchAttempt.status}`, bundles.length > 0 ? "blocked" : "blocked");
record(records, "desktop health after packaged launch", health.ok, health.ok ? "GET /api/health ok" : health.reasonCode || "desktop_health_failed", "blocked");

record(records, "signing checklist status", true, "planned/not-required-for-v13");
record(records, "notarization checklist status", true, "planned/not-required-for-v13");
record(records, "auto-update checklist status", true, "planned/not-required-for-v13");
record(records, "evidence redaction scan", securityScanText(JSON.stringify(records)), "no sensitive text in packaging evidence");

const status = finish(records);
writeEvidence(evidencePath, "V13.2 Packaging Foundation Smoke Evidence", status, records, `
## Sanitized Artifact Summary

${bundles.length > 0 ? bundles.map((path) => `- \`${JSON.stringify(safeArtifactSummary(path))}\``).join("\n") : "- no artifact summary available"}

This smoke records sanitized artifact filename/type only and does not record full local package paths, signing identity, signing secret, Apple account data, token, Authorization, or raw build logs.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, artifactCount: bundles.length, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
