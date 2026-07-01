# SecureStack AI

SecureStack AI is a local-first defensive security review application for analyzing source and configuration files. It combines a React/Vite frontend, Java 21 Spring Boot API, deterministic static security rules, mock AI summaries by default, optional Amazon Bedrock summaries, and PDF/SARIF report export.

## Features

- Guided scan creation from pasted files, uploaded files/ZIP archives, or built-in safe demo samples.
- Static checks for secrets, authentication/session risks, API misconfiguration, dependency scripts, Dockerfiles, and cloud/IaC patterns.
- Risk scoring, severity/category breakdowns, and prioritized findings.
- Finding details with evidence, remediation guidance, secure examples, status updates, and rule IDs.
- Mock AI summaries by default, with optional manually configured Amazon Bedrock summaries.
- PDF report export and SARIF 2.1.0 JSON export for completed reviews.

## Tech stack

- **Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Vitest, Testing Library.
- **Backend:** Java 21, Spring Boot, Spring Web, Spring Data JPA, default H2 persistence, optional local PostgreSQL profile, Maven.
- **Security analysis:** Rule classes for deterministic defensive findings plus risk scoring and provider-abstracted AI summaries.
- **Reporting:** Server-generated PDF export and backend SARIF 2.1.0 export.
- **Local runtime:** Docker Compose.
- **Optional cloud AI:** Amazon Bedrock when manually configured.

## Quick start

```bash
docker compose up --build
```

Open `http://localhost:5173` and run the guided sample review.

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

The backend runs on `http://localhost:8080`. The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend.

## Guided demo

Click **Run sample security review** on the landing page or open:

```text
/scans/new?sample=full-portfolio-demo
```

The app preloads intentionally vulnerable fixture files with fake demo-only secrets. Run the review, inspect the risk score and prioritized findings, expand finding details, and export PDF or SARIF from the results page.

## Screenshots

### Landing page

![Landing page](docs/screenshots/landing-page.png)

### Guided sample review

![Guided sample review](docs/screenshots/sample-review.png)

### Results overview

![Results overview](docs/screenshots/results-overview.png)

### Finding details

![Finding details](docs/screenshots/finding-details.png)

### Scan history

![Scan history](docs/screenshots/scan-history.png)

### PDF report

![PDF report](docs/screenshots/pdf-report.png)

## Optional Bedrock mode

Mock AI is the default and requires no AWS credentials. Bedrock is optional and configured manually:

```bash
AI_PROVIDER=bedrock \
AWS_REGION=us-east-1 \
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0 \
BEDROCK_SEND_RAW_CONTENT=false \
mvn spring-boot:run
```

Keep `BEDROCK_SEND_RAW_CONTENT=false` for private code and sample reviews. Do not commit credentials or use real secrets in sample files.

## Architecture

The frontend submits pasted or uploaded files to the backend scan API. The backend validates untrusted inputs, rejects unsafe paths and unsupported/binary/oversized files, expands ZIP files safely, runs rule-based analysis, stores scan and finding metadata locally, generates a mock or Bedrock summary, and serves results plus PDF and SARIF exports.

See [`ARCHITECTURE.md`](ARCHITECTURE.md), [`SECURITY_MODEL.md`](SECURITY_MODEL.md), and [`docs/aws-architecture-blueprint.md`](docs/aws-architecture-blueprint.md).

## Security model

- Local/demo-oriented and unauthenticated.
- Uploaded code is not executed.
- File size limits, extension checks, binary rejection, path traversal protection, and ZIP file-count limits are enforced.
- Secret-like evidence is masked in findings and reports.
- Raw file-content storage is disabled by default.
- Bedrock raw-content mode is disabled by default.
- Markdown summaries render without raw HTML passthrough; PDF content is escaped before rendering.

## Limitations

- No authentication or authorization.
- No public deployment or hosted demo.
- No GitHub repository scanning.
- No OpenAI provider.
- No Semgrep integration or SARIF import/code-scanning integration; SARIF support is export-only.
- No multi-user production storage.
- No production AWS deployment automation.

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`SECURITY_MODEL.md`](SECURITY_MODEL.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`docs/local-validation.md`](docs/local-validation.md)
- [`docs/sarif-export.md`](docs/sarif-export.md)
- [`docs/postgres-profile.md`](docs/postgres-profile.md)
- [`docs/demo-script.md`](docs/demo-script.md)
- [`docs/technical-review-guide.md`](docs/technical-review-guide.md)
- [`docs/sample-findings.md`](docs/sample-findings.md)
- [`docs/troubleshooting.md`](docs/troubleshooting.md)
- [`docs/aws-architecture-blueprint.md`](docs/aws-architecture-blueprint.md)
- [`docs/deployment-aws.md`](docs/deployment-aws.md)
