# V21.5 Route Comparator and Manager UX Spec

文档状态：planned UX / evidence spec。  
当前日期：2026-06-14。

## Goal

V21.5 必须把四条路线的真实结果收敛成用户能看懂的效果对比，而不是只输出日志。用户应能快速看出哪条路线可用、哪条路线失败、失败原因是什么、最终推荐哪条路线。

## Comparator Layout

Required sections:

1. Stage summary  
   V20 blocked reason, V21 purpose, final decision pending.

2. Sample inputs  
   Show safe thumbnails or safe summaries of the three cat photos. Do not display full path or private filename.

3. Route cards  
   Each route card must show:
   - route name；
   - status；
   - reasonCode；
   - output type；
   - action coverage；
   - QA pass/fail；
   - preview/contact sheet if available；
   - whether target apply is allowed。

4. Side-by-side action comparison  
   For every available route, show the 8 core actions.

5. Recommendation  
   Pick best route only if it passed common QA. Otherwise recommend V19 fallback.

## Manager UX Requirements

If a route passes and is surfaced in Desktop Manager:

- preview all 8 actions；
- show QA status and sanitized reasonCodes；
- apply button disabled unless QA passed；
- apply target picker required；
- rollback visible after apply；
- failed/blocked route cannot apply；
- default/unrelated pets remain unchanged。

## Evidence Requirements

Evidence file:

`docs/V21.x/evidence/v21_5-route-comparator-report-YYYY-MM-DD.html`

Must embed or display:

- route status table；
- at least contact sheet placeholders for blocked routes and real images for passed routes；
- QA summary；
- safe field list；
- final recommendation；
- no token / Authorization / raw provider response / full local path。

## Acceptance

V21.5 passes if:

- all four routes are represented；
- passed/blocked/failed/excluded are visually distinct；
- operator can compare actual outputs without reading raw logs；
- security scan passes。
