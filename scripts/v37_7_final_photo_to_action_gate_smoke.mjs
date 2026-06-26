import { buildV37Context, candidateRows, evidenceHeader, identityRows, printResult, sampleRows, scanBlock, v37Date, writeEvidence } from "./v37_smoke_common.mjs";

const context = buildV37Context();
const scan = scanBlock(context.snapshot);
const ok = context.finalDecision.decision === "tested named samples photo-to-action product-path scoped pass" && context.finalDecision.claimScanStatus === "passed" && context.finalDecision.securityScanStatus === "passed" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const body = [
  evidenceHeader({ title: "V37.7 Final Photo-to-Action Gate", phase: "V37.7 final scoped gate", spec: "docs/V37.x/v37-engineering-implementation-blueprint.md" }),
  "## Phase Summary",
  "- V37.1 product UX contract: see evidence.",
  "- V37.2 named photo sample set: see evidence.",
  "- V37.3 identity and character asset: see evidence.",
  "- V37.4 action candidate generation: see evidence.",
  "- V37.5 product preview/apply/rollback: see evidence.",
  "- V37.6 visual review report: see evidence.",
  "",
  "## Samples",
  "| sampleId | displayName | difficulty | intakeStatus | reasonCodes |",
  "| --- | --- | --- | --- | --- |",
  sampleRows(context.snapshot),
  "",
  "## Identity",
  "| sampleId | characterAssetId | status | crossSampleReuseCheck | reasonCodes |",
  "| --- | --- | --- | --- | --- |",
  identityRows(context.snapshot),
  "",
  "## Candidates",
  "| sampleId | candidateId | route | semantic | visual | human | product | actionCount | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  candidateRows(context.snapshot),
  "",
  "## Final Decision",
  `- Decision: ${context.finalDecision.decision}`,
  `- Narrow claim: ${context.finalDecision.narrowClaim}`,
  `- Remaining risks: ${context.finalDecision.remainingRisks.join(" / ") || "none beyond scoped Route B boundary"}`,
  `- Claim scan: ${context.finalDecision.claimScanStatus}`,
  `- Security scan: ${context.finalDecision.securityScanStatus}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: V37 tested named samples photo-to-action product path passed with narrow claim only." : "- partial/failed: final gate did not meet scoped pass conditions.",
  ""
].join("\n");
const evidencePath = writeEvidence("docs/V37.x/v37-final-photo-to-action-report.md", body);
writeEvidence(`docs/V37.x/evidence/v37_7-final-photo-to-action-gate-${v37Date}.md`, body);
printResult({ ok, status: ok ? "passed scoped" : context.finalDecision.decision, evidencePath, decision: context.finalDecision.decision });
