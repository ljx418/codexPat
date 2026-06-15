import { spawnSync } from "node:child_process";

const cases = [];

record("desktop V7.4 provider boundary tests", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("feasibility-only consent boundary", run([
  "pnpm",
  "--filter",
  "desktop",
  "exec",
  "node",
  "--import",
  "tsx",
  "--eval",
  [
    "import { createProviderConsentBoundaryReview, providerConsentBoundaryHasForbiddenSecret } from './src/assets/provider-consent-boundary.ts';",
    "const review = createProviderConsentBoundaryReview({",
    "providerName: 'User selected external tool',",
    "uploadConsent: true,",
    "costDisclosureAccepted: true,",
    "privacyRetentionAccepted: true,",
    "licenseAttributionAccepted: true",
    "});",
    "if (review.status !== 'accepted' || review.reasonCode !== 'provider_feasibility_boundary_ok') process.exit(2);",
    "if (review.providerExecutionAllowed || review.providerUploadAllowed || review.acceptsProviderSecret) process.exit(3);",
    "if (!review.outputMustPassLocalValidation) process.exit(4);",
    "if (providerConsentBoundaryHasForbiddenSecret(review)) process.exit(5);",
    "console.log(JSON.stringify({ status: review.status, reasonCode: review.reasonCode, providerExecutionAllowed: review.providerExecutionAllowed, providerUploadAllowed: review.providerUploadAllowed, outputMustPassLocalValidation: review.outputMustPassLocalValidation }, null, 2));"
  ].join("")
]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "security redaction scan",
  result: /(api-token\.json|\/Users\/|raw payload|workspace path|config path|raw provider response|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|api[_-]?key\s*[:=]\s*[^"'\s]+|cookie\s*[:=]\s*[^"'\s]+)/i.test(combined)
    ? "failed"
    : "passed",
  details: "ok"
});

const failed = cases.filter((item) => item.result === "failed");
console.log(JSON.stringify({
  status: failed.length ? "failed" : "passed",
  cases: cases.map(({ output, ...item }) => item)
}, null, 2));
if (failed.length) {
  process.exit(1);
}

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`
  };
}

function record(name, result) {
  cases.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.ok ? summarize(result.output) : sanitize(result.output),
    output: result.output
  });
}

function summarize(value) {
  try {
    const parsed = JSON.parse(String(value).trim().split("\n").at(-1) || "{}");
    if (parsed.status && parsed.reasonCode) {
      return `status=${parsed.status} reasonCode=${parsed.reasonCode} execution=${parsed.providerExecutionAllowed} upload=${parsed.providerUploadAllowed}`;
    }
  } catch {
    // fall through
  }
  return "ok";
}

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/Authorization[^\n]*/gi, "Authorization [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 900);
}
