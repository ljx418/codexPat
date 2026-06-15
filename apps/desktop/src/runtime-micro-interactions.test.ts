import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  RuntimeMicroInteractionController,
  snapshotToSafeRendererInput,
  V15_INTERACTION_PRIORITY_ORDER,
  V15_REQUIRED_SAFE_ACTION_IDS
} from "./runtime-micro-interactions";

describe("V10.8 runtime micro-interaction controller", () => {
  test("starts deterministic idle random micro-action without mutating agent state", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({ now: () => now, idleIntervalMs: 1000 });
    controller.setBaseState("idle");
    assert.equal(controller.maybeStartIdleRandom().microInteraction, "none");
    now = 1000;
    const snapshot = controller.maybeStartIdleRandom();
    assert.equal(snapshot.microInteraction, "idle_blink");
    assert.equal(snapshot.displayState, "idle");
    assert.equal(snapshot.emitsPetEvent, false);
    assert.equal(snapshot.writesCatStateMachine, false);
  });

  test("click feedback is visible and blocked by urgent states", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({ now: () => now, clickDurationMs: 500 });
    controller.setBaseState("idle");
    assert.equal(controller.startClick().displayState, "success");
    assert.equal(controller.snapshot().reasonCode, "click_active");
    now = 600;
    assert.equal(controller.snapshot().displayState, "idle");

    controller.setBaseState("error");
    const blocked = controller.startClick();
    assert.equal(blocked.displayState, "error");
    assert.equal(blocked.reasonCode, "priority_state_blocks_pointer");
  });

  test("drag overrides click but not urgent priority states", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 0 });
    controller.setBaseState("idle");
    controller.startClick();
    const drag = controller.startDrag();
    assert.equal(drag.microInteraction, "drag");
    assert.equal(drag.displayState, "running");
    controller.setBaseState("error");
    assert.equal(controller.snapshot().displayState, "error");
    assert.equal(controller.snapshot().microInteraction, "none");
    controller.setBaseState("idle");
    controller.startDrag();
    assert.equal(controller.stopDrag().displayState, "idle");

    controller.setBaseState("need_input");
    const blocked = controller.startDrag();
    assert.equal(blocked.displayState, "need_input");
    assert.equal(blocked.reasonCode, "priority_state_blocks_pointer");
  });

  test("success transient cannot override error or need_input", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 0 });
    controller.setBaseState("error");
    assert.equal(controller.snapshot().displayState, "error");
    controller.setBaseState("need_input");
    assert.equal(controller.snapshot().displayState, "need_input");
    controller.setBaseState("success");
    assert.equal(controller.snapshot().displayState, "success");
    assert.equal(controller.snapshot().reasonCode, "success_transient");
  });
});

describe("V11.1 living idle scheduler", () => {
  test("observes at least four distinct idle behaviors in three minutes", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      idleIntervalMs: 1000,
      idleActionDurationMs: 400,
      napThresholdMs: 180000
    });
    controller.setBaseState("idle");

    const observed: string[] = [];
    for (now = 0; now <= 180000; now += 500) {
      const snapshot = controller.maybeStartIdleRandom();
      if (snapshot.active && snapshot.reasonCode === "idle_random_active") {
        observed.push(snapshot.microInteraction);
      }
      controller.snapshot();
    }

    assert.ok(new Set(observed).size >= 4);
  });

  test("does not repeat the same living idle action more than twice in a row", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      idleIntervalMs: 1000,
      idleActionDurationMs: 400,
      napThresholdMs: 180000
    });
    controller.setBaseState("idle");

    const observed: string[] = [];
    for (now = 0; now <= 16000; now += 500) {
      const snapshot = controller.maybeStartIdleRandom();
      if (snapshot.active && snapshot.reasonCode === "idle_random_active") {
        observed.push(snapshot.microInteraction);
      }
      controller.snapshot();
    }

    let runLength = 1;
    for (let index = 1; index < observed.length; index += 1) {
      runLength = observed[index] === observed[index - 1] ? runLength + 1 : 1;
      assert.ok(runLength <= 2);
    }
  });

  test("enters nap after long idle and wakes on pointer near", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      idleIntervalMs: 1000,
      idleActionDurationMs: 400,
      napThresholdMs: 45000,
      pointerNearDurationMs: 500
    });
    controller.setBaseState("idle");

    now = 45000;
    const nap = controller.maybeStartIdleRandom();
    assert.equal(nap.microInteraction, "idle_nap");
    assert.equal(nap.displayState, "sleeping");
    assert.equal(nap.reasonCode, "idle_nap_active");

    const wake = controller.startPointerNear();
    assert.equal(wake.microInteraction, "idle_wake");
    assert.equal(wake.displayState, "idle");
    assert.equal(wake.reasonCode, "idle_wake_active");
    assert.equal(wake.emitsPetEvent, false);
    assert.equal(wake.writesCatStateMachine, false);
  });

  test("priority and active interaction states block living idle", () => {
    let now = 1000;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      idleIntervalMs: 1000,
      idleActionDurationMs: 400
    });

    controller.setBaseState("error");
    assert.equal(controller.maybeStartIdleRandom().reasonCode, "priority_state_blocks_micro");

    controller.setBaseState("need_input");
    assert.equal(controller.maybeStartIdleRandom().reasonCode, "priority_state_blocks_micro");

    controller.setBaseState("idle");
    controller.startClick();
    assert.equal(controller.maybeStartIdleRandom().microInteraction, "click");

    now += 1000;
    controller.snapshot();
    controller.startDrag();
    assert.equal(controller.maybeStartIdleRandom().microInteraction, "drag");
  });

  test("sleeping base state can wake on pointer near", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 0 });
    controller.setBaseState("sleeping");
    const wake = controller.startPointerNear();
    assert.equal(wake.microInteraction, "idle_wake");
    assert.equal(wake.displayState, "idle");
    assert.equal(wake.reasonCode, "idle_wake_active");
  });
});

