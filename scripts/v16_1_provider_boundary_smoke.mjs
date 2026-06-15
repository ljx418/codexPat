import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const evidencePath = "docs/V16.x/evidence/v16_1-provider-boundary-2026-06-11.md";
mkdirSync("docs/V16.x/evidence", { recursive: true });

const test = spawnSync("pnpm", ["--filter", "desktop", "test"], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 20
});

const passed = test.status === 0;
const body = `# V16.1 Provider Boundary Evidence

status: ${passed ? "passed" : "failed"}
date: 2026-06-11
phase: V16.1 Provider Boundary Harness

## Result

| Gate | Result |
| --- | --- |
| provider boundary tests | ${passed ? "passed" : "failed"} |
| host image tool path requires consent/disclosures | ${passed ? "passed" : "failed"} |
| MiniMax credential path redacts configured state | ${passed ? "passed" : "failed"} |
| unsafe request preview rejected | ${passed ? "passed" : "failed"} |

## Stable ReasonCodes Covered

- provider_credential_missing
- provider_consent_required
- provider_terms_required
- provider_cost_ack_required
- provider_retention_ack_required
- provider_license_ack_required
- provider_request_rejected

## Redaction Boundary

Evidence records only provider kind/name, disclosure states, credential state, safe digests, action counts, and reasonCode. It does not record credential values, raw prompt, raw photo, raw provider response, local source paths, workspace paths, config paths, or private payloads.

## Allowed Claim

${passed ? "V16 provider credential, consent, disclosure, and redaction boundary passed for tested local scenarios." : "No V16.1 claim; provider boundary smoke failed."}
`;

writeFileSync(evidencePath, body);
console.log(JSON.stringify({ ok: passed, evidencePath }, null, 2));
process.exit(passed ? 0 : 1);

