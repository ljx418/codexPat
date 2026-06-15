# V10.4 Animated GLTF Clip Gate Smoke

Date: 2026-06-04

Status: excluded-for-animated-gltf-claim

Scope: validates static clip coverage detection and safe labeling only. No real animated GLB/GLTF fixture was used, so animated GLTF playback is excluded rather than passed.

| Check | Result | Details |
| --- | --- | --- |
| full accepted clips detected | passed | {"coverageState":"animated","reasonCode":"gltf_clip_present","acceptedClipCount":8,"ignoredClipCount":0,"missingClipCount":0} |
| unknown clips ignored | passed | {"coverageState":"fallback","reasonCode":"gltf_clip_missing","acceptedClipCount":2,"ignoredClipCount":1,"missingClipCount":6} |
| partial clips require fallback | passed | {"coverageState":"fallback","reasonCode":"gltf_clip_missing","acceptedClipCount":2,"ignoredClipCount":1,"missingClipCount":6} |
| static GLB/GLTF is not animated | passed | {"coverageState":"static","reasonCode":"gltf_static_or_partial","acceptedClipCount":0,"ignoredClipCount":0,"missingClipCount":8} |
| safe coverage output | passed | safe clip names and counts only |

Clip gate:
- Accepted clip names are limited to idle, thinking, running, success, warning, error, need_input, sleeping.
- Unknown clip names are ignored for claim purposes.
- Static GLB/GLTF is labeled static / partial and must not be labeled animated.
- Missing clips require visible fallback and cannot hide the cat.

Security boundary:
- Coverage output records safe counts and labels only.
- It does not include raw GLTF JSON chunk, source path, provider payload, prompt text, token, or Authorization header.

Allowed claim:
V10.4 animated GLTF clip gate detection and static/partial labeling completed.

Forbidden claim:
V10.4 animated GLTF playback passed is not made because no real animated GLTF runtime fixture was accepted.
