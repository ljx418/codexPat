# V6.8 Development Plan: Agent / Third-party Developer Productization

status: planning-ready

date: 2026-05-30

## Scope

V6.8 productizes developer-facing integration documentation and local contract tooling around the accepted localhost Event Bridge, MCP adapter minimal smoke, third-party contract v3 smoke, and Codex wrapper-managed paths.

This phase may update:

- versioned local contract documentation.
- SDK/example command documentation.
- debugging tool guide.
- MCP maturity plan.
- third-party integration boundary docs.

This phase must not implement or claim:

- MCP ready.
- Third-party agent integration verified.
- provider integration verified.
- all Codex workflows verified.
- production signed release ready.

## Required Checks

```bash
node scripts/v3_2_third_party_contract_smoke.mjs
node scripts/v3_2_mcp_adapter_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
```

## Allowed Claim

```text
V6.8 developer integration documentation and local contract tooling passed for tested examples.
```

## Forbidden Claims

```text
MCP ready
Third-party agent integration verified
Claude Code integration verified
all Codex workflows verified
production signed release ready
```
