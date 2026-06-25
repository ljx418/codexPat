# Agent Desktop Pet PRD V32 - Quality Rescue 2D Action Assets

文档状态：active scoped PRD；V32 quality rescue passed scoped on 2026-06-24。

## 目标用户体验

V32 的目标是先把项目从“线条猫/整图变形/弱动作”拉回到可继续开发的 2D 动作资产基线：

- 用户能在报告中看到真实 PNG contact sheet、GIF preview 和截图证据。
- 至少两个项目自有、本地生成的猫动作包包含 8 个核心动作：idle、thinking、running、success、warning、error、need_input、sleeping。
- 动作不只依赖整图位移、缩放、旋转或抖动；需要有可测的头、耳、爪、尾巴、表情、动作符号和睡眠/思考等局部变化。
- 通过的资产可以走预览、target-only apply、rollback，不影响 default pet 或 unrelated pet。

## 范围

In scope:

- local project-authored layered-rig / frameSequence 资产生成；
- 真实 PNG/GIF/HTML/screenshot evidence；
- V30 semantic gate、V31 art gate、V32 measured quality gate；
- preview/apply/rollback scoped runtime contract；
- claim scan 和 security scan。

Out of scope:

- 任意猫照片自动生成高质量动作资产；
- provider API 真实集成；
- Petdex parity；
- 3D、生产签名发布、Windows/cross-platform ready。

## V32 验收结果

V32 scoped pass evidence:

- `docs/V32.x/evidence/v32_quality_rescue-smoke-2026-06-24.md`
- `docs/V32.x/evidence/v32_quality_rescue-report-2026-06-24.html`
- `docs/V32.x/v32-final-acceptance-report.md`

通过范围只包括两个 named local project-authored 2D frameSequence packs：

- `quality-rescue-tabby-v1`
- `quality-rescue-tuxedo-v1`

## 后续缺口

V32 之后仍需单独立项验证：

- 真正以用户猫照片为输入的身份保持、动作派生、质量筛选和回滚；
- 更接近专业动画资产的源工程格式，例如 Rive、Live2D、Spine 或分层 PSD/rig pipeline；
- 用户可在应用内直接选择、预览、切换这些 V32 pack 的完整产品化入口。

## Claim Boundary

V32 must not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
