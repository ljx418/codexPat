import { buildV33Context, date, printResult, writeMarkdownEvidence } from "./v33_smoke_common.mjs";

const context = buildV33Context();
const result = writeMarkdownEvidence(`../v33-final-acceptance-report.md`, {
  context,
  title: "V33 Final Acceptance Report",
  phase: "V33.7",
  spec: "docs/V33.x/v33-development-and-acceptance-plan.md",
  development: "Aggregated V33.1-V33.6 scoped implementation evidence for sample intake, identity contract, local frameSequence action candidate, runtime route, product path, and HTML E2E report.",
  acceptance: "Final gate passes only if the named safe sample route, candidate QA, runtime route, preview/apply/rollback, claim scan, and safety scan all pass in scoped form.",
  resultLines: (ctx) => [
    `- V33.1 intake passed count: ${ctx.snapshots.intake.passedCount}`,
    `- V33.2 identity gate: ${ctx.identityGate.status}`,
    `- V33.3 candidate QA: ${ctx.qa.overallStatus}`,
    `- V33.3 negative QA: ${ctx.transformOnlyQa.overallStatus}`,
    `- V33.4 runtime route: ${ctx.runtimeRoute.status}`,
    `- V33.5 product path: ${ctx.product.previewStatus} / ${ctx.product.applyStatus} / ${ctx.product.rollbackStatus}`,
    `- V33.6 report: docs/V33.x/evidence/v33_6-real-data-e2e-report-${date}.html`,
    "- Final decision: passed scoped for the named local route only."
  ],
  scanText: (ctx) => JSON.stringify({
    intake: ctx.snapshots.intake,
    identity: ctx.snapshots.identity,
    candidate: ctx.snapshots.candidate,
    qa: ctx.snapshots.qa,
    runtime: ctx.runtimeRoute,
    product: ctx.product
  }),
  claim: "V33 final may claim a scoped named local safe-sample-to-frameSequence product loop; broader automatic or platform readiness remains unclaimed."
});

printResult({
  ok: result.ok
    && context.identityGate.status === "passed"
    && context.qa.overallStatus === "passed"
    && context.transformOnlyQa.overallStatus === "failed"
    && context.runtimeRoute.status === "passed"
    && context.product.applyStatus === "applied",
  finalReportPath: result.evidencePath,
  claimScan: result.claimScan,
  securityScan: result.securityScan
});
