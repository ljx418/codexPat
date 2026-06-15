import { existsSync, readFileSync, writeFileSync } from "node:fs";

loadDotenv();

const DATE = "2026-06-03";
const EVIDENCE_PATH = `docs/V9.x/evidence/v9_1-provider-readiness-consent-smoke-${DATE}.md`;
const cases = [];

const providers = [
  readiness("MiniMax", {
    key: "MINIMAX_API_KEY",
    consent: "MINIMAX_PROVIDER_SMOKE_CONSENT",
    terms: "MINIMAX_PROVIDER_TERMS_ACCEPTED",
    endpoint: "MINIMAX_API_BASE_URL",
    defaultHost: "api.minimaxi.com"
  }),
  readiness("Tripo3D", {
    key: "TRIPO_API_KEY",
    consent: "TRIPO_PROVIDER_SMOKE_CONSENT",
    terms: "TRIPO_PROVIDER_TERMS_ACCEPTED",
    endpoint: "TRIPO_API_BASE_URL",
    defaultHost: "api.tripo3d.ai"
  })
];

for (const provider of providers) {
  cases.push({
    name: `${provider.providerName} readiness`,
    result: provider.reasonCode === "provider_ready_redacted" ? "passed" : "blocked",
    details: `reasonCode=${provider.reasonCode}; credentialState=${provider.credentialState}; endpointHost=${provider.endpointHost}`
  });
}

const safePayload = JSON.stringify({ providers, cases });
cases.push({
  name: "security redaction scan",
  result: forbiddenPattern().test(safePayload) ? "failed" : "passed",
  details: "provider readiness summary contains no token, auth header, raw payload, prompt text, raw provider response, full local path, workspace path, or config path"
});

const failed = cases.filter((item) => item.result === "failed");
const blocked = cases.filter((item) => item.result === "blocked");
const status = failed.length ? "failed" : blocked.length ? "blocked" : "passed";
writeFileSync(EVIDENCE_PATH, renderEvidence(status, providers, cases), "utf8");

console.log(JSON.stringify({
  status,
  evidencePath: EVIDENCE_PATH,
  providers,
  cases
}, null, 2));

if (failed.length) process.exit(1);
if (blocked.length) process.exit(2);

function readiness(providerName, env) {
  const hasKey = Boolean(process.env[env.key]?.trim());
  const hasConsent = process.env[env.consent] === "yes" || process.env[env.consent] === "true";
  const hasTerms = process.env[env.terms] === "yes" || process.env[env.terms] === "true";
  const endpointHost = safeEndpointHost(process.env[env.endpoint], env.defaultHost);
  let reasonCode = "provider_ready_redacted";
  if (!hasKey) reasonCode = "provider_credential_missing";
  else if (!hasConsent) reasonCode = "provider_consent_required";
  else if (!hasTerms) reasonCode = "provider_terms_unreviewed";
  return {
    providerName,
    credentialState: hasKey ? "configured" : "missing",
    consent: hasConsent,
    termsReviewed: hasTerms,
    endpointHost,
    reasonCode
  };
}

function safeEndpointHost(value, fallback) {
  try {
    return value ? new URL(value).host : fallback;
  } catch {
    return fallback;
  }
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
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function forbiddenPattern() {
  return /(Authorization|api-token\.json|\/Users\/|raw payload|raw prompt|raw provider response|raw photo|prompt text|workspace path|config path|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|api[_-]?key\s*[:=]\s*[^"'\s]+)/i;
}

function renderEvidence(status, providers, cases) {
  return `# V9.1 Provider Readiness Consent Smoke

status: ${status}
date: ${DATE}

## Scope

V9.1 checks local provider readiness and consent state without printing
credentials. It does not perform provider execution.

## Provider Summary

\`\`\`json
${JSON.stringify(providers, null, 2)}
\`\`\`

## Case Results

| Case | Result | Details |
| --- | --- | --- |
${cases.map((item) => `| ${item.name} | ${item.result} | ${item.details} |`).join("\n")}

## Decision

${status === "passed" ? "V9.1 provider readiness and consent smoke passed for tested redacted local provider configuration." : status === "blocked" ? "V9.1 blocked for at least one provider; only providers with provider_ready_redacted may proceed to execution." : "V9.1 failed."}
`;
}
