import { buildV37Context, evidenceHeader, printResult, sampleRows, scanBlock, v37Date, writeEvidence } from "./v37_smoke_common.mjs";

const context = buildV37Context();
const scan = scanBlock(context.snapshot.sampleSet);
const ok = context.snapshot.sampleSet.status === "passed" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const body = [
  evidenceHeader({ title: "V37.2 Named Photo Sample Set", phase: "V37.2 named photo sample set", spec: "docs/V37.x/v37-engineering-implementation-blueprint.md" }),
  "## Sample Matrix",
  "| sampleId | displayName | difficulty | intakeStatus | reasonCodes |",
  "| --- | --- | --- | --- | --- |",
  sampleRows(context.snapshot),
  "",
  `- Passing named samples: ${context.snapshot.sampleSet.passedCount}`,
  `- Negative rejected: ${context.snapshot.sampleSet.negativeRejectedCount}`,
  `- Blocked risk samples: ${context.snapshot.sampleSet.blockedCount}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: named photo sample set meets V37 matrix requirements with safe metadata only." : "- failed: sample matrix did not pass.",
  ""
].join("\n");
const evidencePath = writeEvidence(`docs/V37.x/evidence/v37_2-named-photo-sample-set-${v37Date}.md`, body);
printResult({ ok, status: ok ? "passed scoped" : "failed", evidencePath });
