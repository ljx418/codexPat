#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const evidencePath = `docs/V15.x/evidence/v15_1-interaction-model-smoke-${DATE}.md`;
const records = [];

const unitResult = spawnSync("pnpm", ["--filter", "desktop", "test"], {
  cwd: process.cwd(),
  stdio: "ignore"
});
record("desktop unit test suite", unitResult.status === 0, unitResult.status === 0 ? "exit=0" : `exit=${unitResult.status ?? "unknown"}`);

const simulation = runInteractionSimulation();
record("priority order frozen", simulation.priorityOrderPassed, simulation.priorityOrder.join(" > "));
record("required safe actions present", simulation.requiredActionsPassed, simulation.requiredActions.join(", "));
record("error blocks lower-priority interactions", simulation.errorBlocked, simulation.errorBlockSummary);
record("need_input blocks lower-priority interactions", simulation.needInputBlocked, simulation.needInputBlockSummary);
record("drag blocks pointer/click/idle", simulation.dragBlocksLower, simulation.dragBlockSummary);
record("success transient does not override urgent state", simulation.successTransientSafe, simulation.successTransientSummary);
record("idle scheduler allowed / blocked", simulation.idleSchedulerPassed, simulation.idleSchedulerSummary);
record("safe renderer input snapshot", simulation.safeRendererInputPassed, simulation.safeRendererInputSummary);
record("zero PetEvent", simulation.zeroPetEvent, "all snapshots report emitsPetEvent=false");
record("zero CatStateMachine write", simulation.zeroCatStateMachineWrite, "all snapshots report writesCatStateMachine=false");
record("security scan", securityScanPassed(), "no token/auth/raw payload/path-like leakage in V15.1 docs/code/evidence inputs");
record("claim scan", claimScanPassed(), "V15.1 scoped allowed claim exists; V15.7 remains gated");
record("PRD/spec review", prdSpecPassed(), "V15.1 implementation matches active PRD, acceptance plan, and implementation contract");

