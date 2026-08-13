#!/usr/bin/env python3
"""Deterministic business-rule audit for Workflow 01 illustrative fixtures.

This verifies fixture contracts only. The fixtures contain no real customer
samples, so a successful process exit must not be interpreted as release or
business-method approval.
"""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
FIXTURE_DIR = ROOT / "tests" / "fixtures"
SCHEMA_PATH = ROOT / "data" / "workflow-fixture.schema.json"

TOOLS = {
    "swot-analysis": "strategy-toolkit/swot-analysis.html",
    "landscape-map": "strategy-toolkit/landscape-map.html",
    "business-model-canvas": "strategy-toolkit/business-model-canvas.html",
    "value-proposition": "strategy-toolkit/value-proposition.html",
    "okr-cascade": "strategy-toolkit/okr-cascade.html",
    "strategic-roadmap": "strategy-toolkit/strategic-roadmap.html",
}
SCENARIOS = {"valid", "contradiction", "missing-source", "roadmap-cycle"}
CANONICAL_WORKFLOW_EXPECTATIONS = {
    "valid": (True, ()),
    "contradiction": (False, ("segment_mismatch",)),
    "missing-source": (False, ("missing_source",)),
    "roadmap-cycle": (False, ("roadmap_dependency_cycle",)),
}
ISSUE_CODES = {
    "missing_required",
    "missing_source",
    "invalid_evidence_kind",
    "invalid_review_date",
    "insufficient_alternatives",
    "invalid_axis",
    "missing_economic_basis",
    "unranked_customer_item",
    "unmapped_response",
    "missing_fit_evidence",
    "activity_only_kr",
    "invalid_kr_metric",
    "segment_mismatch",
    "roadmap_unmapped_outcome",
    "roadmap_dependency_missing",
    "roadmap_dependency_cycle",
    "invalid_date_window",
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def nonempty(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def valid_date(value: object) -> bool:
    if not nonempty(value):
        return False
    try:
        date.fromisoformat(str(value))
    except ValueError:
        return False
    return True


def valid_source(value: object) -> bool:
    if not nonempty(value):
        return False
    parsed = urlparse(str(value))
    return parsed.scheme in {"https", "http"} and bool(parsed.netloc)


def evidence_issues(item: object, prefix: str) -> list[dict[str, str]]:
    if not isinstance(item, dict):
        return [{"code": "missing_required", "at": prefix}]
    issues: list[dict[str, str]] = []
    for key in ("statement", "owner"):
        if not nonempty(item.get(key)):
            issues.append({"code": "missing_required", "at": f"{prefix}.{key}"})
    if item.get("kind") not in {"fact", "assumption", "to_verify"}:
        issues.append({"code": "invalid_evidence_kind", "at": f"{prefix}.kind"})
    if not valid_date(item.get("reviewDate")):
        issues.append({"code": "invalid_review_date", "at": f"{prefix}.reviewDate"})
    if not valid_source(item.get("source")) and not nonempty(item.get("sourceGapReason")):
        issues.append({"code": "missing_source", "at": f"{prefix}.source"})
    return issues


def validate_swot(data: dict) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    quadrants = data.get("quadrants")
    if not isinstance(quadrants, dict):
        return [{"code": "missing_required", "at": "quadrants"}]
    for quadrant in ("strengths", "weaknesses", "opportunities", "threats"):
        items = quadrants.get(quadrant)
        if not isinstance(items, list) or not items:
            issues.append({"code": "missing_required", "at": f"quadrants.{quadrant}"})
            continue
        for index, item in enumerate(items):
            issues.extend(evidence_issues(item, f"quadrants.{quadrant}[{index}]"))
    if not nonempty(data.get("prioritizedImplication")):
        issues.append({"code": "missing_required", "at": "prioritizedImplication"})
    return issues


def validate_landscape(data: dict) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    axes = data.get("axes")
    if not isinstance(axes, dict):
        issues.append({"code": "invalid_axis", "at": "axes"})
    else:
        for name in ("x", "y"):
            axis = axes.get(name, {})
            if not all(nonempty(axis.get(key)) for key in ("label", "unit", "direction")):
                issues.append({"code": "invalid_axis", "at": f"axes.{name}"})
    alternatives = data.get("alternatives")
    if not isinstance(alternatives, list) or len(alternatives) < 3:
        issues.append({"code": "insufficient_alternatives", "at": "alternatives"})
    else:
        for index, item in enumerate(alternatives):
            if item.get("type") not in {"competitor", "substitute", "own_offer"}:
                issues.append({"code": "missing_required", "at": f"alternatives[{index}].type"})
            if not valid_source(item.get("source")) and not nonempty(item.get("sourceGapReason")):
                issues.append({"code": "missing_source", "at": f"alternatives[{index}].source"})
            for key in ("name", "x", "y"):
                if key not in item or item[key] == "":
                    issues.append({"code": "missing_required", "at": f"alternatives[{index}].{key}"})
    if not nonempty(data.get("defensibleGap")):
        issues.append({"code": "missing_required", "at": "defensibleGap"})
    return issues


def validate_bmc(data: dict) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    blocks = data.get("blocks")
    required_blocks = {
        "partners", "activities", "resources", "valuePropositions", "relationships",
        "channels", "customerSegments", "costStructure", "revenueStreams",
    }
    if not isinstance(blocks, dict):
        return [{"code": "missing_required", "at": "blocks"}]
    for name in sorted(required_blocks):
        if not isinstance(blocks.get(name), list) or not blocks[name]:
            issues.append({"code": "missing_required", "at": f"blocks.{name}"})
    for name in ("costStructure", "revenueStreams"):
        for index, item in enumerate(blocks.get(name, [])):
            if not nonempty(item.get("basis")):
                issues.append({"code": "missing_economic_basis", "at": f"blocks.{name}[{index}].basis"})
    if not nonempty(data.get("customerSegment")) or not nonempty(data.get("riskiestAssumption")):
        issues.append({"code": "missing_required", "at": "customerSegment/riskiestAssumption"})
    return issues


def validate_vpc(data: dict) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    if not nonempty(data.get("customerSegment")):
        issues.append({"code": "missing_required", "at": "customerSegment"})
    customer_ids: set[str] = set()
    for group in ("jobs", "pains", "gains"):
        values = data.get(group)
        if not isinstance(values, list) or not values:
            issues.append({"code": "missing_required", "at": group})
            continue
        for index, item in enumerate(values):
            if not nonempty(item.get("id")) or not isinstance(item.get("rank"), int) or item["rank"] < 1:
                issues.append({"code": "unranked_customer_item", "at": f"{group}[{index}]"})
            else:
                customer_ids.add(item["id"])
    responses = data.get("responses")
    if not isinstance(responses, list) or not responses:
        issues.append({"code": "missing_required", "at": "responses"})
    else:
        for index, response in enumerate(responses):
            target = response.get("mapsTo")
            if target not in customer_ids:
                issues.append({"code": "unmapped_response", "at": f"responses[{index}].mapsTo"})
    links = data.get("fitLinks")
    if not isinstance(links, list) or not any(nonempty(link.get("evidenceId")) for link in links):
        issues.append({"code": "missing_fit_evidence", "at": "fitLinks"})
    if not nonempty(data.get("unresolvedMismatch")):
        issues.append({"code": "missing_required", "at": "unresolvedMismatch"})
    return issues


def validate_okr(data: dict) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    for key in ("customerSegment", "objective", "strategyLink"):
        if not nonempty(data.get(key)):
            issues.append({"code": "missing_required", "at": key})
    key_results = data.get("keyResults")
    if not isinstance(key_results, list) or not key_results:
        return issues + [{"code": "missing_required", "at": "keyResults"}]
    for index, kr in enumerate(key_results):
        prefix = f"keyResults[{index}]"
        if kr.get("kind") != "outcome":
            issues.append({"code": "activity_only_kr", "at": f"{prefix}.kind"})
        required = ("id", "baseline", "target", "unit", "dueDate", "owner", "source")
        if any(kr.get(key) in (None, "") for key in required) or not valid_date(kr.get("dueDate")):
            issues.append({"code": "invalid_kr_metric", "at": prefix})
    return issues


def dependency_cycles(initiatives: list[dict]) -> list[list[str]]:
    graph = {item.get("id"): list(item.get("dependencies", [])) for item in initiatives if nonempty(item.get("id"))}
    cycles: list[list[str]] = []
    visiting: list[str] = []
    visited: set[str] = set()

    def walk(node: str) -> None:
        if node in visiting:
            start = visiting.index(node)
            cycles.append(visiting[start:] + [node])
            return
        if node in visited or node not in graph:
            return
        visiting.append(node)
        for dependency in graph[node]:
            walk(dependency)
        visiting.pop()
        visited.add(node)

    for node in graph:
        walk(node)
    return cycles


def validate_roadmap(data: dict, kr_ids: set[str]) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    initiatives = data.get("initiatives")
    if not isinstance(initiatives, list) or not initiatives:
        return [{"code": "missing_required", "at": "initiatives"}]
    ids = {item.get("id") for item in initiatives if nonempty(item.get("id"))}
    for index, item in enumerate(initiatives):
        prefix = f"initiatives[{index}]"
        for key in ("id", "owner", "startDate", "endDate", "decisionGate"):
            if not nonempty(item.get(key)):
                issues.append({"code": "missing_required", "at": f"{prefix}.{key}"})
        if item.get("outcomeLink") not in kr_ids:
            issues.append({"code": "roadmap_unmapped_outcome", "at": f"{prefix}.outcomeLink"})
        for dependency in item.get("dependencies", []):
            if dependency not in ids:
                issues.append({"code": "roadmap_dependency_missing", "at": f"{prefix}.dependencies"})
        if valid_date(item.get("startDate")) and valid_date(item.get("endDate")):
            if item["startDate"] > item["endDate"]:
                issues.append({"code": "invalid_date_window", "at": prefix})
    for cycle in dependency_cycles(initiatives):
        issues.append({"code": "roadmap_dependency_cycle", "at": " -> ".join(cycle)})
    return issues


VALIDATORS = {
    TOOLS["swot-analysis"]: validate_swot,
    TOOLS["landscape-map"]: validate_landscape,
    TOOLS["business-model-canvas"]: validate_bmc,
    TOOLS["value-proposition"]: validate_vpc,
    TOOLS["okr-cascade"]: validate_okr,
}


def codes(issues: list[dict[str, str]]) -> list[str]:
    return sorted({issue["code"] for issue in issues})


def load_fixtures() -> dict[str, dict]:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    require(schema.get("$schema", "").endswith("2020-12/schema"), "fixture schema must use JSON Schema 2020-12")
    require(schema["properties"]["provenance"]["properties"]["realCustomerSamples"]["const"] == 0,
            "fixture schema must lock real customer samples to zero")
    fixtures: dict[str, dict] = {}
    for stem, tool_path in TOOLS.items():
        path = FIXTURE_DIR / f"{stem}.json"
        require(path.is_file(), f"missing readiness fixture signal: {path.relative_to(ROOT)}")
        fixture = json.loads(path.read_text(encoding="utf-8"))
        require(fixture.get("schemaVersion") == 1, f"{path.name}: schemaVersion must be 1")
        require(fixture.get("workflowId") == "strategy-alignment", f"{path.name}: wrong workflowId")
        require(fixture.get("toolPath") == tool_path, f"{path.name}: wrong toolPath")
        provenance = fixture.get("provenance", {})
        require(provenance.get("classification") == "illustrative_synthetic", f"{path.name}: provenance must be illustrative_synthetic")
        require(provenance.get("realCustomerSamples") == 0, f"{path.name}: fixtures must declare zero real customer samples")
        require(nonempty(provenance.get("disclosure")) and len(provenance["disclosure"]) >= 20,
                f"{path.name}: disclosure is missing")
        cases = fixture.get("cases")
        require(isinstance(cases, list), f"{path.name}: cases must be an array")
        by_id = {case.get("id"): case for case in cases}
        require(set(by_id) == SCENARIOS and len(by_id) == len(cases), f"{path.name}: scenarios must be exactly {sorted(SCENARIOS)}")
        fixtures[tool_path] = fixture
    return fixtures


def main() -> int:
    fixtures = load_fixtures()
    cases_by_tool = {
        tool: {case["id"]: case for case in fixture["cases"]}
        for tool, fixture in fixtures.items()
    }
    for scenario in sorted(SCENARIOS):
        tool_issues: dict[str, list[dict[str, str]]] = {}
        okr_input = cases_by_tool[TOOLS["okr-cascade"]][scenario]["input"]
        kr_ids = {kr.get("id") for kr in okr_input.get("keyResults", []) if nonempty(kr.get("id"))}
        for tool, by_scenario in cases_by_tool.items():
            case = by_scenario[scenario]
            validator = VALIDATORS.get(tool)
            issues = validate_roadmap(case["input"], kr_ids) if tool == TOOLS["strategic-roadmap"] else validator(case["input"])
            tool_issues[tool] = issues
            expected = case.get("expected", {})
            require(expected.get("toolComplete") is (not issues), f"{tool}:{scenario}: toolComplete mismatch; issues={issues}")
            require(sorted(expected.get("toolIssueCodes", [])) == codes(issues), f"{tool}:{scenario}: toolIssueCodes mismatch; issues={issues}")
            require(set(expected.get("toolIssueCodes", [])) <= ISSUE_CODES, f"{tool}:{scenario}: unknown expected issue code")
            required_tool_codes: list[str] = []
            if scenario == "missing-source" and tool in {
                TOOLS["swot-analysis"], TOOLS["landscape-map"]
            }:
                required_tool_codes = ["missing_source"]
            elif scenario == "roadmap-cycle" and tool == TOOLS["strategic-roadmap"]:
                required_tool_codes = ["roadmap_dependency_cycle"]
            require(
                codes(issues) == required_tool_codes,
                f"{tool}:{scenario}: required targeted issue placement mismatch; issues={issues}",
            )

        bmc_segment = cases_by_tool[TOOLS["business-model-canvas"]][scenario]["input"].get("customerSegment")
        vpc_segment = cases_by_tool[TOOLS["value-proposition"]][scenario]["input"].get("customerSegment")
        okr_segment = okr_input.get("customerSegment")
        cross_issues: list[dict[str, str]] = []
        if len({bmc_segment, vpc_segment, okr_segment}) > 1:
            cross_issues.append({"code": "segment_mismatch", "at": "bmc/vpc/okr.customerSegment"})

        workflow_issues = [issue for issues in tool_issues.values() for issue in issues] + cross_issues
        workflow_codes = codes(workflow_issues)
        expected_pairs = {
            (
                case["expected"].get("workflowComplete"),
                tuple(sorted(case["expected"].get("workflowIssueCodes", []))),
            )
            for by_scenario in cases_by_tool.values()
            for case in [by_scenario[scenario]]
        }
        require(len(expected_pairs) == 1, f"{scenario}: workflow expectations disagree across fixture files")
        expected_complete, expected_codes = expected_pairs.pop()
        require(
            (expected_complete, expected_codes) == CANONICAL_WORKFLOW_EXPECTATIONS[scenario],
            f"{scenario}: fixture expectation does not match the required scenario outcome",
        )
        require(expected_complete is (not workflow_issues), f"{scenario}: workflowComplete mismatch; issues={workflow_issues}")
        require(list(expected_codes) == workflow_codes, f"{scenario}: workflowIssueCodes mismatch; issues={workflow_issues}")

    print(
        "Workflow 01 fixture audit: OK "
        "(6 tools, 4 deterministic illustrative scenarios, real_customer_samples=0); "
        "business_release=BLOCKED"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, KeyError, TypeError, json.JSONDecodeError) as error:
        print(f"Workflow 01 fixture audit: FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
