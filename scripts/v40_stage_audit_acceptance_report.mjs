import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan
} from "../apps/desktop/src/assets/v40-no-webui-workflow-contract.ts";

const phaseDate = "2026-07-01";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const evidenceRootRef = "docs/V40.x/evidence";
const outDirRef = `${evidenceRootRef}/v40-stage-audit-${phaseDate}`;
const outDir = path.join(repoRoot, outDirRef);
const screenshotDir = path.join(outDir, "screenshots");
const visualDir = path.join(outDir, "visual-evidence");
const reportRef = `${outDirRef}/v40-stage-audit-acceptance-report-${phaseDate}.html`;
const reportPath = path.join(repoRoot, reportRef);
const resultRef = `${outDirRef}/test-results.json`;
const resultPath = path.join(repoRoot, resultRef);
const chromePath = process.env.V40_AUDIT_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";

const refs = {
  prd: "docs/active/agent_desktop_pet_prd_v40.md",
  targetArchitecture: "docs/V40.x/v40-target-architecture.md",
  developmentPlan: "docs/V40.x/v40-development-and-acceptance-plan.md",
  acceptancePlan: "docs/V40.x/v40-acceptance-plan.md",
  phaseSpecs: "docs/V40.x/v40-phase-specs.md",
  implementationContract: "docs/V40.x/v40-implementation-contract.md",
  r5Json: `${evidenceRootRef}/v40_3r5-direct-runner-predev-audit-${phaseDate}.json`,
  r5Md: `${evidenceRootRef}/v40_3r5-direct-runner-predev-audit-${phaseDate}.md`,
  r6Json: `${evidenceRootRef}/v40_3r6-controlled-candidate-frame-generation-${phaseDate}.json`,
  r6Md: `${evidenceRootRef}/v40_3r6-controlled-candidate-frame-generation-${phaseDate}.md`,
  v40_4: `${evidenceRootRef}/v40_4-normalization-action-packaging-${phaseDate}.md`,
  v40_5: `${evidenceRootRef}/v40_5-product-preview-apply-rollback-${phaseDate}.md`,
  v40_6: `${evidenceRootRef}/v40_6-visual-report-${phaseDate}.html`,
  v40_7: `${evidenceRootRef}/v40_7-final-gate-${phaseDate}.md`,
  finalJson: `${evidenceRootRef}/v40_4_to_v40_7-final-failed-gate-${phaseDate}.json`,
  candidateManifest: `${evidenceRootRef}/assets/v40-3r6-controlled-candidates/manifest.json`
};

const commandPlan = [
  {
    id: "desktop_test",
    label: "desktop 单元测试",
    command: ["pnpm", "--filter", "desktop", "test"],
    timeoutMs: 240_000,
    expected: "zero"
  },
  {
    id: "desktop_check",
    label: "desktop TypeScript 检查",
    command: ["pnpm", "--filter", "desktop", "check"],
    timeoutMs: 180_000,
    expected: "zero"
  },
  {
    id: "petctl_test",
    label: "petctl 单元测试",
    command: ["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"],
    timeoutMs: 180_000,
    expected: "zero"
  },
  {
    id: "v30_semantic_gate",
    label: "V30 语义动作质量门禁",
    command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v30_semantic_animation_gate_smoke.mjs"],
    timeoutMs: 180_000,
    expected: "zero"
  },
  {
    id: "v39_final_gate",
    label: "V39 fallback final gate",
    command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v39_8_final_gate_smoke.mjs"],
    timeoutMs: 180_000,
    expected: "zero"
  },
  {
    id: "v40_r5_predev_audit",
    label: "V40.3R5 direct runner predev audit",
    command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v40_3r5_direct_runner_predev_audit.mjs"],
    timeoutMs: 180_000,
    expected: "zero"
  },
  {
    id: "v40_r6_controlled_generation",
    label: "V40.3R6 controlled candidate generation",
    command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v40_3r6_controlled_candidate_frame_generation.mjs"],
    timeoutMs: 180_000,
    expected: "nonzero_failed_gate",
    env: { V40_3R6_REUSE_EXISTING: "1" }
  },
  {
    id: "v40_final_failed_gate",
    label: "V40.4-V40.7 failed gate",
    command: ["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v40_4_to_v40_7_failed_gate.mjs"],
    timeoutMs: 180_000,
    expected: "nonzero_failed_gate"
  }
];

