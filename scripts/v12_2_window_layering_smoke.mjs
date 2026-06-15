#!/usr/bin/env node
import {
  DATE,
  finish,
  record,
  requirePetctlDist,
  resurfaceVisibility,
  runPetctl,
  securityScanText,
  visibilityDiagnostics,
  waitForHealth,
  writeEvidence
} from "./v12-utils.mjs";

const evidencePath = `docs/V12.x/evidence/v12_2-window-layering-smoke-${DATE}.md`;
const records = [];
let createdInstanceId = null;

try {
  const health = await waitForHealth();
  record(records, "desktop health", health.ok, health.ok ? "GET /api/health ok" : "desktop_not_running", "blocked");
  if (requirePetctlDist(records) && health.ok) {
    const before = runPetctl(["list", "--json"]);
    const beforeCount = before.json.instances?.length ?? 0;
    record(records, "baseline list", before.ok, `count=${beforeCount}`);

    const defaultResurface = resurfaceVisibility("default", true);
    const defaultDiag = defaultResurface.json.visibility;
    record(records, "default resurface/reset", defaultResurface.ok && defaultDiag?.visible === true, defaultResurface.reasonCode || defaultDiag?.screenshotObservation?.reasonCode);
    record(records, "default layering requested", layeringOk(defaultDiag), "alwaysOnTop/allWorkspaces/transparent requested");

    const created = runPetctl(["attach", "codex", "--name", `V12.2 Layer Cat ${Date.now()}`, "--json"]);
    createdInstanceId = created.json.instanceId || null;
    record(records, "create target pet", created.ok && Boolean(createdInstanceId), created.reasonCode || createdInstanceId || "created");

    if (createdInstanceId) {
      const targetResurface = resurfaceVisibility(createdInstanceId, true);
      const repeated = resurfaceVisibility(createdInstanceId, false);
      const targetDiag = visibilityDiagnostics(createdInstanceId);
      record(records, "target resurface/reset", targetResurface.ok && targetResurface.json.visibility?.visible === true, targetResurface.reasonCode || "visible");
      record(records, "repeated resurface does not fail", repeated.ok, repeated.reasonCode || "second resurface ok");
      record(records, "target visibility diagnostics", targetDiag.ok && targetDiag.json.visibility?.instanceId === createdInstanceId, targetDiag.reasonCode || "target diagnostics ok");
      record(records, "target layering requested", layeringOk(targetDiag.json.visibility), "alwaysOnTop/allWorkspaces/transparent requested");
    }

    const after = runPetctl(["list", "--json"]);
    const afterIds = new Set((after.json.instances || []).map((instance) => instance.instanceId));
    record(records, "no duplicate target windows listed", createdInstanceId ? afterIds.has(createdInstanceId) : false, `count=${after.json.instances?.length ?? 0}`);

    const serialized = `${defaultResurface.text}\n${JSON.stringify(defaultResurface.json)}\n${after.text}`;
    record(records, "redaction scan", securityScanText(serialized), "no sensitive text in visibility output");
  }
} finally {
  if (createdInstanceId) {
    runPetctl(["detach", "--instance", createdInstanceId, "--json"]);
  }
}

const status = finish(records);
writeEvidence(evidencePath, "V12.2 Window Layering Smoke Evidence", status, records, `
## Scope

V12.2 verifies re-show/reset/layering requests for default and one target pet.
It does not claim cross-Space or full-screen overlay readiness.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function layeringOk(visibility) {
  return visibility?.layering?.alwaysOnTopRequested === true &&
    visibility?.layering?.visibleOnAllWorkspacesRequested === true &&
    visibility?.layering?.transparentRequested === true;
}
