#!/usr/bin/env python3
"""Fail-closed structural checks for published marketing-toolbox pages."""

from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = json.loads((ROOT / "data" / "tools.json").read_text(encoding="utf-8"))
PUBLISHED = (
    [ROOT / "index.html", ROOT / "navigator.html", ROOT / "workflows.html", ROOT / "project.html", ROOT / "docs/index.html", ROOT / "docs/support.html", ROOT / "report-generator/index.html"]
    + sorted(ROOT.glob("*-toolkit/index.html"))
    + [ROOT / item["path"] for item in MANIFEST["tools"]]
)


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str, int]] = []
        self.ids: list[tuple[str, int]] = []
        self.controls = 0
        self.unlabelled = 0
        self.buttons_without_type = 0
        self.labels_for: set[str] = set()
        self.control_rows: list[tuple[str, dict[str, str], int]] = []
        self.label_depth = 0
        self.tool_links: list[tuple[str, int]] = []
        self.has_lang = False
        self.has_title = False
        self.has_viewport = False
        self.images_without_alt: list[int] = []
        self.inaccessible_clicks: list[int] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        if tag == "html" and data.get("lang"):
            self.has_lang = True
        if tag == "title":
            self.has_title = True
        if tag == "meta" and data.get("name", "").lower() == "viewport" and data.get("content"):
            self.has_viewport = True
        if data.get("id"):
            self.ids.append((data["id"], self.getpos()[0]))
        if tag == "label" and data.get("for"):
            self.labels_for.add(data["for"])
        if tag == "label":
            self.label_depth += 1
        if tag in {"a", "link"} and data.get("href"):
            self.references.append((tag, data["href"], self.getpos()[0]))
        if tag in {"script", "img"} and data.get("src"):
            self.references.append((tag, data["src"], self.getpos()[0]))
        if tag == "img" and "alt" not in data:
            self.images_without_alt.append(self.getpos()[0])
        if tag in {"input", "textarea", "select"} and data.get("type") != "hidden":
            self.controls += 1
            if self.label_depth:
                data["__wrapped_label"] = "true"
            self.control_rows.append((tag, data, self.getpos()[0]))
        if tag == "button" and not data.get("type"):
            self.buttons_without_type += 1
        if tag == "a" and data.get("href", "").endswith(".html"):
            self.tool_links.append((data["href"], self.getpos()[0]))
        if data.get("onclick") and tag not in {"a", "button", "input", "select", "textarea", "summary"}:
            if data.get("role") != "button" or data.get("tabindex") != "0":
                self.inaccessible_clicks.append(self.getpos()[0])

    def handle_endtag(self, tag: str) -> None:
        if tag == "label" and self.label_depth:
            self.label_depth -= 1


def main() -> int:
    issues: list[str] = []
    totals = {"pages": 0, "local_references": 0, "controls": 0}
    for page in PUBLISHED:
        if not page.exists():
            issues.append(f"missing manifest page: {page.relative_to(ROOT)}")
            continue
        totals["pages"] += 1
        parser = AuditParser()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))
        if not parser.has_lang:
            issues.append(f"missing document language: {page.relative_to(ROOT)}")
        if not parser.has_title:
            issues.append(f"missing title: {page.relative_to(ROOT)}")
        if not parser.has_viewport:
            issues.append(f"missing viewport: {page.relative_to(ROOT)}")
        for line in parser.images_without_alt:
            issues.append(f"image without alt: {page.relative_to(ROOT)}:{line}")
        for line in parser.inaccessible_clicks:
            issues.append(f"click target without keyboard semantics: {page.relative_to(ROOT)}:{line}")
        totals["controls"] += parser.controls
        seen: set[str] = set()
        for element_id, line in parser.ids:
            if element_id in seen:
                issues.append(f"duplicate id: {page.relative_to(ROOT)}:{line} #{element_id}")
            seen.add(element_id)
        for _, data, line in parser.control_rows:
            labelled = bool(data.get("aria-label") or data.get("aria-labelledby") or data.get("__wrapped_label") or (data.get("id") and data["id"] in parser.labels_for))
            if not labelled:
                issues.append(f"unlabelled control: {page.relative_to(ROOT)}:{line}")
        if parser.buttons_without_type:
            issues.append(f"buttons without type: {page.relative_to(ROOT)} ({parser.buttons_without_type})")
        if page.name == "index.html" and page.parent.name.endswith("-toolkit"):
            hrefs = [href for href, _ in parser.tool_links if not href.startswith(("../", "http://", "https://"))]
            for href in sorted(set(hrefs)):
                if hrefs.count(href) > 1:
                    issues.append(f"duplicate tool card: {page.relative_to(ROOT)} -> {href}")
        for _, value, line in parser.references:
            if value == "#":
                issues.append(f"placeholder link: {page.relative_to(ROOT)}:{line}")
                continue
            parsed = urlsplit(value)
            if parsed.scheme or value.startswith("//") or not parsed.path:
                continue
            totals["local_references"] += 1
            target = (page.parent / unquote(parsed.path)).resolve()
            if not target.exists():
                issues.append(f"missing reference: {page.relative_to(ROOT)}:{line} -> {value}")
        source = page.read_text(encoding="utf-8", errors="replace")
        if re.search(r'<script[^>]+src=["\'](?:https?:)?//', source, re.I):
            issues.append(f"remote executable script: {page.relative_to(ROOT)}")
    if issues:
        print(json.dumps({"status": "FAIL", "totals": totals, "issues": issues}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps({"status": "PASS", "totals": totals}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
