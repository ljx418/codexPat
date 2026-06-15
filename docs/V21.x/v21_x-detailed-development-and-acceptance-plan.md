# V21 Detailed Development and Acceptance Plan

文档状态：planned detailed plan。  
当前日期：2026-06-14。

## Implementation Order

1. V21.0 scope freeze and evidence.
2. V21.1 Route A key-pose pack attempt from V20 outputs.
3. V21.2 Route B provider capability classification.
4. V21.3 Route C local rig attempt.
5. V21.4 Route D video route attempt or explicit blocked/excluded decision.
6. V21.5 route comparator HTML.
7. V21.6 best route Manager preview/apply/rollback.
8. V21.7 final gate.

## Development Rules

- No route can silently pass.
- No route can be used in V21 final claim without evidence.
- Failed route output can appear in comparator only with blocked/failed labels.
- QA failed pack cannot be applied.
- V19 fallback must remain available if no V21 route passes.
- V20 provider outputs can be inputs, not acceptance evidence.

## End-to-end Acceptance Chain

```text
route output
  -> safe pack assembly
  -> common QA
  -> isolated preview
  -> route comparator
  -> target-only apply
  -> rollback
  -> final evidence-matched claim
```

## PRD Review Checklist

Before each phase:

- Does the phase still serve the V21 user goal?
- Does it avoid provider overclaim?
- Does it preserve V19 fallback?
- Does it produce user-visible evidence?
- Does it avoid sensitive data in evidence?

After each phase:

- passed / blocked / failed / excluded status recorded；
- risk of plan drift assessed；
- false-green risk assessed；
- next phase go/no-go recorded。

## False-green High-risk Cases

- Route B provider review is treated as final product evidence.
- Route A crop output hides missing actions by duplicating idle frames.
- Route C local rig passes despite motion amplitude being visually weak.
- Route D video route passes while background or drift remains visible.
- Comparator shows only text, not actual visual output.
- Apply changes default pet or unrelated pets.

Any High false-green risk blocks the next phase until the plan or implementation is corrected.
