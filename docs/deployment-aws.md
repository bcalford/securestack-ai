# AWS Deployment Guidance

Production AWS deployment automation is intentionally future work. This document is guidance for a later implementation pass, not proof that SecureStack AI is deployed to AWS today.

## Current state

- The app runs locally with Docker Compose.
- The frontend Docker image serves the Vite build through nginx and proxies `/api` to the backend service.
- The backend uses mock AI by default and requires no Bedrock/OpenAI credentials.
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

Do not treat Bedrock/OpenAI, production hosting, authentication, or deployment automation as implemented current features.
