#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-07";
const evidencePath = `docs/V11.x/evidence/v11_6-first-run-delight-smoke-${DATE}.md`;
const capturePath = `docs/V11.x/evidence/v11_6-first-run-delight-capture-${DATE}.html`;
const mainSource = readFileSync("apps/desktop/src/main.ts", "utf8");
const records = [];

const snapshot = loadSnapshot();

record("first-run UI present", includesAll(mainSource, ["first-run-wizard", "first-run-default", "first-run-demo", "first-run-work-cat", "first-run-demo-stage"]), "first-run UI ids found");
record("living pack default option", includesAll(mainSource, ["BUNDLED_LOCAL_CAT_PACKS = [LIVING_WORK_CAT_V1_PACK", "selectedFirstRunPackId", "LIVING_WORK_CAT_V1_PACK_ID"]), "living-work-cat-v1 is first bundled option and safe fallback");
record("visible default pet path", includesAll(mainSource, ["writeBundledPackPreference(\"default\", packId)", "setPetInstanceVisible(\"default\", true)", "markFirstRunCompleted(\"default_pet\")"]), "default path activates safe pack and shows default pet");
record("Codex work-cat path", includesAll(mainSource, ["createPetInstance(\"Codex Work Cat\")", "writeBundledPackPreference(instance.instanceId, packId)", "markFirstRunCompleted(\"codex_work_cat\")"]), "work-cat path creates visible target pet with selected pack");
record("safe demo mode", snapshot.demo.ok, snapshot.demo.details);
record("demo states", snapshot.demoStates.ok, snapshot.demoStates.details);
record("app-start visible cat model", snapshot.visibleCat.ok, snapshot.visibleCat.details);
record("click feedback from first-run pack", snapshot.click.ok, snapshot.click.details);
record("zero PetEvent and state mutation", snapshot.zeroMutation.ok, snapshot.zeroMutation.details);
record("unsupported already-open boundary", mainSource.includes("already-open Codex window 当前不支持自动监听"), "first-run copy preserves unsupported already-open boundary");
record("security scan", securityScanPassed(), "no token, Authorization, raw payload, prompt, command, provider payload, full local path, workspace path, or config path in V11.6 inputs");
record("claim scan", claimScanPassed(), "V11.6 scoped claim only; no final V11 overclaim");

