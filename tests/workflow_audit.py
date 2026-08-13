#!/usr/bin/env python3
"""Validate the curated workflow surface against the canonical tool manifest."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = json.loads((ROOT / "data/tools.json").read_text(encoding="utf-8"))["tools"]
WORKFLOWS = json.loads((ROOT / "data/workflows.json").read_text(encoding="utf-8"))["workflows"]


def main() -> int:
    core = {tool["path"] for tool in TOOLS if tool["tier"] == "core"}
    assigned = [path for workflow in WORKFLOWS for path in workflow["tools"]]
    issues = []
    if len(WORKFLOWS) != 6:
        issues.append(f"expected 6 workflows, found {len(WORKFLOWS)}")
    duplicates = sorted({path for path in assigned if assigned.count(path) > 1})
    if duplicates:
        issues.append(f"duplicate workflow assignments: {', '.join(duplicates)}")
    missing = sorted(core - set(assigned))
    extra = sorted(set(assigned) - core)
    if missing:
        issues.append(f"unassigned core tools: {', '.join(missing)}")
    if extra:
        issues.append(f"non-core workflow tools: {', '.join(extra)}")
    for path in assigned:
        if not (ROOT / path).exists():
            issues.append(f"missing workflow page: {path}")
    if issues:
        print("Workflow audit: FAIL")
        print("\n".join(f"- {issue}" for issue in issues))
        return 1
    print(f"Workflow audit: PASS ({len(WORKFLOWS)} workflows, {len(core)} unique core tools)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
