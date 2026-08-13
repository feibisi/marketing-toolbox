# Visual stabilization plan

> [CX] Started: 2026-08-13

## Decision

Visual stabilization is inserted before workflow feature deepening. Work is risk-tiered: shared layout roots first, then the 30 supported core canvases, then blocking defects in the 114 extension canvases. A page-open smoke test is not visual evidence.

## Execution order

### V0 — Inventory and reproducible evidence

1. Measure all 144 published tools at 1440×1000 and 390×844.
2. Measure the 30 core tools under print media.
3. Capture desktop and mobile screenshots for the 30 core tools.
4. Record horizontal overflow, clipped editable controls, clipped paper containers, toolbar overflow/overlap, page errors and local HTTP failures.
5. Classify results as blocker, high, medium, low, or false positive with a stated reason.

### V1 — Shared root fixes

Repair shared causes in this order:

1. paper sizing and `overflow` policy;
2. body/main centering and long-content growth;
3. reusable grid and flex minimum sizing;
4. floating toolbar wrapping, safe-area spacing and content clearance;
5. contenteditable wrapping and minimum heights;
6. print page size, orientation, pagination and clipping;
7. theme and zoom interactions.

Every shared change must be checked against all 144 pages; a local fix that regresses another toolkit is rejected.

### V2 — Core canvas acceptance

Process the 30 core canvases in workflow order. Each canvas requires:

- desktop 1440×1000;
- tablet 1024×768;
- mobile 390×844;
- empty content and long-content fixtures;
- 80%, 100%, 125% browser-scale-equivalent viewport checks;
- toolbar visible and hidden;
- print preview in its declared paper orientation;
- no clipped editable control, accidental body overflow, overlapping primary controls or unreadable text.

A screenshot is evidence of the rendered state, not proof of business correctness.

### V3 — Extension triage

The remaining 114 tools receive automated layout measurement. Fix immediately when navigation, input, result, save/export, or print is blocked. Cosmetic inconsistencies are grouped by toolkit and scheduled after the core workflows.

### V4 — Regression gate

- `npm run audit:layout` regenerates the audit and core screenshots.
- `npm run check:layout` compares current blocker metrics with the approved baseline.
- New blocker/high defects fail the gate.
- Approved exceptions require page, viewport, selector, reason, and review date.
- `npm run test:quality` remains green throughout.

## Boundaries

- Do not bulk-rewrite 144 page-specific styles without rendered comparison.
- Do not declare PASS from HTTP, DOM, or screenshot counts alone.
- Do not hide overflow merely to silence the audit.
- No deployment or production/cluster write is part of this phase.
