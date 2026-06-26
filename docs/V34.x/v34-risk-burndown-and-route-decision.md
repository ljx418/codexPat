# V34 Risk Burndown and Route Decision

文档状态：active risk-control plan。
当前日期：2026-06-25。

## Purpose

V34 的目标是从单猫照片生成同一只猫的角色资产和 8 动作 frameSequence。这个目标技术风险高，不能靠文档承诺消除。本文件把风险拆成可执行的阶段门禁、kill switch 和备选技术路线，避免后续开发把失败链路写成通过。

## Risk Control Principle

V34 不追求一次性证明“任意猫自动生成”。V34 只允许在 named sample set 范围内证明 scoped local generation chain。

风险消减顺序：

```text
先证明输入链路可靠
  -> 再证明角色资产能保持身份
  -> 再证明动作不是整图变形
  -> 再证明产品路径可预览/应用/回滚
  -> 最后再写 narrow final claim
```

任何阶段失败都必须停在该阶段，不得跳过到最终验收。

## Top Risks And Kill Switches

| Risk | Failure Mode | Burndown Phase | Kill Switch | Fallback |
| --- | --- | --- | --- | --- |
| 主体检测不可靠 | 多猫、非猫、低可见样本进入生成链 | V34.1 | 单猫/多猫/不可用样本无 reasonCodes 或误通过 | 增加人工标注 fixture，但声明为 fixture-assisted，不写自动 CV ready |
| 分割不可靠 | 背景进入动作帧，角色边缘破碎 | V34.2 | mask 缺失、背景泄漏不可解释、无视觉证据 | 转为 professional assisted mask import |
| 姿态/部件图不可靠 | 看不见的腿、尾巴、耳朵被静默补全 | V34.3 | only bbox，无 part map；低置信仍 passed | 只生成可见部位动作，缺失部位标 blocked |
| 身份保持失败 | 不同猫复用同一角色资产 | V34.4 | 不同 sampleId 共享同一 characterAssetId 并试图通过 | 回退到每样本独立 character contract |
| 动作僵硬 | 只有整图平移、缩放、旋转、抖动 | V34.5 | transform-only negative 未被拒绝 | 切换到部件模板或专业帧导入路线 |
| 8 动作覆盖不足 | 缺少核心动作或只有静态图 | V34.5 | 任一 passed pack 缺核心动作、frameSequence 或 contact sheet | 降级 partial scoped，不进 final passed |
| 产品路径虚假通过 | failed candidate 可预览或应用 | V34.6 | failed candidate 进入 preview/apply | 修复 gate；不可修复则 blocked |
| 证据不足 | 没有真实截图、contact sheet 或播放证据 | V34.7 | HTML 报告只有文字 | 打回生成/验收阶段 |
| 过度声明 | scoped 样本被写成任意猫 ready | V34.8 | claim scan 命中 ready claim | final gate failed |

## Route Decision Matrix

| Route | Description | Advantages | Disadvantages | V34 Role | Switch Trigger |
| --- | --- | --- | --- | --- | --- |
| Route A local deterministic generation | 本地启发式、部件模板、角色合同和动作模板生成 frameSequence。 | 可审计、可离线、证据稳定、不会泄漏照片。 | 美术质量和自然动作上限有限；复杂姿态难。 | 推荐主路线。先证明最小闭环。 | V34.1-V34.4 输入链路通过后进入；若 V34.5 动作质量不足则触发 Route B。 |
| Route B professional assisted import | 人工或专业工具输出 mask、部件、帧序列，再接入 V34 合同和 QA。 | 质量上限高，可快速得到目标体验级视觉证据。 | 不等于全自动；需要严格 source boundary。 | V34 fallback 路线，可用于目标体验验证。 | Route A 无法在至少 2 个样本上生成可接受 8 动作时启用。 |
| Route C provider candidate import | 外部 provider 生成候选，项目只做导入、QA、预览和回滚。 | 可能提升生成质量和速度。 | 隐私、成本、稳定性、授权、raw response 风险高；不能作为 V34 pass 前置。 | Future candidate only。 | 只有用户另行批准 provider 路线和安全边界时评估。 |
| Route D local ML segmentation/pose | 引入本地 CV/ML 模型做分割和姿态估计。 | 可提高自动化程度。 | 依赖模型、包体、性能和平台适配；验证成本高。 | V34 optional accelerator，不是首轮必需。 | V34.1-V34.3 本地启发式/fixture 路线质量不足且需要更高自动化时评估。 |

## Recommended Development Path

V34 默认采用 Route A，保留 Route B 作为质量 fallback：

1. V34.1-V34.3 只做输入理解链路，不生成动作。
2. V34.4 确认每只猫有独立角色合同。
3. V34.5 先用本地部件模板和动作模板生成 frameSequence。
4. 如果 V34.5 产生 transform-only 或身份漂移，立即打回，不允许进产品路径。
5. 如果 Route A 的动作质量达不到目标体验，但 V34.1-V34.4 证据可靠，则启用 Route B，用专业辅助帧证明目标体验。
6. V34.6-V34.8 只验收已通过 QA 的候选。

## Minimum Success Slice

V34 最小成功切片不是任意猫，而是：

- 5 个安全样本；
- 至少 3 个不同单猫样本进入生成链；
- 至少 2 个不同猫样本生成各自角色资产和 8 动作 frameSequence；
- 至少 1 个负例样本失败且不能应用；
- 每个 passed sample 有完整链路 evidence；
- 所有 passed 动作不是整图变形；
- preview/apply/rollback 真实通过；
- claim/security scan passed。

## Residual Risk After Documentation

文档可以降低虚假验收、目标漂移和执行混乱风险，但不能消除以下技术风险：

- 单照片无法可靠推断遮挡部位；
- 仅靠本地模板可能无法达到高质量自然动作；
- 专业辅助路线不等于全自动；
- provider 路线需要新的隐私、授权、成本和稳定性审计；
- 高质量美术资产可能需要人工制作或专业工具配合。

因此，本阶段文档的合格结论是：

```text
V34 文档足以支撑自动化分阶段开发和真实出门验收；
V34 技术成功仍依赖 V34.1-V34.7 evidence；
如果 Route A 无法达成目标体验，应转入 Route B 或记录 partial/blocked，不得 false pass。
```
