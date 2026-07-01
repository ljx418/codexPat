# V40 Milestones

Date: 2026-06-29

| Milestone | Target | Exit Signal |
| --- | --- | --- |
| V40.0 Docs | V40 PRD, architecture, plan, drawio, acceptance, risk matrix aligned | document audit passed |
| V40.1 Blocked Baseline | GPU/Ollama summarized; ComfyUI blocked recorded | local tool smoke evidence |
| V40.1A Direct Runner Tools | Direct Local Runner dependency/model boundary verified or blocked | direct runner smoke evidence |
| V40.2 Contracts | safe run, output, and reason-code contracts defined in code | unit tests and scans passed |
| V40.3 Candidates | at least two tested samples produce or import no-WebUI candidates | candidate report and blocked sample evidence |
| V40.3R Recovery | direct img2img and identity-conditioned recovery are attempted after V40.3 failure | img2img failed; identity-conditioned blocked |
| V40.3R2 Recovery Planning | default to identity-runner repair; fallback to accepted same-sample import only with source/license evidence | documentation readiness and audit evidence |
| V40.3R3 Candidate Source Decision | choose accepted manual/import, materially different direct-runner route, or failed/blocked with V39 fallback | blocked scoped: `remain_failed_or_blocked` |
| V40.3R4 Candidate Source Replan | documentation-only route freeze after V40.3R3 blocked | selected constrained direct local runner route, predev audit, drawio sync, scans |
| V40.3R5 Direct Runner Predev Audit | prove selected route prerequisites before generation | source/license, sample matrix, model/control, mask/crop, identity/action controls, safe runner, visual rubric |
| V40.3R6 Controlled Candidate Frame Generation | generate bounded action-frame candidates and review against V39 | at least two explicit visual passes or stable failed/blocked reasons |
| V40.4 Packaging | accepted candidates normalize into safe asset packs | action coverage and safety tests passed |
| V40.5 Product Path | preview, target-only apply, and rollback work for accepted candidates | product smoke evidence |
| V40.6 Visual Evidence | Chinese HTML report compares V39 and V40 with screenshots | report opened and inspected |
| V40.7 Final Gate | scoped pass, blocked, or failed decision | final evidence with claim/security scan |

## No-Go Notes

V40.0, V40.1, and historical V40.1A WebUI blocked evidence do not prove Direct
Local Runner generation quality, V40 runtime product application,
arbitrary-photo readiness, Petdex parity, production readiness, Windows
readiness, cross-platform readiness, provider execution, Route B verification,
WebUI readiness, or ComfyUI readiness. V40.1A Direct Runner smoke proves only a
scoped readiness boundary. V40.3/V40.3R evidence proves that the attempted
generation routes did not yet produce acceptable high-quality action assets.
V40.3R3 has now confirmed that no credible candidate source was available at
that gate. V40.3R4 selects the constrained direct local runner route, V40.3R5
must prove its prerequisites, and V40.3R6 must produce at least two explicit
visual-review passes before V40.4 can start.
