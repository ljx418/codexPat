# PRD：agent-desktop-pet V6 产品化开发规划

版本：PRD v6.0 Draft  
日期：2026-05-30  
适用范围：V6 产品化阶段  
面向对象：产品经理、技术负责人、内部开发团队、后续 Codex / Agent / 资产 / 发布路线审计  
当前建议状态：V6 scoped productization accepted for tested local macOS developer workflow scenarios；production signed release、cross-platform、Windows、MCP ready、provider integration、3D ready 等仍需独立验收。

---

## 0. 版本定位

V6 是 `agent-desktop-pet` 从“已验证的本地工程能力”走向“普通用户可理解、可安装、可使用、可排障、可个性化”的产品化阶段。

V6 不应继续作为 V5 内部资产系统的自然续章，也不应继续扩展 V3/V4 的 Codex 监听实验。V6 的职责是把已经 scoped passed 的能力打磨成可交付产品路径，并为未来的 release、个性化资产、第三方集成和安全治理建立统一产品标准。

一句话定位：

> V6 是 agent-desktop-pet 的产品化版本：让用户可以稳定安装、启动、绑定 Codex 工作猫、切换/导入猫资产，并在清晰安全边界下扩展到个性化和第三方集成。

---

## 1. 当前已验收基线

### 1.1 桌宠基础能力

当前已经完成：

- macOS-first Tauri 桌面猫。
- 透明、无边框、置顶窗口。
- 拖拽、位置持久化、托盘、设置页。
- 多猫管理 UI。
- PetEvent schema、本地 HTTP Event Bridge、token、白名单 sound、rate limit、diagnostics。
- `petctl notify`、`petctl attach codex`、`petctl notify --instance`。
- 多实例猫：一个 Codex session / terminal tab 可绑定一只猫。
- Manager UI：多猫管理、重命名、显示/隐藏、复制安全命令、状态查看。

### 1.2 Codex / Agent 基线

当前已经完成 scoped 能力：

- V3.x scoped Codex local workflow acceptance passed。
- V3.7 JSONL monitor 是当前可靠 Codex exec 监听路径，只覆盖 wrapper-launched `codex exec --json`。
- V4.x scoped OS-level feasibility / managed session baseline 已关闭，但不代表 OS-level Codex window binding ready。
- V4.4 managed exec JSONL 已通过 scoped acceptance。
- V4.5 managed TUI hooks 若已通过，仅限 wrapper-launched managed TUI hook scenarios；不得扩展为 interactive TUI monitoring ready 或 all Codex workflows verified。
- MCP adapter 当前只是 minimal localhost bridge smoke。
- Third-party contract v3 当前只是 contract smoke。

### 1.3 资产 / Renderer 基线

当前 V5 已形成 renderer / asset system scoped baseline：

- V5.0 asset system contract frozen。
- V5.1 bundled 2D sprite smoke passed。
- V5.2 renderer plugin interface passed。
- V5.3 bundled GLTF prototype smoke passed，但不能声明 3D ready。
- V5.4 bundled 3D action pack smoke passed，但不能声明 bundled 3D action pack ready / 3D ready。
- V5.5 local renderer selection passed。
- V5.7 prompt pack generator passed。
- V5.8 local personalized import passed via CLI path。
- V5.9 personalized action mapping passed via CLI activation path。
- V5.10 provider feasibility completed。
- V5.11 Desktop Manager local manifest import UI passed。
- V5.12 runtime imported pack rendering passed for tested local PetInstance scenarios。
- V5.13 local guided prompt / import instruction workflow passed。
- V5.14 provider feasibility-only boundary passed；没有真实 provider smoke。
- V5.15 visual quality and action QA passed for tested bundled/imported scenarios。
- V5.x Productization Gate passed for scoped local productization。

仍未产品化完成或仍需 V6 打磨：

- Release / Distribution production readiness。
- 普通用户 Codex 工作猫 onboarding。
- 导入后的产品级 preview、回滚、删除、重命名闭环。
- 照片到个性化猫资产的完整 end-user UX。
- Provider 真实生成闭环。
- 更高等级 visual QA / renderer hardening。

---

## 2. V6 产品目标

### 2.1 产品目标

V6 的目标是把 agent-desktop-pet 做成一个可被普通本地开发者稳定使用的 macOS 桌面产品：

