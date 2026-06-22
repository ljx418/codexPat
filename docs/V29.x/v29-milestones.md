# V29 Milestones

文档状态：active milestones；planned。
当前日期：2026-06-16。

| Milestone | Stage | Exit Condition |
| --- | --- | --- |
| M29.0 | V29.0 | scope freeze and Petdex-level checklist evidence exists |
| M29.1 | V29.1 | gallery browse/filter/favorite/preview/switch workflow passes |
| M29.2 | V29.2 | diverse photo benchmark runs with fixed budget |
| M29.3 | V29.3 | quality gate v2 rejects weak/ugly/inconsistent candidates |
| M29.4 | V29.4 | productized wizard completes upload/generate/preview/apply/rollback |
| M29.5 | V29.5 | polished default gallery and install history pass visual QA |
| M29.6 | V29.6 | final report and HTML dashboard pass with benchmark and UX evidence |

## Product Exit Conditions

V29 can pass only if:

- V29.0-V29.5 evidence exists；
- gallery UX reaches Petdex-level baseline for browse/filter/favorite/preview/switch；
- stable photo-to-2D benchmark reaches 80% accepted candidate rate；
- all accepted generated packs pass quality gate v2；
- QA-failed candidates cannot apply；
- target apply and rollback work；
- final HTML embeds visual evidence；
- security scan passes；
- claim scan passes。

## Blocked Conditions

V29 must be blocked if:

- fewer than 12 benchmark samples are available and no sample-gap exception is approved；
- accepted candidate rate is below 80%；
- gallery preview cannot show 8 actions；
- generated candidates have identity drift, weak motion, background residue, flicker, jump, or off-canvas frames；
- QA-failed candidate can apply；
- final evidence lacks real visual screenshots/contact sheets；
- forbidden claims are used as ready claims。
