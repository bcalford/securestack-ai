# AWS Deployment Guidance

Production AWS deployment automation is intentionally future work. This document is guidance for a later implementation pass, not proof that SecureStack AI is deployed to AWS today.

## Current state

- The app runs locally with Docker Compose.
- The frontend Docker image serves the Vite build through nginx and proxies `/api` to the backend service.
- The backend uses mock AI by default and requires no Bedrock/OpenAI credentials. Optional Bedrock is implemented for local/manual use when AWS credentials, region, and model access are configured.
- Local/demo persistence is suitable for portfolio use, not production multi-user operation.

## Future deployment considerations

A production AWS pass could add:

- Container registry publishing.
- ECS, App Runner, or similar container hosting.
- Managed database storage.
- TLS and custom domain configuration.
- Centralized logs, metrics, and alerts.
- Secrets management for optional real AI providers.
- IAM least-privilege roles.
- Deployment automation and rollback strategy.

Do not treat production hosting, authentication, OpenAI, or deployment automation as implemented current features. Bedrock provider support exists for local/manual use, but production AWS deployment remains future work.


## Optional Amazon Bedrock AI provider

SecureStack AI defaults to `AI_PROVIDER=mock`, which is deterministic, local, and requires no AWS credentials for Docker, tests, or normal development. An optional Bedrock mode can be enabled manually with `AI_PROVIDER=bedrock`, `AWS_REGION`, `BEDROCK_MODEL_ID` (default `amazon.nova-lite-v1:0`), `BEDROCK_MAX_TOKENS`, `BEDROCK_TEMPERATURE`, `BEDROCK_SEND_RAW_CONTENT=false`, and `BEDROCK_TIMEOUT_SECONDS`.

Bedrock prompts are defensive and remediation-focused. By default they send scan metadata, risk score/level, severity and category counts, filenames, finding titles/descriptions, confidence, line numbers, masked evidence, and recommendations. Raw uploaded file contents are not sent unless `BEDROCK_SEND_RAW_CONTENT=true`; that experimental mode is not recommended for real secrets, private code, or sensitive customer data. If credentials, region, model access, or model ID are missing, the backend returns a controlled fallback summary while static findings remain available.
