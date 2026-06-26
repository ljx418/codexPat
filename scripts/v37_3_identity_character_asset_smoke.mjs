import { buildV37Context, evidenceHeader, identityRows, printResult, scanBlock, v37Date, writeEvidence } from "./v37_smoke_common.mjs";

const context = buildV37Context();
const scan = scanBlock(context.snapshot.identityContracts);
const passed = context.snapshot.identityContracts.filter((contract) => contract.status === "passed");
const ok = passed.length >= 2 && new Set(passed.map((contract) => contract.characterAssetId)).size === passed.length && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const body = [
  evidenceHeader({ title: "V37.3 Identity And Character Asset", phase: "V37.3 identity and character asset", spec: "docs/V37.x/v37-engineering-implementation-blueprint.md" }),
  "## Identity Contracts",
  "| sampleId | characterAssetId | status | crossSampleReuseCheck | reasonCodes |",
  "| --- | --- | --- | --- | --- |",
  identityRows(context.snapshot),
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: passing samples have distinct characterAssetId and identity anchors." : "- failed: identity/character asset contract did not pass.",
  ""
].join("\n");
const evidencePath = writeEvidence(`docs/V37.x/evidence/v37_3-identity-character-asset-${v37Date}.md`, body);
printResult({ ok, status: ok ? "passed scoped" : "failed", evidencePath });
