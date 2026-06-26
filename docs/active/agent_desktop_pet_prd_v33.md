# Agent Desktop Pet PRD V33 - Photo-to-High-Quality 2D Action Asset Productization

文档状态：active planned PRD；承接 V32 scoped pass 后的下一阶段目标。
当前日期：2026-06-25。

## Current Truth

V32 已经证明两个 named local project-authored 2D frameSequence packs 可以通过真实帧质量、V30 semantic gate、V31 art gate、preview、target-only apply、rollback、claim scan 和 security scan。

V32 不证明任意猫照片自动生成高质量动作资产，也不证明 provider integration、Petdex parity、3D、生产发布、Windows ready 或 cross-platform ready。

V33 的任务是把剩余最大缺口转成可执行开发与验收阶段：用真实猫照片样本驱动可审查的高质量 2D 动作资产候选，并把通过候选闭环到应用内预览、应用和回滚。

## Product Goal

V33 的产品目标是建立一条真实、可验收、可失败的照片到高质量 2D 动作资产路径：

```text
real cat photo sample
  -> consent and privacy boundary
  -> suitability and trait extraction
  -> identity-preserving character design
  -> 8-action candidate generation
  -> professional rig or frameSequence output
  -> V30 semantic gate
  -> V31 art gate
  -> V32 measured frame quality gate
  -> in-app preview
  -> target-only apply
  -> rollback
  -> evidence, claim scan, security scan
```

V33 只能在 named real sample set 覆盖的范围内给出 scoped claim。不能把一个或少量样本扩大为任意猫自动生成 ready。

## Technical Route Boundary

V33 不接受“把单张照片整体平移、缩放、旋转或抖动”作为高质量动作资产路线。目标技术路径必须把照片先转成可动画化角色资产，再生成动作帧：

```text
single photo
  -> privacy-safe intake
  -> cat subject detection and suitability
  -> segmentation / foreground mask
  -> visible anatomy and pose estimate
  -> safe identity trait anchors
  -> identity-preserving character design
  -> part map, canonical turnaround, rig-ready parts, or frameSequence seed
  -> 8-action synthesis
  -> semantic / art / frame / identity QA
  -> preview / apply / rollback
```

V33 可并行探索三条路线，但每条路线都必须输出结构化 pipeline status、视觉证据和 QA 结果：

- 本地 frameSequence route：优先建立可控、不依赖 provider 的真实闭环；
- professional rig / layered asset route：优先解决整图变形导致的僵硬问题；
- provider candidate route：只能作为候选输入，必须通过本地隐私边界和本地 QA，不能声明 provider integration verified。

V33 的第一实现切片按 `docs/V33.x/v33-engineering-implementation-blueprint.md` 执行：先新增 sample intake、identity contract、photo action pipeline、candidate gate 和 productized flow 模块，复用既有 V30/V31/V32/V26 门禁，交付一个 named sample 的本地 frameSequence 候选通过或真实 blocked。

## Target User Experience

用户在 V33 目标体验中应看到：

- 上传或选择一张真实猫照片后，系统先说明照片是否适合生成动作资产；
- 系统提取安全的猫特征摘要，例如毛色、花纹、体型、脸型、眼睛和尾巴，不暴露隐私元数据；
- 系统生成或导入同一只猫风格一致的角色候选；
- 通过候选包含 8 个核心动作：idle、thinking、running、success、warning、error、need_input、sleeping；
- 动作有局部姿态、表情、尾巴、耳朵和动作符号变化，不依赖整图变形；
- 用户能在应用内预览候选，确认通过后只应用到目标 pet；
- 用户能回滚到之前的可见 pack；
- 若照片质量、身份保持、动作质量或安全边界不达标，用户看到明确 blocked 或 failed reason，而不是 silent pass。

## In Scope

- named real photo sample set 的 intake、隐私和授权边界；
- 照片适用性判断和安全 trait extraction；
- identity-preserving character design contract；
- 照片派生的 8 动作候选；
- professional rig 或 frameSequence runtime route；
- 复用 V30 semantic gate、V31 art gate、V32 measured quality gate；
- 应用内 gallery/asset manager/photo wizard 的预览、应用和回滚入口；
- HTML、截图、contact sheet、GIF 或等效播放证据；
- PRD/spec review、claim scan、security scan。

## Out of Scope

- 任意猫自动生成 ready；
- provider integration verified；
- Petdex parity 或 Petdex 资产复用授权；
- 3D ready；
- production release ready；
- Windows ready；
- cross-platform ready；
- MCP ready、Claude Code integration verified、OS-level Codex window binding ready、all Codex workflows verified。

## Acceptance Boundary

V33 可以通过 scoped only if：

- named real sample set 有清晰样本、困难样本、blocked 样本和负例样本；
- 每个通过样本都有安全 trait summary、角色候选、8 动作资产、QA result、视觉证据、preview、target-only apply、rollback；
- failed 或 blocked 样本不能应用，并有 reasonCode；
- 所有 evidence 不包含 token、Authorization、原始 provider payload、原始 prompt、原始 JSONL、EXIF/GPS、完整本地路径、原始照片字节或敏感配置；
- final report 明确区分 passed scoped、partial、blocked、failed；
- claim scan 和 security scan passed。

## Claim Boundary

V33 must not claim Petdex parity achieved, automatic photo-to-animation ready for arbitrary cats, automatic photo-to-2D ready for arbitrary cats, provider integration verified, low-retry provider reliability, 3D ready, production signed release ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
