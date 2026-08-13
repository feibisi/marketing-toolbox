# Visual layout audit — 2026-08-13

> [CX] Geometry stabilization result: **PASS for the measured surface**. Visual and business acceptance boundaries remain explicit below.

## Scope and result

- 144 published tools measured at 1440×1000 desktop and 390×844 mobile.
- 30 core tools additionally measured under desktop print media.
- 60 regenerated core screenshots plus 12 workflow contact sheets under `artifacts/visual-audit/`.
- Total: 318 automated measurements; all 318 are clear.

| Surface | Clear | High | Blocker |
|---|---:|---:|---:|
| Desktop screen (144) | 144 | 0 | 0 |
| Mobile screen (144) | 144 | 0 | 0 |
| Core print (30) | 30 | 0 | 0 |

Canonical machine-readable evidence is `reports/visual-layout-audit.json`.

## Repairs completed

- Shared headers now recompose on narrow screens instead of forcing metadata outside the paper.
- The floating action toolbar is collapsed by default, viewport-contained and keyboard-labelled; expansion is covered by Playwright.
- The 30 core pages use reviewed page-level mobile compositions rather than a global scaling or overflow concealment rule.
- The four former print blockers — ROI calculator, brand messaging, technical SEO audit and strategic roadmap — now measure clear under print media; PDF spot checks confirmed readable A4/A3 pagination.
- The remaining 114 published tools were triaged by toolkit. Blocking screen defects were repaired with page-specific responsive layout, content growth, or locally scrollable wide-table treatment.

## Core workflow acceptance

All six workflows and all 30 unique core tools measure clear at desktop, mobile and print. The mobile suite also runs one geometry check per core tool and long-content growth checks for SWOT and landscape map.

| Workflow | Core tools | Desktop | Mobile | Print |
|---|---:|---:|---:|---:|
| 01 Strategy alignment | 6 | 6 clear | 6 clear | 6 clear |
| 02 Audience and positioning | 6 | 6 clear | 6 clear | 6 clear |
| 03 Brand narrative | 4 | 4 clear | 4 clear | 4 clear |
| 04 Content operations | 5 | 5 clear | 5 clear | 5 clear |
| 05 Acquisition and sales | 4 | 4 clear | 4 clear | 4 clear |
| 06 Measurement and growth | 5 | 5 clear | 5 clear | 5 clear |

## Regression gate

- `npm run check:layout` regenerates the full audit before comparing per-page severity with the reviewed baseline.
- `npm run test:quality` now includes `check:layout`; geometry regression can no longer be skipped by the normal local quality command.
- The previous debt baseline remains in `reports/visual-layout-baseline.json` for historical comparison; it is not a release claim.

## Boundaries

- PASS applies to Chromium geometry at the listed viewports and desktop print media, plus targeted screenshot/PDF review. It does not prove typography, contrast, semantic grouping, business correctness, or every long-content combination.
- Tablet, 80%/125% scale equivalents, Firefox, Safari, physical-device and assistive-technology review remain later acceptance work.
- The 114 extension tools received automated desktop/mobile triage and representative visual review, not 114 individual design sign-offs.
- No deployment or production/cluster change was performed.
