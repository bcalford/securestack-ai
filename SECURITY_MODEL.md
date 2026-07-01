# Security Model

SecureStack AI is designed for defensive local analysis.

## Boundaries

The API is unauthenticated and intended for local/demo use only. Uploaded files, pasted files, ZIP archives, and public GitHub URL imports are untrusted. The backend validates file constraints and never executes uploaded code.

## Implemented controls

- Static heuristic rule classes only; no dynamic execution and no Semgrep execution.
- File size/count/type validation, public GitHub URL validation, and ZIP safety protections in backend processing.
- Secret-like evidence masking.
- Raw file storage disabled by default.
- Mock AI default; Bedrock raw content disabled by default.
- Markdown summaries render without raw HTML or `rehype-raw`.
- PDF content is escaped before rendering.
- SARIF export includes finding metadata and does not include raw uploaded file contents.
- Optional PostgreSQL mode uses local development credentials and is not production multi-user hardening.
- Errors are intended to be controlled JSON/messages rather than stack traces.

## Public deployment requirements

Do not expose this application publicly as-is. Any public deployment would require authentication, authorization, rate limiting, upload abuse controls, strict body/file limits, TLS, least-privilege IAM, Bedrock cost controls, secret-safe logging, dependency/container scanning, monitoring, and private-code warnings.

## Not implemented

Authentication, authorization, public deployment/hosted scanning, private GitHub repository support, GitHub code scanning upload/automation, OpenAI, Semgrep execution/integration, SARIF import/ingestion, multi-user production storage, and production AWS deployment automation are not implemented.
