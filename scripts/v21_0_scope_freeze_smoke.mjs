#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V21.x/evidence/v21_0-scope-freeze-${DATE}.md`;

const records = [];

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v21.md",
  "docs/active/development-plan.md",
  "docs/active/acceptance-plan.md",
  "docs/active/current-vs-target-gap.md",
  "docs/active/current-vs-target-gap.drawio",
  "docs/V21.x/v21_0-scope-freeze-spec.md",
  "docs/V21.x/v21_x-current-gap-analysis.md",
  "docs/V21.x/v21_x-target-architecture.md",
  "docs/V21.x/v21_x-development-plan.md",
  "docs/V21.x/v21_x-detailed-development-and-acceptance-plan.md",
  "docs/V21.x/v21_x-acceptance-plan.md",
  "docs/V21.x/v21_x-claim-matrix.md",
  "docs/V21.x/v21_x-milestones.md",
  "docs/V21.x/v21_x-exit-criteria.md",
  "docs/V21.x/v21_x-implementation-contract.md",
  "docs/V21.x/v21_x-route-comparison-matrix.md",
  "docs/V21.x/v21_x-evidence-index.md",
  "docs/V21.x/v21_x-doc-audit.md",
  "docs/V21.x/v21_1-route-a-keypose-pack-spec.md",
  "docs/V21.x/v21_2-route-b-provider-preflight-spec.md",
  "docs/V21.x/v21_3-route-c-local-rig-spec.md",
  "docs/V21.x/v21_4-route-d-video-frame-spec.md",
  "docs/V21.x/v21_5-route-comparator-and-manager-ux-spec.md"
];

const samplePhotos = ["docs/猫.jpg", "docs/猫_1.jpg", "docs/猫_2.jpg"];
const v20ProviderOutputs = [
  "docs/V20.x/evidence/assets/v20-minimax-motion-sheet-2026-06-14/sample_1-minimax-motion-sheet-1.jpeg",
  "docs/V20.x/evidence/assets/v20-minimax-motion-sheet-2026-06-14/sample_2-minimax-motion-sheet-1.jpeg",
  "docs/V20.x/evidence/assets/v20-minimax-motion-sheet-2026-06-14/sample_3-minimax-motion-sheet-1.jpeg"
];

record(
  "required V21 docs exist",
  requiredDocs.every((path) => existsSync(resolve(REPO_ROOT, path))),
  requiredDocs.join(", ")
);

const activeDocs = [
  "docs/active/agent_desktop_pet_prd_v21.md",
  "docs/active/development-plan.md",
  "docs/active/acceptance-plan.md",
  "docs/active/current-vs-target-gap.md"
].map(safeRead).join("\n");

record(
  "active docs point to V21 planned",
  /V21 planned/.test(activeDocs) && /agent_desktop_pet_prd_v21\.md/.test(activeDocs),
  "V21 planned active index"
);
record(
  "implementation focus summary exists",
  /Implementation Focus Summary/.test(activeDocs) && /Current active work: V21 multi-route animation asset recovery/.test(activeDocs),
  "short automation-facing active summary present"
);
record(
  "V20 provider outputs are route inputs only",
  /V20 provider outputs are route inputs, not V21 pass evidence/.test(activeDocs + safeRead("docs/V21.x/v21_x-evidence-index.md")),
  "V20 output existence cannot imply V21 route passed"
);
record(
  "V19 fallback baseline preserved",
  /V19 local motion-sheet workflow remains accepted fallback baseline|V19 local motion-sheet workflow remains the accepted fallback baseline/i.test(activeDocs + safeRead("docs/V21.x/v21_0-scope-freeze-spec.md")),
  "V19 accepted local motion-sheet fallback remains available"
);

const sampleSummaries = samplePhotos.map((path) => summarizeFile(path));
record(
  "three local cat photo samples available",
  sampleSummaries.every((item) => item.exists),
  sampleSummaries.map((item) => `${item.safeName}:${item.exists ? item.sizeBucket : "sample_missing"}`).join(", ")
);

const providerSummaries = v20ProviderOutputs.map((path) => summarizeFile(path));
record(
  "V20 provider outputs available as Route A inputs",
  providerSummaries.every((item) => item.exists),
  providerSummaries.map((item) => `${item.safeName}:${item.exists ? item.sizeBucket : "provider_output_missing"}`).join(", ")
);

