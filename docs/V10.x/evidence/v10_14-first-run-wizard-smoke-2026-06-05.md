# V10.14 First-run Wizard Smoke Evidence

status: passed
date: 2026-06-05

## Scope

This smoke validates the ordinary-user first-run wizard implementation path in
the real desktop source. It does not claim all Codex workflows, OS-level Codex
window binding, already-open Codex auto-monitoring, provider integration, 3D
readiness, production release readiness, cross-platform readiness, or Windows
readiness.

## Evidence Files

- capture: `docs/V10.x/evidence/v10_14-first-run-wizard-capture-2026-06-05.html`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| wizard UI present | passed | first-run UI ids found |
| premium pack selector | passed | wizard lists bundled local packs including living and premium packs |
| default pet path | passed | default path shows default pet with selected living pack |
| Codex work-cat path | passed | work-cat path creates visible target instance with selected living pack |
| unsupported already-open boundary | passed | unsupported boundary text present |
| copyable JSONL wrapper | passed | wizard renders recommended wrapper command |
| safe storage boundary | passed | only safe completion flag and safe packId preference are stored |
| safe local demo path | passed | first-run demo is local and does not mutate agent state |
| target visibility routing | passed | first-run routes visibility to selected default or Codex work-cat instance |
| redaction scan | passed | no token, Authorization, raw payload, full local path, workspace path, or credential-file marker |
| claim scan | passed | V10.14 claims onboarding only; no OS-level binding, all workflows, provider, 3D, release, platform claim |
| onboarding summary safe | passed | jsonl recommended, hooks trust required, already-open unsupported, safe summary only |

## First-run Path Counts

- default pet path: choose pack -> click default path -> visible living cat.
- Codex work-cat path: choose pack -> click Codex path -> new target instance -> visible living work-cat -> copyable JSONL command available.

## Final Decision

V10.14 smoke passed. V10.15 may proceed.
