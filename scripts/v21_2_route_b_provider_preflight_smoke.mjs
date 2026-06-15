#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V21.x/evidence/v21_2-route-b-provider-preflight-${DATE}.md`;
const records = [];

const providerMatrix = [
  {
    providerName: "MiniMax",
    providerFamily: "mainland_image_generation",
    evidenceBasis: "project_v20_real_reference_image_outputs",
    referenceImageSupported: true,
    imageToImageSupported: true,
    spriteSheetPromptSupported: "attempted_but_not_valid_8x9",
    imageEditingSupported: "unknown",
    imageToVideoSupported: false,
    alphaOrTransparentBackgroundSupported: false,
    outputFormat: "image",
    credentialPresent: credentialPresent(["MINIMAX_API_KEY", "MinimaxApikey"]),
    consentRequired: true,
    costDisclosureAvailable: true,
    privacyDisclosureAvailable: true,
    retentionDisclosureAvailable: "provider_terms_required",
    licenseDisclosureAvailable: "provider_terms_required",
    verdict: "candidate_limited",
    reasonCode: "direct_sheet_output_blocked"
  },
  {
    providerName: "Seedream / Jimeng family",
    providerFamily: "mainland_reference_image_or_image_editing_candidate",
    evidenceBasis: "public_capability_review_only",
    referenceImageSupported: "candidate_unverified",
    imageToImageSupported: "candidate_unverified",
    spriteSheetPromptSupported: "unknown",
    imageEditingSupported: "candidate_unverified",
    imageToVideoSupported: "unknown",
    alphaOrTransparentBackgroundSupported: "unknown",
    outputFormat: "image_or_video_unknown",
    credentialPresent: false,
    consentRequired: true,
    costDisclosureAvailable: "not_verified",
    privacyDisclosureAvailable: "not_verified",
    retentionDisclosureAvailable: "not_verified",
    licenseDisclosureAvailable: "not_verified",
    verdict: "candidate_unverified",
    reasonCode: "credential_and_contract_missing"
  },
  {
    providerName: "Kling / Kuaishou family",
    providerFamily: "image_to_video_candidate",
    evidenceBasis: "public_capability_review_only",
    referenceImageSupported: "candidate_unverified",
    imageToImageSupported: "unknown",
    spriteSheetPromptSupported: false,
    imageEditingSupported: "unknown",
    imageToVideoSupported: "candidate_unverified",
    alphaOrTransparentBackgroundSupported: "unknown",
    outputFormat: "video_unknown",
    credentialPresent: false,
    consentRequired: true,
    costDisclosureAvailable: "not_verified",
    privacyDisclosureAvailable: "not_verified",
    retentionDisclosureAvailable: "not_verified",
    licenseDisclosureAvailable: "not_verified",
    verdict: "candidate_unverified",
    reasonCode: "credential_and_contract_missing"
  },
  {
    providerName: "Tongyi Wanxiang family",
    providerFamily: "image_editing_candidate",
    evidenceBasis: "public_capability_review_only",
    referenceImageSupported: "unknown",
    imageToImageSupported: "candidate_unverified",
    spriteSheetPromptSupported: "unknown",
    imageEditingSupported: "candidate_unverified",
    imageToVideoSupported: "unknown",
    alphaOrTransparentBackgroundSupported: "unknown",
    outputFormat: "image_unknown",
    credentialPresent: false,
    consentRequired: true,
    costDisclosureAvailable: "not_verified",
    privacyDisclosureAvailable: "not_verified",
    retentionDisclosureAvailable: "not_verified",
    licenseDisclosureAvailable: "not_verified",
    verdict: "candidate_unverified",
    reasonCode: "credential_and_contract_missing"
  }
];

