# V32 Development and Acceptance Plan

文档状态：executed scoped plan；执行日期 2026-06-24。

## 阶段目标

V32 的阶段目标是交付并验收真实本地 2D 动作资产质量救火路径：

- 从本地分层 rig 生成 8 动作 frameSequence；
- 用真实 PNG/GIF/HTML/screenshot evidence 证明资产状态；
- 通过 V30/V31/V32 gate 和 preview/apply/rollback；
- 明确任意猫照片自动生成仍未通过。

## 开发计划

| 子阶段 | 开发动作 | 验收动作 | Evidence |
| --- | --- | --- | --- |
| V32.1 | 新增 measured quality gate | 单测覆盖 pass/reject/blocked/unsafe | `apps/desktop/src/assets/v32-quality-rescue.test.ts` |
| V32.2 | 本地生成两个项目自有猫动作包 | 生成 PNG frames、manifest、contact sheet、GIF | `fixtures/manual/v32_quality_rescue/` |
| V32.3 | 接入 V30/V31/V32/runtime gates | 运行 V32 smoke | `docs/V32.x/evidence/v32_quality_rescue-smoke-2026-06-24.md` |
| V32.4 | 生成可读 HTML 验收报告 | Chrome headless screenshot | `docs/V32.x/evidence/v32_quality_rescue-report-2026-06-24.html` |
| V32.5 | final report 和边界扫描 | claim/security scan | `docs/V32.x/v32-final-acceptance-report.md` |

## 验收标准

V32 passed scoped 需要同时满足：

- `quality-rescue-tabby-v1` 和 `quality-rescue-tuxedo-v1` 都通过 V32 quality gate；
- 每个 pack 覆盖 8 个核心动作；
- loop 动作至少 12 帧，transient 动作至少 8 帧；
- 拒绝重复帧过高、整图变形、脏背景、off-canvas、小尺寸不可读和低视觉细节；
- V30 semantic passed；
- V31 art passed；
- preview/apply/rollback passed；
- claim/security scan passed。

## 执行结果

V32 final status: passed scoped。

Evidence:

- `docs/V32.x/evidence/v32_quality_rescue-smoke-2026-06-24.md`
- `docs/V32.x/evidence/v32_quality_rescue-report-2026-06-24.html`
- `docs/V32.x/v32-final-acceptance-report.md`

## 审计意见

无新增致命规格偏差。主要残余风险是：V32 是 local project-authored pack 质量救火，不是任意猫照片自动生成高质量动作资产。照片自动化路线需要后续阶段以真实用户猫照片、身份保持、动作派生、质量门禁和预览应用回滚重新验收。

## Claim Boundary

This plan does not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
