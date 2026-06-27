# Architecture

SecureStack AI is a local-first full-stack security review MVP.

## Components

- **Frontend:** React, TypeScript, Vite, reusable route/component structure, and Vitest tests.
- **Docker frontend serving:** nginx serves the built frontend and proxies `/api` requests to the backend service inside Docker Compose.
- **Backend:** Java 21, Spring Boot, DTO-based API layer, scan orchestration services, local persistence, and OpenHTMLToPDF reporting.
- **Analysis:** Defensive static heuristic rules under `backend/src/main/java/com/securestack/analysis/rules/`.
- **AI summary:** Mock AI provider by default. Real Bedrock/OpenAI integrations are future/manual setup and are not required for the app to run.
- **CI:** GitHub Actions runs backend tests/package and frontend install/lint/test/build without secrets.

## Request flow

1. User opens the React app at `http://localhost:5173`.
2. User creates a scan from pasted or uploaded files.
3. Frontend sends `POST /api/scans`.
4. Backend validates untrusted inputs and does not execute uploaded code.
5. Scan service runs static heuristic rules and mock AI summary generation.
6. Backend returns a scan ID and DTO response.
7. Frontend navigates to `/scans/{scanId}` and calls `GET /api/scans/{scanId}`.
8. User reviews dashboard, filters findings, updates finding status, exports PDF, or opens scan history.

## Docker networking

Docker Compose exposes:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8080/api/health`

The frontend container does not rely on a runtime `VITE_API_BASE_URL`. Instead, nginx proxies relative `/api` requests to `http://backend:8080/api/` on the Compose network.

## Data and report boundaries

The MVP uses local persistence suitable for demos and development. PDF generation escapes user-controlled content and documents methodology, limitations, and disclaimer text. Deployment documentation is guidance only, not proof that the project is deployed to AWS.


## Optional Amazon Bedrock AI provider

SecureStack AI defaults to `AI_PROVIDER=mock`, which is deterministic, local, and requires no AWS credentials for Docker, tests, or normal development. An optional Bedrock mode can be enabled manually with `AI_PROVIDER=bedrock`, `AWS_REGION`, `BEDROCK_MODEL_ID` (default `amazon.nova-lite-v1:0`), `BEDROCK_MAX_TOKENS`, `BEDROCK_TEMPERATURE`, `BEDROCK_SEND_RAW_CONTENT=false`, and `BEDROCK_TIMEOUT_SECONDS`.

Bedrock prompts are defensive and remediation-focused. By default they send scan metadata, risk score/level, severity and category counts, filenames, finding titles/descriptions, confidence, line numbers, masked evidence, and recommendations. Raw uploaded file contents are not sent unless `BEDROCK_SEND_RAW_CONTENT=true`; that experimental mode is not recommended for real secrets, private code, or sensitive customer data. If credentials, region, model access, or model ID are missing, the backend returns a controlled fallback summary while static findings remain available.
