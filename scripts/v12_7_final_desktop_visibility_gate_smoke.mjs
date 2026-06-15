#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import {
  DATE,
  finish,
  record,
  securityScanFiles,
  securityScanText,
  writeEvidence
} from "./v12-utils.mjs";

const evidencePath = `docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-${DATE}.md`;
const finalReportPath = "docs/V12.x/v12_7-final-acceptance-report.md";
const records = [];

const commands = [
  ["V12.1 diagnostics", ["node", "scripts/v12_1_visibility_diagnostics_smoke.mjs"]],
  ["V12.2 layering", ["node", "scripts/v12_2_window_layering_smoke.mjs"]],
  ["V12.3 screenshots", ["node", "scripts/v12_3_real_screenshot_harness_smoke.mjs"]],
  ["V12.4 first-run", ["node", "scripts/v12_4_first_run_real_desktop_proof_smoke.mjs"]],
  ["V12.5 monitor regression", ["node", "scripts/v12_5_window_monitor_regression_smoke.mjs"]],
  ["V12.6 HTML report", ["node", "scripts/v12_6_acceptance_html_report_smoke.mjs"]],
  ["desktop check", ["pnpm", "--filter", "desktop", "check"]],
  ["petctl check", ["pnpm", "--filter", "@agent-desktop-pet/petctl", "check"]],
  ["petctl test", ["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"]],
  ["cargo check", ["cargo", "check", "--manifest-path", "apps/desktop/src-tauri/Cargo.toml"]],
  ["V3.1 runtime smoke", ["node", "scripts/v3_1_runtime_smoke.mjs"]],
  ["V4.4 managed session smoke", ["node", "scripts/v4_4_managed_session_smoke.mjs"]],
  ["V11.7 interaction QA gate", ["node", "scripts/v11_7_interaction_qa_gate_smoke.mjs"]]
];

for (const [name, command] of commands) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env
  });
  const text = `${result.stdout || ""}\n${result.stderr || ""}`;
  const code = result.status ?? 1;
  const blocked = code === 2 || /"status":\s*"blocked"|status:\s*blocked/.test(text);
  record(records, name, code === 0, code === 0 ? "exit=0" : `exit=${code}`, blocked ? "blocked" : "failed");
}

const requiredEvidence = [
  `docs/V12.x/evidence/v12_1-visibility-diagnostics-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_2-window-layering-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_3-real-screenshot-harness-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_4-first-run-real-desktop-proof-${DATE}.md`,
  `docs/V12.x/evidence/v12_5-window-monitor-regression-${DATE}.md`,
  `docs/V12.x/evidence/v12_6-complete-acceptance-html-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_6-complete-acceptance-html-${DATE}.html`,
  `docs/V12.x/evidence/screenshots/v12_3-real-desktop-${DATE}.png`,
  `docs/V12.x/evidence/screenshots/v12_3-real-pet-region-${DATE}.png`,
  `docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-${DATE}.png`
];
record(records, "required V12 evidence exists", requiredEvidence.every(existsSync), requiredEvidence.join(", "), "blocked");

const scanTargets = [
  ...requiredEvidence.filter((path) => /\.(md|html)$/.test(path)),
  "docs/V12.x/v12_x-claim-matrix.md",
  "docs/V12.x/v12_x-acceptance-plan.md",
  "docs/active/agent_desktop_pet_prd_v12.md",
  "docs/active/current-vs-target-gap.md"
];
record(records, "security scan", securityScanFiles(scanTargets), "no token/auth/raw payload/path leakage in V12 docs/evidence");
record(records, "claim scan", claimScan(), "forbidden claims not used as ready");

const status = finish(records);
writeEvidence(evidencePath, "V12.7 Final Desktop Visibility Gate Smoke Evidence", status, records, `
## Final Report

- \`${finalReportPath}\`
`);
writeFinalReport(status, records);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, finalReportPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function claimScan() {
  const combined = scanTargets.map((path) => existsSync(path) ? readFileSync(path, "utf8") : "").join("\n");
  const finalClaim = "V12 desktop pet visibility and screenshot-backed acceptance passed for tested local macOS desktop scenarios.";
  const forbidden = [
    "production signed release ready",
    "cross-platform ready",
    "Windows ready",
    "Petdex parity achieved",
    "3D ready",
    "automatic photo-to-3D ready",
    "provider integration verified",
    "OS-level Codex window binding ready",
    "already-open Codex auto-monitoring ready",
    "all Codex workflows verified"
  ];
  return combined.includes(finalClaim.replace(/\.$/, "")) &&
    forbidden.every((claim) => combined.includes(claim)) &&
    securityScanText(combined);
}

function writeFinalReport(status, rows) {
  mkdirSync(dirname(finalReportPath), { recursive: true });
  const table = rows.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(finalReportPath, `# V12.7 Final Acceptance Report

status: ${status}
date: ${DATE}

## Scope

V12 verifies desktop pet visibility and screenshot-backed acceptance for tested
local macOS desktop scenarios. It does not add renderer, provider, Codex, OS
binding, production release, Windows, or cross-platform claims.

## Gate Results

| Gate | Result | Details |
| --- | --- | --- |
${table}

## Evidence

- V12.6 HTML report: \`docs/V12.x/evidence/v12_6-complete-acceptance-html-${DATE}.html\`
- Real desktop screenshot: \`docs/V12.x/evidence/screenshots/v12_3-real-desktop-${DATE}.png\`
- Pet-region screenshot: \`docs/V12.x/evidence/screenshots/v12_3-real-pet-region-${DATE}.png\`
- First-run screenshot: \`docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-${DATE}.png\`

## Allowed Claim

\`\`\`text
V12 desktop pet visibility and screenshot-backed acceptance passed for tested local macOS desktop scenarios.
\`\`\`

## Forbidden Claims

\`\`\`text
production signed release ready
cross-platform ready
Windows ready
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
all Codex workflows verified
\`\`\`

## Final Decision

${status === "passed"
  ? "V12 final desktop visibility gate passed for the scoped tested local macOS scenario."
  : "V12 final desktop visibility gate is not passed. Do not use the V12 allowed claim until blockers are closed."}
`, "utf8");
}
