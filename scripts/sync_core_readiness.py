#!/usr/bin/env python3
"""Generate or verify an honest readiness inventory for the canonical core tools."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOOLS_PATH = ROOT / "data/tools.json"
WORKFLOWS_PATH = ROOT / "data/workflows.json"
CONTRACTS_PATH = ROOT / "data/core-tool-contracts.json"
OUTPUT_PATH = ROOT / "data/core-readiness.json"
LEVELS = ["smoke", "contract", "fixture", "reviewed", "release"]
REVIEW_STATUSES = ["draft", "method-reviewed", "fixture-reviewed", "release-approved"]
REQUIRED_CONTRACT_FIELDS = {
    "path", "tool_id", "title", "workflow_id", "workflow_order",
    "business_question", "non_applicable_when", "required_inputs", "method",
    "deliverable", "completion_rule", "evidence_requirement", "upstream",
    "downstream", "validation_level", "review_status",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build() -> dict:
    tools = load(TOOLS_PATH)["tools"]
    workflows = load(WORKFLOWS_PATH)["workflows"]
    contracts = load(CONTRACTS_PATH)["contracts"]
    core = {tool["path"]: tool for tool in tools if tool["tier"] == "core"}
    workflow_for = {
        path: workflow["id"]
        for workflow in workflows
        for path in workflow["tools"]
    }
    contract_for = {contract["path"]: contract for contract in contracts}

    if len(contract_for) != len(contracts):
        raise ValueError("contract paths must be unique")
    if len({contract.get("tool_id") for contract in contracts}) != len(contracts):
        raise ValueError("contract tool_id values must be unique")
    if len({contract.get("business_question") for contract in contracts}) != len(contracts):
        raise ValueError("business questions must be specific and unique")

    if set(core) != set(workflow_for) or set(core) != set(contract_for):
        raise ValueError("core tools, workflow assignments, and contracts must contain the same paths")

    rows = []
    for path in sorted(core):
        page = ROOT / path
        source = page.read_text(encoding="utf-8", errors="replace")
        contract = contract_for[path]
        missing_fields = sorted(REQUIRED_CONTRACT_FIELDS - set(contract))
        if missing_fields:
            raise ValueError(f"{path}: missing contract fields: {', '.join(missing_fields)}")
        if contract["workflow_id"] != workflow_for[path]:
            raise ValueError(f"{path}: workflow mismatch")
        workflow = next(item for item in workflows if item["id"] == contract["workflow_id"])
        expected_order = workflow["tools"].index(path) + 1
        if contract["workflow_order"] != expected_order:
            raise ValueError(f"{path}: workflow_order must be {expected_order}")
        if contract["tool_id"] != core[path]["id"]:
            raise ValueError(f"{path}: tool_id mismatch")
        if contract["validation_level"] not in LEVELS:
            raise ValueError(f"{path}: invalid validation level")
        if contract["review_status"] not in REVIEW_STATUSES:
            raise ValueError(f"{path}: invalid review status")
        for key in ("title", "business_question", "non_applicable_when", "method", "deliverable", "completion_rule"):
            if not isinstance(contract[key], str) or not contract[key].strip():
                raise ValueError(f"{path}: {key} must be a non-empty string")
        for key in ("required_inputs", "evidence_requirement"):
            if not isinstance(contract[key], list) or not contract[key]:
                raise ValueError(f"{path}: {key} must be a non-empty list")
        if set(contract["evidence_requirement"]) != {"fact", "assumption", "to_verify"}:
            raise ValueError(f"{path}: evidence_requirement must contain fact, assumption, and to_verify")
        fixture_path = ROOT / "tests" / "fixtures" / (Path(path).stem + ".json")
        evidence_ui = "data-evidence-panel" in source
        handoff_ui = "data-workflow-panel" in source
        if LEVELS.index(contract["validation_level"]) >= LEVELS.index("contract"):
            if "待领域负责人复核" in contract["method"]:
                raise ValueError(f"{path}: contract validation requires an operational method")
        if LEVELS.index(contract["validation_level"]) >= LEVELS.index("fixture"):
            if not fixture_path.exists() or not evidence_ui or not handoff_ui:
                raise ValueError(f"{path}: fixture validation requires fixture, evidence UI, and workflow handoff UI")

        rows.append({
            "path": path,
            "tool_id": core[path]["id"],
            "workflow_id": workflow_for[path],
            "validation_level": contract["validation_level"],
            "review_status": contract["review_status"],
            "signals": {
                "shared_runtime": "new ModiqiApp(" in source,
                "persistable_fields": len(re.findall(r"\bdata-save-key=", source)),
                "form_controls": len(re.findall(r"<(?:input|textarea|select)\b", source, re.I)),
                "strategic_fields": len(re.findall(r"\bdata-strategic-id=", source)),
                "example_hook": bool(re.search(r"loadExample|examples\.js|示例|范例", source, re.I)),
                "evidence_ui": evidence_ui,
                "workflow_handoff_ui": handoff_ui,
                "business_fixture": fixture_path.exists(),
            },
        })

    summary = {level: sum(row["validation_level"] == level for row in rows) for level in LEVELS}
    return {
        "schema_version": 1,
        "source": "canonical core tools from data/tools.json",
        "summary": summary,
        "tools": rows,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--require-release", action="store_true")
    args = parser.parse_args()
    expected = build()

    if args.write:
        OUTPUT_PATH.write_text(json.dumps(expected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    elif not OUTPUT_PATH.exists() or load(OUTPUT_PATH) != expected:
        print("Core readiness inventory: FAIL (missing or stale; run with --write)")
        return 1

    total = len(expected["tools"])
    released = expected["summary"]["release"]
    print(f"Core readiness inventory: PASS ({total} tools; {released} release-ready)")
    print("Levels: " + ", ".join(f"{key}={value}" for key, value in expected["summary"].items()))
    if args.require_release and released != total:
        print(f"Release readiness: FAIL ({total - released} tools below release)")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
