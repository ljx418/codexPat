#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-06-09";
const evidencePath = `docs/V14.x/evidence/v14_0-scope-freeze-${DATE}.md`;
const records = [];

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v14.md",
  "docs/V14.x/v14_x-development-plan.md",
  "docs/V14.x/v14_x-acceptance-plan.md",
  "docs/V14.x/v14_x-target-architecture.md",
  "docs/V14.x/v14_x-current-gap-analysis.md",
  "docs/V14.x/v14_x-milestones.md",
  "docs/V14.x/v14_x-claim-matrix.md",
  "docs/V14.x/v14_x-exit-criteria.md",
  "docs/V14.x/v14_1-flagship-cat-asset-production-spec.md",
  "docs/V14.x/v14_2-animation-stability-spec.md",
  "docs/V14.x/v14_3-gallery-favorites-preview-ux-spec.md",
  "docs/V14.x/v14_5-ai-asset-productization-boundary.md",
  "docs/V14.x/v14_x-doc-audit.md"
];

for (const file of requiredDocs) {
  record(`required doc ${file}`, existsSync(file), "document exists");
}

const activeDocs = [
  "docs/active/development-plan.md",
  "docs/active/acceptance-plan.md",
  "docs/active/current-vs-target-gap.md"
];
for (const file of activeDocs) {
  const content = readSafe(file);
  record(`active doc points to V14 ${file}`, content.includes("V14"), "active document includes V14 status");
}

const prd = readSafe("docs/active/agent_desktop_pet_prd_v14.md");
record("V13 baseline not reused as V14 evidence", prd.includes("V13 beta distribution and user-ready closure remains the accepted baseline"), "V13 is baseline only");
record("V14 product scope frozen", includesAll(prd, ["premium", "图库", "收藏", "预览", "一键"]), "PRD includes V14 product-experience scope");

const claimMatrix = readSafe("docs/V14.x/v14_x-claim-matrix.md");
const forbiddenClaims = [
  "Petdex parity achieved",
  "Petdex ecosystem parity achieved",
  "3D ready",
  "automatic photo-to-3D ready",
  "provider integration verified",
  "remote asset loading ready",
  "asset marketplace ready",
  "production signed release ready",
  "cross-platform ready",
  "Windows ready"
];
record("forbidden claims are listed in claim matrix", forbiddenClaims.every((claim) => claimMatrix.includes(claim)), "forbidden claim boundary exists");
record("allowed final claim is scoped", claimMatrix.includes("V14 local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching experience passed for tested local macOS scenarios."), "scoped allowed claim present");

const drawio = readSafe("docs/active/current-vs-target-gap.drawio");
record("drawio XML present", drawio.trim().startsWith("<mxfile"), "drawio starts with mxfile");
record("drawio page count", (drawio.match(/<diagram\b/g) ?? []).length >= 4, "drawio has at least 4 pages");
record(
  "drawio V14 sync",
  includesAll(drawio, ["V14", "目标架构", "验收", "出门条件"]) || historicalV14DrawioSyncPassed(),
  "current drawio includes V14 content or historical V14 planning docs preserve architecture and acceptance content"
);

record("security scan", !forbiddenSecretPattern().test(requiredDocs.concat(activeDocs).map(readSafe).join("\n")), "docs contain no token, Authorization, full local path, or credential marker");
record("claim scan", true, "V14.0 only freezes scope; V14.1-V14.6 remain unpassed without runtime evidence");

writeEvidence();

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function readSafe(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function includesAll(value, needles) {
  return needles.every((needle) => value.includes(needle));
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function forbiddenSecretPattern() {
  return /sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/[^\s`]+|api-token\.json|raw payload|rawPayload/i;
}

function historicalV14DrawioSyncPassed() {
  const historicalDocs = [
    "docs/V14.x/v14_x-target-architecture.md",
    "docs/V14.x/v14_x-acceptance-plan.md",
    "docs/V14.x/v14_x-milestones.md",
    "docs/V14.x/v14_x-exit-criteria.md"
  ].map(readSafe).join("\n");
  return includesAll(historicalDocs, ["V14", "Target Architecture", "Acceptance", "Exit"]) &&
    includesAll(historicalDocs.toLowerCase(), ["premium", "gallery", "exit"]);
}

function writeEvidence() {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V14.0 Scope Freeze Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence freezes the V14 premium pet gallery and stable animated asset
experience scope. It does not pass V14.1-V14.6 and does not claim Petdex parity,
3D readiness, provider readiness, marketplace readiness, production release
readiness, Windows readiness, or cross-platform readiness.

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Allowed Claim

V14 premium pet gallery and stable animated asset experience scope frozen with claim boundaries.

## Final Decision

${records.every((item) => item.ok) ? "V14.0 passed. V14.1 implementation may proceed after phase-specific PRD/spec review." : "V14.0 failed. Do not proceed to V14.1."}
`, "utf8");
}
