#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const date = "2026-06-08";
const outPath = resolve(repoRoot, `docs/V13.x/evidence/v13_e2e_chromecli_acceptance_report_${date}.html`);

const screenshots = [
  {
    id: "settings",
    title: "设置页与默认猫可见",
    verdict: "passed",
    path: "docs/V13.x/evidence/e2e-chromecli/01-clean-settings-visible.png",
    note: "真实桌面截图：当前项目 app 包启动后，设置页可见，默认猫可见。"
  },
  {
    id: "running",
    title: "running 状态截图尝试",
    verdict: "failed",
    path: "docs/V13.x/evidence/e2e-chromecli/02-running-state.png",
    note: "事件被 Event Bridge 接受，但截图/设置页未显示 running；最终可见状态仍为 idle 或被 Chrome 抢前台。"
  },
  {
    id: "need_input",
    title: "need_input 状态截图尝试",
    verdict: "failed",
    path: "docs/V13.x/evidence/e2e-chromecli/03-need-input-state.png",
    note: "事件被接受，但截图被 Chrome 前台窗口覆盖，不能作为桌宠状态视觉证据。"
  },
  {
    id: "error",
    title: "error 状态截图尝试",
    verdict: "failed",
    path: "docs/V13.x/evidence/e2e-chromecli/04-error-state.png",
    note: "首次截图被 Chrome 覆盖，不能证明错误态投射到猫。"
  }
];

const phaseRows = [
  ["V13.1 Scope Freeze", "passed", "docs/V13.x/evidence/v13_1-scope-freeze-2026-06-08.md"],
  ["V13.2 Packaging Foundation", "passed", "docs/V13.x/evidence/v13_2-packaging-smoke-2026-06-08.md"],
  ["V13.3 First-run User Journey", "passed", "docs/V13.x/evidence/v13_3-first-run-user-journey-2026-06-08.md"],
  ["V13.4 Diagnostics Export", "passed", "docs/V13.x/evidence/v13_4-diagnostics-export-redaction-2026-06-08.md"],
  ["V13.5 Stability / Performance", "blocked", "docs/V13.x/evidence/v13_5-stability-performance-baseline-2026-06-08.md"],
  ["V13.6 Artifact / License / Claim Hygiene", "passed", "docs/V13.x/evidence/v13_6-artifact-license-claim-hygiene-2026-06-08.md"],
  ["V13.7 Beta Readiness Gate", "no-go", "not started because V13.5 is blocked"]
];

const commandRows = [
  ["启动当前项目包", "open -n apps/desktop/src-tauri/target/release/bundle/macos/Agent Desktop Pet.app", "passed"],
  ["健康检查", "curl /api/health", "passed"],
  ["确认单进程", "pgrep -fl agent-desktop-pet", "passed"],
  ["打开设置页", "petctl settings open --json", "passed"],
  ["可见性 resurface", "petctl visibility resurface --instance default --reset-position --json", "passed with window_offscreen diagnostic"],
  ["发送 running", "petctl notify --level running", "accepted event"],
  ["发送 need_input", "petctl notify --level need_input", "accepted event"],
  ["诊断检查", "curl /api/diagnostics with local auth", "accepted events visible; instance state remains idle"]
];

function imgData(path) {
  const full = resolve(repoRoot, path);
  if (!existsSync(full)) return "";
  const ext = extname(full).slice(1).toLowerCase() || "png";
  return `data:image/${ext};base64,${readFileSync(full).toString("base64")}`;
}

