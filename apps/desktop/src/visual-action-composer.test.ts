import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { RuntimeMicroInteractionSnapshot } from "./runtime-micro-interactions";
import { composeRuntimeVisual, composeVisualAction, resolveEmotionState } from "./visual-action-composer";
import { CAT_STATE_ORDER, type CatState } from "./pet-states";

function snapshot(displayState: CatState, microInteraction: RuntimeMicroInteractionSnapshot["microInteraction"] = "none"): RuntimeMicroInteractionSnapshot {
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

describe("V11.3 emotion resolver", () => {
  test("maps all core states to distinct emotion profiles without state mutation", () => {
    const profiles = CAT_STATE_ORDER.map((state) => resolveEmotionState(state));
    assert.equal(new Set(profiles.map((item) => item.emotionProfile)).size, CAT_STATE_ORDER.length);
    assert.deepEqual(profiles.map((item) => item.state), CAT_STATE_ORDER);
    assert.ok(profiles.every((item) => item.reasonCode === "emotion_profile_resolved"));
    assert.ok(profiles.every((item) => item.emitsPetEvent === false));
    assert.ok(profiles.every((item) => item.writesCatStateMachine === false));
    assert.ok(profiles.every((item) => item.visualCues.length >= 3));
  });

  test("produces safe renderer input fields only", () => {
    const visual = composeRuntimeVisual(snapshot("thinking"));
    assert.deepEqual(Object.keys(visual.rendererInput).sort(), [
      "actionId",
      "packId",
      "playbackIntent",
      "rendererKind",
      "scale",
      "visibility"
    ]);
    assert.equal(visual.rendererInput.actionId, "thinking");
    assert.equal(visual.rendererInput.playbackIntent.priority, "base");
    assert.equal(JSON.stringify(visual).includes("raw"), false);
  });
});

describe("V11.4 action composer", () => {
  test("holds error and need_input above lower-priority visual actions", () => {
    const errorPlan = composeVisualAction(snapshot("error"));
    assert.equal(errorPlan.actionId, "error");
    assert.equal(errorPlan.phase, "loop");
    assert.equal(errorPlan.interruptPolicy, "hold_until_state_change");
    assert.equal(errorPlan.reasonCode, "priority_hold_active");

    const lower = composeVisualAction(snapshot("idle", "click"), { previousPlan: errorPlan });
    assert.equal(lower.actionId, "error");
    assert.equal(lower.reasonCode, "lower_priority_blocked");

    const needInputPlan = composeVisualAction(snapshot("need_input"));
    assert.equal(needInputPlan.actionId, "need_input");
    assert.equal(needInputPlan.interruptPolicy, "hold_until_state_change");
  });

  test("treats success and click feedback as transients", () => {
    const success = composeVisualAction(snapshot("success"));
    assert.equal(success.actionId, "success");
    assert.equal(success.phase, "transient");
    assert.equal(success.reasonCode, "success_transient_return_idle");
    assert.equal(success.durationMs, 900);

    const click = composeVisualAction(snapshot("idle", "click"));
    assert.equal(click.actionId, "success");
    assert.equal(click.phase, "transient");
    assert.equal(click.reasonCode, "action_transient_selected");
  });

  test("applies higher-priority interrupts and stable rapid-event final states", () => {
    const thinking = composeVisualAction(snapshot("thinking"));
    const running = composeVisualAction(snapshot("running"), { previousPlan: thinking });
    assert.equal(running.actionId, "running");
    assert.equal(running.reasonCode, "priority_interrupt_applied");

    const expired: RuntimeMicroInteractionSnapshot = {
      ...snapshot("idle"),
      reasonCode: "interaction_expired"
    };
    const final = composeVisualAction(expired, { previousPlan: running });
    assert.equal(final.actionId, "idle");
    assert.equal(final.reasonCode, "rapid_event_final_state_stable");
    assert.equal(final.emitsPetEvent, false);
    assert.equal(final.writesCatStateMachine, false);
  });

  test("maps pointer and drag micro-interactions to safe action fallbacks", () => {
    assert.equal(composeVisualAction(snapshot("idle", "pointer_near")).actionId, "idle");
    assert.equal(composeVisualAction(snapshot("idle", "drag_start")).actionId, "running");
    assert.equal(composeVisualAction(snapshot("idle", "dragging")).actionId, "running");
    assert.equal(composeVisualAction(snapshot("idle", "drop")).actionId, "idle");
  });

  test("keeps working states clear when lower-priority ambience is active", () => {
    const runningPointer = composeVisualAction(snapshot("running", "pointer_near"));
    assert.equal(runningPointer.actionId, "running");
    assert.equal(runningPointer.visualActionId, "running");

    const thinkingIdle = composeVisualAction(snapshot("thinking", "idle_blink"));
    assert.equal(thinkingIdle.actionId, "thinking");
    assert.equal(thinkingIdle.visualActionId, "thinking");
  });
});
