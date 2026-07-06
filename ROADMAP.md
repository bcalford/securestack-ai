# Roadmap

## v0.4-alpha implemented

- Hardened public GitHub URL import for unauthenticated public repositories, with HTTPS-only URL parsing, archive validation, path traversal protection, generated/vendor skipping, size/count/type limits, local analysis, and no token handling.
- Expanded deterministic rule coverage for secrets, authentication/session risks, API security, dependency scripts, Dockerfiles, cloud/IaC configuration, logging/data exposure, and input-validation patterns.
- Rule catalog improvements through stable rule IDs, severity/category/confidence metadata, remediation guidance, secure examples, false-positive notes, review-depth behavior, and control mappings.
- SARIF 2.1.0 export hardening with deterministic ordering, deduplicated rule metadata, severity-to-level mapping, safe file URIs, and no raw uploaded file contents.
- JSON report export and ZIP export bundle for completed local reviews.
- Backend-generated defensive threat model, risk-path grouping, fix plan, and security review checklist artifacts displayed in the results UI.
- Regression review mode for comparing two completed local scans from scan history.
- One-command local validation, duplicate/copy artifact guardrails, conservative secret-safety checks, Docker Compose config checks, Make targets, and CI polish.
- Optional local PostgreSQL Docker profile for persistence validation.
- Optional manually configured Amazon Bedrock summaries; mock AI remains the default.
- AWS architecture blueprint and deployment notes documenting future production requirements.

## Known limitations in v0.4-alpha

- No authentication or authorization.
- No public deployment or hosted scanner.
- No private GitHub repository support.
- No OAuth flow, GitHub App, or token-based GitHub import.
- No GitHub code scanning upload or automation.
- No OpenAI provider.
- No Semgrep execution or integration.
- SARIF support is export-only; SARIF import/ingestion is not implemented.
- No multi-user production storage.
- No production AWS deployment automation.

## Future

- Authentication and authorization before any shared or hosted use.
- Private repository import through an explicit, secure integration design.
- GitHub code scanning upload/automation only after an explicit integration design and additional safety review.
- Optional AI provider expansion behind explicit configuration and secret-safe defaults.
- Semgrep execution and SARIF ingestion/import as separate future capabilities.
- Production AWS deployment automation with TLS, monitoring, least-privilege IAM, abuse controls, and managed storage.
- Persistent multi-user storage with migrations and tenant/user boundaries.
- Hosted demo only with authentication, rate limits, upload abuse controls, and cost controls.