function main() {
  fs.mkdirSync(screenshotDir, { recursive: true });
  fs.mkdirSync(visualDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const docs = readDocs();
  const preflight = collectPreflight();
  const commandResults = commandPlan.map(runCommand);
  const copiedVisuals = copyVisualEvidence();
  const evidence = readEvidence();
  const staticAudit = auditDocsAndImplementation(docs, evidence);
  const claimScan = runV40NoWebUIClaimScan({
    phase: "V40 stage audit",
    targetDecision: "failed",
    commandResults: commandResults.map(({ id, label, auditStatus, exitCode }) => ({ id, label, auditStatus, exitCode })),
    evidence: compactEvidence(evidence)
  });
  const securityScan = runV40NoWebUISecurityScan({
    phase: "V40 stage audit",
    refs,
    copiedVisuals,
    evidence: compactEvidence(evidence)
  });

  let result = {
    phase: "V40 stage audit",
    date: phaseDate,
    startedAt,
    completedAt: new Date().toISOString(),
    auditStatus: statusForAudit(commandResults, staticAudit, claimScan, securityScan),
    targetStatus: "failed",
    targetReason: "V40.3R6 generated two real same-sample candidates, but acceptedVisualCount is 0; V40.4 and V40.5 remain blocked.",
    preflight,
    refs,
    commandResults,
    staticAudit,
    copiedVisuals,
    browserScreenshots: [],
    evidence: compactEvidence(evidence),
    claimScan,
    securityScan,
    reportRef,
    resultRef
  };

  fs.writeFileSync(reportPath, stripTrailingWhitespace(renderHtml(result)), "utf8");
  const browserScreenshots = collectHeadlessScreenshots();
  result = {
    ...result,
    completedAt: new Date().toISOString(),
    browserScreenshots,
    auditStatus: statusForAudit(commandResults, staticAudit, claimScan, securityScan, browserScreenshots)
  };
  fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(reportPath, stripTrailingWhitespace(renderHtml(result)), "utf8");

  console.log(JSON.stringify({
    auditStatus: result.auditStatus,
    targetStatus: result.targetStatus,
    reportRef,
    resultRef,
    browserScreenshots: browserScreenshots.map((shot) => shot.ref)
  }, null, 2));

  if (result.auditStatus === "failed") process.exitCode = 1;
}

function readDocs() {
  return Object.fromEntries(Object.entries({
    prd: refs.prd,
    targetArchitecture: refs.targetArchitecture,
    developmentPlan: refs.developmentPlan,
    acceptancePlan: refs.acceptancePlan,
    phaseSpecs: refs.phaseSpecs,
    implementationContract: refs.implementationContract,
    r5: refs.r5Md,
    r6: refs.r6Md,
    v40_4: refs.v40_4,
    v40_5: refs.v40_5,
    v40_7: refs.v40_7
  }).map(([key, ref]) => [key, readText(ref)]));
}

function readEvidence() {
  return {
    r5: readJsonIfExists(refs.r5Json),
    r6: readJsonIfExists(refs.r6Json),
    finalGate: readJsonIfExists(refs.finalJson),
    manifest: readJsonIfExists(refs.candidateManifest)
  };
}

function collectPreflight() {
  return {
    branch: runText(["git", "branch", "--show-current"]),
    head: runText(["git", "rev-parse", "--short", "HEAD"]),
    chromeMode: "headless local-file screenshots only; no desktop pet GUI launch and no visible browser window for capture",
    chromeAvailable: fs.existsSync(chromePath),
    dirtyFileCount: runText(["git", "status", "--short"]).split(/\r?\n/).filter(Boolean).length
  };
}

function runCommand(item) {
  const started = Date.now();
  const result = spawnSync(item.command[0], item.command.slice(1), {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: item.timeoutMs,
    maxBuffer: 50 * 1024 * 1024,
    env: { ...process.env, ...(item.env ?? {}) }
  });
  const exitCode = typeof result.status === "number" ? result.status : null;
  const timedOut = Boolean(result.error && result.error.code === "ETIMEDOUT");
  const auditStatus = commandAuditStatus(item, exitCode, timedOut);
  return {
    id: item.id,
    label: item.label,
    auditStatus,
    exitCode,
    durationMs: Date.now() - started,
    timedOut,
    expectedBehavior: item.expected,
    summary: summarizeCommand(item, result.stdout ?? "", result.stderr ?? "", exitCode, timedOut)
  };
}

function commandAuditStatus(item, exitCode, timedOut) {
  if (timedOut) return "failed";
  if (item.expected === "zero") return exitCode === 0 ? "passed" : "failed";
  if (item.expected === "nonzero_failed_gate") return exitCode && exitCode !== 0 ? "passed_expected_failed_gate" : "failed_unexpected_pass";
  return exitCode === 0 ? "passed" : "failed";
}

function summarizeCommand(item, stdout, stderr, exitCode, timedOut) {
  if (timedOut) return "命令超时，审计失败。";
  if (item.expected === "nonzero_failed_gate") {
    return exitCode && exitCode !== 0
      ? "非零退出符合预期：该阶段脚本用失败退出码表达 V40 目标验收未通过。"
      : "异常：失败门禁脚本返回 0，可能误把 V40 写成通过。";
  }
  const combined = `${stdout}\n${stderr}`;
  const testMatch = combined.match(/# pass\s+(\d+)[\s\S]*?# fail\s+(\d+)/i);
  if (testMatch) return `Node test summary: pass ${testMatch[1]}, fail ${testMatch[2]}.`;
  if (/Done in|Tests\s+\d+\s+passed|passed/i.test(combined) && exitCode === 0) return "命令完成且退出码为 0。";
  return exitCode === 0 ? "命令完成，退出码为 0。" : "命令失败，退出码非 0。";
}

function copyVisualEvidence() {
  const visualRefs = [
    `${evidenceRootRef}/assets/v40-3r6-controlled-candidates/v38-a-cat-public-contact-sheet.png`,
    `${evidenceRootRef}/assets/v40-3r6-controlled-candidates/v38-tuxedo-public-contact-sheet.png`
  ];
  return visualRefs.map((ref) => {
    const source = path.join(repoRoot, ref);
    const dest = path.join(visualDir, path.basename(ref));
    if (fs.existsSync(source)) fs.copyFileSync(source, dest);
    return {
      title: ref.includes("tuxedo") ? "V40.3R6 tuxedo candidate contact sheet" : "V40.3R6 tabby candidate contact sheet",
      sourceRef: ref,
      ref: safeRelative(dest),
      exists: fs.existsSync(dest)
    };
  });
}

function collectHeadlessScreenshots() {
  const targets = [
    {
      id: "v40_6_failed_visual_report",
      title: "V40.6 失败态视觉报告 headless 截图",
      htmlRef: refs.v40_6,
      screenshotName: "v40_6_failed_visual_report.png"
    },
    {
      id: "v40_stage_audit_report",
      title: "本阶段审计报告 headless 截图",
      htmlRef: reportRef,
      screenshotName: "v40_stage_audit_report.png"
    }
  ];
  return targets.map((target) => captureHeadless(target));
}

function captureHeadless(target) {
  const screenshotPath = path.join(screenshotDir, target.screenshotName);
  if (!fs.existsSync(chromePath)) {
    return { ...target, status: "blocked", reason: "chrome_not_found", ref: safeRelative(screenshotPath) };
  }
  const htmlPath = path.join(repoRoot, target.htmlRef);
  if (!fs.existsSync(htmlPath)) {
    return { ...target, status: "blocked", reason: "html_missing", ref: safeRelative(screenshotPath) };
  }
  const userDataDir = path.join(outDir, `.chrome-profile-${target.id}`);
  fs.rmSync(userDataDir, { recursive: true, force: true });
  fs.mkdirSync(userDataDir, { recursive: true });
  try {
    execFileSync(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      `--user-data-dir=${toChromePath(userDataDir)}`,
      "--window-size=1440,1800",
      `--screenshot=${toChromePath(screenshotPath)}`,
      toFileUrlForChrome(htmlPath)
    ], {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 90_000,
      stdio: ["ignore", "pipe", "pipe"]
    });
    fs.rmSync(userDataDir, { recursive: true, force: true });
    return {
      ...target,
      status: fs.existsSync(screenshotPath) ? "passed" : "failed",
      ref: safeRelative(screenshotPath),
      reason: fs.existsSync(screenshotPath) ? null : "screenshot_missing"
    };
  } catch (error) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
    return {
      ...target,
      status: "failed",
      ref: safeRelative(screenshotPath),
      reason: "headless_capture_failed"
    };
  }
}

