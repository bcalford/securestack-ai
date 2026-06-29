# Technical Review Guide

Use this guide to review the application behavior and code structure quickly.

## Fast path

1. Run the app locally.
2. Click **Run sample security review**.
3. Run the review.
4. Inspect **Fix these first** and expand a finding.
5. Export a PDF report.

## Code map

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

## Limitations

The app has a local/demo unauthenticated API. It does not include GitHub scanning, OpenAI, Semgrep/SARIF ingestion, public deployment, or multi-user production storage.
