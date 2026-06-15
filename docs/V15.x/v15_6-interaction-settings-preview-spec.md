# V15.6 Interaction Settings and Preview Spec

日期：2026-06-09  
状态：planned。  

## Goal

Give ordinary users clear control over living interaction intensity and behavior without needing CLI commands or hidden configuration.

## Settings Surface

Required controls:

| Setting | Values | Default |
| --- | --- | --- |
| Autonomous walk | on / off | on |
| Pointer reactions | on / off | on |
| Click reactions | on / off | on |
| Drag physics | on / off | on |
| Quiet mode | on / off | off |
| Interaction frequency | low / normal / lively | normal |
| Motion intensity | subtle / normal / expressive | normal |

## UX Requirements

- controls must be understandable without reading docs.
- no marketing-style hero page; settings are utilitarian and scannable.
- current active pet and active pack remain visible.
- changes apply to selected pet or global default according to existing app model.
- invalid stored values fall back to safe defaults.
- settings persist across restart.

## Preview Sandbox

Preview must support:

- drag preview.
- pointer-near preview.
- click preview.
- double-click preview.
- autonomous walk preview.
- quiet mode preview.

Preview must not:

- emit PetEvent.
- call notify.
- write CatStateMachine.
- change live PetInstance state.
- activate, delete, or rollback asset packs.
- store raw interaction traces.

## Acceptance Evidence

Output:

```text
docs/V15.x/evidence/v15_6-interaction-settings-smoke-YYYY-MM-DD.md
```

Required proof:

- settings controls visible.
- toggles update sanitized settings state.
- persistence after restart or deterministic storage reload.
- preview zero PetEvent.
- preview does not mutate live target pet.
- quiet mode blocks autonomous walk and reduces noncritical interactions.
- default and unrelated pets unchanged.

## Failure Conditions

- settings preview changes live pet state.
- settings expose raw local paths or implementation internals.
- invalid values crash app or produce invisible pet.
- quiet mode hides error/need_input.
