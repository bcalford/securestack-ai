# Roadmap

## v0.3-alpha implemented

- Local Docker Compose runtime with mock AI as the default provider.
- React/TypeScript/Vite frontend and Java 21/Spring Boot backend.
- Defensive static analysis rules with a backend/frontend rule catalog.
- Results dashboard, finding filters/status, remediation workflow summary, scan history, scan comparison, PDF export, and SARIF export.
- Real sample report page for demo and review-readiness walkthroughs.
- Guided sample review flow using fake demo-only secrets.
- Public GitHub URL import for unauthenticated public repositories, analyzed locally without tokens or code execution.
- One-command local validation, duplicate/copy artifact guardrails, secret-safety checks, and CI validation.
- Optional manually configured Amazon Bedrock summaries.
- Optional local PostgreSQL Docker profile for persistence validation.
- AWS architecture blueprint and deployment notes.

## Known limitations in v0.3-alpha

- No authentication or authorization.
- No public deployment or hosted scanner.
- No private GitHub repository support, OAuth flow, GitHub App, or token-based import.
- No GitHub code scanning upload or automation.
- No OpenAI provider.
- No Semgrep execution or integration.
- SARIF export only; SARIF import/ingestion is not implemented.
- No multi-user production storage.
- No production AWS deployment automation.

## Future

- Authentication and authorization.
- Private repository import through an explicit, secure integration design.
- GitHub code scanning upload/automation after SARIF export hardening.
- OpenAI provider option behind explicit configuration.
- Semgrep execution and SARIF ingestion/import.
- Production AWS deployment automation.
- Persistent multi-user storage with migrations and tenant/user boundaries.
- Hosted demo with abuse controls.
