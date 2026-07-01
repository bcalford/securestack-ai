# Optional local PostgreSQL Docker mode

SecureStack AI runs with the default H2 in-memory database and mock AI provider when you use the base Docker Compose file. The PostgreSQL Compose override is an optional local development mode for checking database-backed scan history without changing the normal demo path.

This mode is local-only. The bundled credentials are development defaults, not real secrets, and must not be reused for shared, staged, or production environments. This setup is not multi-user production hardening and does not claim production migration management.

## Start PostgreSQL mode

From the repository root:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up --build
```

The override starts a `postgres:16-alpine` database, enables the backend `postgres` Spring profile, and connects the backend to `jdbc:postgresql://postgres:5432/securestack` with local development credentials.

## Stop PostgreSQL mode

Stop the running containers while keeping the named PostgreSQL volume:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml down
```

## Reset the PostgreSQL volume

Remove the containers and delete the persistent local database volume:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml down -v
```

The next PostgreSQL-mode start will create a fresh `securestack` database.

## Verify persistence

1. Start PostgreSQL mode:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.postgres.yml up --build
   ```

2. Open `http://localhost:5173` and create a sample review.
3. Confirm the scan appears in scan history.
4. Restart the app without removing volumes:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.postgres.yml down
   docker compose -f docker-compose.yml -f docker-compose.postgres.yml up --build
   ```

5. Open scan history again and confirm the previous scan is still listed.

If you run `down -v`, the named PostgreSQL volume is removed and previous local scan history is intentionally reset.
