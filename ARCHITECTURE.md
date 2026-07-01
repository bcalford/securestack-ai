# Architecture

SecureStack AI is a local-first full-stack application for defensive security review of source and configuration files.

## Frontend

React, TypeScript, and Vite provide the landing page, review form, results dashboard, scan history, about page, and sample report. Demo fixtures live in `frontend/src/data/demoSamples.ts`; risk-prioritization helpers live in `frontend/src/utils/risk.ts`.

## Backend pipeline

Spring Boot controllers remain thin. `ScanService` validates untrusted pasted/uploaded files, runs static rule classes, stores scan/finding data locally, asks the AI provider abstraction for summaries, and returns DTOs. Report generation uses OpenHTMLToPDF, and SARIF export maps stored findings to SARIF 2.1.0 JSON.

## Analysis and summaries

Security rules live in `backend/src/main/java/com/securestack/analysis/rules/`. Mock summaries are default. Optional Bedrock uses manual environment configuration and keeps `BEDROCK_SEND_RAW_CONTENT=false` by default.

## Reports and persistence

PDF reports include score, findings, remediation checklist, methodology, limitations, and disclaimer. SARIF exports include rule and finding metadata for completed scans. Default local persistence uses H2; an optional PostgreSQL Docker override can validate local scan-history persistence. Local persistence is intended for local review workflows and is not multi-user production storage.

## AWS blueprint

See [`docs/aws-architecture-blueprint.md`](docs/aws-architecture-blueprint.md) for App Runner and ECS Fargate deployment options that would require additional security controls before public use.
