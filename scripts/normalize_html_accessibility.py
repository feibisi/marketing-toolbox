#!/usr/bin/env python3
"""Apply deterministic baseline labels and keyboard semantics to published HTML."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "data/tools.json").read_text(encoding="utf-8"))
PAGES = list(dict.fromkeys(
    [ROOT / "index.html", ROOT / "navigator.html", ROOT / "workflows.html", ROOT / "project.html", ROOT / "docs/index.html", ROOT / "docs/support.html", ROOT / "report-generator/index.html"]
    + sorted(ROOT.glob("*-toolkit/index.html"))
    + [ROOT / row["path"] for row in MANIFEST["tools"]]
))
ATTR_RE = re.compile(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", re.S)
CONTROL_RE = re.compile(r"<(input|textarea|select)\b[^>]*>", re.I | re.S)
BUTTON_RE = re.compile(r"<button\b[^>]*>", re.I | re.S)
CLICK_RE = re.compile(r"<([a-z][\w:-]*)\b[^>]*\bonclick\s*=\s*([\"']).*?\2[^>]*>", re.I | re.S)
NATIVE_CLICK = {"a", "button", "input", "select", "textarea", "summary"}


def attrs(tag: str) -> dict[str, str]:
    return {match.group(1).lower(): html.unescape(match.group(3)) for match in ATTR_RE.finditer(tag)}


def humanize(value: str) -> str:
    value = re.sub(r"^(?:e\.g\.?|例如|如)\s*[:：]?\s*", "", value, flags=re.I)
    value = re.sub(r"^(?:meta|param|input|field)[_-]", "", value, flags=re.I)
    value = re.sub(r"[_-]+", " ", value).strip()
    return value[:120]


def add_attributes(tag: str, additions: str) -> str:
    closing = "/>" if tag.rstrip().endswith("/>") else ">"
    body = tag.rstrip()[:-len(closing)].rstrip()
    return body + additions + closing


def label_for(tag_name: str, data: dict[str, str]) -> str:
    for key in ("placeholder", "title", "data-save-key", "name", "id"):
        if data.get(key):
            label = humanize(data[key])
            if label:
                return label
    if data.get("type") in {"checkbox", "radio"} and data.get("value"):
        return humanize(data["value"])
    return {"textarea": "Notes", "select": "Selection"}.get(tag_name.lower(), "Input field")


def inside_wrapping_label(source: str, position: int) -> bool:
    return source.rfind("<label", 0, position) > source.rfind("</label", 0, position)


def normalize(source: str) -> str:
    labels_for = set(re.findall(r"<label\b[^>]*\bfor=[\"']([^\"']+)", source, re.I))

    def control(match: re.Match[str]) -> str:
        tag = match.group(0)
        data = attrs(tag)
        if data.get("type", "").lower() == "hidden":
            return tag
        if data.get("aria-label") or data.get("aria-labelledby"):
            return tag
        if data.get("id") in labels_for or inside_wrapping_label(source, match.start()):
            return tag
        label = html.escape(label_for(match.group(1), data), quote=True)
        return add_attributes(tag, f' aria-label="{label}"')

    source = CONTROL_RE.sub(control, source)

    def button(match: re.Match[str]) -> str:
        tag = match.group(0)
        return tag if "type" in attrs(tag) else add_attributes(tag, ' type="button"')

    source = BUTTON_RE.sub(button, source)

    def clickable(match: re.Match[str]) -> str:
        tag_name = match.group(1).lower()
        tag = match.group(0)
        if tag_name in NATIVE_CLICK:
            return tag
        data = attrs(tag)
        additions = ""
        if not data.get("role"):
            additions += ' role="button"'
        if not data.get("tabindex"):
            additions += ' tabindex="0"'
        return add_attributes(tag, additions)

    return CLICK_RE.sub(clickable, source)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    pending = []
    for page in PAGES:
        source = page.read_text(encoding="utf-8")
        updated = normalize(source)
        if updated != source:
            pending.append(str(page.relative_to(ROOT)))
            if args.write:
                page.write_text(updated, encoding="utf-8")
    if pending and not args.write:
        print("Accessibility normalization: FAIL")
        print("\n".join(f"- {page}" for page in pending))
        return 1
    print(f"Accessibility normalization: PASS ({len(PAGES)} pages, changed {len(pending)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
