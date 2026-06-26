# V33 Evidence and Scan Checklist

文档状态：planned checklist；每个 V33 子阶段必须使用。
当前日期：2026-06-25。

## Evidence Template

每份 V33 evidence 必须包含：

- phase id；
- PRD/spec reviewed；
- development action summary；
- acceptance action summary；
- command results 或 stable blocked reason；
- user-visible experience status；
- architecture target status；
- pass / partial / blocked / failed decision；
- blocked / failed reasonCodes；
- evidence file refs；
- claim scan result；
- security scan result；
- narrow allowed claim。

## Required Baseline Commands

实现阶段必须运行或记录稳定 blocked reason：

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
```

## Claim Scan

禁止把以下内容写成 ready claim：

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- automatic photo-to-2D ready for arbitrary cats；
- provider integration verified；
- low-retry provider reliability；
- 3D ready；
- production signed release ready；
- production release ready；
- Windows ready；
- cross-platform ready；
- MCP ready；
- Claude Code integration verified；
- OS-level Codex window binding ready；
- all Codex workflows verified。

这些短语只能出现在 forbidden、not-ready、must-not-claim、out-of-scope、claim-boundary 或 No-Go 语境。

## Security Scan

Evidence 不得包含：

- token；
- Authorization；
- raw provider payload；
- raw provider response；
- raw prompt；
- raw JSONL；
- raw command text；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- workspace path；
- config path；
- `api-token.json` contents；
- original private filename。

## Visual Evidence Checklist

涉及动作资产或产品体验的阶段必须包含至少一种真实视觉证据：

- contact sheet；
- GIF 或等效播放；
- frame sequence thumbnail；
- application screenshot；
- HTML report with embedded screenshots。

文字说明不能替代视觉证据。
