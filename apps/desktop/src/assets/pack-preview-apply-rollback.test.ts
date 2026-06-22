import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS } from "./asset-manifest";
import {
  buildV26PackPreviewApplyEvidenceSnapshot,
  runV26PackPreviewApplyRollback,
  v26FrameSet,
  v26PackPreviewApplyHasForbiddenContent
} from "./pack-preview-apply-rollback";

describe("V26 pack preview apply rollback", () => {
  it("assembles, previews all 8 actions, applies target-only, and rolls back", () => {
    const result = runV26PackPreviewApplyRollback({
      v25Accepted: true,
      userApproved: true,
      generatedPackId: "v26-generated-orange-tabby",
      displayName: "V26 Generated Orange",
      actionFrames: validFrameSets(),
      targetInstanceId: "codex_target",
      instances: instances()
    });
    const evidence = buildV26PackPreviewApplyEvidenceSnapshot(result);

    assert.equal(result.status, "passed");
    assert.equal(result.previewActionCount, 8);
    assert.equal(result.previewSafety.acceptedPetEvents, 0);
    assert.equal(result.previewSafety.callsNotify, false);
    assert.equal(result.previewSafety.writesCatStateMachine, false);
    assert.equal(result.previewSafety.mutatesLivePetInstance, false);
    assert.equal(result.applyResult.status, "applied");
    assert.equal(result.applyResult.afterAssignments.codex_target, "v26-generated-orange-tabby");
    assert.equal(result.applyResult.afterAssignments.default, "flagship-work-cat-v2");
    assert.equal(result.applyResult.afterAssignments.codex_other, "living-work-cat-v1");
    assert.equal(result.rollbackResult.status, "rolled_back");
    assert.equal(result.rollbackResult.assignments.codex_target, "previous-visible-pack");
    assert.equal(v26PackPreviewApplyHasForbiddenContent({ result, evidence }), false);
  });

  it("blocks QA failed candidates before preview or apply", () => {
    const result = runV26PackPreviewApplyRollback({
      v25Accepted: false,
      userApproved: true,
      generatedPackId: "v26-rejected-pack",
      displayName: "Rejected",
      actionFrames: validFrameSets(),
      targetInstanceId: "codex_target",
      instances: instances()
    });

    assert.equal(result.status, "blocked");
    assert.ok(result.reasonCodes.includes("qa_not_accepted"));
    assert.equal(result.applyResult.status, "blocked");
    assert.equal(result.rollbackResult.reasonCode, "previous_pack_preserved");
  });

  it("requires user approval before apply", () => {
    const result = runV26PackPreviewApplyRollback({
      v25Accepted: true,
      userApproved: false,
      generatedPackId: "v26-unapproved-pack",
      displayName: "Unapproved",
      actionFrames: validFrameSets(),
      targetInstanceId: "codex_target",
      instances: instances()
    });

    assert.equal(result.status, "blocked");
    assert.ok(result.reasonCodes.includes("user_approval_required"));
    assert.equal(result.applyResult.status, "blocked");
  });

  it("blocks missing action pack assembly and preserves previous pack", () => {
    const result = runV26PackPreviewApplyRollback({
      v25Accepted: true,
      userApproved: true,
      generatedPackId: "v26-missing-action",
      displayName: "Missing Action",
      actionFrames: validFrameSets().filter((set) => set.actionId !== "sleeping"),
      targetInstanceId: "codex_target",
      instances: instances()
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.applyResult.status, "blocked");
    assert.ok(result.reasonCodes.includes("previous_pack_preserved"));
  });

  it("detects forbidden diagnostics", () => {
    assert.equal(v26PackPreviewApplyHasForbiddenContent({ note: "/Users/example/private" }), true);
  });
});

function validFrameSets() {
  return CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, loopAction(actionId) ? 6 : 3));
}

function loopAction(actionId: string) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}

function instances() {
  return [
    { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
    { instanceId: "codex_other", displayName: "Other", activePackId: "living-work-cat-v1" },
    { instanceId: "codex_target", displayName: "Target", activePackId: "previous-visible-pack" }
  ];
}
