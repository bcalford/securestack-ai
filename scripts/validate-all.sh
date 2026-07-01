#!/usr/bin/env bash
set -euo pipefail

quick=false
skip_docker=false

for arg in "$@"; do
  case "$arg" in
    --quick) quick=true ;;
    --skip-docker) skip_docker=true ;;
    -h|--help)
      cat <<'HELP'
Usage: ./scripts/validate-all.sh [--quick] [--skip-docker]

Runs duplicate and secret guardrails, backend tests/package, frontend lint/test/build,
and Docker Compose configuration validation.

  --quick        Skip backend package and frontend build.
  --skip-docker  Skip Docker Compose config checks.
HELP
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n' "$arg" >&2
      exit 2
      ;;
  esac
done

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"

./scripts/check-duplicates.sh
./scripts/check-secrets.sh

(
  cd backend
  mvn test
  if [[ "$quick" == false ]]; then
    mvn package
  fi
)

(
  cd frontend
  if [[ ! -d node_modules ]]; then
    npm ci
  fi
  npm run lint
  npm run test
  if [[ "$quick" == false ]]; then
    npm run build
  fi
)

if [[ "$skip_docker" == false ]]; then
  docker compose config
  if [[ -f docker-compose.postgres.yml ]]; then
    docker compose -f docker-compose.yml -f docker-compose.postgres.yml config
  fi
fi
