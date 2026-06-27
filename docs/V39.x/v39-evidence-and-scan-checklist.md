# V39 Evidence And Scan Checklist

Date: 2026-06-27

## Required Evidence

- Phase evidence markdown files for V39.0 through V39.8.
- PRD/spec review in each phase evidence file, referencing `v39-phase-specs.md` and `v39-quality-rubric-and-risk-closure.md`.
- Chinese HTML visual report with screenshots or stable screenshot block.
- Source-to-character comparison images for every passing sample.
- Part map or rig responsibility view for every passing sample.
- Eight-action contact sheets and animated previews.
- Product preview/apply/rollback evidence.
- Route B status record.
- Final report with PRD/spec review, command summary, claim scan, security scan, and residual risk.

## Security Checklist

Evidence must not include:

- token values;
- auth header values;
- provider original response bodies;
- HTTP request or response bodies;
- prompt private text;
- terminal session captures;
- unprocessed photo binary data;
- photo metadata coordinates;
- full local workspace or config paths;
- token configuration file contents.

## Claim Checklist

Evidence must not use forbidden ready claims as positive outcomes. Boundary language is allowed only when stating what V39 does not prove.
