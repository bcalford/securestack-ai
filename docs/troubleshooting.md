# Troubleshooting

## npm ci failures
Use Node 20 or 22, delete `frontend/node_modules`, then run `cd frontend && npm ci`. The current lockfile is committed for reproducible installs. `npm audit` may report transitive advisories; do not run forced upgrades without retesting Vite, React Query, Vitest, and Recharts.

## Maven failures
Use Java 21. Run `cd backend && mvn -version` to confirm the JDK, then `mvn test`.

## Docker unavailable
Some hosted development environments do not expose a Docker daemon. Validate locally with `docker --version`, `docker compose config`, and `docker compose build`.

## Port conflicts
Backend uses `8080`; frontend nginx uses `5173`. Stop conflicting processes or edit `docker-compose.yml`.

## Frontend cannot reach backend
For local Vite dev set `VITE_API_BASE_URL=http://localhost:8080/api`. In Docker, nginx proxies `/api` to `backend:8080`.

## PDF generation issues
PDFs are generated on demand by the backend. If fonts or rendering fail, confirm `mvn package` succeeds and inspect backend logs for OpenHTMLToPDF errors.

## Dependency advisories
Review advisories with `npm audit` and upgrade deliberately. Avoid `npm audit fix --force` unless you are ready to validate breaking major versions.
