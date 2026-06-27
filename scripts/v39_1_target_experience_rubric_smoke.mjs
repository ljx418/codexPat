import { buildV39Context, phaseHeader, printResult, scanBlock, v39Date, writeEvidence } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const scans = scanBlock({
  overlayNegative: context.overlayNegative,
  rubricAssessments: context.pipeline.rubricAssessments
});
const ok = context.overlayNegative.status === "failed"
  && context.overlayNegative.reasonCodes.includes("photo_card_frame")
  && context.overlayNegative.reasonCodes.includes("whole_image_transform_only")
  && context.pipeline.rubricAssessments.filter((item) => item.status === "target_experience").length >= 2
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.1 Target Experience Rubric Evidence",
    phase: "V39.1 target-experience visual rubric",
    spec: "reject V38-style photo-card overlays before character asset work"
  }),
  "## Rubric Result",
  `- V38-style overlay negative status: ${context.overlayNegative.status}.`,
  `- Negative reason codes: ${context.overlayNegative.reasonCodes.join(", ")}.`,
  `- Target-experience candidate count: ${context.pipeline.rubricAssessments.filter((item) => item.status === "target_experience").length}.`,
  `- Weak transform gate status: ${context.weakTransform?.gate.status ?? "missing"}.`,
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_1-target-experience-rubric-${v39Date}.md`, body);
printResult({ ok, evidencePath, overlayNegative: context.overlayNegative, weakTransform: context.weakTransform?.gate, scans });
