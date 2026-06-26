# V38 Acceptance Plan

Date: 2026-06-26

## Acceptance Gates

- Public source gate: source pages and license metadata are recorded, original files are not committed as evidence, negative and blocked samples are not treated as passing cats.
- Pixel gate: sanitized derivatives are 512x512 PNG files, have hash references, and have EXIF/GPS-style metadata stripped.
- Render gate: each passing sample has eight actions and at least four frames per action, with contact sheet and GIF preview.
- Product gate: V38 UI anchors exist in settings and expose status, generated asset count, renderable pack count, and blocked reasons.
- Report gate: Chinese HTML report includes target architecture, current implementation, user scenario path, screenshots or stable screenshot block, and sample evidence.
- Final gate: final report gives only a narrow scoped decision and lists remaining risks.

## User-Visible Outcome

After V38 passes scoped, a reviewer can inspect three real public cat photo samples and see generated 2D action frame evidence. This is stronger than a line-drawn placeholder because the report uses photo-derived pixels.

## Failure Handling

If source download, metadata stripping, frame generation, screenshot capture, or claim/security scan fails, the phase result is blocked or failed. The final gate cannot pass until the issue is fixed or recorded as a stable environment block.
