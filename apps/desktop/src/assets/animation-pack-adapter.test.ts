import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import {
  V10_ANIMATION_PACK_SAFE_OUTPUT_FIELDS,
  activateV10PetJsonAnimationPack,
  adaptV10PetJsonAnimationPack,
  type V10PetJsonPack
} from "./animation-pack-adapter";
import { CSS_DEFAULT_ASSET_MANIFEST } from "./bundled-packs/css-default.manifest";

describe("V10.6 animation pack adapter", () => {
  test("accepts pet.json plus spritesheet covering all core actions", () => {
    const result = adaptV10PetJsonAnimationPack(spritesheetPack());
    assert.equal(result.ok, true);
    assert.equal(result.reasonCode, "accepted");
    assert.equal(result.manifest?.rendererKind, "sprite");
    assert.equal(result.manifest?.packId, "work-cat-test-sheet");
    assert.deepEqual(Object.keys(result.safeOutput?.actions ?? {}), [...CORE_ACTION_IDS]);
    for (const actionId of CORE_ACTION_IDS) {
      assert.equal(result.safeOutput?.actions[actionId].frameCount, 3);
      assert.equal(result.safeOutput?.actions[actionId].fps, 8);
    }
  });

  test("accepts pet.json plus png frame sequence covering all core actions", () => {
    const result = adaptV10PetJsonAnimationPack(frameSequencePack());
    assert.equal(result.ok, true);
    assert.equal(result.reasonCode, "accepted");
    assert.equal(result.manifest?.packId, "work-cat-test-sequence");
    assert.equal(result.manifest?.assets.idle.frameFiles?.length, 3);
    assert.equal(result.manifest?.assets.idle.frameFiles?.[0], "idle-01.png");
  });

  test("runtime adapter safe output exposes only approved fields", () => {
    const result = adaptV10PetJsonAnimationPack(frameSequencePack());
    assert.equal(result.ok, true);
    assert.deepEqual([...V10_ANIMATION_PACK_SAFE_OUTPUT_FIELDS], [
      "packId",
      "rendererKind",
      "actions.actionId",
      "actions.assetId",
      "actions.frameCount",
      "actions.fps",
      "actions.loop",
      "actions.transient",
      "actions.durationMs",
      "actions.fallbackActionId"
    ]);
    assert.equal(JSON.stringify(result.safeOutput).includes("frameSequence"), false);
    assert.equal(JSON.stringify(result.safeOutput).includes("fileName"), false);
  });

  test("fails malformed metadata with stable reasonCode", () => {
    const pack = frameSequencePack();
    pack.actions.idle.fps = 99;
    const result = adaptV10PetJsonAnimationPack(pack);
    assert.equal(result.ok, false);
    assert.equal(result.reasonCode, "fps_invalid");
    assert.equal(result.errors.some((item) => item.field === "actions.idle.fps"), true);
  });

  for (const [name, mutate] of rejectedFixtures()) {
    test(`rejects ${name}`, () => {
      const pack = frameSequencePack() as unknown as Record<string, unknown>;
      mutate(pack);
      const result = adaptV10PetJsonAnimationPack(pack);
      assert.equal(result.ok, false);
      assert.equal(result.errors.some((item) => item.reasonCode === "forbidden_content" || item.reasonCode.endsWith("_invalid") || item.reasonCode === "field_invalid"), true);
    });
  }

  test("preserves previous active pack after invalid activation", () => {
    const invalid = frameSequencePack();
    invalid.actions.running.frames = ["../escape.png"];
    const result = activateV10PetJsonAnimationPack(CSS_DEFAULT_ASSET_MANIFEST, invalid);
    assert.equal(result.preservedPrevious, true);
    assert.equal(result.activeManifest.packId, CSS_DEFAULT_ASSET_MANIFEST.packId);
    assert.equal(result.adapterResult.ok, false);
  });

  test("activates valid V10 pet.json pack as existing safe manifest", () => {
    const result = activateV10PetJsonAnimationPack(CSS_DEFAULT_ASSET_MANIFEST, frameSequencePack());
    assert.equal(result.preservedPrevious, false);
    assert.equal(result.activeManifest.packId, "work-cat-test-sequence");
    assert.equal(result.activeManifest.schemaVersion, "5.0");
  });
});

function frameSequencePack(): V10PetJsonPack {
  return {
    schemaVersion: "10.6",
    packId: "work-cat-test-sequence",
    displayName: "Work Cat Test Sequence",
    rendererKind: "sprite",
    format: "frameSequence",
    canvas: { width: 256, height: 256 },
    actions: Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
      actionId,
      action(actionId, "frameSequence")
    ])) as Record<CoreActionId, ReturnType<typeof action>>,
    license: {
      source: "project-authored",
      attribution: "Agent Desktop Pet test fixture"
    }
  };
}

function spritesheetPack(): V10PetJsonPack {
  const frameWidth = 256;
  const frameHeight = 256;
  return {
    schemaVersion: "10.6",
    packId: "work-cat-test-sheet",
    displayName: "Work Cat Test Sheet",
    rendererKind: "sprite",
    format: "spritesheet",
    canvas: { width: frameWidth, height: frameHeight },
    spritesheet: {
      fileName: "work-cat-sheet.webp",
      columns: 3,
      rows: CORE_ACTION_IDS.length,
      frameWidth,
      frameHeight
    },
    actions: Object.fromEntries(CORE_ACTION_IDS.map((actionId, row) => [
      actionId,
      action(actionId, "spritesheet", row)
    ])) as Record<CoreActionId, ReturnType<typeof action>>
  };
}

function action(actionId: CoreActionId, format: "spritesheet" | "frameSequence", row = 0) {
  const transient = actionId === "success" || actionId === "warning" || actionId === "error" || actionId === "need_input";
  return {
    frames: format === "frameSequence"
      ? [`${actionId}-01.png`, `${actionId}-02.png`, `${actionId}-03.png`]
      : [0, 1, 2].map((index) => ({
        index,
        x: index * 256,
        y: row * 256,
        width: 256,
        height: 256
      })),
    fps: 8,
    loop: !transient,
    transient,
    durationMs: transient ? 1200 : undefined,
    fallbackActionId: "idle" as const
  };
}

function rejectedFixtures(): Array<[string, (pack: Record<string, unknown>) => void]> {
  return [
    ["remote URL", (pack) => { pack.preview = "https://example.test/cat.png"; }],
    ["absolute path", (pack) => { pack.source = "/Users/example/cat.png"; }],
    ["path traversal", (pack) => { (pack.actions as Record<string, { frames: string[] }>).idle.frames[0] = "../cat.png"; }],
    ["script field", (pack) => { pack.script = "alert(1)"; }],
    ["event handler", (pack) => { pack.onload = "steal()"; }],
    ["external href", (pack) => { pack.href = "https://example.test/x"; }],
    ["shell command", (pack) => { pack.command = "rm -rf"; }],
    ["raw provider payload", (pack) => { pack.rawProviderPayload = { id: "x" }; }],
    ["prompt text", (pack) => { pack.promptText = "make a cat"; }],
    ["token", (pack) => { pack.token = "redacted"; }],
    ["Authorization", (pack) => { pack.Authorization = "Bearer redacted"; }],
    ["raw local path", (pack) => { pack.rawLocalPath = "cat.png"; }]
  ];
}