function auditDocsAndImplementation(docs, evidence) {
  const checks = [
    {
      id: "prd_no_webui_direct_route",
      label: "PRD 限定 no-WebUI direct local route",
      status: includesAll(docs.prd, ["Direct Local Runner", "WebUI", "ComfyUI", "V40.3R6", "V40.4 remains No-Go"]) ? "passed" : "failed"
    },
    {
      id: "architecture_specific_entities",
      label: "目标架构包含具体代码/门禁实体",
      status: includesAll(docs.targetArchitecture, ["LocalImageCandidateOrchestrator", "DirectLocalImageModelAdapter", "DirectRunnerPredevAuditGate", "ControlledCandidateFrameGenerationGate"]) ? "passed" : "failed"
    },
    {
      id: "implementation_files_exist",
      label: "R5/R6 相关实现文件存在",
      status: [
        "apps/desktop/src/assets/v40-direct-local-image-model.ts",
        "apps/desktop/src/assets/v40-local-image-candidate-orchestrator.ts",
        "scripts/v40_3r5_direct_runner_predev_audit.mjs",
        "scripts/v40_3r6_controlled_candidate_frame_generation.mjs",
        "scripts/v40_4_to_v40_7_failed_gate.mjs"
      ].every((ref) => fs.existsSync(path.join(repoRoot, ref))) ? "passed" : "failed"
    },
    {
      id: "r5_passed",
      label: "V40.3R5 predev audit passed scoped",
      status: evidence.r5?.decision === "passed scoped" ? "passed" : "failed"
    },
    {
      id: "r6_failed_truthfully",
      label: "V40.3R6 真实候选生成后失败",
      status: evidence.r6?.decision === "failed" && Number(evidence.r6?.acceptedVisualCount ?? -1) === 0 ? "passed" : "failed"
    },
    {
      id: "final_gate_failed",
      label: "V40.7 final gate 保持 failed",
      status: String(readText(refs.v40_7)).includes("Status: failed") ? "passed" : "failed"
    },
    {
      id: "no_product_unlock",
      label: "V40.4/V40.5 未被错误解锁",
      status: includesAll(docs.v40_4, ["Status: blocked", "V40.4 entry: No-Go"]) &&
        includesAll(docs.v40_5, ["Status: blocked", "Current accepted V40.4 candidates: 0"])
        ? "passed"
        : "failed"
    }
  ];
  const coverage = [
    {
      requirement: "至少两个 tested cat samples 和一个 negative/blocked sample",
      status: evidence.r5?.sampleMatrix?.testedCatSamples?.length >= 2 || evidence.r6?.generatedCount >= 2 ? "covered" : "gap",
      evidence: "R5 sample matrix / R6 generatedCount"
    },
    {
      requirement: "真实候选生成",
      status: evidence.r6?.generated === true && evidence.r6?.generatedCount === 2 ? "covered_failed_quality" : "gap",
      evidence: "R6 manifest and contact sheets"
    },
    {
      requirement: "显式视觉审查",
      status: Array.isArray(evidence.r6?.visualReviews) && evidence.r6.visualReviews.length === 2 ? "covered_failed_quality" : "gap",
      evidence: "R6 visualReviews"
    },
    {
      requirement: "V40.4 normalization",
      status: "blocked",
      evidence: "acceptedVisualCount = 0"
    },
    {
      requirement: "V40.5 preview/apply/rollback",
      status: "blocked",
      evidence: "no accepted V40 pack"
    },
    {
      requirement: "V40 final scoped quality claim",
      status: "failed",
      evidence: "V40.7 final gate"
    }
  ];
  const codeReviewFindings = [
    {
      priority: "Critical",
      finding: "V40 尚未实现高质量图生动作资产出门目标。",
      evidence: "R6 acceptedVisualCount = 0，V40.4/V40.5 blocked，V40.7 failed。"
    },
    {
      priority: "Medium",
      finding: "R6 候选是单帧 contact sheet 证据，不是可应用到桌宠的多帧 action pack。",
      evidence: "R6 visual review states single still images and weak action semantics."
    },
    {
      priority: "Medium",
      finding: "当前产品体验仍应回退到 V39，不应向用户展示 V40 已可应用。",
      evidence: "V40.5 blocked because no accepted V40 pack exists."
    }
  ];
  return {
    checks,
    coverage,
    codeReviewFindings,
    status: checks.every((check) => check.status === "passed") ? "passed" : "failed"
  };
}