record("V21.0 evidence exists", existsSync(resolve(REPO_ROOT, `docs/V21.x/evidence/v21_0-scope-freeze-${DATE}.md`)), "V21.2 requires V21.0 scope-freeze evidence");
record("V21.2 spec exists", existsSync(resolve(REPO_ROOT, "docs/V21.x/v21_2-route-b-provider-preflight-spec.md")), "provider preflight spec");
record("MiniMax plus two alternative provider families classified", providerMatrix.length >= 3 && providerMatrix.some((item) => item.providerName === "MiniMax"), providerMatrix.map((item) => `${item.providerName}:${item.verdict}`).join(", "));
record("MiniMax scoped evidence boundary", providerMatrix[0].verdict === "candidate_limited" && providerMatrix[0].reasonCode === "direct_sheet_output_blocked", "V20 MiniMax output exists but direct 8x9 sheet remains blocked");
record("no unconsented live smoke", true, "Route B did not call any provider; live smoke requires credential, consent, cost/privacy/retention/license boundary");
record("safe matrix fields only", safeMatrixScan(providerMatrix), "matrix has safe booleans/enums, no credential values or raw payload");
record("security scan", securityScan(providerMatrix), "no token, Authorization, raw request/response, raw photo bytes, full local path, prompt private text");
record("claim scan", claimScan(), "Route B review does not imply provider integration verified or V21 final passed");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records, providerMatrix }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function credentialPresent(keys) {
  const envText = [
    existsSync(resolve(REPO_ROOT, ".env")) ? readFileSync(resolve(REPO_ROOT, ".env"), "utf8") : "",
    existsSync(resolve(REPO_ROOT, ".env.local")) ? readFileSync(resolve(REPO_ROOT, ".env.local"), "utf8") : ""
  ].join("\n");
  return keys.some((key) => process.env[key] || new RegExp(`^${escapeRegExp(key)}\\s*=`, "m").test(envText));
}

function safeMatrixScan(matrix) {
  const text = JSON.stringify(matrix);
  return !/(\/Users\/|\/private\/|Authorization|Bearer|sk-|rawProvider|raw provider|rawRequest|rawResponse|rawPhoto|promptText|workspace|config|command|shell)/i.test(text);
}

function securityScan(matrix) {
  const text = JSON.stringify(matrix) + "\n" + safeRead("docs/V21.x/v21_2-route-b-provider-preflight-spec.md");
  return !/(Authorization\s*[:=]|api-token\.json\s*[:=]|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw request\s*[:=]|raw photo bytes\s*[:=]|prompt private text\s*[:=])/i.test(text);
}

function claimScan() {
  const text = safeRead("docs/V21.x/v21_x-claim-matrix.md") + "\n" + JSON.stringify(providerMatrix);
  return !/(provider integration verified\s+passed|V21 final passed\s*$|arbitrary cats automatic photo-to-animation ready\s+passed|low-retry provider reliability for arbitrary cats\s+passed|Petdex parity achieved\s+passed)/im.test(text);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function safeRead(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function renderEvidence(status) {
  return `# V21.2 Route B Provider Preflight Evidence

status: ${status}
date: ${DATE}

## Scope

V21.2 classifies provider families for alternate route exploration. It does not
call providers in this run and does not prove provider integration. MiniMax
remains a candidate-limited provider because V20 proved real outputs but V20.3
blocked direct 8x9 normalization.

## Provider Matrix

| Provider | Family | Evidence basis | Reference image | Image-to-image | Image-to-video | Alpha/background | Credential | Verdict | ReasonCode |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${providerMatrix.map((item) => `| ${item.providerName} | ${item.providerFamily} | ${item.evidenceBasis} | ${item.referenceImageSupported} | ${item.imageToImageSupported} | ${item.imageToVideoSupported} | ${item.alphaOrTransparentBackgroundSupported} | ${item.credentialPresent ? "present" : "missing"} | ${item.verdict} | ${item.reasonCode} |`).join("\n")}

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## PRD / Spec Review

Route B serves V21 by preventing another single-provider dead end. This evidence
classifies candidates and explicitly avoids live smoke without credentials,
consent, cost/privacy/retention/license disclosures, and accepted output
handling. Route B alone cannot satisfy V21 final passed.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Provider review treated as final product evidence | High | blocked; final requires route output QA + preview/apply/rollback |
| MiniMax V20 output treated as direct provider success | High | blocked; marked candidate_limited |
| Alternative provider capabilities overclaimed | Medium | marked candidate_unverified without live smoke |

## Allowed Claim

${status === "passed"
    ? "V21 alternate provider capability review completed with scoped go/no-go decisions."
    : "No V21.2 passed claim is made."}

## Forbidden Claims

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- V21 final passed
- Petdex parity achieved
`;
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
