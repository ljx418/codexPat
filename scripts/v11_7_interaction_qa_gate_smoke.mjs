#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const DATE = "2026-06-07";
const evidencePath = `docs/V11.x/evidence/v11_7-interaction-qa-gate-smoke-${DATE}.md`;
const records = [];

const phaseReports = [
  "docs/V11.x/v11_1-final-acceptance-report.md",
  "docs/V11.x/v11_2-final-acceptance-report.md",
  "docs/V11.x/v11_3-final-acceptance-report.md",
  "docs/V11.x/v11_4-final-acceptance-report.md",
  "docs/V11.x/v11_5-final-acceptance-report.md",
  "docs/V11.x/v11_6-final-acceptance-report.md"
];

const phaseEvidence = [
  "docs/V11.x/evidence/v11_1-living-idle-smoke-2026-06-05.md",
  "docs/V11.x/evidence/v11_2-pointer-interaction-smoke-2026-06-07.md",
  "docs/V11.x/evidence/v11_2-pointer-interaction-capture-2026-06-07.html",
  "docs/V11.x/evidence/v11_3-emotion-layer-smoke-2026-06-07.md",
  "docs/V11.x/evidence/v11_4-action-composer-smoke-2026-06-07.md",
  "docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-2026-06-07.md",
  "docs/V11.x/evidence/v11_5-flagship-living-cat-contact-sheet-2026-06-07.html",
  "docs/V11.x/evidence/v11_5-flagship-living-cat-runtime-capture-2026-06-07.html",
  "docs/V11.x/evidence/v11_5-flagship-side-by-side-2026-06-07.html",
  "docs/V11.x/evidence/v11_6-first-run-delight-smoke-2026-06-07.md",
  "docs/V11.x/evidence/v11_6-first-run-delight-capture-2026-06-07.html"
];

record("V11.1-V11.6 final reports", phaseReports.every(existsSync), phaseReports.join(", "));
record("V11.1-V11.6 evidence files", phaseEvidence.every(existsSync), phaseEvidence.join(", "));
record("living idle acceptance", livingIdlePassed(), "3-minute varied idle, blocking, wake, zero PetEvent evidence");
record("pointer interaction acceptance", pointerPassed(), "hover/click/double-click/drag/drop with target isolation and zero PetEvent");
record("emotion layer acceptance", emotionPassed(), "8-state emotion mapping, safe renderer input, priority preservation");
record("ActionComposer acceptance", composerPassed(), "priority order, success transient, rapid-event final-state evidence");
record("flagship living pack acceptance", flagshipPassed(), "contact sheet, runtime capture, side-by-side quality evidence");
record("first-run delight acceptance", firstRunPassed(), "visible cat, safe local demo, Codex work-cat path, unsupported already-open boundary");
record("PRD/spec review", prdSpecPassed(), "active PRD and V11 docs identify V11.1-V11.6 passed scoped and V11.7 final QA");
record("drawio sync", drawioSyncPassed(), "Chinese drawio snapshots and active drawio exist for V11 review");
record("security scan", securityScanPassed(), "no credential, raw payload, prompt, command, provider, terminal, or full local path leaks in V11 evidence/docs");
record("claim scan", claimScanPassed(), "allowed claim is scoped; forbidden claims remain forbidden/not-ready only");

writeEvidence();

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function livingIdlePassed() {
  const text = readSafe("docs/V11.x/evidence/v11_1-living-idle-smoke-2026-06-05.md");
  return text.includes("status: passed") &&
    text.includes("duration: 180000ms") &&
    text.includes("distinct idle actions") &&
    text.includes("zero accepted PetEvent") &&
    text.includes("pointer-near");
}

function pointerPassed() {
  const text = readSafe("docs/V11.x/evidence/v11_2-pointer-interaction-smoke-2026-06-07.md");
  return text.includes("status: passed") &&
    text.includes("pointer-near") &&
    text.includes("double-click") &&
    text.includes("drag") &&
    text.includes("zero accepted PetEvent");
}

function emotionPassed() {
  const text = readSafe("docs/V11.x/evidence/v11_3-emotion-layer-smoke-2026-06-07.md");
  return text.includes("status: passed") &&
    text.includes("all 8 emotion profiles") &&
    text.includes("safe renderer input") &&
    text.includes("success transient");
}

