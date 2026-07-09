# Technical Review Guide

Use this guide to review the application behavior and code structure quickly.

## Fast path

1. Run the app locally.
2. Click **Run sample security review**.
3. Run the review.
4. Optionally create a review with **GitHub URL** mode using a public repository URL and confirm the public-only/local/no-token/no-execution guidance.
5. Open **Rules** to review the static rule catalog.
6. Inspect **Fix these first**, the remediation workflow summary, and expand a finding.
7. From **Previous scans**, select two completed scans and open the **Regression review** comparison page.
8. Review remediation workflow counts, threat model, risk paths, fix plan, security review checklist, compare two completed scans when available for risk trend, new findings, resolved findings, and unchanged findings, export a PDF report, download SARIF JSON, download SecureStack JSON, and download the ZIP bundle.
9. Tab through the navigation, scan form mode buttons, and finding status controls with the keyboard to confirm visible focus states and correct button/link semantics.

## Code map

- Guided UX and routes: `frontend/src/routes/`, `frontend/src/components/scan/`, `frontend/src/components/findings/`.
- Shared UI component library: `frontend/src/components/ui/` (buttons, cards, badges, page headers, empty/error/loading states, metric cards).
- Design tokens and shared styles: `frontend/src/styles/` (`tokens.css`, `base.css`, `layout.css`, `components.css`, `pages.css`).
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
- JSON and bundle exports: `backend/src/main/java/com/securestack/report/JsonExportService.java`, `backend/src/main/java/com/securestack/report/BundleExportService.java`, and `docs/export-bundle.md`.
- Review artifacts: `backend/src/main/java/com/securestack/review/SecurityReviewArtifactService.java`, `docs/threat-model.md`, `docs/fix-plan.md`, and `docs/security-review-checklist.md`.
- Optional PostgreSQL profile: `docker-compose.postgres.yml`, `backend/src/main/resources/application-postgres.yml`, and `docs/postgres-profile.md`.
- AWS blueprint: `docs/aws-architecture-blueprint.md`.
- Security model: `SECURITY_MODEL.md`.
- Tests: `frontend/src/test/app.test.tsx` and `backend/src/test/java/com/securestack/`.

## Limitations

The app has a local/demo unauthenticated API and is not a public hosted scanner. It includes public GitHub URL import for local analysis only. It does not include private repository access, OAuth, tokens, GitHub Apps, GitHub code scanning integration, OpenAI, Semgrep integration, SARIF ingestion/import, public deployment, multi-user production storage, or production AWS deployment automation. SARIF support is export-only. Regression review scan comparison uses existing stored scan results and does not add a new ingestion method, production CI scanning, or backend comparison endpoint.
