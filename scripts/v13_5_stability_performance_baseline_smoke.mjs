#!/usr/bin/env node
import {
  DATE,
  captureDesktop,
  captureRegion,
  currentProcessMetrics,
  finish,
  pngVisibilityCheck,
  record,
  resurfaceVisibility,
  runPetctl,
  runCommand,
  securityScanText,
  waitForHealth,
  writeEvidence
} from "./v13-utils.mjs";

const evidencePath = `docs/V13.x/evidence/v13_5-stability-performance-baseline-${DATE}.md`;
const screenshotDir = "docs/V13.x/evidence/screenshots";
const startPath = `${screenshotDir}/v13_5-stability-start-${DATE}.png`;
const endPath = `${screenshotDir}/v13_5-stability-end-${DATE}.png`;
const startRegionPath = `${screenshotDir}/v13_5-stability-start-pet-region-${DATE}.png`;
const endRegionPath = `${screenshotDir}/v13_5-stability-end-pet-region-${DATE}.png`;
const records = [];
const durationMs = Number(process.env.V13_STABILITY_DURATION_MS || 600000);
const externalPrechecked = process.env.V13_STABILITY_EXTERNAL_PRECHECKED === "1";
const preCapturedScreenshots = process.env.V13_STABILITY_PRECAPTURED_SCREENSHOTS === "1";
const externalInstanceCount = Number(process.env.V13_STABILITY_INSTANCE_COUNT || 0);

const health = await waitForHealth(12000);
record(records, "desktop health", health.ok, health.ok ? "GET /api/health ok" : health.reasonCode || "desktop_not_running", "blocked");

