# SARIF export

SecureStack AI can export completed scan findings as SARIF 2.1.0 JSON for local review and tool interoperability experiments.

## How to download

- Backend endpoint: `GET /api/scans/{scanId}/sarif`
- Frontend: open a completed scan and select **Download SARIF** in the export report section.
- Downloaded filename format: `securestack-scan-{scanId}.sarif.json`

## What is included

The export contains one SARIF run for SecureStack AI findings, including:

- SARIF `version` and schema URI.
- Tool driver metadata for SecureStack AI.
- Deduplicated rule metadata by `ruleId`, with title, description, and remediation help when available.
- One result per finding, sorted deterministically by rule, file, line, and title.
- File URI, line number when available, finding title, category, confidence, and recommendation.

Raw uploaded file contents are not included in the SARIF response.

## Severity mapping

SecureStack AI severities map to SARIF levels as follows:

| SecureStack severity | SARIF level |
| --- | --- |
| `CRITICAL` | `error` |
| `HIGH` | `error` |
| `MEDIUM` | `warning` |
| `LOW` | `warning` |
| `INFO` | `note` |

If a finding has no severity, the export uses `warning`.

## Limitations

- SARIF support is export-only.
- SARIF import is not implemented.
- GitHub code scanning upload, repository scanning, and automation are not implemented.
- Semgrep integration or Semgrep SARIF ingestion is not implemented.
