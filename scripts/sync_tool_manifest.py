#!/usr/bin/env python3
"""Build or verify the canonical marketing-toolbox page manifest."""

from __future__ import annotations

import argparse
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "data" / "tools.json"

CORE_PATHS = {
    "strategy-toolkit/swot-analysis.html",
    "strategy-toolkit/value-proposition.html",
    "strategy-toolkit/business-model-canvas.html",
    "strategy-toolkit/stp-canvas.html",
    "strategy-toolkit/gtm-strategy.html",
    "strategy-toolkit/landscape-map.html",
    "strategy-toolkit/okr-cascade.html",
    "strategy-toolkit/strategic-roadmap.html",
    "brand-toolkit/brand-positioning-map.html",
    "brand-toolkit/positioning-statement.html",
    "brand-toolkit/brand-messaging.html",
    "brand-toolkit/tone-voice.html",
    "brand-toolkit/brand-story.html",
    "customer-toolkit/user-persona.html",
    "behavior-toolkit/empathy-map.html",
    "behavior-toolkit/customer-journey.html",
    "brand-toolkit/jtbd-canvas.html",
    "content-toolkit/content-strategy-canvas.html",
    "content-toolkit/content-calendar.html",
    "content-toolkit/content-audit.html",
    "content-toolkit/content-performance.html",
    "analytics-toolkit/measurement-plan.html",
    "analytics-toolkit/funnel-diagnosis.html",
    "analytics-toolkit/roi-calculator.html",
    "analytics-toolkit/ab-test-planner.html",
    "analytics-toolkit/kpi-dashboard.html",
    "sales-toolkit/lead-scoring.html",
    "sales-toolkit/quote-calculator.html",
    "seo-toolkit/technical-seo-audit.html",
    "social-toolkit/utm-builder.html",
}


class TitleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.parts.append(data)


def page_title(path: Path) -> str:
    parser = TitleParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    return " ".join(" ".join(parser.parts).split()) or path.stem.replace("-", " ").title()


def discover() -> list[dict[str, str]]:
    pages: list[dict[str, str]] = []
    for path in sorted(ROOT.glob("*-toolkit/*.html")):
        if path.name == "index.html" or path.name.startswith("index_v"):
            continue
        rel = path.relative_to(ROOT).as_posix()
        pages.append(
            {
                "id": rel.removesuffix(".html").replace("/", ":"),
                "module": path.parent.name.removesuffix("-toolkit"),
                "path": rel,
                "title": page_title(path),
                "tier": "core" if rel in CORE_PATHS else "library",
                "status": "supported" if rel in CORE_PATHS else "legacy",
            }
        )
    return pages


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    discovered = discover()

    if args.write:
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(
            json.dumps({"schema_version": 1, "tools": discovered}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Wrote {len(discovered)} tools to {MANIFEST.relative_to(ROOT)}")
        return 0

    if not MANIFEST.exists():
        print("FAIL: data/tools.json is missing")
        return 1
    recorded = json.loads(MANIFEST.read_text(encoding="utf-8")).get("tools", [])
    expected_paths = {item["path"] for item in discovered}
    recorded_paths = {item.get("path") for item in recorded}
    missing = sorted(expected_paths - recorded_paths)
    stale = sorted(recorded_paths - expected_paths)
    duplicate_ids = sorted({item["id"] for item in recorded if sum(x.get("id") == item.get("id") for x in recorded) > 1})
    if missing or stale or duplicate_ids:
        print(json.dumps({"missing": missing, "stale": stale, "duplicate_ids": duplicate_ids}, ensure_ascii=False, indent=2))
        return 1
    core_count = sum(item.get("tier") == "core" for item in recorded)
    if core_count != 30:
        print(f"FAIL: expected 30 core tools, found {core_count}")
        return 1
    print(f"PASS: {len(recorded)} tools, {core_count} core tools")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
