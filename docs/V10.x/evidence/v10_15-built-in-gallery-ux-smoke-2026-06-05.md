# V10.15 Built-in Gallery UX Smoke Evidence

status: passed
date: 2026-06-05

## Scope

This smoke validates the built-in local pet gallery and safe pack UX in the real
desktop source. It does not claim remote marketplace readiness, remote asset
loading readiness, provider integration, 3D readiness, production release
readiness, cross-platform readiness, or Windows readiness.

## Evidence Files

- capture: `docs/V10.x/evidence/v10_15-built-in-gallery-capture-2026-06-05.html`

## Gallery Packs

| packId | displayName | rendererKind | core actions |
| --- | --- | --- | --- |
| premium-orange-tabby | 橘子工作猫 | sprite | 8/8 |
| premium-tuxedo | 礼服工作猫 | sprite | 8/8 |
| premium-silver | 银灰工作猫 | sprite | 8/8 |
| premium-calico | 三花工作猫 | sprite | 8/8 |
| premium-cream | 奶油工作猫 | sprite | 8/8 |
| premium-blue | 蓝灰工作猫 | sprite | 8/8 |
| premium-black | 黑曜工作猫 | sprite | 8/8 |
| premium-white | 雪白工作猫 | sprite | 8/8 |
| premium-ginger-white | 橘白工作猫 | sprite | 8/8 |
| premium-brown-tabby | 狸花工作猫 | sprite | 8/8 |
| premium-lilac | 丁香工作猫 | sprite | 8/8 |
| premium-golden | 金渐层工作猫 | sprite | 8/8 |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| gallery UI present | passed | gallery ids found |
| bundled pack list | passed | gallery lists bundled living/premium packs and preview actions |
| isolated preview | passed | preview renderer is isolated and records zero accepted PetEvent |
| activation path | passed | gallery activation is target instance scoped and imported path is deactivated |
| restore default path | passed | restore default clears bundled preference and imported activation |
| runtime bundled preference | passed | runtime reads safe per-instance bundled pack preference and remounts |
| safe storage | passed | only allowlisted bundled local pack IDs are stored |
| redaction scan | passed | no token, Authorization, raw payload, full local path, workspace path, or credential-file marker |
| claim scan | passed | V10.15 claims built-in local gallery UX only; no marketplace, remote loading, provider, 3D, release, platform claim |
| gallery pack metadata | passed | premium-orange-tabby:8/8, premium-tuxedo:8/8, premium-silver:8/8, premium-calico:8/8, premium-cream:8/8, premium-blue:8/8, premium-black:8/8, premium-white:8/8, premium-ginger-white:8/8, premium-brown-tabby:8/8, premium-lilac:8/8, premium-golden:8/8 |

## Final Decision

V10.15 smoke passed. V10.16 may proceed after final evidence review.
