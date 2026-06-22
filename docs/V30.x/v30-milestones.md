# V30 Milestones

文档状态：planned milestones。
当前日期：2026-06-17。

| Milestone | Phase | Exit Signal |
| --- | --- | --- |
| M30.0 | V30.0 | Scope, docs, drawio, claim boundary frozen |
| M30.1 | V30.1 | 8 action storyboard and key-pose contract accepted |
| M30.2 | V30.2 | At least one 8-action semantic candidate exists |
| M30.3 | V30.3 | Motion readability QA rejects transform-only asset and accepts semantic candidate |
| M30.4 | V30.4 | HTML/Manager preview shows old-vs-new animated comparison |
| M30.5 | V30.5 | Approved pack target-only apply and rollback pass |
| M30.6 | V30.6 | Final dashboard and checks close with passed / blocked / failed |

## V30 Exit Conditions

V30 may pass only if:

- V30.0-V30.5 evidence exists；
- at least one candidate has 8 semantic actions；
- running / success / error / need_input pass manual visual rubric；
- weak transform-only candidate is rejected；
- final report embeds visual playback and contact sheets；
- target-only apply and rollback pass；
- security and claim scans pass。

V30 must be blocked if:

- no candidate looks better than transform-only motion effects；
- actions cannot be recognized without labels；
- QA failed candidate can be applied；
- final evidence is link-only or text-only；
- forbidden claims appear as ready/passed。
