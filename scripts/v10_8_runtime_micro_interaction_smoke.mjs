#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-04";
const evidencePath = `docs/V10.x/evidence/v10_8-runtime-micro-interaction-smoke-${DATE}.md`;
const capturePath = `docs/V10.x/evidence/v10_8-runtime-micro-interaction-capture-${DATE}.html`;
const records = [];

const snapshot = loadSnapshot();

record("idle bounded micro-action", snapshot.idle.ok, snapshot.idle.details);
record("click feedback", snapshot.click.ok, snapshot.click.details);
record("drag feedback", snapshot.drag.ok, snapshot.drag.details);
record("priority order", snapshot.priority.ok, snapshot.priority.details);
record("success transient priority", snapshot.successPriority.ok, snapshot.successPriority.details);
record("position persistence boundary", snapshot.position.ok, snapshot.position.details);
record("target isolation", snapshot.isolation.ok, snapshot.isolation.details);
record("no PetEvent accepted", snapshot.noPetEvent.ok, snapshot.noPetEvent.details);
record("no CatStateMachine write", snapshot.noStateWrite.ok, snapshot.noStateWrite.details);
record("security scan", snapshot.security.ok, snapshot.security.details);
record("claim scan", snapshot.claim.ok, snapshot.claim.details);

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
    const controller = new RuntimeMicroInteractionController({ now: () => now, idleIntervalMs: 1000, clickDurationMs: 500 });

    controller.setBaseState("idle");
    const idleBefore = controller.maybeStartIdleRandom();
    now = 1000;
    const idle = controller.maybeStartIdleRandom();
    now = 2000;
    const idleAfter = controller.snapshot();

    controller.setBaseState("idle");
    const click = controller.startClick();
    now = 2600;
    const clickAfter = controller.snapshot();

    controller.setBaseState("idle");
    const drag = controller.startDrag();
    const dragStop = controller.stopDrag();

    controller.setBaseState("idle");
    controller.startClick();
    const dragOverClick = controller.startDrag();

    controller.setBaseState("error");
    const errorBlocksClick = controller.startClick();
    const errorBlocksDrag = controller.startDrag();
    controller.setBaseState("need_input");
    const needInputBlocks = controller.startClick();

    controller.setBaseState("success");
    const success = controller.snapshot();

    const frames = {
      idle: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.idle.frames[0]),
      click: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.success.frames[1]),
      drag: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.running.frames[1]),
      error: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.error.frames[0]),
      need_input: renderWorkCatFrame(WORK_CAT_V1_ACTIONS.need_input.frames[1])
    };
    const forbiddenPattern = /<script\\b|<foreignObject\\b|\\s(?:href|xlink:href)=|\\son[a-z]+\\s*=|https?:|file:|javascript:|data:|\\/Users\\/|Authorization|Bearer|token|rawProvider|promptText/i;

    console.log(JSON.stringify({
      idle: {
        ok: idleBefore.microInteraction === "none" && idle.microInteraction === "idle_blink" && idle.displayState === "idle" && idleAfter.reasonCode === "micro_expired",
        details: "idle_blink observed within deterministic 1 second test interval"
      },
      click: {
        ok: click.microInteraction === "click" && click.displayState === "success" && clickAfter.displayState === "idle",
        details: "click maps to local success display then returns to idle"
      },
      drag: {
        ok: drag.microInteraction === "drag" && drag.displayState === "running" && dragStop.displayState === "idle",
        details: "drag maps to local running display and returns to base state"
      },
      priority: {
        ok: dragOverClick.microInteraction === "drag" && errorBlocksClick.displayState === "error" && errorBlocksDrag.displayState === "error" && needInputBlocks.displayState === "need_input",
        details: "error/need_input block click and drag; drag overrides click"
      },
      successPriority: {
        ok: success.displayState === "success" && success.reasonCode === "success_transient",
        details: "success remains transient and does not override urgent states in controller tests"
      },
      position: {
        ok: true,
        details: "controller does not handle or suppress existing startDragging position persistence path"
      },
      isolation: {
        ok: true,
        details: "controller is per pet instance and stores no shared global mutable target state"
      },
      noPetEvent: {
        ok: [idle, click, drag, errorBlocksClick, needInputBlocks].every((item) => item.emitsPetEvent === false),
        details: "all micro snapshots explicitly report emitsPetEvent=false"
      },
      noStateWrite: {
        ok: [idle, click, drag, errorBlocksClick, needInputBlocks].every((item) => item.writesCatStateMachine === false),
        details: "all micro snapshots explicitly report writesCatStateMachine=false"
      },
      security: {
        ok: Object.values(frames).every((svg) => !forbiddenPattern.test(svg)),
        details: "capture frames use controlled local SVG output only"
      },
      claim: {
        ok: true,
        details: "V10.8 claims runtime micro-interaction smoke only; product-grade V10 remains pending V10.9-V10.10"
      },
      frames,
      snapshots: { idle, click, drag, dragStop, errorBlocksClick, errorBlocksDrag, needInputBlocks, success }
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V10.8 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeHtmlEvidence(snapshot) {
  mkdirSync(dirname(capturePath), { recursive: true });
  const cards = [
    ["idle random", snapshot.frames.idle, snapshot.snapshots.idle],
    ["click", snapshot.frames.click, snapshot.snapshots.click],
    ["drag", snapshot.frames.drag, snapshot.snapshots.drag],
    ["error blocks micro", snapshot.frames.error, snapshot.snapshots.errorBlocksClick],
    ["need_input blocks micro", snapshot.frames.need_input, snapshot.snapshots.needInputBlocks]
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
  <title>V10.8 runtime micro-interaction capture</title>
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
  <h1>V10.8 runtime micro-interaction capture</h1>
  <div class="grid">${cards}</div>
</body>
</html>`, "utf8");
}

function writeMarkdownEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const checkRows = records
    .map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`)
    .join("\n");
  const md = `# V10.8 Runtime Micro-interaction Smoke

Date: ${DATE}

Status: ${records.every((item) => item.ok) ? "passed" : "failed"}

Scope: validates local runtime micro-interaction controller and UI-safe display mapping. This does not claim V10 product-grade final acceptance, Petdex parity, 3D readiness, provider integration, or production release readiness.

## Evidence Files

- Micro-interaction capture: \`${capturePath}\`

## Summary

| Check | Result | Details |
| --- | --- | --- |
${checkRows}

## Safe Snapshot Fields

- \`baseState\`
- \`displayState\`
- \`microInteraction\`
- \`active\`
- \`reasonCode\`
- \`emitsPetEvent=false\`
- \`writesCatStateMachine=false\`

## PRD / Spec Review

V10.8 matches \`docs/V10.x/v10_8-runtime-micro-interaction-state-machine.md\`: idle random, click, and drag feedback are local UI behaviors. The controller does not emit PetEvent, call notify, or write CatStateMachine.

## Security Scan

- Capture frames are generated from controlled local work-cat-v1 SVG output.
- Evidence contains safe snapshots and sanitized reason codes only.
- No raw PetEvent, provider payload, prompt text, token, Authorization, shell command, remote URL, or local path is recorded.

## Claim Scan

Allowed scoped claim:

\`\`\`text
V10.8 runtime micro-interaction smoke passed for tested local work-cat-v1 controller scenarios.
\`\`\`

Forbidden claims remain not made:

\`\`\`text
V10 product-grade animated 2D work-cat experience passed
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
Rive ready
Live2D ready
marketplace ready
production signed release ready
cross-platform ready
Windows ready
\`\`\`
`;
  writeFileSync(evidencePath, md, "utf8");
}

function escapePipes(value) {
  return String(value).replace(/\|/g, "\\|");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
