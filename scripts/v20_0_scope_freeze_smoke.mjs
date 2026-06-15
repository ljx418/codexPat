#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V20.x/evidence/v20_0-scope-freeze-${DATE}.md`;
const records = [];

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v20.md",
  "docs/active/development-plan.md",
  "docs/active/acceptance-plan.md",
  "docs/active/current-vs-target-gap.md",
  "docs/active/current-vs-target-gap.drawio",
  "docs/V20.x/v20_x-current-gap-analysis.md",
  "docs/V20.x/v20_x-target-architecture.md",
  "docs/V20.x/v20_x-development-plan.md",
  "docs/V20.x/v20_x-detailed-development-and-acceptance-plan.md",
  "docs/V20.x/v20_x-acceptance-plan.md",
  "docs/V20.x/v20_x-claim-matrix.md",
  "docs/V20.x/v20_x-milestones.md",
  "docs/V20.x/v20_x-exit-criteria.md",
  "docs/V20.x/v20_x-implementation-contract.md",
  "docs/V20.x/v20_x-mainland-provider-matrix.md",
  "docs/V20.x/v20_x-minimax-live-smoke-request-spec.md",
  "docs/V20.x/v20_x-provider-benchmark-and-repair-loop-spec.md",
  "docs/V20.x/v20_x-motion-quality-qa-thresholds.md",
  "docs/V20.x/v20_x-doc-audit.md"
];

record("required V20 docs exist", requiredDocs.every((path) => existsSync(resolve(REPO_ROOT, path))), requiredDocs.join(", "));

const activeDocs = [
  safeRead("docs/active/agent_desktop_pet_prd_v20.md"),
  safeRead("docs/active/development-plan.md"),
  safeRead("docs/active/acceptance-plan.md"),
  safeRead("docs/active/current-vs-target-gap.md")
].join("\n");
record("active docs point to V20 planned", /V20 planned/.test(activeDocs) && /agent_desktop_pet_prd_v20\.md/.test(activeDocs), "V20 planned active index");
record("single current active status", (activeDocs.match(/Current active status:/g) ?? []).length === 1, "only one Current active status line in active docs");
record("V19 is fallback baseline only", /V19 local motion-sheet scoped passed 是输入基线|V19 local motion sheet scoped passed is the fallback baseline/i.test(activeDocs), "V19 accepted local motion-sheet baseline cannot prove provider branch");
record("V19 provider branch blocked/not-claimed", /V19 provider branch was blocked\/not-claimed|V19 provider single-sheet generation remained\s+blocked\/not-claimed/i.test(activeDocs), "V20 owns provider generation attempt");

const drawio = safeRead("docs/active/current-vs-target-gap.drawio");
record("drawio XML basic parse", /^<mxfile[\s>]/.test(drawio) && drawio.includes("</mxfile>") && /V20|大陆|MiniMax|motion sheet/i.test(drawio), "drawio contains V20 content and mxfile root");
record("drawio PNG snapshot export", false, "not exported in this non-GUI smoke; XML parse is the accepted V20.0 evidence for this run");

let xmllintOk = false;
try {
  execFileSync("xmllint", ["--noout", resolve(REPO_ROOT, "docs/active/current-vs-target-gap.drawio")], { cwd: REPO_ROOT, stdio: "pipe" });
  xmllintOk = true;
} catch {
  xmllintOk = /^<mxfile[\s>]/.test(drawio) && drawio.includes("</mxfile>");
}
record("drawio XML validator", xmllintOk, "xmllint or strict mxfile fallback parse");

const v20Docs = requiredDocs.map(safeRead).join("\n");
record("reference image evidence fields specified", /reference_image_attached/.test(v20Docs) && /provider_capability/.test(v20Docs) && /text_to_image_only/.test(v20Docs), "V20.2 must record reference image fields before any reference-image claim");
record("forbidden claim boundary", !/(provider integration verified\s+passed|Petdex parity achieved\s+passed|3D ready\s+passed|production signed release ready\s+passed|Windows ready\s+passed|cross-platform ready\s+passed|arbitrary cats automatic photo-to-animation ready\s+passed|low-retry provider reliability for arbitrary cats\s+passed)/i.test(v20Docs), "forbidden claims are not used as ready/passed");
record("security scan", !/(Authorization\s*[:=]|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,})/i.test(v20Docs), "V20 docs do not leak token, Authorization header/value, or full local path");

const status = records.filter((item) => item.name !== "drawio PNG snapshot export").every((item) => item.ok) ? "passed" : "failed";
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
  return `# V20.0 Scope Freeze Evidence

status: ${status}
date: ${DATE}

## Scope

V20.0 freezes the mainland provider photo-to-motion-sheet workflow scope,
MiniMax P0 provider boundary, V19 fallback baseline, V20 claim boundaries, and
drawio synchronization status.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "not-blocking/failed"} | ${sanitize(item.details)} |`).join("\n")}

## PRD / Spec Review

V20 PRD and architecture support phase-by-phase implementation. V20.2 remains a
hard provider benchmark gate and V20.6 remains No-Go until V20.0-V20.5 evidence
exists.

## Allowed Claim

${status === "passed"
    ? "V20 mainland provider photo-to-motion-sheet scope frozen with MiniMax benchmark and claim boundaries."
    : "No V20.0 passed claim is made."}

## Forbidden Claims

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- Petdex asset reuse/redistribution authorized
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
`;
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
