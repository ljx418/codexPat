# V6.8 Developer Integration Tooling Smoke

status: passed

date: 2026-05-30

commit: dcc9f363

## Scope

This evidence covers developer integration documentation and local contract tooling examples.

It does not verify a real third-party product, MCP readiness, Claude Code integration, or all Codex workflows.

## Documentation Evidence

- `docs/V6.8/v6_8-developer-integration-guide.md`
- `docs/V6.8/v6_8-claim-matrix.md`

## Smoke Checks

```text
node scripts/v3_2_third_party_contract_smoke.mjs
```

Result: passed.

```text
node scripts/v3_2_mcp_adapter_smoke.mjs
```

Result: passed.

```text
pnpm --filter @agent-desktop-pet/petctl test
```

Result: passed, 57 tests.

## Security Scan

Smoke summaries report sanitized reason codes and pass/fail decisions.

No token, Authorization value, raw payload, prompt text, tool command text, workspace path, config path, full local path, or `api-token.json` value is recorded.

## Claim Result

Allowed:

```text
V6.8 developer integration documentation and local contract tooling passed for tested examples.
```

Still forbidden:

```text
MCP ready
Third-party agent integration verified
Claude Code integration verified
all Codex workflows verified
production signed release ready
```