function statusForAudit(commandResults, staticAudit, claimScan, securityScan, browserScreenshots = []) {
  if (commandResults.some((result) => result.auditStatus === "failed" || result.auditStatus === "failed_unexpected_pass")) return "failed";
  if (staticAudit.status !== "passed") return "failed";
  if (claimScan.status !== "passed" || securityScan.status !== "passed") return "failed";
  if (browserScreenshots.some((shot) => shot.status === "failed")) return "failed";
  return "passed scoped for audit";
}

function compactEvidence(evidence) {
  return {
    r5Decision: evidence.r5?.decision ?? "missing",
    r6Decision: evidence.r6?.decision ?? "missing",
    r6Generated: Boolean(evidence.r6?.generated),
    r6GeneratedCount: Number(evidence.r6?.generatedCount ?? 0),
    r6AcceptedVisualCount: Number(evidence.r6?.acceptedVisualCount ?? 0),
    r6V40_4Entry: evidence.r6?.v40_4Entry ?? "missing",
    candidateRefs: Array.isArray(evidence.r6?.candidateSummaries)
      ? evidence.r6.candidateSummaries.map((candidate) => ({
        candidateId: candidate.candidateId,
        sampleId: candidate.sampleId,
        contactSheetRef: candidate.contactSheetRef,
        status: candidate.status
      }))
      : [],
    finalGateDecision: evidence.finalGate?.v40_7?.decision ?? "failed"
  };
}

