# Demo Walkthrough

Use this 5 to 7 minute walkthrough to evaluate SecureStack AI as a local-first defensive security review application.

## 0:00-0:45 — Open the README

1. Open `README.md` and review the **Guided demo**, **Security model**, and **Limitations** sections.
2. Confirm the app is positioned as a local/demo-oriented tool, not a hosted scanner.
3. Note that mock AI is the default, uploaded code is not executed, and raw file storage is disabled by default.

## 0:45-1:30 — Start the Docker app

```bash
docker compose up --build
```

Open `http://localhost:5173` after the frontend starts.

## 1:30-2:15 — Open the landing page

On the landing page, highlight the end-to-end workflow:

- add files by paste, upload, demo sample, or public GitHub URL;
- analyze locally with deterministic defensive rules;
- review risk, prioritized findings, and remediation context;
- export PDF, SARIF, JSON, or the ZIP bundle.

## 2:15-3:00 — Run the guided sample review

1. Click **Run sample security review**.
2. Confirm the sample files are preloaded and clearly labeled as demo-only content.
3. Start the review.
4. Explain that the sample uses intentionally vulnerable fixture files and fake demo-only secrets.

## 3:00-4:15 — Explain local-first safety and inspect results

On the results page, explain the safety boundary:

- files are treated as untrusted;
- uploaded code is never executed;
- findings mask secret-like evidence;
- mock AI summaries run by default;
- optional Bedrock mode must be manually configured and raw-content sending remains off by default.

Then inspect the risk score, severity breakdown, category breakdown, and finding count.

## 4:15-5:15 — Show fix-first findings and review artifacts

1. Open **Fix these first** to show the highest-priority remediation items.
2. Expand a finding and point out masked evidence, confidence, recommendation, secure example, status, and rule ID.
3. Show the threat model, risk paths, fix plan, and security review checklist.
4. Explain why these outputs matter: they turn raw findings into defensible remediation planning and verification steps.

## 5:15-6:15 — Show rule catalog and scan comparison

1. Open **Rules** and show the searchable rule catalog for backend/frontend rule transparency.
2. Open **Review history** and show completed scans.
3. If two completed scans are available, open **Regression review** to compare risk trend, new findings, resolved findings, and unchanged findings.

## 6:15-7:00 — Export and close with limitations

1. Return to the completed review and export the PDF report, SARIF, SecureStack JSON, or ZIP bundle.
2. Close by stating the limitations honestly:
   - local/demo-oriented and unauthenticated;
   - no hosted scanner or production multi-user storage;
   - public GitHub import is public-only with no OAuth, tokens, private repo access, GitHub App, or code scanning upload;
   - SARIF is export-only;
   - no Semgrep execution or OpenAI provider;
   - findings are heuristic triage signals and should be validated before remediation decisions.
