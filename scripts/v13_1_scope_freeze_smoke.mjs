#!/usr/bin/env node
import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  DATE,
  finish,
  record,
  repoRoot,
  runCommand,
  securityScanText,
  writeEvidence
} from "./v13-utils.mjs";

const evidencePath = `docs/V13.x/evidence/v13_1-scope-freeze-${DATE}.md`;
const records = [];

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v13.md",
  "docs/V13.x/v13_x-development-plan.md",
  "docs/V13.x/v13_x-acceptance-plan.md",
  "docs/V13.x/v13_x-target-architecture.md",
  "docs/V13.x/v13_x-claim-matrix.md",
  "docs/V13.x/v13_x-implementation-contract.md"
];
for (const path of requiredDocs) {
  record(records, `required doc exists: ${path}`, existsSync(path), path, "blocked");
}

const activeScan = runCommand("rg", [
  "-n",
  "Current active status: V13|Current active PRD: docs/active/agent_desktop_pet_prd_v13|V12.*scoped accepted",
  "docs/active/current-vs-target-gap.md",
  "docs/active/development-plan.md",
  "docs/active/acceptance-plan.md"
]);
record(records, "active docs point to V13 and preserve V12 baseline", activeScan.ok, `matches=${activeScan.stdout.split("\n").filter(Boolean).length}`, "failed");

const forbiddenReadyScan = runCommand("rg", [
  "-n",
  "production signed release ready.*passed|notarized release ready.*passed|auto update ready.*passed|Windows ready.*passed|cross-platform ready.*passed|Petdex parity achieved.*passed|3D ready.*passed|provider integration verified.*passed|MCP ready.*passed|Third-party agent integration verified.*passed|Claude Code integration verified.*passed",
  "docs/active",
  "docs/V13.x"
]);
record(records, "forbidden claims not used as passed/ready claims", !forbiddenReadyScan.ok, forbiddenReadyScan.ok ? "forbidden_ready_context_found" : "claim_scan_passed", "failed");

const xml = runCommand("xmllint", ["--noout", "docs/active/current-vs-target-gap.drawio"]);
record(records, "drawio XML parses", xml.ok, xml.ok ? "drawio_xml_valid" : "drawio_xml_invalid", "failed");

const exported = [];
for (const [page, name] of [
  [0, "status"],
  [1, "architecture"],
  [2, "plan"],
  [3, "exit"]
]) {
  const out = `docs/V13.x/evidence/v13_drawio_page_${page + 1}_${name}_${DATE}.png`;
  const result = spawnSync("/Applications/draw.io.app/Contents/MacOS/draw.io", [
    "-x",
    "-f",
    "png",
    "-p",
    String(page),
    "-o",
    out,
    "docs/active/current-vs-target-gap.drawio"
  ], { cwd: repoRoot, encoding: "utf8" });
  const ok = (result.status === 0 && existsSync(out)) || (existsSync(out) && statSync(out).size > 0);
  exported.push(out);
  record(records, `drawio PNG export page ${page + 1}`, ok, ok ? out : "drawio_export_failed", "blocked");
}

record(records, "evidence redaction scan", securityScanText(JSON.stringify(records)), "no sensitive text in V13.1 evidence");

const status = finish(records);
writeEvidence(evidencePath, "V13.1 Scope Freeze Evidence", status, records, `
## Drawio Snapshots

${exported.map((path) => `- \`${path}\``).join("\n")}

## Allowed Claim

${status === "passed" ? "V13 beta distribution and user-ready closure scope frozen with claim boundaries." : "No V13.1 allowed claim is made because the scope freeze did not pass."}
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
