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

## Local validation script failures

Run `./scripts/validate-all.sh` or `make validate` from the repository root. Use `./scripts/validate-all.sh --quick` or `make validate-quick` for a faster loop that skips backend packaging and frontend production build. If Docker is unavailable, use `./scripts/validate-all.sh --skip-docker` and report the Docker limitation separately.

## Duplicate-file guard failures

`./scripts/check-duplicates.sh` reports common accidental duplicate/copy artifacts such as `2.java`, `3.tsx`, `copy.*`, `*.orig`, and `*.rej`. The guard only detects and prints matching paths; it does not delete files automatically and does not claim to know the root cause. Review each reported file and remove or rename it intentionally before rerunning validation.

## Secret-safety guard failures

`./scripts/check-secrets.sh` reports high-confidence risky patterns such as AWS access keys, private key headers, and obvious credential assignments. Known fake demo fixtures under `frontend/src/data/demoSamples.ts` and `samples/**` are excluded. If a real secret is reported, rotate it before removing it from the working tree.

## Pre-commit hook installation

Run `./scripts/install-hooks.sh` from the repository root to install local duplicate and secret guardrails in `.git/hooks/pre-commit`. If an unrelated pre-existing hook exists, the installer backs it up before writing the SecureStack AI hook.

## Backend health check

Open `http://localhost:8080/api/health` while Compose is running.

## Missing scan returns 404

`GET /api/scans/{scanId}` returns a not-found response if the scan ID does not exist. Create a new scan first, then use the scan ID returned by `POST /api/scans`.

## PDF export issues

Create or open a valid scan before exporting. PDF generation is designed for defensive report output and escapes user-controlled content before rendering.

## Docker validation

Use `docker compose config` to validate the Compose file and `docker compose up --build` to verify the local container workflow. If Docker is unavailable in the current environment, report that limitation instead of claiming Docker validation passed.

## Optional Amazon Bedrock AI provider

SecureStack AI defaults to `AI_PROVIDER=mock`, which is deterministic, local, and requires no AWS credentials for Docker, tests, or normal development. An optional Bedrock mode can be enabled manually with `AI_PROVIDER=bedrock`, `AWS_REGION`, `BEDROCK_MODEL_ID` (default `amazon.nova-lite-v1:0`), `BEDROCK_MAX_TOKENS`, `BEDROCK_TEMPERATURE`, `BEDROCK_SEND_RAW_CONTENT=false`, and `BEDROCK_TIMEOUT_SECONDS`.

Bedrock prompts are defensive and remediation-focused. By default they send scan metadata, risk score/level, severity and category counts, filenames, finding titles/descriptions, confidence, line numbers, masked evidence, and recommendations. Raw uploaded file contents are not sent unless raw-content mode is explicitly enabled; that experimental mode is not recommended for real secrets, private code, or sensitive customer data. If credentials, region, model access, or model ID are missing, the backend returns a controlled fallback summary while static findings remain available.

## Bedrock Markdown displays as raw syntax

The results dashboard renders Bedrock executive and remediation summaries with `react-markdown` using default-safe Markdown handling and no raw HTML passthrough. If `###`, `**bold**`, or list markers appear literally, rebuild the frontend image or restart the Vite dev server so the latest dashboard bundle is loaded.

## Bedrock fallback summary

If `AI_PROVIDER=bedrock` is selected but Bedrock cannot be invoked, static findings should still be available and the summary should fall back to a controlled message. Check AWS credentials, `AWS_REGION`, `BEDROCK_MODEL_ID`, model access, IAM permissions such as `bedrock:InvokeModel`, and timeout settings. Common causes include `AccessDeniedException`, using a model in the wrong region, a model ID typo, missing model access, missing local credentials, or a network timeout.


## SARIF download issues

Create or open a valid scan before downloading SARIF. The endpoint is `GET /api/scans/{scanId}/sarif`; a missing scan ID returns the same not-found behavior as other scan lookups. SARIF support is export-only. SARIF import and GitHub code scanning upload/automation are not implemented.

## Optional PostgreSQL mode issues

Use `docker compose -f docker-compose.yml -f docker-compose.postgres.yml config` to validate the override. If scan history does not persist after restart, confirm you used `down` without `-v`; `down -v` removes the named PostgreSQL volume by design. The bundled `securestack` database credentials are local development defaults only.
