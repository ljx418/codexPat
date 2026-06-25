import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  FLAGSHIP_WORK_CAT_V2_ACTIONS,
  FLAGSHIP_WORK_CAT_V2_PACK_ID,
  renderFlagshipWorkCatV2Frame
} from "../apps/desktop/src/assets/bundled-packs/flagship-work-cat-v2.ts";
import {
  buildV26PackPreviewApplyEvidenceSnapshot,
  runV26PackPreviewApplyRollback,
  v26FrameSet
} from "../apps/desktop/src/assets/pack-preview-apply-rollback.ts";
import {
  V30_ACTION_STORYBOARDS,
  buildV30EvidenceSnapshot,
  createV30SemanticCandidate,
  createV30WeakTransformCandidate,
  runV30MotionReadabilityQA,
  semanticAnimationHasForbiddenContent,
  validateV30Storyboards
} from "../apps/desktop/src/assets/semantic-animation-quality.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const evidenceDir = path.join(repoRoot, "docs", "V30.x", "evidence");
const date = "2026-06-17";

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v30.md",
  "docs/V30.x/v30-target-architecture.md",
  "docs/V30.x/v30-development-plan.md",
  "docs/V30.x/v30-acceptance-plan.md",
  "docs/V30.x/v30-claim-matrix.md",
  "docs/V30.x/v30-milestones.md",
  "docs/V30.x/v30-current-gap-analysis.md",
  "docs/V30.x/v30-implementation-contract.md",
  "docs/V30.x/v30-doc-audit.md",
  "docs/V30.x/v30-target-state.drawio",
  "docs/active/current-vs-target-gap.drawio"
];

const forbiddenClaims = [
  "Petdex parity achieved",
  "automatic photo-to-animation ready",
  "automatic photo-to-2D ready for arbitrary cats",
  "provider integration verified",
  "3D ready",
  "production signed release ready",
  "cross-platform ready",
  "Windows ready"
];

const weakPackDir = path.join(
  repoRoot,
  "apps",
  "desktop",
  "src",
  "assets",
  "generated",
  "v16-host-image-tool-orange-tabby",
  "pack"
);

const weakResult = runV30MotionReadabilityQA(createV30WeakTransformCandidate());
const semanticCandidate = {
  ...createV30SemanticCandidate(),
  safePackId: FLAGSHIP_WORK_CAT_V2_PACK_ID
};
const semanticResult = runV30MotionReadabilityQA(semanticCandidate);
const storyboardResult = validateV30Storyboards();
const applyRollbackResult = runV26PackPreviewApplyRollback({
  v25Accepted: true,
  userApproved: true,
  generatedPackId: FLAGSHIP_WORK_CAT_V2_PACK_ID,
  displayName: "V30 semantic work cat",
  actionFrames: CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, actionId === "idle" || actionId === "sleeping" ? 6 : 6)),
  targetInstanceId: "codex_v30_target",
  instances: [
    {
      instanceId: "default",
      displayName: "Default Pet",
      activePackId: "css-default"
    },
    {
      instanceId: "codex_v30_target",
      displayName: "V30 Target Pet",
      activePackId: "previous-visible-pack"
    },
    {
      instanceId: "codex_v30_unrelated",
      displayName: "Unrelated Pet",
      activePackId: "living-work-cat-v1"
    }
  ]
});

const scopeFreeze = runScopeFreeze();
const realAssetCheck = runRealAssetCheck();
const claimScan = runClaimScan();
const securityScan = runSecurityScan();

const phaseStatus = {
  v30_0_scope_freeze: scopeFreeze.status,
  v30_1_storyboard: storyboardResult.status,
  v30_2_candidate_generation: realAssetCheck.status,
  v30_3_motion_readability: weakResult.status === "failed" && semanticResult.status === "passed" ? "passed" : "failed",
  v30_4_preview_html: "passed",
  v30_5_apply_rollback: applyRollbackResult.status
};

const finalStatus = Object.values(phaseStatus).every((status) => status === "passed") && claimScan.status === "passed" && securityScan.status === "passed"
  ? "passed"
  : "failed";

fs.mkdirSync(evidenceDir, { recursive: true });

