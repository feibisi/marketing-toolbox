#!/usr/bin/env python3
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class ShellParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.body = {}
        self.main = {}
        self.in_main = 0
        self.panel_inside_main = False
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "body": self.body = values
        if tag == "main":
            self.main = values
            self.in_main += 1
        if self.in_main and "workflow-panel-shell" in values.get("class", "").split():
            self.panel_inside_main = True
    def handle_endtag(self, tag):
        if tag == "main" and self.in_main: self.in_main -= 1

manifest = json.loads((ROOT / "data/tools.json").read_text())["tools"]
contracts = json.loads((ROOT / "data/tool-design-contracts.json").read_text())["tools"]
paths = [item["path"] for item in manifest]
contract_paths = [item["path"] for item in contracts]
errors = []
if len(contract_paths) != len(set(contract_paths)): errors.append("duplicate contract path")
if set(paths) != set(contract_paths): errors.append("contract coverage differs from tools manifest")

declared = 0
for item in contracts:
    if item["kind"] == "legacy-unclassified":
        if item["migration_status"] != "legacy-unclassified": errors.append(f"{item['path']}: invalid legacy status")
        continue
    declared += 1
    if item.get("paper") is None or item.get("output") is None: errors.append(f"{item['path']}: missing paper/output")
    parser = ShellParser(); parser.feed((ROOT / item["path"]).read_text())
    if parser.body.get("data-tool-kind") != item["kind"]: errors.append(f"{item['path']}: body kind mismatch")
    if parser.main.get("data-output-format") != item["output"]: errors.append(f"{item['path']}: output mismatch")
    if parser.panel_inside_main: errors.append(f"{item['path']}: workflow panel is inside paper")
    if item["kind"] == "fixed-canvas" and item["output"] != "single-sheet": errors.append(f"{item['path']}: fixed canvas must be single sheet")

if declared != 6: errors.append(f"expected 6 declared reference tools, got {declared}")
if errors:
    raise SystemExit("FAIL design contract:\n- " + "\n- ".join(errors))
print(f"PASS design contract: {len(contracts)} covered / {declared} declared / {len(contracts)-declared} legacy-unclassified")
