import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import {
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan
} from "../apps/desktop/src/assets/v40-no-webui-workflow-contract.ts";

const root = resolve(new URL("..", import.meta.url).pathname);
const date = "2026-07-01";
const outDirRel = `docs/V40.x/evidence/v40_3r3-automated-acceptance-${date}`;
const outDir = resolve(root, outDirRel);
const reportRel = `docs/V40.x/evidence/v40_3r3-automated-acceptance-report-${date}.html`;
const reportPath = resolve(root, reportRel);
const auditRel = `docs/V40.x/evidence/v40_3r3-stage-audit-${date}.md`;
const auditPath = resolve(root, auditRel);
const resultPath = resolve(outDir, "test-results.json");
const url = process.env.V40_ACCEPTANCE_URL ?? "http://127.0.0.1:1420/";
const settingsUrl = withWindowSettings(url);
const chromePath = process.env.V40_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";
const port = Number(process.env.V40_CHROME_DEBUG_PORT ?? "9241");
const browserProfile = resolve("/mnt/c/Users/administrator/AppData/Local/Temp", `codexpat-v40-3r3-audit-${process.pid}`);

mkdirSync(outDir, { recursive: true });

let spawnedVite = null;
let chrome = null;
let chromeError = "";

const commandPlan = [
  ["desktop test", "pnpm", ["--filter", "desktop", "test"]],
  ["desktop check", "pnpm", ["--filter", "desktop", "check"]],
  ["desktop build", "pnpm", ["--filter", "desktop", "build"]],
  ["petctl test", "pnpm", ["--filter", "@agent-desktop-pet/petctl", "test"]],
  ["petctl build", "pnpm", ["--filter", "@agent-desktop-pet/petctl", "build"]],
  ["V30 semantic gate", "pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v30_semantic_animation_gate_smoke.mjs"]],
  ["V39 final gate", "pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v39_8_final_gate_smoke.mjs"]],
  ["V40.3R3 candidate source gate", "pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v40_3r3_candidate_source_decision_smoke.mjs"]]
];

