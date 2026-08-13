# Workflow 01 — Strategy alignment implementation spec

> [CX] Draft started: 2026-08-13  
> Status: implementation input; methods and fixtures still require domain review.

## Outcome

Transform a project objective and traceable environmental evidence into a sequence of strategic choices, a value logic, measurable objectives, and an owned roadmap. A checked completion circle is not sufficient evidence of this outcome.

## Handoff chain

| Order | Tool | Required method upgrade | Completion and handoff |
|---|---|---|---|
| 1 | SWOT analysis | Every item carries evidence kind, source, owner and review date; conclusion names a strategic implication rather than repeating the list | At least one evidenced item in each applicable quadrant and one prioritized implication; passes implication to landscape map |
| 2 | Landscape map | Axis definitions state unit/direction; each plotted alternative has a source; distinguish competitor, substitute and own offer | At least three comparable alternatives or a recorded non-applicable reason; passes defensible gap/position to business model |
| 3 | Business model canvas | Each block records assumptions and dependencies; revenue and cost statements identify unit/economic basis | Required blocks complete, contradictions identified, riskiest assumptions named; passes segment/channel/value choices to value proposition |
| 4 | Value proposition canvas | Customer jobs, pains and gains are ranked; each product response maps to an item rather than forming a separate list | At least one evidence-backed fit link and explicit unresolved mismatch; passes chosen promise and risk to OKR cascade |
| 5 | OKR cascade | Objective is qualitative; key results have baseline, target, unit, due date, owner and data source | No activity-only key result; each objective links to the chosen strategy; passes measurable outcomes to roadmap |
| 6 | Strategic roadmap | Initiatives have outcome link, owner, dependency, start/end window and decision gate | All committed initiatives map to a key result; dependencies have no unresolved cycle; produces the workflow deliverable |

## Project and evidence behavior

Each tool must read project schema v2 without copying sensitive fields. New evidence records use `fact`, `assumption`, or `to_verify`, require a source or explicit source-gap explanation, and write the creating tool path. Upstream handoff values remain editable and must retain their provenance.

## Business fixtures to add

1. **Valid sample:** a small B2B service with sourced market evidence, one explicit assumption, aligned OKRs, and a dependency-safe roadmap.
2. **Contradiction sample:** a value proposition targets one segment while the business model and OKR target another; the workflow must flag, not silently accept, the mismatch.
3. **Incomplete-evidence sample:** SWOT and landscape claims have no source; the workflow must remain below reviewed/release readiness.
4. **Roadmap-cycle sample:** initiative A depends on B and B depends on A; completion must fail with the cycle named.

Expected outcomes must be encoded in fixture JSON and asserted in browser or deterministic module tests before any of these six tools advances to `fixture`.

## First implementation batch

Begin with shared evidence attachment and workflow handoff primitives, then upgrade SWOT and landscape map together. Do not clone custom evidence logic into six pages. After those two pages pass valid and missing-source fixtures, continue in table order.
