import {
  readJson,
  sanitizePublicCatSources,
  phaseHeader,
  printResult,
  scanBlock,
  v38Date,
  writeEvidence
} from "./v38_smoke_common.mjs";

const sourceRecords = readJson("docs/V38.x/evidence/v38-public-source-records.json", []);
const assets = sanitizePublicCatSources(sourceRecords);
const scans = scanBlock({ assets });
const ok = assets.filter((asset) => asset.status === "passed" && asset.exifStripped && asset.width === 512 && asset.height === 512).length >= 3
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const rows = assets.map((asset) =>
  `| ${asset.sampleId} | ${asset.width}x${asset.height} | ${asset.averageColor} | ${asset.exifStripped ? "yes" : "no"} | ${asset.status} |`
).join("\n");

const body = [
  phaseHeader({
    title: "V38.2 Pixel Sanitization Evidence",
    phase: "V38.2 pixel sanitization",
    spec: "public photo metadata stripping and derived image contract"
  }),
  "## Sanitized Pixel Assets",
  "| Sample | Size | Average Color | Metadata Stripped | Status |",
  "| --- | --- | --- | --- | --- |",
  rows,
  "",
  "## Command Results",
  "- ImageMagick convert ran with auto-orient, strip, resize, gravity center, and 512x512 extent.",
  "- Derived PNG files were written to evidence assets and desktop public assets.",
  "- Original files remain outside repository evidence.",
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_2-pixel-sanitization-${v38Date}.md`, body);
printResult({ ok, evidencePath, sanitizedCount: assets.length });