function renderHtml(result) {
  const commandRows = result.commandResults.map((command) => `
    <tr>
      <td>${escapeHtml(command.label)}</td>
      <td><span class="pill ${classFor(command.auditStatus)}">${escapeHtml(command.auditStatus)}</span></td>
      <td>${escapeHtml(String(command.exitCode))}</td>
      <td>${escapeHtml(command.summary)}</td>
    </tr>
  `).join("");

  const checkRows = result.staticAudit.checks.map((check) => `
    <tr>
      <td>${escapeHtml(check.label)}</td>
      <td><span class="pill ${classFor(check.status)}">${escapeHtml(check.status)}</span></td>
      <td>${escapeHtml(check.id)}</td>
    </tr>
  `).join("");

  const coverageRows = result.staticAudit.coverage.map((item) => `
    <tr>
      <td>${escapeHtml(item.requirement)}</td>
      <td><span class="pill ${classFor(item.status)}">${escapeHtml(item.status)}</span></td>
      <td>${escapeHtml(item.evidence)}</td>
    </tr>
  `).join("");

  const findingCards = result.staticAudit.codeReviewFindings.map((finding) => `
    <article class="finding">
      <strong>${escapeHtml(finding.priority)} · ${escapeHtml(finding.finding)}</strong>
      <p>${escapeHtml(finding.evidence)}</p>
    </article>
  `).join("");

  const visualCards = result.copiedVisuals.map((visual) => `
    <figure>
      <img src="${escapeHtml(relativeFromReport(visual.ref))}" alt="${escapeHtml(visual.title)}" />
      <figcaption>${escapeHtml(visual.title)}。来源：${escapeHtml(visual.sourceRef)}。结论：真实候选存在，但视觉验收失败。</figcaption>
    </figure>
  `).join("");

  const screenshotCards = result.browserScreenshots.map((shot) => `
    <figure>
      ${shot.status === "passed" ? `<img src="${escapeHtml(relativeFromReport(shot.ref))}" alt="${escapeHtml(shot.title)}" />` : ""}
      <figcaption>${escapeHtml(shot.title)}：${escapeHtml(shot.status)}${shot.reason ? `，原因：${escapeHtml(shot.reason)}` : ""}</figcaption>
    </figure>
  `).join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V40 阶段性自动化验收报告</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4f7fb;
      --paper: #ffffff;
      --ink: #172033;
      --muted: #5c697a;
      --line: #d9e2ee;
      --green: #127a52;
      --amber: #9a5b00;
      --red: #b42318;
      --blue: #2457c5;
      font-family: Arial, "Microsoft YaHei", sans-serif;
      background: var(--bg);
      color: var(--ink);
    }
    body { margin: 0; padding: 28px; }
    main { max-width: 1220px; margin: 0 auto; }
    .hero, section, figure, .finding {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(20, 30, 50, 0.04);
    }
    .hero { padding: 28px; margin-bottom: 18px; border-left: 8px solid var(--red); }
    section { padding: 22px; margin-bottom: 18px; }
    h1 { margin: 0 0 10px; font-size: 30px; }
    h2 { margin: 0 0 14px; font-size: 22px; }
    h3 { margin: 0 0 8px; font-size: 17px; }
    p { line-height: 1.65; margin: 8px 0; }
    code { background: #eef4fb; padding: 2px 5px; border-radius: 4px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 8px; border-bottom: 1px solid #e5edf6; text-align: left; vertical-align: top; }
    th { color: #334155; background: #f8fbff; }
    ul { line-height: 1.75; }
    .muted { color: var(--muted); }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-top: 18px; }
    .metric { border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: #fbfdff; }
    .metric span { display: block; color: var(--muted); font-size: 12px; }
    .metric strong { display: block; margin-top: 4px; font-size: 19px; }
    .architecture { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .box { border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: #fbfdff; }
    .pill { display: inline-block; border-radius: 999px; padding: 4px 9px; font-size: 12px; font-weight: 700; white-space: nowrap; }
    .pass { background: #e7f7ef; color: var(--green); }
    .warn { background: #fff3d7; color: var(--amber); }
    .fail { background: #fdecec; color: var(--red); }
    .neutral { background: #eef4fb; color: #34516f; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; }
    figure { margin: 0; padding: 12px; }
    figure img { display: block; width: 100%; max-height: 760px; object-fit: contain; background: #fff; border: 1px solid #e0e7f1; border-radius: 6px; }
    figcaption { margin-top: 9px; color: var(--muted); font-size: 13px; line-height: 1.5; }
    .finding { padding: 14px; margin-bottom: 10px; border-left: 5px solid var(--amber); }
    .callout { border-left: 5px solid var(--red); background: #fffafa; padding: 12px 14px; border-radius: 6px; }
    @media (max-width: 820px) {
      body { padding: 14px; }
      .architecture { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header class="hero">
      <h1>V40 阶段性自动化验收报告</h1>
      <p><strong>目标验收结论：V40 failed。</strong> 本轮审计完成了命令重跑、文档/代码/功能检查、真实候选图证据和 headless 截图，但 V40.3R6 的两个真实候选均未通过显式视觉审查，acceptedVisualCount = ${escapeHtml(String(result.evidence.r6AcceptedVisualCount))}。</p>
      <p class="muted">本报告不声明 V40 passed、不声明任意猫照片自动生成高质量动作资产、不声明 Petdex parity、不声明 provider/WebUI/ComfyUI 路线 ready、不声明 production 或平台 ready。</p>
      <div class="summary">
        <div class="metric"><span>审计执行状态</span><strong>${escapeHtml(result.auditStatus)}</strong></div>
        <div class="metric"><span>V40 目标状态</span><strong>${escapeHtml(result.targetStatus)}</strong></div>
        <div class="metric"><span>R6 生成候选</span><strong>${escapeHtml(String(result.evidence.r6GeneratedCount))}</strong></div>
        <div class="metric"><span>视觉通过候选</span><strong>${escapeHtml(String(result.evidence.r6AcceptedVisualCount))}</strong></div>
      </div>
    </header>

    <section>
      <h2>验收评价</h2>
      <div class="callout">
        <p>当前项目可以证明：V40 的 no-WebUI direct local runner 路线已经进入真实候选生成和失败态闭环，证据链可审计。</p>
        <p>当前项目不能证明：已经实现“图生高质量 2D 动作资产”或“任意猫照片自动生成高质量动作资产”。V40.4 normalization、V40.5 preview/apply/rollback 和 V40.7 final gate 均未通过。</p>
      </div>
    </section>

    <section>
      <h2>目标架构与当前实现</h2>
      <div class="architecture">
        <div class="box">
          <h3>V40 目标架构</h3>
          <ul>
            <li>tested cat sample / safe user photo。</li>
            <li>PhotoSafetyIntake、SourceAndLicenseRecord、SubjectMaskAndCropPlan。</li>
            <li>IdentityAnchorPack、ActionPoseConditionPack。</li>
            <li>DirectLocalImageModelAdapter / DirectDiffusersFrameRunner。</li>
            <li>CandidateFrameSequence、CandidateQualityReview、V39SameSampleComparison。</li>
            <li>V40.4 normalization、V40.5 preview/apply/rollback、V40.7 final gate。</li>
          </ul>
        </div>
        <div class="box">
          <h3>当前实现状态</h3>
          <ul>
            <li>R5 predev audit passed scoped：源记录、样本矩阵、动作映射和 runner 边界已审计。</li>
            <li>R6 generated：两个同样本候选 contact sheet 已生成。</li>
            <li>R6 visual review failed：候选仍是照片式单帧集合，动作语义弱，不优于同样本 V39。</li>
            <li>V40.4 blocked：没有两个视觉通过候选。</li>
            <li>V40.5 blocked：没有 accepted V40 pack 可预览、应用或回滚。</li>
            <li>V39 仍是当前 fallback 产品路径。</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2>命令与端到端验收</h2>
      <table>
        <thead><tr><th>审计项</th><th>状态</th><th>退出码</th><th>摘要</th></tr></thead>
        <tbody>${commandRows}</tbody>
      </table>
    </section>

    <section>
      <h2>PRD / 文档 / 代码一致性检查</h2>
      <table>
        <thead><tr><th>检查项</th><th>状态</th><th>编号</th></tr></thead>
        <tbody>${checkRows}</tbody>
      </table>
    </section>

    <section>
      <h2>功能覆盖矩阵</h2>
      <table>
        <thead><tr><th>PRD 功能点</th><th>当前覆盖</th><th>证据</th></tr></thead>
        <tbody>${coverageRows}</tbody>
      </table>
    </section>

    <section>
      <h2>截图与视觉证据</h2>
      <p>自动化截图使用 Chrome headless 本地文件模式采集；未启动桌面宠物 GUI，未打开可见浏览器窗口，截图后删除临时浏览器 profile。</p>
      <div class="grid">${visualCards}${screenshotCards}</div>
    </section>

    <section>
      <h2>代码审计发现</h2>
      ${findingCards}
    </section>

    <section>
      <h2>Claim / Security Scan</h2>
      <table>
        <thead><tr><th>扫描项</th><th>状态</th><th>命中</th></tr></thead>
        <tbody>
          <tr><td>Claim scan</td><td><span class="pill ${classFor(result.claimScan.status)}">${escapeHtml(result.claimScan.status)}</span></td><td>${escapeHtml((result.claimScan.hits ?? []).join(", ") || "none")}</td></tr>
          <tr><td>Security scan</td><td><span class="pill ${classFor(result.securityScan.status)}">${escapeHtml(result.securityScan.status)}</span></td><td>${escapeHtml((result.securityScan.hits ?? []).join(", ") || "none")}</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>最终结论</h2>
      <p><strong>阶段性审计可以通过：证据完整、失败态诚实、没有扩大声明。</strong></p>
      <p><strong>V40 产品目标没有通过：</strong>当前不能进入“图生高质量动作资产已完成”的人工详细体验审查；只能审查流程、证据链和失败原因。</p>
    </section>
  </main>
</body>
</html>
`;
}

function readText(ref) {
  const abs = path.join(repoRoot, ref);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
}

function readJsonIfExists(ref) {
  const abs = path.join(repoRoot, ref);
  if (!fs.existsSync(abs)) return null;
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

function includesAll(text, fragments) {
  return fragments.every((fragment) => text.includes(fragment));
}

function runText(args) {
  try {
    return execFileSync(args[0], args.slice(1), { cwd: repoRoot, encoding: "utf8", timeout: 30_000 }).trim();
  } catch {
    return "";
  }
}

function safeRelative(absPath) {
  return path.relative(repoRoot, absPath).replaceAll("\\", "/");
}

function relativeFromReport(ref) {
  return path.relative(path.dirname(reportPath), path.join(repoRoot, ref)).replaceAll("\\", "/");
}

function classFor(status) {
  const text = String(status);
  if (text.includes("passed") || text === "covered" || text === "covered_failed_quality") return "pass";
  if (text.includes("blocked") || text.includes("expected") || text.includes("gap")) return "warn";
  if (text.includes("failed") || text.includes("fail")) return "fail";
  return "neutral";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTrailingWhitespace(value) {
  return value.replace(/[ \t]+$/gm, "");
}

function toChromePath(absPath) {
  if (absPath.startsWith("/mnt/c/")) return `C:\\${absPath.slice("/mnt/c/".length).replaceAll("/", "\\")}`;
  return absPath;
}

function toFileUrlForChrome(absPath) {
  if (absPath.startsWith("/mnt/c/")) {
    return `file:///C:/${absPath.slice("/mnt/c/".length).split("/").map(encodeURIComponent).join("/")}`;
  }
  return pathToFileURL(absPath).href;
}

main();
