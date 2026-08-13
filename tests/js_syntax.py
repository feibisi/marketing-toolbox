#!/usr/bin/env python3
"""Check standalone and inline JavaScript syntax with Node.js."""

from __future__ import annotations

import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class ScriptParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.capture = False
        self.external = False
        self.buffer: list[str] = []
        self.scripts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "script":
            self.capture = True
            self.external = any(key == "src" and value for key, value in attrs)
            self.buffer = []

    def handle_data(self, data: str) -> None:
        if self.capture and not self.external:
            self.buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self.capture:
            script = "".join(self.buffer).strip()
            if script and not self.external:
                self.scripts.append(script)
            self.capture = False


def check(source: str, label: str) -> str | None:
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as handle:
        handle.write(source)
        handle.flush()
        result = subprocess.run(["node", "--check", handle.name], text=True, capture_output=True)
    return f"{label}: {result.stderr.strip()}" if result.returncode else None


def main() -> int:
    failures: list[str] = []
    total = 0
    for path in sorted(ROOT.rglob("*.js")):
        if "node_modules" in path.parts:
            continue
        total += 1
        failure = check(path.read_text(encoding="utf-8", errors="replace"), str(path.relative_to(ROOT)))
        if failure:
            failures.append(failure)
    for path in sorted(ROOT.rglob("*.html")):
        if "node_modules" in path.parts:
            continue
        parser = ScriptParser()
        parser.feed(path.read_text(encoding="utf-8", errors="replace"))
        for index, script in enumerate(parser.scripts, 1):
            total += 1
            failure = check(script, f"{path.relative_to(ROOT)} inline#{index}")
            if failure:
                failures.append(failure)
    if failures:
        print("\n".join(failures))
        return 1
    print(f"PASS: {total} JavaScript samples")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
