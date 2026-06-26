# V37 Evidence and Scan Checklist

文档状态：active checklist；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26。
当前日期：2026-06-26。

## Required Per Phase

每个 V37 阶段 evidence 必须包含：

- phase development and acceptance plan；
- PRD/spec review；
- engineering blueprint review against `docs/V37.x/v37-engineering-implementation-blueprint.md`；
- command results or stable blocked reason；
- user-visible behavior summary；
- code/entity mapping；
- claim scan；
- security scan；
- scoped decision。

每个阶段 evidence 还必须回答：

- 本阶段是否遵守 implemented/scoped code entities；
- 本阶段是否保留或新增 required UI anchors；
- 本阶段是否使用真实 named sample metadata；
- 本阶段是否拒绝内置猫复用、transform-only、占位图和跨样本复用；
- 本阶段是否按 Route A2/Route B 边界记录结果；
- 本阶段是否生成对应 smoke script 结果。

## Required Final Evidence

V37 final gate 必须包含：

- V37.1-V37.6 phase summary；
- sample table；
- candidate table；
- visual evidence references；
- human review status；
- preview/apply/rollback status；
- blocked/failed reasonCodes；
- final scoped claim；
- remaining risks。

Final evidence must explicitly state whether the phase used safe metadata,
raw photo pixels, screenshot-backed animation playback, or Route B source-bound
assets. If raw photo pixels or screenshot-backed playback were not used, final
claims must remain product-path scoped only.

## Security Scan Must Reject

- token；
- Authorization value；
- raw provider payload；
- raw prompt；
- raw JSONL；
- raw command text；
- TTY；
- terminal title；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- workspace path；
- config path；
- `api-token.json` contents。

## Claim Scan Must Reject

- arbitrary-cat ready claims；
- provider verified claims；
- production/platform/3D ready claims；
- Route B verified claims without real source-bound assets；
- product pass claims when UI still displays only built-in preview cat。
- raw-photo pixel generation verified claims without raw-photo processing evidence；
- screenshot-backed animated playback passed claims without rendered screenshot evidence。
