import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const date = "2026-06-30";
const outDirRel = "docs/V40.x/evidence/v40_3r2-automated-acceptance-2026-06-30";
const outDir = resolve(root, outDirRel);
const reportRel = "docs/V40.x/evidence/v40_3r2-automated-acceptance-report-2026-06-30.html";
const reportPath = resolve(root, reportRel);
const resultPath = resolve(outDir, "test-results.json");
const commandResultPath = resolve(root, ".tmp/v40_3r2-command-results.json");
const url = process.env.V40_ACCEPTANCE_URL ?? "http://127.0.0.1:1420/";
const chromePath = process.env.V40_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";
const port = Number(process.env.V40_CHROME_DEBUG_PORT ?? "9234");

mkdirSync(outDir, { recursive: true });

const screenshotPath = (name) => resolve(outDir, name);
const browserProfile = process.env.V40_CHROME_PROFILE
  ? resolve(process.env.V40_CHROME_PROFILE)
  : resolve("/mnt/c/Users/administrator/AppData/Local/Temp", `codexpat-v40-acceptance-${process.pid}`);
const browserProfileForChrome = toWindowsPath(browserProfile);

let spawnedVite = null;
let chrome = null;
let chromeError = "";

async function main() {
  try {
    const serverReady = await canFetch(url, 1500);
    if (!serverReady) {
      spawnedVite = spawn("pnpm", ["--filter", "desktop", "exec", "vite", "--host", "127.0.0.1", "--port", "1420"], {
        cwd: root,
        stdio: ["ignore", "ignore", "pipe"]
      });
      await waitForUrl(url, 15000);
    }

    const candidatePage = writeCandidateReviewPage();
    chrome = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--allow-file-access-from-files",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${browserProfileForChrome}`,
      "about:blank"
    ], {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true
    });
    chrome.stderr.on("data", (chunk) => {
      chromeError += chunk.toString("utf8");
    });

    await waitForChrome();
    const page = await createPage();
    const cdp = await connectCdp(page.webSocketDebuggerUrl);
    const events = [];
    cdp.on("event", (message) => {
      if (message.method === "Runtime.consoleAPICalled") {
        events.push({
          type: "console",
          level: message.params.type,
          text: message.params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ")
        });
      }
      if (message.method === "Runtime.exceptionThrown") {
        events.push({
          type: "exception",
          text: message.params.exceptionDetails?.text ?? "exception"
        });
      }
    });
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("DOM.enable");
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: tauriMockSource() });

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false
    });
    await navigate(cdp, url);
    await waitForSelector(cdp, ".settings-panel", 12000);
    await screenshot(cdp, screenshotPath("01-settings-overview-desktop.png"));

    await click(cdp, "a[href=\"#section-assets\"]");
    await wait(350);
    await screenshot(cdp, screenshotPath("02-assets-and-gallery.png"));

    await scrollTo(cdp, "#v39-characterized-action-entry");
    await wait(350);
    await screenshot(cdp, screenshotPath("03-v39-fallback-action-assets.png"));

    await click(cdp, "a[href=\"#section-personalization\"]");
    await wait(350);
    const modalOpened = await click(cdp, "#photo-2d-wizard-open");
    await wait(500);
    await screenshot(cdp, screenshotPath("04-photo-2d-wizard-modal.png"));

    await click(cdp, "a[href=\"#section-diagnostics\"]");
    await wait(350);
    await screenshot(cdp, screenshotPath("05-diagnostics-and-boundaries.png"));

    await navigate(cdp, toFileUrl(candidatePage));
    await wait(500);
    await screenshot(cdp, screenshotPath("06-v40-failed-candidates.png"));

    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: tauriMockSource() });
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 900,
      deviceScaleFactor: 2,
      mobile: true
    });
    await navigate(cdp, url);
    await waitForSelector(cdp, ".settings-panel", 12000);
    await screenshot(cdp, screenshotPath("07-mobile-settings-overview.png"));

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
        overviewCards: document.querySelectorAll(".settings-stat-card").length,
        navLinks: document.querySelectorAll(".settings-nav a").length,
        instanceCards: document.querySelectorAll(".instance-card").length,
        assetPreviewVisible: visible("#asset-preview-stage"),
        v39PanelPresent: Boolean(document.querySelector("#v39-characterized-action-entry")),
        photoWizardVisible: Boolean(document.querySelector("#photo-2d-wizard-panel")),
        diagnosticsVisible: text.includes("诊断"),
        forbiddenReadyClaimsVisible: /Petdex parity achieved|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready/.test(text),
        forbiddenReadyClaimContext: text.includes("不声明") || text.includes("不得声明") || text.includes("不代表") || text.includes("not-ready"),
        bodyTextSample: text.slice(0, 700)
      };
    })()`);
    checks.photoWizardModalOpenedDuringScenario = modalOpened;

    const commandResults = readCommandResults();
    const screenshots = [
      "01-settings-overview-desktop.png",
      "02-assets-and-gallery.png",
      "03-v39-fallback-action-assets.png",
      "04-photo-2d-wizard-modal.png",
      "05-diagnostics-and-boundaries.png",
      "06-v40-failed-candidates.png",
      "07-mobile-settings-overview.png"
    ];
    const screenshotStatus = screenshots.map((name) => {
      const path = screenshotPath(name);
      return { name, exists: existsSync(path), bytes: existsSync(path) ? readFileSync(path).byteLength : 0 };
    });
    const ok = checks.title.length > 0
      && checks.navLinks >= 4
      && checks.photoWizardVisible
      && checks.photoWizardModalOpenedDuringScenario
      && checks.v39PanelPresent
      && screenshotStatus.every((item) => item.exists && item.bytes > 1024);

    const results = {
      ok,
      status: ok ? "passed with blocked V40 quality gate" : "failed",
      date,
      url,
      reportRel,
      outDirRel,
      screenshots,
      screenshotStatus,
      checks,
      commandResults,
      events: events.slice(-30),
      boundary: "Headless Chrome + Tauri mock UI acceptance. Native desktop overlay was not re-tested by this report; V40.3R2 image-to-action quality remains failed."
    };
    writeFileSync(resultPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
    writeFileSync(reportPath, renderReport(results), "utf8");
    console.log(JSON.stringify({ ok, reportPath: reportRel, outDir: outDirRel, screenshots, status: results.status }, null, 2));
    await cdp.close();
    process.exitCode = ok ? 0 : 1;
  } finally {
    if (chrome) chrome.kill();
    if (spawnedVite) spawnedVite.kill();
  }
}

function readCommandResults() {
  if (!existsSync(commandResultPath)) return [];
  try {
    const payload = JSON.parse(readFileSync(commandResultPath, "utf8"));
    const rows = Array.isArray(payload) ? payload : payload.results;
    if (!Array.isArray(rows)) return [];
    return rows.map((item) => ({
      id: item.id,
      label: item.label || item.id || "unnamed command",
      status: item.status || "unknown",
      exitCode: item.exitCode,
      durationMs: item.durationMs,
      expectedFailure: Boolean(item.expectedFailure),
      summary: summarizeCommandOutput(item.outputTail || "", item.status || "unknown", item.exitCode, item.durationMs)
    }));
  } catch {
    return [];
  }
}

function summarizeCommandOutput(output, status, exitCode, durationMs) {
  const text = String(output || "")
    .replaceAll(/\x1b\[[0-9;]*m/g, "")
    .replaceAll(/\/mnt\/c\/workspace\/codexpat/g, "<workspace>")
    .replaceAll(/C:\\Users\\Administrator/gi, "<user-home>");
  const facts = [];
  const tests = text.match(/# tests\s+(\d+)/);
  const pass = text.match(/# pass\s+(\d+)/);
  const fail = text.match(/# fail\s+(\d+)/);
  if (tests && pass && fail) facts.push(`tests ${tests[1]}, pass ${pass[1]}, fail ${fail[1]}`);
  if (/vite .*built in/i.test(text) || /✓ built in/i.test(text)) facts.push("frontend bundle built");
  if (/tsc/.test(text) && status === "passed") facts.push("TypeScript check passed");
  if (/semantic_animation_passed/.test(text)) facts.push("V30 semantic gate passed");
  if (/v39_final_gate_passed_scoped/.test(text)) facts.push("V39 scoped final gate passed");
  if (/decision\"?:\\s*\"failed/.test(text) || /visual review failed/i.test(text)) facts.push("documented visual quality gate failed");
  if (/invalid value 'app'/.test(text)) facts.push("native bundle blocked by unsupported Tauri bundle value in current environment");
  if (!facts.length) facts.push(status === "passed" ? "completed without reported failure" : "completed with recorded non-pass status");
  facts.push(`exit ${exitCode ?? "n/a"}`);
  if (typeof durationMs === "number") facts.push(`${Math.round(durationMs / 1000)}s`);
  return facts.join("; ");
}

function writeCandidateReviewPage() {
  const candidatePage = resolve(outDir, "v40-failed-candidate-review.html");
  const imgs = [
    ["默认 IP-Adapter / v38-a-cat-public", "../assets/v40-direct-ip-adapter-candidates-r2/v38-a-cat-public-contact-sheet.png"],
    ["默认 IP-Adapter / v38-tuxedo-public", "../assets/v40-direct-ip-adapter-candidates-r2/v38-tuxedo-public-contact-sheet.png"],
    ["Stylized retry / v38-a-cat-public", "../assets/v40-direct-ip-adapter-candidates-r2-stylized/v38-a-cat-public-contact-sheet.png"],
    ["Stylized retry / v38-tuxedo-public", "../assets/v40-direct-ip-adapter-candidates-r2-stylized/v38-tuxedo-public-contact-sheet.png"]
  ];
  const cards = imgs.map(([title, src]) => `
    <figure>
      <img src="${escapeHtml(src)}" alt="${escapeHtml(title)}">
      <figcaption>${escapeHtml(title)} · visual review failed</figcaption>
    </figure>
  `).join("");
  writeFileSync(candidatePage, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V40.3R2 failed candidate review</title>
  <style>
    body { margin: 0; padding: 24px; font-family: Arial, "Microsoft YaHei", sans-serif; background: #f3f6fb; color: #172033; }
    main { max-width: 1380px; margin: 0 auto; }
    h1 { font-size: 28px; margin: 0 0 8px; letter-spacing: 0; }
    p { line-height: 1.65; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    figure { margin: 0; padding: 12px; border: 1px solid #d9e2ee; border-radius: 8px; background: #fff; }
    img { display: block; width: 100%; border-radius: 6px; border: 1px solid #e5e7eb; }
    figcaption { margin-top: 8px; color: #5b6778; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <h1>V40.3R2 候选视觉失败证据</h1>
    <p>以下四张 contact sheet 均来自真实本地生成结果，但显式视觉审查失败。它们不能进入 V40.4，也不能支撑高质量图生 2D 动作资产 ready 声明。</p>
    <div class="grid">${cards}</div>
  </main>
</body>
</html>`, "utf8");
  return candidatePage;
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
      const { resolve: resolvePending, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolvePending(message.result ?? {});
      return;
    }
    for (const listener of listeners) listener(message);
  });
  return {
    send(method, params = {}) {
      const callId = ++id;
      ws.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolvePending, reject) => pending.set(callId, { resolve: resolvePending, reject }));
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
    const handler = (message) => {
      if (message.method === "Page.loadEventFired") resolveLoaded();
    };
    cdp.on("event", handler);
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