1. 用户能安装、启动、授权、诊断、升级。
2. 用户能在桌面 UI 中创建或启动“Codex 工作猫”。
3. 用户能理解不同 Codex 状态来源：
   - wrapper-launched exec JSONL：可靠状态映射。
   - managed TUI hooks：需要 `/hooks` review/trust。
   - already-open Codex window：目前不支持自动监听。
4. 用户能选择、导入、预览、回滚、删除、重命名猫资产。
5. 用户能通过本地 prompt pack / import checklist 进行个性化资产生产。
6. 后续 provider 接入必须建立 consent、credential、cost、retention、license 边界。
7. 所有产品化声明都必须有 evidence 支撑，禁止 false-green。

### 2.2 V6 不解决什么

V6 不是以下能力的默认完成阶段：

- Windows ready / cross-platform ready。
- production signed release ready，除非 Release / Distribution track 单独验收通过。
- all Codex workflows verified。
- OS-level Codex window binding ready。
- already-open Codex window auto-monitoring ready。
- MCP ready。
- Third-party agent integration verified。
- Claude Code integration verified。
- Rive / Live2D ready。
- 3D ready。
- photo customization ready。
- automatic photo-to-3D ready。
- provider integration verified。
- asset marketplace ready。
- USB ready。

---

## 3. 目标用户

### 3.1 个人开发者

使用 Codex / 本地脚本做开发任务，希望通过桌面猫感知任务状态，降低切屏和盯终端负担。

### 3.2 多 Codex session 用户

同时打开多个 Codex session / terminal tab，希望每个 session 绑定一只独立猫，并且互不串路由。

### 3.3 个性化偏好用户

希望换猫、换外观、导入自己的猫素材，但不希望承担复杂 asset manifest、状态映射、fallback、安全校验成本。

### 3.4 维护者 / 内部团队

关注 release 安全、claim 可信、evidence 可复跑、日志不泄露、阶段不 false-green。

---

## 4. V6 开发轨道总览

V6 分为七条产品化轨道：

1. Release / Distribution 轨道。
2. Codex 体验产品化轨道。
3. 视觉资产产品化轨道。
4. 照片到个性化猫资产轨道。
5. 3D / Renderer 轨道。
6. Agent / Third-party 集成轨道。
7. QA / Safety / Claim Governance 轨道。

每条轨道可以并行规划，但进入实现必须按各自 acceptance gate 执行。任何 scoped smoke 都不得被扩大成 ready / verified / production claim。

---

# 5. Track A：Release / Distribution 轨道

## 5.1 背景

当前项目仍主要是本地开发 / unsigned app 工作流。用户可以构建和启动 `.app`，但这不等于 production signed release。

## 5.2 目标

让 agent-desktop-pet 具备面向外部用户的 macOS 本地发布基础：

- 可安装。
- 可首次启动。
- 可解释权限。
- 可升级。
- 可诊断。
- 可导出崩溃 / 日志。
- 可声明 production readiness 之前有完整 evidence。

## 5.3 功能需求

### V6-A1：macOS packaging

- 输出标准 macOS app artifact。
- 明确 bundle id、version、icon、display name。
- 区分 dev build、local unsigned build、signed build、notarized build。
- 打包结果必须可复跑。

### V6-A2：签名与 notarization

- 定义 signing identity。
- 定义 notarization 流程。
- 记录 notarization evidence。
- 支持 Gatekeeper 首次打开说明。
- 未通过 notarization 不得声明 production signed release ready。

### V6-A3：安装包 / 自动更新

- 设计 DMG / installer 方案。
- 设计 updater 方案。
- 自动更新必须具备 rollback / signature / channel / failure handling。
- 未实现 updater 前，不得声明 auto update ready。

### V6-A4：首次启动引导

首次启动引导应包括：

- 桌宠定位说明。
- 本地 API 说明。
- token 与安全边界说明。
- Codex 工作猫启动方式。
- `/hooks` trust 说明。
- already-open Codex window 当前限制说明。
- 资产导入安全提示。
- 诊断入口。

### V6-A5：权限说明

必须解释：

- 为什么需要某些 macOS 权限。
- 何时需要 Accessibility / Automation。
- 哪些功能不需要权限。
- 用户拒绝权限后的功能降级。
- 不采集终端文本、prompt、命令、workspace path、token。

