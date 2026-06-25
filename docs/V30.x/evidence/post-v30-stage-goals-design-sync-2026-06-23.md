# Post-V30 Stage Goals Design Sync Evidence

status: passed scoped
date: 2026-06-23

## Scope

This evidence records the documentation update that formalizes the approved
Post-V30 runtime and architecture remediation goals as the current stage goals.

This pass updates PRD, target architecture, milestones, acceptance gates, and
the active drawio gap document. It does not run runtime desktop smoke or
managed Codex workflow smoke, and it does not claim Petdex parity, arbitrary-cat
automatic animation, provider integration verification, 3D readiness,
production release readiness, Windows readiness, cross-platform readiness, MCP
readiness, Claude Code integration, OS-level Codex window binding, or all Codex
workflows verified.

## Documents Added

- `docs/active/agent_desktop_pet_prd_post_v30.md`
- `docs/V30.x/post-v30-target-architecture.md`
- `docs/V30.x/post-v30-milestones.md`
- `docs/V30.x/post-v30-acceptance-plan.md`

## Documents Updated

- `docs/active/current-vs-target-gap.drawio`
- `docs/active/current-vs-target-gap.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/architecture-remediation-plan.md`
- `docs/README.md`

## PRD / Spec Review

- Current active PRD is now `docs/active/agent_desktop_pet_prd_post_v30.md`.
- V30 PRD remains the semantic animation claim boundary.
- Post-V30 target architecture defines active fact sources, runtime smoke,
  managed workflow smoke, architecture slice specs, and evidence gates.
- Post-V30 milestones define MP30.0-MP30.5 exit signals.
- Post-V30 acceptance plan defines required evidence, baseline commands,
  claim scan, security scan, and final exit conditions.
- Active drawio now includes current architecture, target architecture,
  current-vs-target gap, development/acceptance plan, milestones, gates, and
  exit conditions.

## Validation

Repository-specific `docs/read-drawio.mjs` was not present, so drawio
validation used a structural XML/node check.

```text
node -e "<drawio structural check>"
```

Result: passed. The active drawio contains required current architecture,
target architecture, development/acceptance plan, milestones, and gate nodes.

```text
git diff --check -- <touched-docs>
```

Result: passed.

```text
pnpm --filter desktop test
```

Result: passed, 261 tests.

```text
pnpm --filter desktop check
```

Result: passed.

```text
pnpm --filter @agent-desktop-pet/petctl test
```

Result: passed, 71 tests.

```text
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Result: passed. The V30 gate rejected the transform-only weak baseline and
accepted the semantic local 2D rig candidate.

## Claim Scan

Touched docs were scanned for forbidden ready claims. Matches appeared only in
forbidden / not-ready / must-not-claim contexts.

## Security Scan

Touched docs were scanned for token, Authorization, raw payload, raw JSONL, raw
prompt, raw command text, TTY, terminal title, local path, workspace path,
config path, EXIF/GPS, and api-token terms. Matches appeared only in
redaction, forbidden-content, or troubleshooting contexts.

## Remaining Risks

- Post-V30.1 runtime desktop smoke remains next planned.
- Post-V30.2 managed Codex workflow smoke remains planned and depends on a
  running desktop bridge.
- Architecture slice specs do not approve code movement by themselves.

## Decision

Post-V30 stage goals design sync passed scoped after validation.
