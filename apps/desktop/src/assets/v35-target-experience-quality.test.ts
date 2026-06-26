import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "./v33-identity-contract";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import { createV34CharacterAssetContract } from "./v34-character-asset-contract";
import { runV34GenerationProductE2E, runV34GenerationQualityGate } from "./v34-generation-quality-gate";
import { createV34PosePartMapRecord } from "./v34-pose-part-map";
import { createV34SegmentationMaskRecord } from "./v34-segmentation-mask";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";
import {
  createV34GeneratedActionPack,
  createV34RigFrameSeed
} from "./v34-rig-frame-synthesis";
import {
  assessV35RouteCandidate,
  compareV35Routes,
  createV35RouteA2UpliftCandidate,
  createV35RouteBSourceBoundary,
  createV35TargetExperienceRubric,
  decideV35FinalRoute,
  v35HasForbiddenContent
} from "./v35-target-experience-quality";

describe("V35 target-experience quality track", () => {
  it("separates V34 engineering pass from V35 target-experience quality", () => {
    const base = basePack("v35_base_orange_tabby", "orange", "tabby");
    const baseAssessment = assessV35RouteCandidate({
      routeId: "route_a2_quality_uplift",
      pack: base
    });
    const uplift = createV35RouteA2UpliftCandidate(base);
    const product = productFor(uplift);
    const upliftAssessment = assessV35RouteCandidate({
      routeId: "route_a2_quality_uplift",
      pack: uplift,
      productResult: product
    });

    assert.equal(baseAssessment.qaStatus, "passed");
    assert.equal(baseAssessment.rubricStatus, "engineering_only");
    assert.equal(upliftAssessment.rubricStatus, "target_experience");
    assert.equal(upliftAssessment.productPathResult?.previewStatus, "ready");
    assert.equal(upliftAssessment.productPathResult?.applyStatus, "applied");
    assert.equal(upliftAssessment.productPathResult?.rollbackStatus, "rolled_back");
    assert.equal(v35HasForbiddenContent(upliftAssessment), false);
  });

  it("blocks Route B when no professional assisted source evidence is available", () => {
    const base = basePack("v35_route_b_blocked_calico", "calico", "patched");
    const boundary = createV35RouteBSourceBoundary({
      sampleId: base.runtimeQaCandidates.identityGate.sampleId,
      characterAssetId: base.characterAssetId,
      partMapBinding: "docs/V34.x/evidence/derivatives/v35_route_b_part_map"
    });
    const assessment = assessV35RouteCandidate({
      routeId: "route_b_professional_assisted",
      pack: base,
      routeBSourceBoundary: boundary
    });

    assert.equal(boundary.status, "blocked_not_executed");
    assert.equal(assessment.rubricStatus, "blocked");
    assert.equal(assessment.reasonCodes.includes("route_b_source_boundary_blocked"), true);
  });

  it("compares only same-sample route evidence and produces a scoped final decision", () => {
    const rubric = createV35TargetExperienceRubric();
    const routeA2 = ["v35_compare_orange", "v35_compare_calico"].map((sampleId, index) => {
      const base = basePack(sampleId, index === 0 ? "orange" : "calico", index === 0 ? "tabby" : "patched");
      const uplift = createV35RouteA2UpliftCandidate(base);
      return assessV35RouteCandidate({
        rubric,
        routeId: "route_a2_quality_uplift",
        pack: uplift,
        productResult: productFor(uplift)
      });
    });
    const routeB = routeA2.map((assessment) => assessV35RouteCandidate({
      rubric,
      routeId: "route_b_professional_assisted",
      pack: basePack(assessment.sampleId, "silver", "tabby"),
      routeBSourceBoundary: createV35RouteBSourceBoundary({
        sampleId: assessment.sampleId,
        characterAssetId: assessment.characterAssetId,
        partMapBinding: "docs/V34.x/evidence/derivatives/v35_route_b_part_map"
      })
    }));
    const comparisons = routeA2.map((assessment, index) => compareV35Routes({
      routeA2: assessment,
      routeB: { ...routeB[index], sampleId: assessment.sampleId }
    }));
    const finalDecision = decideV35FinalRoute({
      assessments: [...routeA2, ...routeB],
      comparisons,
      evidenceRefs: ["docs/V35.x/evidence/v35_6-final-route-decision-2026-06-25.md"],
      claimScanStatus: "passed",
      securityScanStatus: "passed"
    });

    assert.equal(comparisons.every((comparison) => comparison.winner === "route_b_blocked"), true);
    assert.equal(finalDecision.decision, "Route A2 target-experience scoped pass");
    assert.equal(finalDecision.sampleCount, 2);
  });
});

function productFor(pack: ReturnType<typeof createV35RouteA2UpliftCandidate>) {
  const qa = runV34GenerationQualityGate(pack);
  return runV34GenerationProductE2E({
    pack,
    qa,
    userApproved: true,
    targetInstanceId: "v35-target-pet",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "v35-target-pet", displayName: "V35 Target", activePackId: "previous-pack" },
      { instanceId: "v35-unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
    ]
  });
}

function basePack(sampleId: string, coatColor: string, pattern: string) {
  const contract = characterContract(sampleId, coatColor, pattern);
  const seed = createV34RigFrameSeed({ contract });
  return createV34GeneratedActionPack({ contract, seed });
}

function characterContract(sampleId: string, coatColor: string, pattern: string) {
  const intake = createV33SampleIntakeRecord(clearSample(sampleId, coatColor, pattern));
  const traitSummary = createV33TraitSummaryRecord({ intake });
  const designContract = createV33CharacterDesignContract({ intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  const partMap = createV34PosePartMapRecord({ mask, designContract });
  return createV34CharacterAssetContract({ designContract, mask, partMap });
}

function clearSample(sampleId: string, coatColor: string, pattern: string): V33SafeSampleInput {
  return {
    sampleId,
    sampleClass: "clear",
    catName: "Named Cat",
    approvedTraits: `${coatColor} ${pattern}, compact body, round face, amber eyes, visible tail`,
    localReferenceConsent: true,
    photo: { mediaType: "image/png", sizeBytes: 1_300_000, fileExtension: "png" },
    width: 1024,
    height: 1024,
    qualitySignals: {
      blurScore: 0.82,
      catCount: 1,
      catVisibleRatio: 0.82,
      occlusionScore: 0.08,
      backgroundComplexity: 0.28,
      bodyVisible: true,
      tailVisible: true
    },
    visualHints: {
      coatColor,
      pattern,
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V35.x/evidence/safe-target-experience-quality"]
  };
}
