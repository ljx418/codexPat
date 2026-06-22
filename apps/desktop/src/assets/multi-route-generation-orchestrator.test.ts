import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS } from "./asset-manifest";
import {
  buildV24OrchestrationEvidenceSnapshot,
  createV24MultiRouteOrchestration,
  multiRouteOrchestrationHasForbiddenContent,
  V24_ROUTE_IDS
} from "./multi-route-generation-orchestrator";

const clearPhoto = {
  status: "clear" as const,
  primaryReasonCode: "photo_suitability_clear" as const
};

describe("V24 multi-route generation orchestrator", () => {
  it("registers all five routes and creates safe local candidates without mutating live pet", () => {
    const result = createV24MultiRouteOrchestration({
      photoSuitability: clearPhoto,
      routes: {
        route_a_provider_key_pose: {
          credentialRequired: true,
          credentialPresent: false,
          attemptsRequested: 1
        },
        route_b_provider_action_sheet: {
          supported: false
        },
        route_c_local_rig: {
          outputKind: "local_output",
          candidateId: "route_c_candidate",
          safePackId: "route_c_pack",
          actionCoverage: [...CORE_ACTION_IDS]
        },
        route_d_image_to_video: {
          supported: false
        },
        route_e_local_fallback_style_pack: {
          outputKind: "local_output",
          candidateId: "route_e_candidate",
          safePackId: "route_e_pack",
          actionCoverage: [...CORE_ACTION_IDS]
        }
      }
    });
    const evidence = buildV24OrchestrationEvidenceSnapshot(result);

    assert.equal(result.status, "passed");
    assert.equal(result.routes.length, V24_ROUTE_IDS.length);
    assert.equal(result.safeCandidateCount, 2);
    assert.equal(result.livePetMutationAttempted, false);
    assert.equal(result.providerExecutionStarted, false);
    assert.equal(result.previousPackPreserved, true);
    assert.ok(result.reasonCodes.includes("provider_credential_missing"));
    assert.ok(result.reasonCodes.includes("route_unavailable"));
    assert.ok(result.reasonCodes.includes("candidate_created"));
    assert.equal(multiRouteOrchestrationHasForbiddenContent({ result, evidence }), false);
  });

  it("blocks all routes when V23 photo gate is unsuitable", () => {
    const result = createV24MultiRouteOrchestration({
      photoSuitability: {
        status: "unsuitable",
        primaryReasonCode: "photo_blurry"
      },
      routes: {
        route_e_local_fallback_style_pack: {
          outputKind: "local_output",
          candidateId: "route_e_candidate",
          safePackId: "route_e_pack",
          actionCoverage: [...CORE_ACTION_IDS]
        }
      }
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.safeCandidateCount, 0);
    assert.ok(result.reasonCodes.includes("better_photo_required"));
    assert.ok(result.routes.every((route) => route.state === "blocked"));
  });

  it("uses stable reason codes for missing output and incomplete action coverage", () => {
    const missingOutput = createV24MultiRouteOrchestration({
      photoSuitability: clearPhoto,
      routes: {
        route_e_local_fallback_style_pack: {
          outputKind: "none"
        }
      }
    });
    const incompleteCoverage = createV24MultiRouteOrchestration({
      photoSuitability: clearPhoto,
      routes: {
        route_c_local_rig: {
          outputKind: "local_output",
          candidateId: "route_c_candidate",
          safePackId: "route_c_pack",
          actionCoverage: ["idle", "thinking"]
        }
      }
    });

    assert.equal(missingOutput.status, "blocked");
    assert.ok(missingOutput.reasonCodes.includes("route_output_missing"));
    assert.equal(incompleteCoverage.status, "blocked");
    assert.ok(incompleteCoverage.reasonCodes.includes("action_coverage_incomplete"));
  });

  it("fails safely when route or total attempt budget is exceeded", () => {
    const perRouteExceeded = createV24MultiRouteOrchestration({
      photoSuitability: clearPhoto,
      routes: {
        route_c_local_rig: {
          attemptsRequested: 3,
          outputKind: "local_output",
          actionCoverage: [...CORE_ACTION_IDS]
        }
      }
    });
    const totalExceeded = createV24MultiRouteOrchestration({
      photoSuitability: clearPhoto,
      totalAttemptLimit: 2,
      routes: {
        route_c_local_rig: {
          attemptsRequested: 2,
          outputKind: "local_output",
          actionCoverage: [...CORE_ACTION_IDS]
        },
        route_e_local_fallback_style_pack: {
          attemptsRequested: 2,
          outputKind: "local_output",
          actionCoverage: [...CORE_ACTION_IDS]
        }
      }
    });

    assert.equal(perRouteExceeded.status, "failed");
    assert.ok(perRouteExceeded.reasonCodes.includes("route_budget_exhausted"));
    assert.equal(totalExceeded.status, "failed");
    assert.ok(totalExceeded.reasonCodes.includes("route_budget_exhausted"));
  });

  it("detects forbidden diagnostics and sanitizes unsafe candidate ids", () => {
    const result = createV24MultiRouteOrchestration({
      photoSuitability: clearPhoto,
      routes: {
        route_c_local_rig: {
          outputKind: "local_output",
          candidateId: "/Users/example/private",
          safePackId: "https://example.invalid/pack",
          actionCoverage: [...CORE_ACTION_IDS]
        }
      }
    });

    assert.equal(result.status, "passed");
    assert.equal(result.routes.find((route) => route.routeId === "route_c_local_rig")?.candidate?.candidateId, "route_c_local_rig_candidate");
    assert.equal(result.routes.find((route) => route.routeId === "route_c_local_rig")?.candidate?.safePackId, "route_c_local_rig_pack");
    assert.equal(multiRouteOrchestrationHasForbiddenContent({ bad: "/Users/example/private" }), true);
  });
});
