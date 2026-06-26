# V35 Evidence and Scan Checklist

文档状态：active checklist；V35.0 documentation readiness passed scoped；V35.1-V35.6 planned。
当前日期：2026-06-25。

## Required Evidence Per Phase

每个 V35 phase evidence 必须包含：

- PRD/spec review；
- input evidence refs；
- command results 或 blocked reason；
- user-visible result；
- route boundary；
- claim scan；
- security scan；
- passed scoped / partial scoped / blocked scoped / failed decision。

## Required Execution Specs

- `docs/V35.x/v35_1-target-experience-rubric-spec.md`
- `docs/V35.x/v35_2-route-a2-quality-uplift-spec.md`
- `docs/V35.x/v35_3-route-b-source-boundary-spec.md`
- `docs/V35.x/v35_4-same-sample-route-comparison-spec.md`
- `docs/V35.x/v35_5-product-ux-evidence-spec.md`
- `docs/V35.x/v35_6-final-route-decision-spec.md`

## Visual Evidence Requirements

V35.1-V35.6 必须要求以下至少一种视觉证据：

- contact sheet；
- playback summary；
- screenshot；
- HTML report with embedded relative evidence refs；
- side-by-side Route A2 / Route B comparison。

## Security Scan

Evidence 不得包含：

- token；
- Authorization value；
- raw HTTP payload；
- raw provider response；
- raw JSONL；
- raw prompt；
- raw command text；
- TTY；
- terminal title；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- workspace path；
- config path；
- `api-token.json` contents。

## Claim Scan

必须扫描并人工确认禁止 ready claim 只出现在 forbidden / not-ready / must-not-claim 语境中。

## Drawio Scan

`docs/active/current-vs-target-gap.drawio` 必须满足：

- 页面数 `<= 8`；
- 中文书写；
- 图例包含绿色、蓝色、黄色、橙色、红色状态；
- 关键连线有语义；
- 色块文字不超出色块范围；
- 不出现重复、冲突或事实错误；
- 不把 V35 planned 写成 implemented。
