# Security Model

SecureStack AI is designed for defensive local analysis and portfolio demonstration.

## Trust boundaries

- Pasted and uploaded files are untrusted input.
- The backend validates filenames, file sizes, supported content types/extensions, and binary-content indicators.
- Uploaded code and configuration are never executed.
- Findings avoid exploit instructions and focus on defensive triage and remediation.
- Secret-like evidence is masked to avoid unnecessarily storing or displaying raw secrets.
- PDF report content escapes user-controlled values before rendering.
- Mock AI mode is the default and requires no external credentials.

## Implemented controls

- File validation before scan processing.
- Static heuristic rule classes instead of dynamic execution.
- DTO-based API responses rather than exposing persistence entities directly.
- Defensive finding language and remediation guidance.
- Docker Compose runtime that keeps frontend API calls relative through nginx `/api` proxying.

## Not implemented yet

- Authentication and authorization.
- Multi-tenant/user-owned scans.
- Real Bedrock/OpenAI provider integrations.
- GitHub repository scanning.
- Semgrep/SARIF ingestion.
- Production-grade secrets management, TLS, observability, and deployment automation.

## Limitations

Static findings are heuristic. They may be false positives, may miss vulnerabilities requiring broader context, and do not replace professional security review, secure code review, SAST/DAST programs, or penetration testing.


## Optional Amazon Bedrock AI provider

SecureStack AI defaults to `AI_PROVIDER=mock`, which is deterministic, local, and requires no AWS credentials for Docker, tests, or normal development. An optional Bedrock mode can be enabled manually with `AI_PROVIDER=bedrock`, `AWS_REGION`, `BEDROCK_MODEL_ID` (default `amazon.nova-lite-v1:0`), `BEDROCK_MAX_TOKENS`, `BEDROCK_TEMPERATURE`, `BEDROCK_SEND_RAW_CONTENT=false`, and `BEDROCK_TIMEOUT_SECONDS`.

Bedrock prompts are defensive and remediation-focused. By default they send scan metadata, risk score/level, severity and category counts, filenames, finding titles/descriptions, confidence, line numbers, masked evidence, and recommendations. Raw uploaded file contents are not sent unless `BEDROCK_SEND_RAW_CONTENT=true`; that experimental mode is not recommended for real secrets, private code, or sensitive customer data. If credentials, region, model access, or model ID are missing, the backend returns a controlled fallback summary while static findings remain available.
