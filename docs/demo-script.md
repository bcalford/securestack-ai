# Demo Walkthrough

Use this walkthrough to evaluate the local application.

## Start the app locally

```bash
docker compose up --build
```

Open `http://localhost:5173`.

## Run the guided sample review

1. Click **Run sample security review**.
2. Confirm the sample files are preloaded.
3. Run the review.
4. Review the risk score, severity/category breakdowns, and prioritized findings.
5. Expand a finding to inspect evidence, recommendation, secure example, status, and rule ID.
6. Export the PDF report.

## Optional Bedrock mode

Run the backend manually with `AI_PROVIDER=bedrock` and `BEDROCK_SEND_RAW_CONTENT=false`, then start the frontend dev server and submit the same sample review. Mock AI remains the default for normal local use.
