# V6.8 Acceptance Plan: Agent / Third-party Developer Productization

status: planning-ready

date: 2026-05-30

## Entry Criteria

- V6.7 final acceptance passed.
- V6.8 plan audit has no unresolved Critical or High risk.

## Documentation Acceptance

- developer integration guide lists `/api/events` legacy default route.
- guide lists `/api/instances/:instanceId/events`.
- guide lists `petctl notify --instance`.
- guide lists `petctl attach`.
- guide lists auth failures and instance failures.
- guide lists MCP adapter minimal tools and explicitly says not MCP ready.
- guide lists Codex wrapper-managed JSONL as reliable path and already-open auto-monitoring as unsupported.
- debugging section avoids local paths, raw payloads, tokens, Authorization values, prompt text, and tool command text.

## Smoke Acceptance

```bash
node scripts/v3_2_third_party_contract_smoke.mjs
node scripts/v3_2_mcp_adapter_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
```

## Drift / False-Green Risk Gate

Stop before implementation or V6.9 if any item is High:

- docs imply MCP ready.
- docs imply real third-party product verified.
- docs imply all Codex workflows verified.
- evidence logs token, Authorization, raw payload, prompt, command, or local full path.
