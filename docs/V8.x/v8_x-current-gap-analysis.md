# V8.x Current Gap Analysis

status: active
date: 2026-06-03

## Baseline

V7.0-V7.15 passed scoped for tested generated 2D and imported GLB/GLTF runtime
scenarios. V7 explicitly did not prove automatic photo-to-3D, provider
integration, broad 3D readiness, or production release readiness.

## Active V8 Gap

| Gap | Current | Target | V8 Owner |
| --- | --- | --- | --- |
| Real provider 3D output | V7 provider image smoke passed; real provider 3D output missing | named provider produces accepted 3D asset under explicit consent | V8.2 |
| Provider credential operations | V7 has feasibility boundary and dotenv use | redacted credential lifecycle, consent, cost/privacy/retention display | V8.1 / V8.6 |
| 3D normalization | local GLB/GLTF import accepted | provider output normalized into action-ready local pack | V8.3 |
| Action clip coverage | imported GLB runtime scenario accepted scoped | core actions mapped to clips or explicit fallbacks | V8.3 / V8.4 |
| Runtime 3D visual quality | scoped screenshots/nonblank accepted | provider-output visual QA, action clarity, scale, fallback, performance | V8.4 |
| Guided product UX | V7 guided workflow exists | one user-facing provider-backed photo-to-3D activation flow | V8.5 |
| Deletion / retention | asset delete exists; provider retention not productized | local deletion, remote retention explanation, diagnostic export boundary | V8.6 |
| Final claim basis | V7 final claim excludes automatic photo-to-3D | evidence-matched V8 final claim for named tested scenario | V8.7 |
| 3D rendering quality | V8.4 visual QA passed but model presentation was poor | camera, lighting, viewport normalization improve prototype GLB view | V8.8 |
| Animated 2D local assembly | V8.9 local assembler accepted scoped | local folder of action frames becomes validated animated sprite pack | V8.9 passed scoped |
| AI-assisted 2D action workflow | V8.10 prompt-only workflow accepted scoped | multi-frame action storyboard, prompt pack, and import checklist | V8.10 passed scoped |
| Animated 2D runtime QA | V8.11 visual QA accepted scoped | screenshots/recordings prove all core actions visibly animate and fallback safely | V8.11 passed scoped |

## No-Go Areas

V8 must not use provider image generation, fixture GLB import, or local sample
GLB rendering as evidence for automatic photo-to-3D. A photo-to-3D claim
requires real photo input, real named-provider 3D output, GLTF scan,
normalization, runtime mapping, visual QA, and final gate acceptance.

## Remaining High Risks

| Risk | Severity | Required Mitigation |
| --- | --- | --- |
| Provider output unavailable or not GLB/GLTF | High | V8.2 blocks; no fallback to fixture evidence |
| Provider credentials leak into logs/evidence | High | V8.1/V8.6 redaction scans before any provider smoke acceptance |
| External provider terms prohibit bundling/distribution | High | V8.2/V8.6 license and retention evidence required |
| GLTF contains external URI or oversized content | High | V8.3 deep scan rejects before activation |
| Missing action clips are hidden by generic idle mapping | High | V8.3/V8.4 must record explicit fallback coverage |
| Visual QA passes nonblank but user-visible cat is poor or off-canvas | High | V8.4 requires scale, bounding box, action readability, and operator review |
| Animated sprite local assembly is mistaken for AI generation | Medium | V8.9 claim is local frame-sequence assembly only |
| Prompt workflow is mistaken for provider execution | Medium | V8.10 has separate claims for prompt-only vs explicit-consent provider smoke |
| Multi-frame sprite failure leaves transparent cat | High | V8.11 requires corrupt/missing/deleted fallback to visible safe cat |

## Go / No-Go

V8.0-V8.11 are accepted scoped. Remaining work is post-V8 planning and closure
hygiene only. V8.11 does not claim provider execution or automatic
photo-to-animation from V8.10 prompt-only evidence.
