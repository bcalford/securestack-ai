# Local Validation

Use these commands to verify the local application before sharing changes.

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

Open `http://localhost:5173` and confirm the app loads.

## Mock-mode smoke test

1. Start the app with Docker Compose or local dev servers.
2. Open `http://localhost:5173/scans/new?sample=full-portfolio-demo`.
3. Run the review.
4. Confirm the summary provider is `mock`.
5. Review the risk score, prioritized findings, finding details, scan history, and PDF export.

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

```bash
git grep -n -i "AKIA[0-9A-Z]\\{12,\\}"
git grep -n -i "api[_-]\\?key\\|password\\|secret\\|token" -- ':!frontend/src/data/demoSamples.ts' ':!samples'
git grep -n "rehypeRaw\\|dangerouslySetInnerHTML"
```

Review any matches manually. Sample fixtures may contain fake demo-only secret strings.
