#!/usr/bin/env python3
"""Validate the real internal Workflow 01 operating pilot without treating it as customer evidence."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PILOT_PATH = ROOT / "data" / "pilots" / "workflow01-marketing-toolbox-internal.json"
FIXTURE_AUDIT_PATH = ROOT / "tests" / "workflow01_fixture_audit.py"

spec = importlib.util.spec_from_file_location("workflow01_fixture_audit", FIXTURE_AUDIT_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load Workflow 01 validators")
rules = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rules)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> int:
    pilot = json.loads(PILOT_PATH.read_text(encoding="utf-8"))
    project = pilot.get("project", {})
    require(pilot.get("schemaVersion") == 1, "schemaVersion must be 1")
    require(pilot.get("workflowId") == "strategy-alignment", "wrong workflowId")
    require(project.get("classification") == "internal_operational", "pilot must be internal_operational")
    require(project.get("businessOwnerCompanyId") == "co-modiqi", "wrong business owner company")
    require(project.get("brandId") == "brand-modiqi", "wrong brand")
    require(project.get("customerSample") is False, "internal pilot cannot be a customer sample")
    require(project.get("customerDataIncluded") is False, "customer data must not be included")
    require(project.get("domainReviewStatus") == "pending", "domain review must remain pending")

    tools = pilot.get("tools", {})
    require(set(tools) == set(rules.TOOLS.values()), "pilot must contain exactly the six Workflow 01 tools")
    okr = tools[rules.TOOLS["okr-cascade"]]
    kr_ids = {item.get("id") for item in okr.get("keyResults", []) if rules.nonempty(item.get("id"))}
    issues: dict[str, list[dict[str, str]]] = {}
    for tool_path, payload in tools.items():
        if tool_path == rules.TOOLS["strategic-roadmap"]:
            issues[tool_path] = rules.validate_roadmap(payload, kr_ids)
        else:
            issues[tool_path] = rules.VALIDATORS[tool_path](payload)
    require(not any(issues.values()), f"internal pilot method contract issues: {issues}")

    segments = {
        tools[rules.TOOLS["business-model-canvas"]].get("customerSegment"),
        tools[rules.TOOLS["value-proposition"]].get("customerSegment"),
        okr.get("customerSegment"),
    }
    require(len(segments) == 1, f"customer segment mismatch: {segments}")
    decision = pilot.get("decision", {})
    require(decision.get("status") == "continue_with_gates", "decision must remain gated")
    blocks = decision.get("blocks", [])
    require(isinstance(blocks, list) and len(blocks) >= 4, "decision must preserve explicit blocks")
    require(any("authorized customer sample" in item.lower() for item in blocks), "customer-sample block missing")

    print(
        "Workflow 01 internal pilot audit: PASS "
        "(1 real internal project, 6 tools, customer_samples=0, customer_data=0); "
        "domain_review=BLOCKED business_release=BLOCKED"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, KeyError, TypeError, json.JSONDecodeError) as error:
        print(f"Workflow 01 internal pilot audit: FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
