import { buildV37Context, candidateRows, evidenceHeader, printResult, scanBlock, v37Date, writeEvidence } from "./v37_smoke_common.mjs";

const context = buildV37Context();
const scan = scanBlock(context.snapshot.actionCandidates);
const routeA2Passed = context.snapshot.actionCandidates.filter((candidate) => candidate.routeId === "route_a2_local_deterministic" && candidate.semanticStatus === "passed" && candidate.actionCoverage.length === 8);
const routeBBlocked = context.snapshot.actionCandidates.filter((candidate) => candidate.routeId === "route_b_professional_assisted" && candidate.semanticStatus === "blocked");
const ok = routeA2Passed.length >= 2 && routeBBlocked.length >= 2 && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const body = [
  evidenceHeader({ title: "V37.4 Action Candidate Generation", phase: "V37.4 action candidate generation", spec: "docs/V37.x/v37-engineering-implementation-blueprint.md" }),
  "## Candidates",
  "| sampleId | candidateId | route | semantic | visual | human | product | actionCount | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  candidateRows(context.snapshot),
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: Route A2 produced sample-bound 8-action candidates; Route B remains blocked without real assets." : "- failed: action candidate gate did not pass.",
  ""
].join("\n");
const evidencePath = writeEvidence(`docs/V37.x/evidence/v37_4-action-candidate-generation-${v37Date}.md`, body);
printResult({ ok, status: ok ? "passed scoped" : "failed", evidencePath });