function composerPassed() {
  const text = readSafe("docs/V11.x/evidence/v11_4-action-composer-smoke-2026-06-07.md");
  return text.includes("status: passed") &&
    text.includes("priority order") &&
    text.includes("rapid event") &&
    text.includes("success transient");
}

function flagshipPassed() {
  const text = readSafe("docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-2026-06-07.md");
  return text.includes("status: passed") &&
    text.includes("living-work-cat-v1") &&
    text.includes("contact sheet") &&
    text.includes("side-by-side");
}

function firstRunPassed() {
  const text = readSafe("docs/V11.x/evidence/v11_6-first-run-delight-smoke-2026-06-07.md");
  return text.includes("status: passed") &&
    text.includes("first-run") &&
    text.includes("safe demo") &&
    text.includes("already-open");
}

function prdSpecPassed() {
  const combined = [
    "docs/active/agent_desktop_pet_prd_v11.md",
    "docs/active/current-vs-target-gap.md",
    "docs/active/acceptance-plan.md",
    "docs/active/development-plan.md",
    "docs/V11.x/v11_x-acceptance-plan.md",
    "docs/V11.x/v11_x-current-gap-analysis.md",
    "docs/V11.x/v11_x-doc-audit.md"
  ].map(readSafe).join("\n");
  return combined.includes("V11.1-V11.7 passed scoped") &&
    combined.includes("V11 living work-cat interaction experience passed for tested local desktop scenarios") &&
    combined.includes("docs/V11.x/v11_7-final-acceptance-report.md");
}

function drawioSyncPassed() {
  const files = readdirSync("docs/V11.x");
  return existsSync("docs/active/current-vs-target-gap.drawio") &&
    files.some((name) => name.includes("v11_drawio_cn_page_1_project_status_2026-06-07")) &&
    files.some((name) => name.includes("v11_drawio_cn_page_4_acceptance_gate_2026-06-07"));
}

function securityScanPassed() {
  const roots = [
    "docs/V11.x",
    "docs/active/agent_desktop_pet_prd_v11.md",
    "docs/active/current-vs-target-gap.md",
    "docs/active/acceptance-plan.md",
    "docs/active/development-plan.md"
  ];
  const combined = roots.map(readTreeSafe).join("\n");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/Zhuanz|api-token\.json|rawPayload\s*[:=]|raw_payload\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|providerPayload\s*[:=]|terminalPayload\s*[:=]/.test(combined);
}

function claimScanPassed() {
  const matrix = readSafe("docs/V11.x/v11_x-claim-matrix.md");
  const acceptance = readSafe("docs/V11.x/v11_x-acceptance-plan.md");
  return matrix.includes("V11 living work-cat interaction experience passed for tested local desktop scenarios.") &&
    acceptance.includes("Petdex parity achieved") &&
    acceptance.includes("Forbidden Claims") &&
    !matrix.includes("Petdex parity achieved | allowed") &&
    !matrix.includes("3D ready | allowed") &&
    !matrix.includes("production signed release ready | allowed");
}

function readTreeSafe(path) {
  if (!existsSync(path)) {
    return "";
  }
  if (path.endsWith(".md") || path.endsWith(".html") || path.endsWith(".ts") || path.endsWith(".mjs")) {
    return readSafe(path);
  }
  return readdirSync(path, { withFileTypes: true }).map((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      return readTreeSafe(child);
    }
    if (/\.(md|html|ts|mjs)$/.test(entry.name)) {
      return readSafe(child);
    }
    return "";
  }).join("\n");
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function writeEvidence() {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const rows = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V11.7 Interaction QA Gate Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This smoke closes the V11 interaction QA gate using V11.1-V11.6 scoped
evidence. It does not add features and does not claim Petdex parity, 3D
readiness, provider readiness, marketplace readiness, production signed release
readiness, cross-platform readiness, or Windows readiness.

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

## Allowed Claim If Final Report Also Passes

\`\`\`text
V11 living work-cat interaction experience passed for tested local desktop scenarios.
\`\`\`

## Forbidden Claims

\`\`\`text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
all Codex workflows verified
OS-level Codex window binding ready
interactive Codex TUI monitoring ready
per-instance queue ready
\`\`\`

## Final Decision

${records.every((item) => item.ok) ? "V11.7 interaction QA gate smoke passed. Continue to regression-backed final report." : "V11.7 interaction QA gate smoke failed or is blocked. Do not use the final V11 claim."}
`, "utf8");
}
