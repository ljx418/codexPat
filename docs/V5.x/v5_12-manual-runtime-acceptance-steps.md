# V5.12 Manual Runtime Acceptance Steps

status: ready-for-operator

date: 2026-05-29

## Preconditions

- Desktop app is running.
- Settings window can be opened.
- At least two pet instances exist: one target pet and one unrelated pet.
- V5.12 fixtures exist:
  - `fixtures/manual/v5_12/sprite/manifest.json`
  - `fixtures/manual/v5_12/gltf/manifest.json`

## Steps

1. Open Settings.
2. Import `fixtures/manual/v5_12/sprite/manifest.json`.
3. Import `fixtures/manual/v5_12/gltf/manifest.json`.
4. In the target pet instance card, select `V5.12 Runtime Sprite Cat`.
5. Confirm only the target pet changes to imported sprite rendering.
6. Trigger core states from the target pet debug strip: `thinking`, `running`, `success`, `error`, `need_input`.
7. Confirm default pet and unrelated pet remain on their previous renderer/profile.
8. Switch the target pet back to default/bundled rendering.
9. Select `V5.12 Runtime GLTF Cat`.
10. Confirm only the target pet changes to imported GLTF rendering.
11. Quit and restart the desktop app.
12. Confirm the target pet restores the active imported pack mapping.
13. Corrupt or remove one copied imported asset from app-managed storage only if requested by the developer, then restart.
14. Confirm the target pet falls back to CSS with no crash and no default/unrelated pet change.

## Pass Criteria

- Imported sprite pack renders for the target PetInstance.
- Imported GLTF pack renders for the target PetInstance.
- Only target PetInstance uses imported visuals.
- Default and unrelated pets remain unchanged.
- Restart restores active mapping.
- Invalid/corrupt/stale pack falls back to CSS.

## Forbidden Evidence

Manual notes must not include token, Authorization, raw payload, full local path, workspace path, config path, raw Agent/Codex/terminal/MCP/HTTP payload, prompt text, provider payload, or raw GLTF JSON chunks.
