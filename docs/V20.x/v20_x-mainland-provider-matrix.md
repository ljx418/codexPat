# V20 Mainland Provider Matrix

文档状态：planned provider matrix；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-14。

## Provider Decision

V20 P0 provider is MiniMax / 海螺 because this project already has:

- MiniMax credential boundary tests.
- MiniMax text-to-image action-sheet smoke history.
- MiniMax reference-image/image-to-image capability evidence.
- Existing local adapter code and redaction tests.

V20 still requires new evidence for MiniMax motion-sheet generation across the
V20 sample/repair benchmark. A single lucky output cannot prove low-retry
reliability.

## Candidate Matrix

| Provider | Candidate Role | Expected Use | V20 Decision |
| --- | --- | --- | --- |
| MiniMax / 海螺 | P0 | reference-image to 8x9 motion sheet across multi-sample benchmark | active candidate |
| 阿里云百炼 / 通义万相 | P1 | reference image / image edit / image generation | document only |
| 火山方舟 / 豆包 Seedream / 即梦 | P1 | image edit / multi-image / video motion exploration | document only |
| 可灵 / Kling | P2 | image-to-video then frame extraction | future track |
| 百度千帆 / 文心 | P2 | image generation/edit candidate | future track |
| 腾讯混元 | P2 | image generation/edit candidate | future track |

## Why Not Broad Provider Integration

Provider APIs differ in:

- reference image support.
- direct local upload vs URL input.
- output format.
- licensing and retention policy.
- model consistency.
- background/transparent support.
- cost.

Therefore V20 only claims the tested MiniMax scenario if evidence passes.