### V6-A6：崩溃日志与诊断导出

- 增加诊断导出功能。
- 导出内容必须脱敏。
- 不包含 token、Authorization、raw payload、prompt、tool command、workspace path、full `/Users/...` path、config path。
- 用户可以预览导出摘要。

## 5.4 验收标准

- 签名 / notarization 流程有独立 evidence。
- 首次启动引导可完成基础配置。
- 权限拒绝场景安全降级。
- crash / diagnostics export 不泄露敏感字段。
- 安装包与升级路径有回归测试。
- 未全部通过前，不声明 `production signed release ready`。

---

# 6. Track B：Codex 体验产品化轨道

## 6.1 背景

当前 Codex 能力已经有多条 scoped 路径，但普通用户仍需要理解 CLI、wrapper、hooks、JSONL monitor 等概念。V6 需要把这些能力包装为产品流程。

## 6.2 目标

让用户稳定做到：

> 一只 Codex session 绑定一只猫。

并且能够理解：

- 哪种模式最可靠。
- 哪种模式需要用户 trust hooks。
- 哪种模式当前不支持。

## 6.3 关键模式说明

### 模式 1：wrapper-launched exec JSONL

推荐路径：

```bash
petctl codex launch --monitor jsonl --name "Review Cat" -- exec --json "summarize this repository"
```

产品含义：

- 当前最可靠 Codex exec 状态映射路径。
- 适用于 wrapper-launched `codex exec --json`。
- 不解析终端文本。
- 不读取 transcript_path。
- 不覆盖 interactive TUI。
- 不覆盖 already-open window。

### 模式 2：managed TUI hooks

路径：

```bash
petctl codex session start --mode tui --monitor hooks --name "TUI Cat" -- codex
```

产品含义：

- 适用于 wrapper-launched Codex TUI。
- 需要用户在 Codex TUI 中运行 `/hooks` 并 trust project hooks。
- hook lifecycle evidence 必须独立验收。
- PermissionRequest 若本地策略不触发，必须显示 blocked / not observed。

### 模式 3：already-open Codex window

当前状态：

- 不支持自动监听。
- 不能自动注入 `AGENT_DESKTOP_PET_INSTANCE_ID`。
- OS-level discovery / binding 不等于 lifecycle monitoring。
- 用户应使用 wrapper launch 或未来受限 explicit binding UX。

## 6.4 功能需求

### V6-B1：桌面 UI 创建“Codex 工作猫”

在 Manager UI 中提供：

- 新建 Codex 工作猫。
- 选择启动方式：
  - Exec JSONL monitor。
  - Managed TUI hooks。
  - Manual attach。
- 显示推荐模式和风险。
- 生成命令。
- 支持复制命令。
- 可选一键启动，仅在安全边界通过后启用。

### V6-B2：一键启动 / 安全启动

一键启动必须：

- 明确要启动的命令。
- 不隐藏 token。
- 不把 raw prompt / command 存入日志。
- 输出 instanceId / bindingId 摘要。
- 失败时有 reasonCode。

### V6-B3：状态诊断

UI 中显示：

- desktop health。
- target PetInstance。
- instance route。
- JSONL monitor status。
- hook config status。
- `/hooks` trust status 或 instruction。
- last accepted event。
- last state。
- redaction status。

### V6-B4：用户教育

必须在 UI 文案中明确：

- JSONL 是最可靠 exec path。
- TUI hooks 需要 `/hooks` trust。
- already-open Codex window 目前不支持自动监听。
- 手动 route-test 不等于 lifecycle monitoring。

## 6.5 验收标准

- 普通用户能从 UI 创建一只 Codex 工作猫。
- 用户能复制并执行推荐命令。
- JSONL mode 可产生状态变化。
- TUI hook mode 未 trust 时显示明确引导，不误报 passed。
- already-open window 不被误写为 supported。
- 所有状态诊断不泄露 token、prompt、tool command、workspace path。

---

# 7. Track C：视觉资产产品化轨道

## 7.1 背景

V5 已经建立 asset manifest、renderer abstraction、bundled sprite / GLTF prototype、import UI 等 scoped 能力。V6 需要把“换猫”和“猫会动”从测试流程变成普通用户体验。

