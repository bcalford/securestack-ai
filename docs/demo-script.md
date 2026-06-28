# 2–3 Minute Demo Script

## Opening

“SecureStack AI is a full-stack defensive security review app. It lets a user paste or upload source and configuration files, runs heuristic security checks, summarizes findings with mock AI by default or an optional manually configured Amazon Bedrock provider, and exports a polished PDF report. I built it to demonstrate software engineering, AI-assisted analysis patterns, cybersecurity, and cloud-ready architecture while keeping the default local workflow credential-free.”

## Landing page

“On the landing page, I quickly explain the product: a local-first security review workflow for code and configuration. The call to action takes me into a new scan, and the navigation also exposes scan history, a sample report, and project context.”

## New scan flow

“Here I create a scan by adding a scan name and pasting a sample vulnerable file. For a demo, I can use `samples/vulnerable-node-api/server.js`, `samples/insecure-terraform/main.tf`, or `samples/insecure-docker/Dockerfile`. The backend treats this input as untrusted and does not execute uploaded code.”

## Results dashboard

“After submitting, the frontend calls `POST /api/scans`, receives a scan ID, navigates to `/scans/{scanId}`, and loads results with `GET /api/scans/{scanId}`. The dashboard shows risk score, severity distribution, category breakdown, and a findings table with evidence and remediation guidance.”

## Filters and status updates

“I can search and filter findings by severity, category, and status. I can also update a finding’s review status, which demonstrates a small triage workflow rather than just static output.”

## PDF export

“The PDF export turns the scan into a shareable report with executive summary, risk score, severity and category breakdowns, files reviewed, findings, remediation checklist, methodology, limitations, and disclaimer.”

## Architecture and security model

“Architecturally, the app uses React, TypeScript, and Vite on the frontend; Java 21 and Spring Boot on the backend; rule classes for static analysis; local persistence; OpenHTMLToPDF for reporting; and Docker Compose. In Docker, nginx serves the frontend and proxies `/api` to the backend. The security model is defensive: uploaded files are untrusted, user-controlled report content is escaped, secret-like evidence is masked, and mock AI is the default so no real provider credentials are required.”

## Closing

“This project is intentionally scoped as a polished MVP. It shows full-stack delivery, typed frontend work, Spring service design, defensive security analysis, report generation, Docker readiness, CI, documentation, and optional manually configured Bedrock summaries. OpenAI, authentication, GitHub scanning, Semgrep/SARIF, and production AWS deployment are documented future work rather than claimed current features.”
