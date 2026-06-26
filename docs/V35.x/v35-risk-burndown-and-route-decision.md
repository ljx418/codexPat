# V35 Risk Burndown and Route Decision

文档状态：active risk-control plan；V35.0 documentation readiness passed scoped；V35.1-V35.6 planned。
当前日期：2026-06-25。

## Principle

V35 的核心风险是把“工程链路可运行”误写成“目标体验级动作资产”。因此 V35 必须先建立质量标准，再比较路线，最后才允许路线决策。

## Risk Table

| Risk | Failure Mode | Control | Fallback |
| --- | --- | --- | --- |
| 视觉质量不足 | 动作仍像占位图或简单线条。 | V35.1 rubric 明确 non-pass examples。 | Route B professional assisted import。 |
| Route A2 上限 | 本地模板动作僵硬。 | V35.2 明确质量提升点和失败阈值。 | Route B recommended。 |
| Route B 过度声明 | 专业辅助被写成全自动。 | V35.3 source boundary 和 claim scan。 | blocked scoped。 |
| 对照不公平 | 两条路线样本或标准不同。 | V35.4 same-sample comparison。 | comparison failed。 |
| 产品路径虚假通过 | failed candidate 可 apply。 | V35.5 复用 product gate。 | gate failed。 |
| final claim 扩大 | scoped result 写成任意猫 ready。 | V35.6 claim scan。 | final gate failed。 |

## Route Decision Matrix

| Decision | Meaning | Required Evidence |
| --- | --- | --- |
| Route A2 target-experience scoped pass | 本地路线在 named samples 上达到目标体验级。 | rubric pass、visual evidence、QA、product path。 |
| Route A2 engineering pass; Route B recommended | 本地路线可跑通但目标体验不足。 | Route A2 evidence、Route B source plan、comparison reason。 |
| Route B target-experience scoped pass | 专业辅助路线在 named samples 上达到目标体验级。 | source boundary、visual evidence、QA、product path。 |
| V35 partial scoped | 部分样本或部分路线通过。 | passed/failed table and risks。 |
| V35 blocked scoped | 缺少 source、样本、视觉证据或环境条件。 | stable blocked reason。 |
| V35 failed | 存在虚假验收、安全问题或路线均不达标。 | failed evidence and remediation recommendation。 |

## Recommended Path

1. V35.0 冻结文档和 drawio；
2. V35.1 先写质量标准；
3. V35.2/V35.3 分别定义 Route A2 和 Route B；
4. V35.4 用同样本比较；
5. V35.5 验证产品体验；
6. V35.6 形成路线决策，不扩大 claim。
