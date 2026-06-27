# V39.0 Documentation Readiness Evidence

Date: 2026-06-27

## Decision

Status: passed scoped for documentation readiness only.

V39.0 proves that the V39 PRD, target architecture, drawio, development plan,
acceptance plan, phase specs, implementation contract, claim matrix, and
evidence checklist are aligned enough to start V39.1. It does not prove V39
asset generation, product runtime integration, human preference quality, Route B
execution, provider execution, production release, Windows readiness, or
cross-platform readiness.

## PRD And Spec Review

- Active PRD: `docs/active/agent_desktop_pet_prd_v39.md`.
- Input baseline: V38 public-photo action asset scoped evidence.
- Controlling phase spec: `docs/V39.x/v39-phase-specs.md`.
- Controlling quality/risk spec:
  `docs/V39.x/v39-quality-rubric-and-risk-closure.md`.
- Target architecture: `docs/V39.x/v39-target-architecture.md`.
- Implementation contract: `docs/V39.x/v39-implementation-contract.md`.

Review result:

- V39 is correctly scoped to Route A2++ local characterized, part-based 2D
  action asset work for tested samples.
- V39 requires at least two different tested cat samples and one
  blocked/negative sample before final scoped pass.
- V39 explicitly rejects V38-style card, label, dot, border, and whole-image
  transform-only outputs as final target-experience assets.
- Route B is recorded only as a future same-sample comparison route and cannot
  pass without real source-bound assets.
- The docs do not state that V39 implementation evidence has already passed.

## Drawio Review

Command:

```bash
python3 - <<'PY'
import xml.etree.ElementTree as ET
p='docs/active/current-vs-target-gap.drawio'
root=ET.parse(p).getroot()
pages=[d.attrib.get('name','') for d in root.findall('diagram')]
print(len(pages))
for i,name in enumerate(pages,1): print(f'{i}. {name}')
PY
```

Result: passed.

Pages:

1. `1 V39目标体验与声明边界`
2. `2 V38当前实现问题与V39目标架构差异`
3. `3 代码实体与分层关系`
4. `4 单照片到角色化动作资产技术路径`
5. `5 A2++开发及阶段验收计划`
6. `6 用户场景与目标体验`
7. `7 项目里程碑与风险闭环`
8. `8 验收门槛与出门条件`

The drawio page count is exactly eight and the page names match the V39
documentation scope.

## Baseline Command Results

| Command | Result |
| --- | --- |
| `git diff --check` | passed |
| `pnpm --filter desktop test` | passed; 329 tests passed |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed; 71 tests passed |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| `node scripts/v38_7_final_gate_smoke.mjs` | passed; V38 final scoped baseline found |

V30 semantic animation gate result:

- transform-only weak baseline: failed as expected.
- semantic candidate: passed.
- claim scan: passed.
- security scan: passed.

V38 final gate result:

- status: passed scoped.
- passed public-photo packs: 3.
- sanitized passed count: 3.
- limitation retained: automated scoring checks artifact presence and local
  overlay contract only; human review remains required for final visual taste.

## Claim Scan

Command:

```bash
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|automatic photo-to-2D ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|production release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|OS-level Codex window binding ready|all Codex workflows verified|任意猫自动生成 ready|任意猫自动生成高质量动作资产" docs/active/agent_desktop_pet_prd_v39.md docs/V39.x docs/active/current-vs-target-gap.md docs/active/development-plan.md docs/active/acceptance-plan.md
```

Result: passed with context review.

Hits are limited to forbidden/not-ready claim context, historical baseline
context, or explicit must-not-claim language. No V39 document claims final
scoped pass, arbitrary-cat automation, Petdex parity, provider integration,
3D readiness, production readiness, Windows readiness, cross-platform readiness,
MCP readiness, Claude Code integration, OS-level Codex binding, or all-workflow
verification.

## Security Scan

Command:

```bash
rg -n -P '(?<![A-Za-z])sk-[A-Za-z0-9_-]{20,}|Bearer [A-Za-z0-9._-]{20,}|Authorization:\s*[A-Za-z0-9._-]{8,}|<local-workspace-path-pattern>' docs/V39.x docs/active/agent_desktop_pet_prd_v39.md docs/active/current-vs-target-gap.md docs/active/development-plan.md docs/active/acceptance-plan.md || true
```

Result: passed. No credential-like values or full local workspace paths were
found in the touched V39 documentation set.

## Audit Opinion

No fatal or major documentation risk remains for V39.1 entry.

Residual risks are implementation risks, not documentation blockers:

- Route A2++ may still produce assets that humans dislike.
- Local deterministic part-rig motion may remain stiff.
- Some public/safe samples may lack enough visible body parts for a character
  asset and must become blocked samples.
- Route B cannot be used as passed evidence until real same-sample,
  source-bound assets exist.

## Next Gate

Next phase: V39.1 target-experience visual rubric.

V39.1 must create executable checks that reject V38-style photo-card overlays,
visible labels, decorative dots, border-led motion, weak motion, unattractive
output, and whole-image transform-only candidates before any V39.2 character
asset contract work starts.
