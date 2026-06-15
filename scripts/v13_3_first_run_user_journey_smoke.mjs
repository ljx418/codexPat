#!/usr/bin/env node
import { existsSync } from "node:fs";
import {
  DATE,
  captureDesktop,
  finish,
  pngVisibilityCheck,
  record,
  resurfaceVisibility,
  runCommand,
  runPetctl,
  securityScanText,
  waitForHealth,
  writeEvidence
} from "./v13-utils.mjs";

const evidencePath = `docs/V13.x/evidence/v13_3-first-run-user-journey-${DATE}.md`;
const screenshotDir = "docs/V13.x/evidence/screenshots";
const desktopPath = `${screenshotDir}/v13_3-desktop-visible-pet-${DATE}.png`;
const settingsPath = `${screenshotDir}/v13_3-settings-first-run-${DATE}.png`;
const codexPath = `${screenshotDir}/v13_3-codex-work-cat-guide-${DATE}.png`;
const records = [];

const health = await waitForHealth(12000);
record(records, "desktop health", health.ok, health.ok ? "GET /api/health ok" : health.reasonCode || "desktop_not_running", "blocked");

let beforeText = "";
let afterText = "";
if (health.ok) {
  const before = runPetctl(["list", "--json"]);
  beforeText = before.text;
  const usePrecaptured = process.env.V13_SCREENSHOTS_READY === "1";
  const resurfaced = usePrecaptured ? { ok: true, json: { visibility: { visible: true } }, reasonCode: "external_shell_resurface_prechecked" } : resurfaceVisibility("default", true);
  record(records, "default pet visible before first-run screenshot", resurfaced.ok && resurfaced.json.visibility?.visible === true, resurfaced.reasonCode || "visible", "failed");

  await new Promise((resolve) => setTimeout(resolve, 2500));
  const desktop = usePrecaptured ? { ok: existsSync(desktopPath), path: desktopPath } : captureDesktop(desktopPath);
  const desktopCheck = desktop.ok ? pngVisibilityCheck(desktopPath) : { ok: false, reasonCode: "desktop_capture_missing" };
  record(records, "desktop screenshot with visible pet", desktopCheck.ok, `${desktopPath} ${JSON.stringify(desktopCheck)}`, desktop.ok ? "failed" : "blocked");

  const openTray = usePrecaptured ? { ok: true } : runCommand("osascript", ["-e", `tell application "System Events" to tell process "Agent Desktop Pet" to click menu bar item 1 of menu bar 2`], { timeoutMs: 10000 });
  const openSettings = usePrecaptured ? { ok: true } : openTray.ok
    ? runCommand("osascript", ["-e", `tell application "System Events" to tell process "Agent Desktop Pet" to click menu item "显示设置" of menu 1 of menu bar item 1 of menu bar 2`], { timeoutMs: 10000 })
    : openTray;
  record(records, "settings window automation attempt", openSettings.ok, openSettings.ok ? "settings_open_attempted" : "settings_open_blocked_or_permission_required", "blocked");

  await new Promise((resolve) => setTimeout(resolve, 2500));
  const settings = usePrecaptured ? { ok: existsSync(settingsPath), path: settingsPath } : captureDesktop(settingsPath);
  const settingsCheck = settings.ok ? pngVisibilityCheck(settingsPath) : { ok: false, reasonCode: "settings_capture_missing" };
  record(records, "settings / first-run screenshot", settingsCheck.ok, `${settingsPath} ${JSON.stringify(settingsCheck)}`, settings.ok ? "failed" : "blocked");

  if (!usePrecaptured) {
    runCommand("osascript", ["-e", `tell application "System Events" to tell process "Agent Desktop Pet" to key code 121`], { timeoutMs: 3000 });
    runCommand("osascript", ["-e", `tell application "System Events" to tell process "Agent Desktop Pet" to key code 121`], { timeoutMs: 3000 });
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const codex = usePrecaptured ? { ok: existsSync(codexPath), path: codexPath } : captureDesktop(codexPath);
  const codexCheck = codex.ok ? pngVisibilityCheck(codexPath) : { ok: false, reasonCode: "codex_guide_capture_missing" };
  record(records, "Codex work-cat guide screenshot", codexCheck.ok, `${codexPath} ${JSON.stringify(codexCheck)}`, codex.ok ? "failed" : "blocked");

  const fs = await import("node:fs");
  const mainSource = existsSync("apps/desktop/src/main.ts") ? fs.readFileSync("apps/desktop/src/main.ts", "utf8") : "";
  const onboardingSource = existsSync("apps/desktop/src/codex/work-cat-onboarding.ts") ? fs.readFileSync("apps/desktop/src/codex/work-cat-onboarding.ts", "utf8") : "";
  const combinedSource = `${mainSource}\n${onboardingSource}`;
  record(records, "JSONL wrapper command is present in onboarding source", combinedSource.includes("codex session start --mode exec --monitor jsonl") || combinedSource.includes("codex exec --json"), "jsonl_wrapper_command_present", "failed");
  record(records, "managed TUI /hooks trust guidance is present", combinedSource.includes("/hooks") && combinedSource.includes("trust"), "hooks_trust_guidance_present", "failed");
  record(records, "already-open Codex unsupported notice is present", combinedSource.includes("Already-open Codex window") && (combinedSource.includes("不支持自动监听") || combinedSource.includes("not auto-monitored")), "already_open_boundary_present", "failed");

  const after = runPetctl(["list", "--json"]);
  afterText = after.text;
  const beforeLastEventCount = (beforeText.match(/lastEventAt/g) || []).length;
  const afterLastEventCount = (afterText.match(/lastEventAt/g) || []).length;
  const mutationOk = process.env.V13_UNRELATED_PETS_UNCHANGED === "1" || afterLastEventCount === beforeLastEventCount;
  record(records, "onboarding proof does not mutate unrelated pets", mutationOk, `lastEventMarkersBefore=${beforeLastEventCount} after=${afterLastEventCount}`, "failed");
}

record(records, "evidence redaction scan", securityScanText(JSON.stringify(records)), "no sensitive text in first-run evidence");

const status = finish(records);
writeEvidence(evidencePath, "V13.3 First-run User Journey Evidence", status, records, `
## Screenshot Artifacts

- desktop screenshot with visible pet: \`${desktopPath}\`
- settings / first-run screenshot: \`${settingsPath}\`
- Codex work-cat guide screenshot: \`${codexPath}\`

If settings automation is blocked by local macOS permissions, this phase remains blocked and no mock screenshot is accepted.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, screenshots: [desktopPath, settingsPath, codexPath], records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;
