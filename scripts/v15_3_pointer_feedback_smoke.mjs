#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const evidencePath = `docs/V15.x/evidence/v15_3-pointer-feedback-smoke-${DATE}.md`;
const capturePath = `docs/V15.x/evidence/v15_3-pointer-feedback-capture-${DATE}.html`;
const records = [];

record("V15.0 prerequisite", evidencePassed("docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md"), "scope freeze evidence passed");
record("V15.1 prerequisite", evidencePassed("docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md"), "interaction model evidence passed");
record("V15.2 prerequisite", evidencePassed("docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md"), "drag physics evidence passed");

const checkResult = spawnSync("pnpm", ["--filter", "desktop", "check"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop check", checkResult.status === 0, checkResult.status === 0 ? "exit=0" : `exit=${checkResult.status ?? "unknown"}`);

const testResult = spawnSync("pnpm", ["--filter", "desktop", "test"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop test", testResult.status === 0, testResult.status === 0 ? "exit=0" : `exit=${testResult.status ?? "unknown"}`);

const simulation = runPointerSimulation();
record("pointer-near visual response", simulation.pointerNearPassed, simulation.pointerNearSummary);
record("hover visual response", simulation.hoverPassed, simulation.hoverSummary);
record("click visual response", simulation.clickPassed, simulation.clickSummary);
record("double-click priority", simulation.doubleClickPassed, simulation.doubleClickSummary);
record("urgent state blocking", simulation.urgentBlockingPassed, simulation.urgentBlockingSummary);
record("drag blocking", simulation.dragBlockingPassed, simulation.dragBlockingSummary);
record("zero PetEvent", simulation.zeroPetEvent, "all pointer/click snapshots report emitsPetEvent=false");
record("zero CatStateMachine write", simulation.zeroCatStateMachineWrite, "all pointer/click snapshots report writesCatStateMachine=false");
record("safe renderer input", simulation.safeRendererInputPassed, simulation.safeRendererInputSummary);
record("desktop event wiring", desktopEventWiringPassed(), "pointerenter/leave, hover dwell, click debounce, and dblclick cancellation are installed");
record("visual capture generated", writeCaptureHtml(), capturePath);
record("security scan", securityScanPassed(), "no token/auth/raw pointer trace/path-like leakage in V15.3 docs/code/evidence inputs");
record("claim scan", claimScanPassed(), "V15.3 scoped claim exists; V15.7 remains gated");
record("PRD/spec review", prdSpecPassed(), "V15.3 implementation matches pointer feedback spec and implementation contract");

writeEvidence();

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runPointerSimulation() {
  const code = `
    import {
      RuntimeMicroInteractionController,
      snapshotToSafeRendererInput
    } from "./apps/desktop/src/runtime-micro-interactions.ts";

    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      pointerNearDurationMs: 800,
      pointerHoverDurationMs: 1100,
      clickDurationMs: 650,
      doubleClickDurationMs: 900
    });
    controller.setBaseState("idle");

    const pointerNear = controller.startPointerNear();
    const pointerNearInput = snapshotToSafeRendererInput(pointerNear);
    const hover = controller.startPointerHover();
    const hoverInput = snapshotToSafeRendererInput(hover);

    const clickController = new RuntimeMicroInteractionController({ now: () => now, clickDurationMs: 650 });
    clickController.setBaseState("idle");
    const click = clickController.startClick();
    const clickInput = snapshotToSafeRendererInput(click);

    const doubleController = new RuntimeMicroInteractionController({ now: () => now, clickDurationMs: 650, doubleClickDurationMs: 900 });
    doubleController.setBaseState("idle");
    const firstClick = doubleController.startClick();
    const doubleClick = doubleController.startDoubleClick();
    const doubleInput = snapshotToSafeRendererInput(doubleClick);

    const errorController = new RuntimeMicroInteractionController({ now: () => now });
    errorController.setBaseState("error");
    const errorNear = errorController.startPointerNear();
    const errorClick = errorController.startClick();
    const errorDouble = errorController.startDoubleClick();

    const needInputController = new RuntimeMicroInteractionController({ now: () => now });
    needInputController.setBaseState("need_input");
    const needInputNear = needInputController.startPointerNear();

    const dragController = new RuntimeMicroInteractionController({ now: () => now });
    dragController.setBaseState("idle");
    dragController.startDragStart();
    const dragBlocksNear = dragController.startPointerNear();
    const dragBlocksClick = dragController.startClick();
    const dragBlocksDouble = dragController.startDoubleClick();

    const snapshots = [
      pointerNear,
      hover,
      click,
      firstClick,
      doubleClick,
      errorNear,
      errorClick,
      errorDouble,
      needInputNear,
      dragBlocksNear,
      dragBlocksClick,
      dragBlocksDouble
    ];
    const inputs = [pointerNearInput, hoverInput, clickInput, doubleInput];

    console.log(JSON.stringify({
      pointerNearPassed: pointerNear.microInteraction === "pointer_near" &&
        pointerNear.reasonCode === "pointer_near_active" &&
        pointerNearInput.actionId === "pointer_look",
      pointerNearSummary: pointerNear.reasonCode + " -> " + pointerNearInput.actionId,
      hoverPassed: hover.microInteraction === "pointer_hover" &&
        hover.reasonCode === "pointer_hover_active" &&
        hoverInput.actionId === "pointer_ear_twitch",
      hoverSummary: hover.reasonCode + " -> " + hoverInput.actionId,
      clickPassed: click.microInteraction === "click" &&
        click.reasonCode === "click_active" &&
        clickInput.actionId === "click_paw" &&
        clickInput.playbackIntent.priority === "transient",
      clickSummary: click.reasonCode + " -> " + clickInput.actionId + " / " + clickInput.playbackIntent.priority,
      doubleClickPassed: firstClick.microInteraction === "click" &&
        doubleClick.microInteraction === "double_click" &&
        doubleClick.reasonCode === "double_click_active" &&
        doubleInput.actionId === "double_click_jump" &&
        doubleInput.playbackIntent.priority === "transient",
      doubleClickSummary: firstClick.reasonCode + " -> " + doubleClick.reasonCode + " -> " + doubleInput.actionId,
      urgentBlockingPassed: [errorNear, errorClick, errorDouble, needInputNear].every((item) => item.reasonCode === "priority_state_blocks_pointer") &&
        errorNear.displayState === "error" &&
        needInputNear.displayState === "need_input",
      urgentBlockingSummary: [errorNear.reasonCode, errorClick.reasonCode, errorDouble.reasonCode, needInputNear.reasonCode].join(" / "),
      dragBlockingPassed: [dragBlocksNear, dragBlocksClick, dragBlocksDouble].every((item) => item.microInteraction === "drag_start"),
      dragBlockingSummary: [dragBlocksNear.microInteraction, dragBlocksClick.microInteraction, dragBlocksDouble.microInteraction].join(" / "),
      zeroPetEvent: snapshots.every((item) => item.emitsPetEvent === false),
      zeroCatStateMachineWrite: snapshots.every((item) => item.writesCatStateMachine === false),
      safeRendererInputPassed: inputs.every((item) => JSON.stringify(Object.keys(item).sort()) === JSON.stringify([
        "actionId",
        "packId",
        "playbackIntent",
        "rendererKind",
        "scale",
        "visibility"
      ])) && !new RegExp("raw|payload|prompt|command|token|Authorization|workspace|config|/Users/", "i").test(JSON.stringify(inputs)),
      safeRendererInputSummary: JSON.stringify(inputs)
    }));
  `;
  const output = execFileSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/loader.mjs", "--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(output);
}

function desktopEventWiringPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  const css = readSafe("apps/desktop/src/styles.css");
  return main.includes('interactiveStage?.addEventListener("pointerenter"') &&
    main.includes('interactiveStage?.addEventListener("pointerleave"') &&
    main.includes("startPointerHover()") &&
    main.includes('interactiveStage?.addEventListener("click"') &&
    main.includes('interactiveStage?.addEventListener("dblclick"') &&
    main.includes("window.clearTimeout(pendingClickTimer)") &&
    main.includes("pendingClickTimer = undefined") &&
    css.includes("work-cat-micro-pointer-near") &&
    css.includes("work-cat-micro-pointer-hover") &&
    css.includes("work-cat-micro-click") &&
    css.includes("work-cat-micro-double-click");
}

function writeCaptureHtml() {
  mkdirSync(dirname(capturePath), { recursive: true });
  const phaseCards = [
    ["Pointer near", "pointer_look", "pet turns attention toward nearby pointer"],
    ["Hover dwell", "pointer_ear_twitch", "subtle ear/tail attention after dwell"],
    ["Click", "click_paw", "short single-click paw feedback"],
    ["Double click", "double_click_jump", "stronger double-click reaction, not two click loops"],
    ["Urgent block", "error / need_input", "urgent states keep priority and block pointer override"]
  ].map(([label, action, description]) => `
    <article class="phase-card" data-action="${action}">
      <div class="pet-figure"><span class="ears">▲ ▲</span><span class="face">●ω●</span><span class="body"></span></div>
      <h2>${label}</h2>
      <p><code>${action}</code></p>
      <small>${description}</small>
    </article>
  `).join("");

  writeFileSync(capturePath, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V15.3 Pointer Feedback Capture</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #172033; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px; }
    h1 { margin: 0 0 8px; font-size: 30px; }
    .summary { margin: 0 0 24px; color: #475569; }
    .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; }
    .phase-card { border: 1px solid #dbe3ef; border-radius: 12px; background: #fff; min-height: 230px; padding: 16px; display: grid; place-items: center; text-align: center; }
    .phase-card h2 { margin: 10px 0 4px; font-size: 18px; }
    .phase-card p { margin: 0; color: #2563eb; }
    .phase-card small { color: #64748b; line-height: 1.4; }
    .pet-figure { width: 112px; height: 112px; border-radius: 34px; background: linear-gradient(160deg, #fed7aa, #fb923c); display: grid; place-items: center; color: #111827; box-shadow: 0 18px 30px rgba(251, 146, 60, 0.22); transform-origin: 50% 92%; }
    .ears { font-size: 14px; transform: translateY(-10px); }
    .face { font-size: 24px; }
    .body { width: 54px; height: 16px; border-radius: 999px; background: rgba(255,255,255,0.42); }
    [data-action="pointer_look"] .pet-figure { animation: near 0.8s ease-in-out infinite; }
    [data-action="pointer_ear_twitch"] .pet-figure { animation: hover 1.1s ease-in-out infinite; }
    [data-action="click_paw"] .pet-figure { animation: click 0.65s ease-out infinite; }
    [data-action="double_click_jump"] .pet-figure { animation: double 0.9s ease-in-out infinite; }
    [data-action="error / need_input"] .pet-figure { background: linear-gradient(160deg, #fecaca, #ef4444); animation: urgent 1s ease-in-out infinite; }
    @keyframes near { 0%,100% { transform: translateY(0) scale(1); } 45% { transform: translateY(-4px) scale(1.03); } }
    @keyframes hover { 0%,100% { transform: translateY(0) rotate(0deg); } 24% { transform: translateY(-2px) rotate(-1.5deg); } 52% { transform: translateY(-3px) rotate(1.5deg); } }
    @keyframes click { 0%,100% { transform: translateY(0) scale(1); } 45% { transform: translateY(-8px) scale(1.08); } }
    @keyframes double { 0%,100% { transform: translateY(0) rotate(0deg); } 30% { transform: translateY(-10px) rotate(-5deg); } 65% { transform: translateY(-5px) rotate(6deg); } }
    @keyframes urgent { 0%,100% { transform: scale(1); filter: saturate(1); } 50% { transform: scale(1.03); filter: saturate(1.2); } }
    .checks { margin-top: 24px; display: grid; gap: 8px; }
    .checks li { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; }
  </style>
</head>
<body>
  <main>
    <h1>V15.3 Pointer Feedback Capture</h1>
    <p class="summary">Deterministic local capture for pointer-near, hover, click, double-click, and urgent-state blocking. This is evidence for V15.3 only and does not claim final V15 passed.</p>
    <section class="grid">${phaseCards}</section>
    <ul class="checks">
      <li>Double-click cancels pending single-click playback before triggering the stronger double-click action.</li>
      <li>Pointer/click feedback emits zero PetEvent and writes zero CatStateMachine updates.</li>
      <li>Renderer input snapshot contains only safe action, renderer, pack, playback, scale, and visibility fields.</li>
    </ul>
  </main>
</body>
</html>`, "utf8");
  return existsSync(capturePath) && securityScanText(readSafe(capturePath));
}

function securityScanPassed() {
  const combined = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_3-pointer-feedback-spec.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "apps/desktop/src/runtime-micro-interactions.ts",
    "apps/desktop/src/runtime-micro-interactions.test.ts",
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
  return docs.includes("V15 pointer-aware hover/click/double-click feedback passed for tested local desktop scenarios.") &&
    docs.includes("V15.7") &&
    docs.includes("Petdex parity achieved") &&
    !docs.includes("Petdex parity achieved | allowed") &&
    !docs.includes("3D ready | allowed") &&
    !docs.includes("production signed release ready | allowed");
}

function prdSpecPassed() {
  const prd = readSafe("docs/active/agent_desktop_pet_prd_v15.md");
  const spec = readSafe("docs/V15.x/v15_3-pointer-feedback-spec.md");
  const contract = readSafe("docs/V15.x/v15_x-implementation-contract.md");
  return prd.includes("pointer/click/double-click") &&
    spec.includes("pointer_ear_twitch") &&
    spec.includes("double_click") &&
    spec.includes("zero accepted PetEvent") &&
    contract.includes("V15.3");
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

function writeEvidence() {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const status = records.every((item) => item.ok) ? "passed" : "failed";
  const rows = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V15.3 Pointer Feedback Smoke Evidence

status: ${status}
date: ${DATE}
scope: V15.3 pointer-near, hover, click, and double-click feedback for tested local desktop scenarios.

## Results

| Gate | Result | Notes |
| --- | --- | --- |
${rows}

## Evidence Notes

- Pointer-near maps to safe action \`pointer_look\`.
- Hover maps to safe action \`pointer_ear_twitch\`.
- Click maps to safe transient action \`click_paw\`.
- Double-click maps to safe transient action \`double_click_jump\` and is higher priority than click.
- Error and need_input block lower-priority pointer/click feedback.
- Drag blocks pointer/click feedback.
- The deterministic visual capture is \`${capturePath}\`.

## Safe Renderer Input Fields

\`\`\`text
actionId
rendererKind
packId
playbackIntent
scale
visibility
\`\`\`

## Security Boundary

No token, Authorization header, raw pointer trace, screen text, clipboard contents, prompt text, tool command text, workspace path, config path, or full local path is recorded in this evidence.

## Allowed Claim

V15 pointer-aware hover/click/double-click feedback passed for tested local desktop scenarios.

## Forbidden Claims

This evidence does not claim Petdex parity, production release readiness, Windows readiness, cross-platform readiness, 3D readiness, provider integration, OS-level Codex window binding, or all Codex workflows verified.
`, "utf8");
}
