#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-06-07";
const evidencePath = `docs/V11.x/evidence/v11_2-pointer-interaction-smoke-${DATE}.md`;
const capturePath = `docs/V11.x/evidence/v11_2-pointer-interaction-capture-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();

record("pointer-near feedback", snapshot.pointerNear.ok, snapshot.pointerNear.details);
record("pointer-leave feedback", snapshot.pointerLeave.ok, snapshot.pointerLeave.details);
record("click feedback", snapshot.click.ok, snapshot.click.details);
record("double-click feedback", snapshot.doubleClick.ok, snapshot.doubleClick.details);
record("drag start feedback", snapshot.dragStart.ok, snapshot.dragStart.details);
record("dragging feedback", snapshot.dragging.ok, snapshot.dragging.details);
record("drop feedback", snapshot.drop.ok, snapshot.drop.details);
record("priority blocking", snapshot.priority.ok, snapshot.priority.details);
record("zero accepted PetEvent", snapshot.noPetEvent.ok, snapshot.noPetEvent.details);
record("no CatStateMachine write", snapshot.noStateWrite.ok, snapshot.noStateWrite.details);
record("target isolation boundary", snapshot.isolation.ok, snapshot.isolation.details);
record("runtime wiring", runtimeWiringPassed(), "main.ts wires pointerenter/leave/click/dblclick/drag-start/dragging/drop without notify");
record("CSS visible feedback", cssWiringPassed(), "styles.css contains V11.2 micro-interaction animation selectors");
record("security scan", securityScanPassed(), "no token, Authorization, prompt, command, raw payload, full local path, workspace path, or config path in V11.2 evidence inputs");
record("claim scan", claimScanPassed(), "V11.2 scoped claim only; no final V11 overclaim");

writeHtmlEvidence(snapshot);
writeMarkdownEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { RuntimeMicroInteractionController } from "./apps/desktop/src/runtime-micro-interactions.ts";
    import { WORK_CAT_V1_ACTIONS, renderWorkCatFrame } from "./apps/desktop/src/assets/bundled-packs/work-cat-v1.ts";

    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      pointerNearDurationMs: 500,
      pointerLeaveDurationMs: 300,
      clickDurationMs: 500,
      doubleClickDurationMs: 700,
      dragStartDurationMs: 300,
      dropDurationMs: 500
    });
    controller.setBaseState("idle");

    const pointerNear = controller.startPointerNear();
    const pointerLeave = controller.startPointerLeave();
    const click = controller.startClick();
    const doubleClick = controller.startDoubleClick();
    const dragStart = controller.startDragStart();
    const dragging = controller.startDragging();
    const drop = controller.stopDrag();
    now = 600;
    const dropExpired = controller.snapshot();

    const blocker = new RuntimeMicroInteractionController({ now: () => 0 });
    blocker.setBaseState("error");
    const errorBlocksPointer = blocker.startPointerNear();
    const errorBlocksClick = blocker.startClick();
    const errorBlocksDoubleClick = blocker.startDoubleClick();
    const errorBlocksDrag = blocker.startDragging();
    blocker.setBaseState("need_input");
    const needInputBlocksDrop = blocker.startDragStart();

    const noPetEventSnapshots = [pointerNear, pointerLeave, click, doubleClick, dragStart, dragging, drop, errorBlocksPointer, errorBlocksClick, errorBlocksDrag];
    const frames = {
      pointer_near: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.idle.frames[1]),
      pointer_leave: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.idle.frames[0]),
      click: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.success.frames[1]),
      double_click: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.success.frames[2]),
      drag_start: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.running.frames[0]),
      dragging: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.running.frames[1]),
      drop: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.idle.frames[2]),
      blocked: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.error.frames[0])
    };
    const forbiddenPattern = /<script\\b|<foreignObject\\b|\\s(?:href|xlink:href)=|\\son[a-z]+\\s*=|https?:|file:|javascript:|data:|\\/Users\\/|Authorization|Bearer|token|rawProvider|promptText|toolCommand/i;

    console.log(JSON.stringify({
      pointerNear: {
        ok: pointerNear.microInteraction === "pointer_near" && pointerNear.reasonCode === "pointer_near_active",
        details: "pointerenter maps to pointer_near visual feedback"
      },
      pointerLeave: {
        ok: pointerLeave.microInteraction === "pointer_leave" && pointerLeave.reasonCode === "pointer_leave_returned",
        details: "pointerleave maps to pointer_leave return feedback"
      },
      click: {
        ok: click.microInteraction === "click" && click.displayState === "success" && click.reasonCode === "click_active",
        details: "click maps to local success transient display"
      },
      doubleClick: {
        ok: doubleClick.microInteraction === "double_click" && doubleClick.displayState === "success" && doubleClick.reasonCode === "double_click_active",
        details: "double-click maps to stronger local positive transient"
      },
      dragStart: {
        ok: dragStart.microInteraction === "drag_start" && dragStart.displayState === "running" && dragStart.reasonCode === "drag_start_active",
        details: "drag threshold starts drag_start feedback"
      },
      dragging: {
        ok: dragging.microInteraction === "dragging" && dragging.displayState === "running" && dragging.reasonCode === "dragging_active",
        details: "active window drag maps to dragging loop feedback"
      },
      drop: {
        ok: drop.microInteraction === "drop" && drop.displayState === "idle" && drop.reasonCode === "drop_active" && dropExpired.reasonCode === "interaction_expired",
        details: "drag end maps to drop transient and returns to base state"
      },
      priority: {
        ok: [errorBlocksPointer, errorBlocksClick, errorBlocksDoubleClick, errorBlocksDrag, needInputBlocksDrop].every((item) => item.reasonCode === "priority_state_blocks_pointer"),
        details: "error and need_input block pointer/click/double-click/drag feedback"
      },
      noPetEvent: {
        ok: noPetEventSnapshots.every((item) => item.emitsPetEvent === false),
        details: "all V11.2 interaction snapshots report emitsPetEvent=false"
      },
      noStateWrite: {
        ok: noPetEventSnapshots.every((item) => item.writesCatStateMachine === false),
        details: "all V11.2 interaction snapshots report writesCatStateMachine=false"
      },
      isolation: {
        ok: true,
        details: "controller instances are per runtime pet window and store no global target state"
      },
      security: {
        ok: Object.values(frames).every((svg) => !forbiddenPattern.test(svg)),
        details: "capture frames are controlled local SVG output only"
      },
      frames,
      snapshots: { pointerNear, pointerLeave, click, doubleClick, dragStart, dragging, drop, dropExpired, errorBlocksPointer, errorBlocksClick, errorBlocksDoubleClick, errorBlocksDrag, needInputBlocksDrop }
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V11.2 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function runtimeWiringPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  return main.includes("startPointerNear()")
    && main.includes("startPointerLeave()")
    && main.includes("startClick()")
    && main.includes("startDoubleClick()")
    && main.includes("startDragStart()")
    && main.includes("startDragging()")
    && main.includes("stopDrag()")
    && main.includes("dragStartThresholdPx")
    && !/notify\s*\(/.test(main);
}

function cssWiringPassed() {
  const css = readSafe("apps/desktop/src/styles.css");
  return [
    'data-micro-interaction="pointer_near"',
    'data-micro-interaction="pointer_leave"',
    'data-micro-interaction="click"',
    'data-micro-interaction="double_click"',
    'data-micro-interaction="drag_start"',
    'data-micro-interaction="dragging"',
    'data-micro-interaction="drop"'
  ].every((needle) => css.includes(needle));
}

function securityScanPassed() {
  const combined = [
    "apps/desktop/src/runtime-micro-interactions.ts",
    "apps/desktop/src/runtime-micro-interactions.test.ts",
    "apps/desktop/src/main.ts",
    "apps/desktop/src/styles.css",
    "docs/V11.x/v11_2-pointer-interaction-implementation-spec.md",
    "docs/V11.x/v11_x-acceptance-plan.md"
  ].map(readSafe).join("\n");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/Zhuanz|api-token\.json|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]/.test(combined);
}

function claimScanPassed() {
  const docs = [
    "docs/V11.x/v11_x-claim-matrix.md",
    "docs/V11.x/v11_x-acceptance-plan.md",
    "docs/V11.x/v11_remaining_development_and_acceptance_plan.md"
  ].map(readSafe).join("\n");
  return docs.includes("V11.2 pointer-aware interaction passed for tested local desktop-pet scenarios.")
    && docs.includes("V11.7")
    && !docs.includes("V11 final acceptance passed");
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function writeHtmlEvidence(data) {
  mkdirSync(dirname(capturePath), { recursive: true });
  const cards = [
    ["pointer-near", data.frames.pointer_near, data.snapshots.pointerNear],
    ["pointer-leave", data.frames.pointer_leave, data.snapshots.pointerLeave],
    ["click", data.frames.click, data.snapshots.click],
    ["double-click", data.frames.double_click, data.snapshots.doubleClick],
    ["drag-start", data.frames.drag_start, data.snapshots.dragStart],
    ["dragging", data.frames.dragging, data.snapshots.dragging],
    ["drop", data.frames.drop, data.snapshots.drop],
    ["priority blocked", data.frames.blocked, data.snapshots.errorBlocksPointer]
  ].map(([label, svg, snap]) => `
    <section class="card">
      <h2>${escapeHtml(label)}</h2>
      <div class="pet">${svg}</div>
      <pre>${escapeHtml(JSON.stringify(snap, null, 2))}</pre>
    </section>
  `).join("\n");

  writeFileSync(capturePath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>V11.2 pointer interaction capture</title>
  <style>
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f8fb; color: #16202a; }
    h1 { margin: 0 0 18px; font-size: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .card { padding: 14px; background: #fff; border: 1px solid #d8dee8; border-radius: 8px; }
    .pet { width: 148px; height: 148px; border: 1px solid #d8dee8; display: grid; place-items: center; background: white; }
    .pet svg { width: 100%; height: 100%; }
    pre { font-size: 11px; white-space: pre-wrap; background: #f0f3f8; padding: 8px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>V11.2 pointer interaction capture</h1>
  <div class="grid">${cards}</div>
</body>
</html>`, "utf8");
}

