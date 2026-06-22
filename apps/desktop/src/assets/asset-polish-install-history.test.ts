import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PREMIUM_CAT_PACKS } from "./bundled-packs/premium-cats-v1";
import {
  createV29InstallHistoryEntry,
  runV29AssetPolishReview
} from "./asset-polish-install-history";

describe("V29 asset polish and install history", () => {
  it("passes 12 curated premium packs with safe install history", () => {
    const packs = PREMIUM_CAT_PACKS.map((pack) => ({
      packId: pack.packId,
      displayName: pack.displayName,
      manifest: pack.manifest,
      loopClosureOk: true,
      frameContinuityOk: true,
      readableAt1x: true,
      readableAt075x: true
    }));
    const history = [
      createV29InstallHistoryEntry({
        packId: "premium-orange-tabby",
        targetInstanceId: "codex_target",
        previousPackId: "flagship-work-cat-v2"
      })
    ];
    const result = runV29AssetPolishReview({ packs, installHistory: history });

    assert.equal(result.status, "passed");
    assert.ok(result.packCount >= 12);
    assert.equal(result.allPacksEightActionPreview, true);
    assert.equal(result.allPacksReadable, true);
    assert.equal(result.noFlashFrame, true);
    assert.equal(result.installHistory[0].reasonCode, "install_history_recorded");
    assert.equal(JSON.stringify(result).includes("/Users/"), false);
  });

  it("blocks too few packs and failed readability", () => {
    const result = runV29AssetPolishReview({
      packs: PREMIUM_CAT_PACKS.slice(0, 2).map((pack) => ({
        packId: pack.packId,
        displayName: pack.displayName,
        manifest: pack.manifest,
        loopClosureOk: true,
        frameContinuityOk: true,
        readableAt1x: true,
        readableAt075x: false
      })),
      installHistory: []
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.reasonCodes.includes("gallery_entry_count_too_low"), true);
    assert.equal(result.reasonCodes.includes("readability_failed"), true);
  });

  it("fails flash-frame accepted packs and sanitizes history IDs", () => {
    const history = [
      createV29InstallHistoryEntry({
        packId: "/Users/private",
        targetInstanceId: "codex_target",
        previousPackId: "../secret"
      })
    ];
    const result = runV29AssetPolishReview({
      packs: [{
        packId: "premium-orange-tabby",
        displayName: "Orange",
        manifest: PREMIUM_CAT_PACKS[0].manifest,
        loopClosureOk: false,
        frameContinuityOk: false,
        readableAt1x: true,
        readableAt075x: true
      }],
      installHistory: history,
      minimumPackCount: 1
    });

    assert.equal(history[0].safePackId, "unknown-pack");
    assert.equal(history[0].previousPackId, "unknown-previous");
    assert.equal(result.status, "failed");
    assert.equal(result.reasonCodes.includes("flash_frame_detected"), true);
  });
});
