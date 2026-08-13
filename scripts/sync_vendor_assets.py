#!/usr/bin/env python3
"""Copy pinned browser libraries from node_modules and verify local HTML references."""

from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT / "shared" / "vendor"
ASSETS = {
    "lucide.min.js": ROOT / "node_modules/lucide/dist/umd/lucide.min.js",
    "html2canvas.min.js": ROOT / "node_modules/html2canvas/dist/html2canvas.min.js",
    "sortable.min.js": ROOT / "node_modules/sortablejs/Sortable.min.js",
}
REPLACEMENTS = {
    "https://unpkg.com/lucide@latest": "lucide.min.js",
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js": "html2canvas.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.14.0/Sortable.min.js": "sortable.min.js",
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def local_url(page: Path, asset: str) -> str:
    return Path(os.path.relpath(VENDOR / asset, page.parent)).as_posix()


def write() -> None:
    VENDOR.mkdir(parents=True, exist_ok=True)
    for name, source in ASSETS.items():
        if not source.exists():
            raise SystemExit(f"missing dependency asset: {source.relative_to(ROOT)}")
        (VENDOR / name).write_bytes(source.read_bytes())

    for page in ROOT.rglob("*.html"):
        if "node_modules" in page.parts:
            continue
        text = page.read_text(encoding="utf-8")
        updated = text
        for remote, asset in REPLACEMENTS.items():
            updated = updated.replace(remote, local_url(page, asset))
        if updated != text:
            page.write_text(updated, encoding="utf-8")


def verify() -> None:
    problems: list[str] = []
    for name, source in ASSETS.items():
        target = VENDOR / name
        if not source.exists() or not target.exists():
            problems.append(f"missing {name}")
        elif digest(source) != digest(target):
            problems.append(f"stale {name}")

    for page in ROOT.rglob("*.html"):
        if "node_modules" in page.parts:
            continue
        text = page.read_text(encoding="utf-8")
        for remote in REPLACEMENTS:
            if remote in text:
                problems.append(f"remote script in {page.relative_to(ROOT)}: {remote}")

    if problems:
        print("Vendor verification: FAIL")
        print("\n".join(f"- {problem}" for problem in problems))
        raise SystemExit(1)
    print(f"Vendor verification: PASS ({len(ASSETS)} pinned assets)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    if args.write:
        write()
    verify()
