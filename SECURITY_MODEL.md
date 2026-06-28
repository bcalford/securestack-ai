# Security Model

SecureStack AI is designed for defensive local analysis and portfolio demonstration.

## Boundaries

The API is unauthenticated for local/demo use only. Uploaded and pasted files are untrusted. The backend validates file constraints and never executes uploaded code.

## Implemented controls

- Static heuristic rule classes only; no dynamic execution.
- File size/count/type validation and ZIP safety protections in backend processing.
- Secret-like evidence masking.
- Raw file storage disabled by default.
- Mock AI default; Bedrock raw content disabled by default.
- Markdown summaries render without raw HTML or `rehype-raw`.
- PDF content is escaped before rendering.
- Errors are intended to be controlled JSON/messages rather than stack traces.

## Public deployment requirements

Before any public deployment: authentication, authorization, rate limiting, upload abuse controls, strict body/file limits, TLS, least-privilege IAM, Bedrock cost controls, secret-safe logging, dependency/container scanning, monitoring, and private-code warnings are required.

## Not implemented

Authentication, public production deployment, GitHub scanning, OpenAI, Semgrep/SARIF ingestion, multi-user storage, and payments are not implemented.
