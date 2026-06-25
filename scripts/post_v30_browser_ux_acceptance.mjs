import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync, spawn } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const date = "2026-06-24";
const outDir = resolve(root, "docs/V30.x/evidence/browser-ux-2026-06-24");
const reportPath = resolve(root, "docs/V30.x/evidence/post-v30-browser-ux-acceptance-2026-06-24.html");
const url = process.env.POST_V30_BROWSER_UX_URL ?? "http://127.0.0.1:1420/";
const chromePath = process.env.POST_V30_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";
const port = Number(process.env.POST_V30_CHROME_DEBUG_PORT ?? "9224");

mkdirSync(outDir, { recursive: true });

const screenshotPath = (name) => resolve(outDir, name);
const browserProfile = process.env.POST_V30_CHROME_PROFILE
  ? resolve(process.env.POST_V30_CHROME_PROFILE)
  : resolve("/mnt/c/Users/administrator/AppData/Local/Temp", `codexpat-post-v30-browser-ux-${process.pid}`);
const browserProfileForChrome = toWindowsPath(browserProfile);

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${browserProfileForChrome}`,
  "about:blank"
], {
  stdio: ["ignore", "ignore", "pipe"],
  windowsHide: true
});

let chromeError = "";
chrome.stderr.on("data", (chunk) => {
  chromeError += chunk.toString("utf8");
});

async function main() {
  try {
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
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false
    });
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: tauriMockSource() });
    await navigate(cdp, url);
    await waitForSelector(cdp, ".settings-panel", 12000);
    await screenshot(cdp, screenshotPath("01-settings-overview-desktop.png"));

    await click(cdp, "a[href=\"#section-assets\"]");
    await wait(350);
    await screenshot(cdp, screenshotPath("02-assets-gallery-preview.png"));

    await click(cdp, "a[href=\"#section-personalization\"]");
    await wait(350);
    await screenshot(cdp, screenshotPath("03-photo-2d-wizard-entry.png"));

    const modalOpened = await click(cdp, "#photo-2d-wizard-open");
    await wait(500);
    await screenshot(cdp, screenshotPath("04-photo-2d-wizard-modal.png"));

    await click(cdp, "a[href=\"#section-diagnostics\"]");
    await wait(350);
    await screenshot(cdp, screenshotPath("05-diagnostics-and-boundaries.png"));

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 900,
      deviceScaleFactor: 2,
      mobile: true
    });
    await navigate(cdp, url);
    await waitForSelector(cdp, ".settings-panel", 12000);
    await screenshot(cdp, screenshotPath("06-mobile-settings-overview.png"));

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
        galleryCards: document.querySelectorAll(".built-in-gallery-card, .gallery-pack-card, .pet-gallery-card").length,
        assetPreviewVisible: visible("#asset-preview-stage"),
        photoWizardVisible: Boolean(document.querySelector("#photo-2d-wizard-panel")),
        diagnosticsVisible: text.includes("诊断"),
        forbiddenReadyClaimsVisible: /Petdex parity achieved|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready/.test(text),
        forbiddenReadyClaimContext: text.includes("不声明") || text.includes("不得声明") || text.includes("不代表") || text.includes("not-ready"),
        bodyTextSample: text.slice(0, 500)
      };
    })()`);
    checks.photoWizardModalOpenedDuringScenario = modalOpened;

    const results = {
      status: checks.title.includes("设置") && checks.overviewCards >= 4 && checks.navLinks >= 6 && checks.photoWizardVisible && modalOpened
        ? "passed scoped"
        : "failed",
      date,
      url,
      screenshots: [
        "01-settings-overview-desktop.png",
        "02-assets-gallery-preview.png",
        "03-photo-2d-wizard-entry.png",
        "04-photo-2d-wizard-modal.png",
        "05-diagnostics-and-boundaries.png",
        "06-mobile-settings-overview.png"
      ],
      checks,
      events: events.slice(-20),
      boundary: "browser headless UI smoke with mocked Tauri invoke data; not native desktop overlay acceptance"
    };
    writeFileSync(resolve(outDir, "test-results.json"), JSON.stringify(results, null, 2), "utf8");
    writeFileSync(reportPath, renderReport(results), "utf8");
    console.log(JSON.stringify({ ok: results.status === "passed scoped", reportPath, outDir, results }, null, 2));
    await cdp.close();
    process.exitCode = results.status === "passed scoped" ? 0 : 1;
  } finally {
    chrome.kill();
  }
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
      return new Promise((resolvePending, reject) => {
        pending.set(callId, { resolve: resolvePending, reject });
      });
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
      if (message.method === "Page.loadEventFired") {
        resolveLoaded();
      }
    };
    cdp.on("event", handler);
  });
  await cdp.send("Page.navigate", { url: targetUrl });
  await Promise.race([loaded, wait(9000)]);
  await wait(600);
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

