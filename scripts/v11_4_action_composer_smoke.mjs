#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-06-07";
const evidencePath = `docs/V11.x/evidence/v11_4-action-composer-smoke-${DATE}.md`;
const records = [];

const snapshot = loadSnapshot();

record("priority order", snapshot.priorityOrder.ok, snapshot.priorityOrder.details);
record("error hold", snapshot.errorHold.ok, snapshot.errorHold.details);
record("need_input hold", snapshot.needInputHold.ok, snapshot.needInputHold.details);
record("success transient", snapshot.successTransient.ok, snapshot.successTransient.details);
record("rapid event final state", snapshot.rapidFinal.ok, snapshot.rapidFinal.details);
record("micro-interaction safe fallback", snapshot.microFallbacks.ok, snapshot.microFallbacks.details);
record("zero PetEvent and state write", snapshot.zeroMutation.ok, snapshot.zeroMutation.details);
record("runtime wiring", runtimeWiringPassed(), "main.ts stores visual action datasets and uses safe action for renderer");
record("security scan", securityScanPassed(), "composer/evidence inputs contain no sensitive fields");
record("claim scan", claimScanPassed(), "V11.4 scoped claim only; no final V11 overclaim");

writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { composeVisualAction } from "./apps/desktop/src/visual-action-composer.ts";

    function snap(displayState, microInteraction = "none", reasonCode) {
      return {
        baseState: displayState,
        displayState,
        microInteraction,
        active: microInteraction !== "none",
        reasonCode: reasonCode ?? (displayState === "success" ? "success_transient" : "base_state"),
        emitsPetEvent: false,
        writesCatStateMachine: false
      };
    }

    const thinking = composeVisualAction(snap("thinking"));
    const running = composeVisualAction(snap("running"), { previousPlan: thinking });
    const success = composeVisualAction(snap("success"), { previousPlan: running });
    const error = composeVisualAction(snap("error"), { previousPlan: success });
    const blockedClick = composeVisualAction(snap("idle", "click"), { previousPlan: error });
    const needInput = composeVisualAction(snap("need_input"), { previousPlan: running });
    const blockedSuccess = composeVisualAction(snap("success"), { previousPlan: needInput });
    const expired = composeVisualAction(snap("idle", "none", "interaction_expired"), { previousPlan: running });
    const pointer = composeVisualAction(snap("idle", "pointer_near"));
    const dragStart = composeVisualAction(snap("idle", "drag_start"));
    const dragging = composeVisualAction(snap("idle", "dragging"));
    const drop = composeVisualAction(snap("idle", "drop"));
    const plans = { thinking, running, success, error, blockedClick, needInput, blockedSuccess, expired, pointer, dragStart, dragging, drop };

    console.log(JSON.stringify({
      plans,
      priorityOrder: {
        ok: error.priority > needInput.priority && needInput.priority > dragStart.priority && dragStart.priority > success.priority && success.priority > running.priority && running.priority > thinking.priority && thinking.priority > pointer.priority,
        details: "composer follows documented visual priority order"
      },
      errorHold: {
        ok: error.interruptPolicy === "hold_until_state_change" && blockedClick.actionId === "error" && blockedClick.reasonCode === "lower_priority_blocked",
        details: "error holds until safe state changes"
      },
      needInputHold: {
        ok: needInput.interruptPolicy === "hold_until_state_change" && blockedSuccess.actionId === "need_input" && blockedSuccess.reasonCode === "lower_priority_blocked",
        details: "need_input holds and blocks success transient"
      },
      successTransient: {
        ok: success.actionId === "success" && success.phase === "transient" && success.reasonCode === "priority_interrupt_applied",
        details: "success is composed as transient visual feedback"
      },
      rapidFinal: {
        ok: expired.actionId === "idle" && expired.reasonCode === "rapid_event_final_state_stable",
        details: "rapid event expiry returns to deterministic idle visual action"
      },
      microFallbacks: {
        ok: pointer.actionId === "idle" && dragStart.actionId === "running" && dragging.actionId === "running" && drop.actionId === "idle",
        details: "micro-interactions are mapped to safe core action IDs only"
      },
      zeroMutation: {
        ok: Object.values(plans).every((item) => item.emitsPetEvent === false && item.writesCatStateMachine === false),
        details: "all action plans report visual-only zero mutation"
      }
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V11.4 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function runtimeWiringPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  return main.includes("previousVisualPlan")
    && main.includes("dataset.visualActionId")
    && main.includes("dataset.visualReasonCode")
    && main.includes("composeRuntimeVisual");
}

function securityScanPassed() {
  const combined = [
    "apps/desktop/src/visual-action-composer.ts",
    "apps/desktop/src/visual-action-composer.test.ts",
    "docs/V11.x/v11_3-v11_4-emotion-action-composer-spec.md"
  ].map(readSafe).join("\n");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/Zhuanz|api-token\.json|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]|providerPayload\s*[:=]/.test(combined);
}

function claimScanPassed() {
  const docs = [
    "docs/V11.x/v11_x-claim-matrix.md",
    "docs/V11.x/v11_x-acceptance-plan.md",
    "docs/V11.x/v11_remaining_development_and_acceptance_plan.md"
  ].map(readSafe).join("\n");
  return docs.includes("V11.4 visual action composer passed for tested local priority and transition scenarios.")
    && docs.includes("V11.7")
    && !docs.includes("Petdex parity achieved\n\nstatus: passed");
}

function writeEvidence(data) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const ok = records.every((item) => item.ok);
  const rows = records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n");
  const planRows = Object.entries(data.plans)
    .map(([name, plan]) => `| ${name} | ${plan.visualActionId} | ${plan.actionId} | ${plan.phase} | ${plan.priority} | ${plan.interruptPolicy} | ${plan.reasonCode} |`)
    .join("\n");

  writeFileSync(evidencePath, `# V11.4 Action Composer Smoke

status: ${ok ? "passed" : "failed"}
date: ${DATE}

## Scope

Validates the visual-only ActionComposer priority and transition model. This is
not an Agent queue and does not imply per-instance queue readiness.

## Results

| Check | Status | Details |
| --- | --- | --- |
${rows}

## Visual Action Plan Table

| Case | Visual Action | Safe Renderer Action | Phase | Priority | Interrupt Policy | Reason |
| --- | --- | --- | --- | --- | --- | --- |
${planRows}

## PRD / Spec Review

Matches the V11 PRD and \`v11_3-v11_4-emotion-action-composer-spec.md\`:
higher-priority visual states hold, lower-priority micro-interactions are
blocked, and rapid-event expiry returns to a deterministic safe visual state.

## Allowed Claim

\`\`\`text
V11.4 visual action composer passed for tested local priority and transition scenarios.
\`\`\`

## Forbidden Claims

\`\`\`text
per-instance queue ready
all Codex workflows verified
Petdex parity achieved
V11 living work-cat interaction experience passed
\`\`\`
`, "utf8");
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function escapePipes(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}
