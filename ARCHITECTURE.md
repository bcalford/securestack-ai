# Architecture

SecureStack AI is a local-first full-stack security review MVP with a guided demo UX.

## Frontend

React/TypeScript/Vite routes provide the landing page, new review form, results dashboard, scan history, about page, and sample report. Demo fixtures live in `frontend/src/data/demoSamples.ts`; risk-prioritization helpers live in `frontend/src/utils/risk.ts`.

## Backend pipeline

Spring Boot controllers remain thin. `ScanService` validates untrusted pasted/uploaded files, runs static rule classes, stores scan/finding data locally, asks the AI provider abstraction for summaries, and returns DTOs. Report generation uses OpenHTMLToPDF.

## AI provider abstraction

Mock summaries are default. Optional Bedrock uses manual environment configuration and keeps `BEDROCK_SEND_RAW_CONTENT=false` by default.

## Reports and persistence

PDF reports include score, findings, remediation checklist, methodology, limitations, and disclaimer. Local persistence is for demos, not multi-user production use.

## AWS blueprint

See [`docs/aws-architecture-blueprint.md`](docs/aws-architecture-blueprint.md) for App Runner and ECS Fargate future production options.
