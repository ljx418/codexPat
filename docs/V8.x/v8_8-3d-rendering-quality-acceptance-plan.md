# V8.8 3D Rendering Quality Acceptance Plan

status: draft
date: 2026-06-03

## Phase Overview

V8.8 专注于修复 V8.4 中发现的 3D 渲染质量问题。目标改进相机、光照和静态 GLB 处理。

## PRD Reference

源自 V8 PRD (`docs/active/agent_desktop_pet_prd_v8.md`) 中 V8.4 的要求：
- 用户体验目标 7: "在 1x 和 0.75x 缩放下预览结果"
- V8.4 要求: "provider/imported 3D pack passes runtime visual QA, scale, fallback, and isolation checks"

## Acceptance Criteria

### AC1: Camera Framing
- [ ] 相机在正面居中位置 (0, 0, 3)，lookAt (0, 0, 0)
- [ ] 模型居中于画面
- [ ] 缩放比例合适，模型不超出视口

### AC2: Lighting
- [ ] Hemisphere light 提供基础环境光
- [ ] Directional light 提供主光源
- [ ] Fill light 提供补光，避免阴影过深
- [ ] 无光照导致的"blob"现象

### AC3: Static GLB Fallback
- [ ] 0动画的 GLB 能正常显示静态姿态
- [ ] 模型不会出现异常变形或变色
- [ ] 与 CSS fallback 视觉质量可比

### AC4: Visual QA at Scale
- [ ] 1x 缩放下渲染正常
- [ ] 0.75x 缩放下渲染正常
- [ ] captureDataURL() 能捕获有效 PNG

### AC5: Real Data Validation
- [ ] Prototype GLB (3 meshes, 8 animations) 渲染正常
- [ ] Tripo3D GLB (1 mesh, 0 animations) 渲染正常

### AC6: No Regression
- [ ] Type check 通过
- [ ] 61 desktop tests 通过
- [ ] 58 petctl tests 通过
- [ ] Rust cargo check 通过

## Evidence Required

1. `capturePackPreview()` 实际截图（prototype GLB 和 Tripo3D GLB）
2. 1x 和 0.75x 缩放对比
3. 测试输出日志
4. 回归测试结果

## Audit Gate

在开始开发前需要确认：
- 所有 AC 有明确的验收标准
- 真实数据路径已知
- 回归测试覆盖完整

## Risks

1. **光照参数可能需要多次调整** — 已计划多轮测试
2. **静态 GLB 没有动画看起来仍然一般** — 已计划添加 idle rotation fallback
3. **capturePackPreview 需要浏览器上下文** — 已在 Tauri 集成测试层面验证