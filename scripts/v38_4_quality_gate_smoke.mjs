import {
  evaluateQualityGate,
  phaseHeader,
  printResult,
  scanBlock,
  v38Date,
  writeEvidence
} from "./v38_smoke_common.mjs";

const quality = evaluateQualityGate();
const scans = scanBlock({ quality });
const ok = quality.decision === "passed_scoped" && scans.claimScan.status === "passed" && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V38.4 Quality Gate Evidence",
    phase: "V38.4 quality gate",
    spec: "public sample local action frame quality floor"
  }),
  "## Automated Quality Gate",
  `- Decision: ${quality.decision}.`,
  `- Passed pack count: ${quality.passedPackCount}.`,
  `- Sanitized passed count: ${quality.sanitizedPassedCount}.`,
  `- Target actions: ${quality.targetActions.join(", ")}.`,
  `- Limitation: ${quality.limitation}.`,
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_4-quality-gate-${v38Date}.md`, body);
printResult({ ok, evidencePath, quality });
