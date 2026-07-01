# V40 Evidence And Scan Checklist

Date: 2026-06-30

## Required Evidence Shape

Each V40 phase evidence file must include:

- phase objective and controlling PRD/spec;
- real command results or stable blocked reason;
- in-scope and out-of-scope claims;
- user-visible impact;
- accepted, blocked, and failed candidate summary where relevant;
- claim scan result;
- security scan result;
- final phase decision.

V40.3R2 readiness and implementation evidence must additionally include:

- statement that this remains inside V40 and is not a new project stage;
- current route state: V40.3 failed, V40.3R img2img failed, V40.3R
  identity-conditioned was initially blocked, V40.3R2 generated real candidates
  but failed visual review, V40.4-V40.7 No-Go;
- selected next bounded route only after the V40.3R2 failed result is explicitly
  acknowledged; no silent rerun may unlock V40.4;
- drawio page-count check and current-to-target architecture sync result;
- PRD/spec consistency review against current evidence.

V40.3R3 candidate-source decision evidence must additionally include:

- documentation support audit result;
- one explicit decision:
  `accepted_manual_import_first`, `new_direct_runner_route_allowed`, or
  `remain_failed_or_blocked`;
- audit summary of V40.3, V40.3R, and V40.3R2 failed evidence;
- source, license, sample binding, and visual acceptance evidence references
  before any manual/import implementation;
- proof that any new direct-runner route is materially different from failed
  prompt-only, img2img, and V40.3R2 identity-conditioned attempts;
- V40.4 entry decision that stays No-Go unless two same-sample candidates pass
  explicit visual review;
- claim scan and security scan results.

## Required Scans

Claim scan must reject positive ready claims for:

- Petdex parity achieved;
- automatic photo-to-animation ready for arbitrary cats;
- automatic photo-to-2D ready for arbitrary cats;
- provider integration verified;
- Route B verified without real same-sample source-bound assets;
- 3D ready;
- production signed release ready;
- Windows ready;
- cross-platform ready;
- MCP ready;
- Claude Code integration verified;
- OS-level Codex window binding ready;
- all Codex workflows verified.

Security scan must reject evidence containing:

- token or Authorization values;
- raw runner/API payloads;
- raw prompts;
- raw local absolute paths;
- raw generated image bytes;
- raw photo bytes;
- EXIF/GPS;
- workspace path;
- config path;
- credential path;
- terminal titles or raw command transcripts.

## Visual Evidence Checklist

V40.6 and V40.7 must include:

- source/sanitized sample reference;
- V39 same-sample baseline visual;
- V40 no-WebUI candidate visual;
- route label: Direct Local Runner generated or explicit manual/import;
- eight-action contact sheet or equivalent action preview;
- UI preview/apply/rollback screenshot evidence;
- failure and blocked-candidate evidence;
- final scoped claim text.

V40.4 may not start, and V40.6/V40.7 visual evidence may not claim success,
until at least two same-sample V40 candidates have explicit visual-review pass
records. V40.3R2 failed candidates and stylized retry outputs do not satisfy
this condition.