## 7.2 目标

- 更好的 sprite 动作质量。
- 统一动作语义。
- 用户可选 asset pack。
- 导入后可预览、回滚、删除、重命名。
- imported pack 可在运行态按 PetInstance 渲染。
- fallback 清晰可见。
- visual QA 可复跑。

## 7.3 核心动作语义

所有 asset pack 必须覆盖 8 个核心动作：

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

动作语义：

| 动作 | 产品要求 |
| --- | --- |
| idle | 低频生命感，不能像静态贴图 |
| thinking | 低打扰、可辨识的思考态 |
| running | 低打扰、可辨识的执行态 |
| success | 短促正反馈，不能覆盖 active error / need_input |
| warning | 可注意但不惊扰 |
| error | 明显，和 warning / need_input 区分 |
| need_input | 明显，表示需要用户介入 |
| sleeping | 低活跃、可识别休息态 |

## 7.4 功能需求

### V6-C1：runtime imported pack rendering

- 用户选择 imported pack。
- 指定 PetInstance 激活 pack。
- 目标 pet 使用 imported visuals。
- default / unrelated pets 不受影响。
- 重启后恢复 active pack mapping。
- 两只 pet 可使用同一 imported pack，但不共享可变 renderer state。
- invalid / corrupt pack fallback 到 CSS 或 previous active pack。

### V6-C2：导入后的 preview

- Manager UI 提供 asset preview。
- 支持核心动作预览。
- 预览失败不影响当前 active pack。
- preview 不执行脚本、不访问远程 URL、不读取任意路径。

### V6-C3：回滚 / 删除 / 重命名

- 用户可重命名 asset pack display name。
- 用户可删除未被使用的 imported pack。
- 删除 active pack 时需要确认和 fallback。
- 删除后不能留下 broken active mapping。
- 回滚到 bundled/default renderer。

### V6-C4：安全校验

- GLTF / GLB deep scan。
- 拒绝外部 URI、path traversal、absolute path、unknown required extension。
- 限制文件大小、mesh/material/texture/animation count、animation duration。
- 仅接受核心 action clip names。
- evidence 只记录安全字段和 decision。

## 7.5 验收标准

- 每个核心动作可在 imported pack 中触发。
- target PetInstance 使用 imported visuals。
- unrelated pets 不变。
- 重启恢复。
- invalid pack fallback。
- renderer input snapshot 不含 raw manifest path、provider payload、prompt、photo metadata、token、Authorization、workspace path、config path、full local path。
- V6-C 不得声明 photo customization ready 或 production ready。

---

# 8. Track D：照片到个性化猫资产轨道

## 8.1 背景

当前路径是：

```text
cat description/photo notes -> prompt pack -> external asset generation by user -> local manifest import -> safe action mapping
```

V6 需要把它变成用户可理解的引导流程，但仍不默认上传照片，也不默认接入 provider。

## 8.2 目标

- 用户可输入猫的描述。
- 用户可选择猫照片作为参考。
- 默认不上传照片。
- 默认不保留 raw photo。
- 本地提取用户认可的安全描述。
- 生成标准 prompt pack。
- 生成 manifest template。
- 生成 import checklist。
- 用户用外部 AI 生成素材后导入并自动校验。

## 8.3 功能需求

### V6-D1：本地描述采集

- 用户输入猫的颜色、毛色、眼睛、花纹、性格、动作风格。
- 支持“从照片手动填写描述”。
- 不需要照片即可生成 prompt pack。

### V6-D2：照片参考流程

- 用户可选择本地照片。
- 默认不上传。
- 默认不持久化 raw photo。
- 提取或保存内容必须经用户确认。
- 不保存 EXIF/GPS。
- 不保存完整本地路径。
- 不在 evidence 中记录照片内容。

### V6-D3：Prompt pack 生成

输出：

- sprite prompt。
- GLTF / action asset prompt。
- 8 个核心动作 prompt。
- 命名规则。
- manifest template。
- import checklist。
- 生成后的外部工具使用说明。

### V6-D4：导入后校验

- 生成资产仍必须走本地 import validation。
- 不合格资产给出安全错误。
- 不直接进入 renderer。

## 8.4 Provider 相关边界

若要接 provider，必须单独做：