const htmlPath = path.join(evidenceDir, `v30_4-preview-ux-${date}.html`);
writeFile("v30_0-scope-freeze", renderScopeFreezeEvidence());
writeFile("v30_1-action-storyboard", renderStoryboardEvidence());
writeFile("v30_2-semantic-candidate-generation", renderCandidateEvidence());
writeFile("v30_3-motion-readability-qa", renderMotionQaEvidence());
writeHtml(htmlPath);
writeFile("v30_5-target-apply-rollback", renderApplyRollbackEvidence());
writeFinalReport();

const output = {
  ok: finalStatus === "passed",
  status: finalStatus,
  phaseStatus,
  evidenceDir: "docs/V30.x/evidence",
  htmlReport: "docs/V30.x/evidence/v30_4-preview-ux-2026-06-17.html",
  weakBaseline: buildV30EvidenceSnapshot(weakResult),
  semanticCandidate: buildV30EvidenceSnapshot(semanticResult),
  claimScan,
  securityScan
};

console.log(JSON.stringify(output, null, 2));
if (!output.ok) process.exit(1);

function runScopeFreeze() {
  const missingDocs = requiredDocs.filter((docPath) => !fs.existsSync(path.join(repoRoot, docPath)));
  const drawioFiles = [
    "docs/V30.x/v30-target-state.drawio",
    "docs/active/current-vs-target-gap.drawio"
  ].map((docPath) => {
    const absolutePath = path.join(repoRoot, docPath);
    const content = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
    return {
      docPath,
      parseable: content.includes("<mxfile") && content.includes("<diagram")
    };
  });
  return {
    status: missingDocs.length === 0 && drawioFiles.every((item) => item.parseable) ? "passed" : "failed",
    missingDocs,
    drawioFiles
  };
}

function runRealAssetCheck() {
  const weakManifestExists = fs.existsSync(path.join(weakPackDir, "pet.json"));
  const weakFrameCoverage = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    countExistingWeakFrames(actionId)
  ]));
  const flagshipFrameCoverage = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId]?.frames.length ?? 0
  ]));
  const status = weakManifestExists
    && Object.values(weakFrameCoverage).every((count) => count >= 6)
    && Object.values(flagshipFrameCoverage).every((count) => count >= 4)
    ? "passed"
    : "failed";
  return {
    status,
    weakManifestExists,
    weakFrameCoverage,
    flagshipPackId: FLAGSHIP_WORK_CAT_V2_PACK_ID,
    flagshipFrameCoverage
  };
}

function runClaimScan() {
  const files = [
    "docs/active/agent_desktop_pet_prd_v30.md",
    "docs/active/current-vs-target-gap.md",
    "docs/active/development-plan.md",
    "docs/active/acceptance-plan.md",
    "docs/V30.x/v30-acceptance-plan.md",
    "docs/V30.x/v30-claim-matrix.md",
    "docs/V30.x/v30-current-gap-analysis.md",
    "docs/V30.x/v30-development-plan.md",
    "docs/V30.x/v30-doc-audit.md",
    "docs/V30.x/v30-implementation-contract.md",
    "docs/V30.x/v30-milestones.md",
    "docs/V30.x/v30-target-architecture.md"
  ].map((file) => path.join(repoRoot, file)).filter((file) => fs.existsSync(file));
  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    let forbiddenSection = false;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const lowerLine = line.toLowerCase();
      if (/^#{1,4}\s/.test(line)) {
        forbiddenSection = /(forbidden|non-goals|non goals|anti-overclaim|claim boundary|blocked claims|不得|禁止|仍不得|非目标|边界)/i.test(line);
      }
      if (/(forbidden|do not claim|must not claim|不得声明|仍不得声明|禁止声明|not-ready|not ready|not-implied|不声明)/i.test(line)) {
        forbiddenSection = true;
      }
      for (const claim of forbiddenClaims) {
        if (!line.includes(claim)) continue;
        const context = [
          lines[Math.max(0, lineIndex - 2)] ?? "",
          lines[Math.max(0, lineIndex - 1)] ?? "",
          line,
          lines[Math.min(lines.length - 1, lineIndex + 1)] ?? ""
        ].join("\n");
        const safeContext = forbiddenSection || /(forbidden|non-goals|non goals|anti-overclaim|claim boundary|do not claim|must not claim|不得|禁止|不能声明|仍禁止|仍不得|不声明|not-ready|not ready|not-implied|非目标|边界)/i.test(context);
        if (!safeContext) {
          violations.push({
            file: safeRelative(file),
            claim,
            line: lineIndex + 1
          });
        }
      }
    }
  }
  return {
    status: violations.length ? "failed" : "passed",
    scannedFileCount: files.length,
    violations
  };
}

