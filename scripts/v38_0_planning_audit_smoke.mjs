import fs from "node:fs";
import path from "node:path";

import {
  buildV38Context,
  phaseHeader,
  printResult,
  repoRoot,
  scanBlock,
  v38Date,
  writeEvidence
} from "./v38_smoke_common.mjs";

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v38.md",
  "docs/V38.x/v38-target-architecture.md",
  "docs/V38.x/v38-development-and-acceptance-plan.md",
  "docs/V38.x/v38-acceptance-plan.md",
  "docs/V38.x/v38-claim-matrix.md",
  "docs/V38.x/v38-evidence-and-scan-checklist.md"
];

const docStatus = requiredDocs.map((relPath) => ({
  relPath,
  exists: fs.existsSync(path.join(repoRoot, relPath))
}));
const context = buildV38Context();
const scans = scanBlock({ docStatus, snapshot: context.snapshot });
const ok = docStatus.every((item) => item.exists) && scans.claimScan.status === "passed" && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V38.0 Planning Audit Evidence",
    phase: "V38.0 planning audit",
    spec: "docs/V38.x/v38-development-and-acceptance-plan.md"
  }),
  "## Required Documents",
  "| Document | Exists |",
  "| --- | --- |",
  docStatus.map((item) => `| ${item.relPath} | ${item.exists ? "yes" : "no"} |`).join("\n"),
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_0-planning-audit-${v38Date}.md`, body);
printResult({ ok, evidencePath, docStatus });
