# Recruiter Review Guide

Fast path: run the app, click **Run sample security review**, run the review, inspect **Fix these first**, expand a finding, and export a PDF.

Code map:

- Guided UX and routes: `frontend/src/routes/`, `frontend/src/components/scan/`, `frontend/src/components/findings/`.
- Demo fixtures: `frontend/src/data/demoSamples.ts`.
- Risk helpers: `frontend/src/utils/risk.ts`.
- Backend scan service: `backend/src/main/java/com/securestack/service/ScanService.java`.
- Static rules: `backend/src/main/java/com/securestack/analysis/rules/`.
- AI provider and Bedrock: `backend/src/main/java/com/securestack/analysis/ai/`.
- PDF reports: `backend/src/main/java/com/securestack/report/ReportService.java`.
- AWS blueprint: `docs/aws-architecture-blueprint.md`.
- Security model: `SECURITY_MODEL.md`.
- Tests: `frontend/src/test/app.test.tsx` and `backend/src/test/java/com/securestack/`.

Limitations: local/demo unauthenticated API, no GitHub scanning, no OpenAI, no Semgrep/SARIF, no multi-user production deployment.
