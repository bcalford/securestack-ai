#!/usr/bin/env bash
set -euo pipefail

# Conservative high-confidence secret checks. Demo fixtures are excluded because
# they intentionally contain fake vulnerable examples for local reviews.
base_excludes=(
  ':!frontend/src/data/demoSamples.ts'
  ':!samples/**'
  ':!frontend/node_modules/**'
  ':!backend/target/**'
)

status=0
run_check() {
  local label="$1"
  local pattern="$2"
  local flags=("${@:3}")
  local output

  if output=$(git grep -n -I "${flags[@]}" -E "$pattern" -- . "${base_excludes[@]}" 2>/dev/null | grep -Eiv "fake[-_ ]?demo|demo[-_ ]?only|example|placeholder"); then
    printf '\n%s\n' "$label"
    printf '%s\n' "$output"
    status=1
  fi
}

run_check "AWS access key pattern matches:" 'AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}'
run_check "Private key header matches:" '-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----'
run_check "Obvious credential assignment matches:" "(^|[^A-Za-z0-9_])(AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN|AWS_ACCESS_KEY_ID|SECRET_KEY|API_KEY|ACCESS_TOKEN|AUTH_TOKEN|PASSWORD|DB_PASSWORD)[[:space:]]*[:=][[:space:]]*[\"'][^\"']{12,}[\"']" -i

if ((status != 0)); then
  printf '\n%s\n' "Secret-safety check failed. Review the high-confidence matches above."
  exit "$status"
fi

printf '%s\n' "Secret-safety check passed: no high-confidence dangerous patterns found."