- provider consent。
- credential redaction。
- cost disclosure。
- retention disclosure。
- license/attribution review。
- raw provider response redaction。
- imported output validation。

未完成前不得声明：

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
```

---

# 9. Track E：3D / Renderer 轨道

## 9.1 背景

当前已有 GLTF / Three.js prototype 和 scoped evidence，但不能叫 3D ready。V6 需要把 3D 从 prototype 推进到可控体验，但仍要保持 claim 收窄。

## 9.2 目标

- 更好的 3D 猫模型。
- 更稳定的动作 clips。
- 透明窗口下稳定渲染。
- 低功耗策略。
- 隐藏 / minimized 降级。
- 失败 fallback。
- Rive / Live2D 独立 track，不混在 GLTF 里。

## 9.3 功能需求

### V6-E1：GLTF / Three.js runtime hardening

- renderer lifecycle：mount / action / scale / visible / dispose。
- Canvas 透明背景。
- Drag 不抖动。
- 切换状态无白屏。
- renderer dispose 清理资源。
- per-instance renderer state 隔离。

### V6-E2：3D action clips

- 8 个核心状态动作。
- `thinking` / `running` 低打扰 loop。
- `success` transient。
- `warning` / `error` / `need_input` 明确区分。
- `sleeping` 低活跃。

### V6-E3：性能

- idle CPU / memory baseline。
- active CPU / memory baseline。
- hidden/minimized renderer 降级。
- 多猫场景下资源限制。
- GLTF 纹理 / mesh / animation count 限制。

### V6-E4：Rive / Live2D 子轨道

Rive / Live2D 必须单独立项：

- 独立 renderer adapter。
- 独立 manifest contract。
- 独立 evidence。
- 独立 forbidden claims。

不能因为 GLTF prototype 通过而声明 Rive / Live2D ready。

## 9.4 验收标准

- 3D runtime smoke 通过。
- 透明窗口和拖拽不回归。
- 动作可辨认。
- 性能记录完整。
- fallback 可见。
- 不声明 3D ready，除非后续 production-grade evidence 单独通过。

---

# 10. Track F：Agent / Third-party 集成轨道

## 10.1 背景

当前 MCP adapter 只是 minimal localhost bridge smoke。Third-party contract v3 只是 contract smoke。它们不是产品化第三方集成。

## 10.2 目标

让第三方开发者更容易、也更安全地接入桌宠状态系统。

## 10.3 功能需求

### V6-F1：版本化 contract

- 明确 PetEvent contract version。
- 明确 `/api/events` 与 `/api/instances/:instanceId/events`。
- 明确 error code。
- 明确 source.kind / source.id 规范。
- 明确 rate limit 和 retry。
- 明确 diagnostics redaction。

### V6-F2：SDK 文档

- 提供 TypeScript / Node 示例。
- 提供 Python 示例。
- 提供 shell 示例。
- 明确不提供真实 SDK 时的 fallback。
- 示例不得打印 token。

### V6-F3：示例项目

- local script example。
- CI-like example。
- MCP local bridge example。
- Custom agent example。
- 多实例路由 example。

### V6-F4：开发者调试工具

- connection doctor。
- token source diagnosis。
- instance list diagnosis。
- rejected event reason explorer。
- sanitized diagnostics export。
- no raw payload display。

### V6-F5：MCP maturity

MCP 若继续推进，应覆盖：

- tool schemas。
- capabilities。
- instance route。
- state query。
- error handling。
- redaction。
- real client smoke。

未通过前不得声明 MCP ready。

## 10.4 验收标准

- Contract v4 或 later 有版本化文档。
- 示例可复跑。
- diagnostics 不泄露 token / raw payload / paths。
- MCP ready 与 Third-party verified 仍需独立 acceptance。

---

# 11. Track G：QA / Safety / Claim Governance 轨道

## 11.1 背景

项目已经形成 no-false-green 文化。V6 必须继续将其制度化。

## 11.2 必须保留的工件

每个阶段必须有：

```text
development plan
acceptance plan
claim matrix
evidence
final acceptance report
security scan
claim scan
regression results
```

## 11.3 Claim governance

每条 claim 必须满足：

- 有 evidence。
- 有 scope。
- 有 forbidden expansion。
- 有 regression。
- 有 security scan。
- 有 final decision。

禁止：

- 局部 smoke passed -> product ready。
- fixture passed -> real lifecycle passed。
- prototype passed -> production ready。
- feasibility completed -> integration verified。
- import UI passed -> runtime rendering passed。
- GLTF prototype passed -> 3D ready。
- provider feasibility passed -> provider integration verified。

## 11.4 Security scan

所有 evidence / logs / screenshots / exports 必须不包含：

```text
token
Authorization
raw payload
raw hook payload
raw JSONL payload
prompt text
tool command text
terminal text
shell history
screen contents
clipboard contents
transcript_path
full /Users path
workspace path
config path
api-token.json
photo raw bytes
EXIF/GPS
provider credential
raw provider response
```

## 11.5 Regression baseline

V6 必须持续回归：

- V3.1 runtime smoke。
- V3.7 JSONL monitor smoke。
- V4.4 managed exec JSONL smoke。
- V4.5 managed TUI preflight / scoped hook smoke，如当前已接受。
- V5 asset / renderer smoke。
- Desktop build / check / cargo check。
- petctl tests。
- git artifact check。

---

# 12. V6 Roadmap Proposal

## V6.0：Productization Scope Freeze

目标：

- 将 V5.12-V5.15 的 scoped evidence 作为 V6 baseline 使用，不再描述为未完成迁移。
- 固化七条产品化轨道。
- 更新 PRD、claim matrix、active gap。
- 明确 V5 scoped baseline 与 V6 productization 的边界。

允许声明：

```text
V6 productization scope frozen with release, Codex UX, asset manager, personalization, renderer, integration, and governance tracks.
```

不得声明任何 ready。

---

## V6.1：Release / Distribution Foundation

目标：

- macOS packaging。
- signing / notarization plan。
- first-run guide。
- diagnostics export。
- permission explanation。

允许声明：

```text
V6.1 release and distribution foundation passed for tested local macOS packaging scenarios.
```

不得声明：

```text
production signed release ready
auto update ready
cross-platform ready
```

---

## V6.2：Codex 工作猫产品化入口

目标：

- 桌面 UI 创建 Codex 工作猫。
- 复制命令 / 启动引导 / diagnostics。
- JSONL / hooks / already-open window 三种模式说明。
- 一只 Codex session 一只猫的普通用户路径。

允许声明：

```text
V6.2 Codex work-cat onboarding passed for tested local wrapper-managed scenarios.
```

不得声明：

```text
already-open Codex auto-monitoring ready
all Codex workflows verified
OS-level Codex window binding ready
```

---

## V6.3：Runtime Imported Pack Rendering

目标：

- V5.12 scoped evidence carry-forward / V6 命名下的 revalidation：imported pack runtime rendering。
- Per-instance isolation。
- Restart persistence。
- Fallback。
- GLTF/GLB deep scan。

允许声明：

```text
V6.3 runtime imported asset pack rendering passed for tested local PetInstance scenarios.
```

不得声明：

```text
photo customization ready
provider integration verified
3D ready
production signed release ready
```

---

## V6.4：Asset Manager Product UX

目标：

- 预览。
- 回滚。
- 删除。
- 重命名。
- Pack 状态。
- Pack health。
- Import diagnostics。
- Visual selection UX。

允许声明：

```text
V6.4 asset manager product UX passed for tested local import and preview scenarios.
```

---

## V6.5：Photo-Guided Personalization

目标：

- 用户描述 / 照片参考。
- 本地安全描述。
- Prompt pack。
- Manifest template。
- Import checklist。
- 不默认上传。

允许声明：

```text
V6.5 photo-guided personalized asset workflow passed for local prompt and import-instruction generation.
```

不得声明：

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
```

