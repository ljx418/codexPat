import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildV37PhotoToActionEvidenceSnapshot,
  createV37PhotoToActionProductPath,
  decideV37FinalPhotoToAction,
  v37PhotoToActionProductPathHasForbiddenContent
} from "./v37-photo-to-action-product-path";

describe("V37 photo-to-action product path", () => {
  it("creates scoped photo-to-action path for tested named samples without claiming Route B", () => {
    const path = createV37PhotoToActionProductPath();
    const snapshot = buildV37PhotoToActionEvidenceSnapshot(path);
    const final = decideV37FinalPhotoToAction(path);

    assert.equal(path.status, "passed");
    assert.equal(path.sampleSet.passedCount, 2);
    assert.equal(path.identityContracts.filter((contract) => contract.status === "passed").length, 2);
    assert.equal(path.actionCandidates.filter((candidate) => candidate.routeId === "route_a2_local_deterministic" && candidate.semanticStatus === "passed").length, 2);
    assert.equal(path.actionCandidates.filter((candidate) => candidate.routeId === "route_b_professional_assisted" && candidate.semanticStatus === "blocked").length, 2);
    assert.equal(path.productGate.status, "passed");
    assert.equal(path.humanGate.status, "passed");
    assert.equal(final.decision, "tested named samples photo-to-action product-path scoped pass");
    assert.equal(final.claimScanStatus, "passed");
    assert.equal(final.securityScanStatus, "passed");
    assert.match(final.narrowClaim, /tested named samples/);
    assert.equal(v37PhotoToActionProductPathHasForbiddenContent(snapshot), false);
  });

  it("keeps failed or blocked candidates out of apply-ready product path", () => {
    const path = createV37PhotoToActionProductPath();
    const blockedCandidates = path.actionCandidates.filter((candidate) => candidate.semanticStatus !== "passed");

    assert.equal(blockedCandidates.length >= 2, true);
    assert.equal(blockedCandidates.every((candidate) => candidate.productPathStatus !== "preview_apply_rollback_ready"), true);
    assert.equal(path.productGate.failedCandidateBlocked, true);
  });
});
