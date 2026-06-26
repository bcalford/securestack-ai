# Troubleshooting

## Frontend cannot reach backend locally

Run the backend on port `8080` and the frontend on port `5173`. During local development, Vite proxies relative `/api` requests to `http://localhost:8080`.

## Docker frontend cannot reach backend

Use Docker Compose:

```bash
docker compose config
docker compose build
docker compose up
```

In Docker, nginx serves the frontend and proxies `/api` to the `backend` service. Do not depend on a runtime `VITE_API_BASE_URL` inside the built Vite app.

## Backend health check

Open `http://localhost:8080/api/health` while Compose is running.

## Missing scan returns 404

`GET /api/scans/{scanId}` returns a not-found response if the scan ID does not exist. Create a new scan first, then use the scan ID returned by `POST /api/scans`.

## PDF export issues

Create or open a valid scan before exporting. PDF generation is designed for defensive report output and escapes user-controlled content before rendering.

## Docker validation note

The repository documentation notes that the user validated Docker locally after adding screenshots. If an agent environment does not have Docker installed, do not claim Docker commands passed there; run the Docker commands locally before presenting fresh Docker validation.
