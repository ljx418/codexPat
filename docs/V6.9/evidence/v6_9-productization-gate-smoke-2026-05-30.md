# V6.9 Productization Gate Smoke

status: passed

date: 2026-05-30

commit: dcc9f363

## Scope

This evidence closes the V6 Productization Gate for tested local macOS developer workflow scenarios.

It does not claim production signed release readiness, cross-platform readiness, Windows readiness, all Codex workflows, MCP readiness, third-party product integration, provider integration, photo customization, automatic photo-to-3D, asset marketplace, or 3D readiness.

## Phase Evidence Gate

| Phase | Result | Evidence |
| --- | --- | --- |
| V6.0 | passed | `docs/V6.0/v6_0-final-acceptance-report.md` |
| V6.1 | passed | `docs/V6.1/v6_1-final-acceptance-report.md` |
| V6.2 | passed | `docs/V6.2/v6_2-final-acceptance-report.md` |
| V6.3 | passed | `docs/V6.3/v6_3-final-acceptance-report.md` |
| V6.4 | passed | `docs/V6.4/v6_4-final-acceptance-report.md` |
| V6.5 | passed | `docs/V6.5/v6_5-final-acceptance-report.md` |
| V6.6 | passed | `docs/V6.6/v6_6-final-acceptance-report.md` |
| V6.7 | passed | `docs/V6.7/v6_7-final-acceptance-report.md` |
| V6.8 | passed | `docs/V6.8/v6_8-final-acceptance-report.md` |

## Regression Results

```text
pnpm run doctor
pnpm --filter @agent-desktop-pet/pet-protocol check
pnpm --filter @agent-desktop-pet/pet-protocol test
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter @agent-desktop-pet/pet-mcp check
pnpm --filter @agent-desktop-pet/pet-mcp test
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm --filter desktop tauri build -b app
```

Result: passed.

Doctor result: no hard failures. Network/sandbox listen warnings were non-blocking.

Runtime smoke:

```text
node scripts/v3_1_runtime_smoke.mjs
node scripts/v3_2_mcp_adapter_smoke.mjs
node scripts/v3_2_third_party_contract_smoke.mjs
node scripts/v3_7_codex_exec_jsonl_monitor_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v4_5_managed_tui_preflight_smoke.mjs
node scripts/v5_12_runtime_imported_pack_smoke.mjs
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png
```

Result: passed.

## Security Scan

V6 docs and retained evidence were scanned for:

```text
token
Authorization bearer value
raw payload
raw provider response
transcript_path
workspace path
config path
api-token.json
full local path markers
```

Result: passed. Matches were in forbidden/redaction/not-collected contexts only.

## Claim Scan

V6 docs were scanned for forbidden ready claims. Matches were in forbidden/not-ready/does-not-imply contexts only.

Forbidden ready claims remain:

```text
production signed release ready
cross-platform ready
Windows ready
all Codex workflows verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
MCP ready
Third-party agent integration verified
Claude Code integration verified
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
3D ready
Rive ready
Live2D ready
asset marketplace ready
```

## License / Attribution Scan

Result: passed for retained local bundled/generated/test fixtures.

Observed attribution sources:

- bundled CSS and sprite manifests.
- bundled generated GLTF prototype manifest and `apps/desktop/public/assets/3d/LICENSE-ASSET.md`.
- V5.12 local sprite / GLTF / orange tabby fixture manifests.

## Artifact Check

Result: passed.

`git ls-files` found no tracked `dist/`, `target/`, or `node_modules` artifacts.

Scoped `git status` was reviewed for this project. The wider workspace contains unrelated sibling-project changes, but those are outside the V6 gate.

## Allowed Claim

```text
V6 productization acceptance passed for tested local macOS developer workflow scenarios.
```

## Still Not Implied

```text
production signed release ready
cross-platform ready
Windows ready
all Codex workflows verified
MCP ready
Third-party agent integration verified
provider integration verified
photo customization ready
automatic photo-to-3D ready
asset marketplace ready
3D ready
```
