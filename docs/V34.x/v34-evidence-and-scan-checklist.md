# V34 Evidence and Scan Checklist

文档状态：active execution checklist。
当前日期：2026-06-25。

## Purpose

本清单约束 V34 每个子阶段的 evidence、PRD/spec review、claim scan 和 security scan。V34 的目标是单照片到角色资产再到 8 动作资产的生成核心；任何 evidence 只能证明其实际执行范围，不能把局部样本通过写成任意猫自动生成能力。

## Evidence Template

每个 V34 子阶段 evidence 必须包含：

- Phase id and date；
- authoritative PRD：`docs/active/agent_desktop_pet_prd_v34.md`；
- reviewed specs；
- input samples summary：只写 sampleId、media bucket、尺寸 bucket、consent、适配性状态；
- development action summary；
- acceptance action summary；
- command results；
- visual evidence refs：截图、contact sheet、GIF、HTML report 或 blocked reason；
- user-visible result；
- PRD/spec review decision；
- claim scan result；
- security scan result；
- decision：`passed scoped`、`partial scoped`、`blocked scoped` 或 `failed`；
- next allowed phase。

## Baseline Commands

代码实现阶段至少运行：

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v33_7_final_gate_smoke.mjs
```

V34 新增脚本在实现后必须逐步加入 evidence：

```text
pnpm --filter desktop exec node --import tsx ../../scripts/v34_1_subject_detection_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_2_segmentation_mask_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_3_pose_part_map_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_4_character_asset_contract_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_5_rig_frame_synthesis_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_6_generation_product_e2e_smoke.mjs
```

## Claim Scan

V34 evidence 不得声明：

- 禁止 ready 声明：Petdex parity achieved；
- 禁止 ready 声明：arbitrary-cat automatic photo-to-animation ready；
- 禁止 ready 声明：arbitrary-cat high-quality action asset generation ready；
- 禁止 ready 声明：provider integration verified；
- 禁止 ready 声明：3D ready；
- 禁止 ready 声明：production signed release ready；
- 禁止 ready 声明：Windows ready；
- 禁止 ready 声明：cross-platform ready；
- 禁止 ready 声明：MCP ready；
- 禁止 ready 声明：Claude Code integration verified；
- 禁止 ready 声明：OS-level Codex window binding ready；
- 禁止 ready 声明：all Codex workflows verified。

允许的窄声明必须同时满足：

- 明确 phase id；
- 明确 sample count；
- 明确 local deterministic 或 professional assisted route；
- 明确 passed/blocked/failed；
- 明确不是任意猫 ready。

## Security Scan

V34 evidence 和报告不得包含：

- token、Authorization value、secret、private config；
- raw photo bytes；
- EXIF/GPS；
- full local path、workspace path、config path；
- original filename；
- raw provider response；
- raw prompt；
- raw HTTP payload；
- raw JSONL；
- TTY 或 terminal title。

允许保留：

- sanitized sample id、candidate id、character asset id；
- relative evidence refs；
- Route A2 / Route B route labels；
- safe action ids and status values。
- sampleId；
- media type bucket；
- dimensions bucket；
- sanitized screenshot or derivative ref；
- QA metrics；
- reasonCodes。

## Route Comparison Evidence

V34.7 和 V34.8 必须记录 Route A2 / Route B 比较，但必须保持以下边界：

- Route A2 comparison uses existing V34.5/V34.6 evidence only；
- Route B comparison is a recommendation/fallback assessment unless a later phase creates independent Route B evidence；
- Route B cannot be described as executed, automatic, provider verified, or production ready；
- any Route B future pass would require source boundary、sampleId binding、part map、frameSequence、QA、preview/apply/rollback and visual evidence。

## Visual Evidence Rules

V34.5 以后必须有真实视觉证据：

- 每个 passed sample 至少有一张角色资产预览；
- 每个 passed sample 至少有 8 动作 contact sheet；
- 至少一个播放证据或等价帧序列抽样；
- failed/blocked sample 需要 reasonCodes 和用户可理解原因；
- 不得用单一 tabby pack 代替不同猫样本。

## Stop And Replan Conditions

发现以下任一情况必须停止开发、回到计划审计：

- 只有整图 transform、平移、缩放或旋转；
- 不同猫复用同一个 characterAssetId 并试图 passed；
- 生成链缺少 subject detection、mask、part map 或 character contract；
- 视觉证据无法区分不同样本身份；
- 自动化测试没有真实样本输入；
- claim scan 发现 ready claim；
- security scan 发现敏感数据。