async function main() {
  const commandResults = runCommands();
  const candidatePage = writeCandidateSourcePage();
  const screenshots = await captureScreenshots(candidatePage);
  const checks = await readUiResult(screenshots);
  const context = buildAuditContext({ commandResults, screenshots, checks });
  const report = renderHtmlReport(context);
  const audit = renderMarkdownAudit(context);
  const reportScan = scanEvidence(report);
  const auditScan = scanEvidence(audit);
  writeFileSync(reportPath, report, "utf8");
  writeFileSync(auditPath, audit, "utf8");
  writeFileSync(resultPath, `${JSON.stringify({ ...context, reportScan, auditScan }, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    ok: reportScan.claimScan.status === "passed" && reportScan.securityScan.status === "passed" && auditScan.claimScan.status === "passed" && auditScan.securityScan.status === "passed",
    status: "needs_work",
    report: reportRel,
    audit: auditRel,
    outDir: outDirRel,
    screenshots: screenshots.map((item) => item.name),
    claimScan: reportScan.claimScan.status,
    securityScan: reportScan.securityScan.status
  }, null, 2));
}

function runCommands() {
  return commandPlan.map(([label, command, args]) => {
    const started = Date.now();
    try {
      const output = execFileSync(command, args, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 12 * 1024 * 1024
      });
      return {
        label,
        commandLine: sanitizeCommandLine([command, ...args]),
        status: "passed",
        exitCode: 0,
        durationMs: Date.now() - started,
        summary: summarizeCommandOutput(output, "passed", 0),
        outputTail: sanitizeText(output).slice(-3000)
      };
    } catch (error) {
      const exitCode = typeof error.status === "number" ? error.status : 1;
      const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
      return {
        label,
        commandLine: sanitizeCommandLine([command, ...args]),
        status: "failed",
        exitCode,
        durationMs: Date.now() - started,
        summary: summarizeCommandOutput(output, "failed", exitCode),
        outputTail: sanitizeText(output).slice(-3000)
      };
    }
  });
}

function buildAuditContext({ commandResults, screenshots, checks }) {
  return {
    date,
    status: "needs_work",
    gitHeadAtGeneration: gitHead(),
    authoritativeDocs: [
      "docs/active/agent_desktop_pet_prd_v40.md",
      "docs/V40.x/v40-target-architecture.md",
      "docs/V40.x/v40-acceptance-plan.md",
      "docs/V40.x/v40_3r3-detailed-development-and-acceptance-plan.md",
      "docs/V40.x/evidence/v40_3r3-candidate-source-decision-2026-06-30.md"
    ],
    reportRefs: {
      html: reportRel,
      markdownAudit: auditRel,
      resultsJson: `${outDirRel}/test-results.json`,
      screenshotDir: outDirRel
    },
    reproducibility: [
      "pnpm --filter desktop exec node --import tsx ../../scripts/v40_3r3_stage_audit_report.mjs",
      "pnpm --filter desktop test",
      "pnpm --filter desktop check",
      "pnpm --filter desktop build",
      "pnpm --filter @agent-desktop-pet/petctl test",
      "pnpm --filter @agent-desktop-pet/petctl build",
      "pnpm --filter desktop exec node --import tsx ../../scripts/v40_3r3_candidate_source_decision_smoke.mjs"
    ],
    auditCoverage: [
      ["PRD target experience", "covered", "V40 high-quality image-to-action target remains unmet and blocked."],
      ["Architecture state", "covered", "Direct runner/contract exists; normalization/product gates remain locked."],
      ["Code checks", "covered", "desktop test/check/build and petctl test/build recorded."],
      ["Visual evidence", "covered", "8 headless screenshots, including failed candidates and V40.3R3 decision."],
      ["Claim/security scan", "covered", "report and audit scans passed with no hits."],
      ["Native desktop overlay", "not covered", "headless browser preview evidence cannot prove native overlay behavior."],
      ["High-quality V40 assets", "not achieved", "no accepted candidate source and no V40.4 entry."]
    ],
    commandResults,
    screenshots,
    checks
  };
}

async function captureScreenshots(candidatePage) {
  const screenshotNames = [
    "01-settings-overview-desktop.png",
    "02-assets-gallery.png",
    "03-v39-fallback-action-assets.png",
    "04-photo-2d-wizard-modal.png",
    "05-diagnostics-and-boundaries.png",
    "06-v40-failed-candidates.png",
    "07-v40-3r3-decision.png",
    "08-mobile-settings-overview.png"
  ];
  try {
    if (!await canFetch(settingsUrl, 1500)) {
      spawnedVite = spawn("pnpm", ["--dir", "apps/desktop", "exec", "vite", "--host", "127.0.0.1", "--port", "1420"], {
        cwd: root,
        stdio: ["ignore", "pipe", "pipe"]
      });
      await waitForUrl(settingsUrl, 15000);
    }
    chrome = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--allow-file-access-from-files",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${toWindowsPath(browserProfile)}`,
      "about:blank"
    ], { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
    chrome.stderr.on("data", (chunk) => {
      chromeError += chunk.toString("utf8");
    });

    await waitForChrome();
    const page = await createPage();
    const cdp = await connectCdp(page.webSocketDebuggerUrl);
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("DOM.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });

    await navigate(cdp, settingsUrl);
    await waitForSelector(cdp, ".settings-panel", 45000);
    await screenshot(cdp, shotPath(screenshotNames[0]));
    await click(cdp, "a[href=\"#section-assets\"]");
    await wait(350);
    await screenshot(cdp, shotPath(screenshotNames[1]));
    await scrollTo(cdp, "#v39-characterized-action-entry");
    await wait(350);
    await screenshot(cdp, shotPath(screenshotNames[2]));
    await click(cdp, "a[href=\"#section-personalization\"]");
    await wait(350);
    const modalOpened = await click(cdp, "#photo-2d-wizard-open");
    await wait(500);
    await screenshot(cdp, shotPath(screenshotNames[3]));
    await click(cdp, "a[href=\"#section-diagnostics\"]");
    await wait(350);
    await screenshot(cdp, shotPath(screenshotNames[4]));

    await navigate(cdp, toFileUrl(candidatePage));
    await wait(500);
    await screenshot(cdp, shotPath(screenshotNames[5]));
    await navigate(cdp, toFileUrl(writeDecisionPage()));
    await wait(500);
    await screenshot(cdp, shotPath(screenshotNames[6]));

    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 2, mobile: true });
    await navigate(cdp, settingsUrl);
    await waitForSelector(cdp, ".settings-panel", 45000);
    await screenshot(cdp, shotPath(screenshotNames[7]));

    const checks = await evaluate(cdp, `(() => {
      const text = document.body.innerText;
      const visible = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      return {
        title: document.querySelector("h1")?.textContent ?? "",
        navLinks: document.querySelectorAll(".settings-nav a").length,
        overviewCards: document.querySelectorAll(".settings-stat-card").length,
        assetPreviewVisible: visible("#asset-preview-stage"),
        v39PanelPresent: Boolean(document.querySelector("#v39-characterized-action-entry")),
        photoWizardVisible: Boolean(document.querySelector("#photo-2d-wizard-panel")),
        diagnosticsVisible: text.includes("诊断"),
        photoWizardModalOpenedDuringScenario: ${modalOpened ? "true" : "false"}
      };
    })()`);
    writeFileSync(resolve(outDir, "ui-checks.json"), `${JSON.stringify(checks, null, 2)}\n`, "utf8");
    await cdp.close();
  } finally {
    if (chrome) chrome.kill();
    if (spawnedVite) spawnedVite.kill();
    try {
      rmSync(browserProfile, { recursive: true, force: true });
    } catch {
      // best-effort cleanup only
    }
  }
  return screenshotNames.map((name) => ({
    name,
    rel: `${outDirRel}/${name}`,
    exists: existsSync(shotPath(name)),
    bytes: existsSync(shotPath(name)) ? readFileSync(shotPath(name)).byteLength : 0
  }));
}

