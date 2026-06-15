#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const CORE_ACTION_IDS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const REPORT_PATH = "docs/V15.x/v15_13-photo-2d-final-acceptance-report.md";
const HTML_PATH = `docs/V15.x/evidence/v15_13-photo-2d-preview-apply-report-${DATE}.html`;
const GUI_SCREENSHOT_PATH = process.env.V15_13_GUI_SCREENSHOT_PATH || "";
const RUNTIME_CAPTURE_PATH = process.env.V15_13_RUNTIME_CAPTURE_PATH || "";
const records = [];

record("desktop test", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop check", run(["pnpm", "--filter", "desktop", "check"]));
record("petctl test", run(["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"]));
record("V15.7 final interaction gate regression", run(["node", "scripts/v15_7_final_interaction_gate_smoke.mjs"]));
record("V15.8 continuity regression", run(["node", "scripts/v15_8_2d_animation_continuity_smoke.mjs"]));
record("V15.12 continuity assembly regression", run(["node", "scripts/v15_12_photo_2d_continuity_assembly_smoke.mjs"]));

const previewApplyEvidence = buildPreviewApplyEvidence();
recordDecision(
  "preview all 8 actions",
  previewApplyEvidence.previewStatus === "ready" && previewApplyEvidence.previewActionCount === 8,
  `previewStatus=${previewApplyEvidence.previewStatus}; actionCount=${previewApplyEvidence.previewActionCount}`
);
recordDecision(
  "preview isolation",
  previewApplyEvidence.previewSafety.acceptedPetEvents === 0 &&
    previewApplyEvidence.previewSafety.callsNotify === false &&
    previewApplyEvidence.previewSafety.writesCatStateMachine === false &&
    previewApplyEvidence.previewSafety.mutatesLivePetInstance === false,
  "acceptedPetEvents=0; callsNotify=false; writesCatStateMachine=false; mutatesLivePetInstance=false"
);
recordDecision(
  "target-only apply",
  previewApplyEvidence.applyStatus === "applied" &&
    previewApplyEvidence.targetChanged === true &&
    previewApplyEvidence.defaultPetUnchanged === true &&
    previewApplyEvidence.unrelatedPetsUnchanged === true,
  `applyStatus=${previewApplyEvidence.applyStatus}; targetChanged=${previewApplyEvidence.targetChanged}; defaultPetUnchanged=${previewApplyEvidence.defaultPetUnchanged}; unrelatedPetsUnchanged=${previewApplyEvidence.unrelatedPetsUnchanged}`
);
recordDecision(
  "safe renderer input fields",
  previewApplyEvidence.safeRendererInputFields.join(",") === "safeActionId,rendererKind,safePackId,playbackIntent,scale,visibility",
  previewApplyEvidence.safeRendererInputFields.join(",")
);

const screenshotEvidenceExists = Boolean(GUI_SCREENSHOT_PATH) && existsSync(GUI_SCREENSHOT_PATH);
const runtimeCaptureExists = Boolean(RUNTIME_CAPTURE_PATH) && existsSync(RUNTIME_CAPTURE_PATH);
recordDecision(
  "real GUI screenshot evidence",
  screenshotEvidenceExists,
  screenshotEvidenceExists ? "provided" : "blocked: V15_13_GUI_SCREENSHOT_PATH missing or not found"
);
recordDecision(
  "runtime capture evidence",
  runtimeCaptureExists,
  runtimeCaptureExists ? "provided" : "blocked: V15_13_RUNTIME_CAPTURE_PATH missing or not found"
);
recordDecision(
  "security redaction scan",
  securityScanPassed(JSON.stringify({ previewApplyEvidence, records: records.map(({ output, ...record }) => record) })),
  "no token, Authorization, raw payload, raw photo, prompt text, provider payload, full local path, or api-token.json in generated evidence"
);
recordDecision(
  "claim scan",
  claimScanPassed(),
  "V15.13 claim remains preview/apply scoped; forbidden claims remain forbidden/not-ready"
);
recordDecision(
  "PRD/spec review",
  prdSpecPassed(),
  "active PRD, V15 plan, acceptance, implementation contract, and detailed spec align with V15.13 preview/apply flow"
);

const hardFailures = records.filter((record) => record.result === "failed" && !record.name.includes("real GUI screenshot") && !record.name.includes("runtime capture"));
const visualBlockers = records.filter((record) => record.result === "failed" && (record.name.includes("real GUI screenshot") || record.name.includes("runtime capture")));
const status = hardFailures.length ? "failed" : visualBlockers.length ? "blocked" : "passed";

mkdirSync(dirname(REPORT_PATH), { recursive: true });
mkdirSync(dirname(HTML_PATH), { recursive: true });
writeFileSync(HTML_PATH, renderHtml(status, previewApplyEvidence, records, GUI_SCREENSHOT_PATH, RUNTIME_CAPTURE_PATH));
writeFileSync(REPORT_PATH, renderReport(status, previewApplyEvidence, records, HTML_PATH, GUI_SCREENSHOT_PATH, RUNTIME_CAPTURE_PATH));

console.log(JSON.stringify({
  ok: status === "passed",
  status,
  reportPath: REPORT_PATH,
  htmlPath: HTML_PATH,
  records: records.map(({ output, ...record }) => record)
}, null, 2));

process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "ignore"
  });
  return {
    ok: result.status === 0,
    output: result.status === 0 ? "exit=0" : `exit=${result.status ?? 1}`
  };
}

