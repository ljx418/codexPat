import { buildV39Context, phaseHeader, printResult, scanBlock, v39Date, writeEvidence } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const passed = context.pipeline.rigs.filter((item) => item.status === "passed");
const scans = scanBlock({ rigs: context.pipeline.rigs });
const ok = passed.length >= 2
  && passed.every((rig) => rig.wholeImageMotionResponsibility === false)
  && passed.every((rig) => rig.parts.some((part) => part.partId === "head" && part.actionResponsibilities.length > 0))
  && passed.every((rig) => rig.parts.some((part) => part.partId === "tail" && part.actionResponsibilities.includes("play")))
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.3 Layered Part Rig Evidence",
    phase: "V39.3 layered part rig",
    spec: "visible parts have explicit pivots, motion ranges, and action responsibilities"
  }),
  "## Rig Result",
  `- Passed rigs: ${passed.length}.`,
  `- Whole-image motion responsibility present: ${passed.some((rig) => rig.wholeImageMotionResponsibility) ? "yes" : "no"}.`,
  "",
  "## Part Responsibility Summary",
  ...passed.map((rig) => `- ${rig.sampleId}: ${rig.parts.map((part) => `${part.partId}:${part.actionResponsibilities.length}`).join(" / ")}.`),
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_3-layered-part-rig-${v39Date}.md`, body);
printResult({ ok, evidencePath, passedCount: passed.length, scans });
