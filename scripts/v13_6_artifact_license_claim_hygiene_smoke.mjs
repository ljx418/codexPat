#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DATE,
  finish,
  record,
  repoRoot,
  runCommand,
  securityScanText,
  writeEvidence
} from "./v13-utils.mjs";

const evidencePath = `docs/V13.x/evidence/v13_6-artifact-license-claim-hygiene-${DATE}.md`;
const records = [];

const git = runCommand("git", ["status", "--short"]);
record(records, "git status recorded", git.ok, `entries=${git.stdout.split("\n").filter(Boolean).length}`, "failed");

const desktopCheck = runCommand("pnpm", ["--filter", "desktop", "check"], { timeoutMs: 180000 });
record(records, "desktop check", desktopCheck.ok, `exit=${desktopCheck.status}`, "failed");

const petctlTest = runCommand("pnpm", ["--filter", "@agent-desktop-pet/petctl", "test"], { timeoutMs: 180000 });
record(records, "petctl test", petctlTest.ok, `exit=${petctlTest.status}`, "failed");

const stagedForbidden = git.stdout
  .split("\n")
  .filter(Boolean)
  .filter((line) => /^[AMDRC?]/.test(line.trim()))
  .filter((line) => /(^|\/)(dist|target|node_modules)\//.test(line) || /provider.*raw/i.test(line) || /diagnostics.*archive/i.test(line));
record(records, "generated artifacts not staged", stagedForbidden.length === 0, stagedForbidden.length === 0 ? "artifact_scan_passed" : `artifact_dirty count=${stagedForbidden.length}`, "failed");

const assetFiles = [
  "apps/desktop/src/assets/bundled-packs/work-cat-v1.manifest.ts",
  "apps/desktop/src/assets/bundled-packs/living-work-cat-v1.ts",
  "apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts"
];
const licenseOk = assetFiles.every((path) => existsSync(path) && /attribution|license/i.test(readFileSync(path, "utf8")));
record(records, "bundled asset license/attribution present", licenseOk, licenseOk ? "license_scan_passed" : "license_missing", "failed");

const claimScan = runCommand("rg", [
  "-n",
  "production signed release ready.*passed|notarized release ready.*passed|auto update ready.*passed|Windows ready.*passed|cross-platform ready.*passed|Petdex parity achieved.*passed|3D ready.*passed|provider integration verified.*passed|MCP ready.*passed|Third-party agent integration verified.*passed|Claude Code integration verified.*passed",
  "docs/active",
  "docs/V13.x"
]);
record(records, "forbidden claim scan", !claimScan.ok, claimScan.ok ? "forbidden_claim_ready_context" : "claim_scan_passed", "failed");

const evidenceFiles = readdirSync(join(repoRoot, "docs/V13.x/evidence")).filter((name) => name.endsWith(".md") || name.endsWith(".json") || name.endsWith(".html"));
let evidenceText = "";
for (const name of evidenceFiles) {
  evidenceText += readFileSync(join(repoRoot, "docs/V13.x/evidence", name), "utf8");
}
record(records, "V13 evidence security scan", securityScanText(evidenceText), "no sensitive text in V13 evidence files", "failed");

const status = finish(records);
writeEvidence(evidencePath, "V13.6 Artifact / License / Claim Hygiene Evidence", status, records, `
## Git Status Summary

- git status entries: \`${git.stdout.split("\n").filter(Boolean).length}\`

This evidence records counts and scan outcomes only. It does not include raw private diagnostics archives or local full paths.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
