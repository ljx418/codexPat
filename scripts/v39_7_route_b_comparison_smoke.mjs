import { buildV39Context, phaseHeader, printResult, scanBlock, v39Date, writeEvidence } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const records = context.pipeline.routeBRecords;
const scans = scanBlock({ routeBRecords: records });
const ok = records.length >= 2
  && records.every((record) => record.routeBStatus === "blocked_not_supplied")
  && records.every((record) => record.canParticipateInAcceptance === false)
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.7 Route B Comparison Record Evidence",
    phase: "V39.7 Route B comparison record",
    spec: "Route B is recorded honestly and cannot pass without real same-sample source-bound assets"
  }),
  "## Route B Records",
  ...records.map((record) => `- ${record.sampleId}: ${record.routeBStatus}; canParticipate=${record.canParticipateInAcceptance}; ${record.reasonCodes.join(", ")}.`),
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped with Route B blocked" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_7-route-b-comparison-${v39Date}.md`, body);
printResult({ ok, evidencePath, records, scans });
