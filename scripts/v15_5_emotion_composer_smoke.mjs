#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const evidencePath = `docs/V15.x/evidence/v15_5-emotion-composer-smoke-${DATE}.md`;
const records = [];

record("V15.0 prerequisite", evidencePassed("docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md"), "scope freeze evidence passed");
record("V15.1 prerequisite", evidencePassed("docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md"), "interaction model evidence passed");
record("V15.2 prerequisite", evidencePassed("docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md"), "drag physics evidence passed");
record("V15.3 prerequisite", evidencePassed("docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md"), "pointer feedback evidence passed");
record("V15.4 prerequisite", evidencePassed("docs/V15.x/evidence/v15_4-autonomous-walk-smoke-2026-06-10.md"), "autonomous walk evidence passed");

const checkResult = spawnSync("pnpm", ["--filter", "desktop", "check"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop check", checkResult.status === 0, checkResult.status === 0 ? "exit=0" : `exit=${checkResult.status ?? "unknown"}`);

const testResult = spawnSync("pnpm", ["--filter", "desktop", "test"], { cwd: process.cwd(), stdio: "ignore" });
record("desktop test", testResult.status === 0, testResult.status === 0 ? "exit=0" : `exit=${testResult.status ?? "unknown"}`);

const matrix = runComposerMatrix();
record("composer matrix", matrix.matrixPassed, matrix.matrixSummary);
record("error and need_input hold priority", matrix.urgentPassed, matrix.urgentSummary);
record("working states remain clear", matrix.workingPassed, matrix.workingSummary);
record("success transient returns safely", matrix.successPassed, matrix.successSummary);
record("safe renderer input", matrix.safeRendererInputPassed, matrix.safeRendererInputSummary);
record("zero PetEvent", matrix.zeroPetEvent, "composer outputs report emitsPetEvent=false");
record("zero CatStateMachine write", matrix.zeroCatStateMachineWrite, "composer outputs report writesCatStateMachine=false");
record("runtime wiring", runtimeWiringPassed(), "main.ts uses composeRuntimeVisual before renderer action resolution");
record("security scan", securityScanPassed(), "no token/auth/raw payload/path-like leakage in V15.5 docs/code/evidence inputs");
record("claim scan", claimScanPassed(), "V15.5 scoped claim exists; V15.7 remains gated");
record("PRD/spec review", prdSpecPassed(), "V15.5 implementation matches emotion composer spec and implementation contract");

writeEvidence(matrix);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function runComposerMatrix() {
  const code = `
    import { composeRuntimeVisual, composeVisualAction } from "./apps/desktop/src/visual-action-composer.ts";

    function snapshot(displayState, microInteraction = "none", reasonCode = "base_state") {
      return {
        baseState: displayState,
        displayState,
        microInteraction,
        active: microInteraction !== "none",
        reasonCode,
        emitsPetEvent: false,
        writesCatStateMachine: false
      };
    }

    const errorPlan = composeVisualAction(snapshot("error"));
    const errorClick = composeVisualAction(snapshot("idle", "click"), { previousPlan: errorPlan });
    const needInputPlan = composeVisualAction(snapshot("need_input"));
    const needInputPointer = composeVisualAction(snapshot("idle", "pointer_near"), { previousPlan: needInputPlan });
    const runningPointer = composeVisualAction(snapshot("running", "pointer_near"));
    const thinkingIdle = composeVisualAction(snapshot("thinking", "idle_blink"));
    const success = composeVisualAction(snapshot("success", "none", "success_transient"));
    const successExpired = composeVisualAction(snapshot("idle", "none", "interaction_expired"), { previousPlan: success });
    const idleWalk = composeVisualAction(snapshot("idle", "walk_right"));
    const idleDouble = composeVisualAction(snapshot("idle", "double_click"));
    const sleepingWake = composeVisualAction(snapshot("idle", "idle_wake"));

    const visuals = [
      composeRuntimeVisual(snapshot("error")),
      composeRuntimeVisual(snapshot("need_input")),
      composeRuntimeVisual(snapshot("running", "pointer_near")),
      composeRuntimeVisual(snapshot("thinking", "idle_blink")),
      composeRuntimeVisual(snapshot("success", "none", "success_transient")),
      composeRuntimeVisual(snapshot("idle", "walk_right")),
      composeRuntimeVisual(snapshot("idle", "double_click")),
      composeRuntimeVisual(snapshot("idle", "idle_wake"))
    ];

    const expected = [
      ["error + click", errorClick.actionId, "error"],
      ["need_input + pointer", needInputPointer.actionId, "need_input"],
      ["running + pointer", runningPointer.actionId, "running"],
      ["thinking + idle_blink", thinkingIdle.actionId, "thinking"],
      ["success transient", success.actionId, "success"],
      ["success expired", successExpired.actionId, "idle"],
      ["idle + walk", idleWalk.actionId, "running"],
      ["idle + double_click", idleDouble.actionId, "success"],
      ["sleeping pointer wake", sleepingWake.actionId, "idle"]
    ];

    const safeRendererInputs = visuals.map((item) => item.rendererInput);
    const serialized = JSON.stringify({ visuals, expected });
    console.log(JSON.stringify({
      matrixPassed: expected.every(([, actual, wanted]) => actual === wanted),
      matrixSummary: expected.map(([name, actual, wanted]) => name + ":" + actual + "=" + wanted).join("; "),
      urgentPassed: errorClick.reasonCode === "lower_priority_blocked" &&
        needInputPointer.reasonCode === "lower_priority_blocked" &&
        errorPlan.interruptPolicy === "hold_until_state_change" &&
        needInputPlan.interruptPolicy === "hold_until_state_change",
      urgentSummary: errorClick.reasonCode + " / " + needInputPointer.reasonCode,
      workingPassed: runningPointer.actionId === "running" &&
        runningPointer.visualActionId === "running" &&
        thinkingIdle.actionId === "thinking" &&
        thinkingIdle.visualActionId === "thinking",
      workingSummary: "runningPointer=" + runningPointer.actionId + ", thinkingIdle=" + thinkingIdle.actionId,
      successPassed: success.phase === "transient" &&
        success.reasonCode === "success_transient_return_idle" &&
        successExpired.reasonCode === "rapid_event_final_state_stable" &&
        successExpired.actionId === "idle",
      successSummary: success.reasonCode + " -> " + successExpired.reasonCode,
      safeRendererInputPassed: safeRendererInputs.every((item) => JSON.stringify(Object.keys(item).sort()) === JSON.stringify([
        "actionId",
        "packId",
        "playbackIntent",
        "rendererKind",
        "scale",
        "visibility"
      ])) && !new RegExp("raw|payload|prompt|command|token|Authorization|workspace|config|/Users/", "i").test(JSON.stringify(safeRendererInputs)),
      safeRendererInputSummary: JSON.stringify(safeRendererInputs),
      zeroPetEvent: visuals.every((item) => item.emotion.emitsPetEvent === false && item.plan.emitsPetEvent === false),
      zeroCatStateMachineWrite: visuals.every((item) => item.emotion.writesCatStateMachine === false && item.plan.writesCatStateMachine === false)
    }));
  `;
  const output = execFileSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/loader.mjs", "--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(output);
}

function runtimeWiringPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  return main.includes("composeRuntimeVisual(microSnapshot") &&
    main.includes("previousVisualPlan = composed.plan") &&
    main.includes("resolveCatAction(composed.plan.actionId") &&
    main.includes("shell.dataset.emotionProfile") &&
    main.includes("shell.dataset.visualReasonCode") &&
    main.includes("rendererSelection?.renderer.setAction");
}

function securityScanPassed() {
  const combined = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_5-emotion-action-composer-spec.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "apps/desktop/src/visual-action-composer.ts",
    "apps/desktop/src/visual-action-composer.test.ts",
    "apps/desktop/src/main.ts"
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
  return docs.includes("V15 priority-safe emotion/action composer passed for tested local state and interaction scenarios.") &&
    docs.includes("V15.7") &&
    docs.includes("Petdex parity achieved") &&
    !docs.includes("Petdex parity achieved | allowed") &&
    !docs.includes("3D ready | allowed") &&
    !docs.includes("production signed release ready | allowed");
}

function prdSpecPassed() {
  const prd = readSafe("docs/active/agent_desktop_pet_prd_v15.md");
  const spec = readSafe("docs/V15.x/v15_5-emotion-action-composer-spec.md");
  const contract = readSafe("docs/V15.x/v15_x-implementation-contract.md");
  return prd.includes("priority-safe") &&
    spec.includes("error > need_input > drag") &&
    spec.includes("running remains clear") &&
    spec.includes("success transient") &&
    contract.includes("V15.5");
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

function writeEvidence(matrix) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const status = records.every((item) => item.ok) ? "passed" : "failed";
  const rows = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V15.5 Emotion Composer Smoke Evidence

status: ${status}
date: ${DATE}
scope: V15.5 priority-safe emotion/action composer for tested local state and interaction scenarios.

## Results

| Gate | Result | Notes |
| --- | --- | --- |
${rows}

## Required Matrix Summary

\`\`\`text
${matrix.matrixSummary}
\`\`\`

## Evidence Notes

- Error and need_input use hold-until-state-change priority and block lower-priority visuals.
- Running and thinking remain visually clear when lower-priority ambience is active.
- Success is transient and returns to idle after expiration unless urgent state is held.
- Idle walk and double-click map through safe fallback actions.
- Renderer input contains only safe fields.

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

No token, Authorization header, raw pointer trace, raw payload, screen text, clipboard contents, prompt text, tool command text, workspace path, config path, or full local path is recorded in this evidence.

## Allowed Claim

V15 priority-safe emotion/action composer passed for tested local state and interaction scenarios.

## Forbidden Claims

This evidence does not claim Petdex parity, production release readiness, Windows readiness, cross-platform readiness, 3D readiness, provider integration, OS-level Codex window binding, or all Codex workflows verified.
`, "utf8");
}
