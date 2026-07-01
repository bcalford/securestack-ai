# Local Validation

Use these commands to verify the local application before sharing changes. The preferred path is the one-command validation script or matching Make targets.

## One-command validation

```bash
./scripts/validate-all.sh
make validate
```

For a faster local loop that skips backend packaging and frontend production build, run:

```bash
./scripts/validate-all.sh --quick
make validate-quick
```

Use `./scripts/validate-all.sh --skip-docker` when Docker is unavailable and you need to run the non-Docker checks only.

The validation script runs duplicate-file guardrails, secret-safety checks, backend tests, backend packaging unless `--quick` is set, frontend dependency installation if `node_modules` is missing, frontend lint/tests/build unless `--quick` is set, and Docker Compose configuration checks unless `--skip-docker` is set.

GitHub Actions CI mirrors the same local validation categories for pull requests and pushes to `main`: backend test/package, frontend lint/test/build, duplicate-file guardrails, secret-safety checks, default Docker Compose config validation, and PostgreSQL Compose override config validation. Keep local validation passing before opening a pull request so CI remains a confirmation step rather than the first validation run.

## Guardrail checks

```bash
./scripts/check-duplicates.sh
./scripts/check-secrets.sh
make check-duplicates
make check-secrets
```

`check-duplicates.sh` detects common accidental duplicate/copy artifacts including `2.java`, `2.ts`, `2.tsx`, `2.css`, `2.json`, `2.md`, `2.yml`, `2.yaml`, `3.java`, `3.ts`, `3.tsx`, `copy.*`, `Copy.*`, `*.orig`, and `*.rej`. It prints matching files and exits nonzero, but it does not delete files and does not claim to know why they were created.

`check-secrets.sh` performs conservative high-confidence checks for AWS access keys, private key headers, and obvious credential assignments while excluding known fake demo fixtures such as `frontend/src/data/demoSamples.ts` and `samples/**`.

## Optional local pre-commit hook

Install duplicate and secret guardrails as a local pre-commit hook with:

```bash
./scripts/install-hooks.sh
```

The installer writes `.git/hooks/pre-commit`. If an unrelated pre-existing hook is present, it backs it up before installing the SecureStack AI hook.

## Backend

```bash
cd backend
mvn test
mvn package
```

## Frontend

```bash
cd frontend
npm ci
npm run lint
npm run test
npm run build
```

## Docker

```bash
docker compose config
docker compose build
docker compose up --build
```

Open `http://localhost:5173` and confirm the app loads. CI is expected to mirror validation, but local validation remains the release-readiness source of truth before sharing changes.


## SARIF export validation

After creating a scan, verify the backend endpoint and frontend download path:

```bash
curl -f http://localhost:8080/api/scans/{scanId}/sarif
```

In the frontend results page, select **Download SARIF** and confirm a `securestack-scan-{scanId}.sarif.json` file is downloaded.

## Optional PostgreSQL Docker validation

The default Docker command remains H2-backed:

```bash
docker compose up --build
```

Validate the optional local PostgreSQL override without making PostgreSQL the default runtime:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml config
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up --build
```

Open `http://localhost:5173`, create a sample review, confirm it appears in scan history, then restart without removing volumes:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml down
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up --build
```

Confirm the scan history entry remains. To reset local PostgreSQL data, run:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml down -v
```

The PostgreSQL credentials in the override are development-only local defaults and are not production hardening.

## Mock-mode smoke test

1. Start the app with Docker Compose or local dev servers.
2. Open `http://localhost:5173/scans/new?sample=full-portfolio-demo`.
3. Run the review.
4. Confirm the summary provider is `mock`.
5. Optionally open `/scans/new`, choose **GitHub URL**, enter a public repository URL, and confirm the UI explains that import is public-only, local, token-free, and does not execute imported code.
6. Review the risk score, prioritized findings, finding details, rule catalog, remediation workflow summary, scan comparison, scan history, PDF export, sample report page, and SARIF download.

## Optional Bedrock smoke test

```bash
cd backend
AI_PROVIDER=bedrock \
AWS_REGION=us-east-1 \
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0 \
BEDROCK_SEND_RAW_CONTENT=false \
mvn spring-boot:run
```

Then run the frontend dev server, submit the guided sample review, and confirm the summary provider is `bedrock` or a controlled fallback message appears if Bedrock cannot be invoked.

## Secret-safety checks

Prefer the scripted check so local validation and Make targets use the same conservative patterns and fixture exclusions:

```bash
./scripts/check-secrets.sh
make check-secrets
```

Review any matches manually. Sample fixtures may contain fake demo-only secret strings and are intentionally excluded from this guard.
