# Post-V30 Documentation Development Evidence

status: passed scoped
date: 2026-06-23

## Scope

This evidence covers the documentation-only development pass that turns
Post-V30.1 through Post-V30.5 from phase names into executable specs,
templates, and scan checklists.

This pass does not run runtime desktop smoke or managed Codex workflow smoke.
It does not claim Petdex parity, arbitrary-cat automatic animation, provider
integration verification, 3D readiness, production release readiness, Windows
readiness, cross-platform readiness, MCP readiness, Claude Code integration, or
all Codex workflows verified.

## Documents Added

- `docs/active/post-v30-runtime-smoke-spec.md`
- `docs/active/post-v30-managed-codex-smoke-spec.md`
- `docs/active/post-v30-evidence-and-scan-checklist.md`
- `docs/V30.x/evidence/post-v30_1-runtime-desktop-smoke-TEMPLATE.md`
- `docs/V30.x/evidence/post-v30_2-managed-codex-workflow-smoke-TEMPLATE.md`
- `docs/V30.x/evidence/post-v30_3-architecture-slice-TEMPLATE.md`

## Documents Updated

- `docs/active/architecture-remediation-plan.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/agent_desktop_pet_prd_v30.md`
- `docs/README.md`
- `docs/ops/developer-setup.md`
- `docs/ops/troubleshooting.md`

## PRD / Spec Review

- V30 PRD remains a scoped claim boundary, not a new feature claim.
- Post-V30.1 now has a runtime desktop smoke spec with explicit commands,
  pass criteria, blocked criteria, and evidence template.
- Post-V30.2 now has a managed Codex workflow smoke spec with explicit
  prerequisites, commands, blocked criteria, and evidence template.
- Post-V30.3/Post-V30.4 now have an architecture slice evidence template to
  force spec review and tests before code movement.
- Post-V30 phases share one evidence and scan checklist.

## Commands Run

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

Result: passed. The gate rejected the transform-only weak baseline and accepted
the semantic local 2D rig candidate.

```text
git diff --check -- <touched-docs>
```

Result: passed.

## Claim Scan

The touched docs were scanned for forbidden ready claims. Matches appeared only
in forbidden / not-ready / must-not-claim contexts.

## Security Scan

The touched docs were scanned for token, Authorization, raw payload, raw
prompt, raw JSONL, TTY, terminal title, local path, workspace path, config path,
EXIF/GPS, and api-token terms. Matches appeared only in redaction,
forbidden-content, or troubleshooting contexts.

## Remaining Risks

- Runtime desktop smoke remains next planned and must be executed with a real
  running desktop app.
- Managed Codex workflow smoke remains planned and depends on a running bridge.
- Architecture slice templates do not approve code movement by themselves.

## Decision

Post-V30 documentation development passed scoped after validation. The next
execution phase remains Post-V30.1 runtime desktop smoke.
