#!/usr/bin/env node
import {
  DATE,
  finish,
  record,
  requirePetctlDist,
  resurfaceVisibility,
  securityScanText,
  visibilityDiagnostics,
  waitForHealth,
  writeEvidence
} from "./v12-utils.mjs";

const evidencePath = `docs/V12.x/evidence/v12_1-visibility-diagnostics-smoke-${DATE}.md`;
const records = [];

const health = await waitForHealth();
record(records, "desktop health", health.ok, health.ok ? "GET /api/health ok" : "desktop_not_running", "blocked");
if (requirePetctlDist(records) && health.ok) {
  const resurfaced = resurfaceVisibility("default", true);
  record(records, "default resurface for diagnostic baseline", resurfaced.ok, resurfaced.reasonCode || "resurfaced", resurfaced.reasonCode === "desktop_not_running" ? "blocked" : "failed");

  const diagnostics = visibilityDiagnostics("default");
  record(records, "default visibility diagnostics", diagnostics.ok, diagnostics.reasonCode || diagnostics.json.visibility?.screenshotObservation?.reasonCode || "diagnostics");
  record(records, "diagnostics safe field shape", hasSafeShape(diagnostics.json.visibility), "instance/window/position/size/monitor/layering/screenshotObservation");

  const invalid = visibilityDiagnostics("../bad");
  record(records, "invalid instance rejected locally", !invalid.ok && invalid.reasonCode === "instance_id_invalid", `reasonCode=${invalid.reasonCode || "none"}`);

  const serialized = `${diagnostics.text}\n${JSON.stringify(diagnostics.json)}\n${invalid.text}`;
  record(records, "redaction scan", securityScanText(serialized), "no token/auth/raw payload/path leakage");
}

const status = finish(records);
writeEvidence(evidencePath, "V12.1 Visibility Diagnostics Smoke Evidence", status, records, `
## Scope

V12.1 verifies sanitized visibility diagnostics for the default pet. It does
not prove screenshot visibility; V12.3 owns real desktop screenshot evidence.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function hasSafeShape(visibility) {
  return visibility &&
    visibility.instanceId === "default" &&
    typeof visibility.windowLabel === "string" &&
    typeof visibility.visible === "boolean" &&
    Number.isFinite(visibility.position?.x) &&
    Number.isFinite(visibility.position?.y) &&
    Number.isFinite(visibility.size?.width) &&
    Number.isFinite(visibility.size?.height) &&
    typeof visibility.monitorSummary === "string" &&
    typeof visibility.layering?.alwaysOnTopRequested === "boolean" &&
    typeof visibility.screenshotObservation?.reasonCode === "string";
}
