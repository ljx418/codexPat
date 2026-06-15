# V17 Development Plan

状态：V17.0-V17.7 scoped passed；V16 scoped passed baseline was used only as regression/baseline evidence。  
日期：2026-06-11。

Closure note: this document records the implementation plan that has now been
executed through V17.6, plus the V17.7 MiniMax provider API addendum. Current
acceptance status is tracked in `docs/V17.x/v17_6-final-acceptance-report.md`,
`docs/V17.x/v17_7-provider-api-addendum-report.md`, and
`docs/V17.x/evidence/v17_6-productized-wizard-html-2026-06-11.html`.

## Stage Goal

把当前“说明型照片生成向导”升级为普通用户可操作的产品化流程：

```text
photo intake
  -> generation mode
  -> job/loading state
  -> action sheet upload or provider output
  -> automatic crop/package
  -> in-modal QA preview
  -> target apply / retry / rollback
```

V17 不扩大 V16 claim；V17 只证明设置页/模态窗里的 2D 动作资产流程。

## Phase Plan

### V17.0 Scope Freeze & Claim Boundary

开发内容：

- 新增 V17 PRD、target architecture、development/acceptance、claim matrix、milestones、exit criteria、implementation contract。
- 更新 active docs 指向 V17 planned。
- 更新 drawio gap 文档，明确 V16 passed scoped 与 V17 planned 差异。

验收标准：

- V17 文档存在并互相引用一致。
- Forbidden claims 仅出现在 forbidden/not-ready/not-implied 语境。
- V16 evidence 只作为 baseline，不作为 V17 passed evidence。

### V17.1 Productized Wizard Shell

开发内容：

- 在设置页“个性化生成”区域提供一个真正的分步向导。
- 支持选择/拖入照片，显示图片预览、格式、尺寸、大小 bucket、隐私说明。
- 支持 consent checkbox、traits 输入、目标 pack 命名。
- 引入 wizard state machine：`idle / photo_selected / consent_ready / generation_ready / blocked`。
- 向导步骤显示当前状态、下一步和 stable reasonCode。

验收标准：

- 用户能在 UI 内理解下一步，不需要读命令。
- 不显示完整本地路径、EXIF/GPS、文件名原文、token、Authorization。
- 未同意时不能进入生成。
- 选择照片不会发送 PetEvent，不写 CatStateMachine，不改变 live pet。

### V17.2 Generation Mode & Loading UX

开发内容：

- 三种模式：
  - `host_image_tool_assisted`：复制提示词，等待用户上传 4x2 动作表。
  - `provider_api`：仅在 credential/consent/disclosure 均满足时可启动。
  - `local_action_sheet_import`：直接上传已生成 4x2 动作表。
- 模态窗提供 loading/progress/status 区域。
- 显示 `pending_user_action / running / waiting_for_output / output_ready / blocked / failed`。

验收标准：

- provider 未配置时，UI 给出明确 not-ready，而不是灰色死路。
- host/manual 模式给出可复制提示词和“上传动作表”入口。
- status 不包含 raw prompt、raw provider response、local path、credential。

### V17.3 Action Sheet Crop & Auto Packaging

开发内容：

- 支持上传 4x2 动作表 PNG/WebP。
- 自动按固定顺序切为 8 个 action cells：
  `idle, thinking, running, success, warning, error, need_input, sleeping`。
- 每个 cell 生成 frame sequence，保证首尾闭合。
- 参数化现有 V16 pack 生成逻辑，避免写死旧橘猫路径。
- 输出 app-managed local pack：`pet.json + frame folders`。

验收标准：

- 合格 4x2 sheet 可生成 8-action pack。
- 缺格、损坏、透明、尺寸过小、非图片、超大图片失败并保留 previous pack。
- 生成 pack 不包含 remote URL、absolute path、path traversal、script、event handler、external href、raw provider payload、prompt text、token、Authorization。

### V17.4 In-modal QA Preview

开发内容：

- 在模态窗展示 8 个动作的预览。
- 每个动作显示：
  - frameCount
  - firstFinalClosed
  - maxAdjacentDelta
  - nonblank
  - offCanvas
  - sameCatReview
  - reasonCode
- 提供手动 same-cat pass/fail 入口。
- QA 失败时显示 visible fallback，不允许应用。

验收标准：

- 所有 8 动作可见并可切换。
- 预览不调用 notify，不发送 PetEvent，不写 CatStateMachine，不激活 pack。
- 透明/跳帧/出框/同猫失败时不能进入 apply。

### V17.5 Target Apply, Retry, Rollback

开发内容：

- 用户选择目标 PetInstance。
- 应用到目标猫。
- 记录 previous pack，提供 rollback。
- 提供 retry generation / retry upload。

验收标准：

- 只影响目标猫。
- default 和 unrelated pets 不变。
- apply 失败保留 previous pack。
- rollback 成功恢复 previous pack。
- 删除生成 pack 后目标猫仍可见，fallback 可见。

### V17.6 Final Product UX Gate

开发内容：

- 生成 final acceptance report 和嵌入截图/预览的 HTML 页面。
- 复跑单元测试、desktop check、关键 V15/V16 smoke。
- 安全扫描、claim scan、artifact scan。

验收标准：

- V17.1-V17.5 evidence 均 passed/blocked/failed，不能 silent pass。
- 至少覆盖一张真实本地猫照片和一个真实 4x2 动作表。
- final claim 与 evidence 最窄匹配。

## Required Evidence Files

- `docs/V17.x/evidence/v17_0-scope-freeze-YYYY-MM-DD.md`
- `docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-YYYY-MM-DD.md`
- `docs/V17.x/evidence/v17_2-generation-mode-loading-YYYY-MM-DD.md`
- `docs/V17.x/evidence/v17_3-action-sheet-packaging-YYYY-MM-DD.md`
- `docs/V17.x/evidence/v17_4-modal-preview-qa-YYYY-MM-DD.md`
- `docs/V17.x/evidence/v17_5-apply-rollback-YYYY-MM-DD.md`
- `docs/V17.x/v17_6-final-acceptance-report.md`
- `docs/V17.x/evidence/v17_6-productized-wizard-html-YYYY-MM-DD.html`

## Go / No-Go

V17.1 can start after V17.0 docs are accepted.  
V17.2 can prepare UI interfaces during V17.1, but provider execution cannot be claimed until V17.2 evidence passes.  
V17.6 is No-Go until V17.1-V17.5 have explicit evidence.
