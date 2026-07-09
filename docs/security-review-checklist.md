# Security review checklist

SecureStack AI v0.5.1 generates a checklist for each completed scan to help reviewers track local release-readiness tasks.

## Access

- Backend endpoint: `GET /api/scans/{scanId}/checklist`
- Frontend: open a completed scan and expand **Security review checklist** in the security review artifacts panel.

## Checklist coverage

Checklist items cover whether findings need triage, high severity items are present, secret findings need rotation/removal review, export records were generated, the fix plan was reviewed, and follow-up validation should be run.

Statuses are derived from the current scan findings and are intended to prompt reviewer action. They are not a compliance attestation and do not prove that remediation has been completed.

## Review guidance

Use the checklist together with the findings list, PDF report, JSON export, SARIF export, and export bundle. Keep manual review in the loop for architecture-specific controls, production readiness, and any decision to accept residual risk.
