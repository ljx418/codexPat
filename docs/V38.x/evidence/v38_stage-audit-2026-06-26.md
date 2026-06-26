# V38 阶段性审计报告

Date: 2026-06-26

## 审计结论

- 阶段结论：V38 public-photo action asset scoped passed。
- 审计范围：基于 `docs/active/agent_desktop_pet_prd_v38.md`、V38 target architecture、V38 acceptance plan、V38 evidence，以及当前代码实现。
- 真实能力：三张公开授权猫图样本可以进入来源记录、去元数据派生图、样本绑定 8 动作帧包、contact sheet、GIF 预览、V38 产品 UI 锚点和 HTML 截图证据。
- 不通过的扩展声明：任意猫照片自动生成高质量动作资产、provider 集成验证、生产发布、Windows/cross-platform ready、3D ready、Petdex parity、MCP/Claude/OS-level/all workflow ready。

## PRD / 代码 / 证据映射

| PRD 要求 | 当前实现 | 证据 | 审计 |
| --- | --- | --- | --- |
| 至少三张公开授权猫图 | `createV38PublicPhotoSources` 定义 3 个 passing cat samples | `v38_1-public-source-intake-2026-06-26.md` | 通过 |
| 非猫负例和多猫 blocked | dog negative 与 multi-cat blocked sample | `v38-public-source-records.json` | 通过 |
| 原图只进临时目录 | 原始下载放 `/tmp/codexpat-v38-public-sources`，仓库仅保存 hash | `original-sha256.txt` | 通过 |
| 去元数据派生图 | 生成 512x512 sanitized PNG | `v38_2-pixel-sanitization-2026-06-26.md` | 通过 |
| 8 动作 x 4 帧 | idle/walk/jump/sleep/eat/play/alert/celebrate | `v38_3-renderable-action-pack-2026-06-26.md` | 通过 |
| 不接受 transform-only | pack contract 标记 `wholeImageTransformOnly: false` 并记录 reasonCode | `v38_4-quality-gate-2026-06-26.md` | 通过 scoped |
| 中文 HTML 和截图证据 | V38 自动化报告和 PNG 截图 | `v38_6-public-photo-review-report-2026-06-26.html/.png` | 通过 |
| 产品 UI 锚点 | settings panel 暴露 source/pixel/preview/apply/blocked anchors | `v38_5-product-e2e-ui-contract-2026-06-26.md` | 通过合同；浏览器截图见风险 |

## 代码检视

- 主要代码实体：
  - `apps/desktop/src/assets/v38-public-photo-action-pipeline.ts`
  - `apps/desktop/src/main.ts`
  - `scripts/v38_smoke_common.mjs`
- 正确性：V38 模型把来源、sanitized asset、renderable pack、product anchors 分开表达，避免把 source manifest 误判为完整生成能力。
- 安全性：证据只保存派生 PNG、hash、contact sheet、GIF；未把原始下载文件写入仓库。
- 可维护性：V38 仍依赖 V33 phase status 类型和 V37 UI 入口，因此整体提交需要包含 V33-V38 阶段源码，不能只提交 V38。
- 测试覆盖：单测覆盖 source manifest、空 pipeline blocked、三样本通过、bundled UI asset references。

## 文档一致性审计

- `agent_desktop_pet_prd_v38.md`、`v38-target-architecture.md`、`v38-development-and-acceptance-plan.md`、`v38-acceptance-plan.md` 和 active gap/development/acceptance docs 对当前阶段边界一致。
- drawio 可解析且保持 8 页，页面标题均为 V38 语境。
- 术语一致：`tested public photo samples`、`Route A2`、`Route B future comparison`、`passed scoped`、`not arbitrary-cat ready`。

## 全量验收结果

| 检查项 | 结果 |
| --- | --- |
| desktop test | 329 tests passed |
| desktop check | passed |
| desktop build | passed |
| petctl test | 71 tests passed |
| V30 semantic animation gate | passed |
| V38.0-V38.7 phase gates | passed scoped |
| drawio XML/page count | 8 pages, parsed |
| git diff --check | passed |

## 可视化验收

- 成功证据：`v38_6-public-photo-review-report-2026-06-26.png` 展示了真实公开猫图派生图、contact sheet 和 GIF 预览。
- 设置页浏览器预览截图风险：Vite settings DOM dump 可见页面内容已经生成，但 Windows Chrome/Edge headless screenshot 输出白屏。因此本轮不把 settings screenshot 当成通过证据，只把 `v38_5` UI anchor contract 作为产品 UI 合同证据。

## Claim Scan

- Status: passed。
- Forbidden ready claims only appear as forbidden/not-ready boundary language.

## Security Scan

- Status: passed。
- No token value, auth header value, raw provider payload, raw prompt, original raw photo bytes, photo metadata coordinates, full workspace path, or credential content is used as acceptance evidence.

## 剩余风险

- V38 是公开样本绑定的本地确定性 overlay 动作帧，不是任意猫照片的艺术级自动动作资产。
- Route B 仍应作为下一阶段高质量路线对照。
- 设置页 headless screenshot 白屏需要后续独立修复或采用专用 browser preview harness。
