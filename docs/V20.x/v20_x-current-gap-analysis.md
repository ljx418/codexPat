# V20 Current Gap Analysis

文档状态：planned gap；V20 Mainland Provider Motion Sheet；V19 local motion-sheet scoped passed 是输入基线。  
当前日期：2026-06-14。

## Current Baseline

V19 已经证明：

```text
local cat image derived motion sheet
  -> safe 8x9 sheet validation
  -> crop / normalize / pack
  -> amplitude QA
  -> preview / target apply / rollback
```

V19 未证明：

- 真实 MiniMax 或其他大陆 provider 可以直接生成合格 8x9 motion sheet。
- provider 输出能稳定保持同一只猫。
- provider 输出无背景、无漂移、动作幅度足够、首尾闭合。
- 普通用户可以稳定完成 provider 生成路径。

## V20 Target Gap

```text
V19 local motion-sheet fallback
  -> V20 mainland provider capability preflight
  -> MiniMax reference-image multi-sample benchmark
  -> reasonCode-driven prompt repair loop
  -> provider output normalization
  -> strict motion/same-cat/background/loop QA
  -> Manager preview
  -> target apply
  -> rollback
```

| Gap | Current | V20 Target | Status |
| --- | --- | --- | --- |
| Provider source | V19 provider branch blocked | MiniMax reference-image motion-sheet benchmark across real cat photos | V20.2 passed 3-sample provider output benchmark; 8x9 normalization still blocked |
| Mainland provider decision | Candidate list not frozen | MiniMax P0, Alibaba/Volcengine/Kling/Baidu/Tencent as documented candidates | V20.0 passed |
| Single sheet output | local sheet generated/validated | real provider returns one 8x9 sheet or explicit blocked decision; reliability claims require at least 3 samples | V20.3 blocked: MiniMax output was not valid 8x9 sheet |
| Retry strategy | one-off generation can be misleading | 3 prompt variants, max 2 attempts each, second attempt must repair by QA reasonCode | 3-sample provider output benchmark passed at provider-output level; repair loop still needed because normalization failed |
| Background handling | local sheet is controllable | provider output must be transparent or safely background-removed; otherwise blocked | V20.3 blocked before accepted normalization |
| Motion quality | V19 validates local amplitude | provider output must pass high-amplitude, same-cat, no-drift, loop QA | V20.4 blocked by V20.3 |
| Product UX | V19 model preview/apply exists | Manager shows provider status, QA result, preview, apply, rollback | V20.5 blocked by V20.3/V20.4 |
| Final proof | V19 final HTML local path | V20 final HTML real provider path or explicit blocked branch | No-Go V20.6 |

## High-risk Areas

| Risk | Severity | Mitigation |
| --- | --- | --- |
| MiniMax returns separate action images, not one sheet | High | Mark provider single-sheet branch blocked; optionally plan local assembly in future phase |
| MiniMax output includes background | High | Require background QA/removal or block apply |
| Same-cat identity drifts across rows | High | Same-cat QA; QA failed pack cannot apply |
| Action amplitude too small | Medium | Motion amplitude threshold and human-readable preview |
| One lucky output overclaimed as reliable | High | Benchmark requires 3 samples, 2/3 accepted, median accepted-attempt <= 4 |
| Overclaim provider readiness | High | Claim matrix restricts to tested MiniMax scenario only |
