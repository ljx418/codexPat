# V22 Milestones

文档状态：scoped accepted milestones。  
当前日期：2026-06-15。

| Milestone | Phase | Goal | Exit Condition |
| --- | --- | --- | --- |
| M0 | V22.0 | scope, docs, drawio, claim boundary | evidence exists |
| M1 | V22.1 | quality schema and reasonCode taxonomy | fixtures validate |
| M2 | V22.2 | technical invalid pack rejection | invalid packs rejected |
| M3 | V22.3 | motion/readability rejection | weak/drift/flicker packs rejected |
| M4 | V22.4 | visual review contract | ugly candidate rejected |
| M5 | V22.5 | retry and route guidance | repeated failure gives actionable next step |
| M6 | V22.6 | apply enforcement | only approved applies; rollback works |
| M7 | V22.7 | final gate | accepted and rejected examples embedded |

## Exit Conditions

V22 final can pass only if:

- at least one rejected bad candidate is shown；
- rejected candidates cannot apply；
- at least one approved candidate previews and applies target-only；
- rollback restores previous visible pack；
- repeated failures show guidance；
- security scan passes；
- claim scan passes。

If all candidates are rejected, V22 can still be partially useful but final status must be blocked unless the stage explicitly accepts "rejection-only gate" as the scoped result.
