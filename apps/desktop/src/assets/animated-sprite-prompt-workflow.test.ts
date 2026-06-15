import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CORE_ACTION_IDS } from "./asset-manifest";
import {
  animatedSpritePromptWorkflowHasForbiddenContent,
  generateAnimatedSpritePromptWorkflow
} from "./animated-sprite-prompt-workflow";

describe("V8.10 animated sprite prompt workflow", () => {
  it("generates prompt-only storyboard instructions for every core action", () => {
    const result = generateAnimatedSpritePromptWorkflow({
      catName: "Orange Tabby",
      approvedTraits: "warm orange fur, amber eyes, white chest, curled tail",
      frameCount: 6,
      fps: 12
    });

    assert.equal(result.status, "accepted");
    assert.equal(result.reasonCode, "animated_sprite_prompt_workflow_ok");
    assert.equal(result.evidenceSummary.promptOnly, true);
    assert.equal(result.evidenceSummary.providerExecution, false);
    assert.equal(result.evidenceSummary.uploadsByDefault, false);
    assert.equal(result.evidenceSummary.targetsV89Assembler, true);
    assert.deepEqual(Object.keys(result.actionStoryboards), [...CORE_ACTION_IDS]);
    for (const action of CORE_ACTION_IDS) {
      const storyboard = result.actionStoryboards[action];
      assert.equal(storyboard.actionId, action);
      assert.equal(storyboard.frameCount, 6);
      assert.match(storyboard.frameFilePattern, new RegExp(`${action}-000\\.png`));
      assert.match(storyboard.frameFilePattern, new RegExp(`${action}-005\\.png`));
      assert.match(storyboard.prompt, /transparent PNG animation frames/);
    }
    const manifest = JSON.parse(result.manifestTemplate);
    assert.equal(manifest.rendererKind, "sprite");
    assert.equal(manifest.assets.idle.fps, 12);
    assert.equal(manifest.assets.idle.frameFiles.length, 6);
    assert.equal(animatedSpritePromptWorkflowHasForbiddenContent(result), false);
  });

  it("rejects invalid frame count and fps", () => {
    assert.equal(
      generateAnimatedSpritePromptWorkflow({ frameCount: 1, fps: 12 }).reasonCode,
      "animated_sprite_prompt_frame_count_invalid"
    );
    assert.equal(
      generateAnimatedSpritePromptWorkflow({ frameCount: 6, fps: 48 }).reasonCode,
      "animated_sprite_prompt_fps_invalid"
    );
  });

  it("sanitizes unsafe trait input without leaking paths or secrets", () => {
    const result = generateAnimatedSpritePromptWorkflow({
      catName: "sk-secret-token-value",
      approvedTraits: "orange cat in /Users/example/secret with https://example.invalid/provider",
      frameCount: 4,
      fps: 8
    });

    assert.equal(result.status, "accepted");
    assert.equal(result.catName, "Animated Sprite Cat");
    assert.equal(result.approvedTraitSummary, "user-approved cat appearance traits");
    assert.equal(animatedSpritePromptWorkflowHasForbiddenContent(result), false);
  });
});
