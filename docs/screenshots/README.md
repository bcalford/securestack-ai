# Screenshots

These screenshots were locally validated by the project owner using the Docker Compose workflow and then committed to the repository for launch presentation.

## Current screenshot files

- `landing.png` — landing page with product positioning and primary call to action.
- `new-scan.png` — new scan form for pasted/uploaded source or configuration files.
- `results-dashboard.png` — scan results dashboard with risk summary, charts, and findings overview.
- `pdf-report.png` — exported PDF report view.
- `scan-history.png` — scan history page showing previously created scans.

## Missing recommended screenshots

Recommended but not currently present:

- Finding details view showing evidence, recommendation, and status controls.
- About page showing project scope and technology summary.

The filters screenshot placeholder was intentionally removed from this checklist.

## Regenerating screenshots after UI changes

1. Start the app with Docker:
   ```bash
   docker compose build
   docker compose up
   ```
2. Open `http://localhost:5173`.
3. Create a scan using one of the sample projects under `samples/`.
4. Capture updated PNG screenshots for the views listed above.
5. Save replacements in this directory using stable, lowercase, hyphenated filenames.
6. Update this README and the root `README.md` screenshot gallery if filenames are added, removed, or renamed.