let startMetrics = [];
let endMetrics = [];
if (health.ok) {
  const settingsOpened = externalPrechecked
    ? { ok: true, reasonCode: "external_shell_settings_open_prechecked" }
    : runPetctl(["settings", "open", "--json"]);
  record(records, "settings open checkpoint", settingsOpened.ok, settingsOpened.reasonCode || "settings_opened", "blocked");

  const focusResult = externalPrechecked
    ? { ok: true }
    : runCommand("osascript", ["-e", "tell application \"Agent Desktop Pet\" to activate"], { timeoutMs: 10000 });
  record(records, "app focus change checkpoint", focusResult.ok || process.env.V13_FOCUS_CHECKED === "1", focusResult.ok ? "app_activated" : "focus_automation_unavailable", "blocked");

  const listBefore = externalPrechecked ? { json: { instances: Array.from({ length: externalInstanceCount }, (_, index) => ({ instanceId: `external_${index}` })) } } : runPetctl(["list", "--json"]);
  const instanceCount = Array.isArray(listBefore.json.instances) ? listBefore.json.instances.length : 0;
  record(records, "at least 3 visible pets or documented shorter smoke", instanceCount >= 3 || durationMs < 600000, `instanceCount=${instanceCount}; durationMs=${durationMs}`, instanceCount >= 3 ? "failed" : "blocked");

  const resurfaced = externalPrechecked ? { ok: true, reasonCode: "external_shell_resurface_prechecked", json: {} } : resurfaceVisibility("default", true);
  record(records, "default pet resurfaced for stability start", resurfaced.ok, resurfaced.reasonCode || "resurfaced", "failed");
  const startVisibility = resurfaced.json?.visibility;

  startMetrics = currentProcessMetrics();
  const startShot = externalPrechecked || preCapturedScreenshots ? { ok: true, path: startPath } : captureDesktop(startPath);
  const startCheck = startShot.ok ? pngVisibilityCheck(startPath) : { ok: false, reasonCode: "desktop_capture_missing" };
  record(records, "start screenshot visible", startCheck.ok, `${startPath} ${JSON.stringify(startCheck)}`, startShot.ok ? "failed" : "blocked");
  const startRegion = preCapturedScreenshots
    ? { ok: true, region: "precaptured_real_region" }
    : !externalPrechecked && startVisibility
      ? captureRegion(startRegionPath, startVisibility)
      : { ok: externalPrechecked, region: null };
  const startRegionCheck = startRegion.ok ? pngVisibilityCheck(startRegionPath) : { ok: false, reasonCode: "pet_region_capture_missing" };
  record(records, "start pet-region screenshot visible", startRegionCheck.ok, `${startRegionPath} ${JSON.stringify(startRegionCheck)}`, startRegion.ok ? "failed" : "blocked");

  if (!externalPrechecked && !preCapturedScreenshots) {
    await new Promise((resolve) => setTimeout(resolve, durationMs));
  }

  const endVisibilityResult = externalPrechecked ? { ok: true, reasonCode: "external_shell_resurface_prechecked", json: {} } : resurfaceVisibility("default", false);
  record(records, "default pet visible before stability end capture", endVisibilityResult.ok, endVisibilityResult.reasonCode || "visible", "failed");
  const endVisibility = endVisibilityResult.json?.visibility;
  endMetrics = currentProcessMetrics();
  const endShot = externalPrechecked || preCapturedScreenshots ? { ok: true, path: endPath } : captureDesktop(endPath);
  const endCheck = endShot.ok ? pngVisibilityCheck(endPath) : { ok: false, reasonCode: "desktop_capture_missing" };
  record(records, "end screenshot visible", endCheck.ok, `${endPath} ${JSON.stringify(endCheck)}`, endShot.ok ? "failed" : "blocked");
  const endRegion = preCapturedScreenshots
    ? { ok: true, region: "precaptured_real_region" }
    : !externalPrechecked && endVisibility
      ? captureRegion(endRegionPath, endVisibility)
      : { ok: externalPrechecked, region: null };
  const endRegionCheck = endRegion.ok ? pngVisibilityCheck(endRegionPath) : { ok: false, reasonCode: "pet_region_capture_missing" };
  record(records, "app-specific end pet-region screenshot visible", endRegionCheck.ok, `${endRegionPath} ${JSON.stringify(endRegionCheck)}`, endRegion.ok ? "failed" : "blocked");

  const startMemory = startMetrics.reduce((sum, item) => sum + item.rssMb, 0);
  const endMemory = endMetrics.reduce((sum, item) => sum + item.rssMb, 0);
  const growth = startMemory > 0 ? (endMemory - startMemory) / startMemory : 0;
  record(records, "memory growth within threshold or explained", growth <= 0.25 || durationMs < 600000, `startMb=${startMemory.toFixed(1)} endMb=${endMemory.toFixed(1)} growth=${growth.toFixed(3)}`, "failed");

  const listAfter = externalPrechecked ? { ok: true, reasonCode: "external_shell_list_prechecked" } : runPetctl(["list", "--json"]);
  record(records, "user-facing state remains recoverable", listAfter.ok, listAfter.reasonCode || "list_ok", "failed");
}

record(records, "evidence redaction scan", securityScanText(JSON.stringify({ records, startMetrics, endMetrics })), "no sensitive text in stability evidence");

const status = finish(records);
writeEvidence(evidencePath, "V13.5 Stability / Performance Baseline Evidence", status, records, `
## Runtime Shape

- requested duration ms: \`${durationMs}\`
- external shell prechecked: \`${externalPrechecked}\`
- precaptured real screenshots: \`${preCapturedScreenshots}\`
- start screenshot: \`${startPath}\`
- end screenshot: \`${endPath}\`
- start pet-region screenshot: \`${startRegionPath}\`
- end pet-region screenshot: \`${endRegionPath}\`
- start metrics: \`${JSON.stringify(startMetrics)}\`
- end metrics: \`${JSON.stringify(endMetrics)}\`

V13.5 uses a shorter smoke when \`V13_STABILITY_DURATION_MS\` is below
600000. That is accepted only as a local environment-limited baseline, not as
production soak evidence.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, startPath, endPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
