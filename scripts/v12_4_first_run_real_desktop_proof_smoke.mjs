#!/usr/bin/env node
import {
  DATE,
  captureDesktop,
  finish,
  pngVisibilityCheck,
  record,
  requirePetctlDist,
  resurfaceVisibility,
  runPetctl,
  securityScanText,
  waitForHealth,
  writeEvidence
} from "./v12-utils.mjs";

const evidencePath = `docs/V12.x/evidence/v12_4-first-run-real-desktop-proof-${DATE}.md`;
const screenshotPath = `docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-${DATE}.png`;
const records = [];

const health = await waitForHealth();
record(records, "desktop health", health.ok, health.ok ? "GET /api/health ok" : "desktop_not_running", "blocked");
if (requirePetctlDist(records) && health.ok) {
  const before = runPetctl(["list", "--json"]);
  const acceptedBefore = JSON.stringify(before.json.raw ?? before.json).match(/lastEventAt/g)?.length ?? 0;
  const resurfaced = resurfaceVisibility("default", true);
  record(records, "first-run visible default pet path", resurfaced.ok && resurfaced.json.visibility?.visible === true, resurfaced.reasonCode || "visible within local proof path");

  await new Promise((resolve) => setTimeout(resolve, 2500));
  const screenshot = captureDesktop(screenshotPath);
  const check = screenshot.ok ? pngVisibilityCheck(screenshotPath) : { ok: false, reasonCode: "desktop_capture_missing" };
  record(records, "first-run real desktop screenshot captured", screenshot.ok, screenshot.ok ? screenshotPath : "desktop_capture_missing", screenshot.ok ? "failed" : "blocked");
  record(records, "first-run screenshot visible pixels", check.ok, JSON.stringify(check), check.reasonCode === "desktop_capture_missing" ? "blocked" : "failed");

  const after = runPetctl(["list", "--json"]);
  const acceptedAfter = JSON.stringify(after.json.raw ?? after.json).match(/lastEventAt/g)?.length ?? 0;
  record(records, "first-run proof does not send PetEvent", acceptedAfter === acceptedBefore, `eventMarkerCountBefore=${acceptedBefore} after=${acceptedAfter}`);

  const serialized = `${JSON.stringify(resurfaced.json)}\n${JSON.stringify(check)}\n${after.text}`;
  record(records, "redaction scan", securityScanText(serialized), "no sensitive text in first-run proof output");
}

const status = finish(records);
writeEvidence(evidencePath, "V12.4 First-run Real Desktop Proof Evidence", status, records, `
## Screenshot Artifact

- first-run desktop screenshot: \`${screenshotPath}\`

This proof uses local visibility/resurface behavior and does not mutate
Agent/Codex state.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, screenshotPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
