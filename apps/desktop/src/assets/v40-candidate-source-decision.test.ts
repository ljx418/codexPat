import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateV40CandidateSourceDecision
} from "./v40-no-webui-workflow-contract";

describe("V40.3R3 candidate source decision gate", () => {
  it("accepts a manual/import-first route only with source, license, and visual acceptance evidence", () => {
    const result = validateV40CandidateSourceDecision({
      decision: "accepted_manual_import_first",
      route: "manual_import_no_webui",
      sampleSet: ["manual-cat-a", "manual-cat-b"],
      predevAuditRef: "docs/V40.x/evidence/v40_3r3-documentation-support-audit-2026-06-30.md",
      sourceLicenseEvidenceRef: "docs/V40.x/evidence/manual-import-source-license-2026-06-30.md",
      visualAcceptanceEvidenceRefs: [
        "docs/V40.x/evidence/manual-import-cat-a-visual-acceptance-2026-06-30.md",
        "docs/V40.x/evidence/manual-import-cat-b-visual-acceptance-2026-06-30.md"
      ],
      materiallyDifferentEvidenceRef: null,
      v40_4Entry: "allowed_after_visual_acceptance",
      reasonCodes: []
    });

    assert.equal(result.status, "accepted");
    assert.deepEqual(result.reasonCodes, ["v40_3r3_candidate_source_decision_ready"]);
  });

  it("allows a materially different direct runner route decision but keeps V40.4 closed", () => {
    const result = validateV40CandidateSourceDecision({
      decision: "new_direct_runner_route_allowed",
      route: "direct_local_runner_no_webui",
      sampleSet: ["v38-a-cat-public", "v38-b-cat-public"],
      predevAuditRef: "docs/V40.x/evidence/v40_3r3-documentation-support-audit-2026-06-30.md",
      sourceLicenseEvidenceRef: null,
      visualAcceptanceEvidenceRefs: [],
      materiallyDifferentEvidenceRef: "docs/V40.x/evidence/v40_3r3-materially-different-runner-audit-2026-06-30.md",
      v40_4Entry: "no_go",
      reasonCodes: []
    });

    assert.equal(result.status, "accepted");
  });

  it("records a controlled blocked decision when no credible source route exists", () => {
    const result = validateV40CandidateSourceDecision({
      decision: "remain_failed_or_blocked",
      route: "none",
      sampleSet: [],
      predevAuditRef: "docs/V40.x/evidence/v40_3r3-documentation-support-audit-2026-06-30.md",
      sourceLicenseEvidenceRef: null,
      visualAcceptanceEvidenceRefs: [],
      materiallyDifferentEvidenceRef: null,
      v40_4Entry: "no_go",
      reasonCodes: [
        "v40_3r2_visual_review_failed",
        "manual_import_assets_missing",
        "new_direct_runner_route_not_materially_different",
        "v40_4_no_go"
      ]
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.reasonCodes.includes("v40_3r3_remain_failed_or_blocked"), true);
    assert.equal(result.reasonCodes.includes("v40_4_no_go"), true);
  });

  it("blocks failed V40.3R2 candidates from being reused as accepted manual/import assets", () => {
    const result = validateV40CandidateSourceDecision({
      decision: "accepted_manual_import_first",
      route: "manual_import_no_webui",
      sampleSet: ["v40-r2-failed-candidate-a"],
      predevAuditRef: "docs/V40.x/evidence/v40_3r3-documentation-support-audit-2026-06-30.md",
      sourceLicenseEvidenceRef: null,
      visualAcceptanceEvidenceRefs: [],
      materiallyDifferentEvidenceRef: null,
      v40_4Entry: "allowed_after_visual_acceptance",
      reasonCodes: ["v40_3r2_visual_review_failed"]
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.reasonCodes.includes("manual_import_assets_missing"), true);
    assert.equal(result.reasonCodes.includes("manual_import_source_license_missing"), true);
    assert.equal(result.reasonCodes.includes("manual_import_visual_acceptance_missing"), true);
  });

  it("fails unsafe candidate source decisions with raw paths or forbidden ready claims", () => {
    const rawPath = validateV40CandidateSourceDecision({
      decision: "new_direct_runner_route_allowed",
      route: "direct_local_runner_no_webui",
      sampleSet: ["v38-a-cat-public"],
      predevAuditRef: "/mnt/c/workspace/codexpat/docs/V40.x/evidence/audit.md",
      sourceLicenseEvidenceRef: null,
      visualAcceptanceEvidenceRefs: [],
      materiallyDifferentEvidenceRef: "docs/V40.x/evidence/v40_3r3-materially-different-runner-audit-2026-06-30.md",
      v40_4Entry: "no_go",
      reasonCodes: []
    });
    assert.equal(rawPath.status, "failed");
    assert.equal(rawPath.reasonCodes.includes("raw_path_leak_detected"), true);

    const forbiddenClaim = validateV40CandidateSourceDecision({
      decision: "remain_failed_or_blocked",
      route: "none",
      sampleSet: [],
      predevAuditRef: "docs/V40.x/evidence/v40_3r3-documentation-support-audit-2026-06-30.md",
      sourceLicenseEvidenceRef: null,
      visualAcceptanceEvidenceRefs: [],
      materiallyDifferentEvidenceRef: null,
      v40_4Entry: "no_go",
      reasonCodes: ["v40_3r3_remain_failed_or_blocked"],
      note: "Petdex parity achieved"
    } as Parameters<typeof validateV40CandidateSourceDecision>[0] & { note: string });
    assert.equal(forbiddenClaim.status, "failed");
    assert.equal(forbiddenClaim.reasonCodes.includes("positive_forbidden_claim_detected"), true);
  });
});
