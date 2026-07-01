import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDirectDiffusersFrameRunner } from "./v40-direct-local-image-model";
import {
  V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING,
  createLocalImageCandidateOrchestrator,
  type ActionPoseConditionPack,
  type SourceAndLicenseRecord
} from "./v40-local-image-candidate-orchestrator";
import { V40_NO_WEBUI_ACTION_IDS } from "./v40-no-webui-workflow-contract";

const sourceSamples: SourceAndLicenseRecord[] = [
  {
    sampleId: "v38_a_cat_public",
    sampleKind: "tested_cat",
    sourceRef: "docs/V38.x/evidence/assets/v38_a_cat_public/sanitized.png",
    baselineV39Ref: "/v39/v38_a_cat_public/contact-sheet.svg",
    consentBoundary: "public_sample",
    licenseStatus: "usable",
    retentionRule: "safe_relative_refs_only",
    reasonCodes: ["v38_public_sanitized_derivative_ready"]
  },
  {
    sampleId: "v38_tuxedo_public",
    sampleKind: "tested_cat",
    sourceRef: "docs/V38.x/evidence/assets/v38_tuxedo_public/sanitized.png",
    baselineV39Ref: "/v39/v38_tuxedo_public/contact-sheet.svg",
    consentBoundary: "public_sample",
    licenseStatus: "usable",
    retentionRule: "safe_relative_refs_only",
    reasonCodes: ["v38_public_sanitized_derivative_ready"]
  },
  {
    sampleId: "v38_negative_dog_public",
    sampleKind: "negative_or_blocked",
    sourceRef: null,
    baselineV39Ref: null,
    consentBoundary: "public_sample",
    licenseStatus: "blocked",
    retentionRule: "safe_relative_refs_only",
    reasonCodes: ["negative_non_cat_rejected"]
  }
];

const actionPosePacks: ActionPoseConditionPack[] = V40_NO_WEBUI_ACTION_IDS.map((actionId) => ({
  actionId,
  poseIntent: `${actionId} readable desktop pet pose`,
  forbiddenFallback: "whole_image_transform",
  reasonCodes: ["action_pose_condition_defined"]
}));

describe("V40.3R5 local image candidate orchestrator", () => {
  it("passes predev only when samples, controls, and direct runner are ready", () => {
    const runner = createDirectDiffusersFrameRunner({
      modelLabel: "dreamshaper-8-local-checkpoint",
      outputDirRef: "docs/V40.x/evidence/assets/v40-3r6-controlled-candidates",
      components: [
        { componentId: "python_wrapper", status: "available", safeLabel: "v40-runner-venv", reasonCodes: [] },
        { componentId: "torch", status: "available", safeLabel: "torch", reasonCodes: [] },
        { componentId: "diffusers", status: "available", safeLabel: "diffusers", reasonCodes: [] },
        { componentId: "local_checkpoint", status: "available", safeLabel: "dreamshaper-8", reasonCodes: [] },
        { componentId: "identity_conditioner", status: "available", safeLabel: "ip-adapter-sd15", reasonCodes: [] },
        { componentId: "image_io", status: "available", safeLabel: "PIL", reasonCodes: [] }
      ]
    });
    const audit = createLocalImageCandidateOrchestrator({
      selectedRoute: "new_direct_runner_route_allowed",
      samples: sourceSamples,
      maskCropPlans: sourceSamples.filter((sample) => sample.sampleKind === "tested_cat").map((sample) => ({
        sampleId: sample.sampleId,
        cropStrategy: "subject_centered_square_crop",
        maskStrategy: "subject_silhouette_or_alpha_hint",
        safePreviewRef: sample.sourceRef,
        reasonCodes: ["subject_mask_crop_plan_defined"]
      })),
      identityAnchorPacks: sourceSamples.filter((sample) => sample.sampleKind === "tested_cat").map((sample) => ({
        sampleId: sample.sampleId,
        anchors: ["coat palette", "face marking", "tail silhouette"],
        sameCatRequirement: true,
        reasonCodes: ["identity_anchor_pack_defined"]
      })),
      actionPoseConditionPacks: actionPosePacks,
      actionNameMapping: V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING,
      runner,
      visualReviewRubric: {
        rejectPhotoCardOutput: true,
        rejectIdentityDrift: true,
        rejectWeakActionSemantics: true,
        rejectUnsafeArtifacts: true,
        requireDesktopScaleReadability: true,
        requirePreferenceOverV39: true
      }
    });

    assert.equal(audit.decision, "passed scoped");
    assert.equal(audit.generationMayStart, true);
  });

  it("blocks when a direct runner component is missing", () => {
    const runner = createDirectDiffusersFrameRunner({
      modelLabel: "local-checkpoint",
      outputDirRef: "docs/V40.x/evidence/assets/v40-3r6-controlled-candidates",
      components: [
        { componentId: "python_wrapper", status: "available", safeLabel: "v40-runner-venv", reasonCodes: [] }
      ]
    });
    const audit = createLocalImageCandidateOrchestrator({
      selectedRoute: "new_direct_runner_route_allowed",
      samples: sourceSamples,
      maskCropPlans: [],
      identityAnchorPacks: [],
      actionPoseConditionPacks: actionPosePacks,
      actionNameMapping: V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING,
      runner,
      visualReviewRubric: {
        rejectPhotoCardOutput: true,
        rejectIdentityDrift: true,
        rejectWeakActionSemantics: true,
        rejectUnsafeArtifacts: true,
        requireDesktopScaleReadability: true,
        requirePreferenceOverV39: true
      }
    });

    assert.equal(audit.decision, "blocked");
    assert.equal(audit.reasonCodes.includes("direct_runner_predev_blocked"), true);
  });
});
