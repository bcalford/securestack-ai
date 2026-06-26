# Security Model

- Uploaded and pasted files are untrusted.
- The backend validates file names, file types, file sizes, and binary content indicators.
- Uploaded code is never executed.
- Findings are defensive and avoid exploit guidance.
- Raw secrets should not be persisted by default; evidence is masked before storage.
- Mock AI mode is the default and requires no external credentials.
- Reports escape user-controlled content before rendering HTML to PDF.

Limitations: rules are heuristic, can produce false positives, and do not replace professional review.
