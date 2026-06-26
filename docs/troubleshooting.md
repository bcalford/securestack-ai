# Troubleshooting

## Frontend cannot reach backend locally
Run the backend on port 8080 and the frontend on port 5173. Vite proxies `/api` to `http://localhost:8080` during development.

## Docker frontend cannot reach backend
Use `docker compose up`; nginx proxies `/api` to the `backend` service inside the Compose network. Do not rely on `VITE_API_BASE_URL` at container runtime.

## Missing scan returns 404
`GET /api/scans/{scanId}` returns a `NOT_FOUND` error if the scan ID does not exist.

## Docker validation
If Docker is unavailable in an agent environment, run `docker compose config` and `docker compose build` locally before presenting Docker as validated.
