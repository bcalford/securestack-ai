#!/usr/bin/env bash
set -euo pipefail

# Detect common accidental duplicate/copy artifacts. This guard reports matches
# only; it never deletes files or attempts to infer why they exist.
patterns=(
  '2.java' '2.ts' '2.tsx' '2.css' '2.json' '2.md' '2.yml' '2.yaml'
  '3.java' '3.ts' '3.tsx'
  'copy.*' 'Copy.*'
  '*.orig' '*.rej'
)

matches=()
for pattern in "${patterns[@]}"; do
  while IFS= read -r -d '' file; do
    matches+=("$file")
  done < <(find . \
    -path './.git' -prune -o \
    -path './frontend/node_modules' -prune -o \
    -path './backend/target' -prune -o \
    -type f -name "$pattern" -print0)
done

if ((${#matches[@]} > 0)); then
  printf '%s\n' "Duplicate/copy guard found matching files:"
  printf '%s\n' "${matches[@]}" | sort -u
  exit 1
fi

printf '%s\n' "Duplicate/copy guard passed: no matching files found."