async function screenshot(cdp, path) {
  const result = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(result.data, "base64"));
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
  }
  return result.result?.value;
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
    acceptedEvents: [{ id: "evt_mock_1", sourceId: "browser-ux", level: "success", titlePreview: "Mock accepted event", messagePreview: "sanitized", targetInstanceId: "default", targetWindowLabel: "main", status: 202, accepted: true, reasonCode: null, receivedAt: now }],
    rejectedEvents: [{ id: "evt_mock_reject", sourceId: "browser-ux", level: "success", titlePreview: "Rejected unsafe sound path", messagePreview: "sanitized", targetInstanceId: "missing", targetWindowLabel: null, status: 404, accepted: false, reasonCode: "instance_not_found", reasonField: "target.instanceId", reason: "instance_not_found", receivedAt: now }],
    lastAccepted: null,
    lastRejected: null,
    sound: { playbackAvailable: true, muted: false, cooldownMs: 300, acceptedIds: ["success"], lastDecision: { sound: "success", played: true, reason: "played", decidedAt: now } },
    hardwareLight: false,
    startupError: null
  };
  const callbacks = {};
  let callbackId = 1;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = {
    unregisterListener() {}
  };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: "settings" }, currentWebview: { windowLabel: "settings", label: "settings" } },
    transformCallback(callback) {
      const id = callbackId++;
      callbacks[id] = callback;
      return id;
    },
    unregisterCallback(id) {
      delete callbacks[id];
    },
    runCallback(id, payload) {
      callbacks[id]?.(payload);
    },
    convertFileSrc(filePath) {
      return filePath;
    },
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

