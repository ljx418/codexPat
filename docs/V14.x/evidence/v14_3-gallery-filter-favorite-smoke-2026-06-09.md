# V14.3 Gallery Filter Favorite Smoke Evidence

status: passed
date: 2026-06-09

## Scope

This evidence validates local pet gallery browse/filter/favorite metadata and
source-level isolation guarantees. It does not claim remote marketplace
readiness, provider integration, 3D readiness, production release readiness,
Windows readiness, cross-platform readiness, or Petdex parity.

## Evidence Files

- capture: `docs/V14.x/evidence/v14_3-gallery-filter-favorite-capture-2026-06-09.html`

## Gallery Packs

| packId | displayName | style | color | motion |
| --- | --- | --- | --- | --- |
| flagship-work-cat-v2 | 旗舰橘猫 V2 | flagship work cat | premium flagship orange tabby | lively |
| living-work-cat-v1 | Living Work Cat | living work cat | warm flagship tabby | lively |
| premium-orange-tabby | 橘子工作猫 | premium work cat | orange tabby | lively |
| premium-tuxedo | 礼服工作猫 | premium work cat | tuxedo | balanced |
| premium-silver | 银灰工作猫 | premium work cat | silver | calm |
| premium-calico | 三花工作猫 | premium work cat | calico | lively |
| premium-cream | 奶油工作猫 | premium work cat | cream | calm |
| premium-blue | 蓝灰工作猫 | premium work cat | blue gray | balanced |
| premium-black | 黑曜工作猫 | premium work cat | black | balanced |
| premium-white | 雪白工作猫 | premium work cat | white | calm |
| premium-ginger-white | 橘白工作猫 | premium work cat | ginger white | lively |
| premium-brown-tabby | 狸花工作猫 | premium work cat | brown tabby | balanced |
| premium-lilac | 丁香工作猫 | premium work cat | lilac | calm |
| premium-golden | 金渐层工作猫 | premium work cat | golden shaded | lively |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| gallery UI present | passed | gallery includes search and style/color/motion/source/renderer filters |
| favorite persistence | passed | favorites use sanitized localStorage safe pack IDs |
| preview isolation | passed | preview renderer is isolated and records zero accepted PetEvent |
| target activation path | passed | activation is target scoped and supports bundled/imported paths |
| restore default path | passed | restore clears target preference and returns visible flagship default |
| security scan | passed | no token, Authorization, raw payload, full local path, workspace path, or credential marker |
| claim scan | passed | V14.3 claims local gallery/filter/favorite UX only; no Petdex parity, 3D, provider, marketplace, release, Windows, or cross-platform claim |
| gallery pack count | passed | 14 bundled local packs including flagship, living, and premium packs |
| premium curated count | passed | 12 premium curated packs |
| safe gallery metadata | passed | pack metadata contains no raw local paths, prompt text, token, Authorization, or provider payload |
| view-model filters | passed | flagship-work-cat-v2:gallery_favorite_active |

## Allowed Claim

V14.3 local pet gallery browse/filter/favorite UX passed for tested local metadata and source-level isolation scenarios.

## Final Decision

V14.3 passed. V14.4 may proceed after phase-specific review.
