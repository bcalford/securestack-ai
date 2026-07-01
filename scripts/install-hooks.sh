#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
hook_dir="$repo_root/.git/hooks"
hook_file="$hook_dir/pre-commit"
managed_marker="# SecureStack AI local validation hook"

if [[ ! -d "$hook_dir" ]]; then
  printf '%s\n' "Git hooks directory not found. Run this inside the repository."
  exit 1
fi

if [[ -f "$hook_file" ]]; then
  if grep -Fq "$managed_marker" "$hook_file"; then
    printf '%s\n' "Updating existing SecureStack AI pre-commit hook."
  else
    backup="$hook_file.backup.$(date +%Y%m%d%H%M%S)"
    cp "$hook_file" "$backup"
    printf 'Existing pre-commit hook backed up to %s\n' "$backup"
  fi
fi

cat > "$hook_file" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
# SecureStack AI local validation hook

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

./scripts/check-duplicates.sh
./scripts/check-secrets.sh
HOOK

chmod +x "$hook_file"
printf '%s\n' "Installed .git/hooks/pre-commit for duplicate and secret guardrails."
