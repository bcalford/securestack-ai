# Roadmap

SecureStack AI uses semantic version-style release names (`vX.X.X`), with prerelease labels reserved for beta/stabilization milestones when useful.

## v0.8.0-beta current beta release

- Stabilizes the local-first defensive security review MVP for beta evaluation without adding major product features.
- Validates clean-machine setup, local Docker Compose startup, frontend/backend build expectations, and CI-aligned validation paths.
- Polishes accessibility and responsive presentation for the guided review, results, finding details, export, rule catalog, scan history, and comparison flows.
- Fixes beta edge cases found during stabilization while keeping backend scan behavior, API contracts, and deterministic rule intent stable.
- Updates release documentation, demo walkthroughs, troubleshooting, limitations, and validation guidance for `v0.8.0-beta`.
- Keeps mock AI as the default, uploaded code unexecuted, raw file storage disabled by default, and SARIF support export-only.

## v0.5.1 prior UI/docs polish release

- Standardized documentation and release references on `v0.5.1` naming after the frontend redesign.
- Documented the v0.5 frontend redesign cleanup, refreshed screenshots, README screenshot references, and UI/documentation polish.
- Kept backend behavior, scan logic, API contracts, and deterministic rule behavior unchanged.
- Validated the repository before the beta/stabilization phase.

## v0.5.0 frontend redesign prior context

- Introduced the refreshed frontend visual system and reusable UI polish for the local-first review workflow.
- Improved results, finding detail, scan history, rule catalog, comparison, and report-oriented presentation without changing backend scan behavior.
- Refreshed frontend documentation and screenshot coverage for the redesign milestone.

## v0.4.0 implemented prior context

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

## Current limitations

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

## Next stable target: v1.0.0

- Stable local-first defensive review MVP with clear setup, validation, guided demo, export, architecture, and security-model documentation.
- Release-readiness cleanup focused on reliability, documentation accuracy, test coverage, and conservative dependency/build hygiene.
- No shared/hosted usage assumptions without first adding explicit authentication, authorization, rate limits, abuse controls, storage boundaries, and secure integration designs.

## Future after v1.0.0

- Authentication and authorization before any shared or hosted use.
- Private repository import only through an explicit, secure integration design.
- GitHub code scanning upload/automation only after an explicit integration design and additional safety review.
- Optional AI provider expansion behind explicit configuration and secret-safe defaults.
- Semgrep execution and SARIF ingestion/import as separate future capabilities.
- Production AWS deployment automation with TLS, monitoring, least-privilege IAM, abuse controls, and managed storage.
- Persistent multi-user storage with migrations and tenant/user boundaries.
- Hosted demo only with authentication, rate limits, upload abuse controls, and cost controls.
