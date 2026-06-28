# SecureStack AI

SecureStack AI is a polished local/demo defensive security review product built with React, TypeScript, Java 21, Spring Boot, Docker Compose, static security rules, mock AI summaries by default, optional manually configured Amazon Bedrock summaries, scan history, finding status updates, Markdown-rendered summaries, and PDF export.

## What it does

- Start a guided review from pasted files, uploads, or safe demo samples.
- Run static defensive checks for risky code, auth, logging, secrets, Docker, Terraform, IAM, S3, and security-group patterns.
- Explain risk score, risk level, fix-first priorities, evidence, and remediation.
- Export recruiter-friendly PDF reports.
- Use mock AI by default; enable Bedrock manually only when configured.

## Guided sample reviews

Click **Run sample security review** on the landing page or open `/scans/new?sample=full-portfolio-demo`.

Sample options: Vulnerable Node API, Insecure Terraform, Insecure Dockerfile, Clean example, and Full portfolio demo. Demo secrets are fake and clearly marked.

## Quick start

```bash
docker compose config
docker compose build
docker compose up
```

Open `http://localhost:5173`. Backend health is `http://localhost:8080/api/health`.

## Local development

```bash
cd backend && mvn spring-boot:run
cd frontend && npm ci && npm run dev
```

## Optional Amazon Bedrock

Default mode is `AI_PROVIDER=mock`; no AWS credentials are required. Manual Bedrock mode uses `AI_PROVIDER=bedrock`, `AWS_REGION`, `BEDROCK_MODEL_ID`, and `BEDROCK_SEND_RAW_CONTENT=false`. Do not enable raw content for private code or real secrets.

## AWS story

See [`docs/aws-architecture-blueprint.md`](docs/aws-architecture-blueprint.md) for the current Bedrock integration and future App Runner/ECS Fargate production paths.

## Security model and limitations

SecureStack AI treats uploaded files as untrusted, does not execute code, masks secret-like evidence, escapes PDF output, and renders Markdown without raw HTML. This is not a public production deployment and does not include authentication, GitHub scanning, OpenAI, Semgrep/SARIF ingestion, multi-user accounts, or production AWS automation.

Screenshots in `docs/screenshots/` should be refreshed after final UI freeze.

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`SECURITY_MODEL.md`](SECURITY_MODEL.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`docs/demo-script.md`](docs/demo-script.md)
- [`docs/recruiter-review-guide.md`](docs/recruiter-review-guide.md)
- [`docs/deployment-aws.md`](docs/deployment-aws.md)
