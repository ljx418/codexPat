import { buildV39Context, generateV39VisualAssets, phaseHeader, printResult, scanBlock, v39Date, writeEvidence } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const assets = generateV39VisualAssets(context);
const passedPacks = context.pipeline.actionPacks.filter((item) => item.status === "passed");
const passedGates = context.pipeline.actionQualityGates.filter((item) => item.status === "passed");
const scans = scanBlock({
  actionPacks: context.pipeline.actionPacks,
  actionQualityGates: context.pipeline.actionQualityGates
});
const ok = passedPacks.length >= 2
  && passedGates.length >= 2
  && passedPacks.every((pack) => pack.actionSequences.length === 8)
  && passedPacks.every((pack) => pack.actionSequences.every((sequence) => sequence.frameCount >= 8 && sequence.movingParts.length > 0))
  && context.weakTransform?.gate.status === "failed"
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.4 Route A2++ Action Frame Composer Evidence",
    phase: "V39.4 Route A2++ action frame composer",
    spec: "eight actions with local part motion and pose changes"
  }),
  "## Composer Result",
  `- Passed packs: ${passedPacks.length}.`,
  `- Passed quality gates: ${passedGates.length}.`,
  `- Weak transform negative gate: ${context.weakTransform?.gate.status ?? "missing"}.`,
  `- Visual asset root: ${assets.evidenceRoot}.`,
  "",
  "## Pack Summary",
  ...passedPacks.map((pack) => `- ${pack.sampleId}: ${pack.actionSequences.length} actions; minFrames=${Math.min(...pack.actionSequences.map((item) => item.frameCount))}; contactSheet=${pack.contactSheetRef}.`),
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_4-action-frame-composer-${v39Date}.md`, body);
printResult({ ok, evidencePath, passedPackCount: passedPacks.length, weakTransform: context.weakTransform?.gate, assets, scans });
