import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { date, evidenceDir, printResult, repoRoot, runSecurityScan, safeRelative } from "./v34_smoke_common.mjs";

const commands = [
  ["pnpm", ["--filter", "desktop", "test"]],
  ["pnpm", ["--filter", "desktop", "check"]],
  ["pnpm", ["--filter", "@agent-desktop-pet/petctl", "test"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v30_semantic_animation_gate_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v31_stage_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v32_quality_rescue_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v33_7_final_gate_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v34_1_subject_detection_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v34_2_segmentation_mask_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v34_3_pose_part_map_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v34_4_character_asset_contract_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v34_5_rig_frame_synthesis_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v34_6_generation_product_e2e_smoke.mjs"]],
  ["pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v34_7_real_data_report_smoke.mjs"]]
];

const results = commands.map(([cmd, args]) => {
  const startedAt = new Date().toISOString();
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8
  });
  return {
    command: [cmd, ...args].join(" "),
    exitCode: typeof result.status === "number" ? result.status : 1,
    signal: result.signal ?? "",
    startedAt,
    summary: summarize(`${result.stdout ?? ""}\n${result.stderr ?? ""}`)
  };
});

const overallPassed = results.every((result) => result.exitCode === 0);
const body = [
  "# V34.8 Command Results",
  "",
  `Date: ${date}`,
  `overallStatus: ${overallPassed ? "passed" : "failed"}`,
  "",
  "## Commands",
  ...results.flatMap((result) => [
    `### ${result.command}`,
    `- exitCode: ${result.exitCode}`,
    `- signal: ${result.signal || "none"}`,
    "- summary:",
    "```text",
    result.summary,
    "```",
    ""
  ]),
  "## Security Scan",
  "- Status: SECURITY_SCAN_PLACEHOLDER",
  "- Boundary: command summaries are sanitized and omit local absolute paths.",
  ""
].join("\n");

const securityScan = runSecurityScan(body);
const finalBody = body.replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
const outPath = path.join(evidenceDir, `v34_8-command-results-${date}.md`);
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(outPath, finalBody, "utf8");

printResult({
  ok: overallPassed && securityScan.status === "passed",
  evidencePath: safeRelative(outPath),
  overallStatus: overallPassed ? "passed" : "failed",
  failedCommands: results.filter((result) => result.exitCode !== 0).map((result) => result.command),
  securityScan: securityScan.status
});

function summarize(output) {
  const scrubbed = output
    .replaceAll(repoRoot, "<repo>")
    .replace(/\/mnt\/[^\s)]+/g, "<path>")
    .replace(/[A-Za-z]:[\\/][^\s)]+/g, "<path>")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const important = scrubbed.filter((line) =>
    /ok|fail|error|passed|failed|exitCode|evidencePath|htmlPath|finalReportPath|claimScan|securityScan|overallStatus|tests|suites/i.test(line)
  );
  return important.slice(-40).join("\n") || "command completed with no notable output";
}
