# V33.1 Real Sample Intake Spec

文档状态：planned execution spec。
当前日期：2026-06-25。

## Goal

建立 named real photo sample set，并证明样本可安全进入或被安全拒绝。

## Inputs

- V33 PRD；
- V33 implementation contract；
- 至少一组本地真实猫照片样本，或稳定 blocked reason；
- 不含原始照片字节的安全样本索引。

## Development Actions

- 定义 sample id 和 sample class；
- 建立 intake status 和 reasonCode；
- 过滤或拒绝 EXIF/GPS、完整本地路径、原始文件名和原始照片字节进入 evidence；
- 记录 clear、difficult、blocked、negative 样本的覆盖状态。

## Acceptance Actions

- 每个样本有 `passed`、`blocked` 或 `failed`；
- blocked/failed 样本有安全 reasonCode；
- clear/difficult 样本能进入 V33.2；
- negative 样本不能进入候选生成；
- evidence 通过 claim/security scan。

## Evidence

`docs/V33.x/evidence/v33_1-real-sample-intake-YYYY-MM-DD.md`
