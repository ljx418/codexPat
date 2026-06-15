#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V19.x/evidence/v19_0-scope-freeze-${DATE}.md`;
const records = [];

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v19.md",
  "docs/V19.x/v19_x-target-architecture.md",
  "docs/V19.x/v19_x-development-plan.md",
  "docs/V19.x/v19_x-detailed-development-and-acceptance-plan.md",
  "docs/V19.x/v19_x-acceptance-plan.md",
  "docs/V19.x/v19_x-motion-sheet-format-and-qa-spec.md",
  "docs/V19.x/v19_x-implementation-contract.md",
  "docs/V19.x/v19_x-claim-matrix.md",
  "docs/V19.x/v19_x-petdex-resource-boundary.md",
  "docs/active/current-vs-target-gap.drawio"
];

record("required V19 docs exist", requiredDocs.every((path) => existsSync(resolve(REPO_ROOT, path))), requiredDocs.join(", "));

const activeDevelopment = safeRead("docs/active/development-plan.md");
const activeAcceptance = safeRead("docs/active/acceptance-plan.md");
const activeGap = safeRead("docs/active/current-vs-target-gap.md");
record("active docs point to V19 planned", /V19 planned/.test(activeDevelopment + activeAcceptance + activeGap), "V19 planned active index");
record("V18 remains baseline only", /V18\.0-V18\.6 passed scoped 是输入基线/.test(activeDevelopment + activeAcceptance + activeGap), "V18 scoped baseline does not become V19 evidence");

const drawio = safeRead("docs/active/current-vs-target-gap.drawio");
record("drawio XML basic parse", /^<mxfile[\s>]/.test(drawio) && drawio.includes("V19 阶段目标") && drawio.includes("</mxfile>"), "drawio contains V19 pages and mxfile root");

const forbiddenScanText = [
  safeRead("docs/active/agent_desktop_pet_prd_v19.md"),
  safeRead("docs/V19.x/v19_x-claim-matrix.md"),
  safeRead("docs/V19.x/v19_x-development-plan.md"),
  safeRead("docs/V19.x/v19_x-acceptance-plan.md"),
  safeRead("docs/V19.x/v19_x-doc-audit.md")
].join("\n");
record("forbidden claim boundary", !/(Petdex parity achieved\s+passed|provider integration verified\s+passed|3D ready\s+passed|production signed release ready\s+passed|Windows ready\s+passed|cross-platform ready\s+passed)/i.test(forbiddenScanText), "forbidden claims only appear as forbidden/not-ready/not-implied");
record("Petdex asset boundary", /not reuse|不得将 Petdex 用户提交资产打包|no asset reuse/i.test(forbiddenScanText), "Petdex public resources are format/UX references only");
record("security scan", !/(Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=])/i.test(forbiddenScanText), "docs do not leak token, Authorization, raw provider response, full local path, raw photo bytes");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function safeRead(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function renderEvidence(status) {
  return `# V19.0 Scope Freeze Evidence

status: ${status}
date: ${DATE}

## Scope

V19.0 freezes the Petdex-style high-amplitude 2D motion sheet scope, active docs,
claim boundaries, Petdex resource boundary, and drawio status.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Allowed Claim

${status === "passed"
    ? "V19 Petdex-style motion sheet scope frozen with license and claim boundaries."
    : "No V19.0 passed claim is made."}

## Forbidden Claims

- Petdex parity achieved
- Petdex asset reuse/redistribution authorized
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
`;
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}
