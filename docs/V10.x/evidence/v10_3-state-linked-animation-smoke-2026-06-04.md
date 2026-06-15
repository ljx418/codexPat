# V10.3 State-linked Runtime Animation Smoke

Date: 2026-06-04

Status: passed

Scope: validates CatState -> CatActionResolver -> bundled sprite-v3-animated runtime action coverage. Imported animated sprite path is explicitly excluded from this smoke and must not be claimed here.

| Check | Result | Details |
| --- | --- | --- |
| idle -> idle | passed | coverage=animated; frameCount=6 |
| idle visible animation | passed | frameCount=6 |
| thinking -> thinking | passed | coverage=animated; frameCount=6 |
| thinking visible animation | passed | frameCount=6 |
| running -> running | passed | coverage=animated; frameCount=6 |
| running visible animation | passed | frameCount=6 |
| success -> success | passed | coverage=animated; frameCount=3 |
| success visible animation | passed | frameCount=3 |
| warning -> warning | passed | coverage=animated; frameCount=3 |
| warning visible animation | passed | frameCount=3 |
| error -> error | passed | coverage=animated; frameCount=3 |
| error visible animation | passed | frameCount=3 |
| need_input -> need_input | passed | coverage=animated; frameCount=3 |
| need_input visible animation | passed | frameCount=3 |
| sleeping -> sleeping | passed | coverage=animated; frameCount=6 |
| sleeping visible animation | passed | frameCount=6 |
| success transient action | passed | {"loop":false,"priority":"transient","durationMs":2200} |
| success does not override active error | passed | error |
| success does not override active need_input | passed | need_input |
| target PetInstance only | passed | runtime renderer selection is per active manifest/profile; no default fallback route used |
| default and unrelated pets unchanged | passed | state-linked animation follows selected target renderer only |
| imported animated sprite path | passed | explicitly excluded from this smoke; bundled sprite-v3 runtime path is covered |

RuntimePlaybackModel:
- idle -> idle.
- thinking -> thinking.
- running -> running.
- success -> success transient, then runtime may return idle unless error / need_input priority blocks it.
- warning -> warning.
- error -> error.
- need_input -> need_input.
- sleeping -> sleeping.

Priority boundary:
- success does not override active error or need_input priority states.

Allowed claim:
V10.3 state-linked runtime animation passed for tested bundled sprite-v3-animated scenarios.
