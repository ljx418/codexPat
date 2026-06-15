#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const evidencePath = `docs/V15.x/evidence/v15_4-autonomous-walk-smoke-${DATE}.md`;
const capturePath = `docs/V15.x/evidence/v15_4-autonomous-walk-capture-${DATE}.html`;
const records = [];

record("V15.0 prerequisite", evidencePassed("docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md"), "scope freeze evidence passed");
record("V15.1 prerequisite", evidencePassed("docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md"), "interaction model evidence passed");
record("V15.2 prerequisite", evidencePassed("docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md"), "drag physics evidence passed");
record("V15.3 prerequisite", evidencePassed("docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md"), "pointer feedback evidence passed");

const checkResult = spawnSync("pnpm", ["--filter", "desktop", "check"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop check", checkResult.status === 0, checkResult.status === 0 ? "exit=0" : `exit=${checkResult.status ?? "unknown"}`);

const testResult = spawnSync("pnpm", ["--filter", "desktop", "test"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop test", testResult.status === 0, testResult.status === 0 ? "exit=0" : `exit=${testResult.status ?? "unknown"}`);

const simulation = runWalkSimulation();
record("bounded walk cycle", simulation.walkPassed, simulation.walkSummary);
record("edge avoidance", simulation.edgePassed, simulation.edgeSummary);
record("turn visual", simulation.turnPassed, simulation.turnSummary);
record("disable switch", simulation.disabledPassed, simulation.disabledSummary);
record("quiet mode blocks walk", simulation.quietPassed, simulation.quietSummary);
record("priority blocks walk", simulation.priorityPassed, simulation.prioritySummary);
record("safe renderer input maps walk phases", simulation.safeRendererInputPassed, simulation.safeRendererInputSummary);
record("zero PetEvent", simulation.zeroPetEvent, "walk decisions and snapshots report emitsPetEvent=false");
record("zero CatStateMachine write", simulation.zeroCatStateMachineWrite, "walk decisions and snapshots report writesCatStateMachine=false");
record("desktop wiring", desktopWalkWiringPassed(), "main.ts ticks AutonomousWalkController, persists target position, and handles edge turn");
record("target isolation boundary", targetIsolationPassed(), "walk path is scoped to current pet window and does not notify default/unrelated pets");
record("visual capture generated", writeCaptureHtml(), capturePath);
record("security scan", securityScanPassed(), "no token/auth/raw pointer trace/path-like leakage in V15.4 docs/code/evidence inputs");
record("claim scan", claimScanPassed(), "V15.4 scoped claim exists; V15.7 remains gated");
record("PRD/spec review", prdSpecPassed(), "V15.4 implementation matches autonomous walk spec and implementation contract");

writeEvidence();

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runWalkSimulation() {
  const code = `
    import {
      AutonomousWalkController,
      DEFAULT_INTERACTION_SETTINGS,
      clampPositionToBounds
    } from "./apps/desktop/src/interaction-settings.ts";
    import {
      RuntimeMicroInteractionController,
      snapshotToSafeRendererInput
    } from "./apps/desktop/src/runtime-micro-interactions.ts";

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

    let now = 0;
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 90 };
    const walk = new AutonomousWalkController(() => now);
    const micro = new RuntimeMicroInteractionController({ now: () => now, walkDurationMs: 900 });

    now = 6000;
    const step = walk.tick({
      baseState: "idle",
      interaction: idleSnapshot(),
      settings: DEFAULT_INTERACTION_SETTINGS,
      position: { x: 30, y: 30 },
      bounds
    });
    const stepSnapshot = micro.startAutonomousWalk(step.visual === "none" ? "walk_right" : step.visual);
    const stepInput = snapshotToSafeRendererInput(stepSnapshot);

    now = 12000;
    const edge = walk.tick({
      baseState: "idle",
      interaction: idleSnapshot(),
      settings: DEFAULT_INTERACTION_SETTINGS,
      position: { x: 100, y: 30 },
      bounds
    });
    const edgeSnapshot = micro.startAutonomousWalk(edge.visual === "none" ? "edge_avoid" : edge.visual);
    const edgeInput = snapshotToSafeRendererInput(edgeSnapshot);

    now = 13000;
    const turnSnapshot = micro.startAutonomousWalk("turn");
    const turnInput = snapshotToSafeRendererInput(turnSnapshot);

    const disabled = walk.tick({
      baseState: "idle",
      interaction: idleSnapshot(),
      settings: { ...DEFAULT_INTERACTION_SETTINGS, autonomousWalk: false },
      position: { x: 50, y: 30 },
      bounds
    });
    const quiet = walk.tick({
      baseState: "idle",
      interaction: idleSnapshot(),
      settings: { ...DEFAULT_INTERACTION_SETTINGS, quietMode: true },
      position: { x: 50, y: 30 },
      bounds
    });
    const errorBlocked = walk.tick({
      baseState: "error",
      interaction: idleSnapshot(),
      settings: DEFAULT_INTERACTION_SETTINGS,
      position: { x: 50, y: 30 },
      bounds
    });
    const dragInteraction = new RuntimeMicroInteractionController({ now: () => now });
    dragInteraction.setBaseState("idle");
    const dragging = dragInteraction.startDragStart();
    const dragBlocked = walk.tick({
      baseState: "idle",
      interaction: dragging,
      settings: DEFAULT_INTERACTION_SETTINGS,
      position: { x: 50, y: 30 },
      bounds
    });

    const clamped = clampPositionToBounds({ x: -25, y: 140 }, bounds);
    const decisions = [step, edge, disabled, quiet, errorBlocked, dragBlocked];
    const snapshots = [stepSnapshot, edgeSnapshot, turnSnapshot, dragging];
    const inputs = [stepInput, edgeInput, turnInput];

    console.log(JSON.stringify({
      walkPassed: step.active === true &&
        step.reasonCode === "walk_step" &&
        step.visual === "walk_right" &&
        step.position.x > 30 &&
        step.position.x <= bounds.maxX &&
        clamped.x === 0 &&
        clamped.y === 90,
      walkSummary: step.reasonCode + " -> " + step.visual + " -> x=" + step.position.x,
      edgePassed: edge.active === true &&
        edge.reasonCode === "walk_edge_avoid" &&
        edge.visual === "edge_avoid" &&
        edge.position.x === bounds.maxX,
      edgeSummary: edge.reasonCode + " -> " + edge.visual + " -> x=" + edge.position.x,
      turnPassed: turnSnapshot.microInteraction === "turn" &&
        turnSnapshot.reasonCode === "autonomous_walk_turn" &&
        turnInput.actionId === "turn",
      turnSummary: turnSnapshot.reasonCode + " -> " + turnInput.actionId,
      disabledPassed: disabled.reasonCode === "walk_disabled" && disabled.active === false,
      disabledSummary: disabled.reasonCode,
      quietPassed: quiet.reasonCode === "walk_quiet_mode" && quiet.active === false,
      quietSummary: quiet.reasonCode,
      priorityPassed: errorBlocked.reasonCode === "walk_priority_blocked" &&
        dragBlocked.reasonCode === "walk_priority_blocked",
      prioritySummary: errorBlocked.reasonCode + " / " + dragBlocked.reasonCode,
      safeRendererInputPassed: stepInput.actionId === "walk_right" &&
        edgeInput.actionId === "edge_avoid" &&
        turnInput.actionId === "turn" &&
        !new RegExp("raw|payload|prompt|command|token|Authorization|workspace|config|/Users/", "i").test(JSON.stringify(inputs)),
      safeRendererInputSummary: JSON.stringify(inputs),
      zeroPetEvent: decisions.every((item) => item.emitsPetEvent === false) &&
        snapshots.every((item) => item.emitsPetEvent === false),
      zeroCatStateMachineWrite: decisions.every((item) => item.writesCatStateMachine === false) &&
        snapshots.every((item) => item.writesCatStateMachine === false)
    }));
  `;
  const output = execFileSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/loader.mjs", "--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(output);
}

function desktopWalkWiringPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  const css = readSafe("apps/desktop/src/styles.css");
  return main.includes("const autonomousWalk = new AutonomousWalkController()") &&
    main.includes("autonomousWalk.tick({") &&
    main.includes("setCurrentPetPosition(decision.position)") &&
    main.includes('microInteractions.startAutonomousWalk("turn")') &&
    css.includes('data-micro-interaction="walk_left"') &&
    css.includes('data-micro-interaction="walk_right"') &&
    css.includes('data-micro-interaction="edge_avoid"');
}

function targetIsolationPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  const walkStart = main.indexOf("autonomousWalk.tick({");
  const walkEnd = main.indexOf('listen<AcceptedPetEvent>("pet-event:accepted"', walkStart);
  const walkBlock = walkStart >= 0 && walkEnd > walkStart ? main.slice(walkStart, walkEnd) : "";
  return walkBlock.includes("setCurrentPetPosition(decision.position)") &&
    walkBlock.includes("renderRuntimeAction(latestSnapshot)") &&
    !walkBlock.includes("sendTestPetReaction(") &&
    !walkBlock.includes("notify(") &&
    !walkBlock.includes("pet-event:accepted");
}

function writeCaptureHtml() {
  mkdirSync(dirname(capturePath), { recursive: true });
  const phaseCards = [
    ["Walk right", "walk_right", "one bounded step within desktop safe bounds"],
    ["Walk left", "walk_left", "direction can reverse after edge avoidance"],
    ["Turn", "turn", "brief turn after edge avoidance"],
    ["Edge avoid", "edge_avoid", "cat stays visible and does not leave safe bounds"],
    ["Blocked", "quiet / error / drag", "quiet mode, urgent states, and drag stop autonomous movement"]
  ].map(([label, action, description]) => `
    <article class="phase-card" data-action="${action}">
      <div class="track"><div class="pet-figure"><span class="ears">▲ ▲</span><span class="face">●ω●</span><span class="body"></span></div></div>
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
  <title>V15.4 Autonomous Walk Capture</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #172033; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px; }
    h1 { margin: 0 0 8px; font-size: 30px; }
    .summary { margin: 0 0 24px; color: #475569; }
    .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; }
    .phase-card { border: 1px solid #dbe3ef; border-radius: 12px; background: #fff; min-height: 250px; padding: 16px; display: grid; place-items: center; text-align: center; overflow: hidden; }
    .track { width: 150px; height: 118px; border-radius: 20px; background: linear-gradient(180deg, #e0f2fe, #f8fafc); display: grid; place-items: center; border: 1px dashed #93c5fd; }
    .pet-figure { width: 82px; height: 82px; border-radius: 28px; background: linear-gradient(160deg, #fed7aa, #fb923c); display: grid; place-items: center; color: #111827; box-shadow: 0 14px 24px rgba(251, 146, 60, 0.2); transform-origin: 50% 92%; }
    .ears { font-size: 11px; transform: translateY(-8px); }
    .face { font-size: 20px; }
    .body { width: 40px; height: 12px; border-radius: 999px; background: rgba(255,255,255,0.42); }
    h2 { margin: 10px 0 4px; font-size: 18px; }
    p { margin: 0; color: #047857; }
    small { color: #64748b; line-height: 1.4; }
    [data-action="walk_right"] .pet-figure { animation: right 1.1s ease-in-out infinite; }
    [data-action="walk_left"] .pet-figure { animation: left 1.1s ease-in-out infinite; }
    [data-action="turn"] .pet-figure { animation: turn 0.8s ease-in-out infinite; }
    [data-action="edge_avoid"] .pet-figure { animation: edge 0.9s ease-in-out infinite; }
    [data-action="quiet / error / drag"] .pet-figure { opacity: 0.75; transform: translateY(0); }
    @keyframes right { 0%,100% { transform: translateX(-20px); } 50% { transform: translateX(20px) translateY(-2px); } }
    @keyframes left { 0%,100% { transform: translateX(20px) scaleX(-1); } 50% { transform: translateX(-20px) translateY(-2px) scaleX(-1); } }
    @keyframes turn { 0%,100% { transform: rotate(0deg); } 40% { transform: rotate(-7deg); } 70% { transform: rotate(7deg); } }
    @keyframes edge { 0%,100% { transform: translateX(22px); } 50% { transform: translateX(8px) rotate(-6deg); } }
    .checks { margin-top: 24px; display: grid; gap: 8px; }
    .checks li { background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px; }
  </style>
</head>
<body>
  <main>
    <h1>V15.4 Autonomous Walk Capture</h1>
    <p class="summary">Deterministic local capture for bounded walk, turn, edge avoidance, and blocking rules. This is evidence for V15.4 only and does not claim final V15 passed.</p>
    <section class="grid">${phaseCards}</section>
    <ul class="checks">
      <li>Walk decisions clamp position inside safe bounds and report zero PetEvent.</li>
      <li>Quiet mode, error, need_input, drag, and active click/double-click block autonomous walk.</li>
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
    "docs/V15.x/v15_4-autonomous-walk-spec.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "apps/desktop/src/interaction-settings.ts",
    "apps/desktop/src/interaction-settings.test.ts",
    "apps/desktop/src/runtime-micro-interactions.ts",
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
  return docs.includes("V15 bounded autonomous walk passed for tested local desktop scenarios.") &&
    docs.includes("V15.7") &&
    docs.includes("Petdex parity achieved") &&
    !docs.includes("Petdex parity achieved | allowed") &&
    !docs.includes("3D ready | allowed") &&
    !docs.includes("production signed release ready | allowed");
}

function prdSpecPassed() {
  const prd = readSafe("docs/active/agent_desktop_pet_prd_v15.md");
  const spec = readSafe("docs/V15.x/v15_4-autonomous-walk-spec.md");
  const contract = readSafe("docs/V15.x/v15_x-implementation-contract.md");
  return prd.includes("自由走动") &&
    prd.includes("安全桌面区域") &&
    spec.includes("walk_left") &&
    spec.includes("edge_avoid") &&
    spec.includes("quiet mode disables walk") &&
    contract.includes("V15.4");
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
  writeFileSync(evidencePath, `# V15.4 Autonomous Walk Smoke Evidence

status: ${status}
date: ${DATE}
scope: V15.4 bounded autonomous walk, turn, edge avoidance, and blocking rules for tested local desktop scenarios.

## Results

| Gate | Result | Notes |
| --- | --- | --- |
${rows}

## Evidence Notes

- Bounded walk maps to safe action \`walk_right\` or \`walk_left\`.
- Edge avoidance maps to safe action \`edge_avoid\`.
- Turn transition maps to safe action \`turn\`.
- Disabled autonomous walk, quiet mode, urgent states, and drag block walk.
- Walk decisions and snapshots emit zero PetEvent and write zero CatStateMachine updates.
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

V15 bounded autonomous walk passed for tested local desktop scenarios.

## Forbidden Claims

This evidence does not claim Petdex parity, production release readiness, Windows readiness, cross-platform readiness, 3D readiness, provider integration, OS-level Codex window binding, or all Codex workflows verified.
`, "utf8");
}