---

## V6.6：Provider Feasibility / Consent

目标：

- Explicit provider consent。
- Credential redaction。
- Cost / retention / license disclosure。
- Optional provider smoke。
- Imported output validation。

允许声明之一：

```text
V6.6 provider feasibility completed with explicit consent boundary.
```

若真实 provider smoke 通过：

```text
V6.6 explicit-consent provider smoke passed for tested local personalized asset generation scenario.
```

不得声明：

```text
provider integration verified
remote generation ready
photo customization ready
```

---

## V6.7：Visual QA / Renderer Hardening

目标：

- Sprite / imported pack / GLTF QA。
- Screenshots / recordings。
- Nonblank checks。
- Performance baseline。
- Action clarity。
- Hidden/minimized optimization。

允许声明：

```text
V6.7 visual quality and action QA passed for tested bundled and imported asset scenarios.
```

不得声明：

```text
3D ready
Rive ready
Live2D ready
production signed release ready
```

---

## V6.8：Agent / Third-party Developer Productization

目标：

- Versioned contract。
- SDK docs。
- Examples。
- Debugging tools。
- MCP maturity plan。
- Third-party integration docs。

允许声明：

```text
V6.8 developer integration documentation and local contract tooling passed for tested examples.
```

不得声明：

```text
MCP ready
Third-party agent integration verified
```

