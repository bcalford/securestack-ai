# SecureStack AI

SecureStack AI is a full-stack, recruiter-ready security review portfolio project. It accepts pasted or uploaded source/configuration files, runs defensive static security heuristics, produces mock AI summaries, and exports a PDF report.

## Current features
- React + TypeScript + Vite frontend with landing page, scan form, results dashboard, scan history, finding filters, status updates, and PDF export.
- Java 21 + Spring Boot backend with DTO-based APIs for scan creation, retrieval, listing, finding updates, and reports.
- Static defensive rules for secrets, CORS, cookies, debug exposure, injection patterns, JWT/auth risks, logging, rate limiting, IAM, S3, security groups, Dockerfiles, and dependency scripts.
- Mock AI provider enabled by default; no external credentials are required.
- Docker Compose setup with nginx proxying `/api` to the backend.
- CI that runs backend tests/package and frontend lint/test/build without secrets.

## Future roadmap
- Optional Bedrock/OpenAI provider setup.
- Authentication and multi-user storage.
- GitHub repository scanning.
- Semgrep/SARIF ingestion.
- Production deployment automation.

## Local development
```bash
cd backend && mvn spring-boot:run
cd frontend && npm ci && npm run dev
```
Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:8080`.

## Docker
```bash
docker compose config
docker compose build
docker compose up
```
Open `http://localhost:5173`. The frontend container serves the Vite build through nginx and proxies `/api` to the backend service. Backend health remains available at `http://localhost:8080/api/health`.

## Testing
```bash
cd backend && mvn test
cd backend && mvn package
cd frontend && npm ci
cd frontend && npm run lint
cd frontend && npm run test
cd frontend && npm run build
```

## Screenshots
Place validated screenshots in `docs/screenshots/` after local UI review. Suggested captures: landing page, new scan form, results dashboard, findings filters, scan history, and PDF download.

## Troubleshooting
See [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Resume bullet
Built SecureStack AI, a full-stack security review platform using React, TypeScript, Java 21, Spring Boot, Docker, CI, static analysis heuristics, mock AI summaries, and PDF reporting to demonstrate production-minded software engineering and defensive security workflows.

## LinkedIn post template
I built SecureStack AI, a full-stack security review portfolio project that analyzes pasted or uploaded code/configuration files, highlights defensive findings, generates mock AI summaries, and exports PDF reports. The stack includes React, TypeScript, Java 21, Spring Boot, Docker, CI, and security-focused documentation.

## Security note
SecureStack AI does not execute uploaded code and does not replace a professional security review. Static rules are heuristic and intended for defensive education, triage, and portfolio demonstration.
