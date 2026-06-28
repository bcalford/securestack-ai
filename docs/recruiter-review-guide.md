# Recruiter and Technical Reviewer Guide

Use this guide to evaluate SecureStack AI quickly.

## What to review in 60 seconds

- **Product value:** Root `README.md` explains the problem, screenshots, current features, limitations, and roadmap.
- **Frontend dashboard:** `frontend/src/routes/ResultsPage.tsx` and `frontend/src/components/` show the React/TypeScript UI split into routes and reusable components.
- **Backend scan pipeline:** Backend controllers and services handle scan creation, retrieval, finding updates, and report export without executing uploaded code.
- **Rule engine:** `backend/src/main/java/com/securestack/analysis/rules/` contains separate defensive heuristic rule classes.
- **PDF reports:** Backend report generation produces a shareable PDF with escaped user-controlled content and clear limitations.
- **Docker/nginx setup:** `docker-compose.yml`, `frontend/Dockerfile`, and `frontend/nginx.conf` show local containerized runtime with `/api` proxying.
- **CI:** `.github/workflows/ci.yml` runs backend test/package and frontend install/lint/test/build without secrets.
- **Tests:** Backend and frontend tests cover scan flow, rules, PDF generation, pages, filtering, status updates, and error states.
- **Security model:** `SECURITY_MODEL.md` documents untrusted input handling, no code execution, mock AI default, optional manually configured Bedrock behavior, evidence masking, and limitations.
- **Docs:** `ARCHITECTURE.md`, `ROADMAP.md`, `docs/demo-script.md`, `docs/sample-findings.md`, `docs/troubleshooting.md`, and `docs/deployment-aws.md` describe how the MVP works and what remains future work.

## What is intentionally not implemented yet

SecureStack AI does not currently implement OpenAI calls, authentication, GitHub repository scanning, Semgrep/SARIF ingestion, or production deployment automation. Optional Amazon Bedrock calls are implemented for manual local setup only; mock AI remains the default so the MVP remains runnable locally without required external credentials.
