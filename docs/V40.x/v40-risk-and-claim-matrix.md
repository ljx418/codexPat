# V40 Risk And Claim Matrix

Date: 2026-06-30

## Major Risks

| Risk | Impact | Closure Requirement |
| --- | --- | --- |
| ComfyUI not scriptable from WSL/repo | original route blocked | keep ComfyUI out of active V40 route |
| WebUI Aki API not reachable | WebUI route blocked | keep WebUI out of active V40 route |
| Direct Local Runner dependency missing | no local generation automation | V40.1A blocked or use explicit manual/import route |
| Local checkpoint not suitable for cat action assets | poor visual output | same-sample visual comparison fails |
| Prompt-only direct generation already failed | false retry loop | keep V40.3 failed and require a different recovery route |
| Direct img2img already failed visual target experience | false V40.4 unlock | keep V40.3R failed unless new accepted evidence exists |
| Identity-conditioned runner stack initially incompatible | no identity-preserving generation | V40.3R2 repaired generation compatibility but still failed visual review |
| V40.3R2 identity-conditioned output failed visual review | false V40.4 unlock | keep V40.4-V40.7 No-Go until a future route has two accepted same-sample candidates |
| Candidate-source decision repeats failed routes | more failed automation and false progress | V40.3R3 must choose accepted manual/import, a materially different direct-runner route, or failed/blocked |
| Host synthetic template GIF probe misread as asset readiness | false quality pass | label as process-only `generated_not_accepted` and require V40.3R4 route replan |
| V40.3R4 route replan under-specifies implementation controls | another failed route or false V40.4 unlock | require predev audit, sample rules, source/license rules, and explicit visual acceptance before code |
| Selected direct runner route lacks local model/control proof | wasted implementation or silent fallback to weak templates | require predev audit for model inventory, identity controls, action pose controls, and safe runner invocation |
| Manual/import assets lack source or license proof | cannot audit provenance | reject before implementation and keep V39 fallback |
| Ollama prompt review over-trusted | false pass | Ollama output may advise only, never approve |
| VRAM or runtime instability | flaky generation | record stable reason code and do not pass |
| Identity drift | output no longer matches source cat | reject candidate before product path |
| Asset looks better than V39 but still not lovable | target experience failure | human preference gate blocks or records failed evidence |
| Evidence leaks raw prompts/paths/photos | security failure | security scan blocks final gate |

## Allowed Claim After Full V40 Pass

Only if all V40 phases pass:

```text
V40 no-WebUI local 2D action asset generation passed scoped for tested
local/public cat samples with Direct Local Runner candidate generation or
explicit accepted import assets, local normalization, same-sample V39 comparison,
preview, target-only apply, rollback, visual evidence, and claim/security scans.
```

## Forbidden Claims

- Petdex parity achieved.
- Automatic photo-to-animation ready for arbitrary cats.
- Automatic photo-to-2D ready for arbitrary cats.
- Provider integration verified.
- Route B verified without real same-sample assets.
- 3D ready.
- Production signed release ready.
- Windows ready.
- Cross-platform ready.
- MCP ready.
- Claude Code integration verified.
- OS-level Codex window binding ready.
- All Codex workflows verified.

## Route Decision

V40 defaults to the no-WebUI Direct Local Runner route. Route A2++ remains the
baseline and fallback. Manual/professional import remains a fallback if the
direct runner is blocked and real source-bound same-sample assets are supplied
later.

Current route state:

- V40.3 prompt-only Direct Local Runner generation: failed.
- V40.3R direct img2img recovery: failed.
- V40.3R identity-conditioned runner: initially blocked by stack compatibility.
- V40.3R2 default route: compatibility repaired enough to generate real
  same-sample candidates and one bounded stylized retry.
- V40.3R2 result: failed explicit visual review; no generated candidate may
  enter normalization or product apply.
- V40.3R3 decision: blocked scoped with `remain_failed_or_blocked`.
- V40.3R4 decision: selected constrained `new_direct_runner_route_allowed`; code
  still cannot resume until direct-runner predev audit proves source, model,
  identity, action, and visual-review controls.
- Future fallback route: accepted same-sample manual/import assets only if
  source, license, sample binding, and visual acceptance evidence are supplied
  before implementation.
- V40.4-V40.7: No-Go until a future approved route produces at least two
  visually reviewed same-sample candidates.

## Residual Risk Assessment

The documentation can now support automated phase-by-phase development to a
truthful passed/blocked/failed decision. It cannot guarantee the target visual
quality because model compatibility, identity preservation, full-body action
semantics, and human visual preference are empirical gates.

Because identity-conditioned repair generated candidates but did not generate
accepted candidates, and because the host synthetic template GIF probe is not
accepted V40 evidence, V40.3R4 selects the constrained direct-runner route with
stronger action/identity controls. If the required controls cannot be proven in
predev audit, V40 should remain failed and V39 should remain
the product fallback.
