# Roadmap

## Implemented MVP

- React/TypeScript/Vite frontend.
- Java 21/Spring Boot backend.
- Pasted/uploaded file scans.
- Scan creation, retrieval, history, finding filters, and status updates.
- Static heuristic rules for application, cloud/IaC, and container risk indicators.
- Mock AI summaries by default.
- PDF report export.
- Docker Compose local runtime with nginx `/api` proxying.
- CI for backend and frontend validation.
- Screenshots and launch documentation.

## Manual setup later

- GitHub repository description, topics, pinned repository, demo video, resume entry, and LinkedIn launch post.
- Optional local screenshot refresh after UI changes.
- Manual AWS deployment experimentation if desired.

## Future engineering work

- Optional Bedrock/OpenAI provider adapters with safe configuration and no committed secrets.
- Authentication and user-owned scan storage.
- GitHub repository scanning workflow.
- Semgrep and SARIF ingestion.
- Richer deduplication, severity tuning, and rule metadata.
- Production deployment automation with TLS, managed persistence, logging, monitoring, and secrets management.


## Optional Amazon Bedrock AI provider

SecureStack AI defaults to `AI_PROVIDER=mock`, which is deterministic, local, and requires no AWS credentials for Docker, tests, or normal development. An optional Bedrock mode can be enabled manually with `AI_PROVIDER=bedrock`, `AWS_REGION`, `BEDROCK_MODEL_ID` (default `amazon.nova-lite-v1:0`), `BEDROCK_MAX_TOKENS`, `BEDROCK_TEMPERATURE`, `BEDROCK_SEND_RAW_CONTENT=false`, and `BEDROCK_TIMEOUT_SECONDS`.

Bedrock prompts are defensive and remediation-focused. By default they send scan metadata, risk score/level, severity and category counts, filenames, finding titles/descriptions, confidence, line numbers, masked evidence, and recommendations. Raw uploaded file contents are not sent unless `BEDROCK_SEND_RAW_CONTENT=true`; that experimental mode is not recommended for real secrets, private code, or sensitive customer data. If credentials, region, model access, or model ID are missing, the backend returns a controlled fallback summary while static findings remain available.