describe("V11.2 pointer-aware interaction controller", () => {
  test("supports pointer near and pointer leave without mutating agent state", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      pointerNearDurationMs: 500,
      pointerLeaveDurationMs: 300
    });
    controller.setBaseState("idle");

    const near = controller.startPointerNear();
    assert.equal(near.microInteraction, "pointer_near");
    assert.equal(near.reasonCode, "pointer_near_active");
    assert.equal(near.emitsPetEvent, false);
    assert.equal(near.writesCatStateMachine, false);

    const leave = controller.startPointerLeave();
    assert.equal(leave.microInteraction, "pointer_leave");
    assert.equal(leave.reasonCode, "pointer_leave_returned");
    assert.equal(leave.displayState, "idle");

    now = 400;
    assert.equal(controller.snapshot().reasonCode, "micro_expired");
    assert.equal(controller.snapshot().microInteraction, "none");
  });

  test("supports hover dwell feedback without state mutation", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      pointerHoverDurationMs: 500
    });
    controller.setBaseState("idle");

    controller.startPointerNear();
    const hover = controller.startPointerHover();
    assert.equal(hover.microInteraction, "pointer_hover");
    assert.equal(hover.reasonCode, "pointer_hover_active");
    assert.equal(hover.emitsPetEvent, false);
    assert.equal(hover.writesCatStateMachine, false);

    now = 600;
    assert.equal(controller.snapshot().microInteraction, "none");
  });

  test("distinguishes drag start, dragging, release, and land feedback", () => {
    let now = 0;
    const controller = new RuntimeMicroInteractionController({
      now: () => now,
      dragStartDurationMs: 300,
      dropDurationMs: 500
    });
    controller.setBaseState("idle");

    const dragStart = controller.startDragStart();
    assert.equal(dragStart.microInteraction, "drag_start");
    assert.equal(dragStart.displayState, "running");
    assert.equal(dragStart.reasonCode, "drag_start_active");

    const dragging = controller.startDragging();
    assert.equal(dragging.microInteraction, "dragging");
    assert.equal(dragging.displayState, "running");
    assert.equal(dragging.reasonCode, "dragging_active");

    const release = controller.stopDrag();
    assert.equal(release.microInteraction, "drag_release");
    assert.equal(release.displayState, "idle");
    assert.equal(release.reasonCode, "drag_release_active");

    now = 250;
    const land = controller.snapshot();
    assert.equal(land.microInteraction, "drag_land");
    assert.equal(land.displayState, "idle");
    assert.equal(land.reasonCode, "drag_land_active");

    now = 600;
    assert.equal(controller.snapshot().reasonCode, "interaction_expired");
    assert.equal(controller.snapshot().microInteraction, "none");
  });

  test("drag cancels click and urgent states block pointer interactions", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 0 });
    controller.setBaseState("idle");
    controller.startClick();

    const dragging = controller.startDragging();
    assert.equal(dragging.microInteraction, "dragging");
    assert.equal(dragging.reasonCode, "dragging_active");

    controller.setBaseState("error");
    assert.equal(controller.startPointerNear().reasonCode, "priority_state_blocks_pointer");
    assert.equal(controller.startClick().reasonCode, "priority_state_blocks_pointer");
    assert.equal(controller.startDoubleClick().reasonCode, "priority_state_blocks_pointer");
    assert.equal(controller.startDragStart().reasonCode, "priority_state_blocks_pointer");
    assert.equal(controller.startDragging().reasonCode, "priority_state_blocks_pointer");

    controller.setBaseState("need_input");
    assert.equal(controller.startPointerLeave().reasonCode, "priority_state_blocks_pointer");
  });

  test("autonomous walk is bounded to priority-safe visual states", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 0 });
    controller.setBaseState("idle");

    const walk = controller.startAutonomousWalk("walk_right");
    assert.equal(walk.microInteraction, "walk_right");
    assert.equal(walk.displayState, "running");
    assert.equal(walk.reasonCode, "autonomous_walk_active");
    assert.equal(walk.emitsPetEvent, false);
    assert.equal(walk.writesCatStateMachine, false);

    controller.setBaseState("error");
    assert.equal(controller.startAutonomousWalk("walk_left").reasonCode, "autonomous_walk_blocked");

    controller.setBaseState("idle");
    controller.startClick();
    assert.equal(controller.startAutonomousWalk("walk_left").reasonCode, "autonomous_walk_blocked");
  });
});

