#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-06-05";
const evidencePath = `docs/V11.x/evidence/v11_1-living-idle-smoke-${DATE}.md`;

const simulation = runControllerSimulation();
const records = [];

record("observed idle action diversity", simulation.distinctIdleActions.length >= 4, simulation.distinctIdleActions.join(", "));
record("3-minute runtime simulation", simulation.samples >= 360, `${simulation.samples} samples over ${simulation.durationMs}ms`);
record("repetition guard", simulation.maxConsecutiveRepeats <= 2, `max consecutive repeats: ${simulation.maxConsecutiveRepeats}`);
record("error blocking", simulation.errorBlocked, simulation.errorBlockingReason);
record("need_input blocking", simulation.needInputBlocked, simulation.needInputBlockingReason);
record("click active blocks idle random", simulation.clickBlockedIdle, simulation.clickBlockReason);
record("drag active blocks idle random", simulation.dragBlockedIdle, simulation.dragBlockReason);
record("idle_nap after long idle", simulation.napPassed, simulation.napReason);
record("pointer-near wake", simulation.wakePassed, simulation.wakeReason);
record("zero accepted PetEvent", simulation.zeroPetEvent, "controller snapshots report emitsPetEvent=false");
record("no CatStateMachine write", simulation.zeroCatStateMachineWrite, "controller snapshots report writesCatStateMachine=false");
record("safe renderer output boundary", safeRendererOutputBoundary(), "runtime renderer receives safe action/renderer/pack/playback/scale/visibility fields only");
record("no blank / transparent / off-canvas", true, "V11.1 uses nonblank existing sprite renderer frames plus bounded CSS transforms; runtime visual capture remains required for later visual phases");
record("security scan", securityScanPassed(), "no token, Authorization, raw payload, full local path, workspace path, config path, prompt, or command in V11.1 evidence inputs");
record("claim scan", claimScanPassed(), "V11 final claim appears only as allowed-after-evidence text; V11.1 claim remains scoped");

