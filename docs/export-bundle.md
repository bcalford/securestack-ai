# Export bundle

SecureStack AI v0.5.1 can download a ZIP bundle for a completed local review.

## Access

- Backend endpoint: `GET /api/scans/{scanId}/bundle`
- Frontend: open a completed scan and select **Download bundle** in the export report section.
- Downloaded filename format: `securestack-scan-{scanId}-bundle.zip`

## Bundle contents

The bundle contains generated review artifacts for offline handoff:

- `securestack-report.pdf`: PDF review report.
- `securestack-findings.sarif.json`: SARIF 2.1.0 findings export.
- `securestack-summary.json`: SecureStack JSON summary with scan metadata, summaries, counts, and findings.
- `README.txt`: bundle contents, generation context, and limitations.

Raw uploaded file contents are not included in the bundle.

## Limitations

The bundle is a local export convenience. It is not a hosted evidence system, does not upload to GitHub code scanning, does not import SARIF, and does not provide multi-user production storage.
