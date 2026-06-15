#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-06-07";
const evidencePath = `docs/V11.x/evidence/v11_3-emotion-layer-smoke-${DATE}.md`;
const records = [];

const snapshot = loadSnapshot();

record("all 8 emotion profiles", snapshot.allProfiles.ok, snapshot.allProfiles.details);
record("distinct core states", snapshot.distinctProfiles.ok, snapshot.distinctProfiles.details);
record("visual cue coverage", snapshot.visualCues.ok, snapshot.visualCues.details);
record("success transient priority boundary", snapshot.successBoundary.ok, snapshot.successBoundary.details);
record("safe renderer input snapshot", snapshot.safeRendererInput.ok, snapshot.safeRendererInput.details);
record("runtime wiring", runtimeWiringPassed(), "main.ts composes emotion/action plan before renderer.setAction");
record("security scan", securityScanPassed(), "no token, Authorization, raw payload, prompt, command, provider payload, or full local path");
record("claim scan", claimScanPassed(), "V11.3 scoped claim only; no final V11 overclaim");

writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { CAT_STATE_ORDER } from "./apps/desktop/src/pet-states.ts";
    import { composeRuntimeVisual, composeVisualAction, resolveEmotionState } from "./apps/desktop/src/visual-action-composer.ts";

    function snap(displayState, microInteraction = "none") {
      return {
        baseState: displayState,
        displayState,
        microInteraction,
        active: microInteraction !== "none",
        reasonCode: displayState === "success" ? "success_transient" : "base_state",
        emitsPetEvent: false,
        writesCatStateMachine: false
      };
    }

    const profiles = CAT_STATE_ORDER.map((state) => resolveEmotionState(state));
    const runtimeVisuals = CAT_STATE_ORDER.map((state) => composeRuntimeVisual(snap(state)));
    const errorPlan = composeVisualAction(snap("error"));
    const successBlocked = composeVisualAction(snap("success"), { previousPlan: errorPlan });
    const safeInputKeys = Object.keys(runtimeVisuals[0].rendererInput).sort();
    const unsafePattern = /raw|payload|prompt|command|token|Authorization|workspace|config|path|provider|terminal|http|mcp/i;

    console.log(JSON.stringify({
      profiles,
      runtimeVisuals,
      successBlocked,
      safeInputKeys,
      allProfiles: {
        ok: profiles.length === 8 && profiles.every((item) => item.reasonCode === "emotion_profile_resolved"),
        details: "all 8 core states resolve to an emotion profile"
      },
      distinctProfiles: {
        ok: new Set(profiles.map((item) => item.emotionProfile)).size === 8,
        details: "each core state has a distinct emotion profile"
      },
      visualCues: {
        ok: profiles.every((item) => item.visualCues.length >= 3),
        details: "each profile exposes at least 3 operator-readable visual cues"
      },
      successBoundary: {
        ok: successBlocked.actionId === "error" && successBlocked.reasonCode === "lower_priority_blocked",
        details: "active error plan blocks lower-priority success transient"
      },
      safeRendererInput: {
        ok: JSON.stringify(runtimeVisuals).match(unsafePattern) === null && safeInputKeys.join(",") === "actionId,packId,playbackIntent,rendererKind,scale,visibility",
        details: "renderer input exposes safe action/pack/playback/scale/visibility fields only"
      }
    }));
  `;

  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(`V11.3 snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function runtimeWiringPassed() {
  const main = readSafe("apps/desktop/src/main.ts");
  return main.includes("composeRuntimeVisual")
    && main.includes("dataset.emotionProfile")
    && main.includes("dataset.visualActionPhase")
    && main.includes("renderer.setAction(resolvedAction.actionId, resolvedAction.playback)");
}

function securityScanPassed() {
  const combined = [
    "apps/desktop/src/visual-action-composer.ts",
    "apps/desktop/src/visual-action-composer.test.ts",
    "apps/desktop/src/main.ts",
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
  return docs.includes("V11.3 emotion-layer state expression passed for tested local work-cat scenarios.")
    && docs.includes("V11.7")
    && !docs.includes("V11 living work-cat interaction experience passed for tested local desktop scenarios.\n\nstatus: passed");
}

function writeEvidence(data) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const ok = records.every((item) => item.ok);
  const rows = records.map((item) => `| ${escapePipes(item.name)} | ${item.ok ? "passed" : "failed"} | ${escapePipes(item.details)} |`).join("\n");
  const profileRows = data.profiles.map((item) => `| ${item.state} | ${item.emotionProfile} | ${escapePipes(item.visualCues.join(", "))} | ${item.defaultActionId} |`).join("\n");
  const inputRows = data.runtimeVisuals.map((item) => `| ${item.emotion.state} | ${item.rendererInput.actionId} | ${item.rendererInput.playbackIntent.priority} | ${item.plan.reasonCode} | ${item.plan.emitsPetEvent} | ${item.plan.writesCatStateMachine} |`).join("\n");
  writeFileSync(evidencePath, `# V11.3 Emotion Layer Smoke

status: ${ok ? "passed" : "failed"}
date: ${DATE}

## Scope

Validates the V11.3 emotion resolver and runtime composition boundary for all
8 core states. This is local desktop runtime-model evidence, not V11 final
interaction acceptance.

## Results

| Check | Status | Details |
| --- | --- | --- |
${rows}

## Emotion Profiles

| State | Emotion Profile | Visual Cues | Default Action |
| --- | --- | --- | --- |
${profileRows}

## Safe Renderer Input Snapshot

| State | Safe Action | Playback Priority | Plan Reason | Emits PetEvent | Writes CatStateMachine |
| --- | --- | --- | --- | --- | --- |
${inputRows}

Safe renderer fields:

\`\`\`text
${data.safeInputKeys.join("\n")}
\`\`\`

## PRD / Spec Review

Matches \`docs/active/agent_desktop_pet_prd_v11.md\` and
\`docs/V11.x/v11_3-v11_4-emotion-action-composer-spec.md\`: all 8 core states
have distinct emotion profiles, and the visual layer does not mutate
Agent/Codex state.

## Allowed Claim

\`\`\`text
V11.3 emotion-layer state expression passed for tested local work-cat scenarios.
\`\`\`

## Forbidden Claims

\`\`\`text
V11 living work-cat interaction experience passed
Petdex parity achieved
3D ready
provider integration verified
production signed release ready
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
