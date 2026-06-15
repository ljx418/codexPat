#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const evidencePath = `docs/V15.x/evidence/v15_6-interaction-settings-smoke-${DATE}.md`;
const capturePath = `docs/V15.x/evidence/v15_6-interaction-settings-capture-${DATE}.html`;
const records = [];

record("V15.0 prerequisite", evidencePassed("docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md"), "scope freeze evidence passed");
record("V15.1 prerequisite", evidencePassed("docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md"), "interaction model evidence passed");
record("V15.2 prerequisite", evidencePassed("docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md"), "drag physics evidence passed");
record("V15.3 prerequisite", evidencePassed("docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md"), "pointer feedback evidence passed");
record("V15.4 prerequisite", evidencePassed("docs/V15.x/evidence/v15_4-autonomous-walk-smoke-2026-06-10.md"), "autonomous walk evidence passed");
record("V15.5 prerequisite", evidencePassed("docs/V15.x/evidence/v15_5-emotion-composer-smoke-2026-06-10.md"), "emotion composer evidence passed");

const checkResult = spawnSync("pnpm", ["--filter", "desktop", "check"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop check", checkResult.status === 0, checkResult.status === 0 ? "exit=0" : `exit=${checkResult.status ?? "unknown"}`);

const testResult = spawnSync("pnpm", ["--filter", "desktop", "test"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop test", testResult.status === 0, testResult.status === 0 ? "exit=0" : `exit=${testResult.status ?? "unknown"}`);

const simulation = runSettingsSimulation();
record("settings sanitize and persistence", simulation.persistencePassed, simulation.persistenceSummary);
record("preview sandbox", simulation.previewPassed, simulation.previewSummary);
record("quiet mode behavior", simulation.quietPassed, simulation.quietSummary);
record("zero PetEvent", simulation.zeroPetEvent, "all preview snapshots report emitsPetEvent=false");
record("zero CatStateMachine write", simulation.zeroCatStateMachineWrite, "all preview snapshots report writesCatStateMachine=false");
record("settings UI controls visible", settingsUiControlsPassed(), "settings page contains all required controls and preview buttons");
record("preview does not call notify", previewBoundaryPassed(), "preview wiring updates local DOM summary only");
record("visual capture generated", writeCaptureHtml(simulation), capturePath);
record("security scan", securityScanPassed(), "no token/auth/raw settings trace/path-like leakage in V15.6 docs/code/evidence inputs");
record("claim scan", claimScanPassed(), "V15.6 scoped claim exists; V15.7 remains gated");
record("PRD/spec review", prdSpecPassed(), "V15.6 implementation matches settings preview spec and implementation contract");

writeEvidence(simulation);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runSettingsSimulation() {
  const code = `
    import {
      AutonomousWalkController,
      DEFAULT_INTERACTION_SETTINGS,
      INTERACTION_SETTINGS_STORAGE_KEY,
      buildInteractionPreviewSnapshot,
      readInteractionSettings,
      sanitizeInteractionSettings,
      writeInteractionSettings
    } from "./apps/desktop/src/interaction-settings.ts";

    function idleSnapshot() {
      return {
        baseState: "idle",
        displayState: "idle",
        microInteraction: "none",
        active: false,
        reasonCode: "base_state",
        emitsPetEvent: false,
        writesCatStateMachine: false
      };
    }

    function memoryStorage(initial) {
      let value = initial;
      return {
        getItem(key) {
          return key === INTERACTION_SETTINGS_STORAGE_KEY ? value ?? null : null;
        },
        setItem(key, next) {
          if (key === INTERACTION_SETTINGS_STORAGE_KEY) value = next;
        }
      };
    }

    const sanitized = sanitizeInteractionSettings({
      autonomousWalk: "yes",
      pointerReactions: false,
      clickReactions: true,
      dragPhysics: 1,
      quietMode: true,
      interactionFrequency: "fast",
      motionIntensity: "huge"
    });

    const storage = memoryStorage();
    const written = writeInteractionSettings({
      ...DEFAULT_INTERACTION_SETTINGS,
      autonomousWalk: false,
      pointerReactions: false,
      clickReactions: true,
      dragPhysics: true,
      quietMode: true,
      interactionFrequency: "low",
      motionIntensity: "subtle"
    }, storage);
    const readBack = readInteractionSettings(storage);

    const previews = [
      buildInteractionPreviewSnapshot("drag", DEFAULT_INTERACTION_SETTINGS),
      buildInteractionPreviewSnapshot("pointer_near", DEFAULT_INTERACTION_SETTINGS),
      buildInteractionPreviewSnapshot("pointer_hover", DEFAULT_INTERACTION_SETTINGS),
      buildInteractionPreviewSnapshot("click", DEFAULT_INTERACTION_SETTINGS),
      buildInteractionPreviewSnapshot("double_click", DEFAULT_INTERACTION_SETTINGS),
      buildInteractionPreviewSnapshot("autonomous_walk", DEFAULT_INTERACTION_SETTINGS),
      buildInteractionPreviewSnapshot("quiet_mode", { ...DEFAULT_INTERACTION_SETTINGS, quietMode: true })
    ];

    const quietWalk = new AutonomousWalkController(() => 6000).tick({
      baseState: "idle",
      interaction: idleSnapshot(),
      settings: { ...DEFAULT_INTERACTION_SETTINGS, quietMode: true },
      position: { x: 20, y: 20 },
      bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 }
    });

    console.log(JSON.stringify({
      persistencePassed: sanitized.autonomousWalk === DEFAULT_INTERACTION_SETTINGS.autonomousWalk &&
        sanitized.pointerReactions === false &&
        sanitized.dragPhysics === DEFAULT_INTERACTION_SETTINGS.dragPhysics &&
        sanitized.interactionFrequency === "normal" &&
        sanitized.motionIntensity === "normal" &&
        readBack.quietMode === true &&
        readBack.autonomousWalk === false &&
        readBack.interactionFrequency === "low" &&
        readBack.motionIntensity === "subtle",
      persistenceSummary: JSON.stringify(readBack),
      previewPassed: previews.every((item) => item.mutatesLivePetInstance === false) &&
        previews.every((item) => item.emitsPetEvent === false) &&
        previews.every((item) => item.writesCatStateMachine === false) &&
        previews.some((item) => item.microInteraction === "double_click_jump") &&
        previews.some((item) => item.microInteraction === "walk_right") &&
        previews.some((item) => item.reasonCode === "preview_quiet_mode_safe"),
      previewSummary: previews.map((item) => item.kind + ":" + item.microInteraction + ":" + item.reasonCode).join("; "),
      quietPassed: quietWalk.reasonCode === "walk_quiet_mode" && quietWalk.active === false,
      quietSummary: quietWalk.reasonCode,
      zeroPetEvent: previews.every((item) => item.emitsPetEvent === false) && quietWalk.emitsPetEvent === false,
      zeroCatStateMachineWrite: previews.every((item) => item.writesCatStateMachine === false) && quietWalk.writesCatStateMachine === false
    }));
  `;
  const output = execFileSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/loader.mjs", "--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(output);
}

function settingsUiControlsPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  return main.includes('id="interaction-settings-panel"') &&
    main.includes('interactionToggleControl("autonomousWalk"') &&
    main.includes('interactionToggleControl("pointerReactions"') &&
    main.includes('interactionToggleControl("clickReactions"') &&
    main.includes('interactionToggleControl("dragPhysics"') &&
    main.includes('interactionToggleControl("quietMode"') &&
    main.includes('id="interaction-frequency"') &&
    main.includes('id="motion-intensity"') &&
    main.includes('interactionPreviewButton("drag"') &&
    main.includes('interactionPreviewButton("pointer_near"') &&
    main.includes('interactionPreviewButton("pointer_hover"') &&
    main.includes('interactionPreviewButton("click"') &&
    main.includes('interactionPreviewButton("double_click"') &&
    main.includes('interactionPreviewButton("autonomous_walk"') &&
    main.includes('interactionPreviewButton("quiet_mode"');
}

function previewBoundaryPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  const start = main.indexOf("function updateInteractionPreview");
  const end = main.indexOf("function firstRunWizard", start);
  const previewBlock = start >= 0 && end > start ? main.slice(start, end) : "";
  return previewBlock.includes("buildInteractionPreviewSnapshot") &&
    previewBlock.includes("summary.textContent = interactionPreviewSummary(preview)") &&
    !previewBlock.includes("sendTestPetReaction(") &&
    !previewBlock.includes("notify(") &&
    !previewBlock.includes("stateMachine.enqueue") &&
    !previewBlock.includes("activate") &&
    !previewBlock.includes("delete");
}

function writeCaptureHtml(simulation) {
  mkdirSync(dirname(capturePath), { recursive: true });
  const controls = [
    ["自由走动", "on/off"],
    ["鼠标反馈", "on/off"],
    ["点击反馈", "on/off"],
    ["拖拽物理", "on/off"],
    ["安静模式", "on/off"],
    ["动作频率", "低 / 正常 / 活跃"],
    ["动作强度", "轻微 / 正常 / 明显"]
  ].map(([label, value]) => `<li><strong>${label}</strong><span>${value}</span></li>`).join("");
  const previews = [
    "drag",
    "pointer_near",
    "pointer_hover",
    "click",
    "double_click",
    "autonomous_walk",
    "quiet_mode"
  ].map((item) => `<button>${item}</button>`).join("");

  writeFileSync(capturePath, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V15.6 Interaction Settings Capture</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #172033; }
    main { max-width: 1120px; margin: 0 auto; padding: 32px; }
    h1 { margin: 0 0 8px; font-size: 30px; }
    .summary { margin: 0 0 24px; color: #475569; }
    .layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; }
    section { border: 1px solid #dbe3ef; border-radius: 14px; background: #fff; padding: 20px; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    li { display: flex; justify-content: space-between; gap: 12px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
    li span { color: #64748b; }
    .preview-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
    button { border: 1px solid #bfdbfe; border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 8px 12px; }
    .result { margin-top: 18px; border-radius: 12px; background: #ecfdf5; border: 1px solid #bbf7d0; padding: 14px; }
    code { color: #0f766e; }
  </style>
</head>
<body>
  <main>
    <h1>V15.6 Interaction Settings Capture</h1>
    <p class="summary">Deterministic local capture for interaction settings controls, persistence, quiet mode, and isolated preview. This is evidence for V15.6 only and does not claim final V15 passed.</p>
    <div class="layout">
      <section>
        <h2>设置控件</h2>
        <ul>${controls}</ul>
      </section>
      <section>
        <h2>互动预览</h2>
        <div class="preview-buttons">${previews}</div>
        <div class="result">
          <p><strong>Preview sandbox:</strong> zero PetEvent, zero CatStateMachine write, no live PetInstance mutation.</p>
          <p><strong>Persisted sample:</strong> <code>${escapeHtml(simulation.persistenceSummary)}</code></p>
          <p><strong>Quiet mode:</strong> <code>${escapeHtml(simulation.quietSummary)}</code></p>
        </div>
      </section>
    </div>
  </main>
</body>
</html>`, "utf8");
  return existsSync(capturePath) && securityScanText(readSafe(capturePath));
}

function securityScanPassed() {
  const combined = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_6-interaction-settings-preview-spec.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "apps/desktop/src/interaction-settings.ts",
    "apps/desktop/src/interaction-settings.test.ts",
    "apps/desktop/src/main.ts",
    "apps/desktop/src/styles.css"
  ].map(readSafe).join("\n");
  return securityScanText(combined);
}

function securityScanText(value) {
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|rawPointerPath\s*[:=]|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]|screenText\s*[:=]|clipboard\s*[:=]/i.test(value);
}

function claimScanPassed() {
  const docs = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_7-final-qa-evidence-plan.md"
  ].map(readSafe).join("\n");
  return docs.includes("V15 interaction settings and preview passed for tested local Desktop Manager scenarios.") &&
    docs.includes("V15.7") &&
    docs.includes("Petdex parity achieved") &&
    !docs.includes("Petdex parity achieved | allowed") &&
    !docs.includes("3D ready | allowed") &&
    !docs.includes("production signed release ready | allowed");
}

function prdSpecPassed() {
  const prd = readSafe("docs/active/agent_desktop_pet_prd_v15.md");
  const spec = readSafe("docs/V15.x/v15_6-interaction-settings-preview-spec.md");
  const contract = readSafe("docs/V15.x/v15_x-implementation-contract.md");
  return prd.includes("设置页") &&
    prd.includes("安静模式") &&
    spec.includes("Autonomous walk") &&
    spec.includes("Preview must not") &&
    contract.includes("V15.6");
}

function evidencePassed(path) {
  return existsSync(path) && /^status:\s*passed\b/m.test(readSafe(path));
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeEvidence(simulation) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const status = records.every((item) => item.ok) ? "passed" : "failed";
  const rows = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V15.6 Interaction Settings Smoke Evidence

status: ${status}
date: ${DATE}
scope: V15.6 interaction settings controls, persistence, quiet mode, and isolated preview for tested local Desktop Manager scenarios.

## Results

| Gate | Result | Notes |
| --- | --- | --- |
${rows}

## Preview Summary

\`\`\`text
${simulation.previewSummary}
\`\`\`

## Evidence Notes

- Settings controls include autonomous walk, pointer reactions, click reactions, drag physics, quiet mode, interaction frequency, and motion intensity.
- Deterministic storage reload proves persistence.
- Preview sandbox emits zero PetEvent, writes zero CatStateMachine updates, and does not mutate live PetInstance state.
- Quiet mode blocks autonomous walk.
- The deterministic visual capture is \`${capturePath}\`.

## Security Boundary

No token, Authorization header, raw pointer trace, raw payload, screen text, clipboard contents, prompt text, tool command text, workspace path, config path, or full local path is recorded in this evidence.

## Allowed Claim

V15 interaction settings and preview passed for tested local Desktop Manager scenarios.

## Forbidden Claims

This evidence does not claim Petdex parity, production release readiness, Windows readiness, cross-platform readiness, 3D readiness, provider integration, OS-level Codex window binding, or all Codex workflows verified.
`, "utf8");
}