function badge(value) {
  const key = String(value).toLowerCase();
  return `<span class="badge ${escapeAttr(key)}">${escapeHtml(value)}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\s+/g, "-").replace(/[^a-z0-9_-]/gi, "");
}

const screenshotCards = screenshots.map((shot) => {
  const src = imgData(shot.path);
  return `<article class="shot ${escapeAttr(shot.verdict)}">
    <div class="shot-head">
      <h3>${escapeHtml(shot.title)}</h3>
      ${badge(shot.verdict)}
    </div>
    <p>${escapeHtml(shot.note)}</p>
    ${src ? `<img src="${src}" alt="${escapeHtml(shot.title)}">` : `<div class="missing">截图缺失：${escapeHtml(shot.path)}</div>`}
    <code>${escapeHtml(shot.path)}</code>
  </article>`;
}).join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V13 E2E Chrome CLI 验收汇报</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f6f7fb;
      color: #172033;
    }
    body { margin: 0; }
    header {
      padding: 32px 42px 24px;
      background: linear-gradient(135deg, #172554 0%, #2451c9 58%, #12a7a7 100%);
      color: white;
    }
    header h1 { margin: 0 0 10px; font-size: 32px; letter-spacing: 0; }
    header p { margin: 0; max-width: 960px; line-height: 1.6; color: #dbeafe; }
    main { padding: 28px 42px 48px; }
    section { margin: 0 0 28px; }
    h2 { margin: 0 0 14px; font-size: 22px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }
    .metric {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
    }
    .metric strong { display: block; font-size: 28px; margin-bottom: 5px; }
    .metric span { color: #64748b; font-size: 14px; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
    }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-size: 13px; color: #475569; }
    tr:last-child td { border-bottom: 0; }
    code {
      display: inline-block;
      max-width: 100%;
      overflow-wrap: anywhere;
      padding: 2px 6px;
      border-radius: 5px;
      background: #eef2ff;
      color: #1e3a8a;
      font-size: 12px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 0 9px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .passed { background: #dcfce7; color: #166534; }
    .failed { background: #fee2e2; color: #991b1b; }
    .blocked, .no-go { background: #fef3c7; color: #92400e; }
    .accepted-event { background: #e0f2fe; color: #075985; }
    .passed-with-window_offscreen-diagnostic { background: #fef3c7; color: #92400e; }
    .shots {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }
    .shot {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
    }
    .shot-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .shot h3 { margin: 0; font-size: 17px; }
    .shot p { color: #475569; line-height: 1.55; min-height: 48px; }
    .shot img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: contain;
      background: #0f172a;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      margin-bottom: 10px;
    }
    .findings {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .finding {
      background: white;
      border: 1px solid #e2e8f0;
      border-left: 5px solid #dc2626;
      border-radius: 10px;
      padding: 16px;
    }
    .finding.medium { border-left-color: #d97706; }
    .finding.low { border-left-color: #2563eb; }
    .finding h3 { margin: 0 0 8px; font-size: 16px; }
    .finding p { margin: 0; line-height: 1.55; color: #475569; }
    footer { padding: 0 42px 34px; color: #64748b; }
    @media (max-width: 1100px) {
      .summary, .shots, .findings { grid-template-columns: 1fr; }
      main, header, footer { padding-left: 18px; padding-right: 18px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>V13 E2E Chrome CLI 验收汇报</h1>
    <p>本页由本地真实运行生成：当前项目 Tauri app 包启动，petctl 走本地 HTTP Event Bridge，Chrome 作为用户查看报告的载体。结论按证据收窄，不把 accepted event 误写成视觉状态通过。</p>
  </header>
  <main>
    <section class="summary">
      <div class="metric"><strong>1</strong><span>当前项目 app 进程</span></div>
      <div class="metric"><strong>4</strong><span>真实桌面截图嵌入</span></div>
      <div class="metric"><strong>5/6</strong><span>V13.1-V13.6 passed 数</span></div>
      <div class="metric"><strong>No-Go</strong><span>V13.7 因 V13.5 blocked 未启动</span></div>
    </section>

    <section>
      <h2>阶段状态</h2>
      <table>
        <thead><tr><th>阶段</th><th>状态</th><th>证据</th></tr></thead>
        <tbody>
          ${phaseRows.map(([phase, status, evidence]) => `<tr><td>${escapeHtml(phase)}</td><td>${badge(status)}</td><td><code>${escapeHtml(evidence)}</code></td></tr>`).join("\n")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>用户视角操作记录</h2>
      <table>
        <thead><tr><th>操作</th><th>命令/入口</th><th>结果</th></tr></thead>
        <tbody>
          ${commandRows.map(([name, command, result]) => `<tr><td>${escapeHtml(name)}</td><td><code>${escapeHtml(command)}</code></td><td>${badge(result)}</td></tr>`).join("\n")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>真实截图证据</h2>
      <div class="shots">${screenshotCards}</div>
    </section>

    <section>
      <h2>本轮发现的问题</h2>
      <div class="findings">
        <article class="finding">
          <h3>状态投射 E2E 未通过</h3>
          <p>running / need_input / error 事件被接受，但默认实例仍显示 idle，设置页和可见猫没有稳定反映对应状态。</p>
        </article>
        <article class="finding medium">
          <h3>截图自动化仍受前台窗口影响</h3>
          <p>Chrome 会抢占全屏截图，导致状态截图不可作为视觉验收证据。需要 app-specific screenshot harness 或窗口级截图。</p>
        </article>
        <article class="finding low">
          <h3>resurface 诊断仍报 window_offscreen</h3>
          <p>真实截图可见猫，但 API 可见性诊断仍返回 window_offscreen，说明窗口坐标/显示器判定仍需校准。</p>
        </article>
      </div>
    </section>

    <section>
      <h2>结论</h2>
      <table>
        <tbody>
          <tr><th>可以确认</th><td>当前项目包能启动；本地 health 正常；设置页可见；默认猫可见；Event Bridge 接受 PetEvent；诊断/claim/artifact 扫描已有阶段证据。</td></tr>
          <tr><th>不能确认</th><td>不能确认状态变化已稳定投射到猫；不能确认 V13.5 稳定性/性能视觉证据通过；不能进入 V13.7 beta readiness final gate。</td></tr>
          <tr><th>下一步</th><td>优先修 app-specific screenshot harness 和默认实例状态映射/刷新链路，再复跑 V13.5 与状态投射 E2E。</td></tr>
        </tbody>
      </table>
    </section>
  </main>
  <footer>Generated on ${date}. Forbidden claims remain not-ready: production signed release, Windows/cross-platform, 3D ready, provider integration, OS-level Codex binding, all Codex workflows verified.</footer>
</body>
</html>`;

writeFileSync(outPath, html, "utf8");
console.log(JSON.stringify({ ok: true, reportPath: outPath }, null, 2));
