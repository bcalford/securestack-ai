# Architecture

SecureStack AI uses a React/Vite frontend, a Spring Boot backend, an H2-backed local persistence layer, static rule classes, a mock AI provider, and OpenHTMLToPDF report generation.

Flow: landing page -> new scan form -> `POST /api/scans` -> scan result DTO -> frontend navigation to `/scans/{scanId}` -> `GET /api/scans/{scanId}` -> dashboard, filters, status updates, and PDF export.

The backend keeps controllers thin, performs scan orchestration in `ScanService`, keeps detection logic in `analysis/rules`, and returns DTOs rather than JPA entities.