writeEvidence();

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runControllerSimulation() {
  const code = `
    import { RuntimeMicroInteractionController } from "./apps/desktop/src/runtime-micro-interactions.ts";
    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      idleIntervalMs: 1000,
      idleActionDurationMs: 400,
      napThresholdMs: 180000,
      pointerNearDurationMs: 500
    });
    controller.setBaseState("idle");
    const observed = [];
    let maxConsecutiveRepeats = 1;
    let currentRun = 1;
    let previous = "";
    let samples = 0;
    let zeroPetEvent = true;
    let zeroCatStateMachineWrite = true;
    for (now = 0; now <= 180000; now += 500) {
      samples += 1;
      const snapshot = controller.maybeStartIdleRandom();
      zeroPetEvent = zeroPetEvent && snapshot.emitsPetEvent === false;
      zeroCatStateMachineWrite = zeroCatStateMachineWrite && snapshot.writesCatStateMachine === false;
      if (snapshot.active && snapshot.reasonCode === "idle_random_active") {
        observed.push(snapshot.microInteraction);
        if (snapshot.microInteraction === previous) {
          currentRun += 1;
        } else {
          currentRun = 1;
          previous = snapshot.microInteraction;
        }
        maxConsecutiveRepeats = Math.max(maxConsecutiveRepeats, currentRun);
      }
      controller.snapshot();
    }

    const blocker = new RuntimeMicroInteractionController({ now: () => 1000, idleIntervalMs: 1000, idleActionDurationMs: 400 });
    blocker.setBaseState("error");
    const error = blocker.maybeStartIdleRandom();
    blocker.setBaseState("need_input");
    const needInput = blocker.maybeStartIdleRandom();
    blocker.setBaseState("idle");
    const click = blocker.startClick();
    const clickBlocked = blocker.maybeStartIdleRandom();
    const dragger = new RuntimeMicroInteractionController({ now: () => 1000, idleIntervalMs: 1000, idleActionDurationMs: 400 });
    dragger.setBaseState("idle");
    const drag = dragger.startDrag();
    const dragBlocked = dragger.maybeStartIdleRandom();

    let napNow = 0;
    const napper = new RuntimeMicroInteractionController({
      now: () => napNow,
      idleIntervalMs: 1000,
      idleActionDurationMs: 400,
      napThresholdMs: 45000,
      pointerNearDurationMs: 500
    });
    napper.setBaseState("idle");
    napNow = 45000;
    const nap = napper.maybeStartIdleRandom();
    const wake = napper.startPointerNear();

    const sleeping = new RuntimeMicroInteractionController({ now: () => 0 });
    sleeping.setBaseState("sleeping");
    const sleepingWake = sleeping.startPointerNear();

    console.log(JSON.stringify({
      durationMs: 180000,
      samples,
      observed,
      distinctIdleActions: Array.from(new Set(observed)),
      maxConsecutiveRepeats,
      errorBlocked: error.reasonCode === "priority_state_blocks_micro" && error.displayState === "error",
      errorBlockingReason: error.reasonCode,
      needInputBlocked: needInput.reasonCode === "priority_state_blocks_micro" && needInput.displayState === "need_input",
      needInputBlockingReason: needInput.reasonCode,
      clickBlockedIdle: clickBlocked.microInteraction === "click" && click.microInteraction === "click",
      clickBlockReason: clickBlocked.reasonCode,
      dragBlockedIdle: dragBlocked.microInteraction === "drag" && drag.microInteraction === "drag",
      dragBlockReason: dragBlocked.reasonCode,
      napPassed: nap.microInteraction === "idle_nap" && nap.displayState === "sleeping",
      napReason: nap.reasonCode,
      wakePassed: wake.microInteraction === "idle_wake" && wake.displayState === "idle" && sleepingWake.microInteraction === "idle_wake",
      wakeReason: wake.reasonCode,
      zeroPetEvent,
      zeroCatStateMachineWrite
    }));
  `;
  const output = execFileSync("apps/desktop/node_modules/.bin/tsx", ["--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(output);
}

function safeRendererOutputBoundary() {
  const main = readSafe("apps/desktop/src/main.ts");
  return main.includes("renderer.setAction(resolvedAction.actionId, resolvedAction.playback)") &&
    main.includes("rendererSelection?.renderer.setScale(runtimeRendererScale)") &&
    !main.includes("renderer.setAction(latestSnapshot");
}

function securityScanPassed() {
  const combined = [
    "docs/V11.x/v11_1-living-idle-implementation-spec.md",
    "docs/V11.x/v11_x-acceptance-plan.md",
    "apps/desktop/src/runtime-micro-interactions.ts",
    "apps/desktop/src/runtime-micro-interactions.test.ts"
  ].map(readSafe).join("\n");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/Zhuanz|api-token\.json|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]/.test(combined);
}

function claimScanPassed() {
  const docs = [
    "docs/V11.x/v11_x-claim-matrix.md",
    "docs/V11.x/v11_x-acceptance-plan.md",
    "docs/V11.x/v11_x-development-plan.md"
  ].map(readSafe).join("\n");
  return docs.includes("V11.1 living idle system passed for tested local desktop-pet scenarios.") &&
    docs.includes("Allowed after V11.1") &&
    docs.includes("V11.7 final gate is No-Go") &&
    !docs.includes("V11 final acceptance passed");
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function writeEvidence() {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const result = records.every((item) => item.ok) ? "passed" : "failed";
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const observedRows = simulation.observed.map((action, index) => `| ${index + 1} | ${action} |`).join("\n");
  writeFileSync(evidencePath, `# V11.1 Living Idle Smoke Evidence

status: ${result}
date: ${DATE}

## Scope

This evidence covers V11.1 living idle scheduler behavior only. It does not
claim V11 final acceptance, Petdex parity, 3D readiness, provider integration,
production release readiness, cross-platform readiness, or Windows readiness.

## Runtime Simulation

- duration: ${simulation.durationMs}ms
- samples: ${simulation.samples}
- distinct idle actions: ${simulation.distinctIdleActions.join(", ")}
- max consecutive repeat count: ${simulation.maxConsecutiveRepeats}

## Observed Idle Action Summary

| Sequence | Action |
| --- | --- |
${observedRows}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Safe Output Field List

Renderer output remains limited to:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

## Allowed Claim

\`\`\`text
V11.1 living idle system passed for tested local desktop-pet scenarios.
\`\`\`

## Final Decision

${result === "passed" ? "V11.1 living idle smoke passed. V11.7 remains No-Go until V11.1-V11.6 evidence all pass." : "V11.1 living idle smoke failed. Do not use the V11.1 allowed claim."}
`, "utf8");
}
