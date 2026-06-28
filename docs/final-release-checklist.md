# Final Release Checklist

Use this checklist after the release-freeze hardening pass and before recording the final demo or refreshing launch screenshots.

## Repository truth check

- [ ] Mock AI remains the default (`AI_PROVIDER=mock`) and runs without external credentials.
- [ ] Optional Amazon Bedrock mode is documented as implemented for manual local setup.
- [ ] Bedrock has been manually validated locally by the project owner.
- [ ] Bedrock raw uploaded file content sending remains disabled by default (`BEDROCK_SEND_RAW_CONTENT=false`).
- [ ] OpenAI provider integration is still documented as future work.
- [ ] Authentication and user-owned scans are still documented as future work.
- [ ] GitHub repository scanning is still documented as future work.
- [ ] Semgrep/SARIF ingestion is still documented as future work.
- [ ] Production AWS deployment automation is still documented as future work.
- [ ] Docker local mode remains the supported runnable demo path.

## Security and privacy check

- [ ] Do not commit real AWS keys, local profile names, access tokens, or provider secrets.
- [ ] Confirm `.env.example` contains placeholders/defaults only.
- [ ] Confirm uploaded files are still treated as untrusted and are not executed.
- [ ] Confirm secret-like evidence is masked in findings and AI prompt context.
- [ ] Confirm PDF/report output continues escaping user-controlled content.
- [ ] Confirm live AI provider usage warnings remain clear for private, work, research, or sensitive code.

## Bedrock and Markdown check

- [ ] Confirm the results dashboard shows `Summary provider: mock` or `Summary provider: bedrock`.
- [ ] Confirm Bedrock Markdown headings, bold labels, and lists render cleanly in the dashboard.
- [ ] Confirm `react-markdown` is used without `rehype-raw` or raw HTML passthrough.
- [ ] Confirm mock summaries still display correctly.
- [ ] Confirm Bedrock fallback summaries are controlled and do not expose secrets.

## Validation commands

Run these from the repository root unless noted otherwise:

```bash
git status -sb
git branch --show-current
git log --oneline -n 10
cd frontend && npm ci
cd frontend && npm audit
cd frontend && npm run lint
cd frontend && npm run test
cd frontend && npm run build
cd backend && mvn test
docker compose config
```

If Docker is available locally for the release pass, also run:

```bash
docker compose build
docker compose up
```

Then open `http://localhost:5173` and create a scan from a sample project.

## Screenshot and demo pass

- [ ] Refresh screenshots after the current UI is running locally.
- [ ] Ensure screenshots include the latest Bedrock Markdown rendering if Bedrock mode is part of launch materials.
- [ ] Update `docs/screenshots/README.md` and the root README screenshot gallery if filenames change.
- [ ] Record the final demo only after docs, tests, and screenshots are consistent.
