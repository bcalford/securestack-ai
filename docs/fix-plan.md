# Fix plan artifact

SecureStack AI v0.4-alpha generates a deterministic fix plan for each completed scan.

## Access

- Backend endpoint: `GET /api/scans/{scanId}/fix-plan`
- Frontend: open a completed scan and expand **Fix plan** in the security review artifacts panel.

## Contents

The fix plan groups findings into:

- **Fix first:** critical and high severity findings.
- **Fix next:** medium severity findings.
- **Hardening backlog:** low and informational findings.

Each item includes a title, severity, estimated effort, expected risk reduction, suggested owner category, affected files, related rule IDs, and verification steps.

## Intended use

Use the fix plan to prioritize defensive remediation, assign owners, and decide what to verify after changes. The generated plan is a review aid only; teams should confirm impact, business context, compensating controls, and accepted residual risk before closing findings.