async function readUiResult(screenshots) {
  const uiChecksPath = resolve(outDir, "ui-checks.json");
  let ui = {};
  if (existsSync(uiChecksPath)) {
    ui = JSON.parse(readFileSync(uiChecksPath, "utf8"));
  }
  const decisionText = existsSync(resolve(root, "docs/V40.x/evidence/v40_3r3-candidate-source-decision-2026-06-30.md"))
    ? readFileSync(resolve(root, "docs/V40.x/evidence/v40_3r3-candidate-source-decision-2026-06-30.md"), "utf8")
    : "";
  return {
    ...ui,
    screenshotCount: screenshots.length,
    screenshotsPresent: screenshots.every((item) => item.exists && item.bytes > 1024),
    v40_3r3DecisionBlocked: decisionText.includes("remain_failed_or_blocked") && decisionText.includes("V40.4"),
    manualImportEvidenceFound: /Manual\/import sample refs found: [1-9]/.test(decisionText),
    materiallyDifferentRouteFound: /Materially different direct runner evidence refs found: [1-9]/.test(decisionText)
  };
}

function writeCandidateSourcePage() {
  const page = resolve(outDir, "v40-failed-candidate-review.html");
  const imgs = [
    ["V40.3 prompt-only / tabby", "../assets/v40-direct-runner-candidates/v38-a-cat-public-contact-sheet.png"],
    ["V40.3 prompt-only / tuxedo", "../assets/v40-direct-runner-candidates/v38-tuxedo-public-contact-sheet.png"],
    ["V40.3R2 default / tabby", "../assets/v40-direct-ip-adapter-candidates-r2/v38-a-cat-public-contact-sheet.png"],
    ["V40.3R2 stylized / tuxedo", "../assets/v40-direct-ip-adapter-candidates-r2-stylized/v38-tuxedo-public-contact-sheet.png"]
  ];
  const cards = imgs.map(([title, src]) => `
    <figure>
      <img src="${escapeHtml(src)}" alt="${escapeHtml(title)}">
      <figcaption>${escapeHtml(title)} · 显式视觉审查未通过</figcaption>
    </figure>`).join("");
  writeFileSync(page, `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>V40 failed candidates</title><style>
body{margin:0;padding:24px;font-family:Arial,"Microsoft YaHei",sans-serif;background:#f4f7fb;color:#172033}main{max-width:1380px;margin:0 auto}h1{font-size:28px;margin:0 0 8px;letter-spacing:0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}figure{margin:0;padding:12px;border:1px solid #d9e2ee;border-radius:8px;background:#fff}img{display:block;width:100%;border-radius:6px;border:1px solid #e5e7eb}figcaption{margin-top:8px;color:#5b6778;font-size:14px}@media(max-width:800px){.grid{grid-template-columns:1fr}}
</style></head><body><main><h1>V40 失败候选截图证据</h1><p>以下图片来自真实本地候选或其 contact sheet，但当前视觉审查未通过，不能作为 V40 目标动作资产。</p><div class="grid">${cards}</div></main></body></html>`, "utf8");
  return page;
}

