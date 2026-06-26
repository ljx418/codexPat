import { buildV33Context, date, printResult, scanContext, writeMarkdownEvidence } from "./v33_smoke_common.mjs";

const context = buildV33Context();
const result = writeMarkdownEvidence(`v33_1-real-sample-intake-${date}.md`, {
  context,
  title: "V33.1 Real Sample Intake Evidence",
  phase: "V33.1",
  spec: "docs/V33.x/v33_1-real-sample-intake-spec.md",
  development: "Implemented safe sample intake records for clear, difficult, blocked, and negative sample classes without retaining private source photo fields.",
  acceptance: "Clear and difficult safe samples are classified; blocked and negative samples cannot enter the generation path.",
  resultLines: (ctx) => [
    `- Passed samples: ${ctx.snapshots.intake.passedCount}`,
    `- Blocked samples: ${ctx.snapshots.intake.blockedCount}`,
    `- Failed samples: ${ctx.snapshots.intake.failedCount}`,
    `- Forbidden-content internal scan flags: ${JSON.stringify(scanContext(ctx))}`,
    "- Decision: passed scoped for named safe sample records."
  ],
  scanText: (ctx) => JSON.stringify(ctx.snapshots.intake),
  claim: "V33.1 may claim scoped safe sample intake for the named local records only."
});

printResult({
  ok: result.ok && context.snapshots.intake.passedCount >= 1 && context.snapshots.intake.blockedCount >= 1 && context.snapshots.intake.failedCount >= 1,
  evidencePath: result.evidencePath,
  claimScan: result.claimScan,
  securityScan: result.securityScan
});
