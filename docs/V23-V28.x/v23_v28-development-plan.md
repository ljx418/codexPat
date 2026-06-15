# V23-V28 Development Plan

文档状态：planned development plan。  
阶段主题：Photo-to-Animated-2D Productization Track。  
当前日期：2026-06-15。

## Scope

V23-V28 starts from V22 scoped accepted quality gate. The track focuses on
making “photo to animated 2D pet” productized enough for tested local scenarios,
without claiming arbitrary-cat automation or provider integration.

## Stage Plan

| Stage | Name | Development Scope | Output |
| --- | --- | --- | --- |
| V23 | Photo Suitability & Trait Extraction | photo selector quality scoring, safe trait summary, better-photo guidance | photo quality gate |
| V24 | Multi-route Generation Orchestrator | route registry, route budgets, provider/local route attempts, fallback strategy | route orchestrator |
| V25 | Same-cat & Motion QA | identity consistency, motion amplitude, loop closure, flicker/drift scoring | QA engine |
| V26 | Auto Pack + User Preview | pet.json/frames assembly, 8-action preview, user approval, target apply/rollback | user confirmation flow |
| V27 | Retry / Cost / Failure Guidance | reasonCode-driven retry, cost/time limits, route switch guidance | controlled retry policy |
| V28 | Productized Workflow Gate | full wizard, final screenshots/dashboard, regression, claim scan | final scoped acceptance |

## Development Priorities

1. Reject unsuitable photos before provider spend.
2. Avoid single-route dependency.
3. Keep all provider and photo data behind safe redaction boundaries.
4. Never apply QA-failed assets.
5. Make the final user flow understandable without manual shell steps.

## Required Evidence

Every stage must produce one evidence file under:

```text
docs/V23-V28.x/evidence/
```

V28 final must include an HTML report with embedded visual evidence:

```text
docs/V23-V28.x/evidence/v28-productized-photo-to-2d-dashboard-YYYY-MM-DD.html
```

## Go / No-Go

V23 can start after operator accepts this plan.  
V28 final is No-Go until V23-V27 have passed / blocked / failed evidence.
