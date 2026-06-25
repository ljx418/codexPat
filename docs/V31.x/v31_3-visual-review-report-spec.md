# V31.3 Visual Review Report Spec

文档状态：planned execution spec；V31.3 entry document。
当前日期：2026-06-24。

## Purpose

V31.3 defines the HTML report that humans use to judge whether a 2D action
asset is actually good enough. Because V31 is a visual product-quality stage,
text-only reports are not acceptable.

## Required Report Output

Create future evidence as:

```text
docs/V31.x/evidence/v31_3-visual-review-report-YYYY-MM-DD.html
```

The HTML report must be self-contained enough for audit. It may reference local
evidence assets if paths are repository-relative and safe.

## Required Sections

| Section | Purpose |
| --- | --- |
| Executive decision | `passed scoped`, `partial`, `blocked`, or `failed`. |
| Target experience | Shows what the user should see after V31 succeeds. |
| Current vs candidate | Shows simplified SVG/weak baseline beside V31 candidate. |
| 8-action gallery | Shows all core actions with names and thumbnails. |
| Contact sheets | Shows frames for each action. |
| Playback samples | Shows animation playback or screenshot sequence at 1x and 0.75x. |
| QA table | Shows semantic QA, art QA, identity, timing, readability, license. |
| Apply/rollback evidence | Shows target-only apply and rollback outcome. |
| Claim/security scan | Shows scan commands and sanitized results. |

## Screenshot Requirements

Each accepted report must include visual evidence for:

- idle;
- thinking;
- running;
- success;
- warning;
- error;
- need_input;
- sleeping;
- old placeholder or transform-only rejection;
- target preview/apply/rollback state.

## Human Review Rules

The reviewer must be able to decide within one page scroll sequence:

- whether the cat looks polished or still placeholder-like;
- whether running/success/error/need_input have strong action-specific poses;
- whether the asset reads at small desktop-pet scale;
- whether failed assets were blocked;
- whether the claim boundary is narrow.

## Pass / Block / Fail

- Pass: the HTML report embeds real screenshots/contact sheets/playback and
  ties them to QA decisions.
- Blocked: screenshot tooling or app rendering is unavailable and the report
  records stable environment reasons.
- Failed: report is mostly text, uses missing image links, hides failed assets,
  or overclaims readiness.

## Privacy Boundary

The report must not expose raw user photos, EXIF/GPS, full local paths, tokens,
Authorization headers, raw provider responses, raw prompts, or private file
names.