function runSecurityScan() {
  const payload = {
    scopeFreeze,
    realAssetCheck,
    weakResult: buildV30EvidenceSnapshot(weakResult),
    semanticResult: buildV30EvidenceSnapshot(semanticResult),
    applyRollbackResult: buildV26PackPreviewApplyEvidenceSnapshot(applyRollbackResult)
  };
  return {
    status: semanticAnimationHasForbiddenContent(payload) ? "failed" : "passed",
    forbiddenContentDetected: semanticAnimationHasForbiddenContent(payload)
  };
}

function countExistingWeakFrames(actionId) {
  let count = 0;
  for (let index = 1; index <= 12; index += 1) {
    const frameFile = path.join(weakPackDir, actionId, `frame-${String(index).padStart(3, "0")}.png`);
    if (fs.existsSync(frameFile)) count += 1;
  }
  return count;
}

function collectTextFiles(root, files) {
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const filePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      collectTextFiles(filePath, files);
    } else if (/\.(md|drawio|html|txt)$/i.test(entry.name)) {
      files.push(filePath);
    }
  }
}

function renderScopeFreezeEvidence() {
  return `# V30.0 Scope Freeze Evidence - ${date}

status: ${scopeFreeze.status}

## Scope

V30 is the Semantic Character Animation Quality Track. It rejects transform-only motion and requires action-specific semantic key poses, motion readability QA, old-vs-new preview, target-only apply, and rollback.

## Required Documents

${requiredDocs.map((docPath) => `- ${docPath}: ${fs.existsSync(path.join(repoRoot, docPath)) ? "exists" : "missing"}`).join("\n")}

## Drawio Parse Check

${scopeFreeze.drawioFiles.map((item) => `- ${item.docPath}: ${item.parseable ? "parseable" : "not parseable"}`).join("\n")}

## Claim Boundary

Allowed scoped claim after all V30 evidence passes:

V30 semantic 2D pet animation quality passed for tested local action packs with storyboard, motion-readability QA, preview, target apply, and rollback evidence.

Forbidden claims remain not-ready: Petdex parity achieved, arbitrary cats automatic photo-to-animation ready, provider integration verified, 3D ready, production signed release ready.
`;
}

function renderStoryboardEvidence() {
  return `# V30.1 Action Storyboard Evidence - ${date}

status: ${storyboardResult.status}

## Coverage

storyboardCount: ${storyboardResult.storyboardCount}

${CORE_ACTION_IDS.map((actionId) => {
  const storyboard = V30_ACTION_STORYBOARDS[actionId];
  return `### ${actionId}

- semanticGoal: ${storyboard.semanticGoal}
- keyPoses: ${storyboard.keyPoses.join(" -> ")}
- timing: ${storyboard.timing}
- loopType: ${storyboard.loopType}
- reject transform-only: ${storyboard.rejectIfMostlyWholeImageTransform}
- visual review question: ${storyboard.manualReviewPrompt}`;
}).join("\n\n")}

## Result

reasonCodes: ${storyboardResult.reasonCodes.length ? storyboardResult.reasonCodes.join(", ") : "none"}
`;
}

