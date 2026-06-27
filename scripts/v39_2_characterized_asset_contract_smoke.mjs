import { buildV39Context, generateV39VisualAssets, phaseHeader, printResult, scanBlock, v39Date, writeEvidence } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const assets = generateV39VisualAssets(context);
const passed = context.pipeline.characterContracts.filter((item) => item.status === "passed");
const blockedOrFailed = context.pipeline.characterContracts.filter((item) => item.status !== "passed");
const scans = scanBlock({ characterContracts: context.pipeline.characterContracts });
const ok = passed.length >= 2
  && blockedOrFailed.length >= 1
  && new Set(passed.map((item) => item.characterAssetId)).size === passed.length
  && passed.every((item) => item.noCardNoLabelProof.hasDecorativeCard === false && item.noCardNoLabelProof.hasVisibleTestLabel === false)
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.2 Characterized Asset Contract Evidence",
    phase: "V39.2 characterized asset contract",
    spec: "source sample to cleaned character asset with identity traits"
  }),
  "## Character Contract Result",
  `- Passed contracts: ${passed.length}.`,
  `- Blocked/failed contracts: ${blockedOrFailed.length}.`,
  `- Generated visual asset root: ${assets.evidenceRoot}.`,
  "",
  "## Passed Samples",
  ...passed.map((item) => `- ${item.sampleId}: ${item.characterAssetId}; traits=${item.identityTraits.map((trait) => trait.value).join(" / ")}.`),
  "",
  "## Blocked Or Failed Samples",
  ...blockedOrFailed.map((item) => `- ${item.sampleId}: ${item.status}; ${item.reasonCodes.join(", ")}.`),
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_2-characterized-asset-contract-${v39Date}.md`, body);
printResult({ ok, evidencePath, passedCount: passed.length, blockedOrFailedCount: blockedOrFailed.length, assets, scans });
