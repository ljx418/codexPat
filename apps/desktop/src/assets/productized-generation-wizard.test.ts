import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runV29ProductizedGenerationWizard } from "./productized-generation-wizard";
import { v29AcceptedActionMetrics } from "./quality-gate-v2";

const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
  { instanceId: "codex_other", displayName: "Other", activePackId: "premium-silver" },
  { instanceId: "codex_target", displayName: "Target", activePackId: "previous-visible-pack" }
];

describe("V29 productized generation wizard", () => {
  it("runs tested photo -> QA -> preview -> target apply -> rollback flow", () => {
    const result = runV29ProductizedGenerationWizard({
      safeSampleId: "docs_cat_1",
      photoSelected: true,
      candidateId: "candidate_good",
      safePackId: "pack_good",
      displayName: "Generated Cat",
      candidateMetrics: v29AcceptedActionMetrics(),
      userApproved: true,
      targetInstanceId: "codex_target",
      instances
    });

    assert.equal(result.status, "passed");
    assert.equal(result.states.includes("preview_ready"), true);
    assert.equal(result.states.includes("applied"), true);
    assert.equal(result.states.includes("rolled_back"), true);
    assert.equal(result.reasonCodes.includes("apply_target_only_passed"), true);
    assert.equal(result.reasonCodes.includes("rollback_passed"), true);
    assert.equal(result.previewApply?.previewActionCount, 8);
    assert.equal(result.previewSafety.acceptedPetEvents, 0);
    assert.equal(result.previewSafety.callsNotify, false);
    assert.equal(result.previewSafety.writesCatStateMachine, false);
  });

  it("blocks QA failed candidates before apply", () => {
    const result = runV29ProductizedGenerationWizard({
      safeSampleId: "docs_cat_2",
      photoSelected: true,
      candidateId: "candidate_bad",
      safePackId: "pack_bad",
      displayName: "Bad Cat",
      candidateMetrics: v29AcceptedActionMetrics({ sameCatScore: 0.3 }),
      userApproved: true,
      targetInstanceId: "codex_target",
      instances
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.reasonCodes.includes("qa_failed_candidate_blocked"), true);
    assert.equal(result.reasonCodes.includes("previous_pack_preserved"), true);
    assert.equal(result.previewApply, null);
  });

  it("requires selected photo and target before apply", () => {
    const noPhoto = runV29ProductizedGenerationWizard({
      safeSampleId: "docs_cat_3",
      photoSelected: false,
      candidateId: "candidate",
      safePackId: "pack",
      displayName: "Cat",
      candidateMetrics: v29AcceptedActionMetrics(),
      userApproved: true,
      targetInstanceId: "codex_target",
      instances
    });
    const noTarget = runV29ProductizedGenerationWizard({
      safeSampleId: "docs_cat_3",
      photoSelected: true,
      candidateId: "candidate",
      safePackId: "pack",
      displayName: "Cat",
      candidateMetrics: v29AcceptedActionMetrics(),
      userApproved: true,
      targetInstanceId: null,
      instances
    });

    assert.equal(noPhoto.status, "blocked");
    assert.equal(noPhoto.reasonCodes.includes("wizard_photo_required"), true);
    assert.equal(noTarget.status, "blocked");
    assert.equal(noTarget.reasonCodes.includes("apply_target_missing"), true);
  });
});
