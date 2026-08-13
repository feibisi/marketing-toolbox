#!/usr/bin/env python3
"""Static contract checks for project context schema v2 and its browser store."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
schema = json.loads((ROOT / "data/project-schema.json").read_text(encoding="utf-8"))
required = set(schema.get("required", []))
expected = {"schemaVersion", "id", "name", "stage", "evidence", "createdAt", "updatedAt"}
assert expected <= required, f"missing project required properties: {sorted(expected - required)}"
assert schema["properties"]["schemaVersion"]["const"] == 2
assert set(schema["properties"]["stage"]["enum"]) == {"discovery", "strategy", "execution", "measurement"}
evidence = schema["$defs"]["evidence"]
evidence_required = set(evidence["required"])
assert {"statement", "kind", "source", "status", "toolPath"} <= evidence_required
assert set(evidence["properties"]["kind"]["enum"]) == {"fact", "assumption", "to_verify"}
assert set(evidence["properties"]["status"]["enum"]) == {"draft", "confirmed", "rejected", "needs_review"}
store = (ROOT / "shared/js/project-store.js").read_text(encoding="utf-8")
for token in ("modiqi_project_context_v2", "modiqi_project_context_v1", "normalizeEvidence", "addEvidence", "removeEvidence"):
    assert token in store, f"project store missing {token}"
for page in ("project.html", "workflows.html"):
    source = (ROOT / page).read_text(encoding="utf-8")
    assert 'shared/js/project-store.js' in source, f"{page} does not load project store"
print("Project schema audit: PASS (schema v2, migration, evidence contract)")
