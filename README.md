# SecureStack AI

SecureStack AI is a production-quality portfolio project for defensive security review of code and cloud configuration. It combines a React/Vite frontend, Java 21 Spring Boot API, deterministic static security rules, mock AI summaries by default, optional Amazon Bedrock summaries, PDF export, and documentation for an AWS-ready architecture.

> Screenshot note: final screenshots should be refreshed after the UI freeze. Use the guided sample review flow so reviewers can see the landing page, scan form, fix-first results, finding details, provider badge, and PDF export.

## Current features

- Guided scan creation from pasted files, uploaded files/ZIP archives, or built-in safe demo samples.
- Defensive static checks for secrets, auth/session risks, API misconfiguration, dependency scripts, Dockerfiles, and cloud/IaC patterns.
- Prioritized risk scoring, severity/category breakdowns, and a “Fix these first” results panel.
- Finding detail cards with evidence, remediation guidance, secure examples, status updates, and rule IDs.
- Mock AI summaries by default, with optional Bedrock provider support for manual smoke testing.
- PDF report export from completed review results.
- Local Docker Compose workflow for frontend, backend, and database.
- Documentation for security model, architecture, roadmap, AWS deployment blueprint, screenshots, and recruiter review.

## Guided sample review

Click **Run sample security review** on the landing page or open:

```text
/scans/new?sample=full-portfolio-demo
```

The frontend preloads safe fixture files that are intentionally vulnerable but contain fake demo-only secrets. The full portfolio demo is designed to trigger multiple finding categories and show the complete results dashboard.

## Tech stack

- **Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Vitest, Testing Library.
- **Backend:** Java 21, Spring Boot, Spring Web, Spring Data JPA, H2/PostgreSQL-ready persistence, Maven.
- **Security analysis:** Rule classes for deterministic defensive findings plus risk scoring and provider-abstracted AI summaries.
- **Reporting:** Server-generated PDF export.
- **Local runtime:** Docker Compose.
- **Optional cloud AI:** Amazon Bedrock when manually configured.

## Architecture overview

The frontend submits pasted file metadata/content and uploaded files to the backend scan API. The backend normalizes inputs, rejects unsafe paths and unsupported/binary/oversized files, expands ZIP files safely, runs rule-based analysis, stores scan/finding metadata, generates a mock or Bedrock summary, and serves results plus PDF exports.

See also:

- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`SECURITY_MODEL.md`](SECURITY_MODEL.md)
- [`docs/aws-architecture-blueprint.md`](docs/aws-architecture-blueprint.md)

## Quick start with Docker

```bash
docker compose up --build
```

Then open the frontend at the URL printed by Docker Compose, normally `http://localhost:5173`, and run the guided sample review.

## Local development

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

Default mode uses the mock AI provider and does not require AWS credentials.

## Testing

Backend:

```bash
cd backend
mvn test
mvn package
```

Frontend:

```bash
cd frontend
npm ci
npm audit
npm run lint
npm run test
npm run build
```

Docker validation:

```bash
docker compose config
docker compose build
```

## Optional Bedrock mode

Bedrock is optional and disabled by default. Start the backend manually with environment variables such as:

```bash
AI_PROVIDER=bedrock \
AWS_REGION=us-east-1 \
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0 \
BEDROCK_SEND_RAW_CONTENT=false \
mvn spring-boot:run
```

Keep `BEDROCK_SEND_RAW_CONTENT=false` for portfolio demos and private code. Do not commit credentials or use real secrets in sample files.

## AWS architecture blueprint

The repository includes a blueprint for a future AWS deployment using options such as CloudFront/S3 or nginx for the frontend, App Runner or ECS Fargate for the backend, ECR, RDS PostgreSQL, Secrets Manager/SSM Parameter Store, CloudWatch, least-privilege IAM, and Bedrock. This is documentation only; deployment automation is not implemented.

## Security model

SecureStack AI is defensive by design:

- Uploaded files are treated as untrusted.
- Uploaded code is not executed.
- File size limits, extension checks, binary rejection, path traversal protection, and ZIP file-count limits are enforced.
- Demo secrets are fake and clearly marked.
- Markdown summaries render through an allow-listed React Markdown configuration without raw HTML plugins.
- Raw secrets are not meant to be persisted by default.

## Limitations

This project currently does **not** include public deployment, authentication, GitHub scanning, OpenAI integration, Semgrep, SARIF import/export, multi-user storage, or deployment automation. It is a portfolio/demo application and is not a replacement for a professional security assessment.

## Roadmap

Near-term polish focuses on screenshots, demo video, documentation review, and manual Bedrock smoke testing. Future production work would require authentication, authorization, abuse controls, rate limiting, durable multi-user storage, CI/CD hardening, and a deployment implementation.

## Recruiter review guide

Recommended review path:

1. Open the landing page and review the concise product narrative.
2. Click **Run sample security review**.
3. Confirm the scan form preloads the full portfolio demo.
4. Run the review and inspect the risk explanation, provider badge, fix-first panel, charts, finding details, status update control, and PDF export.
5. Review the backend rule/service structure and docs linked above.

More detail is available in [`docs/recruiter-review-guide.md`](docs/recruiter-review-guide.md).

## Final screenshot/demo note

Before publishing or recording, refresh screenshots for the landing page, scan form sample mode, results overview, finding details, PDF export, and AWS architecture blueprint. The repo is intentionally scoped to the current productized MVP; avoid claiming unsupported features.
