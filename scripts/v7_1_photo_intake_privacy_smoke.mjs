import { spawnSync } from "node:child_process";

const cases = [];

record("desktop V7.1 unit coverage", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("real local photo metadata privacy boundary", run([
  "pnpm",
  "--filter",
  "desktop",
  "exec",
  "node",
  "--import",
  "tsx",
  "--eval",
  [
    "import { statSync } from 'node:fs';",
    "import { createPhotoIntakePrivacySession, buildPhotoIntakeEvidenceSnapshot, photoIntakeHasForbiddenContent } from './src/assets/photo-intake-privacy-boundary.ts';",
    "const stats = statSync('../../fixtures/manual/v5_12/orange_tabby_actions/idle.png');",
    "const session = createPhotoIntakePrivacySession({",
    "catName: 'Orange Tabby',",
    "approvedTraits: 'orange tabby amber eyes white chest curled tail',",
    "photo: { fileName: 'idle.png', mediaType: 'image/png', sizeBytes: stats.size },",
    "localReferenceConsent: true",
    "});",
    "const evidence = buildPhotoIntakeEvidenceSnapshot(session);",
    "if (session.status !== 'accepted' || session.reasonCode !== 'photo_privacy_boundary_ok') process.exit(2);",
    "if (photoIntakeHasForbiddenContent({ session, evidence })) process.exit(3);",
    "console.log(JSON.stringify({ status: session.status, reasonCode: session.reasonCode, photoReferenceMode: session.photoReferenceMode, safePhotoFields: evidence.safePhotoFields, privacyBoundary: session.privacyBoundary }, null, 2));"
  ].join("")
]));

const combined = JSON.stringify(cases.map(({ output, ...item }) => item));
cases.push({
  name: "security redaction scan",
  result: /(Authorization|api-token\.json|\/Users\/|raw payload|workspace path|config path|provider payload|prompt text|raw photo|EXIF|GPS|idle\.png|fixtures\/manual|sk-[A-Za-z0-9_-]{8,})/i.test(combined)
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
      return `status=${parsed.status} reasonCode=${parsed.reasonCode} photoReferenceMode=${parsed.photoReferenceMode}`;
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
    .replace(/fixtures\/manual\/[^\s]+/g, "[fixture]")
    .replace(/idle\.png/g, "[fixture-image]")
    .slice(0, 900);
}
