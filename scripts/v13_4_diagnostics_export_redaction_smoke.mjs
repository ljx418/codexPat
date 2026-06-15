#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import {
  DATE,
  finish,
  record,
  runCommand,
  securityScanText,
  tsxLoaderPath,
  writeEvidence
} from "./v13-utils.mjs";

const evidencePath = `docs/V13.x/evidence/v13_4-diagnostics-export-redaction-${DATE}.md`;
const exportPath = `docs/V13.x/evidence/v13_4-safe-diagnostics-export-${DATE}.json`;
const records = [];

const script = `
const { createSanitizedDiagnosticsExport, diagnosticsExportHasForbiddenContent } = await import("./apps/desktop/src/release/release-foundation.ts");
const exported = createSanitizedDiagnosticsExport({
  appEnabled: true,
  listenAddress: "127.0.0.1:17321",
  queueLength: 1,
  queueCapacity: 32,
  muted: false,
  instanceCount: 3,
  importedPackCount: 1,
  lastAcceptedLevel: "success",
  lastAcceptedSourceKind: "codex",
  lastRejectedReasonCode: "none",
  buildFlavor: "local_unsigned"
});
process.stdout.write(JSON.stringify({ exported, forbidden: diagnosticsExportHasForbiddenContent(exported) }));
`;

const result = runCommand("node", ["--import", tsxLoaderPath, "--input-type=module", "-e", script], { timeoutMs: 60000 });
record(records, "diagnostics export generator runs", result.ok, `exit=${result.status}`, "failed");

let exported = "";
let forbidden = true;
if (result.ok) {
  try {
    const parsed = JSON.parse(result.stdout);
    exported = parsed.exported;
    forbidden = parsed.forbidden === true;
  } catch {
    exported = "";
    forbidden = true;
  }
}
record(records, "diagnostics export exists", exported.length > 0, "diagnostics_export_present", "failed");
record(records, "release diagnostics scanner passes", !forbidden, forbidden ? "diagnostics_redaction_failed" : "diagnostics_redaction_passed", "failed");
record(records, "V13 forbidden field redaction scan", securityScanText(exported), "no forbidden fields in diagnostics export", "failed");

if (exported && securityScanText(exported)) {
  writeFileSync(exportPath, exported, "utf8");
  record(records, "sanitized diagnostics export artifact written", true, exportPath);
} else {
  record(records, "sanitized diagnostics export artifact written", false, "diagnostics_export_missing", "failed");
}

const status = finish(records);
writeEvidence(evidencePath, "V13.4 Diagnostics Export Redaction Evidence", status, records, `
## Sanitized Export

- export file: \`${exportPath}\`

Allowed fields are limited to app/build/platform summary, sanitized bridge/runtime
status, instance counts, safe source kind, and safe reasonCode summaries.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, exportPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
