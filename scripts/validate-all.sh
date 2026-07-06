#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"

quick=false
skip_docker=false
skip_package=false
clean_frontend_install=false

usage() {
  cat <<'HELP'
Usage: ./scripts/validate-all.sh [--quick] [--skip-package] [--skip-docker] [--clean-frontend-install]

Runs duplicate and secret guardrails, backend tests/package, frontend lint/test/build,
and Docker Compose configuration validation from the repository root.

  --quick                   Skip backend package and frontend production build.
  --skip-package            Skip backend package only; frontend build still runs unless --quick is set.
  --skip-docker             Skip Docker Compose config checks.
  --clean-frontend-install  Remove frontend/node_modules and run npm ci before frontend checks.
  -h, --help                Show this help.
HELP
}

for arg in "$@"; do
  case "$arg" in
    --quick) quick=true ; skip_package=true ;;
    --skip-package) skip_package=true ;;
    --skip-docker) skip_docker=true ;;
    --clean-frontend-install) clean_frontend_install=true ;;
    -h|--help) usage; exit 0 ;;
    *)
      printf 'ERROR: unknown option: %s\n\n' "$arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

step() {
  printf '\n==> %s\n' "$1"
}

run() {
  local label="$1"
  local code
  shift
  step "$label"
  set +e
  "$@"
  code=$?
  set -e
  if ((code != 0)); then
    printf '\nERROR: %s failed with exit code %s while running: %s\n' "$label" "$code" "$*" >&2
    exit "$code"
  fi
}

step "SecureStack AI validation"
printf 'Repository root: %s\n' "$repo_root"
printf 'Options: quick=%s skip_package=%s skip_docker=%s clean_frontend_install=%s\n' \
  "$quick" "$skip_package" "$skip_docker" "$clean_frontend_install"

run "Duplicate/copy artifact guard" ./scripts/check-duplicates.sh
run "Secret-safety guard" ./scripts/check-secrets.sh

run "Backend tests" bash -lc 'cd backend && mvn test'
if [[ "$skip_package" == false ]]; then
  run "Backend package" bash -lc 'cd backend && mvn package'
else
  step "Backend package"
  printf 'Skipping backend package because --quick or --skip-package was set.\n'
fi

step "Frontend dependency installation"
if [[ "$clean_frontend_install" == true ]]; then
  printf 'Removing frontend/node_modules for a clean npm ci.\n'
  rm -rf frontend/node_modules
  run "Frontend clean npm ci" bash -lc 'cd frontend && npm ci'
elif [[ ! -d frontend/node_modules ]]; then
  run "Frontend npm ci" bash -lc 'cd frontend && npm ci'
else
  printf 'frontend/node_modules exists; skipping npm ci. Use --clean-frontend-install to force a clean install.\n'
fi

run "Frontend lint" bash -lc 'cd frontend && npm run lint'
run "Frontend tests" bash -lc 'cd frontend && npm run test'
if [[ "$quick" == false ]]; then
  run "Frontend production build" bash -lc 'cd frontend && npm run build'
else
  step "Frontend production build"
  printf 'Skipping frontend build because --quick was set.\n'
fi

if [[ "$skip_docker" == false ]]; then
  run "Docker Compose config" docker compose config
  if [[ -f docker-compose.postgres.yml ]]; then
    run "Docker Compose PostgreSQL override config" docker compose -f docker-compose.yml -f docker-compose.postgres.yml config
  fi
else
  step "Docker Compose config"
  printf 'Skipping Docker Compose checks because --skip-docker was set.\n'
fi

step "Validation complete"
printf 'All requested validation checks passed.\n'
