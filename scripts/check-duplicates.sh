#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"

# Detect common accidental duplicate/copy artifacts. This guard reports matches
# only; it never deletes files or attempts to infer why they exist.
patterns=(
  '* 2.*'
  '* 3.*'
  '* copy.*'
  '* Copy.*'
  '*.orig'
  '*.rej'
)

prunes=(
  -path './.git' -o
  -path '*/node_modules' -o
  -path './frontend/dist' -o
  -path './backend/target'
)

matches=()
for pattern in "${patterns[@]}"; do
  while IFS= read -r -d '' file; do
    matches+=("$file")
  done < <(find . \( "${prunes[@]}" \) -prune -o -type f -name "$pattern" -print0)
done

if ((${#matches[@]} > 0)); then
  printf '%s\n' "Duplicate/copy guard failed. Remove or intentionally rename these files:"
  printf '%s\n' "${matches[@]}" | sort -u
  exit 1
fi

printf '%s\n' "Duplicate/copy guard passed: no matching files found."
