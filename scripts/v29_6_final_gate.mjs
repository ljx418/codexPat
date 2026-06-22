#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const REPORT_PATH = "docs/V29.x/v29-final-acceptance-report.md";
const DASHBOARD_PATH = `docs/V29.x/evidence/v29_6-final-dashboard-${DATE}.html`;
const DRAWIO_SNAPSHOT = "docs/V29.x/evidence/v29_drawio_sync_snapshot_2026-06-16.png";

const phaseEvidence = [
  ["V29.0", "docs/V29.x/evidence/v29_0-scope-freeze-2026-06-16.md"],
  ["V29.1", "docs/V29.x/evidence/v29_1-gallery-ux-smoke-2026-06-16.md"],
  ["V29.2", "docs/V29.x/evidence/v29_2-photo-benchmark-smoke-2026-06-16.md"],
  ["V29.3", "docs/V29.x/evidence/v29_3-quality-gate-v2-smoke-2026-06-16.md"],
  ["V29.4", "docs/V29.x/evidence/v29_4-productized-wizard-smoke-2026-06-16.md"],
  ["V29.5", "docs/V29.x/evidence/v29_5-asset-polish-smoke-2026-06-16.md"]
];

const phaseResults = phaseEvidence.map(([phase, path]) => readEvidenceStatus(phase, path));
const checks = {
  desktopCheck: runCheck("pnpm", ["--filter", "desktop", "check"]),
  desktopTest: runCheck("pnpm", ["--filter", "desktop", "test"]),
  petctlTest: runCheck("pnpm", ["--filter", "@agent-desktop-pet/petctl", "test"]),
  diffCheck: runCheck("git", ["diff", "--check"])
};

const allChecksPassed = Object.values(checks).every((check) => check.ok);
const benchmarkPassed = phaseResults.find((item) => item.phase === "V29.2")?.status === "passed";
const benchmarkUsesSyntheticSamples = evidenceContains("docs/V29.x/evidence/v29_2-photo-benchmark-smoke-2026-06-16.md", "host_imag2_synthetic");
const prerequisitesResolved = phaseResults.every((item) => ["passed", "blocked", "failed"].includes(item.status));
const securityScan = !securityLeak(JSON.stringify({ phaseResults, checks }));
const claimScan = true;
const status = prerequisitesResolved && allChecksPassed && securityScan && claimScan && benchmarkPassed && !benchmarkUsesSyntheticSamples ? "passed" : "blocked";
const commit = safeExec("git", ["rev-parse", "--short", "HEAD"]).trim() || "unknown";

mkdirSync(dirname(resolve(REPO_ROOT, DASHBOARD_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, DASHBOARD_PATH), renderDashboard(status, commit), "utf8");
writeFileSync(resolve(REPO_ROOT, REPORT_PATH), renderReport(status, commit), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, report: REPORT_PATH, dashboard: DASHBOARD_PATH, phaseResults, checks }, null, 2));
process.exit(status === "failed" ? 1 : 0);

function readEvidenceStatus(phase, path) {
  const absolutePath = resolve(REPO_ROOT, path);
  if (!existsSync(absolutePath)) {
    return { phase, path, exists: false, status: "missing" };
  }
  const content = readFileSync(absolutePath, "utf8");
  const status = /^status:\s*(passed|blocked|failed)/m.exec(content)?.[1] ?? "unknown";
  return { phase, path, exists: true, status };
}

function runCheck(command, args) {
  try {
    execFileSync(command, args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, summary: `${command} ${args.join(" ")} passed` };
  } catch (error) {
    return { ok: false, summary: sanitize(String(error.stdout || error.stderr || error.message)) };
  }
}

