import { buildV33Context, date, printResult, writeMarkdownEvidence } from "./v33_smoke_common.mjs";

const context = buildV33Context();
const result = writeMarkdownEvidence(`v33_2-trait-identity-contract-${date}.md`, {
  context,
  title: "V33.2 Trait and Identity Contract Evidence",
  phase: "V33.2",
  spec: "docs/V33.x/v33_2-trait-identity-contract-spec.md",
  development: "Converted the passed safe sample into a trait summary, character contract, identity anchors, allowed stylization, and disallowed drift boundary.",
  acceptance: "The named candidate covers the character identity anchors; identity drift remains a failing condition.",
  resultLines: (ctx) => [
    `- Character: ${ctx.characterContract.characterId}`,
    `- Identity anchors: ${ctx.characterContract.identityAnchors.join(", ")}`,
    `- Identity gate: ${ctx.identityGate.status}`,
    `- Reason codes: ${ctx.identityGate.reasonCodes.join(", ")}`,
    "- Decision: passed scoped for the named sample and named character contract."
  ],
  scanText: (ctx) => JSON.stringify(ctx.snapshots.identity),
  claim: "V33.2 may claim scoped identity contract coverage for the named local sample only."
});

printResult({
  ok: result.ok && context.identityGate.status === "passed",
  evidencePath: result.evidencePath,
  identityGate: context.identityGate.status,
  claimScan: result.claimScan,
  securityScan: result.securityScan
});