describe("V15.1 priority-safe interaction model rebaseline", () => {
  test("freezes the V15 priority order and required safe actions", () => {
    assert.deepEqual([...V15_INTERACTION_PRIORITY_ORDER], [
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
    ]);
    assert.ok(V15_REQUIRED_SAFE_ACTION_IDS.includes("drag_grabbed"));
    assert.ok(V15_REQUIRED_SAFE_ACTION_IDS.includes("drag_release"));
    assert.ok(V15_REQUIRED_SAFE_ACTION_IDS.includes("drag_land"));
    assert.ok(V15_REQUIRED_SAFE_ACTION_IDS.includes("pointer_look"));
    assert.ok(V15_REQUIRED_SAFE_ACTION_IDS.includes("click_paw"));
    assert.ok(V15_REQUIRED_SAFE_ACTION_IDS.includes("double_click_jump"));
  });

  test("urgent states block pointer, click, drag, and idle random", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 1000, idleIntervalMs: 1000 });
    controller.setBaseState("error");
    for (const snapshot of [
      controller.startPointerNear(),
      controller.startClick(),
      controller.startDoubleClick(),
      controller.startDragStart(),
      controller.startDragging(),
      controller.maybeStartIdleRandom()
    ]) {
      assert.equal(snapshot.displayState, "error");
      assert.equal(snapshot.emitsPetEvent, false);
      assert.equal(snapshot.writesCatStateMachine, false);
    }

    controller.setBaseState("need_input");
    for (const snapshot of [
      controller.startPointerNear(),
      controller.startClick(),
      controller.startDoubleClick(),
      controller.startDragStart(),
      controller.startDragging(),
      controller.maybeStartIdleRandom()
    ]) {
      assert.equal(snapshot.displayState, "need_input");
      assert.equal(snapshot.emitsPetEvent, false);
      assert.equal(snapshot.writesCatStateMachine, false);
    }
  });

  test("drag blocks lower-priority pointer, click, and idle random", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 1000, idleIntervalMs: 1000 });
    controller.setBaseState("idle");
    const dragging = controller.startDragging();
    assert.equal(dragging.microInteraction, "dragging");
    assert.equal(controller.startPointerNear().microInteraction, "dragging");
    assert.equal(controller.startClick().microInteraction, "dragging");
    assert.equal(controller.startDoubleClick().microInteraction, "dragging");
    assert.equal(controller.maybeStartIdleRandom().microInteraction, "dragging");
  });

  test("safe renderer input contains only audited fields and maps V15 actions", () => {
    const controller = new RuntimeMicroInteractionController({ now: () => 0 });
    controller.setBaseState("idle");

    const pointer = snapshotToSafeRendererInput(controller.startPointerNear());
    assert.deepEqual(Object.keys(pointer).sort(), [
      "actionId",
      "packId",
      "playbackIntent",
      "rendererKind",
      "scale",
      "visibility"
    ]);
    assert.equal(pointer.actionId, "pointer_look");
    assert.equal(pointer.playbackIntent.priority, "base");

    const hoverController = new RuntimeMicroInteractionController({ now: () => 0 });
    hoverController.setBaseState("idle");
    hoverController.startPointerNear();
    const hover = snapshotToSafeRendererInput(hoverController.startPointerHover());
    assert.equal(hover.actionId, "pointer_ear_twitch");
    assert.equal(hover.playbackIntent.priority, "base");

    const click = snapshotToSafeRendererInput(controller.startClick());
    assert.equal(click.actionId, "click_paw");
    assert.equal(click.playbackIntent.priority, "transient");

    const drag = snapshotToSafeRendererInput(controller.startDragStart());
    assert.equal(drag.actionId, "drag_grabbed");
    assert.equal(drag.playbackIntent.priority, "base");

    const serialized = JSON.stringify({ pointer, click, drag });
    assert.equal(/raw|payload|prompt|command|token|Authorization|workspace|config|\/Users\//i.test(serialized), false);
  });
});
