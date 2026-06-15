# PRD: Agent Desktop Pet V14 Premium Pet Gallery & Stable Animated Asset Experience

版本：V14 active PRD  
日期：2026-06-09  
状态：planned；V13 beta distribution and user-ready closure remains the accepted baseline。  

## 1. Product Positioning

V14 的目标是把 Agent Desktop Pet 从“强集成桌宠工程系统”推进到“普通用户一眼喜欢、能快速浏览、收藏、预览、一键切换的高质量动画宠物产品”。

V14 聚焦本地高质量体验，不做远程 marketplace、生产签名发布、跨平台、Windows、provider integration verified、automatic photo-to-3D ready 或 broad 3D ready。

## 2. Current Baseline

当前已完成：

- V10.12-V10.16：selected open-source visual/onboarding benchmark track passed scoped。
- V11：living work-cat interaction experience passed scoped。
- V12：真实桌面可见性与截图验收 passed scoped。
- V13：本地 macOS beta user-ready closure passed scoped。
- 当前项目已有桌面猫、Codex 工作猫、安全导入、资产预览基础、内置动态图包和截图 evidence。

当前体验差距：

```text
工程级桌宠能力
  -> 高质量默认动画猫
  -> 本地宠物图库
  -> 浏览 / 筛选 / 收藏 / 预览
  -> 一键切换到指定猫实例
  -> 稳定多帧动画资产体系
  -> AI 资产生成普通用户边界说明
```

## 3. V14 Product Goal

V14 结束后，用户应该能：

- 打开应用后看到更精致的默认动画猫。
- 在 Desktop Manager 中进入宠物图库。
- 浏览不少于 12 个本地 curated pet packs。
- 按风格、颜色、动画强度、renderer kind、bundled/imported、favorite、active 状态筛选。
- 收藏喜欢的宠物，并在重启后保留收藏状态。
- 预览每只宠物的 8 个核心状态动作和 living actions。
- 一键把选中的宠物应用到 default pet 或指定 Codex work-cat。
- 恢复默认工作猫。
- 删除用户导入的 pack，但不能删除 bundled pack。
- 遇到损坏资产时仍看到可见 fallback，不出现透明、空白、出画或闪帧。
- 在 AI Asset Guide 中理解 prompt-only、provider-assisted 2D、external 3D import 三条路径的边界。

## 4. User Scenarios

| 场景 | 用户能做什么 | V14 验收重点 |
| --- | --- | --- |
| 第一次打开应用 | 看到更精致的默认动画猫，而不是工程示例猫。 | `flagship-work-cat-v2` visual QA。 |
| 想换一只猫 | 打开图库，浏览、筛选、预览并一键应用。 | gallery + preview + activation evidence。 |
| 找喜欢的猫 | 收藏多个宠物，重启后收藏仍在。 | favorite persistence。 |
| 给 Codex 工作流配专属猫 | 把某个 pack 应用到指定 Codex work-cat，default 不受影响。 | target isolation。 |
| 导入资产失败 | 当前猫不消失，显示 visible fallback 和稳定 reasonCode。 | invalid activation preservation。 |
| 想用 AI 做猫资产 | 获取标准 prompt / import checklist，理解上传、隐私、license、provider 限制。 | AI boundary no false-ready claim。 |

## 5. V14 Phase Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V14.0 | Scope freeze, claim matrix, drawio sync | planned |
| V14.1 | High-quality default animated cat refresh | planned |
| V14.2 | Stable multi-frame animation asset system | planned |
| V14.3 | Pet Gallery browse / filter / favorites | planned |
| V14.4 | Preview and one-click switching flow | planned |
| V14.5 | AI asset workflow product boundary | planned |
| V14.6 | Final visual product gate | planned |

## 6. Target Architecture

```text
V13 Beta-ready Desktop App
  -> FlagshipWorkCatV2
  -> AnimationPackLinter
  -> LocalPetGallery
  -> FavoriteStore
  -> PreviewSandbox
  -> OneClickActivationFlow
  -> AIAssetGuideBoundary
  -> V14 Visual Product Acceptance HTML
```

V14 不改变 PetEvent、Codex monitoring、OS-level binding、MCP、third-party integration 或 production release 语义。

## 7. Acceptance Model

V14 may pass only after:

- `flagship-work-cat-v2` has visual QA evidence for core and living actions.
- animation linter blocks unsafe or visually unstable packs.
- gallery shows at least 12 local curated packs.
- filter, favorite, preview, activation, restore, and imported delete flows pass.
- one-click switching affects only the target PetInstance.
- invalid/corrupt/deleted/partial packs keep a visible fallback.
- AI Asset Guide explains safe prompt/import/provider boundaries without claiming automatic photo-to-3D ready.
- final HTML embeds screenshots or captures.
- security scan, claim scan, license/attribution scan, and regression pass.

## 8. Forbidden Claims

V14 must not claim:

```text
Petdex parity achieved
Petdex ecosystem parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
remote asset loading ready
asset marketplace ready
production signed release ready
notarized release ready
auto update ready
cross-platform ready
Windows ready
OS-level Codex window binding ready
all Codex workflows verified
```

## 9. Allowed Final Claim

Allowed only after V14.6 passed:

```text
V14 local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching experience passed for tested local macOS scenarios.
```

This does not imply Petdex ecosystem parity, 3D readiness, provider readiness, production release readiness, Windows support, or cross-platform support.

## 10. Review Sources

- `docs/V14.x/v14_x-development-plan.md`
- `docs/V14.x/v14_x-acceptance-plan.md`
- `docs/V14.x/v14_x-target-architecture.md`
- `docs/V14.x/v14_x-current-gap-analysis.md`
- `docs/V14.x/v14_x-milestones.md`
- `docs/V14.x/v14_x-claim-matrix.md`
- `docs/V14.x/v14_x-exit-criteria.md`
- `docs/V14.x/v14_1-flagship-cat-asset-production-spec.md`
- `docs/V14.x/v14_2-animation-stability-spec.md`
- `docs/V14.x/v14_3-gallery-favorites-preview-ux-spec.md`
- `docs/V14.x/v14_5-ai-asset-productization-boundary.md`
- `docs/active/current-vs-target-gap.drawio`
