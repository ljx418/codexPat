# V21 Acceptance Plan

文档状态：scoped accepted acceptance plan。  
当前日期：2026-06-14。

## Acceptance Principle

V21 accepts route evidence, not intent. Every route must end with passed / blocked / failed / excluded. A route cannot be used for final claim unless it produces a real safe animation pack and passes QA.

## Phase Gates

| Phase | Gate | Required Evidence | Pass Condition |
| --- | --- | --- | --- |
| V21.0 | scope freeze | `v21_0-scope-freeze` | docs, claims, drawio, sample photos confirmed |
| V21.1 | Route A key-pose pack | `v21_1-route-a-keypose-pack-smoke` | 8 actions mapped from provider/key-pose material and QA passed |
| V21.2 | Route B provider preflight | `v21_2-route-b-provider-preflight` | provider candidates classified with consent/credential/privacy/license status |
| V21.3 | Route C local rig | `v21_3-route-c-local-rig-smoke` | local rig pack passes same-cat, amplitude, continuity, background, preview |
| V21.4 | Route D video frames | `v21_4-route-d-video-frame-smoke` | extracted frames pack passes action QA or route explicitly blocked/excluded |
| V21.5 | route comparator | `v21_5-route-comparator-report.html` | side-by-side visual comparison exists with safe embedded evidence |
| V21.6 | best route apply/rollback | `v21_6-best-route-preview-apply-rollback` | best route applies only target pet and rollback works |
| V21.7 | final gate | `v21_7-final-acceptance-report` | final claim matches narrowest passed route |

Accepted evidence date: 2026-06-14. V21.0-V21.3, V21.5, V21.6, and V21.7 passed; V21.4 was explicitly excluded; V21.2 passed as provider capability review only.

## Common QA Threshold

Every candidate pack must pass:

- all 8 core actions present；
- each action visible at 1x and 0.75x；
- no blank / fully transparent / off-canvas frame；
- same-cat consistency accepted；
- background absent or safely transparent；
- loop/base actions have first/final closure；
- adjacent frame delta avoids visible flicker and sudden drift；
- motion amplitude is visible, not only sub-pixel jitter；
- preview sends zero PetEvent；
- preview does not write CatStateMachine；
- apply changes target PetInstance only；
- rollback restores previous active pack。

## Security Scan

Evidence and output must not contain:

- token；
- Authorization；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- workspace path；
- config path；
- prompt private text；
- shell command；
- api-token.json。

## Final Decision Rules

Passed:

- at least one route passes QA, preview, target apply, rollback；
- final claim names the exact route and tested scenario。

Blocked:

- all routes are blocked/excluded due missing provider capability or output suitability；
- V19 fallback remains documented。

Failed:

- security leakage；
- false claim；
- QA failed pack is applied；
- preview mutates live pet。
