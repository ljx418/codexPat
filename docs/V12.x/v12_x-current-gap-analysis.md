# V12.x Current Gap Analysis

status: passed scoped
date: 2026-06-07

## Active Gap

```text
V11 living interaction accepted
  -> runtime capture HTML shows cat
  -> real desktop screenshot did not capture floating pet window
  -> V12 made visibility and evidence trustworthy for tested local macOS scenarios
```

## Gap Table

| Gap | Current | Target | Phase | Risk |
| --- | --- | --- | --- | --- |
| Real desktop screenshot | attempted screenshot did not show cat | screenshot visibly contains cat | V12.3 | closed scoped |
| Visibility diagnostics | list API says visible but screenshot disagrees | diagnostic reasonCode explains mismatch | V12.1 | closed scoped |
| Window layering | always-on-top exists in code but not proven by screenshot | re-show/focus/layer behavior proven | V12.2 | closed scoped |
| First-run visual proof | first-run HTML capture exists | first-run desktop screenshot exists | V12.4 | closed scoped |
| Multi-window/monitor | basic position exists | reset/hide/show/multi-pet isolation proven | V12.5 | closed scoped |
| Acceptance HTML | V11 summary had runtime screenshots after correction | V12 report embeds real desktop screenshots and labels evidence types | V12.6 | closed scoped |

## False-green Risks

| Risk | Level | Mitigation |
| --- | --- | --- |
| runtime HTML screenshot is mistaken for desktop proof | High | V12.6 labels screenshot type and V12.3 requires real desktop screenshot |
| visible flag is trusted despite invisible screen result | High | V12.1 diagnostics + V12.3 observed screenshot result |
| browser/terminal occlusion hides cat | Medium | V12.2 layering and focus tests |
| full-screen/Spaces behavior differs | Medium | document macOS limitation and tested scenario |
| screenshot contains sensitive desktop content | Medium | evidence redaction and crop/annotation policy |

## Go / No-Go

V12.1-V12.7: passed scoped.  
V12 final evidence: `docs/V12.x/v12_7-final-acceptance-report.md`.  
V12 HTML evidence: `docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-07.html`.
