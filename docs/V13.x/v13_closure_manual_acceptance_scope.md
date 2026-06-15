# V13 Closure Manual Acceptance Scope

日期：2026-06-08  
状态：ready for operator review；V13.1-V13.7 已自动验收 passed scoped。

## 结论

V13 的自动化和证据链已经完成。当前不再新增 V13 功能；剩余闭环只需要人工确认最终 HTML、截图证据、体验范围和 claim 边界是否符合预期。

允许最终声明：

```text
V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios.
```

该声明不代表 production signed release ready、notarized release ready、auto update ready、Windows ready、cross-platform ready、Petdex parity achieved、3D ready、automatic photo-to-3D ready、provider integration verified、OS-level Codex window binding ready、already-open Codex auto-monitoring ready、all Codex workflows verified、MCP ready、Third-party agent integration verified 或 Claude Code integration verified。

## 自动验收已覆盖范围

| 范围 | 自动验收内容 | Evidence |
| --- | --- | --- |
| Scope freeze | V13 PRD、开发计划、验收计划、claim matrix、drawio XML 和导出 PNG。 | `docs/V13.x/evidence/v13_1-scope-freeze-2026-06-08.md` |
| Packaging | `desktop build`、`tauri build -b app`、macOS `.app` artifact、app launch、health。 | `docs/V13.x/evidence/v13_2-packaging-smoke-2026-06-08.md` |
| First-run | 真实桌面猫截图、设置/首启截图、Codex 工作猫 guide 截图、wrapper JSONL 和 `/hooks review/trust` 文案检查。 | `docs/V13.x/evidence/v13_3-first-run-user-journey-2026-06-08.md` |
| Diagnostics | 安全诊断导出、redaction scan、禁止 token/path/raw payload/prompt/tool command 泄露。 | `docs/V13.x/evidence/v13_4-diagnostics-export-redaction-2026-06-08.md` |
| Stability | 60 秒本地稳定性 smoke、start/end desktop screenshot、start/end pet-region screenshot、recoverability。 | `docs/V13.x/evidence/v13_5-stability-performance-baseline-2026-06-08.md` |
| Hygiene | `git status` 计数、desktop check、petctl test、artifact/license/claim/security scan。 | `docs/V13.x/evidence/v13_6-artifact-license-claim-hygiene-2026-06-08.md` |
| Final gate | V13.1-V13.6 evidence 全部 passed、截图存在、security scan、claim scan、最终 HTML。 | `docs/V13.x/v13_7-final-acceptance-report.md` |

## 人工验收范围

人工验收只需要确认以下 7 项：

1. 打开最终 HTML 后，页面能直接说明 V13 当前状态、范围、结论和禁止声明。
2. HTML 内嵌截图能看到真实桌面宠物，不只是文字或链接。
3. 首启/设置截图能让普通 beta 用户理解桌面猫、设置入口和 Codex 工作猫路径。
4. Codex 工作猫说明明确可靠路径是 wrapper-launched JSONL，并明确 already-open Codex window 自动监听不支持。
5. 诊断导出说明没有展示 token、Authorization、raw payload、prompt、tool command、workspace/config/full local path。
6. 稳定性截图至少包含 start/end 的真实桌面截图和 pet-region 截图。
7. Final report 没有暗示生产签名、公证、自动更新、Windows、跨平台、provider、3D 或 all Codex workflows 已 ready。

## 推荐人工验收步骤

1. 打开最终 HTML：

```bash
open docs/V13.x/evidence/v13_7-beta-readiness-html-2026-06-08.html
```

2. 快速检查首页指标：

- `status` 应为 `passed`。
- `V13.1-V13.6 phase evidence` 应为 `6/6`。
- 截图数量应显示并能直接看到图片。

3. 滚动到“真实截图证据”：

- 确认 first-run desktop pet 截图里有桌宠。
- 确认 settings / first-run 截图存在。
- 确认 Codex work-cat guide 截图存在。
- 确认 stability start/end desktop 和 pet-region 截图存在。

4. 打开 final report：

```bash
open docs/V13.x/v13_7-final-acceptance-report.md
```

5. 检查 “Forbidden Claims”：

- 禁止声明必须作为 not-ready / does-not-claim 语境出现。
- 不应出现 production/cross-platform/provider/3D/all-Codex ready 语义。

## 不属于 V13 人工验收范围

以下内容不是 V13 的验收项，不能因为 V13 通过而自动声明：

- 生产签名发布。
- Apple notarization。
- 自动更新。
- Windows 或 cross-platform 包。
- Petdex parity。
- broad 3D ready。
- automatic photo-to-3D ready。
- provider integration verified。
- already-open Codex window 自动监听。
- OS-level Codex window binding ready。
- all Codex workflows verified。
- MCP ready。
- Third-party agent integration verified。
- Claude Code integration verified。

## 后续开发分流建议

| Track | 目标 |
| --- | --- |
| Release Track | 签名、公证、安装包、自动更新、崩溃报告。 |
| Integration Reliability Track | 修复 accepted PetEvent 与 UI/list 状态投射不一致问题。 |
| User Experience Track | 设置页、首启、内置猫库、报告页视觉进一步产品化。 |
| Platform Track | Windows/cross-platform 可行性与实现。 |
| Provider / 3D Track | provider 凭证、photo-to-3D、3D 质量与真实 provider 输出。 |

## Manual Decision

人工验收通过条件：

```text
Operator can open the V13 final HTML, see real screenshots, understand the scoped beta workflow, and confirm no forbidden readiness claim is implied.
```

如果人工验收发现截图不可读、HTML 无法打开、或 final claim 越界，应将 V13 closure 标记为 needs-fix，并回到对应 evidence 或文档修复，而不是新增 V13 feature phase。
