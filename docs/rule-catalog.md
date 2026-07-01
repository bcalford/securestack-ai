# Rule Catalog

SecureStack AI exposes a static-analysis rule catalog at `GET /api/rules` and in the frontend at `/rules`.

The catalog helps reviewers understand what the local deterministic scanner checks before they upload or paste files. Each entry includes:

- Rule ID
- Title
- Category
- Default severity
- Description
- Recommendation
- Review depth behavior

Rules are sorted by stable rule ID so API consumers and tests receive deterministic output. Review depth behavior mirrors scan execution: critical and high-severity rules run in quick, standard, and full scans; medium and low-severity rules run in standard and full scans; informational rules run in full scans.

The catalog is documentation for defensive review coverage only. It does not execute uploaded code, disclose exploit steps, or change finding detection behavior.
