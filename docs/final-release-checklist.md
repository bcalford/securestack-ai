# Final Release Checklist

## Validation commands

- `git status -sb`
- `cd backend && mvn test && mvn package`
- `cd frontend && npm ci && npm audit && npm run lint && npm run test && npm run build`
- `docker compose config`
- `docker compose build`
- Frontend dangerous-render grep and repository secret checks.

## Manual flows

- Mock flow: Docker Compose up, run sample review, verify provider mock, fix-first panel, finding details, PDF export, scan history.
- Bedrock flow: manually run backend with `AI_PROVIDER=bedrock` and `BEDROCK_SEND_RAW_CONTENT=false`, run frontend dev server, verify provider bedrock and PDF export.

## Release assets

- Refresh screenshots: landing, sample selector, mock results, Bedrock results, finding details, scan history, PDF report.
- Record short demo video.
- Review docs and limitations.
- Update GitHub repo description/topics.
- Deferred: resume and LinkedIn update.
