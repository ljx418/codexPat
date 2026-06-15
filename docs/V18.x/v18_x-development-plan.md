# V18 Development Plan: User Photo to Multi-action 2D Pet Workflow

日期：2026-06-12  
状态：V18.0-V18.6 passed scoped。  
输入基线：V17.0-V17.7 scoped passed。

## Stage Objective

V18 的开发目标是实现并验收：

```text
用户直接输入一张猫图
  -> 系统基于该图生成多个动作的 2D 资产
  -> 用户在应用内预览
  -> 用户应用到指定桌宠
  -> 用户可回滚
```

这必须是一个真实产品流程，不再要求用户理解命令行 smoke、手动切图或 evidence 文件。

## Non-goals

- 不做 3D ready 或 photo-to-3D。
- 不做 Petdex parity。
- 不做 marketplace。
- 不做 production signed release。
- 不做 Windows / cross-platform。
- 不把 V17 text-to-image action sheet 证据冒充为 local photo image-to-image provider evidence。

## Phase Plan

### V18.0 Scope Freeze & Evidence Boundary

开发内容：

- 冻结 V18 PRD、目标架构、验收计划、claim matrix、drawio。
- 明确 V17 是 baseline，不是 V18 passed evidence。
- 准备 V18 evidence index 和安全扫描清单。

验收：

- V18 文档存在且互相一致。
- forbidden claims 只出现在 forbidden / not-ready / not-implied 语境。
- drawio 可打开且中文可读。

### V18.1 Reference Photo Consent & Provider Boundary

开发内容：

- 在设置页向导中增加 provider image-to-image 模式的正式 consent gate。
- 显示费用、隐私、留存、授权、provider 名称、输出用途。
- 只保存 safe metadata：media type、size bucket、dimensions、selected state、consent state。
- provider credential 使用环境变量或系统安全存储，不进入 UI/evidence/manifest。

验收：

- 未 consent 不调用 provider。
- 未配置 credential 显示 `provider_credential_missing`。
- 输出和 evidence 不包含本地完整路径、原始照片 bytes、EXIF/GPS、token、Authorization。

### V18.2 Image-to-image Provider Adapter & Job Lifecycle

开发内容：

- 先执行 `v18_x-provider-capability-preflight.md`，确认 provider 是否真实支持 reference image / image-to-image。
- 实现 `ImageToImageActionProviderAdapter` 接口。
- 支持 reference image input、traits、target actions、provider job lifecycle。
- job states：`queued`、`uploading`、`generating`、`output_received`、`failed`、`blocked`。
- reasonCode：`consent_required`、`provider_credential_missing`、`provider_terms_required`、`provider_upload_failed`、`provider_output_missing`、`provider_output_rejected`、`provider_rate_limited`。

验收：

- 使用真实 provider image-to-image 或明确 blocked。
- evidence 必须包含 provider capability decision；如果 provider 只有 text-to-image，V18.2 blocked。
- evidence 记录 provider 名称、job state、safe output summary，不记录 raw response。
- 如果 provider 不支持 reference image，V18.2 blocked，不得继续假装 V18 passed。

状态：passed scoped。Evidence: `docs/V18.x/evidence/v18_2-provider-capability-preflight-2026-06-12.md`。  
结论：MiniMax `image-01` reference-image capability 与一次项目本地猫图 job 已通过；该结论只允许进入 V18.3，不等于 V18 final passed。

### V18.3 Multi-action Output Normalizer & Pack Assembly

开发内容：

- 使用 provider image-to-image/reference-image 先生成单一 canonical cat identity。
- 从同一个 canonical source 本地派生 8 个 core actions：`idle`、`thinking`、`running`、`success`、`warning`、`error`、`need_input`、`sleeping`。
- 自动生成 `pet.json + frames`，进入现有 animation pack validation。
- 保持 V17 action-sheet import path 作为 fallback/import mode，不作为 provider success evidence。

验收：

- 8 actions 均生成 visible frames。
- 8 actions 必须共享同一个 canonical source hash，避免不同动作漂移成不同猫。
- missing action、透明图、出框、尺寸错误、metadata 错误均 stable fail。
- invalid pack activation preserves previous active pack。

状态：passed scoped。Evidence: `docs/V18.x/evidence/v18_3-multi-action-normalizer-2026-06-12.md`。  
结论：真实 MiniMax reference-image canonical cat output 已通过 identity-locked local assembly 归一化为 8 action safe local sprite pack；该结论只允许进入 V18.4 QA，不等于 preview/apply/final passed。

### V18.4 Same-cat & Continuity QA

开发内容：

- same-cat identity review：输入猫 traits、参考图摘要、8 动作视觉一致性。
- continuity guard：首尾闭合、帧间差异阈值、nonblank、off-canvas、scale 1x/0.75x。
- QA failed pack 不能进入 apply。

验收：

- 生成结果和输入猫图有人工/自动结合的 same-cat 通过记录。
- QA failed 时显示 `qa_failed_apply_blocked`。
- evidence 包含 contact sheet、safe QA table、runtime preview capture。

状态：passed scoped。Evidence: `docs/V18.x/evidence/v18_4-same-cat-continuity-qa-2026-06-12.md`。  
结论：V18.3 生成 pack 通过可见性、闭环、0.75x 可读性与同源 reference-image QA；该结论只允许进入 V18.5 preview/apply/rollback。

### V18.5 In-app Preview / Target Apply / Rollback E2E

开发内容：

- 在向导中展示 8 action preview。
- 目标宠物选择器。
- Apply 只影响 target PetInstance。
- Rollback 恢复 previous active pack。
- default/unrelated pets 不变。

验收：

- 用户从设置页完成：选图 -> 生成 -> 预览 -> 应用 -> 回滚。
- preview 不发送 PetEvent，不写 CatStateMachine，不改变 live state。
- apply only target。

状态：passed scoped。Evidence: `docs/V18.x/evidence/v18_5-preview-apply-rollback-2026-06-12.md`。  
结论：生成 pack 可进入 isolated preview、target-only apply 和 rollback model path；该结论允许启动 V18.6 final gate 的报告、回归与 claim scan。

### V18.6 Final Acceptance Gate

开发内容：

- 汇总 V18.1-V18.5 evidence。
- 生成 screenshot-backed HTML report。
- 复跑回归、安全、claim、license/artifact scan。

验收：

- 真实 provider image-to-image output passed。
- GUI screenshot/HTML 证明完整用户路径。
- final claim 使用最窄证据匹配表述。

状态：passed scoped。Evidence: `docs/V18.x/v18_6-final-acceptance-report.md` and `docs/V18.x/evidence/v18_6-photo-to-2d-html-2026-06-12.html`。  
结论：V18 已完成 tested local MiniMax image-to-image provider workflow scoped acceptance；不得扩展为 arbitrary-cat automatic readiness、provider integration readiness 或 production release。

## Go / No-go

V18.1 可以在 V18.0 文档审计通过后进入实现。  
V18.2 如果没有真实 image-to-image provider 能力，必须 blocked。  
V18.6 不得启动，直到 V18.1-V18.5 都有 passed/blocked/failed evidence。
