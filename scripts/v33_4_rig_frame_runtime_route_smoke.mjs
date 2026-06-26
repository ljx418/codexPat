import { buildV33Context, date, printResult, writeMarkdownEvidence } from "./v33_smoke_common.mjs";

const context = buildV33Context();
const result = writeMarkdownEvidence(`v33_4-rig-frame-runtime-route-${date}.md`, {
  context,
  title: "V33.4 Runtime-compatible Route Evidence",
  phase: "V33.4",
  spec: "docs/V33.x/v33_4-rig-frame-runtime-route-spec.md",
  development: "Normalized the passed frameSequence candidate to the existing sprite preview contract without changing bridge, HTTP, or petctl contracts.",
  acceptance: "All core actions remain covered and the runtime route uses the existing renderer-compatible frameSequence boundary.",
  resultLines: (ctx) => [
    `- Runtime route status: ${ctx.runtimeRoute.status}`,
    `- Renderer kind: ${ctx.runtimeRoute.rendererKind}`,
    `- Core actions covered: ${ctx.runtimeRoute.coreActionsCovered}`,
    `- Bridge contract changed: ${ctx.runtimeRoute.bridgeContractChanged}`,
    "- Decision: passed scoped for existing sprite/frameSequence runtime route."
  ],
  scanText: (ctx) => JSON.stringify(ctx.runtimeRoute),
  claim: "V33.4 may claim the named frameSequence candidate is compatible with the existing sprite preview route."
});

printResult({
  ok: result.ok && context.runtimeRoute.status === "passed" && context.runtimeRoute.coreActionsCovered && !context.runtimeRoute.bridgeContractChanged,
  evidencePath: result.evidencePath,
  runtimeRoute: context.runtimeRoute.status,
  claimScan: result.claimScan,
  securityScan: result.securityScan
});
