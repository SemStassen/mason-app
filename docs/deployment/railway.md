# Railway Deployment

## Services

Create these services in one Railway project:

1. `postgres` using Railway Postgres
2. `electric` using the `electricsql/electric:latest` image
3. `telemetry` using the `grafana/otel-lgtm` image
4. `backend` from this repo with config file `apps/backend/railway.json`
5. `electric-proxy` from this repo with config file `apps/electric-proxy/railway.json`

Keep `electric` private-only. Expose `backend`, `electric-proxy`, and `telemetry` publicly.

## Volumes

Attach a persistent volume to `electric` at `/data`.

Attach a volume to `telemetry` only if you want its Grafana data to persist.

## Variables

### backend

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
ENCRYPTION_KEY=<64-char hex string>
GOOGLE_CLIENT_ID=<google client id>
GOOGLE_CLIENT_SECRET=<google client secret>
OTEL_EXPORTER_OTLP_ENDPOINT=http://telemetry.railway.internal:4318
FRONTEND_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

### electric-proxy

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
ELECTRIC_URL=http://electric.railway.internal:3000
ENCRYPTION_KEY=<64-char hex string>
GOOGLE_CLIENT_ID=<google client id>
GOOGLE_CLIENT_SECRET=<google client secret>
OTEL_EXPORTER_OTLP_ENDPOINT=http://telemetry.railway.internal:4318
FRONTEND_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

Optional:

```text
ELECTRIC_SOURCE_ID=<electric source id>
ELECTRIC_SOURCE_SECRET=<electric source secret>
```

### electric

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
ELECTRIC_PORT=3000
ELECTRIC_STORAGE_DIR=/data
```

### frontend on Vercel

```text
VITE_BACKEND_URL=https://<backend-domain>
VITE_ELECTRIC_PROXY_URL=https://<proxy-domain>
```

## Deploy Order

1. Create `postgres`
2. Create `telemetry`
3. Create `electric` and attach its volume
4. Push the database schema to Railway Postgres
5. Deploy `backend`
6. Deploy `electric-proxy`
7. Set Vercel env vars and deploy the frontend

## Notes

1. `backend` and `electric-proxy` both expose `GET /health` for Railway health checks.
2. `FRONTEND_ORIGINS` is a comma-separated allowlist used by backend CORS, proxy CORS, and Better Auth trusted origins.
3. `backend` and `electric-proxy` use Railpack with `bun run apps/.../src/index.ts` start commands.
4. `FRONTEND_ORIGINS` is required in every environment, including local development.
5. For local development, set `FRONTEND_ORIGINS=tauri://localhost,http://tauri.localhost,http://localhost:8002`.
6. For Vercel, use the production URL plus a scoped preview wildcard like `https://your-app.vercel.app,https://your-app-*.vercel.app`.
