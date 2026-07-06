# Scan comparison and regression review

SecureStack AI supports a local **Regression review** mode for comparing two completed scans from scan history. This is a UI workflow over stored scan results; it does not add production CI scanning, public deployment, authentication, or a new scan input method.

## How to compare scans

1. Open **Previous scans**.
2. Select two completed scan rows with **Select for regression review**.
3. Click **Compare selected scans**. The action is disabled until exactly two scans are selected.
4. Review `/scans/compare?left={id}&right={id}`.

The left scan is treated as the baseline. The right scan is treated as the follow-up comparison.

## What is shown

The comparison page uses regression wording and shows:

- Scan names and timestamps for the baseline and follow-up scans.
- **Risk trend** with risk score delta: `right risk score - left risk score`.
- Finding count delta: `right finding count - left finding count`.
- Counts for **New findings**, **Resolved findings**, and **Unchanged findings**.
- Severity delta by severity label.
- Category delta by category label.
- Cards for new findings that appear only in the follow-up scan.
- Cards for resolved findings that appear only in the baseline scan.
- An unchanged findings summary.
- Changed findings when severity, status, file, or category changed.
- Controlled empty states when two scans are not selected or no findings match a section.

## Matching behavior

Comparison is local and deterministic. Findings are matched with stable keys based on:

- Rule ID.
- File name.
- Line number when present.
- Title.
- Category.
- Normalized evidence that is already present in the finding record and expected to be masked/safe.

If an otherwise identical finding appears to move between files or categories, the helper can still pair the baseline and follow-up findings using a narrower fallback key based on rule ID, line number, title, and normalized evidence. That allows the UI to classify changed file/category cases without incorrectly reporting them as separate new and resolved findings.

## Classification

The helper classifies findings as:

- **New findings**: present only in the follow-up scan.
- **Resolved findings**: present only in the baseline scan.
- **Unchanged findings**: present in both scans with the same severity, status, file, and category.
- **Changed findings**: present in both scans but changed severity, status, file, or category.

## Remediation workflow visibility

The results page includes a remediation workflow summary with counts for open, reviewed, false-positive, and fixed findings. The findings list can also be filtered by confidence and sorted by priority, severity, file, or status to support focused follow-up reviews.
