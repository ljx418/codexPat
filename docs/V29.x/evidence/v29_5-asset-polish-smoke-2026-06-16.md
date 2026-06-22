# V29.5 Asset Polish Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V29.5 verifies the polished local gallery asset baseline and install-history
semantics for tested local packs. It does not prove the V29.2 diverse photo
benchmark and does not start V29.6 final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
| at least 12 gallery entries | passed | 12 packs |
| all gallery packs have 8-action preview | passed | allPacksEightActionPreview=true |
| all accepted packs readable at 1x and 0.75x | passed | allPacksReadable=true |
| no blank/flash-frame accepted pack | passed | noFlashFrame=true |
| install history stores safe IDs | passed | {"safePackId":"premium-orange-tabby","targetInstanceId":"codex_target","previousPackId":"flagship-work-cat-v2","installedAtBucket":"recent","reasonCode":"install_history_recorded"} |
| too few packs are blocked | passed | gallery_entry_count_too_low |
| flash-frame pack is failed | passed | flash_frame_detected |
| asset polish target test passed | passed | asset-polish-install-history.test.ts and premium-cats-v1.test.ts passed |
| security scan | passed | safe pack IDs and summaries only |
| claim scan | passed | no forbidden ready claim |

## Asset Polish Summary

| Field | Value |
| --- | --- |
| status | passed |
| packCount | 12 |
| acceptedPackCount | 12 |
| allPacksEightActionPreview | true |
| allPacksReadable | true |
| noFlashFrame | true |
| reasonCodes | asset_polish_passed, install_history_ready |

## PRD / Spec Review

V29.5 satisfies the local gallery polish baseline: at least 12 curated local
packs, all with 8-action preview metadata, readability flags, no accepted
flash-frame condition, and safe install history. V29.2 remains blocked by sample
count, so V29.6 remains No-Go.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Too few gallery entries pass | High | gallery_entry_count_too_low blocks |
| Flash-frame accepted | High | flash_frame_detected fails |
| Install history stores paths | High | safe IDs only |
| Asset polish mistaken for stable photo generation | High | V29.2 remains blocked; no final claim |

## Allowed Claim

V29 polished gallery and asset install experience passed for tested local packs and install history scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- provider integration verified
- Petdex parity achieved beyond tested standards
- Petdex asset reuse authorization
- 3D ready
- production signed release ready