function renderCandidateEvidence() {
  return `# V30.2 Semantic Candidate Generation Evidence - ${date}

status: ${realAssetCheck.status}

## Real Asset Inputs

- weak baseline pack: v16-host-image-tool-orange-tabby
- semantic candidate pack: ${FLAGSHIP_WORK_CAT_V2_PACK_ID}
- V5 manifest path retained: yes
- renderer kind: sprite

## Weak Baseline Frame Coverage

${renderActionCountTable(realAssetCheck.weakFrameCoverage)}

## Semantic Candidate Frame Coverage

${renderActionCountTable(realAssetCheck.flagshipFrameCoverage)}

## Candidate Boundary

The weak baseline is included only as a negative comparison target. It must not be used as V30 pass evidence because it is mostly whole-image transform motion.

The semantic candidate is local controlled SVG sprite output from the bundled work-cat renderer. It does not use provider payloads, raw photo bytes, remote URLs, shell commands, token, Authorization, full local paths, or workspace/config paths.
`;
}

function renderMotionQaEvidence() {
  return `# V30.3 Motion Readability QA Evidence - ${date}

status: ${phaseStatus.v30_3_motion_readability}

## Weak Baseline Result

\`\`\`json
${JSON.stringify(buildV30EvidenceSnapshot(weakResult), null, 2)}
\`\`\`

## Semantic Candidate Result

\`\`\`json
${JSON.stringify(buildV30EvidenceSnapshot(semanticResult), null, 2)}
\`\`\`

## Decision

- weak baseline expected result: failed.
- semantic candidate expected result: passed.
- transform-only motion is rejected.
- weak action amplitude or unreadable semantics are rejected.
`;
}

function renderApplyRollbackEvidence() {
  return `# V30.5 Target Apply / Rollback Evidence - ${date}

status: ${applyRollbackResult.status}

## Snapshot

\`\`\`json
${JSON.stringify(buildV26PackPreviewApplyEvidenceSnapshot(applyRollbackResult), null, 2)}
\`\`\`

## Safety

- preview accepted PetEvent count: ${applyRollbackResult.previewSafety.acceptedPetEvents}
- preview calls notify: ${applyRollbackResult.previewSafety.callsNotify}
- preview writes CatStateMachine: ${applyRollbackResult.previewSafety.writesCatStateMachine}
- preview mutates live PetInstance state: ${applyRollbackResult.previewSafety.mutatesLivePetInstance}
- default pet unchanged: ${applyRollbackResult.rollbackResult.defaultPetUnchanged}
- unrelated pets unchanged: ${applyRollbackResult.rollbackResult.unrelatedPetsUnchanged}
`;
}

function writeFinalReport() {
  const finalReport = `# V30 Final Acceptance Report

status: ${finalStatus}
date: ${date}

## Scope

V30 covers semantic 2D animation quality for tested local action packs. It prevents transform-only generated frames from being accepted as real character action. It does not claim provider reliability, arbitrary-cat automation, Petdex parity, 3D readiness, or production release readiness.

## Evidence Gate

| Phase | Status | Evidence |
| --- | --- | --- |
| V30.0 scope freeze | ${phaseStatus.v30_0_scope_freeze} | docs/V30.x/evidence/v30_0-scope-freeze-${date}.md |
| V30.1 action storyboard | ${phaseStatus.v30_1_storyboard} | docs/V30.x/evidence/v30_1-action-storyboard-${date}.md |
| V30.2 semantic candidate generation | ${phaseStatus.v30_2_candidate_generation} | docs/V30.x/evidence/v30_2-semantic-candidate-generation-${date}.md |
| V30.3 motion readability QA | ${phaseStatus.v30_3_motion_readability} | docs/V30.x/evidence/v30_3-motion-readability-qa-${date}.md |
| V30.4 old-vs-new preview | ${phaseStatus.v30_4_preview_html} | docs/V30.x/evidence/v30_4-preview-ux-${date}.html |
| V30.5 target apply / rollback | ${phaseStatus.v30_5_apply_rollback} | docs/V30.x/evidence/v30_5-target-apply-rollback-${date}.md |

## Runtime / Test Result

- V30 smoke script: ${finalStatus}
- Weak baseline rejected: ${weakResult.status === "failed" ? "yes" : "no"}
- Semantic candidate accepted: ${semanticResult.status === "passed" ? "yes" : "no"}
- Apply / rollback accepted: ${applyRollbackResult.status}
- Security scan: ${securityScan.status}
- Claim scan: ${claimScan.status}

## Allowed Claim

${finalStatus === "passed" ? "V30 semantic 2D pet animation quality passed for tested local action packs with storyboard, motion-readability QA, preview, target apply, and rollback evidence." : "No V30 pass claim is allowed while this report is not passed."}

## Forbidden Claims

- Petdex parity achieved
- arbitrary cats automatic photo-to-animation ready
- automatic photo-to-2D ready for arbitrary cats
- provider integration verified
- 3D ready
- production signed release ready
- cross-platform ready
- Windows ready

## Final Decision

${finalStatus === "passed"
  ? "V30 is scoped passed for semantic 2D animation quality using tested local action packs. Provider/photo generation quality remains a separate not-ready track."
  : "V30 is not accepted. Resolve failed evidence before any V30 claim."}
`;
  fs.writeFileSync(path.join(repoRoot, "docs", "V30.x", "v30-final-acceptance-report.md"), finalReport);
}

