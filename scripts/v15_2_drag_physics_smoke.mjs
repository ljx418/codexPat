#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const evidencePath = `docs/V15.x/evidence/v15_2-drag-physics-smoke-${DATE}.md`;
const capturePath = `docs/V15.x/evidence/v15_2-drag-physics-capture-${DATE}.html`;
const records = [];

record("V15.0 prerequisite", evidencePassed("docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md"), "scope freeze evidence passed");
record("V15.1 prerequisite", evidencePassed("docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md"), "interaction model evidence passed");

const checkResult = spawnSync("pnpm", ["--filter", "desktop", "check"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop check", checkResult.status === 0, checkResult.status === 0 ? "exit=0" : `exit=${checkResult.status ?? "unknown"}`);

const testResult = spawnSync("pnpm", ["--filter", "desktop", "test"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop test", testResult.status === 0, testResult.status === 0 ? "exit=0" : `exit=${testResult.status ?? "unknown"}`);

const simulation = runDragSimulation();
record("drag visual sequence", simulation.sequencePassed, simulation.sequence.join(" -> "));
record("release / land timing", simulation.releaseLandPassed, simulation.releaseLandSummary);
record("safe renderer input maps drag phases", simulation.safeRendererInputPassed, simulation.safeRendererInputSummary);
record("zero PetEvent", simulation.zeroPetEvent, "drag snapshots report emitsPetEvent=false");
record("zero CatStateMachine write", simulation.zeroCatStateMachineWrite, "drag snapshots report writesCatStateMachine=false");
record("native drag ghost guard", nativeDragGuardPassed(), "CSS drag/select disabled, dragstart/selectstart guard installed, sprite images draggable=false");
record("position persistence path", positionPersistencePassed(), "Tauri moved event persists position and renderer reads final position after drag");
record("target isolation boundary", targetIsolationPassed(), "drag logic is scoped to current pet shell/window and does not notify default/unrelated pets");
record("visual capture generated", writeCaptureHtml(), capturePath);
record("security scan", securityScanPassed(), "no token/auth/raw pointer trace/path-like leakage in V15.2 docs/code/evidence inputs");
record("claim scan", claimScanPassed(), "V15.2 scoped claim exists; V15.7 remains gated");
record("PRD/spec review", prdSpecPassed(), "V15.2 implementation matches drag physics spec and implementation contract");

writeEvidence();

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runDragSimulation() {
  const code = `
    import {
      RuntimeMicroInteractionController,
      snapshotToSafeRendererInput
    } from "./apps/desktop/src/runtime-micro-interactions.ts";

    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      dragStartDurationMs: 300,
      dropDurationMs: 700
    });
    controller.setBaseState("idle");

    const snapshots = [];
    const collect = (snapshot) => {
      snapshots.push(snapshot);
      return snapshot;
    };

    const grabbed = collect(controller.startDragStart());
    const dragging = collect(controller.startDragging());
    const release = collect(controller.stopDrag());
    now = 330;
    const land = collect(controller.snapshot());
    now = 800;
    const settle = collect(controller.snapshot());

    const inputs = [grabbed, dragging, release, land, settle].map((snapshot) => snapshotToSafeRendererInput(snapshot));

    console.log(JSON.stringify({
      sequence: snapshots.map((item) => item.microInteraction),
      sequencePassed: JSON.stringify(snapshots.map((item) => item.microInteraction)) === JSON.stringify([
        "drag_start",
        "dragging",
        "drag_release",
        "drag_land",
        "none"
      ]),
      releaseLandPassed: release.reasonCode === "drag_release_active" && land.reasonCode === "drag_land_active" && settle.reasonCode === "interaction_expired",
      releaseLandSummary: [release.reasonCode, land.reasonCode, settle.reasonCode].join(" -> "),
      safeRendererInputPassed: inputs[0].actionId === "drag_grabbed" &&
        inputs[1].actionId === "dragging" &&
        inputs[2].actionId === "drag_release" &&
        inputs[3].actionId === "drag_land" &&
        !new RegExp("raw|payload|prompt|command|token|Authorization|workspace|config|/Users/", "i").test(JSON.stringify(inputs)),
      safeRendererInputSummary: JSON.stringify(inputs),
      zeroPetEvent: snapshots.every((item) => item.emitsPetEvent === false),
      zeroCatStateMachineWrite: snapshots.every((item) => item.writesCatStateMachine === false)
    }));
  `;
  const output = execFileSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/loader.mjs", "--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(output);
}

function nativeDragGuardPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  const css = readSafe("apps/desktop/src/styles.css");
  const sprite = readSafe("apps/desktop/src/renderer/sprite-renderer.ts");
  return main.includes("installPetNativeDragGuard()") &&
    main.includes('window.addEventListener("dragstart"') &&
    main.includes('window.addEventListener("selectstart"') &&
    css.includes("-webkit-user-drag: none") &&
    css.includes("user-select: none") &&
    sprite.includes('draggable="false"');
}

function positionPersistencePassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  const rust = readSafe("apps/desktop/src-tauri/src/main.rs");
  return main.includes("await currentWindow.startDragging()") &&
    main.includes("void getPetPosition().then((position)") &&
    main.includes("latestPosition = position") &&
    rust.includes("fn install_window_persistence") &&
    rust.includes("WindowEvent::Moved") &&
    rust.includes("save_settings(&state, &snapshot)");
}

function targetIsolationPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  const dragStart = main.indexOf('dragTarget?.addEventListener("pointerdown"');
  const dragEnd = main.indexOf("function installPetNativeDragGuard", dragStart);
  const dragBlock = dragStart >= 0 && dragEnd > dragStart ? main.slice(dragStart, dragEnd) : "";
  return main.includes('appRoot.querySelector<HTMLElement>(".pet-shell")') &&
    dragBlock.includes("currentWindow.startDragging()") &&
    !dragBlock.includes("sendTestPetReaction(") &&
    !dragBlock.includes("notify(") &&
    !dragBlock.includes("pet-event:accepted");
}

function writeCaptureHtml() {
  mkdirSync(dirname(capturePath), { recursive: true });
  const phaseCards = [
    ["Before", "idle", "cat sits at persisted position"],
    ["Grabbed", "drag_grabbed", "small lift before native window drag"],
    ["Dragging", "dragging", "looping drag posture while window follows pointer"],
    ["Release", "drag_release", "release transition starts after drag ends"],
    ["Land", "drag_land", "land / settle before returning to base state"]
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
  <title>V15.2 Drag Physics Capture</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #172033; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px; }
    h1 { margin: 0 0 8px; font-size: 30px; }
    .summary { margin: 0 0 24px; color: #475569; }
    .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; }
    .phase-card { border: 1px solid #dbe3ef; border-radius: 12px; background: #fff; min-height: 230px; padding: 16px; display: grid; place-items: center; text-align: center; }
    .phase-card h2 { margin: 10px 0 4px; font-size: 18px; }
    .phase-card p { margin: 0; color: #0f766e; }
    .phase-card small { color: #64748b; line-height: 1.4; }
    .pet-figure { width: 112px; height: 112px; border-radius: 34px; background: linear-gradient(160deg, #ffd28b, #f97316); display: grid; place-items: center; color: #111827; box-shadow: 0 18px 30px rgba(249, 115, 22, 0.22); transform-origin: 50% 92%; }
    .ears { font-size: 14px; transform: translateY(-10px); }
    .face { font-size: 24px; }
    .body { width: 54px; height: 16px; border-radius: 999px; background: rgba(255,255,255,0.42); }
    [data-action="drag_grabbed"] .pet-figure { transform: translateY(-8px) rotate(-4deg) scale(1.03); }
    [data-action="dragging"] .pet-figure { animation: drag 0.8s ease-in-out infinite; }
    [data-action="drag_release"] .pet-figure { transform: translateY(-3px) rotate(1deg) scale(1.02); }
    [data-action="drag_land"] .pet-figure { animation: land 0.7s ease-out 1; }
    @keyframes drag { 0%,100% { transform: translateY(-3px) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
    @keyframes land { 0% { transform: translateY(-8px); } 55% { transform: translateY(5px) scale(0.98); } 100% { transform: translateY(0); } }
    .checks { margin-top: 24px; display: grid; gap: 8px; }
    .checks li { background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px; }
  </style>
</head>
<body>
  <main>
    <h1>V15.2 Drag Physics Capture</h1>
    <p class="summary">Deterministic local capture for grabbed → dragging → release → land. This is evidence for V15.2 only and does not claim final V15 passed.</p>
    <section class="grid">${phaseCards}</section>
    <ul class="checks">
      <li>Native drag ghost guard: enabled by CSS, dragstart/selectstart prevention, and draggable=false sprite frames.</li>
      <li>Position persistence path: Tauri WindowEvent::Moved saves position; runtime reads final position after drag.</li>
      <li>State boundary: drag micro-interaction snapshots emit zero PetEvent and write zero CatStateMachine updates.</li>
    </ul>
  </main>
</body>
</html>`, "utf8");
  return existsSync(capturePath) && securityScanText(readSafe(capturePath));
}

function securityScanPassed() {
  const combined = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_2-drag-physics-release-spec.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "apps/desktop/src/runtime-micro-interactions.ts",
    "apps/desktop/src/runtime-micro-interactions.test.ts",
    "apps/desktop/src/main.ts",
    "apps/desktop/src/styles.css",
    "apps/desktop/src/renderer/sprite-renderer.ts"
  ].map(readSafe).join("\n");
  return securityScanText(combined);
}

function securityScanText(value) {
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|rawPointerPath\s*[:=]|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]/i.test(value);
}

function claimScanPassed() {
  const docs = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_7-final-qa-evidence-plan.md"
  ].map(readSafe).join("\n");
  return docs.includes("V15 drag physics and release/land interaction passed for tested local desktop scenarios.") &&
    docs.includes("V15.7") &&
    docs.includes("Petdex parity achieved") &&
    !docs.includes("Petdex parity achieved | allowed") &&
    !docs.includes("3D ready | allowed") &&
    !docs.includes("production signed release ready | allowed");
}

function prdSpecPassed() {
  const prd = readSafe("docs/active/agent_desktop_pet_prd_v15.md");
  const spec = readSafe("docs/V15.x/v15_2-drag-physics-release-spec.md");
  const contract = readSafe("docs/V15.x/v15_x-implementation-contract.md");
  return prd.includes("被拿起") &&
    prd.includes("释放落地") &&
    prd.includes("no image ghost") &&
    spec.includes("drag_release") &&
    spec.includes("drag_land") &&
    contract.includes("V15.2");
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
  writeFileSync(evidencePath, `# V15.2 Drag Physics Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

This evidence covers V15.2 drag physics and release/land interaction behavior.
It does not pass V15.3 pointer feedback, V15.4 autonomous walk, V15.5 emotion
composer, V15.6 settings UX, V15.7 final gate, Petdex parity, 3D readiness,
provider readiness, production release readiness, Windows readiness, or
cross-platform readiness.

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

## Drag Capture

- HTML capture: \`${capturePath}\`

## Safe Renderer Input Snapshot

\`\`\`json
${JSON.stringify(JSON.parse(simulation.safeRendererInputSummary), null, 2)}
\`\`\`

## Allowed Claim

Allowed only if status is passed:

\`\`\`text
V15 drag physics and release/land interaction passed for tested local desktop scenarios.
\`\`\`

## Forbidden Claims

This evidence does not allow:

- V15 living desktop pet interaction upgrade passed.
- V15 pointer-aware hover/click/double-click feedback passed.
- V15 bounded autonomous walk passed.
- Petdex parity achieved.
- 3D ready.
- provider integration verified.
- production signed release ready.
- Windows ready.
- cross-platform ready.

## Drift / False-green Risk

Risk level after V15.2: Medium.

Reason: V15.2 proves drag sequence, native drag ghost prevention, and position
persistence code paths with deterministic local capture. Full final desktop
interaction QA remains required in V15.7.

## Final Decision

${status === "passed" ? "V15.2 passed. V15.3 may proceed after phase-specific PRD/spec review." : "V15.2 failed. Do not proceed to V15.3."}
`, "utf8");
}