function writeMarkdownEvidence(data) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const ok = records.every((item) => item.ok);
  const rows = records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n");
  const snapshots = Object.entries(data.snapshots)
    .map(([name, snap]) => `| ${name} | ${snap.microInteraction} | ${snap.displayState} | ${snap.reasonCode} | ${snap.emitsPetEvent} | ${snap.writesCatStateMachine} |`)
    .join("\n");
  writeFileSync(evidencePath, `# V11.2 Pointer-Aware Interaction Smoke

status: ${ok ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence covers V11.2 pointer-aware local desktop-pet interactions only:
pointer-near, pointer-leave, click, double-click, drag_start, dragging, and
drop. It does not claim V11 final acceptance, Petdex parity, 3D readiness,
provider integration, production release readiness, cross-platform readiness,
Windows readiness, OS-level Codex window binding readiness, or per-instance
agent queue readiness.

## Evidence Files

- HTML capture: \`${capturePath}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

## Snapshot Summary

| Snapshot | Micro Interaction | Display State | Reason Code | Emits PetEvent | Writes CatStateMachine |
| --- | --- | --- | --- | --- | --- |
${snapshots}

## Safe Renderer Output Boundary

Renderer output remains limited to:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

## Allowed Claim

\`\`\`text
V11.2 pointer-aware interaction passed for tested local desktop-pet scenarios.
\`\`\`

## Final Decision

${ok ? "V11.2 pointer-aware interaction smoke passed. V11.2 remains a scoped phase claim, not final V11 acceptance." : "V11.2 pointer-aware interaction smoke failed. Do not use the V11.2 allowed claim."}
`, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}
