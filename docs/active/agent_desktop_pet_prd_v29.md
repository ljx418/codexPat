# Agent Desktop Pet PRD V29

文档状态：active PRD；planned。
阶段主题：Petdex-level Gallery and Stable Photo-to-Animated-2D Experience。
当前日期：2026-06-16。

## Product Goal

V29 将 V23-V28 的 scoped 本地闭环提升为普通用户可感知的宠物产品体验。阶段目标是追平 Petdex 作为宠物图库产品的核心体验，并在照片生成 2D 动作资产链路上达到可出门的稳定标准：

```text
用户打开应用
  -> 看到高质量宠物图库
  -> 浏览 / 筛选 / 收藏 / 预览 / 一键安装或切换宠物
  -> 上传一张猫图
  -> 系统自动判断照片质量和生成路线
  -> 在固定预算内生成 8 个高质量 2D 动作资产
  -> 自动拒绝差结果并给出重试建议
  -> 用户预览后应用到目标宠物
  -> 可回滚
```

V29 的核心变化：V23-V28 证明“流程可闭环”，V29 必须证明“普通用户能稳定得到好结果，且体验接近成熟宠物图库产品”。

## Petdex-level Experience Standard

V29 将以下能力作为出门要求：

- 高质量宠物浏览：用户可以看到多个视觉风格统一、动作明确的宠物。
- 筛选和收藏：用户可以按风格、颜色、动作质量、推荐状态筛选并收藏。
- 动作预览：用户无需安装即可预览 8 个 core actions。
- 一键安装 / 切换：用户可将某个宠物或生成包应用到指定桌宠。
- 失败可恢复：坏资产不能应用，应用后可回滚。
- 生成流程可理解：照片质量、生成状态、QA 结果、失败原因和下一步建议都可见。

## Stable Photo-to-2D Definition

“稳定支持任意用户上传一张猫图”在 V29 中采用可审计工程定义：

- 输入样本不是单张人工挑选图，而是覆盖至少 12 张用户风格猫图：
  - 不同毛色：橘猫、灰猫、黑白、三花/玳瑁、白猫；
  - 不同姿态：正坐、侧身、趴卧、半身；
  - 不同背景：简单室内、普通桌面、自然背景；
  - 至少 3 张来自 `docs/猫*.jpg` 现有真实样本。
- 每张图最多 2 条生成路线、每条路线最多 2 次修复重试。
- 至少 80% 样本在预算内产出 approved 8-action pack。
- 通过样本必须满足 same-cat、动作幅度、背景、首尾闭合、帧间连续、1x/0.75x 可读性。
- 未通过样本必须给出用户可理解的失败原因和下一步建议。

这不是数学意义的“所有猫图必然成功”。如果样本集成功率不足，V29 必须 blocked，不能声明稳定照片生成能力。

## Core Actions

V29 继续要求 8 个 core actions：

- idle
- thinking
- running
- success
- warning
- error
- need_input
- sleeping

每个通过的生成包必须至少：

- loop/base actions 6+ frames；
- transient actions 3+ frames；
- 首尾闭合；
- 帧间位移连续；
- 动作幅度肉眼可见；
- 无背景残留或安全透明；
- 无 blank / fully transparent / off-canvas frame。

## Stage Split

| Stage | Product Purpose |
| --- | --- |
| V29.0 | Scope freeze, Petdex benchmark baseline, sample set definition. |
| V29.1 | Gallery browsing, filtering, favorites, preview, one-click switch UX. |
| V29.2 | Stable photo-to-2D benchmark harness over diverse cat sample set. |
| V29.3 | Generation quality gate v2: identity, motion, background, continuity, ranking. |
| V29.4 | Productized upload/generate/preview/apply wizard with progress and guidance. |
| V29.5 | Asset pack polish: default high-quality packs, generated candidate ranking, install history. |
| V29.6 | Final Petdex-level scoped acceptance gate with HTML evidence and screenshots. |

## Acceptance Boundary

V29 通过后最多只能声明：

```text
V29 Petdex-level gallery and stable photo-to-animated-2D workflow passed for tested diverse local cat photo benchmark scenarios with preview, target apply, and rollback.
```

仍不得声明：

- automatic photo-to-2D ready for all arbitrary cats；
- provider integration verified；
- Petdex parity achieved beyond tested gallery/generation standards；
- Petdex asset reuse authorization；
- 3D ready；
- automatic photo-to-3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## Non-goals

- 不复用或下载 Petdex 资产作为项目内置内容。
- 不承诺所有模糊、多猫、遮挡、极低清照片都能生成。
- 不把单个漂亮案例当作稳定生成能力。
- 不绕过 V22/V25/V29 质量门禁。
- 不把 provider 可用性扩大为 provider integration verified。
