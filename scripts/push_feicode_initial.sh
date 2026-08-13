#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_REMOTE="ssh://git@feicode.com/Modiqi-com/marketing-toolbox.git"
API_URL="https://feicode.com/api/v1/repos/Modiqi-com/marketing-toolbox"

cd "$ROOT"

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "FAIL: initial publication must run from main" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "FAIL: working tree is not clean" >&2
  exit 1
fi

remote_url="$(git config --local --get remote.origin.url || true)"
if [[ "$remote_url" != "$EXPECTED_REMOTE" ]]; then
  echo "FAIL: origin must be the credential-free SSH URL" >&2
  exit 1
fi

python3 - "$API_URL" <<'PY'
import json
import sys
import urllib.error
import urllib.request

try:
    with urllib.request.urlopen(sys.argv[1], timeout=20) as response:
        repository = json.load(response)
except urllib.error.HTTPError as error:
    if error.code == 404:
        raise SystemExit("BLOCKED: FeiCode repository does not exist")
    raise

if repository.get("full_name") != "Modiqi-com/marketing-toolbox":
    raise SystemExit("FAIL: FeiCode repository identity mismatch")
if repository.get("private") is not False:
    raise SystemExit("FAIL: repository visibility is not the approved public setting")
branch = repository.get("default_branch")
if branch not in (None, "", "main"):
    raise SystemExit(f"FAIL: unexpected default branch before push: {branch}")
print("PASS: FeiCode repository exists with the approved identity and visibility")
PY

gitleaks git --redact --exit-code 1 --log-level warn

# Ignore global URL rewrites so a credential embedded in global Git config can
# never be expanded into a command diagnostic or persisted in this repository.
GIT_CONFIG_GLOBAL=/dev/null git push -u origin main

local_sha="$(git rev-parse HEAD)"
remote_sha="$(GIT_CONFIG_GLOBAL=/dev/null git ls-remote origin refs/heads/main | awk '{print $1}')"
if [[ -z "$remote_sha" || "$remote_sha" != "$local_sha" ]]; then
  echo "FAIL: remote main does not match local HEAD" >&2
  exit 1
fi

head_ref="$(GIT_CONFIG_GLOBAL=/dev/null git ls-remote --symref origin HEAD | awk '/^ref:/ {print $2; exit}')"
if [[ "$head_ref" != "refs/heads/main" ]]; then
  echo "FAIL: remote HEAD does not point to main" >&2
  exit 1
fi

python3 - "$API_URL" "$local_sha" <<'PY'
import json
import sys
import urllib.request

with urllib.request.urlopen(sys.argv[1], timeout=20) as response:
    repository = json.load(response)
if repository.get("default_branch") != "main":
    raise SystemExit("FAIL: FeiCode API does not report main as default branch")
if repository.get("empty") is not False:
    raise SystemExit("FAIL: FeiCode still reports an empty repository")
print(f"PASS: FeiCode main verified at {sys.argv[2]}")
PY
