# Post-V30 Evidence and Scan Checklist

文档状态：active checklist。
当前日期：2026-06-23。

## Required For Every Post-V30 Phase

Each phase must produce a real evidence file under `docs/V30.x/evidence/`.
Silent pass is not allowed.

Minimum sections:

- status: `passed scoped`, `blocked`, or `failed`
- date
- scope
- commands run
- results
- PRD / spec review
- claim scan
- security scan
- remaining risks
- final decision

## PRD / Spec Review

Confirm:

- The phase matches `docs/active/architecture-remediation-plan.md`.
- The phase does not expand `docs/active/agent_desktop_pet_prd_v30.md`.
- Runtime evidence is not substituted with static tests.
- Fixture-only evidence is not substituted for managed Codex workflow evidence.
- Any blocked status includes a stable reason and next action.

## Claim Scan

Scan touched docs and evidence for forbidden ready claims:

```bash
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <touched-docs>
```

Allowed matches only:

- forbidden claim lists
- not-ready / not-claimed context
- must-not-claim context
- historical baseline caveats

No phase may claim more than its tested local evidence supports.

## Security Scan

Scan touched docs and evidence for sensitive terms:

```bash
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <touched-docs>
```

Allowed matches only:

- redaction requirements
- forbidden-content lists
- troubleshooting instructions that do not reveal real values

Evidence must not include real secrets, full local paths, raw HTTP payloads,
raw provider responses, raw photos, raw JSONL, raw prompts, terminal titles, or
TTY values.

## Regression Commands

Use the smallest set that proves the phase, plus the shared baseline:

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Runtime phases must also include their phase-specific commands from:

- `docs/active/post-v30-runtime-smoke-spec.md`
- `docs/active/post-v30-managed-codex-smoke-spec.md`

## Evidence Naming

Use stable phase names:

- `post-v30_1-runtime-desktop-smoke-YYYY-MM-DD.md`
- `post-v30_2-managed-codex-workflow-smoke-YYYY-MM-DD.md`
- `post-v30_3-architecture-slice-<slice-id>-YYYY-MM-DD.md`
- `post-v30_4-architecture-slice-<slice-id>-YYYY-MM-DD.md`
- `post-v30_5-final-remediation-gate-YYYY-MM-DD.md`
