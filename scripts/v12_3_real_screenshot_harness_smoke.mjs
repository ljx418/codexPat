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
  securityScanText,
  waitForHealth,
  writeEvidence
} from "./v12-utils.mjs";

const evidencePath = `docs/V12.x/evidence/v12_3-real-screenshot-harness-smoke-${DATE}.md`;
const desktopPath = `docs/V12.x/evidence/screenshots/v12_3-real-desktop-${DATE}.png`;
const regionPath = `docs/V12.x/evidence/screenshots/v12_3-real-pet-region-${DATE}.png`;
const records = [];

const health = await waitForHealth();
record(records, "desktop health", health.ok, health.ok ? "GET /api/health ok" : "desktop_not_running", "blocked");
if (requirePetctlDist(records) && health.ok) {
  const resurfaced = resurfaceVisibility("default", true);
  const visibility = resurfaced.json.visibility;
  record(records, "default pet resurfaced before screenshot", resurfaced.ok && visibility?.visible === true, resurfaced.reasonCode || visibility?.screenshotObservation?.reasonCode || "resurfaced", resurfaced.reasonCode === "desktop_not_running" ? "blocked" : "failed");

  const desktop = captureDesktop(desktopPath);
  record(records, "real desktop screenshot captured", desktop.ok, desktop.ok ? desktopPath : `screencapture_failed:${desktop.status}`, desktop.ok ? "failed" : "blocked");

  const region = visibility
    ? await captureVisibleRegion(regionPath, visibility)
    : { ok: false, capture: { ok: false, path: regionPath, region: null }, check: { ok: false, reasonCode: "pet_region_capture_missing" }, attempts: 0 };
  record(
    records,
    "pet-region screenshot captured",
    region.capture.ok,
    region.capture.ok ? `${JSON.stringify(region.capture.region)} attempts=${region.attempts}` : "pet_region_capture_missing",
    region.capture.ok ? "failed" : "blocked"
  );

  const desktopCheck = desktop.ok ? pngVisibilityCheck(desktopPath) : { ok: false, reasonCode: "desktop_capture_missing" };
  const regionCheck = region.check;
  record(records, "desktop screenshot PNG check", desktopCheck.ok, JSON.stringify(desktopCheck), desktopCheck.reasonCode === "desktop_capture_missing" ? "blocked" : "failed");
  record(records, "pet-region nonblank/non-flat check", regionCheck.ok, JSON.stringify(regionCheck), regionCheck.reasonCode === "pet_region_capture_missing" ? "blocked" : "failed");

  const serialized = `${JSON.stringify(visibility)}\n${JSON.stringify(desktopCheck)}\n${JSON.stringify(regionCheck)}`;
  record(records, "redaction scan", securityScanText(serialized), "no sensitive text in screenshot diagnostics");
}

const status = finish(records);
writeEvidence(evidencePath, "V12.3 Real Screenshot Harness Smoke Evidence", status, records, `
## Screenshot Artifacts

- real desktop screenshot: \`${desktopPath}\`
- pet-region screenshot: \`${regionPath}\`

Runtime HTML screenshots do not satisfy this gate.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, desktopPath, regionPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