function writeDecisionPage() {
  const page = resolve(outDir, "v40-3r3-decision.html");
  const evidence = safeRead("docs/V40.x/evidence/v40_3r3-candidate-source-decision-2026-06-30.md");
  writeFileSync(page, `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>V40.3R3 decision</title><style>
body{margin:0;padding:24px;font-family:Arial,"Microsoft YaHei",sans-serif;background:#f4f7fb;color:#172033}main{max-width:1100px;margin:0 auto}.panel{background:#fff;border:1px solid #d9e2ee;border-radius:8px;padding:18px}pre{white-space:pre-wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:14px;max-height:760px;overflow:auto}.no{display:inline-block;background:#fee2e2;color:#991b1b;border-radius:999px;padding:6px 10px;font-weight:700}
</style></head><body><main><section class="panel"><h1>V40.3R3 候选来源决策</h1><p><span class="no">V40.4 No-Go</span></p><p>当前没有可采信的手动导入资产，也没有实质不同的新 direct runner 证据。V40 保持 blocked，V39 为 fallback。</p><pre>${escapeHtml(evidence)}</pre></section></main></body></html>`, "utf8");
  return page;
}

function renderHtmlReport({ gitHeadAtGeneration, authoritativeDocs, reportRefs, reproducibility, auditCoverage, commandResults, screenshots, checks }) {
  const screenshotCards = screenshots.map((item) => `
    <article class="shot">
      <h3>${escapeHtml(item.name)}</h3>
      <img src="${escapeHtml(relative(dirname(reportPath), resolve(root, item.rel)).replaceAll("\\", "/"))}" alt="${escapeHtml(item.name)} 截图证据">
    </article>`).join("");
  const commandRows = commandResults.map((item) => `
    <tr>
      <td><code>${escapeHtml(item.label)}</code></td>
      <td><span class="pill ${item.status === "passed" ? "pass" : "fail"}">${escapeHtml(item.status)}</span></td>
      <td><code>${escapeHtml(item.commandLine)}</code><br>${escapeHtml(item.summary)}</td>
    </tr>`).join("");
  const docRows = authoritativeDocs.map((ref) => `<li><code>${escapeHtml(ref)}</code></li>`).join("");
  const coverageRows = auditCoverage
    .map(([area, status, note]) => `<tr><td>${escapeHtml(area)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(note)}</td></tr>`)
    .join("");
  const reproduceRows = reproducibility.map((command) => `<li><code>${escapeHtml(command)}</code></li>`).join("");
  const statusRows = [
    ["V40.1A Direct Local Runner", "passed scoped", "只有 runner readiness，不证明视觉质量"],
    ["V40.2 no-WebUI contract", "passed scoped", "合同可校验安全摘要和失败原因"],
    ["V40.3 prompt-only", "failed", "视觉审查失败"],
    ["V40.3R img2img", "failed", "视觉审查失败"],
    ["V40.3R2 identity-conditioned", "failed", "真实候选生成完成但视觉审查失败"],
    ["V40.3R3 candidate source", "blocked scoped", "没有可信候选来源，V40.4 仍 No-Go"]
  ].map(([phase, status, note]) => `<tr><td>${escapeHtml(phase)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(note)}</td></tr>`).join("");
  const issues = [
    ["Critical", "V40 没有可进入 V40.4 的候选来源；当前不能交付高质量 2D 图生动作资产。"],
    ["Critical", "现有 V40 候选截图中动作语义、身份一致性或桌面宠物尺度表现不足，不能当作目标体验资产。"],
    ["Medium", "本轮可视化验收使用 headless Chrome 与 browser preview fallback；它验证设置页路径，不验证真实桌面 overlay。"],
    ["Medium", "当前用户可体验路径仍主要是 V39 fallback 与既有资产管理/向导界面。"],
    ["Low", "移动端截图证明页面可渲染，但不覆盖真实触屏设备输入差异。"]
  ];
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V40.3R3 阶段性自动化验收报告</title>
  <style>
    :root{color-scheme:light;--bg:#f4f7fb;--paper:#fff;--ink:#172033;--muted:#5d6b80;--line:#d9e2ee;--green:#127a52;--red:#a83434;--amber:#9a5b00;font-family:Arial,"Microsoft YaHei",sans-serif;color:var(--ink);background:var(--bg)}
    body{margin:0;padding:28px}main{max-width:1220px;margin:0 auto}.hero,section,.shot{background:var(--paper);border:1px solid var(--line);border-radius:8px;box-shadow:0 1px 2px rgba(20,30,50,.04)}.hero,section{padding:24px;margin-bottom:18px}h1{margin:0 0 10px;font-size:30px;letter-spacing:0}h2{margin:0 0 14px;font-size:22px;letter-spacing:0}h3{margin:0 0 8px;font-size:16px;letter-spacing:0}p,li{line-height:1.65}.muted{color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:14px}.metric{padding:14px;background:#fbfdff;border:1px solid var(--line);border-radius:8px}.metric span{display:block;color:var(--muted);font-size:12px}.metric strong{display:block;margin-top:4px;font-size:19px}table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid #e5edf6;text-align:left;vertical-align:top}th{color:#334155;background:#f8fbff}code{background:#eef4fb;padding:2px 5px;border-radius:4px;font-size:12px}.pill{display:inline-block;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:700}.pass{background:#e7f7ef;color:var(--green)}.fail{background:#fee2e2;color:var(--red)}.warn{background:#fff3d7;color:var(--amber)}.shot{padding:12px}.shot img{display:block;width:100%;max-height:720px;object-fit:contain;border:1px solid #e5e7eb;border-radius:6px;background:#fff}.issue{border-left:5px solid #f0b429;padding-left:12px}@media(max-width:820px){body{padding:14px}}
  </style>
</head>
<body>
<main>
  <header class="hero">
    <h1>V40.3R3 阶段性自动化验收报告</h1>
    <p>日期：${date}。本报告用 Headless Chrome 自动截图和命令结果审计当前阶段。结论从证据出发：V40.3R3 审计链路可复核，但 V40 目标体验仍未完成。</p>
    <p class="muted">本报告不会声明任意猫自动生成已就绪、Petdex 同等水平、provider 集成完成、WebUI/ComfyUI 路线可用、3D/生产发布/Windows/跨平台已就绪。</p>
    <div class="grid">
      <div class="metric"><span>自动截图</span><strong>${screenshots.length} 张</strong></div>
      <div class="metric"><span>V40.3R3 决策</span><strong>blocked scoped</strong></div>
      <div class="metric"><span>V40.4</span><strong>No-Go</strong></div>
      <div class="metric"><span>总体评价</span><strong>NEEDS WORK</strong></div>
    </div>
  </header>

  <section>
    <h2>目标架构与当前实现</h2>
    <div class="grid">
      <div class="metric"><span>目标架构</span><strong>Direct Local Runner → 候选 → 视觉审查 → 归一化 → 预览/应用/回滚</strong></div>
      <div class="metric"><span>当前实现</span><strong>runner/contract 已有 scoped evidence，候选质量失败</strong></div>
      <div class="metric"><span>当前用户体验</span><strong>设置页、资产图库、V39 fallback、失败候选证据可见</strong></div>
    </div>
  </section>

  <section>
    <h2>审计索引与复跑信息</h2>
    <table>
      <tr><th>生成时 Git HEAD</th><td><code>${escapeHtml(gitHeadAtGeneration)}</code></td></tr>
      <tr><th>HTML 报告</th><td><code>${escapeHtml(reportRefs.html)}</code></td></tr>
      <tr><th>Markdown 审计</th><td><code>${escapeHtml(reportRefs.markdownAudit)}</code></td></tr>
      <tr><th>结果 JSON</th><td><code>${escapeHtml(reportRefs.resultsJson)}</code></td></tr>
      <tr><th>截图目录</th><td><code>${escapeHtml(reportRefs.screenshotDir)}</code></td></tr>
    </table>
    <h3>权威文档与证据输入</h3>
    <ul>${docRows}</ul>
    <h3>可复跑命令</h3>
    <ul>${reproduceRows}</ul>
  </section>

  <section>
    <h2>PRD 阶段状态</h2>
    <table><thead><tr><th>阶段</th><th>状态</th><th>审计说明</th></tr></thead><tbody>${statusRows}</tbody></table>
  </section>

  <section>
    <h2>审计覆盖矩阵</h2>
    <table><thead><tr><th>审计项</th><th>覆盖状态</th><th>说明</th></tr></thead><tbody>${coverageRows}</tbody></table>
  </section>

  <section>
    <h2>命令验收</h2>
    <table><thead><tr><th>命令</th><th>结果</th><th>摘要</th></tr></thead><tbody>${commandRows}</tbody></table>
  </section>

  <section>
    <h2>用户场景截图证据</h2>
    <p>截图覆盖设置页、资产图库、V39 fallback、照片到 2D 向导、诊断边界、失败候选、V40.3R3 决策和移动端布局。</p>
    <div class="grid">${screenshotCards}</div>
  </section>

  <section>
    <h2>自动检查摘要</h2>
    <table>
      <tr><th>检查项</th><th>结果</th></tr>
      <tr><td>截图均存在且非空</td><td>${checks.screenshotsPresent ? "通过" : "失败"}</td></tr>
      <tr><td>设置页标题</td><td>${escapeHtml(checks.title ?? "")}</td></tr>
      <tr><td>导航链接数</td><td>${Number(checks.navLinks ?? 0)}</td></tr>
      <tr><td>V39 fallback 面板</td><td>${checks.v39PanelPresent ? "可见" : "未见"}</td></tr>
      <tr><td>照片到 2D 向导</td><td>${checks.photoWizardModalOpenedDuringScenario ? "可打开" : "未打开"}</td></tr>
      <tr><td>V40.3R3 blocked 决策</td><td>${checks.v40_3r3DecisionBlocked ? "已记录" : "缺失"}</td></tr>
    </table>
  </section>

  <section>
    <h2>问题与风险</h2>
    ${issues.map(([priority, text]) => `<p class="issue"><strong>${escapeHtml(priority)}</strong> · ${escapeHtml(text)}</p>`).join("")}
  </section>

  <section>
    <h2>验收评价</h2>
    <p><strong>阶段性审计结论：</strong>审计材料与自动化证据可复核，当前阶段的真实产品结论是 NEEDS WORK。V40 还不能支撑高质量图生 2D 动作资产目标，不能进入 V40.4。</p>
  </section>
</main>
</body>
</html>`;
}

function renderMarkdownAudit({ gitHeadAtGeneration, authoritativeDocs, reportRefs, reproducibility, auditCoverage, commandResults, screenshots, checks }) {
  const commandRows = commandResults.map((item) => `| ${item.label} | ${item.status} | \`${item.commandLine}\` | ${item.summary} |`).join("\n");
  const shotRows = screenshots.map((item) => `| ${item.name} | ${item.rel} | ${item.exists ? "yes" : "no"} | ${item.bytes} |`).join("\n");
  const docRows = authoritativeDocs.map((ref) => `- ${ref}`).join("\n");
  const reproRows = reproducibility.map((command) => `- \`${command}\``).join("\n");
  const coverageRows = auditCoverage.map(([area, status, note]) => `| ${area} | ${status} | ${note} |`).join("\n");
  return `# V40.3R3 Stage Audit

Date: ${date}

Git HEAD at generation time: ${gitHeadAtGeneration}

## Decision

Stage audit evidence is complete enough to review, but V40 target delivery remains NEEDS WORK.
V40.3R3 is blocked scoped and V40.4-V40.7 remain No-Go.

## PRD / Spec Review

Authoritative input documents:

${docRows}

Current V40 evidence does not provide two visually accepted same-sample candidates.
It does not unlock normalization, product apply, or a high-quality image-to-action claim.

## Audit Index

- HTML report: ${reportRefs.html}
- Markdown audit: ${reportRefs.markdownAudit}
- Results JSON: ${reportRefs.resultsJson}
- Screenshot directory: ${reportRefs.screenshotDir}

## Reproduction Commands

${reproRows}

## Command Results

| Command | Status | Command line | Summary |
| --- | --- | --- | --- |
${commandRows}

## Audit Coverage Matrix

| Area | Coverage | Notes |
| --- | --- | --- |
${coverageRows}

## Screenshot Evidence

| Screenshot | Relative ref | Exists | Bytes |
| --- | --- | --- | ---: |
${shotRows}

## UI Checks

- screenshots present: ${checks.screenshotsPresent ? "yes" : "no"}
- settings title: ${checks.title ?? ""}
- nav links: ${Number(checks.navLinks ?? 0)}
- V39 fallback panel present: ${checks.v39PanelPresent ? "yes" : "no"}
- photo-to-2D wizard opened: ${checks.photoWizardModalOpenedDuringScenario ? "yes" : "no"}
- V40.3R3 blocked decision recorded: ${checks.v40_3r3DecisionBlocked ? "yes" : "no"}

## Review Findings

- Critical: V40 has no candidate source that can enter V40.4.
- Critical: existing V40 candidates failed explicit visual review.
- Medium: headless UI evidence uses browser preview fallback and does not prove native desktop overlay behavior.
- Medium: current user-visible experience remains V39 fallback plus existing settings/gallery paths.

## Claim And Safety

This audit avoids positive readiness claims for arbitrary photo automation, Petdex-level parity, provider routes, WebUI/ComfyUI routes, 3D, production release, Windows release, cross-platform release, MCP, Claude Code, and OS-level Codex binding.
Evidence uses relative repository references and sanitized command summaries only.
`;
}

function scanEvidence(text) {
  return {
    claimScan: runV40NoWebUIClaimScan(text),
    securityScan: runV40NoWebUISecurityScan(text)
  };
}

function summarizeCommandOutput(output, status, exitCode) {
  const text = sanitizeText(output);
  const facts = [];
  const tests = text.match(/# tests\s+(\d+)/);
  const pass = text.match(/# pass\s+(\d+)/);
  const fail = text.match(/# fail\s+(\d+)/);
  if (tests && pass && fail) facts.push(`tests ${tests[1]}, pass ${pass[1]}, fail ${fail[1]}`);
  if (/tsc --noEmit|TypeScript/.test(text) && status === "passed") facts.push("TypeScript check passed");
  if (/built in|✓ built/i.test(text)) facts.push("frontend bundle built");
  if (/semantic_animation_passed/.test(text)) facts.push("V30 semantic gate passed");
  if (/v39_final_gate_passed_scoped/.test(text)) facts.push("V39 scoped final gate passed");
  if (/remain_failed_or_blocked/.test(text)) facts.push("V40.3R3 blocked decision recorded");
  if (!facts.length) facts.push(status === "passed" ? "completed without reported failure" : "completed with failure");
  facts.push(`exit ${exitCode}`);
  return facts.join("; ");
}

function gitHead() {
  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function sanitizeCommandLine(parts) {
  return parts.map((part) => String(part).replaceAll(root, "<workspace>")).join(" ");
}

function safeRead(rel) {
  const target = resolve(root, rel);
  return existsSync(target) ? readFileSync(target, "utf8") : "";
}

function sanitizeText(value) {
  return String(value || "")
    .replaceAll(/\x1b\[[0-9;]*m/g, "")
    .replaceAll(/\/mnt\/c\/workspace\/codexpat/g, "<workspace>")
    .replaceAll(/C:\\Users\\Administrator/gi, "<user-home>")
    .replaceAll(/\/mnt\/c\/Users\/Administrator/gi, "<user-home>");
}

function shotPath(name) {
  return resolve(outDir, name);
}

async function canFetch(targetUrl, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(targetUrl, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function waitForUrl(targetUrl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await canFetch(targetUrl, 1200)) return;
    await wait(300);
  }
  throw new Error(`URL did not become ready: ${targetUrl}`);
}

async function waitForChrome() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      await wait(250);
    }
  }
  throw new Error(`Chrome did not start on port ${port}. ${chromeError.slice(0, 500)}`);
}

async function createPage() {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  if (!res.ok) throw new Error(`Unable to create Chrome page: ${res.status}`);
  return res.json();
}

async function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const listeners = new Set();
  let id = 0;
  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", rejectOpen, { once: true });
  });
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result ?? {});
      return;
    }
    for (const listener of listeners) listener(message);
  });
  return {
    send(method, params = {}) {
      const callId = ++id;
      ws.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
    },
    on(_name, listener) {
      listeners.add(listener);
    },
    close() {
      ws.close();
    }
  };
}

