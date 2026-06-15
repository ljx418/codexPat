# V10.13 Premium Cat Library Smoke Evidence

status: passed
date: 2026-06-05

## Scope

This evidence validates the local bundled premium animated 2D cat library. It
does not claim Petdex parity, 3D readiness, provider integration, marketplace
readiness, production signed release readiness, cross-platform readiness, or
Windows readiness.

## Premium Pack List

| packId | displayName | palette | core action coverage | manifest |
| --- | --- | --- | --- | --- |
| premium-orange-tabby | 橘子工作猫 | orange tabby | 8/8 | valid |
| premium-tuxedo | 礼服工作猫 | tuxedo | 8/8 | valid |
| premium-silver | 银灰工作猫 | silver | 8/8 | valid |
| premium-calico | 三花工作猫 | calico | 8/8 | valid |
| premium-cream | 奶油工作猫 | cream | 8/8 | valid |
| premium-blue | 蓝灰工作猫 | blue gray | 8/8 | valid |

## Evidence Files

- contact sheet: `docs/V10.x/evidence/v10_13-premium-cat-library-contact-sheets-2026-06-05.html`
- runtime capture: `docs/V10.x/evidence/v10_13-premium-cat-library-runtime-capture-2026-06-05.html`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| premium pack count | passed | premium-orange-tabby, premium-tuxedo, premium-silver, premium-calico, premium-cream, premium-blue |
| manifest validation | passed | premium-orange-tabby:true, premium-tuxedo:true, premium-silver:true, premium-calico:true, premium-cream:true, premium-blue:true |
| action coverage | passed | premium-orange-tabby:8/8, premium-tuxedo:8/8, premium-silver:8/8, premium-calico:8/8, premium-cream:8/8, premium-blue:8/8 |
| frame count | passed | premium-orange-tabby/idle:8/8, premium-orange-tabby/thinking:8/8, premium-orange-tabby/running:8/8, premium-orange-tabby/success:4/4, premium-orange-tabby/warning:4/4, premium-orange-tabby/error:4/4, premium-orange-tabby/need_input:4/4, premium-orange-tabby/sleeping:8/8, premium-tuxedo/idle:8/8, premium-tuxedo/thinking:8/8, premium-tuxedo/running:8/8, premium-tuxedo/success:4/4, premium-tuxedo/warning:4/4, premium-tuxedo/error:4/4, premium-tuxedo/need_input:4/4, premium-tuxedo/sleeping:8/8, premium-silver/idle:8/8, premium-silver/thinking:8/8, premium-silver/running:8/8, premium-silver/success:4/4, premium-silver/warning:4/4, premium-silver/error:4/4, premium-silver/need_input:4/4, premium-silver/sleeping:8/8, premium-calico/idle:8/8, premium-calico/thinking:8/8, premium-calico/running:8/8, premium-calico/success:4/4, premium-calico/warning:4/4, premium-calico/error:4/4, premium-calico/need_input:4/4, premium-calico/sleeping:8/8, premium-cream/idle:8/8, premium-cream/thinking:8/8, premium-cream/running:8/8, premium-cream/success:4/4, premium-cream/warning:4/4, premium-cream/error:4/4, premium-cream/need_input:4/4, premium-cream/sleeping:8/8, premium-blue/idle:8/8, premium-blue/thinking:8/8, premium-blue/running:8/8, premium-blue/success:4/4, premium-blue/warning:4/4, premium-blue/error:4/4, premium-blue/need_input:4/4, premium-blue/sleeping:8/8 |
| unique pose count | passed | premium-orange-tabby/idle:8/4, premium-orange-tabby/thinking:8/4, premium-orange-tabby/running:8/4, premium-orange-tabby/success:4/3, premium-orange-tabby/warning:4/3, premium-orange-tabby/error:4/3, premium-orange-tabby/need_input:4/3, premium-orange-tabby/sleeping:8/4, premium-tuxedo/idle:8/4, premium-tuxedo/thinking:8/4, premium-tuxedo/running:8/4, premium-tuxedo/success:4/3, premium-tuxedo/warning:4/3, premium-tuxedo/error:4/3, premium-tuxedo/need_input:4/3, premium-tuxedo/sleeping:8/4, premium-silver/idle:8/4, premium-silver/thinking:8/4, premium-silver/running:8/4, premium-silver/success:4/3, premium-silver/warning:4/3, premium-silver/error:4/3, premium-silver/need_input:4/3, premium-silver/sleeping:8/4, premium-calico/idle:8/4, premium-calico/thinking:8/4, premium-calico/running:8/4, premium-calico/success:4/3, premium-calico/warning:4/3, premium-calico/error:4/3, premium-calico/need_input:4/3, premium-calico/sleeping:8/4, premium-cream/idle:8/4, premium-cream/thinking:8/4, premium-cream/running:8/4, premium-cream/success:4/3, premium-cream/warning:4/3, premium-cream/error:4/3, premium-cream/need_input:4/3, premium-cream/sleeping:8/4, premium-blue/idle:8/4, premium-blue/thinking:8/4, premium-blue/running:8/4, premium-blue/success:4/3, premium-blue/warning:4/3, premium-blue/error:4/3, premium-blue/need_input:4/3, premium-blue/sleeping:8/4 |
| nonblank scan | passed | all generated premium SVG frames include visible geometry |
| frame-difference check | passed | all premium actions meet unique pose thresholds |
| scale readability | passed | all packs use 256px source frames captured at 1x and 0.75x |
| bounding box / off-canvas check | passed | all frames use fixed 256x256 viewBox |
| license attribution scan | passed | all premium packs use project-authored bundled attribution |
| security scan | passed | controlled SVG frames contain no script, foreignObject, handler, external href, URL, data URI, text label, token, or local path |
| claim scan | passed | V10.13 claims premium bundled animated 2D cat library only; no Petdex parity, 3D, provider, marketplace, release, cross-platform, or Windows claim |

## Safe Renderer Boundary

Renderer input remains limited to safe action ID, renderer kind, safe pack ID,
playback intent, scale, and visibility. The premium library uses controlled
procedural SVG frames and does not introduce remote URLs, script execution,
external hrefs, token fields, provider payloads, prompt text, or local paths.

## Allowed Claim

```text
V10.13 premium bundled animated 2D cat library passed for tested local visual-quality scenarios.
```

## Final Decision

V10.13 smoke passed. V10.14 may proceed after PRD/spec review.
