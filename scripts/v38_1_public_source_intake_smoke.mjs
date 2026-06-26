import {
  createV38PublicPhotoSources,
  downloadPublicSources,
  phaseHeader,
  printResult,
  scanBlock,
  v38Date,
  writeEvidence
} from "./v38_smoke_common.mjs";

const records = downloadPublicSources();
const manifest = {
  sourceCount: createV38PublicPhotoSources().length,
  records
};
const scans = scanBlock(manifest);
const ok = records.filter((record) => record.status === "accepted_for_sanitization" && record.sourceReady).length >= 3
  && records.some((record) => record.status === "rejected_non_cat_negative")
  && records.some((record) => record.status === "blocked_multi_cat_identity_ambiguity")
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const rows = records.map((record) =>
  `| ${record.sampleId} | ${record.sampleClass} | ${record.licenseShortName} | ${record.status} | ${record.sourceReady ? "yes" : "no"} |`
).join("\n");

const body = [
  phaseHeader({
    title: "V38.1 Public Source Intake Evidence",
    phase: "V38.1 public source intake",
    spec: "Wikimedia public file source manifest"
  }),
  "## Source Intake Results",
  "| Sample | Class | License | Status | Source Ready |",
  "| --- | --- | --- | --- | --- |",
  rows,
  "",
  "## Command Results",
  "- Public files downloaded to a temporary local folder outside repository evidence.",
  "- Original hashes stored as evidence references; raw original files are not stored in repository.",
  "- Wikimedia license metadata was queried through public API where available.",
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_1-public-source-intake-${v38Date}.md`, body);
printResult({ ok, evidencePath, acceptedCatCount: records.filter((record) => record.status === "accepted_for_sanitization").length });