async function screenshot(cdp, path) {
  const result = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(result.data, "base64"));
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
  return result.result?.value;
}

function renderReport(results) {
  const rel = (name) => `${relative(dirname(reportPath), resolve(outDir, name)).replaceAll("\\", "/")}`;
  const screenshotCards = results.screenshots.map((name) => `
    <article class="shot">
      <h3>${escapeHtml(name)}</h3>
      <img src="${escapeHtml(rel(name))}" alt="${escapeHtml(name)} screenshot evidence" />
    </article>
  `).join("");
  const commandRows = results.commandResults.map((item) => `
    <tr>
      <td><code>${escapeHtml(item.label)}</code></td>
      <td><span class="pill ${item.status === "passed" || item.status === "passed scoped" ? "pass" : item.status === "expected-failed" || item.status === "expected failed" || item.status === "blocked" ? "warn" : "fail"}">${escapeHtml(item.status)}</span></td>
      <td>${escapeHtml(item.summary)}</td>
    </tr>
  `).join("");
  const issues = [
    ["Critical", "V40.3R2 真实候选视觉失败，不能进入 V40.4，不能声明图生动作资产 ready。"],
    ["Medium", "Headless UI 使用 Tauri mock，证明前端路径可渲染，不证明原生 overlay、托盘、窗口层级或点击穿透。"],
    ["Medium", "Tauri release build 在当前 WSL/Windows cargo 路径组合下仍 blocked；前端和 TypeScript 包已构建。"],
    ["Medium", "当前可体验产品仍依赖 V39 fallback/现有内置资产，用户不会看到 V40 高质量动作资产结果。"],
    ["Low", "移动视口截图用于布局检查，不覆盖触屏真实设备手势和系统缩放差异。"]
  ];
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V40.3R2 自动化验收报告</title>
  <style>
    :root { color-scheme: light; --bg:#f4f7fb; --paper:#fff; --ink:#172033; --muted:#5d6b80; --line:#d9e2ee; --green:#127a52; --amber:#9a5b00; --red:#a83434; font-family: Arial, "Microsoft YaHei", sans-serif; color:var(--ink); background:var(--bg); }
    body { margin:0; padding:28px; }
    main { max-width:1220px; margin:0 auto; }
    .hero, section, .card, .shot { background:var(--paper); border:1px solid var(--line); border-radius:8px; box-shadow:0 1px 2px rgba(20,30,50,.04); }
    .hero { padding:28px; margin-bottom:18px; }
    section { padding:22px; margin-bottom:18px; }
    h1 { margin:0 0 10px; font-size:30px; letter-spacing:0; }
    h2 { margin:0 0 14px; font-size:22px; letter-spacing:0; }
    h3 { margin:0 0 8px; font-size:16px; letter-spacing:0; }
    p, li { line-height:1.65; }
    .muted { color:var(--muted); }
    .summary, .grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
    .metric, .card { padding:14px; background:#fbfdff; border:1px solid var(--line); border-radius:8px; }
    .metric span { display:block; color:var(--muted); font-size:12px; }
    .metric strong { display:block; margin-top:4px; font-size:19px; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:10px 8px; border-bottom:1px solid #e5edf6; text-align:left; vertical-align:top; }
    th { color:#334155; background:#f8fbff; }
    code { background:#eef4fb; padding:2px 5px; border-radius:4px; font-size:12px; }
    .pill { display:inline-block; border-radius:999px; padding:4px 9px; font-size:12px; font-weight:700; }
    .pass { background:#e7f7ef; color:var(--green); }
    .warn { background:#fff3d7; color:var(--amber); }
    .fail { background:#fee2e2; color:var(--red); }
    .shot { padding:12px; }
    .shot img { display:block; width:100%; max-height:720px; object-fit:contain; border:1px solid #e5e7eb; border-radius:6px; background:#fff; }
    .issue { border-left:5px solid #f0b429; padding-left:12px; }
    @media (max-width: 820px) { body { padding:14px; } }
  </style>
</head>
<body>
<main>
  <header class="hero">
    <h1>V40.3R2 自动化验收报告</h1>
    <p>本报告使用 Headless Chrome + CDP 采集截图，语言为中文，日期 ${escapeHtml(date)}。报告目的不是证明 V40 成功，而是证明当前项目真实可见路径、当前架构状态和 V40.3R2 失败门禁。</p>
    <p class="muted">边界：${escapeHtml(results.boundary)}</p>
    <div class="summary">
      <div class="metric"><span>自动化 UI 截图</span><strong>${results.screenshots.length} 张</strong></div>
      <div class="metric"><span>当前可体验</span><strong>前端设置页 + V39 fallback</strong></div>
      <div class="metric"><span>V40.3R2 质量门禁</span><strong>failed / No-Go</strong></div>
      <div class="metric"><span>报告状态</span><strong>${escapeHtml(results.status)}</strong></div>
    </div>
  </header>

  <section>
    <h2>目标架构与当前架构实现</h2>
    <div class="grid">
      <article class="card"><h3>目标架构</h3><p>V40 目标是无 WebUI/无 ComfyUI 的 Direct Local Runner 路线：安全照片样本进入本地候选生成，经过 V40 合同、视觉审查、归一化、产品预览/应用/回滚和最终 evidence gate。</p></article>
      <article class="card"><h3>当前实现</h3><p>V40.1A/V40.2 建立了 runner 和 no-WebUI 合同；V40.3/V40.3R/V40.3R2 均未得到视觉通过候选。当前产品体验仍应看作 V39 fallback 与现有设置页能力。</p></article>
      <article class="card"><h3>验收边界</h3><p>Headless 截图证明前端路径和失败候选证据可见；不证明 native overlay、provider、任意猫自动生成、生产发布、Windows/cross-platform readiness。</p></article>
    </div>
  </section>

  <section>
    <h2>构建与命令结果</h2>
    <table><thead><tr><th>命令</th><th>结果</th><th>摘要</th></tr></thead><tbody>${commandRows}</tbody></table>
  </section>

  <section>
    <h2>用户场景截图证据</h2>
    <p>这些截图来自 headless Chrome，不会弹出截图窗口。最后打开本报告才会产生可见浏览器窗口。</p>
    <div class="grid">${screenshotCards}</div>
  </section>

  <section>
    <h2>问题与风险</h2>
    ${issues.map(([priority, text]) => `<p class="issue"><strong>${escapeHtml(priority)}</strong> · ${escapeHtml(text)}</p>`).join("")}
  </section>

  <section>
    <h2>自动化检查摘要</h2>
    <table>
      <tr><th>检查项</th><th>结果</th></tr>
      <tr><td>设置页标题</td><td>${escapeHtml(results.checks.title)}</td></tr>
      <tr><td>导航链接数</td><td>${results.checks.navLinks}</td></tr>
      <tr><td>V39 面板存在</td><td>${results.checks.v39PanelPresent ? "yes" : "no"}</td></tr>
      <tr><td>照片 2D 向导打开</td><td>${results.checks.photoWizardModalOpenedDuringScenario ? "yes" : "no"}</td></tr>
      <tr><td>诊断区可见</td><td>${results.checks.diagnosticsVisible ? "yes" : "no"}</td></tr>
      <tr><td>禁用 ready 声明语境</td><td>${results.checks.forbiddenReadyClaimsVisible ? (results.checks.forbiddenReadyClaimContext ? "forbidden/not-ready context" : "needs review") : "not visible in sampled text"}</td></tr>
    </table>
  </section>

  <section>
    <h2>验收评价</h2>
    <p><strong>当前项目可以人工体验前端设置页、资产/图库入口、照片 2D 向导入口、诊断区和现有桌宠运行路径；不能体验 V40 高质量图生动作资产成功流。</strong></p>
    <p>V40.3R2 的真实生成候选已作为失败证据展示。它们不应被应用到产品，不应进入 V40.4，也不应被宣传为用户会喜欢的动作资产。</p>
  </section>
</main>
</body>
</html>`;
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

function toWindowsPath(path) {
  try {
    return execFileSync("wslpath", ["-w", path], { encoding: "utf8" }).trim();
  } catch {
    return path;
  }
}

function toFileUrl(path) {
  return `file://${path}`;
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

function tauriMockSource() {
  return `
(() => {
  const now = String(Date.now());
  const settings = { muted: false, petVisible: true, petX: 160, petY: 140 };
  const instances = [
    { instanceId: "default", sourceKind: "default", sourceId: "default", displayName: "Agent Desktop Pet", windowLabel: "main", workspaceLabel: null, workspaceHash: null, position: { x: 160, y: 140 }, visible: true, currentState: "idle", catProfileId: "default-cat", createdAt: now, updatedAt: now, lastEventAt: now, isDefault: true },
    { instanceId: "codex-work-cat", sourceKind: "codex", sourceId: "codex", displayName: "Codex Work Cat", windowLabel: "codex-work-cat", workspaceLabel: "mock workspace", workspaceHash: "hash_mock", position: { x: 420, y: 220 }, visible: true, currentState: "thinking", catProfileId: "work-cat", createdAt: now, updatedAt: now, lastEventAt: now, isDefault: false }
  ];
  const packs = [
    { packId: "flagship-work-cat-v2", displayName: "Flagship Work Cat V2", rendererKind: "sprite", copiedAssetIds: ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"], manifestHash: "hash_flagship", createdAt: now, activeInstances: ["default"], validationStatus: "passed" }
  ];
  const diagnostics = {
    enabled: true,
    listenAddress: "127.0.0.1:17321",
    queueLength: 0,
    queueCapacity: 32,
    acceptedEvents: [{ id: "evt_mock_1", sourceId: "v40-headless", level: "success", titlePreview: "Mock accepted event", messagePreview: "sanitized", targetInstanceId: "default", targetWindowLabel: "main", status: 202, accepted: true, reasonCode: null, receivedAt: now }],
    rejectedEvents: [{ id: "evt_mock_reject", sourceId: "v40-headless", level: "success", titlePreview: "Rejected unsafe event", messagePreview: "sanitized", targetInstanceId: "missing", targetWindowLabel: null, status: 404, accepted: false, reasonCode: "instance_not_found", reasonField: "target.instanceId", reason: "instance_not_found", receivedAt: now }],
    lastAccepted: null,
    lastRejected: null,
    sound: { playbackAvailable: true, muted: false, cooldownMs: 300, acceptedIds: ["success"], lastDecision: { sound: "success", played: true, reason: "played", decidedAt: now } },
    hardwareLight: false,
    startupError: null
  };
  const callbacks = {};
  let callbackId = 1;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: "settings" }, currentWebview: { windowLabel: "settings", label: "settings" } },
    transformCallback(callback) { const id = callbackId++; callbacks[id] = callback; return id; },
    unregisterCallback(id) { delete callbacks[id]; },
    runCallback(id, payload) { callbacks[id]?.(payload); },
    convertFileSrc(filePath) { return filePath; },
    invoke(cmd, args) {
      switch (cmd) {
        case "get_settings": return Promise.resolve(settings);
        case "set_muted": settings.muted = Boolean(args?.muted); diagnostics.sound.muted = settings.muted; return Promise.resolve(settings);
        case "get_pet_position": return Promise.resolve({ x: settings.petX ?? 0, y: settings.petY ?? 0 });
        case "get_api_debug_state": return Promise.resolve(diagnostics);
        case "get_current_pet_instance": return Promise.resolve(instances[0]);
        case "list_pet_instances": return Promise.resolve(instances);
        case "list_cat_profiles": return Promise.resolve([
          { id: "default-cat", name: "Default Cat", description: "Default local pet", cssClass: "cat-profile-default", previewColor: "#94a3b8", builtIn: true },
          { id: "work-cat", name: "Work Cat", description: "Codex work companion", cssClass: "cat-profile-work", previewColor: "#38bdf8", builtIn: true }
        ]);
        case "list_personalized_asset_packs": return Promise.resolve(packs);
        case "plugin:event|listen": return Promise.resolve(1);
        case "plugin:event|unlisten": return Promise.resolve(null);
        case "send_test_pet_reaction": return Promise.resolve({ ok: true });
        case "runtime_personalized_asset_pack": return Promise.resolve(null);
        case "runtime_personalized_asset_data": return Promise.reject("asset_pack_not_found");
        case "get_app_token_status": return Promise.resolve("configured");
        default: return Promise.reject("mock_command_not_implemented:" + cmd);
      }
    }
  };
})();
`;
}

main().catch((error) => {
  if (chrome) chrome.kill();
  if (spawnedVite) spawnedVite.kill();
  console.error(error);
  process.exit(1);
});
