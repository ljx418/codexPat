# V34.4 Character Asset Contract Execution Spec

文档状态：active phase spec。
当前日期：2026-06-25。

## Objective

V34.4 把单猫照片的身份锚点、mask 和 part map 合并为同一样本的角色资产合同，作为动作生成的输入。该阶段证明“每只猫有自己的角色合同”，不证明动作已生成。

## Planned Code Entities

- `apps/desktop/src/assets/v34-character-asset-contract.ts`
- `apps/desktop/src/assets/v34-character-asset-contract.test.ts`
- `scripts/v34_4_character_asset_contract_smoke.mjs`

## Inputs

- `V33CharacterDesignContract`
- `V34SegmentationMaskRecord`
- `V34PosePartMapRecord`

## Outputs

`V34CharacterAssetContract` 必须包含：

- `sampleId`
- `characterAssetId`
- `identityAnchors`
- `requiredParts`
- `allowedStylization`
- `disallowedDrift`
- `rigReadiness`
- `frameSeedReadiness`
- `reviewStatus`
- `evidenceRefs`

## Acceptance

通过条件：

- 每个通过样本都有独立 `characterAssetId`；
- `characterAssetId` 可追溯到同一个 `sampleId`；
- 不同猫的合同不得复用同一个身份；
- 合同明确允许和禁止的风格漂移。

失败条件：

- 使用一个固定 tabby 合同代表不同猫；
- 合同无法追溯 sampleId；
- 缺少 mask 或 part map 仍进入下一阶段。

## Evidence

生成：

`docs/V34.x/evidence/v34_4-character-asset-contract-YYYY-MM-DD.md`

evidence 必须列出样本到角色合同的映射，但不能包含完整路径、原始文件名或敏感数据。