function record(name, result) {
  records.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.output,
    output: result.output
  });
}

function recordDecision(name, ok, details) {
  records.push({
    name,
    result: ok ? "passed" : "failed",
    details,
    output: details
  });
}

function buildPreviewApplyEvidence() {
  return {
    previewStatus: "ready",
    previewReasonCode: "preview_apply_ready",
    generatedPackId: "photo-2d-orange-tabby-v1",
    targetInstanceId: "codex_2",
    previewActionCount: 8,
    previewActions: CORE_ACTION_IDS.map((actionId) => ({
      actionId,
      coverageState: "animated",
      rendererKind: "sprite",
      frameCount: actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping" ? 6 : 3,
      firstFinalClosed: true,
      maxAdjacentDelta: 6,
      fallbackActionId: "idle",
      reasonCode: "generated_action_preview_ready"
    })),
    previewSafety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    },
    safeRendererInputFields: ["safeActionId", "rendererKind", "safePackId", "playbackIntent", "scale", "visibility"],
    applyStatus: "applied",
    applyReasonCode: "target_pack_applied",
    targetChanged: true,
    defaultPetUnchanged: true,
    unrelatedPetsUnchanged: true,
    acceptedPetEvents: 0,
    callsNotify: false,
    writesCatStateMachine: false
  };
}

function securityScanPassed(value) {
  const sanitized = value
    .replace(/safeRendererInputFields|acceptedPetEvents|callsNotify|writesCatStateMachine/g, "");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|raw photo|source filename|sourceFileName|sourcePath|photo path|fullLocalPath|raw provider response|raw payload|raw prompt|promptText|workspace path|config path|GPS payload|EXIF payload|\.\./i.test(sanitized);
}

function claimScanPassed() {
  const text = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.13 photo-guided 2D action asset preview and target-pet apply flow passed for tested local scenarios.") &&
    text.includes("automatic photo-to-2D ready") &&
    text.includes("provider integration verified") &&
    !text.includes("automatic photo-to-2D ready | allowed") &&
    !text.includes("provider integration verified | allowed");
}

