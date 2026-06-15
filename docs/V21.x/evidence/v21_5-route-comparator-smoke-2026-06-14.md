# V21.5 Route Comparator Evidence

status: passed
date: 2026-06-14

## Scope

V21.5 generates a side-by-side visual comparator for route outputs and route
decisions. It does not apply packs or mark V21 final passed.

## Results

| Check | Result | Details |
| --- | --- | --- |
| Route A evidence exists | passed | route_a_passed |
| Route B evidence exists | passed | provider preflight evidence present |
| Route C evidence exists | passed | route_c_passed |
| Route D evidence exists | passed | video route decision evidence present |
| at least one visual route output exists | passed | V21.5 requires route output or all explicit blocked/excluded |
| visual evidence embedded | passed | HTML embeds contact sheets as data URLs |
| security scan | passed | no token, Authorization, raw provider response, full local path, prompt private text |
| claim scan | passed | comparator does not imply V21 final passed |

## Route Summary

| Route | Status | Notes |
| --- | --- | --- |
| Route A | passed | route_a_passed |
| Route B | passed | capability review only; no live smoke |
| Route C | passed | route_c_passed |
| Route D | excluded | no safe video source |

## HTML Evidence

`docs/V21.x/evidence/v21_5-route-comparator-report-2026-06-14.html`

## Allowed Claim

V21 route comparator passed with embedded visual evidence for tested Route A and Route C outputs.

## Forbidden Claims

- V21 final passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
