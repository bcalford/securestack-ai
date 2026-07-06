# Threat model artifact

SecureStack AI v0.4-alpha generates a defensive threat model artifact for each completed scan.

## Access

- Backend endpoint: `GET /api/scans/{scanId}/threat-model`
- Frontend: open a completed scan and expand **Threat model** in the security review artifacts panel.

## Contents

The artifact is derived from stored scan metadata and findings. It includes:

- Assets referenced by the scanned source and configuration.
- Entry points inferred from uploaded, pasted, sample, or public GitHub-imported files.
- Trust boundaries and data flows suggested by finding categories and filenames.
- Assumptions reviewers should confirm manually.
- Defensive abuse cases phrased as review prompts.
- Recommended controls linked to the current findings.
- Related finding IDs for traceability.

## Safety and limitations

The threat model is deterministic and defensive. It does not execute uploaded code, does not include exploit instructions, and does not replace manual architecture review. It is scoped to the files included in the local scan and the findings produced by the current rule set.
