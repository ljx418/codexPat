import { buildV33Context, date, printResult, writeMarkdownEvidence } from "./v33_smoke_common.mjs";

const context = buildV33Context();
const result = writeMarkdownEvidence(`v33_3-photo-action-candidates-${date}.md`, {
  context,
  title: "V33.3 Photo Action Candidate Evidence",
  phase: "V33.3",
  spec: "docs/V33.x/v33_3-photo-action-candidates-spec.md",
  development: "Built one local frameSequence action candidate from the named V32 project-authored frame pack and one transform-only negative candidate.",
  acceptance: "The local candidate must pass V30 semantic, V31 art, V32 measured frame quality, and V33 identity gate; transform-only negative must fail.",
  resultLines: (ctx) => [
    `- Candidate: ${ctx.candidate.manifest.candidateId}`,
    `- Core actions: ${ctx.candidate.manifest.actions.length}`,
    `- Candidate QA: ${ctx.qa.overallStatus}`,
    `- Transform-only negative QA: ${ctx.transformOnlyQa.overallStatus}`,
    `- Candidate reason codes: ${ctx.qa.reasonCodes.join(", ")}`,
    `- Negative reason codes: ${ctx.transformOnlyQa.reasonCodes.join(", ")}`,
    "- Decision: passed scoped for one named local frameSequence candidate."
  ],
  scanText: (ctx) => JSON.stringify({ candidate: ctx.snapshots.candidate, qa: ctx.snapshots.qa, negative: ctx.snapshots.transformOnlyQa }),
  claim: "V33.3 may claim one named local frameSequence candidate passed the scoped gates; transform-only movement is rejected."
});

printResult({
  ok: result.ok && context.qa.overallStatus === "passed" && context.transformOnlyQa.overallStatus === "failed",
  evidencePath: result.evidencePath,
  candidateQa: context.qa.overallStatus,
  transformOnlyQa: context.transformOnlyQa.overallStatus,
  claimScan: result.claimScan,
  securityScan: result.securityScan
});
