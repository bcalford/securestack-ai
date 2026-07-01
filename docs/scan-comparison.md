# Scan comparison

SecureStack AI supports local comparison between two completed scans from the scan history page.

## How to compare scans

1. Open **Previous scans**.
2. Select two completed scan rows with **Select for comparison**.
3. Click **Compare selected scans**.
4. Review `/scans/compare?left={id}&right={id}`.

The left scan is treated as the baseline. The right scan is treated as the follow-up comparison.

## What is shown

The comparison page shows:

- Risk score delta: `right risk score - left risk score`.
- Finding count delta: `right finding count - left finding count`.
- New findings that appear only in the right scan.
- Resolved findings that appear only in the left scan.
- Unchanged findings present in both scans with the same severity and category.
- Severity/category differences for findings present in both scans where severity or category changed.

## Matching behavior

Comparison is local and deterministic. Findings are matched in the frontend using a stable key made from rule ID, file name, line number, and title. No additional ingestion path or backend comparison endpoint is required.

## Remediation workflow visibility

The results page includes a remediation workflow summary with counts for open, reviewed, false-positive, and fixed findings. The findings list can also be filtered by confidence and sorted by priority, severity, file, or status to support focused follow-up reviews.
