import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CSS_DEFAULT_ASSET_MANIFEST } from "./bundled-packs/css-default.manifest";
import {
  activateV19MotionSheetPack,
  applyV19MotionSheetToTarget,
  buildV19MotionSheetEvidenceSnapshot,
  createV19MotionSheetPreviewFlow,
  rollbackV19MotionSheet,
  validateV19MotionSheet,
  v19EvidenceHasForbiddenContent,
  type V19MotionSheetInput
} from "./v19-motion-sheet";

describe("V19 motion sheet validator and QA", () => {
  it("accepts a safe 8-row motion sheet and exposes safe renderer output only", () => {
    const result = validateV19MotionSheet(validSheet());
    const snapshot = buildV19MotionSheetEvidenceSnapshot(result);

    assert.equal(result.status, "accepted");
    assert.equal(result.reasonCode, "accepted");
    assert.equal(snapshot.actionCoverage.length, 8);
    assert.equal(v19EvidenceHasForbiddenContent(snapshot), false);
    if (result.status !== "accepted") throw new Error("expected accepted");
    assert.equal(result.safeRendererOutput.rendererKind, "sprite");
    assert.equal(result.safeRendererOutput.actions.running.frameCount, 9);
  });

  it("rejects unsafe fixture matrix with stable reasonCodes", () => {
    const cases: Array<[string, Partial<V19MotionSheetInput>, string]> = [
      ["remote url", { layout: { ...validSheet().layout, fileName: "https://example.invalid/cat.png" } as V19MotionSheetInput["layout"] }, "remote_url_rejected"],
      ["absolute path", { layout: { ...validSheet().layout, fileName: "/Users/example/cat.png" } as V19MotionSheetInput["layout"] }, "absolute_path_rejected"],
      ["path traversal", { layout: { ...validSheet().layout, fileName: "../cat.png" } as V19MotionSheetInput["layout"] }, "path_traversal_rejected"],
      ["script field", { script: "alert(1)" } as Partial<V19MotionSheetInput>, "script_field_rejected"],
      ["event handler", { onload: "run()" } as Partial<V19MotionSheetInput>, "event_handler_rejected"],
      ["external href", { href: "cat.png" } as Partial<V19MotionSheetInput>, "external_href_rejected"],
      ["shell command", { shellCommand: "curl example.invalid" } as Partial<V19MotionSheetInput>, "shell_command_rejected"],
      ["raw provider payload", { rawProviderPayload: "{}" } as Partial<V19MotionSheetInput>, "raw_provider_payload_rejected"],
      ["prompt text", { promptText: "private prompt" } as Partial<V19MotionSheetInput>, "prompt_private_text_rejected"],
      ["credential", { token: "secret" } as Partial<V19MotionSheetInput>, "credential_field_rejected"]
    ];

    for (const [, patch, reasonCode] of cases) {
      const result = validateV19MotionSheet({ ...validSheet(), ...patch });
      assert.equal(result.status === "accepted", false);
      assert.equal(result.reasonCode, reasonCode);
      assert.equal(result.preservedPreviousActivePack, true);
    }
  });

  it("blocks independent provider action images and missing provider sheet", () => {
    const independent = validateV19MotionSheet({ ...validSheet(), sourceMode: "provider_independent_actions" });
    assert.equal(independent.status, "blocked");
    assert.equal(independent.reasonCode, "provider_output_not_single_sheet");

    const missingSheet = validateV19MotionSheet({
      ...validSheet(),
      sourceMode: "provider_single_motion_sheet",
      layout: undefined
    });
    assert.equal(missingSheet.status, "blocked");
    assert.equal(missingSheet.reasonCode, "provider_motion_sheet_missing");
  });

  it("rejects weak amplitude and preserves previous active pack", () => {
    const weak = validSheet();
    weak.qa = weak.qa.map((item) => ({ ...item, meanFrameDelta: 5, maxFrameDelta: 8, bboxCenterShiftPx: 1, uniquePoseCount: 2 }));

    const activation = activateV19MotionSheetPack(CSS_DEFAULT_ASSET_MANIFEST, weak);
    assert.equal(activation.preservedPrevious, true);
    assert.equal(activation.validation.status, "rejected");
    assert.equal(activation.validation.reasonCode, "qa_failed_pack_blocked");
    assert.equal(activation.activeManifest.packId, CSS_DEFAULT_ASSET_MANIFEST.packId);
  });

  it("previews, applies to target only, and rolls back without PetEvent mutation", () => {
    const validation = validateV19MotionSheet(validSheet());
    const instances = [
      { instanceId: "default", displayName: "Default", activePackId: "default-pack", isDefault: true },
      { instanceId: "codex_1", displayName: "Work Cat", activePackId: "previous-pack" },
      { instanceId: "codex_2", displayName: "Other Cat", activePackId: "other-pack" }
    ];
    const flow = createV19MotionSheetPreviewFlow({
      validation,
      targetInstanceId: "codex_1",
      instances
    });
    const applied = applyV19MotionSheetToTarget(flow);
    const rolledBack = rollbackV19MotionSheet(flow);
    const snapshot = buildV19MotionSheetEvidenceSnapshot(validation, flow, applied);

    assert.equal(flow.status, "ready");
    if (flow.status !== "ready") throw new Error("expected ready");
    assert.equal(flow.previewSafety.acceptedPetEvents, 0);
    assert.equal(applied.status, "applied");
    if (applied.status !== "applied") throw new Error("expected applied");
    assert.equal(applied.defaultPetUnchanged, true);
    assert.equal(applied.unrelatedPetsUnchanged, true);
    assert.equal(rolledBack.status, "rolled_back");
    assert.equal(v19EvidenceHasForbiddenContent(snapshot), false);
  });
});

export function validSheet(): V19MotionSheetInput {
  return {
    schemaVersion: "19.0",
    packId: "v19-motion-sheet-local-cat",
    displayName: "V19 Motion Sheet Local Cat",
    rendererKind: "sprite",
    sourceMode: "local_motion_sheet_import",
    licenseConfirmation: true,
    layout: {
      rows: 8,
      columns: 9,
      frameWidth: 192,
      frameHeight: 208,
      fileName: "motion-sheet.png",
      imageType: "png"
    },
    actions: [
      "idle",
      "thinking",
      "running",
      "success",
      "warning",
      "error",
      "need_input",
      "sleeping"
    ].map((actionId, index) => ({
      actionId: actionId as V19MotionSheetInput["actions"][number]["actionId"],
      row: index + 1,
      frameStart: 0,
      frameCount: 9,
      fps: 8,
      loop: !["success"].includes(actionId),
      fallbackActionId: "idle" as const
    })),
    qa: [
      "idle",
      "thinking",
      "running",
      "success",
      "warning",
      "error",
      "need_input",
      "sleeping"
    ].map((actionId, index) => ({
      actionId: actionId as V19MotionSheetInput["qa"][number]["actionId"],
      nonblank: true,
      offCanvas: false,
      firstFinalClosed: true,
      meanFrameDelta: index === 0 ? 24 : 31,
      maxFrameDelta: index === 0 ? 38 : 62,
      bboxCenterShiftPx: index === 0 ? 18 : 32,
      bboxAreaChangeRatio: 0.16,
      uniquePoseCount: actionId === "success" ? 3 : 5,
      sameCatState: "passed" as const,
      scaleReadability: "passed" as const
    }))
  };
}
