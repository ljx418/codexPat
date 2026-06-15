# V7.0 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- V7 PRD exists.
- V7.x development, acceptance, claim, gap, evidence, and audit docs exist.
- V7.1-V7.7 phase paths are registered.
- forbidden claims are listed and scoped.
- V6 remains closed and is not reopened.

## Required Checks

```bash
rg -n "V7 personalized cat asset workflow" docs/V7.x docs/active/agent_desktop_pet_prd_v7.md
rg -n "production signed release ready|automatic photo-to-3D ready|provider integration verified|3D ready" docs/V7.x docs/active/agent_desktop_pet_prd_v7.md
git diff --check -- docs/V7.x docs/V7.0 docs/active/agent_desktop_pet_prd_v7.md
```

Forbidden claim matches must be in forbidden/not-ready contexts only.
