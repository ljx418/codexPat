# V39 Quality Rubric And Risk Closure

Date: 2026-06-27

## Why This Exists

V38 proved a real public-photo evidence pipeline but did not prove user-loved assets. V39 must close that quality gap without pretending that documentation or technical renderability equals product appeal.

## Minimum Visual Rubric

| Dimension | Pass | Fail |
| --- | --- | --- |
| Character form | Cat reads as a clean standalone desktop pet character | Cat reads as a photo inside a card, test frame, or report tile |
| Identity | Source traits are visible and sample-specific | Different samples share the same character or lose key traits |
| Silhouette | Body outline is readable at desktop-pet size | Outline is muddy, cropped, or hidden by frame/background |
| Parts | Head, body, ears, paws, tail, and eyes/expression are represented when visible | No meaningful part separation or all parts are static decoration |
| Motion | Action changes come from body pose and local part motion | Action changes come mainly from border, label, dot, or whole-image transform |
| Appeal | Human reviewer can plausibly accept it as a desktop pet candidate | Human reviewer would reject it as ugly, test-like, or stiff |
| Product path | Approved candidate can preview, apply to target, and rollback | Failed candidate can apply or rollback cannot restore prior asset |

## Quantitative Floor For Automation

- Passing sample count: at least two different tested cat samples.
- Negative or blocked sample count: at least one.
- Action coverage: idle, walk, jump, sleep, eat, play, alert, celebrate.
- Frame count: at least eight frames per action; loop actions should prefer twelve frames when feasible.
- Local motion: every action must include at least one local part motion unless visibility constraints are documented.
- Identity reuse: cross-sample character asset reuse is a hard failure.
- Overlay rejection: visible labels, decorative dots, frame borders, or card containers cannot be the main evidence for action.

## Risk Closure Plan

| Risk | Closure Method | If Not Closed |
| --- | --- | --- |
| A2++ still looks like a photo-card overlay | V39.1 and V39.2 reject no-card/no-label failures | Fail V39.1/V39.2 and return to design |
| Motion remains stiff | V39.3 and V39.4 require part-local motion and action pose changes | Fail V39.4 or mark partial scoped |
| Human preference remains poor | V39 human preference gate can fail technically renderable candidates | No final scoped pass |
| Source visibility is insufficient | Record visibility-based blocked reason per part and sample | Sample blocked; does not count toward pass count |
| Route B unavailable | Record Route B blocked with no pass claim | A2++ can still pass scoped if all gates pass |
| Route A2++ cannot reach target quality | Stop at failed/partial scoped and recommend Route B or hybrid route | Do not claim target achieved |

## Route Options If A2++ Fails

| Route | What It Does | Advantages | Disadvantages |
| --- | --- | --- | --- |
| Route A2++ local characterized rig | Local deterministic character cleanup, part rig, and frame composer | Auditable, cheap, controllable, no provider claim | May hit a visual quality ceiling |
| Route B source-bound professional/provider-assisted assets | Real same-sample high-quality character and motion assets | Highest chance of human-liked output | Requires real assets, permission, cost, and separate verification |
| Hybrid A2++ plus manual art pass | Local rig plus manually supplied cleaned character layers | More realistic than pure local while keeping rig contract | Needs manual asset work and source-bound review |

## Development Go / No-Go

- Go to implementation only if V39.0 doc readiness passes and the drawio direction is accepted.
- Continue A2++ only while V39.1-V39.4 evidence shows the route can beat V38-style photo-card output.
- Stop for user decision if V39.1-V39.4 show that A2++ cannot produce a human-acceptable character asset.
