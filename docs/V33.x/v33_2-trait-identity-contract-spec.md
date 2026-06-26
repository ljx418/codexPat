# V33.2 Trait and Identity Contract Spec

文档状态：planned execution spec。
当前日期：2026-06-25。

## Goal

把通过 intake 的照片样本转成安全 trait summary 和同猫角色设计合同。

## Inputs

- V33.1 evidence；
- V33 implementation contract；
- 通过 intake 的 named samples。

## Development Actions

- 生成安全 trait summary；
- 定义 identity anchors；
- 定义 allowed stylization 和 disallowed drift；
- 定义 identity QA 输入；
- 对低置信度、身体不可见、身份漂移风险输出 reasonCode。

## Acceptance Actions

- 每个通过样本都有 trait summary；
- 每个角色候选都有 character design contract；
- identity risk 不被隐藏；
- 不保存原始照片、完整路径、EXIF/GPS 或 raw prompt；
- evidence 通过 claim/security scan。

## Evidence

`docs/V33.x/evidence/v33_2-trait-identity-contract-YYYY-MM-DD.md`
