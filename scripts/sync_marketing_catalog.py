#!/usr/bin/env python3
"""Build the public marketing/content contract from product manifests."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOOLS_PATH = ROOT / "data" / "tools.json"
WORKFLOWS_PATH = ROOT / "data" / "workflows.json"
OUTPUT_PATH = ROOT / "data" / "marketing-catalog.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def build_catalog() -> dict:
    tools = load_json(TOOLS_PATH)["tools"]
    workflows = load_json(WORKFLOWS_PATH)["workflows"]
    workflow_by_tool: dict[str, list[str]] = {}
    for workflow in workflows:
        for tool_path in workflow["tools"]:
            workflow_by_tool.setdefault(tool_path, []).append(workflow["id"])

    tool_entries = []
    for tool in sorted(tools, key=lambda item: item["id"]):
        slug = Path(tool["path"]).stem
        tool_entries.append(
            {
                "tool_id": tool["id"],
                "title": tool["title"],
                "module": tool["module"],
                "tier": tool["tier"],
                "tool_path": tool["path"],
                "workflow_ids": workflow_by_tool.get(tool["path"], []),
                "resource_level": (
                    "authoritative" if tool["tier"] == "core" else "directory"
                ),
                "main_site_path": f"/tools/{tool['module']}/{slug}/",
                "publication_status": "planned",
                "review_status": "unreviewed",
            }
        )

    workflow_entries = [
        {
            "workflow_id": workflow["id"],
            "title": workflow["title"],
            "description": workflow["description"],
            "main_site_path": f"/workflows/{workflow['id']}/",
            "tool_ids": [
                next(tool["id"] for tool in tools if tool["path"] == path)
                for path in workflow["tools"]
            ],
            "publication_status": "planned",
            "review_status": "unreviewed",
        }
        for workflow in workflows
    ]

    return {
        "schema_version": 1,
        "generated_from": ["data/tools.json", "data/workflows.json"],
        "contract_scope": "public-catalog-only",
        "main_site": {
            "origin": "https://modiqi.com",
            "role": "acquisition-content-and-service-conversion",
        },
        "toolbox": {
            "runtime_origin": None,
            "role": "independent-local-first-application",
        },
        "tools": tool_entries,
        "workflows": workflow_entries,
    }


def serialize(value: dict) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    expected = serialize(build_catalog())
    if args.write:
        OUTPUT_PATH.write_text(expected, encoding="utf-8")
        print(f"WROTE {OUTPUT_PATH.relative_to(ROOT)}")
        return 0

    if not OUTPUT_PATH.exists() or OUTPUT_PATH.read_text(encoding="utf-8") != expected:
        print("FAIL data/marketing-catalog.json is missing or stale")
        print("Run: npm run marketing-catalog:write")
        return 1

    catalog = json.loads(expected)
    print(
        "PASS marketing catalog is current: "
        f"{len(catalog['tools'])} tools / {len(catalog['workflows'])} workflows"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
