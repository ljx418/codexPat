# V32 Target Architecture

文档状态：scoped target architecture；对应 `docs/active/agent_desktop_pet_prd_v32.md`。

## 当前架构问题

V31 以前的主要缺口是：语义动作可以被测试接受，但视觉目标体验仍可能停留在简单 SVG、弱局部运动或候选路线文档化。V32 要求用真实帧资产和可测指标闭环，而不是只写“高质量”。

## V32 目标架构

```text
local layered-rig generator
  -> per-action PNG frameSequence
  -> manifest with 8 core actions
  -> measured frame metrics
  -> V32 quality gate
  -> V30 semantic gate
  -> V31 art gate
  -> isolated preview
  -> target-only apply
  -> rollback
  -> HTML / screenshot evidence
  -> claim and security scan
```

## 模块职责

`scripts/v32_quality_rescue_smoke.mjs`

- 生成两个本地项目自有猫动作包；
- 写出 PNG frames、manifest、contact sheet、GIF、HTML report；
- 调用 V30/V31/V32 gate；
- 调用 preview/apply/rollback；
- 生成 final report。

`apps/desktop/src/assets/v32-quality-rescue.ts`

- 对真实帧指标做验收；
- 检查动作覆盖、帧数、可见像素、重复帧、动作变化量、loop closure、透明背景、off-canvas、整图变形、局部运动、视觉细节和小尺寸可读性；
- 按动作语义设定不同平均变化量门槛，避免 idle/sleeping/thinking 被 running/success 的强运动门槛误判。

`apps/desktop/src/assets/v32-quality-rescue.test.ts`

- 验证通过候选；
- 拒绝重复帧、整图变形、低局部运动、低帧数、坏 loop、脏背景和小尺寸不可读；
- 缺少来源/license/evidence 时 blocked；
- 发现敏感字段时 failed。

## 当前架构与目标架构关联

- V30 提供语义动作质量门禁，V32 继续复用。
- V31 提供视觉质量 rubric，V32 继续复用。
- V26 preview/apply/rollback contract 被 V32 用来证明 target-only 应用与回滚。
- V32 新增真实帧测量 gate，弥补“看起来仍像简单线条猫”这一质量风险。

## 出门条件

V32 只能在以下条件都满足时 passed scoped：

- 两个 named local packs 通过 V32 measured quality gate；
- V30 semantic gate passed；
- V31 art gate passed；
- preview/apply/rollback passed；
- HTML report、contact sheet、GIF、headless screenshot 存在；
- claim scan 和 security scan passed；
- final report 明确不声明任意猫照片自动生成 ready。

## 未覆盖能力

V32 不证明照片输入自动生成、provider integration、Petdex parity、3D、生产发布、Windows 或 cross-platform ready。