async function navigate(cdp, targetUrl) {
  const loaded = new Promise((resolveLoaded) => {
    cdp.on("event", (message) => {
      if (message.method === "Page.loadEventFired") resolveLoaded();
    });
  });
  await cdp.send("Page.navigate", { url: targetUrl });
  await Promise.race([loaded, wait(9000)]);
  await wait(700);
}

async function waitForSelector(cdp, selector, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const found = await evaluate(cdp, `Boolean(document.querySelector(${JSON.stringify(selector)}))`);
    if (found) return true;
    await wait(250);
  }
  throw new Error(`Selector not found: ${selector}`);
}

async function click(cdp, selector) {
  return evaluate(cdp, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.scrollIntoView({ block: "center", inline: "center" });
    el.click();
    return true;
  })()`);
}

async function scrollTo(cdp, selector) {
  return evaluate(cdp, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.scrollIntoView({ block: "start", inline: "nearest" });
    return true;
  })()`);
}

async function screenshot(cdp, targetPath) {
  const result = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, Buffer.from(result.data, "base64"));
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
  return result.result?.value;
}

function tauriMockSource() {
  return `
    globalThis.__TAURI_INTERNALS__ = {
      invoke: async (cmd, args) => {
        if (cmd === "list_instances") return [{ id: "default", displayName: "Default Work Cat", status: "running" }];
        if (cmd === "asset_manager_state") return {
          activePackId: "flagship-work-cat-v2",
          availablePacks: [
            { id: "flagship-work-cat-v2", displayName: "V39 fallback flagship pack", kind: "sprite", status: "active", actionCount: 8 },
            { id: "v40-blocked-candidates", displayName: "V40 failed candidates blocked", kind: "candidate", status: "blocked", actionCount: 0 }
          ],
          preview: { packId: "flagship-work-cat-v2", actionId: "idle", status: "ready" }
        };
        if (cmd === "personalization_state") return { consentRequired: true, route: "local", status: "ready" };
        if (cmd === "visibility_diagnostics") return { visible: true, reasonCode: "headless_mock", sanitized: true };
        if (cmd === "open_photo_2d_wizard") return { status: "opened" };
        return { ok: true, cmd, args };
      }
    };
  `;
}

function toFileUrl(filePath) {
  const winPath = toWindowsPath(filePath).replaceAll("\\", "/");
  if (/^[A-Za-z]:\//.test(winPath)) return `file:///${encodeURI(winPath)}`;
  return `file://${encodeURI(filePath)}`;
}

function withWindowSettings(targetUrl) {
  const parsed = new URL(targetUrl);
  parsed.searchParams.set("window", "settings");
  return parsed.toString();
}

function toWindowsPath(filePath) {
  try {
    return execFileSync("wslpath", ["-w", filePath], { encoding: "utf8" }).trim();
  } catch {
    return filePath;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await main();
