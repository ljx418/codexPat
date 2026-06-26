import {
  buildV38Context,
  phaseHeader,
  printResult,
  scanBlock,
  v38Date,
  writeEvidence
} from "./v38_smoke_common.mjs";

const { snapshot } = buildV38Context();
const requiredAnchors = [
  "v38-public-photo-action-entry",
  "v38-public-source-status",
  "v38-pixel-asset-status",
  "v38-renderable-pack-preview",
  "v38-product-apply-rollback",
  "v38-blocked-reason"
];
const anchorStatus = requiredAnchors.map((anchor) => ({
  anchor,
  present: snapshot.productUiAnchors.includes(anchor)
}));
const scans = scanBlock({ anchorStatus, snapshot });
const ok = anchorStatus.every((item) => item.present)
  && snapshot.status === "passed"
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V38.5 Product E2E UI Contract Evidence",
    phase: "V38.5 product e2e UI contract",
    spec: "desktop settings V38 public photo action anchors"
  }),
  "## UI Anchors",
  "| Anchor | Present |",
  "| --- | --- |",
  anchorStatus.map((item) => `| ${item.anchor} | ${item.present ? "yes" : "no"} |`).join("\n"),
  "",
  "## Product Path",
  `- Pipeline status: ${snapshot.status}.`,
  `- Reason codes: ${snapshot.reasonCodes.join(", ")}.`,
  "- Screenshot-backed browser report is generated in V38.6.",
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_5-product-e2e-ui-contract-${v38Date}.md`, body);
printResult({ ok, evidencePath, anchorStatus });
