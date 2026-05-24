# BetterMe Pilates Page Taxonomy

Updated: 2026-05-24

Current best evidence run: `exploration/runs/2026-05-24-112646`

## Page Type Overview

| Page type | Covered steps | Page signals | Main test focus |
| --- | --- | --- | --- |
| Entry / Age selection | 1 | Hero content, age groups, legal links | Age branching, legal links, entry CTA reachability |
| Informational page | 2, 7, 11, 15 | Copy plus `CONTINUE`, no answer options | Copy renders, continue works, refresh/back recovery |
| Single-select question | 3-6, 8-9, 12-13, 16-26, 34 | Question plus multiple mutually exclusive options | Selection state, navigation, option hit areas, branching stability |
| Multi-select question | 10, 14, 27-28 | `Choose all that apply` plus `NEXT STEP` | Empty submit blocking, multiple answers, `None` exclusivity |
| Unit input | 29-32 | cm/ft or kg/lbs switch, numeric input, `NEXT STEP` | Boundary values, unit conversion, validation messages, BMI/goal calculation |
| Health data consent | 29-30 | Health onboarding data checkbox | Unchecked blocking, checked CTA state, privacy link |
| Result / chart page | 33, 43 | BMI or weight graph, personalized name | Calculation display, chart rendering, name injection risk |
| Date selector | 35 | Calendar, month, weekdays | Valid date range, cross-month behavior, past date blocking |
| Loader | 36-39 | Percentage progress and plan-generation copy | Progress, timeout, refresh recovery, no accidental click targets |
| Email / name capture | 40-42 | Email and name inputs | Format validation, privacy copy, special characters, repeated submission |
| Discount | 44 | Scratch-card, discount percent, promo code | Scratch gesture, promo application, countdown, revisit behavior |
| Paywall | 45 | Plan cards, prices, countdown, `GET MY PLAN`, renewal copy | Price display, selected plan, renewal disclosure, safe checkout transition |
| Checkout surface | 46 | Embedded payment fields and TokenEx frames | Field presence, gateway blocking, no real payment submission |

## Main Path Page Sequence

1. Age entry: selected `Age: 30-39`.
2. Trust proof page: `Over 10 million people have chosen BetterMe`.
3. Main goal question.
4. Physical build question.
5. Dream body question.
6. Weight-change pattern.
7. Product value informational page.
8. Best-shape recency question.
9. Pilates experience question.
10. Target zones multi-select.
11. Full-body transformation informational page.
12. Flexibility question.
13. Stair breathing question.
14. Sensitive body areas multi-select.
15. Relaxation and stretching informational page.
16. Exercise frequency.
17. Walking frequency.
18. Work schedule.
19. Typical daily activity.
20. Energy level.
21. Water intake.
22. Sleep duration.
23. Breakfast time.
24. Lunch time.
25. Dinner time.
26. Diet type.
27. Bad habits multi-select.
28. Weight-gain life events multi-select.
29. Height input plus health data consent.
30. Height confirmation state.
31. Current weight input plus BMI display.
32. Goal weight input plus weight-loss percentage copy.
33. Wellness profile / BMI chart.
34. Important event question.
35. Event date selector.
36-39. Plan generation loader.
40-41. Email capture.
42. Name capture.
43. Plan-ready page with weight graph.
44. Scratch-card discount page.
45. Paywall.
46. Embedded checkout surface in safe probe mode.

## Generator Mapping

`pipeline/case-generator.js` maps observed pages into these generated types:

- `single_select`
- `multi_select`
- `health_consent_input`
- `unit_input`
- `email_input`
- `name_input`
- `loader`
- `discount`
- `paywall`
- `checkout_surface`
- `info`

The checkout classifier uses iframe/input metadata in addition to body text because card fields are hosted in TokenEx iframes.