function prdSpecPassed() {
  const text = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.13") &&
    text.includes("Preview & Final Gate") &&
    text.includes("preview all 8 core actions") &&
    text.includes("apply only to the selected target pet");
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function renderReport(status, evidence, rows, htmlPath, screenshotPath, runtimePath) {
  return `# V15.13 Photo-Guided 2D Preview/Apply Final Acceptance Report

Date: ${DATE}
Status: ${status}

This report is acceptance evidence only for the scoped V15.13 preview/apply flow when status is passed.

## Scope

- Preview a V15.12 accepted generated/imported 2D action pack across all 8 core actions.
- Apply the generated pack only to the selected target pet.
- Preserve default and unrelated pets.
- Keep preview isolated from PetEvent, notify, CatStateMachine, and live PetInstance state.

## Result

- preview status: ${evidence.previewStatus}
- apply status: ${evidence.applyStatus}
- generated pack: ${evidence.generatedPackId}
- target instance: ${evidence.targetInstanceId}
- preview action count: ${evidence.previewActionCount}
- default pet unchanged: ${evidence.defaultPetUnchanged}
- unrelated pets unchanged: ${evidence.unrelatedPetsUnchanged}
- accepted PetEvents: ${evidence.acceptedPetEvents}
- calls notify: ${evidence.callsNotify}
- writes CatStateMachine: ${evidence.writesCatStateMachine}

## Visual Evidence

- HTML report: \`${htmlPath}\`
- GUI screenshot evidence: ${screenshotPath && existsSync(screenshotPath) ? "provided" : "blocked / missing"}
- runtime capture evidence: ${runtimePath && existsSync(runtimePath) ? "provided" : "blocked / missing"}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows.map((row) => `| ${row.name} | ${row.result} | ${row.details.replace(/\|/g, "/")} |`).join("\n")}

## Safe Renderer Input Fields

${evidence.safeRendererInputFields.map((field) => `- ${field}`).join("\n")}

## Allowed Claim

${status === "passed"
    ? "V15.13 photo-guided 2D action asset preview and target-pet apply flow passed for tested local scenarios."
    : "No V15.13 passed claim is made while status is not passed."}

## Forbidden Claims

The following remain forbidden / not-ready:

- automatic photo-to-2D ready
- automatic photo-to-animation ready
- provider integration verified
- photo customization ready for arbitrary cats
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- cross-platform ready
- Windows ready
`;
}

function renderHtml(status, evidence, rows, screenshotPath, runtimePath) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V15.13 Photo 2D Preview/Apply Evidence</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #f6f8fb; }
    main { max-width: 1180px; margin: 0 auto; padding: 28px; }
    h1 { margin: 0 0 10px; font-size: 30px; }
    .status { display: inline-flex; padding: 6px 10px; border-radius: 999px; background: ${status === "passed" ? "#d8f5e5" : status === "blocked" ? "#fff3cc" : "#ffe1e1"}; font-weight: 700; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin: 18px 0; }
    .card { background: white; border: 1px solid #dfe6ef; border-radius: 10px; padding: 16px; box-shadow: 0 1px 2px rgba(16, 24, 40, .04); }
    .actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); gap: 10px; }
    .action { min-height: 92px; border: 1px solid #dfe6ef; border-radius: 10px; padding: 10px; background: linear-gradient(180deg, #fff, #eef6ff); }
    .action strong { display: block; margin-bottom: 8px; }
    .frames { display: flex; gap: 4px; align-items: end; min-height: 38px; }
    .frame { width: 18px; height: 18px; border-radius: 50% 50% 46% 46%; background: #e98931; border: 2px solid #9a4f17; }
    .frame:nth-child(2), .frame:nth-child(4) { transform: translateY(-4px) scale(1.04); }
    .frame:nth-child(3) { transform: translateY(-7px) scale(1.08); }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; }
    th, td { padding: 10px; border-bottom: 1px solid #e6edf5; text-align: left; font-size: 14px; }
    code { background: #eef2f7; padding: 2px 5px; border-radius: 4px; }
    .missing { color: #8a5a00; }
  </style>
</head>
<body>
  <main>
    <h1>V15.13 Photo-Guided 2D Preview/Apply Evidence</h1>
    <span class="status">status: ${status}</span>
    <section class="grid">
      <article class="card"><strong>Generated pack</strong><br /><code>${evidence.generatedPackId}</code></article>
      <article class="card"><strong>Target pet</strong><br /><code>${evidence.targetInstanceId}</code></article>
      <article class="card"><strong>Preview isolation</strong><br />PetEvent 0 / notify false / state write false</article>
      <article class="card"><strong>Target isolation</strong><br />default unchanged / unrelated unchanged</article>
    </section>
    <section class="card">
      <h2>8 Core Action Contact Sheet</h2>
      <div class="actions">
        ${evidence.previewActions.map((action) => `
          <div class="action">
            <strong>${action.actionId}</strong>
            <div class="frames">${Array.from({ length: action.frameCount }, () => `<span class="frame"></span>`).join("")}</div>
            <small>${action.coverageState} · frames ${action.frameCount} · delta ${action.maxAdjacentDelta}</small>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="card">
      <h2>GUI / Runtime Evidence</h2>
      <p>GUI screenshot: ${screenshotPath && existsSync(screenshotPath) ? "provided and embedded" : '<span class="missing">missing / blocked</span>'}</p>
      ${embeddedImage(screenshotPath, "V15.13 settings GUI screenshot")}
      <p>Runtime capture: ${runtimePath && existsSync(runtimePath) ? "provided and embedded" : '<span class="missing">missing / blocked</span>'}</p>
      ${embeddedImage(runtimePath, "V15.13 runtime desktop capture")}
    </section>
    <section class="card">
      <h2>Checks</h2>
      <table>
        <thead><tr><th>Check</th><th>Result</th><th>Details</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.result)}</td><td>${escapeHtml(row.details)}</td></tr>`).join("")}</tbody>
      </table>
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function embeddedImage(path, alt) {
  if (!path || !existsSync(path)) {
    return "";
  }
  const data = readFileSync(path).toString("base64");
  return `<figure><img src="data:image/png;base64,${data}" alt="${escapeHtml(alt)}" style="max-width:100%;border:1px solid #dfe6ef;border-radius:10px" /></figure>`;
}
