# V38 Evidence And Scan Checklist

Date: 2026-06-26

## Required Evidence

- Phase evidence markdown files for V38.0 through V38.7.
- `docs/V38.x/evidence/v38-public-source-records.json`.
- `docs/V38.x/evidence/v38-generated-summary.json`.
- Sanitized PNG files under `docs/V38.x/evidence/assets/<sampleId>/`.
- Contact sheets and GIF previews under the same evidence asset folders.
- Desktop public derived assets under `apps/desktop/public/v38/<sampleId>/`.
- HTML report and browser screenshot.
- Final scoped report.

## Security Scan

Evidence must not include token values, raw provider responses, raw prompts, raw private payloads, raw original photo bytes in markdown, EXIF/GPS values, full workspace paths, config paths, or credential file contents.

## Claim Scan

Evidence must not use forbidden ready claims as positive outcomes. Boundary language is allowed only when stating what V38 does not prove.
