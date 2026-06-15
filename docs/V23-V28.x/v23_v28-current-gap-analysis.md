# V23-V28 Current Gap Analysis

文档状态：planned gap analysis。  
当前日期：2026-06-15。

## Current Gap

V22 can reject bad assets, but the product does not yet reliably guide an
ordinary user from one cat photo to a usable animated 2D pet asset.

## Gap Table

| Gap | Current | Target | Owner |
| --- | --- | --- | --- |
| Photo suitability | user can provide poor source image | bad photos rejected before spend | V23 |
| Cat identity | provider/local routes may drift | stable trait summary and same-cat QA | V23/V25 |
| Generation route | route choice is experimental | orchestrated multi-route attempts | V24 |
| Motion quality | weak action can appear complete | amplitude/delta/loop QA required | V25 |
| Product preview | evidence exists, but user flow is fragmented | 8-action preview and confirmation | V26 |
| Retry guidance | failures are technical | user sees next best action | V27 |
| End-to-end UX | multiple scoped tracks | one wizard path with dashboard evidence | V28 |

## User Impact

Without V23-V28, users may still need manual steps and may not understand why
generation fails. After V23-V28, users should get a guided workflow with clear
photo requirements, route status, preview, apply, rollback, and failure advice.
