# Workflow 01 — Strategy alignment implementation spec

> [CX] Draft started: 2026-08-13  
> Status: SWOT and landscape map at `fixture`; four remaining tools at `contract`. Domain review and customer samples remain incomplete.

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

## Method basis and provenance

The short `method` text in `data/core-tool-contracts.json` should stay operational. The durable source basis lives in `docs/WORKFLOW_01_METHOD_BASES.md`.

| Tool | Source-backed rules | Project inference | Rights / naming note |
|---|---|---|---|
| SWOT analysis | Separate internal and external factors; use the method for strategic planning and decision-making; use the four quadrants as a revisable structure. | Record evidence kind, source, owner, and review date per item; collapse the result into one prioritized strategic implication; pass the implication to the next tool. | SWOT is a common framework name; no special reuse license was verified on the cited page during this review. |
| Competitive landscape map | Use two dimensions that matter to competition or buyer perception; plot rivals relative to each other; use the map to find clusters, closest rivals, and gaps. | Axis labels must include unit and direction; distinguish competitor, substitute, and own offer; require at least three comparable alternatives or state why the map is not applicable. | The Virginia Tech page is published under CC BY-NC-SA; keep attribution and do not imply that the combined tool is an official standard. |
| Business Model Canvas | Treat the canvas as a simplified business model representation; keep the nine building blocks together; use the canvas to design and challenge the model. | Record assumptions and dependencies in each block; name the unit or economic basis for revenue and cost; surface contradictions instead of hiding them. | Business Model Canvas is a Strategyzer-branded method name; cite Strategyzer and do not claim ownership of the framework. |
| Value Proposition Canvas | Start from customer jobs, pains, and gains; map how the offering relieves pain and creates gains; use the canvas to test fit. | Rank jobs/pains/gains; map each response to a specific customer item; preserve at least one unresolved mismatch as risk input. | Value Proposition Canvas is a Strategyzer-branded method name; cite Strategyzer and do not imply a reusable license was verified beyond the source pages. |
| OKR cascade | Keep objectives ambitious and outcome-oriented; keep key results measurable; use OKRs for alignment rather than as a task list. | Every objective needs baseline, target, unit, due date, owner, and data source; activity-only KRs are invalid; each objective must trace back to the chosen strategy. | OKR is a common management framework name; the cited sources describe the method, but no special trademark or reuse restriction was verified here. |
| Strategic roadmap | Present a plan of action over time; keep teams aligned on short- and long-term goals; update the roadmap when priorities shift. | Every initiative needs an outcome link, owner, dependency, and start/end window; every committed initiative must map to an OKR key result; dependency cycles are invalid. | Roadmap is a common planning term; the Atlassian page is used as the method reference for this workflow. |

## Project and evidence behavior

Each tool must read project schema v2 without copying sensitive fields. New evidence records use `fact`, `assumption`, or `to_verify`, require a source or explicit source-gap explanation, and write the creating tool path. Upstream handoff values remain editable and must retain their provenance.

## Business fixtures and operating evidence

1. **Valid sample:** a small B2B service with sourced market evidence, one explicit assumption, aligned OKRs, and a dependency-safe roadmap.
2. **Contradiction sample:** a value proposition targets one segment while the business model and OKR target another; the workflow must flag, not silently accept, the mismatch.
3. **Incomplete-evidence sample:** SWOT and landscape claims have no source; the workflow must remain below reviewed/release readiness.
4. **Roadmap-cycle sample:** initiative A depends on B and B depends on A; completion must fail with the cycle named.

The four illustrative scenarios are encoded in `tests/fixtures/` and checked by `tests/workflow01_fixture_audit.py`. They validate the written rule contract, not page behavior. The internal operating record in `data/pilots/workflow01-marketing-toolbox-internal.json` applies all six contracts to one real internal product decision and is checked by `tests/workflow01_internal_pilot_audit.py`; it contains zero customer samples and has pending domain review. Page or deterministic shared-module behavior must produce the expected valid and boundary outcomes before any tool advances to `fixture`.

## Current implementation sequence

Shared evidence attachment and explicit workflow handoff primitives are implemented across all six pages. SWOT and landscape map now use one shared browser rule module, reproduce valid and missing-source fixture outcomes, and block invalid handoffs in the actual pages. Continue with business model and value proposition together, then OKR and roadmap. Do not clone validation logic into six pages, and do not promote readiness based only on the internal pilot or Python fixture audit.