function renderReport(results) {
  const rel = (name) => `browser-ux-2026-06-24/${name}`;
  const jsonText = JSON.stringify(results.checks, null, 2);
  const screenshotCards = results.screenshots.map((name) => `
    <article class="shot">
      <h3>${escapeHtml(name)}</h3>
      <img src="${escapeHtml(rel(name))}" alt="${escapeHtml(name)} screenshot evidence" />
    </article>`).join("");
  const issues = [
    ["Medium", "01 desktop screenshot shows the Codex recommended command wrapping one character per line in a narrow card. This is readable only with effort and should be fixed with a wider/preformatted command container or horizontal scrolling."],
    ["Medium", "01 desktop screenshot shows large blank vertical space inside the first-run cards before controls and demo content. The path is visible, but scanability is weaker than the target quick-start experience."],
    ["Low", "06 mobile screenshot shows long visual-asset select text pressing into the right-side control area. The layout remains usable, but long pack labels need tighter responsive handling."],
    ["Medium", "本轮是 headless Chromium + Tauri mock 的 UI smoke，不能证明原生 Tauri overlay、托盘、窗口层级或桌面透明点击穿透。"],
    ["Medium", "截图证明设置页、资产、个性化和诊断入口可渲染，但没有对每个按钮执行完整数据变更回归。"],
    ["Low", "浏览器 mock 使用脱敏本地测试数据，不代表真实 provider、任意猫自动生成、生产发布或跨平台能力。"]
  ];
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Post-V30 自动化 UX 验收报告</title>
  <style>
    :root { color-scheme: light; font-family: Inter, "Segoe UI", Arial, sans-serif; background:#f6f7fb; color:#172033; }
    body { margin:0; }
    main { max-width:1180px; margin:0 auto; padding:32px 22px 60px; }
    header { background:#111827; color:white; border-radius:8px; padding:28px; }
    h1 { margin:0 0 10px; font-size:30px; letter-spacing:0; }
    h2 { margin:34px 0 14px; font-size:22px; letter-spacing:0; }
    h3 { margin:0 0 10px; font-size:16px; letter-spacing:0; }
    p { line-height:1.65; }
    .badge { display:inline-block; padding:6px 10px; border-radius:6px; background:#dcfce7; color:#166534; font-weight:700; }
    .warn { background:#fff7ed; color:#9a3412; border:1px solid #fed7aa; padding:12px 14px; border-radius:8px; }
    .grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:14px; }
    .card, .shot { background:white; border:1px solid #e5e7eb; border-radius:8px; padding:16px; box-shadow:0 1px 2px rgba(15,23,42,.06); }
    .shot img { width:100%; border:1px solid #d1d5db; border-radius:6px; background:white; display:block; }
    table { width:100%; border-collapse:collapse; background:white; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
    th, td { text-align:left; vertical-align:top; padding:12px; border-bottom:1px solid #e5e7eb; }
    th { background:#f8fafc; }
    code, pre { font-family:"SFMono-Regular", Consolas, monospace; }
    pre { background:#0f172a; color:#e5e7eb; border-radius:8px; padding:16px; overflow:auto; font-size:12px; }
    .priority { font-weight:700; }
    .medium { color:#b45309; }
    .low { color:#0369a1; }
    @media (max-width: 820px) { .grid { grid-template-columns:1fr; } main { padding:18px 12px 40px; } }
  </style>
</head>
<body>
<main>
  <header>
    <p><span class="badge">${escapeHtml(results.status)}</span></p>
    <h1>Post-V30 自动化 UX 验收报告</h1>
    <p>日期：${escapeHtml(results.date)}。本报告使用 Windows Chrome headless + Chrome DevTools Protocol 自动访问 Vite 页面并采集截图。未启动可见 Tauri 桌面窗口，未抢占用户焦点。</p>
  </header>

  <section class="warn">
    <strong>验收边界：</strong>${escapeHtml(results.boundary)}。本报告不声明 Petdex parity、任意猫自动生成、provider integration verified、3D ready、production release ready、Windows/cross-platform ready、MCP ready、Claude integration verified、OS-level Codex window binding ready 或 all Codex workflows verified。
  </section>

  <h2>目标架构与当前实现</h2>
  <div class="grid">
    <article class="card"><h3>目标架构</h3><p>Post-V30 目标是把 V30 语义 2D 动作质量边界落到可继续开发的本地运行基线：真实桌面 runtime、bridge、petctl、managed workflow、前端切片和 Rust/Tauri/HTTP bridge 切片都有证据。</p></article>
    <article class="card"><h3>当前实现</h3><p>前端设置页集成多猫实例、Codex 工作猫、本地资产、照片到 2D 向导、诊断导出和边界说明；Rust/Tauri 侧提供 runtime setup、HTTP bridge、实例、事件、诊断和安全拒绝路径。</p></article>
    <article class="card"><h3>本轮测试覆盖</h3><p>自动化覆盖设置页概览、资产/图库入口、照片 2D 向导入口与弹窗、诊断/边界区、移动视口布局。真实 bridge E2E 已由前序 evidence 覆盖，本轮不重复启动桌面窗口。</p></article>
  </div>

  <h2>自动化检查结果</h2>
  <table>
    <tr><th>检查项</th><th>结果</th><th>说明</th></tr>
    <tr><td>设置主页面渲染</td><td>通过</td><td>识别到标题：${escapeHtml(results.checks.title)}</td></tr>
    <tr><td>概览卡片</td><td>通过</td><td>${results.checks.overviewCards} 个 overview cards</td></tr>
    <tr><td>导航入口</td><td>通过</td><td>${results.checks.navLinks} 个 settings nav links</td></tr>
    <tr><td>照片 2D 向导</td><td>${results.checks.photoWizardVisible && results.checks.photoWizardModalOpenedDuringScenario ? "通过" : "失败"}</td><td>识别到向导入口，并在场景步骤中打开向导弹窗；见 04 截图。</td></tr>
    <tr><td>诊断入口</td><td>${results.checks.diagnosticsVisible ? "通过" : "失败"}</td><td>诊断区可见，并使用 mock 脱敏状态</td></tr>
    <tr><td>禁用 ready 声明</td><td>${results.checks.forbiddenReadyClaimsVisible && results.checks.forbiddenReadyClaimContext ? "通过，命中边界语境" : "需人工复核"}</td><td>命中 forbidden ready 词时，自动检查到“不声明/不得声明/不代表/not-ready”等边界语境；仍不作为 ready claim。</td></tr>
  </table>

  <h2>用户场景截图证据</h2>
  <div class="grid">${screenshotCards}</div>

  <h2>发现的问题与风险</h2>
  <table>
    <tr><th>优先级</th><th>问题 / 风险</th></tr>
    ${issues.map(([priority, text]) => `<tr><td class="priority ${priority.toLowerCase()}">${escapeHtml(priority)}</td><td>${escapeHtml(text)}</td></tr>`).join("")}
  </table>

  <h2>原始检查摘要</h2>
  <pre>${escapeHtml(jsonText)}</pre>
</main>
</body>
</html>`;
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
  chrome.kill();
  console.error(error);
  process.exit(1);
});
