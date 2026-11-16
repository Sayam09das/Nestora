# Deploy Nestora: Vercel (web) + Render (API)

Split hosting: **Next.js** on Vercel, **Fastify** on Render, **Postgres + storage** on Neon.

## 1. Neon (database & object storage)

### One-shot (local, with `packages/database/.env` pointing at Neon)

```bash
pnpm deploy:bootstrap
# optional:
ADMIN_INIT_EMAIL=you@university.edu WEB_URL=https://your-app.vercel.app API_URL=https://nestora-ptgf.onrender.com pnpm deploy:bootstrap
```

### Or step by step

```bash
pnpm deploy:migrate:neon
pnpm deploy:admin:init -- --email you@university.edu   # skip if ACTIVE admin exists
```

### GitHub Actions

| Workflow | Purpose |
| -------- | ------- |
| **Deploy database migrations** | Migrate only (+ optional seed) |
| **Production bootstrap** | Migrate → optional admin → optional `API_URL` health check |

Repo secrets: `NEON_DATABASE_URL`, `NEON_DIRECT_DATABASE_URL`. Optional variable: `WEB_URL` (activation links).

1. Copy **pooled** `DATABASE_URL` and **direct** `DIRECT_DATABASE_URL` into Render.
2. Copy Neon Object Storage keys (`neon env pull`) for the API.

## 2. Render — API

### Option A: Blueprint

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect this repo; Render reads [`render.yaml`](../render.yaml) at the repo root.
3. Fill **sync: false** env vars after the service is created (see table below).

### Option B: Web service manually

- **Environment:** Docker  
- **Dockerfile path:** `docker/Dockerfile.api`  
- **Health check path:** `/health/ready`  
- **Branch:** `main`

### Render env (required)

| Variable | Example / notes |
| -------- | ---------------- |
| `API_URL` | `https://nestora-ptgf.onrender.com` (your Render URL) |
| `WEB_URL` | `https://your-app.vercel.app` |
| `CORS_ORIGIN` | Same as `WEB_URL` |
| `DATABASE_URL` | Neon **pooled** URL |
| `DIRECT_DATABASE_URL` | Neon **direct** URL (migrations use this via Prisma) |
| `COOKIE_SECRET` | 32+ chars (Blueprint can auto-generate) |
| `MFA_ENCRYPTION_SECRET` | 32+ chars, distinct from cookie secret |
| `STORAGE_DRIVER` | `neon` |
| `AWS_*` / buckets | From `neon env pull` |
| `TRUST_PROXY` | `true` |
| `SMTP_*` | Brevo or provider |

When `WEB_URL` and `API_URL` hosts differ, session cookies use **`SameSite=None; Secure`** automatically ([`cookie-same-site.ts`](../apps/api/src/config/cookie-same-site.ts)).

## 3. Vercel — Web

### Project settings

| Setting | Value |
| ------- | ----- |
| **Framework** | Next.js |
| **Root Directory** | `apps/web` |
| **Node.js Version** | 24.x |
| **Install Command** | *(from [`apps/web/vercel.json`](../apps/web/vercel.json))* |
| **Build Command** | *(from `vercel.json` — `pnpm turbo build --filter=@nestora/web`)* |

### Environment variables

| Variable | Value |
| -------- | ----- |
| `NEXT_PUBLIC_API_URL` | Render API URL, e.g. `https://nestora-ptgf.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | Vercel URL, e.g. `https://your-app.vercel.app` |

Redeploy the web app after changing `NEXT_PUBLIC_*` (build-time).

### Preview deployments

Add Vercel preview origins to Render:

```env
CORS_ORIGINS=https://your-app-git-branch-xxx.vercel.app
```

(Or rely on a single production URL only.)

## 4. Smoke test

```bash
API_URL=https://nestora-ptgf.onrender.com pnpm deploy:health
```

1. `GET https://<api>/health/ready` → 200, database connected.
2. Open Vercel URL → marketing home loads.
3. Login → session cookie on API domain, CSRF header from `/api/v1/auth/csrf-token`.
4. Upload a profile photo (Neon storage env on API).

## 5. First admin

```bash
# With production DATABASE_URL
pnpm --filter @nestora/database admin:init -- --email admin@university.edu
```

## Files in repo

| File | Purpose |
| ---- | ------- |
| [`render.yaml`](../render.yaml) | Render Blueprint for API (Docker) |
| [`apps/web/vercel.json`](../apps/web/vercel.json) | Monorepo install/build for Vercel |
| [`docker/Dockerfile.api`](../docker/Dockerfile.api) | API production image |