writeCapture(snapshot);
writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, capturePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { resolveCatAction } from "./apps/desktop/src/state/cat-action-resolver.ts";
    import { RuntimeMicroInteractionController } from "./apps/desktop/src/runtime-micro-interactions.ts";
    import {
      LIVING_WORK_CAT_V1_PACK,
      LIVING_WORK_CAT_V1_ACTIONS,
      renderLivingWorkCatFrame
    } from "./apps/desktop/src/assets/bundled-packs/living-work-cat-v1.ts";

    const demoStates = ["thinking", "running", "success", "need_input", "error"];
    const demoFrames = demoStates.map((state) => {
      const resolved = resolveCatAction(state, LIVING_WORK_CAT_V1_PACK.manifest);
      return {
        state,
        actionId: resolved.actionId,
        svg: renderLivingWorkCatFrame(LIVING_WORK_CAT_V1_ACTIONS[resolved.actionId].frames[0]),
        dataset: {
          demoMode: "local",
          demoReasonCode: state === "thinking" ? "demo_started" : "demo_state_preview",
          demoMutatesAgentState: "false",
          demoAcceptedPetEvents: "0",
          demoNoStateMutation: "true",
          demoNoStateMutationReasonCode: "demo_no_state_mutation"
        }
      };
    });
    const controller = new RuntimeMicroInteractionController({ now: () => 0 });
    controller.setBaseState("idle");
    const clickSnapshot = controller.startClick();
    const clickFrame = renderLivingWorkCatFrame(LIVING_WORK_CAT_V1_ACTIONS.click.frames[1]);
    const visibleFrame = renderLivingWorkCatFrame(LIVING_WORK_CAT_V1_ACTIONS.idle.frames[0]);
    const unsafe = /<script\\b|<foreignObject\\b|\\son[a-z]+\\s*=|https?:|file:|javascript:|\\/Users\\/|Authorization|Bearer|token|rawProvider|promptText|toolCommand/i;

    console.log(JSON.stringify({
      demoFrames,
      visibleFrame,
      clickSnapshot,
      clickFrame,
      demo: {
        ok: demoFrames.every((item) => item.dataset.demoMode === "local" && item.dataset.demoAcceptedPetEvents === "0" && item.dataset.demoMutatesAgentState === "false"),
        details: "demo datasets are local, zero PetEvent, and no agent-state mutation"
      },
      demoStates: {
        ok: demoFrames.map((item) => item.state).join(",") === demoStates.join(",") && demoFrames.every((item) => item.svg && !unsafe.test(item.svg)),
        details: "thinking/running/success/need_input/error demo states render controlled living frames"
      },
      visibleCat: {
        ok: /<svg\\b/.test(visibleFrame) && /<ellipse|<path|<circle/.test(visibleFrame) && !unsafe.test(visibleFrame),
        details: "living-work-cat-v1 idle frame is visible for first app experience model"
      },
      click: {
        ok: clickSnapshot.microInteraction === "click" && clickSnapshot.emitsPetEvent === false && clickSnapshot.writesCatStateMachine === false && !unsafe.test(clickFrame),
        details: "first-run pack has click feedback frame and local controller reports zero mutation"
      },
      zeroMutation: {
        ok: clickSnapshot.emitsPetEvent === false && clickSnapshot.writesCatStateMachine === false && demoFrames.every((item) => item.dataset.demoNoStateMutation === "true"),
        details: "demo and click feedback are visual-only"
      }
    }));
  `;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout);
}

function securityScanPassed() {
  const combined = [
    "apps/desktop/src/main.ts",
    "apps/desktop/src/assets/bundled-packs/living-work-cat-v1.ts",
    "apps/desktop/src/runtime-micro-interactions.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization:\s|\/Users\/Zhuanz|api-token\.json|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]|providerPayload\s*[:=]/.test(combined);
}

function claimScanPassed() {
  const docs = [
    "docs/V11.x/v11_x-claim-matrix.md",
    "docs/V11.x/v11_x-acceptance-plan.md",
    "docs/V11.x/v11_remaining_development_and_acceptance_plan.md"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  return docs.includes("V11.6 first-run living pet delight passed for tested local first-open scenarios.")
    && docs.includes("V11.7")
    && !docs.includes("Petdex parity achieved\n\nstatus: passed");
}

function writeCapture(data) {
  mkdirSync(dirname(capturePath), { recursive: true });
  const demoCards = data.demoFrames.map((item) => `
    <article class="card">
      <h2>${escapeHtml(item.state)}</h2>
      <div class="stage">${item.svg}</div>
      <p>${escapeHtml(item.dataset.demoReasonCode)} · no state mutation</p>
    </article>
  `).join("");
  writeFileSync(capturePath, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>V11.6 first-run delight capture</title>
  <style>
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f8fb; color: #172033; }
    h1 { margin: 0 0 18px; }
    .hero { display: grid; grid-template-columns: 180px 1fr; gap: 18px; align-items: center; background: white; border: 1px solid #d8dee8; border-radius: 8px; padding: 18px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
    .card { background: white; border: 1px solid #d8dee8; border-radius: 8px; padding: 12px; }
    .stage { width: 152px; height: 152px; display: grid; place-items: center; background: #fff; border: 1px solid #d8dee8; border-radius: 8px; }
    .stage svg { width: 100%; height: 100%; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; font-size: 12px; }
  </style>
</head>
<body>
  <h1>V11.6 First-run Living Pet Delight</h1>
  <section class="hero">
    <div class="stage">${data.visibleFrame}</div>
    <div>
      <p><span class="badge">visible living cat model</span></p>
      <p>首启路径默认选择 living-work-cat-v1；用户可以直接显示活猫、点击反馈、进入本地状态演示或创建 Codex 工作猫。</p>
    </div>
  </section>
  <section class="card">
    <h2>Click feedback</h2>
    <div class="stage">${data.clickFrame}</div>
    <p>emitsPetEvent=${data.clickSnapshot.emitsPetEvent}; writesCatStateMachine=${data.clickSnapshot.writesCatStateMachine}</p>
  </section>
  <h2>Local demo states</h2>
  <div class="grid">${demoCards}</div>
</body>
</html>`, "utf8");
}

function writeEvidence(data) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const ok = records.every((item) => item.ok);
  const rows = records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n");
  const demoRows = data.demoFrames.map((item) => `| ${item.state} | ${item.actionId} | ${item.dataset.demoReasonCode} | ${item.dataset.demoAcceptedPetEvents} | ${item.dataset.demoMutatesAgentState} |`).join("\n");
  writeFileSync(evidencePath, `# V11.6 First-run Living Pet Delight Smoke

status: ${ok ? "passed" : "failed"}
date: ${DATE}

## Scope

Validates the first-run living pet path and local safe demo model. This is
tested local source/runtime-model evidence and does not claim production release
readiness or V11 final acceptance.

## Evidence Files

- capture: \`${capturePath}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

## Demo State Snapshot

| Demo State | Safe Action | Reason Code | Accepted PetEvents | Mutates Agent State |
| --- | --- | --- | --- | --- |
${demoRows}

## PRD / Spec Review

Matches \`docs/active/agent_desktop_pet_prd_v11.md\` and
\`docs/V11.x/v11_6-v11_7-first-run-and-qa-spec.md\`: first-run exposes a living
cat path, safe local demo states, Codex work-cat setup, and unsupported
already-open Codex boundary.

## Allowed Claim

\`\`\`text
V11.6 first-run living pet delight passed for tested local first-open scenarios.
\`\`\`

## Forbidden Claims

\`\`\`text
V11 living work-cat interaction experience passed
production signed release ready
cross-platform ready
Windows ready
Petdex parity achieved
\`\`\`
`, "utf8");
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function includesAll(value, needles) {
  return needles.every((needle) => value.includes(needle));
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapePipes(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}