const drawioPath = resolve(REPO_ROOT, "docs/active/current-vs-target-gap.drawio");
let drawioXmlOk = false;
let drawioDetails = "xml parse not run";
try {
  execFileSync("/usr/bin/python3", [
    "-c",
    "import sys, xml.etree.ElementTree as ET; ET.parse(sys.argv[1]); print('ok')",
    drawioPath
  ], { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "pipe"] });
  const drawio = safeRead("docs/active/current-vs-target-gap.drawio");
  drawioXmlOk = /^<mxfile[\s>]/.test(drawio) && /V21/.test(drawio) && /里程碑/.test(drawio) && /出门条件/.test(drawio);
  drawioDetails = "drawio mxfile parses and contains V21 Chinese planning pages";
} catch (error) {
  drawioDetails = `drawio_parse_failed:${String(error).slice(0, 80)}`;
}
record("drawio XML parses", drawioXmlOk, drawioDetails);

record(
  "drawio snapshot export",
  false,
  "not exported in this smoke; XML parse is the accepted V21.0 evidence for this run"
);

const v21Docs = requiredDocs.map(safeRead).join("\n");
record(
  "route specs cover A/B/C/D/comparator",
  /Route A/.test(v21Docs) && /Route B/.test(v21Docs) && /Route C/.test(v21Docs) && /Route D/.test(v21Docs) && /Comparator|route comparator/i.test(v21Docs),
  "all route specs present"
);
record(
  "hard No-Go gates recorded",
  /Do not start V21\.5/.test(v21Docs) && /Do not start V21\.6/.test(v21Docs) && /Do not start V21\.7/.test(v21Docs),
  "V21.5/V21.6/V21.7 prerequisites documented"
);
record(
  "forbidden claim boundary",
  !/(provider integration verified\s+passed|Petdex parity achieved\s+passed|3D ready\s+passed|production signed release ready\s+passed|Windows ready\s+passed|cross-platform ready\s+passed|arbitrary cats automatic photo-to-animation ready\s+passed|low-retry provider reliability for arbitrary cats\s+passed|V21 final passed\s*$)/im.test(v21Docs + activeDocs),
  "forbidden claims are not used as ready/passed"
);
record(
  "security scan",
  !/(Authorization\s*[:=]|api-token\.json\s*[:=]|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=])/i.test(v21Docs + activeDocs),
  "V21 docs do not leak token, Authorization value, raw payload, or full local path"
);

const blockingRecords = records.filter((item) => item.name !== "drawio snapshot export");
const status = blockingRecords.every((item) => item.ok) ? "passed" : "failed";
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

function summarizeFile(path) {
  const full = resolve(REPO_ROOT, path);
  if (!existsSync(full)) {
    return { safeName: basenameSafe(path), exists: false, sizeBucket: "missing" };
  }
  const size = statSync(full).size;
  return { safeName: basenameSafe(path), exists: true, sizeBucket: bucketSize(size) };
}

function basenameSafe(path) {
  return path.split("/").pop();
}

function bucketSize(size) {
  if (size < 100_000) return "<100KB";
  if (size < 500_000) return "100-500KB";
  if (size < 1_000_000) return "500KB-1MB";
  if (size < 3_000_000) return "1-3MB";
  return ">3MB";
}

function renderEvidence(status) {
  return `# V21.0 Scope Freeze Evidence

status: ${status}
date: ${DATE}

## Scope

V21.0 freezes the multi-route animation asset recovery scope. It does not
generate assets, does not prove any route passed, and does not unlock V21.7.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "not-blocking/failed"} | ${sanitize(item.details)} |`).join("\n")}

## Sample Photo Summary

| Safe file | Presence | Size bucket |
| --- | --- | --- |
${sampleSummaries.map((item) => `| ${item.safeName} | ${item.exists ? "present" : "missing"} | ${item.sizeBucket} |`).join("\n")}

## V20 Provider Output Summary

| Safe file | Presence | Size bucket |
| --- | --- | --- |
${providerSummaries.map((item) => `| ${item.safeName} | ${item.exists ? "present" : "missing"} | ${item.sizeBucket} |`).join("\n")}

## PRD / Spec Review

V21 documentation supports phase-by-phase implementation. V21.0 may proceed to
V21.1-V21.4 route work after this evidence. V21.5, V21.6, and V21.7 remain
No-Go until their prerequisites are met.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| V20 provider outputs treated as V21 pass evidence | High | blocked by spec and claim scan |
| Route B capability review treated as product evidence | High | blocked by acceptance plan |
| V21.7 started before route evidence | High | blocked by development plan |
| Historical active gap text confuses automation | Medium | mitigated by Implementation Focus Summary |

## Allowed Claim

${status === "passed"
    ? "V21 multi-route animation asset recovery scope frozen with claim boundaries."
    : "No V21.0 passed claim is made."}

## Forbidden Claims

- V21 route passed
- V21 final passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
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
