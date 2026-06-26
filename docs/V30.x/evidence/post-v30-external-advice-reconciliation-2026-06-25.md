# Post-V30 External Advice Reconciliation - 2026-06-25

## Scope

This evidence reconciles an external review that described the 2026-06-23
Post-V30 state as ready for Post-V30.1 runtime desktop smoke, conditional for
Post-V30.2 through Post-V30.4, and No-Go for Post-V30.5.

Reviewed current fact sources:

- `docs/active/agent_desktop_pet_prd_post_v30.md`
- `docs/V30.x/post-v30-detailed-development-and-acceptance-plan.md`
- `docs/V30.x/post-v30-target-architecture.md`
- `docs/V30.x/post-v30-acceptance-plan.md`
- `docs/V30.x/post-v30-milestones.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`

## Current Decision

Status: `passed scoped` for reconciliation.

The external review was valid for the 2026-06-23 pre-execution state, but it is
now superseded by later scoped evidence. Current Post-V30 fact sources state:

- Post-V30.1 runtime desktop smoke: `passed scoped`.
- Post-V30.2 managed Codex workflow smoke: `passed scoped`.
- Post-V30.3 frontend architecture slices: `passed scoped`.
- Post-V30.4 Tauri / HTTP bridge architecture slices: `passed scoped`.
- Post-V30.5 final remediation gate: `passed scoped`.

Current active work is V33 photo-to-high-quality 2D action asset
productization. Post-V30 is now an input engineering baseline, not the next
active execution line.

## Accepted Advice

The following advice remains valid as general Post-V30 governance:

- Documentation completeness is not runtime, managed workflow, refactor,
  platform, provider, 3D, production, Windows, or cross-platform evidence.
- Managed Codex workflow claims must remain limited to evidence that ran
  against a running bridge.
- Frontend and Rust/Tauri code movement must have slice evidence before
  further large changes.
- V30 scoped semantic animation evidence is a baseline and does not replace
  real runtime bridge evidence.
- Claim and security scans remain required for phase evidence.

## Superseded Advice

The following advice should not be applied to the current active state without
time qualification:

- "Enter Post-V30.1 next" is historical; Post-V30.1 already has scoped runtime
  smoke evidence.
- "Post-V30.5 is No-Go" is historical; Post-V30.5 has scoped final remediation
  gate evidence dated 2026-06-24.
- "Do not start Post-V30.2 until a running bridge exists" remains a correct
  rule, but current Post-V30.2 evidence already records a running-bridge scoped
  pass.
- The active drawio is no longer a five-page Post-V30-only diagram. It is now
  the V33 active gap diagram with eight Chinese pages.

## PRD Path Clarification

For historical Post-V30 evidence:

- authoritative Post-V30 PRD: `docs/active/agent_desktop_pet_prd_post_v30.md`;
- V30 PRD baseline: `docs/active/agent_desktop_pet_prd_v30.md`.

For current active work:

- authoritative active PRD: `docs/active/agent_desktop_pet_prd_v33.md`;
- Post-V30 PRD is retained as the passed engineering baseline.

## Drawio Export Status

Current active drawio structural check:

- file: `docs/active/current-vs-target-gap.drawio`;
- status: parseable;
- page count: 8;
- page role: V33 active gap, target architecture, technical path, plan,
  milestones, gates, and implementation landing points.

PNG/SVG export status: blocked in this WSL session. The available `drawio`
command is an AppImage and cannot run because FUSE support is unavailable in
the current environment. No GUI export was attempted to avoid focus stealing.

## Claim Boundary

This reconciliation does not claim:

- Petdex parity achieved;
- automatic photo-to-animation ready for arbitrary cats;
- provider integration verified;
- all Codex workflows verified;
- OS-level Codex window binding ready;
- MCP ready;
- Claude Code integration verified;
- 3D ready;
- production signed release ready;
- Windows ready;
- cross-platform ready.

## Security Boundary

This evidence contains only relative documentation paths and scoped status
summaries. It contains no token, Authorization value, raw HTTP payload, raw
provider response, raw JSONL, raw prompt, raw command text, TTY, terminal
title, raw photo bytes, EXIF/GPS, full local path, workspace path, config path,
or `api-token.json` contents.