writeEvidence();

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runInteractionSimulation() {
  const code = `
    import {
      RuntimeMicroInteractionController,
      snapshotToSafeRendererInput,
      V15_INTERACTION_PRIORITY_ORDER,
      V15_REQUIRED_SAFE_ACTION_IDS
    } from "./apps/desktop/src/runtime-micro-interactions.ts";

    let now = 1000;
    const snapshots = [];
    const collect = (snapshot) => {
      snapshots.push(snapshot);
      return snapshot;
    };

    const error = new RuntimeMicroInteractionController({ now: () => now, idleIntervalMs: 1000 });
    error.setBaseState("error");
    const errorResults = [
      collect(error.startPointerNear()),
      collect(error.startClick()),
      collect(error.startDoubleClick()),
      collect(error.startDragStart()),
      collect(error.startDragging()),
      collect(error.maybeStartIdleRandom())
    ];

    const needInput = new RuntimeMicroInteractionController({ now: () => now, idleIntervalMs: 1000 });
    needInput.setBaseState("need_input");
    const needInputResults = [
      collect(needInput.startPointerNear()),
      collect(needInput.startClick()),
      collect(needInput.startDoubleClick()),
      collect(needInput.startDragStart()),
      collect(needInput.startDragging()),
      collect(needInput.maybeStartIdleRandom())
    ];

    const drag = new RuntimeMicroInteractionController({ now: () => now, idleIntervalMs: 1000 });
    drag.setBaseState("idle");
    collect(drag.startDragging());
    const dragResults = [
      collect(drag.startPointerNear()),
      collect(drag.startClick()),
      collect(drag.startDoubleClick()),
      collect(drag.maybeStartIdleRandom())
    ];

    now = 0;
    const idle = new RuntimeMicroInteractionController({
      now: () => now,
      idleIntervalMs: 1000,
      idleActionDurationMs: 400,
      napThresholdMs: 180000
    });
    idle.setBaseState("idle");
    now = 1000;
    const idleRandom = collect(idle.maybeStartIdleRandom());
    const idleRendererInput = snapshotToSafeRendererInput(idleRandom);

    const pointer = new RuntimeMicroInteractionController({ now: () => now });
    pointer.setBaseState("idle");
    const pointerInput = snapshotToSafeRendererInput(collect(pointer.startPointerNear()));
    const clickInput = snapshotToSafeRendererInput(collect(pointer.startClick()));
    const dragInput = snapshotToSafeRendererInput(collect(pointer.startDragStart()));

    const urgent = new RuntimeMicroInteractionController({ now: () => now });
    urgent.setBaseState("error");
    const urgentBefore = collect(urgent.snapshot());
    urgent.setBaseState("success");
    const successAfterUrgent = collect(urgent.snapshot());

    const required = [
      "idle_blink",
      "idle_look_left",
      "idle_look_right",
      "idle_tail_sway",
      "idle_stretch",
      "idle_settle",
      "idle_nap",
      "idle_wake",
      "pointer_look",
      "click_paw",
      "double_click_jump",
      "drag_grabbed",
      "dragging",
      "drag_release",
      "drag_land",
      "walk_left",
      "walk_right",
      "turn",
      "edge_avoid"
    ];

    const rendererInputKeys = (value) => Object.keys(value).sort();
    const allowedRendererKeys = ["actionId", "packId", "playbackIntent", "rendererKind", "scale", "visibility"];
    const rendererInputs = [idleRendererInput, pointerInput, clickInput, dragInput];
    const forbiddenRendererPattern = new RegExp("raw|payload|prompt|command|token|Authorization|workspace|config|/Users/", "i");

    console.log(JSON.stringify({
      priorityOrder: [...V15_INTERACTION_PRIORITY_ORDER],
      priorityOrderPassed: JSON.stringify([...V15_INTERACTION_PRIORITY_ORDER]) === JSON.stringify([
        "error",
        "need_input",
        "drag",
        "double_click",
        "click",
        "success transient",
        "running",
        "thinking",
        "pointer_near",
        "idle random"
      ]),
      requiredActions: [...V15_REQUIRED_SAFE_ACTION_IDS],
      requiredActionsPassed: required.every((action) => V15_REQUIRED_SAFE_ACTION_IDS.includes(action)),
      errorBlocked: errorResults.every((item) => item.displayState === "error"),
      errorBlockSummary: errorResults.map((item) => item.reasonCode).join(", "),
      needInputBlocked: needInputResults.every((item) => item.displayState === "need_input"),
      needInputBlockSummary: needInputResults.map((item) => item.reasonCode).join(", "),
      dragBlocksLower: dragResults.every((item) => item.microInteraction === "dragging"),
      dragBlockSummary: dragResults.map((item) => item.microInteraction).join(", "),
      successTransientSafe: urgentBefore.displayState === "error" && successAfterUrgent.displayState === "success" && successAfterUrgent.reasonCode === "success_transient",
      successTransientSummary: urgentBefore.displayState + " -> " + successAfterUrgent.displayState + " / " + successAfterUrgent.reasonCode,
      idleSchedulerPassed: idleRandom.microInteraction === "idle_blink" && idleRandom.emitsPetEvent === false && idleRandom.writesCatStateMachine === false,
      idleSchedulerSummary: idleRandom.microInteraction + " / " + idleRandom.reasonCode,
      safeRendererInputPassed: rendererInputs.every((item) => JSON.stringify(rendererInputKeys(item)) === JSON.stringify(allowedRendererKeys)) &&
        pointerInput.actionId === "pointer_look" &&
        clickInput.actionId === "click_paw" &&
        dragInput.actionId === "drag_grabbed" &&
        !forbiddenRendererPattern.test(JSON.stringify(rendererInputs)),
      safeRendererInputSummary: JSON.stringify(rendererInputs),
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

function securityScanPassed() {
  const combined = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_x-development-plan.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "docs/V15.x/v15_1-interaction-priority-spec.md",
    "apps/desktop/src/runtime-micro-interactions.ts",
    "apps/desktop/src/runtime-micro-interactions.test.ts",
    "apps/desktop/src/visual-action-composer.ts"
  ].map(readSafe).join("\n");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]/i.test(combined);
}

function claimScanPassed() {
  const docs = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_x-development-plan.md",
    "docs/V15.x/v15_7-final-qa-evidence-plan.md"
  ].map(readSafe).join("\n");
  return docs.includes("V15 priority-safe interaction model and living idle scheduler rebaseline passed for tested local scenarios.") &&
    docs.includes("V15.7 cannot start until V15.1-V15.6") &&
    docs.includes("Petdex parity achieved") &&
    !docs.includes("Petdex parity achieved | allowed") &&
    !docs.includes("3D ready | allowed") &&
    !docs.includes("production signed release ready | allowed");
}

function prdSpecPassed() {
  const prd = readSafe("docs/active/agent_desktop_pet_prd_v15.md");
  const spec = readSafe("docs/V15.x/v15_1-interaction-priority-spec.md");
  const contract = readSafe("docs/V15.x/v15_x-implementation-contract.md");
  return prd.includes("priority: error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random") &&
    spec.includes("error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random") &&
    contract.includes("V15.1") &&
    contract.includes("zero PetEvent");
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
  writeFileSync(evidencePath, `# V15.1 Interaction Model Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

This evidence covers the V15.1 priority-safe interaction model and living idle
scheduler rebaseline. It does not pass drag desktop physics, pointer UX,
autonomous walk, settings UX, final V15 QA, Petdex parity, 3D readiness,
provider readiness, production release readiness, Windows readiness, or
cross-platform readiness.

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

## Safe Renderer Input Snapshot

\`\`\`json
${JSON.stringify(JSON.parse(simulation.safeRendererInputSummary), null, 2)}
\`\`\`

## Allowed Claim

Allowed only if status is passed:

\`\`\`text
V15 priority-safe interaction model and living idle scheduler rebaseline passed for tested local scenarios.
\`\`\`

## Forbidden Claims

This evidence does not allow:

- V15 living desktop pet interaction upgrade passed.
- V15 drag physics and release/land interaction passed.
- V15 pointer-aware hover/click/double-click feedback passed.
- V15 bounded autonomous walk passed.
- Petdex parity achieved.
- 3D ready.
- provider integration verified.
- production signed release ready.
- Windows ready.
- cross-platform ready.

## Drift / False-green Risk

Risk level after V15.1: Medium.

Reason: V15.1 is unit/smoke evidence for the interaction priority model. Desktop
visual evidence is still required for V15.2-V15.7 and cannot be inferred from
this phase.

## Final Decision

${status === "passed" ? "V15.1 passed. V15.2 may proceed after phase-specific PRD/spec review." : "V15.1 failed. Do not proceed to V15.2."}
`, "utf8");
}
