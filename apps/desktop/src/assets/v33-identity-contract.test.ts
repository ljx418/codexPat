import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33SampleIntakeRecord } from "./v33-sample-intake";
import {
  buildV33IdentityEvidenceSnapshot,
  createV33CharacterDesignContract,
  createV33TraitSummaryRecord,
  runV33IdentityGate
} from "./v33-identity-contract";
import { clearSample } from "./v33-sample-intake.test";

describe("V33 identity contract", () => {
  it("creates a same-character contract from a passed safe sample", () => {
    const intake = createV33SampleIntakeRecord(clearSample());
    const trait = createV33TraitSummaryRecord({ intake });
    const contract = createV33CharacterDesignContract({ intake, traitSummary: trait });

    assert.equal(contract.reviewStatus, "passed");
    assert.ok(contract.identityAnchors.includes("fur:orange"));
    assert.ok(contract.disallowedDrift.includes("different_character_per_action"));
  });

  it("passes identity gate only when all anchors are covered", () => {
    const intake = createV33SampleIntakeRecord(clearSample());
    const trait = createV33TraitSummaryRecord({ intake });
    const contract = createV33CharacterDesignContract({ intake, traitSummary: trait });
    const passed = runV33IdentityGate({
      contract,
      candidateId: "quality-rescue-tabby-v1",
      candidateAnchors: contract.identityAnchors,
      actionIdentityConsistency: 0.9
    });
    const failed = runV33IdentityGate({
      contract,
      candidateId: "identity-drift-candidate",
      candidateAnchors: contract.identityAnchors.filter((anchor) => !anchor.startsWith("pattern:")),
      actionIdentityConsistency: 0.72
    });

    assert.equal(passed.status, "passed");
    assert.equal(failed.status, "failed");
    assert.equal(failed.reasonCodes.includes("identity_drift"), true);
    assert.equal(buildV33IdentityEvidenceSnapshot(passed).status, "passed");
  });
});
