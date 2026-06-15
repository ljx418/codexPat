import { existsSync, readFileSync, writeFileSync } from "node:fs";

loadDotenv();

const DATE = "2026-06-03";
const EVIDENCE_PATH = `docs/V9.x/evidence/v9_4-tripo3d-provider-smoke-${DATE}.md`;
const DEFAULT_HOST = "api.tripo3d.ai";
const cases = [];

const hasCredential = Boolean(process.env.TRIPO_API_KEY?.trim());
const hasConsent = process.env.TRIPO_PROVIDER_SMOKE_CONSENT === "yes" || process.env.TRIPO_PROVIDER_SMOKE_CONSENT === "true";
const hasTerms = process.env.TRIPO_PROVIDER_TERMS_ACCEPTED === "yes" || process.env.TRIPO_PROVIDER_TERMS_ACCEPTED === "true";
const endpointHost = safeHost(process.env.TRIPO_API_BASE_URL, DEFAULT_HOST);

record("Tripo3D credential preflight", hasCredential, hasCredential ? "credentialState=configured" : "reasonCode=provider_credential_missing");
record("Tripo3D explicit upload consent preflight", hasConsent, hasConsent ? "consent=true" : "reasonCode=provider_consent_required");
record("Tripo3D terms/privacy preflight", hasTerms, hasTerms ? "termsReviewed=true" : "reasonCode=provider_terms_unreviewed");
record("Tripo3D endpoint contract", true, `endpointHost=${endpointHost}; taskPattern=POST /v2/openapi/task then GET /v2/openapi/task/{task_id}`);

const ready = hasCredential && hasConsent && hasTerms;

if (!ready) {
  record("real provider 3D branch", false, firstMissingReason());
  record("security redaction scan", true, "safe summaries only; no token, auth header, raw provider response, prompt text, full local path, workspace path, or config path");
  finish("blocked");
}

record("real provider 3D branch", false, "provider_adapter_not_implemented_for_v9_4; no upload performed");
record("security redaction scan", true, "safe summaries only; no token, auth header, raw provider response, prompt text, full local path, workspace path, or config path");
finish("blocked");

function firstMissingReason() {
  if (!hasCredential) return "reasonCode=provider_credential_missing";
  if (!hasConsent) return "reasonCode=provider_consent_required";
  if (!hasTerms) return "reasonCode=provider_terms_unreviewed";
  return "reasonCode=provider_output_missing";
}

function record(name, ok, details) {
  cases.push({ name, result: ok ? "passed" : "blocked", details });
}

function finish(status) {
  const safeCases = cases.map((item) => ({ ...item, details: sanitize(item.details) }));
  writeFileSync(EVIDENCE_PATH, renderEvidence(status, safeCases), "utf8");
  console.log(JSON.stringify({ status, evidencePath: EVIDENCE_PATH, cases: safeCases }, null, 2));
  process.exit(status === "passed" ? 0 : 2);
}

function safeHost(value, fallback) {
  try {
    if (!value) return fallback;
    return new URL(value).host || fallback;
  } catch {
    return fallback;
  }
}

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/Authorization[^\n]*/gi, "auth header [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]");
}

function loadDotenv() {
  if (!existsSync(".env")) return;
  const content = readFileSync(".env", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function renderEvidence(status, safeCases) {
  return `# V9.4 Tripo3D Provider Smoke

status: ${status}
date: ${DATE}

## Scope

Tripo3D real provider 3D generation readiness for V9.4. The current official
contract is task based: submit a task with \`POST /v2/openapi/task\`, then poll
\`GET /v2/openapi/task/{task_id}\` until completion. This evidence does not
prove 3D generation, provider integration readiness, or broad 3D readiness.

Sources reviewed:
- https://docs.tripo3d.ai/get-started/quick-start.html
- https://docs.tripo3d.ai/model-generation/text-to-model-v3-0-v3-1.html

## Results

\`\`\`json
${JSON.stringify(safeCases, null, 2)}
\`\`\`

## Decision

V9.4 remains blocked. No real Tripo3D provider upload was performed and no GLB
provider output was accepted.
`;
}
