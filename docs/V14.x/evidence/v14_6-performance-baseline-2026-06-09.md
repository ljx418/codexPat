# V14.6 Performance Baseline Evidence

status: passed
date: 2026-06-09

## Scope

This is a sanitized local macOS process sample for the V14 final gate. It records
only process category, CPU percentage, memory percentage, and RSS kilobytes for
the desktop pet runtime and local development wrappers.

## Sample

| Process category | CPU % | MEM % | RSS KB | Notes |
| --- | ---: | ---: | ---: | --- |
| desktop pet runtime | 0.0 | 0.5 | 84940 | visible desktop app process |
| Vite dev server | 0.0 | 0.3 | 57368 | local renderer dev server |
| Tauri CLI wrapper | 0.0 | 0.2 | 28596 | local app launcher wrapper |
| pnpm desktop dev wrapper | 0.0 | 0.2 | 31632 | local app launcher wrapper |

## Redaction

The source process sample was reviewed and reduced before writing this evidence.
This file intentionally omits full command paths, user home paths, shell history,
tokens, Authorization headers, raw payloads, prompt text, tool command text,
workspace paths, config paths, provider raw responses, and API token filenames.

## Claim Boundary

This baseline supports only the scoped V14 local macOS acceptance gate. It does
not claim production release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, or marketplace
readiness.
