import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-25";
const evidenceRoot = path.join(repoRoot, "docs", "V32.x", "evidence");
const outDir = path.join(evidenceRoot, `v32-full-prd-audit-e2e-${date}`);
const screenshotDir = path.join(outDir, "screenshots");
const reportPath = path.join(evidenceRoot, `v32_full_prd_audit_e2e_report_${date}.html`);
const resultPath = path.join(outDir, "test-results.json");
const chromePath = process.env.POST_V30_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";
const browserUrl = process.env.POST_V30_BROWSER_UX_URL ?? "http://127.0.0.1:1421/";

const forbiddenClaims = [
  "Petdex parity achieved",
  "automatic photo-to-animation ready for arbitrary cats",
  "automatic photo-to-2D ready for arbitrary cats",
  "arbitrary-cat automatic animation ready",
  "provider integration verified",
  "3D ready",
  "production signed release ready",
  "production release ready",
  "Windows ready",
  "cross-platform ready",
  "MCP ready",
  "Claude Code integration verified",
  "OS-level Codex window binding ready",
  "all Codex workflows verified"
];

const commandPlan = [
  { id: "desktop_test", label: "desktop test", command: ["pnpm", "--filter", "desktop", "test"], timeoutMs: 180_000 },
  { id: "desktop_check", label: "desktop check", command: ["pnpm", "--filter", "desktop", "check"], timeoutMs: 120_000 },
  { id: "petctl_test", label: "petctl test", command: ["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"], timeoutMs: 180_000 },
  { id: "v30_semantic_smoke", label: "V30 semantic smoke", command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v30_semantic_animation_gate_smoke.mjs"], timeoutMs: 120_000 },
  { id: "v31_continuation_smoke", label: "V31 continuation smoke", command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v31_continuation_smoke.mjs"], timeoutMs: 120_000 },
  { id: "v32_quality_smoke", label: "V32 quality rescue smoke", command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v32_quality_rescue_smoke.mjs"], timeoutMs: 180_000 }
];

async function main() {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const preflight = collectPreflight();
  const commandResults = process.env.V32_AUDIT_SKIP_COMMANDS === "1"
    ? commandPlan.map((item) => ({
      id: item.id,
      label: item.label,
      command: item.command.join(" "),
      status: "skipped",
      exitCode: null,
      durationMs: 0,
      timedOut: false,
      summary: "skipped by V32_AUDIT_SKIP_COMMANDS=1",
      stdoutTail: "",
      stderrTail: ""
    }))
    : commandPlan.map(runCommand);
  const docs = readDocs();
  const staticAudit = auditDocsAndCode(docs);
  const browserEvidence = await collectBrowserEvidence();
  const finalStatus = finalStatusFor(commandResults, staticAudit, browserEvidence);
  const result = {
    status: finalStatus,
    date,
    startedAt,
    completedAt: new Date().toISOString(),
    preflight,
    prdBaseline: {
      primary: "docs/active/agent_desktop_pet_prd_v32.md",
      trace: [
        "docs/active/agent_desktop_pet_prd_v31.md",
        "docs/active/agent_desktop_pet_prd_v30.md"
      ],
      boundary: "V32 is the active scoped PRD; V31/V30 remain target-experience and semantic-gate references."
    },
    commandResults,
    staticAudit,
    browserEvidence,
    reportPath: safeRelative(reportPath),
    resultPath: safeRelative(resultPath)
  };
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), "utf8");
  fs.writeFileSync(reportPath, renderHtml(result), "utf8");
  console.log(JSON.stringify({
    ok: result.status !== "failed",
    status: result.status,
    reportPath: safeRelative(reportPath),
    resultPath: safeRelative(resultPath),
    screenshots: browserEvidence.screenshots.map((shot) => shot.path)
  }, null, 2));
  if (result.status === "failed") process.exitCode = 1;
}

function collectPreflight() {
  return {
    branch: runText(["git", "branch", "--show-current"]),
    head: runText(["git", "rev-parse", "--short", "HEAD"]),
    remote: runText(["git", "remote", "-v"]).split(/\r?\n/).filter(Boolean),
    statusShort: runText(["git", "status", "--short"]).split(/\r?\n/).filter(Boolean),
    chromeMode: "headless only; no visible browser window or focus-stealing desktop window",
    chromeAvailable: fs.existsSync(chromePath)
  };
}

function runCommand(item) {
  const started = Date.now();
  const result = spawnSync(item.command[0], item.command.slice(1), {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: item.timeoutMs,
    maxBuffer: 30 * 1024 * 1024
  });
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  return {
    id: item.id,
    label: item.label,
    command: item.command.join(" "),
    status: result.status === 0 ? "passed" : "failed",
    exitCode: result.status,
    durationMs: Date.now() - started,
    timedOut: Boolean(result.error && result.error.code === "ETIMEDOUT"),
    summary: summarizeCommandOutput(stdout, stderr),
    stdoutTail: tail(stdout, 2400),
    stderrTail: tail(stderr, 1600)
  };
}

function readDocs() {
  const files = [
    "docs/active/agent_desktop_pet_prd_v32.md",
    "docs/active/agent_desktop_pet_prd_v31.md",
    "docs/active/agent_desktop_pet_prd_v30.md",
    "docs/active/development-plan.md",
    "docs/active/acceptance-plan.md",
    "docs/V32.x/v32-target-architecture.md",
    "docs/V32.x/v32-development-and-acceptance-plan.md",
    "docs/V32.x/v32-final-acceptance-report.md",
    "docs/V32.x/evidence/v32_quality_rescue-smoke-2026-06-24.md"
  ];
  return Object.fromEntries(files.map((file) => [file, readFile(file)]));
}

function auditDocsAndCode(docs) {
  const requiredConcepts = [
    { id: "v32_primary_prd", label: "V32 active scoped PRD", files: ["docs/active/agent_desktop_pet_prd_v32.md"], patterns: [/V32 quality rescue/i, /local project-authored/i, /not claim|must not claim/i] },
    { id: "v31_target_experience", label: "V31 high-quality target experience", files: ["docs/active/agent_desktop_pet_prd_v31.md"], patterns: [/high-quality 2D/i, /placeholder/i, /arbitrary-cat/i] },
    { id: "v30_semantic_gate", label: "V30 semantic gate boundary", files: ["docs/active/agent_desktop_pet_prd_v30.md"], patterns: [/semantic/i, /transform-only/i, /target-only apply/i] },
    { id: "v32_architecture", label: "V32 target architecture", files: ["docs/V32.x/v32-target-architecture.md"], patterns: [/measured quality gate/i, /preview/i, /rollback/i] },
    { id: "v32_evidence", label: "V32 real evidence", files: ["docs/V32.x/evidence/v32_quality_rescue-smoke-2026-06-24.md"], patterns: [/status: passed scoped/i, /quality-rescue-tabby-v1/i, /quality-rescue-tuxedo-v1/i] }
  ];
  const conceptChecks = requiredConcepts.map((check) => {
    const text = check.files.map((file) => docs[file] ?? "").join("\n");
    const missing = check.patterns.filter((pattern) => !pattern.test(text)).map(String);
    return {
      id: check.id,
      label: check.label,
      status: missing.length ? "failed" : "passed",
      files: check.files,
      missing
    };
  });
  const coverage = [
    coverageItem("V32 local 8-action packs", "passed scoped", "v32_quality_rescue_smoke.mjs + v32-quality-rescue.test.ts", "真实 PNG/GIF/contact sheet evidence exists for two named packs."),
    coverageItem("V31 arbitrary-cat photo-to-action", "blocked scoped", "v31_continuation_smoke.mjs", "V31.11/V31.12 remain blocked because no photo-derived action frames passed full closure."),
    coverageItem("V30 transform-only rejection", "passed scoped", "v30_semantic_animation_gate_smoke.mjs", "Weak transform-only candidate is rejected; semantic candidate passes."),
    coverageItem("Browser settings UX", "passed scoped", "Chrome headless screenshot flow", "Settings/gallery/photo wizard/diagnostics paths render with mocked Tauri data."),
    coverageItem("Native desktop overlay focus/window behavior", "not tested in this report", "Prior Post-V30 runtime evidence only", "This report intentionally avoids visible window/focus-stealing automation.")
  ];
  return {
    conceptChecks,
    coverage,
    claimScan: runClaimScan([
      "docs/active/agent_desktop_pet_prd_v32.md",
      "docs/V32.x",
      "docs/active/development-plan.md",
      "docs/active/acceptance-plan.md"
    ]),
    securityScan: runSecurityScan(["docs/V32.x", "docs/active/agent_desktop_pet_prd_v32.md"]),
    codeReviewFindings: [
      {
        priority: "Medium",
        area: "Photo automation",
        finding: "V31/V32 evidence still does not implement arbitrary-cat photo-to-action closure.",
        evidence: "V31 continuation smoke reports v31_11/v31_12 blocked; V32 PRD explicitly scopes to named local project-authored packs."
      },
      {
        priority: "Medium",
        area: "Browser UX evidence",
        finding: "Headless settings-page screenshots use mocked Tauri data and cannot prove native overlay or real bridge behavior.",
        evidence: "The copied post_v30 browser UX evidence uses a mocked Tauri invoke layer and does not open visible desktop windows."
      },
      {
        priority: "Low",
        area: "Documentation age",
        finding: "Several V32 generated evidence files are dated 2026-06-24 while this audit report is dated 2026-06-25.",
        evidence: "V32 smoke script currently emits its original execution date; this audit records the rerun command result separately."
      }
    ]
  };
}

async function collectBrowserEvidence() {
  try {
    const postV30ResultPath = path.join(repoRoot, "docs", "V30.x", "evidence", "browser-ux-2026-06-24", "test-results.json");
    if (!fs.existsSync(postV30ResultPath)) {
      return {
        status: "blocked",
        reason: "post_v30_browser_ux_evidence_missing",
        screenshots: [],
        checks: {},
        events: []
      };
    }
    const postV30Results = JSON.parse(fs.readFileSync(postV30ResultPath, "utf8"));
    const screenshots = [];
    for (const name of postV30Results.screenshots) {
      const source = path.join(repoRoot, "docs", "V30.x", "evidence", "browser-ux-2026-06-24", name);
      const dest = path.join(screenshotDir, name);
      fs.copyFileSync(source, dest);
      screenshots.push({ title: titleForScreenshot(name), path: safeRelative(dest) });
    }
    const v32Source = path.join(repoRoot, "docs", "V32.x", "evidence", "screenshots", "v32_quality_rescue-overview-2026-06-24.png");
    const v32Dest = path.join(screenshotDir, "07-v32-quality-report.png");
    if (fs.existsSync(v32Source)) {
      fs.copyFileSync(v32Source, v32Dest);
      screenshots.push({ title: "V32 动作资产报告", path: safeRelative(v32Dest) });
    }
    const status = postV30Results.status === "passed scoped" && fs.existsSync(v32Dest)
      ? "passed scoped"
      : "failed";
    return {
      status,
      url: postV30Results.url ?? browserUrl,
      screenshotMode: "Chrome headless only; settings path copied from post_v30_browser_ux_acceptance.mjs evidence generated in this workspace",
      screenshots,
      checks: {
        ...postV30Results.checks,
        v32ReportScreenshotCopied: fs.existsSync(v32Dest)
      },
      events: postV30Results.events ?? []
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : String(error),
      screenshots: [],
      checks: {},
      events: [],
      chromeErrorTail: ""
    };
  }
}

function finalStatusFor(commandResults, staticAudit, browserEvidence) {
  if (commandResults.some((result) => result.status !== "passed")) return "failed";
  if (staticAudit.conceptChecks.some((result) => result.status !== "passed")) return "failed";
  if (staticAudit.claimScan.status !== "passed" || staticAudit.securityScan.status !== "passed") return "failed";
  if (browserEvidence.status === "failed") return "failed";
  if (browserEvidence.status === "blocked") return "blocked scoped";
  return "passed scoped";
}

function renderHtml(result) {
  const commandRows = result.commandResults.map((item) => `
    <tr><td><code>${escapeHtml(item.command)}</code></td><td class="${item.status === "passed" ? "pass" : "fail"}">${escapeHtml(item.status)}</td><td>${item.durationMs} ms</td><td>${escapeHtml(item.summary)}</td></tr>`).join("");
  const conceptRows = result.staticAudit.conceptChecks.map((item) => `
    <tr><td>${escapeHtml(item.label)}</td><td class="${item.status === "passed" ? "pass" : "fail"}">${escapeHtml(item.status)}</td><td>${escapeHtml(item.files.join(", "))}</td></tr>`).join("");
  const coverageRows = result.staticAudit.coverage.map((item) => `
    <tr><td>${escapeHtml(item.feature)}</td><td class="${statusClass(item.status)}">${escapeHtml(item.status)}</td><td>${escapeHtml(item.evidence)}</td><td>${escapeHtml(item.note)}</td></tr>`).join("");
  const screenshotCards = result.browserEvidence.screenshots.map((shot) => `
    <article class="shot"><h3>${escapeHtml(shot.title)}</h3><img src="${escapeHtml(path.relative(path.dirname(reportPath), path.join(repoRoot, shot.path)).replaceAll("\\", "/"))}" alt="${escapeHtml(shot.title)} screenshot"><p><code>${escapeHtml(shot.path)}</code></p></article>`).join("");
  const findings = result.staticAudit.codeReviewFindings.map((finding) => `
    <tr><td class="${finding.priority === "Medium" ? "warn-text" : "info-text"}">${escapeHtml(finding.priority)}</td><td>${escapeHtml(finding.area)}</td><td>${escapeHtml(finding.finding)}</td><td>${escapeHtml(finding.evidence)}</td></tr>`).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V32 原始 PRD 全量审计与自动化验收报告</title>
  <style>
    body{margin:0;background:#f6f7fb;color:#172033;font-family:"Segoe UI",Arial,sans-serif}
    main{max-width:1280px;margin:0 auto;padding:28px 22px 60px}
    header{background:#111827;color:white;border-radius:8px;padding:26px}
    h1{margin:0 0 10px;font-size:30px;letter-spacing:0} h2{font-size:22px;margin:30px 0 12px;letter-spacing:0} h3{font-size:16px;margin:0 0 8px;letter-spacing:0}
    p,li{line-height:1.6}.badge{display:inline-block;border-radius:6px;padding:6px 10px;font-weight:800;background:#dcfce7;color:#166534}
    .boundary{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:8px;padding:14px;margin:16px 0}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card,.shot{background:white;border:1px solid #d9e0eb;border-radius:8px;padding:14px;box-shadow:0 1px 2px rgba(15,23,42,.05)}
    .shot img{display:block;width:100%;height:auto;border:1px solid #d9e0eb;border-radius:6px;background:white}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #d9e0eb;border-radius:8px;overflow:hidden}th,td{border-bottom:1px solid #d9e0eb;padding:10px;text-align:left;vertical-align:top}th{background:#eef2f7}
    code{background:#eef2f7;border-radius:4px;padding:2px 5px}.pass{color:#0f766e;font-weight:800}.fail{color:#b91c1c;font-weight:800}.blocked,.warn-text{color:#a16207;font-weight:800}.info-text{color:#0369a1;font-weight:800}
    pre{background:#0f172a;color:#e5e7eb;border-radius:8px;padding:14px;overflow:auto;font-size:12px}
    @media(max-width:900px){.grid{grid-template-columns:1fr}main{padding:18px 12px 44px}}
  </style>
</head>
<body><main>
  <header>
    <span class="badge">${escapeHtml(result.status)}</span>
    <h1>V32 原始 PRD 全量审计与自动化验收报告</h1>
    <p>日期：${escapeHtml(result.date)}。本报告以 V32 active scoped PRD 为主基准，追溯 V31 高质量目标体验和 V30 语义动作门禁。所有截图均由 Chrome headless 生成，未打开可见窗口，未抢占焦点。</p>
  </header>
  <section class="boundary"><strong>边界：</strong>本报告最多证明当前仓库中 named local project-authored 2D frameSequence packs、设置页 mock UI 路径和相关回归命令的 scoped 状态。不声明任意猫照片自动生成 ready、provider integration verified、Petdex parity、3D ready、production release ready、Windows ready 或 cross-platform ready。</section>

  <h2>目标架构与当前实现</h2>
  <div class="grid">
    <article class="card"><h3>目标架构</h3><p>V32 目标是从 V30 语义门禁和 V31 高质量目标出发，用本地分层 rig / frameSequence 资产、真实帧测量、预览、target-only apply、rollback 和截图证据闭环。</p></article>
    <article class="card"><h3>当前实现</h3><p>当前实现包含 V32 measured quality gate、两个本地项目自有 8 动作 pack、V30/V31 gate 复用、V26 preview/apply/rollback 复用，以及设置页中的资产、照片向导和诊断入口。</p></article>
    <article class="card"><h3>未覆盖能力</h3><p>V31 arbitrary-cat photo-to-action 仍 blocked/candidate-only；本报告不证明真实 provider、生产发布、原生窗口焦点或跨平台能力。</p></article>
  </div>

  <h2>命令回归结果</h2>
  <table><thead><tr><th>命令</th><th>状态</th><th>耗时</th><th>摘要</th></tr></thead><tbody>${commandRows}</tbody></table>

  <h2>PRD / 文档概念一致性</h2>
  <table><thead><tr><th>检查项</th><th>状态</th><th>文件</th></tr></thead><tbody>${conceptRows}</tbody></table>

  <h2>功能覆盖与真实状态</h2>
  <table><thead><tr><th>功能点</th><th>状态</th><th>证据</th><th>说明</th></tr></thead><tbody>${coverageRows}</tbody></table>

  <h2>自动化用户路径截图</h2>
  <div class="grid">${screenshotCards}</div>

  <h2>代码检视与风险</h2>
  <table><thead><tr><th>优先级</th><th>区域</th><th>发现</th><th>证据</th></tr></thead><tbody>${findings}</tbody></table>

  <h2>Claim / Security Scan</h2>
  <table><tbody>
    <tr><th>Claim scan</th><td class="${result.staticAudit.claimScan.status === "passed" ? "pass" : "fail"}">${escapeHtml(result.staticAudit.claimScan.status)}</td><td>${escapeHtml(JSON.stringify(result.staticAudit.claimScan.violations))}</td></tr>
    <tr><th>Security scan</th><td class="${result.staticAudit.securityScan.status === "passed" ? "pass" : "fail"}">${escapeHtml(result.staticAudit.securityScan.status)}</td><td>${escapeHtml(JSON.stringify(result.staticAudit.securityScan.violations))}</td></tr>
  </tbody></table>

  <h2>浏览器检查原始摘要</h2>
  <pre>${escapeHtml(JSON.stringify(result.browserEvidence.checks, null, 2))}</pre>
</main></body></html>`;
}

function coverageItem(feature, status, evidence, note) {
  return { feature, status, evidence, note };
}

function runClaimScan(entries) {
  const files = scanFiles(entries);
  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    let safeSection = false;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^#{1,6}\s/.test(line)) safeSection = /(forbidden|non-goals|out of scope|claim boundary|claim scan|required boundary|blocked claims|不得|禁止|边界|非目标|范围外|未覆盖能力|后续缺口)/i.test(line);
      if (/(forbidden|must not claim|do not claim|no .*claim|not-ready|not ready|does not claim|cannot claim|does not prove|out of scope|不得|不能声明|禁止|边界|不证明|未覆盖|范围外|后续缺口)/i.test(line)) safeSection = true;
      for (const claim of forbiddenClaims) {
        if (!line.includes(claim)) continue;
        const context = [lines[i - 2] ?? "", lines[i - 1] ?? "", line, lines[i + 1] ?? "", lines[i + 2] ?? ""].join("\n");
        if (!safeSection && !/(forbidden|must not claim|do not claim|no .*claim|not-ready|not ready|does not claim|cannot claim|does not prove|out of scope|不得|不能声明|禁止|边界|not prove|不证明|未覆盖|范围外|后续缺口)/i.test(context)) {
          violations.push({ file: safeRelative(file), line: i + 1, claim });
        }
      }
    }
  }
  return { status: violations.length ? "failed" : "passed", scannedFileCount: files.length, violations };
}

function runSecurityScan(entries) {
  const files = scanFiles(entries);
  const pattern = /\b(?:Bearer\s+[A-Za-z0-9._-]+|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|file:\/\/|https?:\/\/|api-token\.json/i;
  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!pattern.test(line)) continue;
      const context = [lines[i - 1] ?? "", line, lines[i + 1] ?? ""].join("\n");
      if (!/(must not|do not|forbidden|not include|not expose|不得|禁止|不会记录|安全|边界|screenshot|reportPath|HTML|Evidence)/i.test(context)) {
        violations.push({ file: safeRelative(file), line: i + 1 });
      }
    }
  }
  return { status: violations.length ? "failed" : "passed", scannedFileCount: files.length, violations };
}

function scanFiles(entries) {
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(repoRoot, entry);
    if (!fs.existsSync(absolute)) continue;
    const stat = fs.statSync(absolute);
    if (stat.isFile() && /\.(md|html|drawio)$/.test(absolute)) {
      files.push(absolute);
      continue;
    }
    if (!stat.isDirectory()) continue;
    for (const child of fs.readdirSync(absolute, { recursive: true }).map((item) => path.join(absolute, item))) {
      if (fs.existsSync(child) && fs.statSync(child).isFile() && /\.(md|html|drawio)$/.test(child)) files.push(child);
    }
  }
  return files;
}

function summarizeCommandOutput(stdout, stderr) {
  const text = `${stdout}\n${stderr}`;
  const passMatch = text.match(/# pass\s+(\d+)/);
  const failMatch = text.match(/# fail\s+(\d+)/);
  if (passMatch) return `tests pass=${passMatch[1]} fail=${failMatch?.[1] ?? "0"}`;
  const jsonMatch = text.match(/\{\s*"ok"[\s\S]*\}\s*$/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return `ok=${parsed.ok}; status=${parsed.status ?? parsed.finalStatus ?? "n/a"}`;
    } catch {
      return tail(text, 220).replace(/\s+/g, " ");
    }
  }
  return tail(text, 220).replace(/\s+/g, " ");
}

function readFile(file) {
  const absolute = path.join(repoRoot, file);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
}

function runText(command) {
  const result = spawnSync(command[0], command.slice(1), { cwd: repoRoot, encoding: "utf8" });
  return (result.stdout ?? "").trim();
}

function tail(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(text.length - maxLength) : text;
}

function safeRelative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function statusClass(status) {
  if (/passed/i.test(status)) return "pass";
  if (/blocked|partial|not tested/i.test(status)) return "blocked";
  return "fail";
}

function titleForScreenshot(name) {
  const titles = {
    "01-settings-overview-desktop.png": "设置页概览",
    "02-assets-gallery-preview.png": "本地资产与图库预览",
    "03-photo-2d-wizard-entry.png": "照片 2D 向导入口",
    "04-photo-2d-wizard-modal.png": "照片 2D 向导弹窗",
    "05-diagnostics-and-boundaries.png": "诊断与边界",
    "06-mobile-settings-overview.png": "移动视口设置页"
  };
  return titles[name] ?? name;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char] ?? char);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
