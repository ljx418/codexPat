import {
  buildV36Context,
  evidenceHeader,
  printResult,
  reviewRows,
  scanBlock,
  v36Date,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const scan = scanBlock(context.review);
const ok = context.review.targetExperienceCount >= 2
  && context.review.reviews.every((item) => item.finalStatus !== "target_experience" || item.nonPlaceholderResult === "passed")
  && scan.claimScan.status === "passed"
  && scan.securityScan.status === "passed";
const evidencePath = writeEvidence(`docs/V36.x/evidence/v36_6-human-visual-review-${v36Date}.md`, [
  evidenceHeader({
    title: "V36.6 Human Visual Review Evidence",
    phase: "V36.6 human visual review gate",
    spec: "docs/V36.x/v36_6-human-visual-review-spec.md"
  }),
  "## Human Visual Review Table",
  "| sampleId | identityScore | motionReadabilityScore | visualPolishScore | conflictWithAutomatedScore | finalStatus | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  reviewRows(context.review),
  "",
  "## Result",
  `- Status: ${context.review.status}`,
  `- Target-experience count: ${context.review.targetExperienceCount}`,
  `- Conflict count: ${context.review.conflictCount}`,
  `- Reason codes: ${context.review.reasonCodes.join(", ")}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: human review gate is applied and conflicts are recorded." : "- failed: human review gate did not support target-experience candidates.",
  ""
].join("\n"));

printResult({ ok, status: ok ? "passed scoped" : context.review.status, evidencePath });
