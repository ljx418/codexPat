#!/usr/bin/env node
import {
  DATE,
  captureDesktop,
  captureVisibleRegion,
  finish,
  pngVisibilityCheck,
  record,
  requirePetctlDist,
  resurfaceVisibility,
  runPetctl,
  securityScanText,
  visibilityDiagnostics,
  waitForHealth,
  writeEvidence
} from "./v12-utils.mjs";

const evidencePath = `docs/V12.x/evidence/v12_5-window-monitor-regression-${DATE}.md`;
const beforePath = `docs/V12.x/evidence/screenshots/v12_5-reset-position-before-${DATE}.png`;
const afterPath = `docs/V12.x/evidence/screenshots/v12_5-reset-position-after-${DATE}.png`;
const targetRegionPath = `docs/V12.x/evidence/screenshots/v12_5-target-pet-region-${DATE}.png`;
const records = [];
let targetInstanceId = null;

try {
  const health = await waitForHealth();
  record(records, "desktop health", health.ok, health.ok ? "GET /api/health ok" : "desktop_not_running", "blocked");
  if (requirePetctlDist(records) && health.ok) {
    const defaultBefore = visibilityDiagnostics("default");
    captureDesktop(beforePath);
    record(records, "default baseline diagnostics", defaultBefore.ok, defaultBefore.reasonCode || defaultBefore.json.visibility?.screenshotObservation?.reasonCode || "baseline");

    const created = runPetctl(["attach", "codex", "--name", `V12.5 Monitor Cat ${Date.now()}`, "--json"]);
    targetInstanceId = created.json.instanceId || null;
    record(records, "target pet created", created.ok && Boolean(targetInstanceId), created.reasonCode || targetInstanceId || "created");

    if (targetInstanceId) {
      const targetResurface = resurfaceVisibility(targetInstanceId, true);
      const targetVisibility = targetResurface.json.visibility;
      record(records, "target reset/resurface", targetResurface.ok && targetVisibility?.visible === true, targetResurface.reasonCode || "target visible");
      const targetRegion = targetVisibility
        ? await captureVisibleRegion(targetRegionPath, targetVisibility)
        : { ok: false, capture: { ok: false }, check: { ok: false, reasonCode: "pet_region_capture_missing" }, attempts: 0 };
      const targetCheck = targetRegion.check;
      record(records, "target pet-region visible", targetCheck.ok, JSON.stringify(targetCheck), targetCheck.reasonCode === "pet_region_capture_missing" ? "blocked" : "failed");
    }

    const defaultAfter = resurfaceVisibility("default", true);
    const afterCapture = captureDesktop(afterPath);
    const afterCheck = afterCapture.ok ? pngVisibilityCheck(afterPath) : { ok: false, reasonCode: "desktop_capture_missing" };
    record(records, "default reset after target operations", defaultAfter.ok && defaultAfter.json.visibility?.visible === true, defaultAfter.reasonCode || "default visible");
    record(records, "reset-position after screenshot visible", afterCheck.ok, JSON.stringify(afterCheck), afterCheck.reasonCode === "desktop_capture_missing" ? "blocked" : "failed");

    const list = runPetctl(["list", "--json"]);
    const defaultState = (list.json.instances || []).find((instance) => instance.instanceId === "default")?.currentState;
    record(records, "default pet remains listed", defaultState !== undefined, `state=${defaultState || "missing"}`);

    const serialized = `${defaultBefore.text}\n${JSON.stringify(defaultAfter.json)}\n${list.text}`;
    record(records, "redaction scan", securityScanText(serialized), "no sensitive text in monitor regression output");
  }
} finally {
  if (targetInstanceId) {
    runPetctl(["detach", "--instance", targetInstanceId, "--json"]);
  }
}

const status = finish(records);
writeEvidence(evidencePath, "V12.5 Window / Monitor Regression Evidence", status, records, `
## Screenshot Artifacts

- reset-position before: \`${beforePath}\`
- reset-position after: \`${afterPath}\`
- target pet region: \`${targetRegionPath}\`

V12.5 verifies target isolation for visibility operations and does not claim
all-monitor or cross-platform readiness.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, beforePath, afterPath, targetRegionPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
