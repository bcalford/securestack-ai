# Roadmap

SecureStack AI uses semantic version-style release names going forward (`vX.X.X`), with prerelease labels reserved for beta/stabilization milestones when useful.

## v0.5.1 current patch release

- Standardizes current documentation and release references on `v0.5.1` naming.
- Documents the v0.5 frontend redesign cleanup, refreshed screenshots, README screenshot references, and final UI/documentation polish.
- Keeps backend behavior, scan logic, API contracts, and deterministic rule behavior unchanged.
- Validates the repository before the next beta/stabilization phase.

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

## Next planned milestone: v0.8.0-beta

- Stabilization-focused beta milestone using `vX.X.X` naming.
- Release-readiness cleanup, validation hardening, and documentation review before the stable target.
- No shared/hosted usage assumptions without first adding explicit authentication, authorization, rate limits, abuse controls, and secure integration designs.

## Stable target: v1.0.0

- Stable local-first defensive review MVP with clear setup, validation, demo, export, architecture, and security-model documentation.
- Any production, hosted, multi-user, or private-repository capabilities remain future work unless explicitly designed, secured, implemented, and documented in a later release.

## Future

- Authentication and authorization before any shared or hosted use.
- Private repository import through an explicit, secure integration design.
- GitHub code scanning upload/automation only after an explicit integration design and additional safety review.
- Optional AI provider expansion behind explicit configuration and secret-safe defaults.
- Semgrep execution and SARIF ingestion/import as separate future capabilities.
- Production AWS deployment automation with TLS, monitoring, least-privilege IAM, abuse controls, and managed storage.
- Persistent multi-user storage with migrations and tenant/user boundaries.
- Hosted demo only with authentication, rate limits, upload abuse controls, and cost controls.
