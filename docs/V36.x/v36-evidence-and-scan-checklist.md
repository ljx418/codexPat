# V36 Evidence and Scan Checklist

文档状态：active checklist；V36 documentation development stage；V36.0 documentation readiness passed scoped。
当前日期：2026-06-26。

## Required Evidence Per Phase

每个 V36 phase evidence 必须包含：

- PRD/spec review；
- input evidence refs；
- command results 或 blocked reason；
- user-visible result；
- route boundary；
- human visual review status where applicable；
- claim scan；
- security scan；
- passed scoped / partial scoped / blocked scoped / failed decision。

## Per-Phase Audit Requirements

每个阶段进入实质开发前必须单独总结：

- phase objective；
- development plan；
- acceptance criteria；
- PRD/spec review conclusion；
- audit opinion；
- open critical / major risks；
- decision to proceed, rework, block, or escalate。

只有审计意见为 no new critical or major PRD/spec deviation 时，阶段才能进入实质开发。若发现目标体验无法达成、Route B 资产不可得或 evidence 可能造成虚假验收，必须记录 blocked / partial reason 或停止找用户确认。

## Visual Evidence Requirements

V36 evidence 至少包含一种：

- contact sheet；
- playback summary；
- screenshot；
- HTML report with relative evidence refs；
- side-by-side Route A2 / Route B comparison；
- human review table。

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

## Drawio Scan

`docs/active/current-vs-target-gap.drawio` 必须满足：

- 页面数 `<= 8`；
- 中文书写；
- 图例包含绿色、蓝色、黄色、橙色、红色状态；
- 关键连线有语义；
- 色块文字不超出色块范围；
- 不出现重复、冲突或事实错误；
- 不把 V36 planned 写成 runtime passed。
