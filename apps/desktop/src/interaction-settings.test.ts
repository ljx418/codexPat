import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { RuntimeMicroInteractionSnapshot } from "./runtime-micro-interactions";
import {
  AutonomousWalkController,
  DEFAULT_INTERACTION_SETTINGS,
  INTERACTION_SETTINGS_STORAGE_KEY,
  buildInteractionPreviewSnapshot,
  clampPositionToBounds,
  readInteractionSettings,
  sanitizeInteractionSettings,
  writeInteractionSettings
} from "./interaction-settings";

function idleSnapshot(): RuntimeMicroInteractionSnapshot {
  return {
    baseState: "idle",
    displayState: "idle",
    microInteraction: "none",
    active: false,
    reasonCode: "base_state",
    emitsPetEvent: false,
    writesCatStateMachine: false
  };
}

function memoryStorage(initial?: string) {
  let value = initial;
  return {
    getItem(key: string) {
      return key === INTERACTION_SETTINGS_STORAGE_KEY ? value ?? null : null;
    },
    setItem(key: string, next: string) {
      if (key === INTERACTION_SETTINGS_STORAGE_KEY) {
        value = next;
      }
    }
  };
}

describe("V15.6 interaction settings store", () => {
  test("sanitizes invalid persisted settings to safe defaults", () => {
    const settings = sanitizeInteractionSettings({
      autonomousWalk: "yes",
      pointerReactions: false,
      clickReactions: true,
      dragPhysics: 1,
      quietMode: false,
      interactionFrequency: "fast",
      motionIntensity: "huge"
    });

    assert.equal(settings.autonomousWalk, DEFAULT_INTERACTION_SETTINGS.autonomousWalk);
    assert.equal(settings.pointerReactions, false);
    assert.equal(settings.dragPhysics, DEFAULT_INTERACTION_SETTINGS.dragPhysics);
    assert.equal(settings.interactionFrequency, "normal");
    assert.equal(settings.motionIntensity, "normal");
  });

  test("persists sanitized settings and reloads them", () => {
    const storage = memoryStorage();
    const written = writeInteractionSettings({
      ...DEFAULT_INTERACTION_SETTINGS,
      quietMode: true,
      autonomousWalk: false,
      interactionFrequency: "low",
      motionIntensity: "subtle"
    }, storage);
    const read = readInteractionSettings(storage);

    assert.deepEqual(read, written);
    assert.equal(read.quietMode, true);
    assert.equal(read.autonomousWalk, false);
  });

  test("preview snapshots never mutate live pet state or emit events", () => {
    const preview = buildInteractionPreviewSnapshot("double_click", DEFAULT_INTERACTION_SETTINGS);

    assert.equal(preview.microInteraction, "double_click_jump");
    assert.equal(preview.mutatesLivePetInstance, false);
    assert.equal(preview.emitsPetEvent, false);
    assert.equal(preview.writesCatStateMachine, false);
  });
});

describe("V15.4 autonomous walk controller", () => {
  test("keeps autonomous movement inside safe bounds", () => {
    let now = 0;
    const controller = new AutonomousWalkController(() => now);
    const bounds = { minX: 10, minY: 20, maxX: 80, maxY: 90 };

    now = 6000;
    const decision = controller.tick({
      baseState: "idle",
      interaction: idleSnapshot(),
      settings: DEFAULT_INTERACTION_SETTINGS,
      position: { x: 70, y: 40 },
      bounds
    });

    assert.equal(decision.reasonCode, "walk_step");
    assert.equal(decision.visual, "walk_right");
    assert.ok(decision.position.x <= bounds.maxX);
    assert.ok(decision.position.y >= bounds.minY);
    assert.equal(decision.emitsPetEvent, false);
    assert.equal(decision.writesCatStateMachine, false);
  });

  test("blocks walk during quiet mode and urgent states", () => {
    let now = 6000;
    const controller = new AutonomousWalkController(() => now);
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };

    assert.equal(controller.tick({
      baseState: "idle",
      interaction: idleSnapshot(),
      settings: { ...DEFAULT_INTERACTION_SETTINGS, quietMode: true },
      position: { x: 20, y: 20 },
      bounds
    }).reasonCode, "walk_quiet_mode");

    now += 6000;
    assert.equal(controller.tick({
      baseState: "error",
      interaction: idleSnapshot(),
      settings: DEFAULT_INTERACTION_SETTINGS,
      position: { x: 20, y: 20 },
      bounds
    }).reasonCode, "walk_priority_blocked");
  });

  test("clamps requested positions deterministically", () => {
    assert.deepEqual(
      clampPositionToBounds({ x: -50, y: 500 }, { minX: 10, minY: 20, maxX: 80, maxY: 90 }),
      { x: 10, y: 90 }
    );
  });
});