---

## V6.9：V6 Productization Gate

目标：

- 全部 V6 track evidence 收口。
- Security scan。
- Claim scan。
- License scan。
- Regression。
- Product readiness decision。

只有所有 required track passed 后，才允许声明：

```text
V6 productization acceptance passed for tested local macOS developer workflow scenarios.
```

仍不得自动声明：

```text
production signed release ready
cross-platform ready
Windows ready
all Codex workflows verified
photo customization ready
provider integration verified
MCP ready
3D ready
```

除非各自 track 有独立 acceptance。

---

# 13. V6 成功指标

## 13.1 用户体验指标

- 新用户能在 15 分钟内完成安装、启动、创建一只 Codex 工作猫。
- 用户能理解 JSONL / hooks / already-open window 的差异。
- 用户能导入一个 asset pack 并在目标猫上预览 / 激活 / 回滚。
- 用户能通过 UI 看到诊断状态和修复建议。
- 用户不会被迫理解 internal manifest / renderer / PetEvent 细节。

## 13.2 工程指标

- 全部 smoke 可复跑。
- 全部 evidence 不泄露敏感信息。
- `git status` 不包含构建产物。
- Claim matrix 与 README / docs / PRD 一致。
- V3/V4/V5 回归不破坏。

## 13.3 安全指标

- 无 token 泄露。
- 无 Authorization header 泄露。
- 无 raw payload / raw provider response。
- 无 prompt / command / terminal text。
- 无 raw photo / EXIF/GPS 默认持久化。
- 无 arbitrary path / remote URL / script asset 被 renderer 使用。

---

# 14. 当前 Go / No-Go

## Go

```text
V6.0-V6.9 scoped productization acceptance passed for tested local macOS developer workflow scenarios.
V6.9 Productization Gate passed for tested local macOS developer workflow scenarios.
```

## Conditional Go

```text
No remaining V6 implementation subphase is conditionally open.
Future real provider smoke, signed release, cross-platform support, photo-to-3D generation, and 3D readiness require separate post-V6 planning and acceptance.
```

## No-Go

```text
No-Go for production signed release ready.
No-Go for photo customization ready.
No-Go for provider integration verified.
No-Go for 3D ready.
No-Go for MCP ready.
No-Go for cross-platform / Windows ready.
```

---

# 15. 附录：建议文档结构

建议新增：

```text
docs/V6.0/v6_0-prd.md
docs/V6.0/v6_0-development-plan.md
docs/V6.0/v6_0-acceptance-plan.md
docs/V6.0/v6_0-claim-matrix.md
docs/V6.0/v6_0-current-gap-analysis.md
docs/V6.0/v6_0-productization-scope-freeze.md

docs/V6.x/v6_x-development-plan.md
docs/V6.x/v6_x-acceptance-plan.md
docs/V6.x/v6_x-claim-matrix.md
docs/V6.x/v6_x-evidence-index.md
docs/V6.x/v6_x-productization-gate-plan.md
```

建议将原 V5.12-V5.15 作为 V6 baseline carry-forward：

```text
V5.12 evidence -> V6.3 Runtime Imported Pack Rendering
V5.13 evidence -> V6.5 Photo-Guided Personalization
V5.14 evidence -> V6.6 Provider Feasibility / Consent
V5.15 evidence -> V6.7 Visual QA / Renderer Hardening
```

并在旧 V5 文档中保留说明：

```text
V5.12-V5.15 remain scoped accepted baseline evidence and may be revalidated under V6 productization plans.
V5.0-V5.15 remain scoped accepted baseline.
```
