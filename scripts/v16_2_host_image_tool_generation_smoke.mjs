import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const evidencePath = "docs/V16.x/evidence/v16_2-provider-multi-action-generation-2026-06-11.md";
mkdirSync("docs/V16.x/evidence", { recursive: true });

const generated = spawnSync("/usr/bin/python3", ["scripts/v16_host_image_tool_pack.py"], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 20
});

let summary;
try {
  summary = JSON.parse(generated.stdout);
} catch {
  summary = { ok: false, reasonCode: "provider_output_rejected" };
}

const passed = generated.status === 0 && summary.ok === true && summary.actionCount === 8 && summary.totalFrameCount >= 36;
const actionRows = summary.actions
  ? Object.entries(summary.actions).map(([actionId, item]) => `| ${actionId} | ${item.frameCount} | ${item.firstFinalDelta} | ${item.maxAdjacentDelta} | ${item.alphaCoverage} |`).join("\n")
  : "";
const sourceDigest = summary.sourceImageDigest ?? digestText("missing");

const body = `# V16.2 Provider Multi-action Generation Evidence

status: ${passed ? "passed" : "blocked"}
date: 2026-06-11
phase: V16.2 Real Provider Multi-action Generation Smoke

## Provider Summary

| Field | Value |
| --- | --- |
| providerKind | ${summary.providerKind ?? "host_image_tool"} |
| providerName | ${summary.providerName ?? "Host ChatGPT/Codex image tool"} |
| modelFamily | ${summary.modelFamily ?? "host image generation tool"} |
| sourceImageDigest | ${sourceDigest} |
| actionCount | ${summary.actionCount ?? 0} |
| totalFrameCount | ${summary.totalFrameCount ?? 0} |
| contactSheetFile | ${summary.contactSheetFile ?? "not-created"} |

## Action Frame Summary

| actionId | frameCount | firstFinalDelta | maxAdjacentDelta | alphaCoverage |
| --- | ---: | ---: | ---: | ---: |
${actionRows}

## Evidence Assets

- docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_action_sheet.png
- docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_contact_sheet.png
- docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_summary.json

## Security Boundary

The evidence stores safe file names, digests, frame counts, and action IDs only. It does not record raw provider payload, raw prompt, raw photo bytes, credential values, Authorization headers, config path, workspace path, or full local paths.

## Allowed Claim

${passed ? "V16 named-provider 2D multi-action generation smoke passed for the tested local cat-photo scenario using the host ChatGPT/Codex image tool." : "V16 provider-backed photo-to-2D generation remains blocked on accepted named-provider multi-action output."}
`;

writeFileSync(evidencePath, body);
console.log(JSON.stringify({ ok: passed, evidencePath, actionCount: summary.actionCount ?? 0, totalFrameCount: summary.totalFrameCount ?? 0 }, null, 2));
process.exit(passed ? 0 : 2);

function digestText(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