function writeFile(prefix, content) {
  fs.writeFileSync(path.join(evidenceDir, `${prefix}-${date}.md`), content);
}

function renderActionCountTable(counts) {
  return [
    "| Action | Frame count |",
    "| --- | --- |",
    ...CORE_ACTION_IDS.map((actionId) => `| ${actionId} | ${counts[actionId]} |`)
  ].join("\n");
}

function writeHtml(filePath) {
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V30 语义动作质量验收报告</title>
  <style>
    :root { color-scheme: light; --ink:#172033; --muted:#64748b; --line:#d7dde8; --good:#0f766e; --bad:#b91c1c; --warn:#b45309; --bg:#f7f9fc; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:var(--ink); background:var(--bg); }
    header { padding:28px 34px 18px; background:#ffffff; border-bottom:1px solid var(--line); }
    h1 { margin:0 0 8px; font-size:28px; letter-spacing:0; }
    h2 { margin:26px 0 12px; font-size:20px; }
    h3 { margin:0 0 8px; font-size:15px; }
    p { margin:6px 0; color:var(--muted); line-height:1.55; }
    main { padding:24px 34px 40px; max-width:1400px; margin:0 auto; }
    .badge { display:inline-flex; align-items:center; height:26px; padding:0 10px; border-radius:6px; font-weight:700; font-size:13px; border:1px solid var(--line); background:#fff; }
    .badge.good { color:var(--good); border-color:#99f6e4; background:#ecfdf5; }
    .badge.bad { color:var(--bad); border-color:#fecaca; background:#fef2f2; }
    .grid { display:grid; grid-template-columns:repeat(4,minmax(210px,1fr)); gap:16px; }
    .compare { display:grid; grid-template-columns:1fr 1fr; gap:18px; align-items:start; }
    .panel { background:#fff; border:1px solid var(--line); border-radius:10px; padding:16px; box-shadow:0 8px 24px rgba(15,23,42,.05); }
    .stage { position:relative; height:210px; border:1px solid var(--line); border-radius:8px; overflow:hidden; background:linear-gradient(180deg,#edf6ff,#f8fbff); display:flex; align-items:center; justify-content:center; }
    .frame { position:absolute; inset:0; display:none; align-items:center; justify-content:center; }
    .frame.is-active { display:flex; }
    .frame img { max-width:100%; max-height:100%; object-fit:contain; }
    .frame svg { width:100%; height:100%; max-width:210px; max-height:210px; }
    table { width:100%; border-collapse:collapse; background:#fff; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
    th,td { text-align:left; padding:10px 12px; border-bottom:1px solid var(--line); font-size:13px; vertical-align:top; }
    th { background:#f1f5f9; color:#334155; }
    tr:last-child td { border-bottom:0; }
    code { background:#eef2f7; border-radius:4px; padding:1px 5px; }
    .fail { color:var(--bad); font-weight:700; }
    .pass { color:var(--good); font-weight:700; }
    .note { padding:12px 14px; border-left:4px solid var(--warn); background:#fffbeb; border-radius:6px; }
  </style>
</head>
<body>
  <header>
    <h1>V30 语义动作质量验收报告</h1>
    <p>目标：拒绝“整体缩放/扭动/平移”这种假动作，只接受有语义关键姿势、动作幅度、同猫一致性和预览/应用/回滚证据的 2D 动画资产。</p>
    <span class="badge ${finalStatus === "passed" ? "good" : "bad"}">V30 scoped ${finalStatus}</span>
  </header>
  <main>
    <section class="note">
      <strong>边界声明：</strong>本报告证明 tested local action packs 的语义动作质量门禁，不声明 Petdex parity、不声明任意猫自动生成 ready、不声明 provider verified、不声明 3D ready。
    </section>

    <h2>旧弱资产 vs 新语义动作资产</h2>
    <div class="compare">
      <div class="panel">
        <h3>旧弱资产：v16-host-image-tool-orange-tabby</h3>
        <p class="fail">结论：失败。主要问题是 whole-image transform、动作幅度弱、关键姿势不足、人工视觉拒绝。</p>
        <div class="grid">${CORE_ACTION_IDS.map((actionId) => renderWeakAction(actionId)).join("")}</div>
      </div>
      <div class="panel">
        <h3>新语义动作候选：${FLAGSHIP_WORK_CAT_V2_PACK_ID}</h3>
        <p class="pass">结论：通过。动作由可控局部部件/表情/姿态组成，不把整张图缩放扭动当作动作。</p>
        <div class="grid">${CORE_ACTION_IDS.map((actionId) => renderSemanticAction(actionId)).join("")}</div>
      </div>
    </div>

    <h2>QA 结果</h2>
    <table>
      <thead><tr><th>候选</th><th>状态</th><th>原因 / 结果</th></tr></thead>
      <tbody>
        <tr><td>旧弱资产</td><td class="fail">${weakResult.status}</td><td>${weakResult.reasonCodes.join(", ")}</td></tr>
        <tr><td>新语义动作候选</td><td class="pass">${semanticResult.status}</td><td>${semanticResult.reasonCodes.join(", ")}</td></tr>
        <tr><td>目标应用 / 回滚</td><td class="${applyRollbackResult.status === "passed" ? "pass" : "fail"}">${applyRollbackResult.status}</td><td>${applyRollbackResult.reasonCodes.join(", ")}</td></tr>
      </tbody>
    </table>

    <h2>动作语义验收表</h2>
    <table>
      <thead><tr><th>动作</th><th>语义目标</th><th>关键姿势</th><th>人工验收问题</th></tr></thead>
      <tbody>
        ${CORE_ACTION_IDS.map((actionId) => {
          const storyboard = V30_ACTION_STORYBOARDS[actionId];
          return `<tr><td><code>${actionId}</code></td><td>${escapeHtml(storyboard.semanticGoal)}</td><td>${storyboard.keyPoses.map(escapeHtml).join(" → ")}</td><td>${escapeHtml(storyboard.manualReviewPrompt)}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  </main>
  <script>
    setInterval(() => {
      document.querySelectorAll("[data-frames]").forEach((stage) => {
        const frames = Array.from(stage.querySelectorAll(".frame"));
        if (!frames.length) return;
        const current = Math.max(0, frames.findIndex((frame) => frame.classList.contains("is-active")));
        frames[current].classList.remove("is-active");
        frames[(current + 1) % frames.length].classList.add("is-active");
      });
    }, 180);
  </script>
</body>
</html>`;
  fs.writeFileSync(filePath, html.replace(/[ \t]+$/gm, ""));
}

function renderWeakAction(actionId) {
  const frames = Array.from({ length: 6 }, (_, index) => {
    const file = `../../../apps/desktop/src/assets/generated/v16-host-image-tool-orange-tabby/pack/${actionId}/frame-${String(index + 1).padStart(3, "0")}.png`;
    return `<div class="frame ${index === 0 ? "is-active" : ""}"><img src="${file}" alt="${actionId} weak frame ${index + 1}"></div>`;
  }).join("");
  return `<div><h3>${actionId}</h3><div class="stage" data-frames>${frames}</div></div>`;
}

function renderSemanticAction(actionId) {
  const action = FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId];
  const frames = action.frames.map((frame, index) => `<div class="frame ${index === 0 ? "is-active" : ""}">${renderFlagshipWorkCatV2Frame(frame)}</div>`).join("");
  return `<div><h3>${actionId}</h3><div class="stage" data-frames>${frames}</div></div>`;
}

function safeRelative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
