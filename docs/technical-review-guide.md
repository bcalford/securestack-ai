# Technical Review Guide

Use this guide to review the application behavior and code structure quickly.

## Fast path

1. Run the app locally.
2. Click **Run sample security review**.
3. Run the review.
4. Optionally create a review with **GitHub URL** mode using a public repository URL and confirm the public-only/local/no-token/no-execution guidance.
5. Open **Rules** to review the static rule catalog.
6. Inspect **Fix these first**, the remediation workflow summary, and expand a finding.
7. From **Previous scans**, select two completed scans and open the local comparison page.
8. Export a PDF report and download SARIF JSON.

## Code map

- Guided UX and routes: `frontend/src/routes/`, `frontend/src/components/scan/`, `frontend/src/components/findings/`.
- Demo fixtures: `frontend/src/data/demoSamples.ts`.
- Risk helpers: `frontend/src/utils/risk.ts`.
- Scan comparison helper/page: `frontend/src/utils/scanComparison.ts`, `frontend/src/routes/ScanComparePage.tsx`, and `docs/scan-comparison.md`.
- Backend scan service: `backend/src/main/java/com/securestack/service/ScanService.java`.
- Public GitHub URL import UI/API client: `frontend/src/components/scan/ScanForm.tsx`, `frontend/src/api/client.ts`, `backend/src/main/java/com/securestack/github/GitHubRepositoryImportService.java`, and `docs/github-url-import.md`.
- Static rule catalog: `GET /api/rules`, `/rules`, and `docs/rule-catalog.md`.
- Static rules: `backend/src/main/java/com/securestack/analysis/rules/`.
- AI provider and Bedrock: `backend/src/main/java/com/securestack/analysis/ai/`.
- PDF reports: `backend/src/main/java/com/securestack/report/ReportService.java`.
- SARIF export: `backend/src/main/java/com/securestack/sarif/SarifService.java` and `docs/sarif-export.md`.
- Optional PostgreSQL profile: `docker-compose.postgres.yml`, `backend/src/main/resources/application-postgres.yml`, and `docs/postgres-profile.md`.
- AWS blueprint: `docs/aws-architecture-blueprint.md`.
- Security model: `SECURITY_MODEL.md`.
- Tests: `frontend/src/test/app.test.tsx` and `backend/src/test/java/com/securestack/`.

## Limitations

The app has a local/demo unauthenticated API. It includes public GitHub URL import for local analysis only. It does not include private repository access, OAuth, tokens, GitHub Apps, GitHub code scanning integration, OpenAI, Semgrep integration, SARIF ingestion/import, public deployment, or multi-user production storage. SARIF support is export-only. Scan comparison uses existing stored scan results and does not add a new ingestion method or backend comparison endpoint.
