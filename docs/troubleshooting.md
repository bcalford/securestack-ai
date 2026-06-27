# Troubleshooting

## Frontend cannot reach backend locally

Run the backend on port `8080` and the frontend on port `5173`. During local development, Vite proxies relative `/api` requests to `http://localhost:8080`.

## Docker frontend cannot reach backend

Use Docker Compose:

```bash
docker compose config
docker compose build
docker compose up
```

In Docker, nginx serves the frontend and proxies `/api` to the `backend` service. Do not depend on a runtime `VITE_API_BASE_URL` inside the built Vite app.

## Backend health check

Open `http://localhost:8080/api/health` while Compose is running.

## Missing scan returns 404

`GET /api/scans/{scanId}` returns a not-found response if the scan ID does not exist. Create a new scan first, then use the scan ID returned by `POST /api/scans`.

## PDF export issues

Create or open a valid scan before exporting. PDF generation is designed for defensive report output and escapes user-controlled content before rendering.

## Docker validation note

The repository documentation notes that the user validated Docker locally after adding screenshots. If an agent environment does not have Docker installed, do not claim Docker commands passed there; run the Docker commands locally before presenting fresh Docker validation.


## Optional Amazon Bedrock AI provider

SecureStack AI defaults to `AI_PROVIDER=mock`, which is deterministic, local, and requires no AWS credentials for Docker, tests, or normal development. An optional Bedrock mode can be enabled manually with `AI_PROVIDER=bedrock`, `AWS_REGION`, `BEDROCK_MODEL_ID` (default `amazon.nova-lite-v1:0`), `BEDROCK_MAX_TOKENS`, `BEDROCK_TEMPERATURE`, `BEDROCK_SEND_RAW_CONTENT=false`, and `BEDROCK_TIMEOUT_SECONDS`.

Bedrock prompts are defensive and remediation-focused. By default they send scan metadata, risk score/level, severity and category counts, filenames, finding titles/descriptions, confidence, line numbers, masked evidence, and recommendations. Raw uploaded file contents are not sent unless `BEDROCK_SEND_RAW_CONTENT=true`; that experimental mode is not recommended for real secrets, private code, or sensitive customer data. If credentials, region, model access, or model ID are missing, the backend returns a controlled fallback summary while static findings remain available.
