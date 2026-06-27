# V39 Stage Audit - 2026-06-27

## Decision
- Status: passed scoped.
- Scope: tested public-photo samples, Route A2++ local deterministic characterized 2D action assets.
- Not claimed: arbitrary-cat automatic generation, provider integration, Route B verified, Petdex parity, 3D, production, Windows, cross-platform.

## Findings
- 中风险: V39 通过范围仍是 tested public-photo samples 的 Route A2++ 本地证据 - 当前实现能证明公开猫图样本经过角色化资产、分层 rig、8 动作帧表和产品门槛的 scoped pass；不能证明任意用户猫照片自动生成高质量动作资产，也不能声明 Petdex parity。
- 中风险: 产品应用/回滚仍偏合同和预览证据，不等价于完整最终用户 runtime 激活体验 - V39 面板展示通过候选、动作帧表和 apply/rollback 门槛；但当前 UI 中 V39 应用/回滚按钮保持 disabled，验收结论不能扩大为用户已可一键安装任意 V39 资产到运行桌宠。
- 中风险: 视觉质量较 V38 有改进，但仍可能低于用户对专业宠物资产的审美预期 - 资产不再只是整图 transform-only 或照片卡片叠加，但仍是确定性 SVG/frameSequence；如果目标是显著接近专业项目资产，需要继续引入人工美术或真实 source-bound 专业资产路线。
- 低风险: 既有 V39.6 HTML 报告按 file:// 打开时图片路径不可见 - 本轮阶段报告改用 headless Chrome 截图证据和相对路径图片；旧报告更适合在应用预览服务路径下查看，不能作为单独 file-open 视觉证据。

## Commands
- pnpm --filter desktop test: passed. 71 suites / 336 tests passed; V39 characterized action assets 7 tests passed.
- pnpm --filter desktop check: passed. TypeScript noEmit passed.
- pnpm --filter @agent-desktop-pet/petctl test: passed. 10 suites / 71 tests passed.
- pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs: passed. transform-only weak baseline rejected; semantic candidate accepted.
- pnpm --filter desktop exec node --import tsx ../../scripts/v39_8_final_gate_smoke.mjs: passed scoped. 3 passing public-photo samples, 2 negative/blocked records, Route B recorded as blocked_honestly.
- pnpm --filter desktop build: passed. Vite production build completed.
- drawio XML/page audit: passed. 8 Chinese pages, within the <= 8 page requirement.
- claim scan: passed with contextual hits. Forbidden phrases only appeared in forbidden/not-ready/scanner-rule context.
- security scan: passed. No token, Authorization value, raw provider payload, raw HTTP payload, EXIF/GPS, or full workspace path detected.

## Visual Evidence
- HTML report: docs/V39.x/evidence/v39-stage-audit-visual-report-2026-06-27.html
- Screenshots:
  - screenshots/v39-settings-overview.png
  - screenshots/v39-settings-panel-v39-crop.png
  - screenshots/v39-contact-sheet.png
  - screenshots/v39-animated-preview.png

## Acceptance Evaluation
V39 is acceptable as a scoped stage result. It is not sufficient for broad high-quality arbitrary-cat photo-to-action asset generation.