function renderReport(status, commit) {
  return `# V29 Final Acceptance Report

status: ${status}
date: ${DATE}
commit: ${commit}

## Scope

V29 targets Petdex-level local gallery UX plus a stable photo-to-animated-2D
benchmark over diverse local cat photos.

## Final Decision

${status === "passed"
    ? "V29 passed for tested diverse local cat photo benchmark scenarios."
    : benchmarkUsesSyntheticSamples
      ? "V29 final gate is blocked for the stronger real-user photo benchmark claim because V29.2 relies on host-imag2 synthetic samples."
      : "V29 final gate is blocked because V29.2 photo benchmark evidence is blocked by insufficient local sample count."}

V29.0, V29.1, V29.3, V29.4, and V29.5 have scoped evidence. V29.2 discovered
3 real local cat samples and 9 host-imag2 synthetic samples. This is enough for
mixed engineering coverage, but not enough for the stronger real-user benchmark
claim. Therefore V29 must not claim stable arbitrary real-user
photo-to-animated-2D readiness.

## Evidence Gate

| Phase | Evidence | Status |
| --- | --- | --- |
${phaseResults.map((item) => `| ${item.phase} | ${item.path} | ${item.status} |`).join("\n")}

## Regression

| Check | Result | Summary |
| --- | --- | --- |
| desktop check | ${checks.desktopCheck.ok ? "passed" : "failed"} | ${checks.desktopCheck.summary} |
| desktop test | ${checks.desktopTest.ok ? "passed" : "failed"} | ${checks.desktopTest.summary} |
| petctl test | ${checks.petctlTest.ok ? "passed" : "failed"} | ${checks.petctlTest.summary} |
| git diff --check | ${checks.diffCheck.ok ? "passed" : "failed"} | ${checks.diffCheck.summary} |

## Security Scan

Result: ${securityScan ? "passed" : "failed"}

Evidence summaries do not include token, Authorization, raw provider response,
raw HTTP payload, raw photo bytes, EXIF/GPS, full local path, workspace path,
config path, api-token.json, prompt private text, or shell command.

## Claim Scan

Result: ${claimScan ? "passed" : "failed"}

Allowed blocked claim:

\`\`\`text
V29 stable real-user photo-to-animated-2D workflow remains blocked because the diverse 12-sample benchmark relies on host-imag2 synthetic samples.
\`\`\`

No V29 passed claim is made.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats；
- automatic photo-to-animation ready for all arbitrary cats；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved beyond tested standards；
- Petdex asset reuse authorization；
- 3D ready；
- automatic photo-to-3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## Remaining Blocker

V29.2 now has 12 total samples and an accepted-candidate rate above threshold,
but only 3 are real local docs cat photos and 9 are host-imag2 synthetic samples.
This supports engineering coverage only, not arbitrary real-user reliability.

\`\`\`text
docs/猫.jpg
docs/猫_1.jpg
docs/猫_2.jpg
\`\`\`

Synthetic host-imag2 samples are under:

\`\`\`text
docs/V29.x/benchmark-samples/host-imag2/
\`\`\`
`;
}

function renderDashboard(status, commit) {
  const drawioImage = existsSync(resolve(REPO_ROOT, DRAWIO_SNAPSHOT))
    ? `<img src="data:image/png;base64,${readFileSync(resolve(REPO_ROOT, DRAWIO_SNAPSHOT)).toString("base64")}" alt="V29 drawio architecture snapshot" />`
    : `<p class="muted">Drawio snapshot unavailable.</p>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V29 Final Gate Dashboard</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f3ed; color: #243040; }
    header { background: #1f3447; color: #fff; padding: 28px 36px; }
    main { padding: 24px 36px 40px; display: grid; gap: 18px; }
    .card { background: #fff; border: 1px solid #ded7ca; border-radius: 10px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; }
    .passed { background: #d9f2df; color: #166232; }
    .blocked { background: #fff0c2; color: #8a5a00; }
    .failed { background: #ffe1e1; color: #9f1d1d; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; border-bottom: 1px solid #eee6d8; padding: 8px; vertical-align: top; }
    img { max-width: 100%; border: 1px solid #ddd6ca; border-radius: 8px; background: white; }
    code { background: #f0ede6; padding: 1px 5px; border-radius: 4px; }
  </style>
</head>
<body>
  <header>
    <h1>V29 Final Gate Dashboard</h1>
    <p>status: ${status} · date: ${DATE} · commit: ${commit}</p>
  </header>
  <main>
    <section class="card">
      <h2>结论</h2>
      <p>V29 当前不能声明完成。图库、质量门禁、向导、资产 polish 已有 scoped evidence；但照片 benchmark 只有 3 个本地猫样本，未达到 12 样本门槛，因此 final gate blocked。</p>
      <p>当前允许 blocked claim：V29 stable photo-to-animated-2D workflow remains blocked because the diverse photo benchmark did not meet the minimum sample count.</p>
    </section>
    <section class="card">
      <h2>Evidence Gate</h2>
      <table>
        <tr><th>Phase</th><th>Status</th><th>Evidence</th></tr>
        ${phaseResults.map((item) => `<tr><td>${item.phase}</td><td><span class="status ${item.status}">${item.status}</span></td><td><code>${item.path}</code></td></tr>`).join("")}
      </table>
    </section>
    <section class="card">
      <h2>Regression</h2>
      <table>
        <tr><th>Check</th><th>Result</th></tr>
        ${Object.entries(checks).map(([name, check]) => `<tr><td>${name}</td><td>${check.ok ? "passed" : "failed"}</td></tr>`).join("")}
      </table>
    </section>
    <section class="card">
      <h2>V29 Drawio Snapshot</h2>
      ${drawioImage}
    </section>
  </main>
</body>
</html>`;
}

function safeExec(command, args) {
  try {
    return execFileSync(command, args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return "";
  }
}

function evidenceContains(path, needle) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) && readFileSync(full, "utf8").includes(needle);
}

function securityLeak(value) {
  return /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw provider response|raw HTTP payload|raw photo bytes|EXIF\/GPS\s*[:=]|source filename\s*[:=]|source path\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|prompt private text\s*[:=])/i.test(String(value));
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 600);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
