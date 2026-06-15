# V7.10 Generated 2D Action Asset Pack Development Plan

status: planned
date: 2026-05-31

## Goal

Assemble real generated image outputs into a validated 2D action asset pack that can be activated for a single PetInstance.

## Development Scope

- Accept MiniMax outputs or user-provided external AI outputs as local generated asset candidates.
- Build a sprite/action manifest draft for core actions.
- Require all core actions: `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.
- Validate every asset through existing local manifest and renderer safety rules.
- Preserve the previous active pack when validation or activation fails.
- Prevent transparent-cat failure by falling back to CSS or the previous active pack.

## Action Intent Defaults

- `idle`: calm sitting or relaxed pose.
- `thinking`: focused listening or watching pose.
- `running`: active play with wand or movement.
- `success`: happy upright or celebratory pose.
- `warning`: alert pose.
- `error`: confused or upset pose.
- `need_input`: attention-seeking pose.
- `sleeping`: curled sleeping pose.

## Evidence

`docs/V7.10/evidence/v7_10-generated-2d-action-pack-smoke-YYYY-MM-DD.md`

## Allowed Claim

V7.10 generated 2D action asset pack assembly passed for tested local provider/external output scenarios.
