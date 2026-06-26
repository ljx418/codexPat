import {
  generateRenderableActionPacks,
  phaseHeader,
  printResult,
  scanBlock,
  v38Date,
  writeEvidence
} from "./v38_smoke_common.mjs";

const packs = generateRenderableActionPacks();
const scans = scanBlock({ packs });
const ok = packs.filter((pack) => pack.status === "renderable" && pack.actionCoverage.length === 8 && pack.wholeImageTransformOnly === false).length >= 3
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const rows = packs.map((pack) =>
  `| ${pack.sampleId} | ${pack.actionCoverage.length} | ${Object.values(pack.frameCountByAction).reduce((sum, count) => sum + count, 0)} | ${pack.wholeImageTransformOnly ? "yes" : "no"} | ${pack.status} |`
).join("\n");

const body = [
  phaseHeader({
    title: "V38.3 Renderable Action Pack Evidence",
    phase: "V38.3 renderable action pack",
    spec: "sample-bound local overlay frame synthesis"
  }),
  "## Renderable Packs",
  "| Sample | Actions | Frames | Transform Only | Status |",
  "| --- | --- | --- | --- | --- |",
  rows,
  "",
  "## Command Results",
  "- For each passing public cat sample, generated 8 actions with 4 PNG frames per action.",
  "- Generated contact sheet and animated GIF preview per sample.",
  "- Local overlays provide per-action motion cues; the source-bound cat photo base is not accepted as a transform-only weak action by itself.",
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_3-renderable-action-pack-${v38Date}.md`, body);
printResult({ ok, evidencePath, packCount: packs.length });
