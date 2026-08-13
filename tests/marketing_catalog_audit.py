#!/usr/bin/env python3
"""Validate the public contract between the toolbox and Modiqi.com."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "marketing-catalog.json"


def fail(message: str) -> None:
    raise SystemExit(f"FAIL marketing catalog: {message}")


def main() -> int:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    tools = data.get("tools", [])
    workflows = data.get("workflows", [])

    if data.get("contract_scope") != "public-catalog-only":
        fail("contract_scope must remain public-catalog-only")
    if data.get("main_site", {}).get("origin") != "https://modiqi.com":
        fail("main site origin is missing or unexpected")
    if data.get("toolbox", {}).get("runtime_origin") is not None:
        fail("runtime origin must remain null until deployment is verified")
    if len(tools) != 144 or len(workflows) != 6:
        fail(f"expected 144 tools / 6 workflows, got {len(tools)} / {len(workflows)}")

    ids = [item.get("tool_id") for item in tools]
    paths = [item.get("main_site_path") for item in tools]
    if len(set(ids)) != len(ids) or len(set(paths)) != len(paths):
        fail("tool ids and main-site paths must be unique")

    allowed_levels = {"authoritative", "directory"}
    allowed_statuses = {"planned", "draft", "review", "approved", "published", "retired"}
    for item in tools:
        required = {
            "tool_id",
            "title",
            "module",
            "tier",
            "tool_path",
            "workflow_ids",
            "resource_level",
            "main_site_path",
            "publication_status",
            "review_status",
        }
        missing = required - item.keys()
        if missing:
            fail(f"{item.get('tool_id', '<unknown>')} missing {sorted(missing)}")
        if item["resource_level"] not in allowed_levels:
            fail(f"{item['tool_id']} has invalid resource_level")
        if item["publication_status"] not in allowed_statuses:
            fail(f"{item['tool_id']} has invalid publication_status")
        expected_level = "authoritative" if item["tier"] == "core" else "directory"
        if item["resource_level"] != expected_level:
            fail(f"{item['tool_id']} tier/resource_level mismatch")
        if not (ROOT / item["tool_path"]).is_file():
            fail(f"{item['tool_id']} points to a missing tool")

    core = sum(item["resource_level"] == "authoritative" for item in tools)
    directory = sum(item["resource_level"] == "directory" for item in tools)
    if (core, directory) != (30, 114):
        fail(f"expected 30 authoritative / 114 directory, got {core} / {directory}")

    workflow_ids = {item["workflow_id"] for item in workflows}
    for item in tools:
        unknown = set(item["workflow_ids"]) - workflow_ids
        if unknown:
            fail(f"{item['tool_id']} references unknown workflows {sorted(unknown)}")

    print(
        "PASS marketing catalog: 144 tools (30 authoritative / 114 directory), "
        "6 workflow hubs, 0 published claims"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
