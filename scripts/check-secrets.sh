#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"

# Conservative high-confidence secret checks. Known fake fixtures and docs are
# excluded or filtered so local demo values do not block validation.
base_excludes=(
  ':!frontend/src/data/demoSamples.ts'
  ':!samples/**'
  ':!docs/**'
  ':!frontend/node_modules/**'
  ':!backend/target/**'
  ':!frontend/dist/**'
)

allowlist='fake|demo|demo-only|sample|example|placeholder|changeme|change-me|your_|your-|test-only|dummy|not-a-real|local development defaults|AKIAIOSFODNN7EXAMPLE|wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
status=0

run_check() {
  local label="$1"
  local pattern="$2"
  local filter_allowlist="${3:-true}"
  local output

  output=$(git grep -n -I -E "$pattern" -- . "${base_excludes[@]}" 2>/dev/null || true)
  if [[ "$filter_allowlist" == true ]]; then
    output=$(printf '%s\n' "$output" | grep -Eiv "$allowlist" || true)
  fi

  if [[ -n "$output" ]]; then
    printf '\n%s\n' "$label"
    printf '%s\n' "$output"
    status=1
  fi
}

run_check "AWS access key pattern matches:" '(^|[^A-Z0-9])(AKIA|ASIA)[0-9A-Z]{16}([^A-Z0-9]|$)'
run_check "Private key header matches:" '-----BEGIN (RSA |DSA |EC |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----' false
run_check "GitHub token pattern matches:" 'gh[pousr]_[A-Za-z0-9_]{36,255}'
run_check "Slack token pattern matches:" 'xox[baprs]-[A-Za-z0-9-]{20,}'
run_check "High-entropy credential assignment matches:" '(^|[^A-Za-z0-9_])(AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN|SECRET_KEY|API_KEY|ACCESS_TOKEN|AUTH_TOKEN|PASSWORD|DB_PASSWORD|PRIVATE_KEY)[[:space:]]*[:=][[:space:]]*["'"''][A-Za-z0-9_./+=:-]{20,}["'"'']'

if ((status != 0)); then
  printf '\n%s\n' "Secret-safety check failed. Review the high-confidence matches above."
  exit "$status"
fi

printf '%s\n' "Secret-safety check passed: no high-confidence dangerous patterns found."
