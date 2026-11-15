# Nestora Docker

## Prerequisites

1. **Docker Desktop** installed and **running** (menu bar whale icon). If you see  
   `failed to connect to the docker API at unix:///Users/sayamdas/.docker/run/docker.sock`,  
   open Docker Desktop and wait until it says “Engine running”.
2. Run all `pnpm docker:*` commands from the **repo root** (`Nestora/`), not `apps/`.

## Local infrastructure only

PostgreSQL and MailHog for `pnpm dev` on the host:

```bash
pnpm docker:up
```

## Production-style images

| File | Image |
|------|--------|
| `Dockerfile.api` | Fastify API on port **4000** (`node dist/server.js` after `pnpm deploy`) |
| `Dockerfile.web` | Next.js **standalone** on port **3000** |

Build images:

```bash
pnpm docker:build:api
pnpm docker:build:web
```

Run API + Web + Postgres + MailHog together:

```bash
pnpm docker:prod:up
```

Before first login, apply migrations to the **local** Postgres container (not Neon):

```bash
pnpm docker:db:migrate
```

Or set both URLs (Prisma uses `DIRECT_DATABASE_URL` for migrate deploy):

```bash
DATABASE_URL='postgresql://nestora:nestora_dev_pw@localhost:5432/nestora_db?schema=public' \
DIRECT_DATABASE_URL='postgresql://nestora:nestora_dev_pw@localhost:5432/nestora_db?schema=public' \
pnpm db:migrate:deploy
```

Neon in `packages/database/.env` is still used for normal `pnpm db:migrate:deploy` when you omit the overrides above.

`docker-compose.prod.yml` sets `NEXT_PUBLIC_API_URL=http://localhost:4000` at **build** time so the browser can reach the API from your machine. Behind a reverse proxy, pass build args:

```bash
docker build -f docker/Dockerfile.web \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.edu \
  --build-arg NEXT_PUBLIC_SITE_URL=https://nestora.example.edu \
  -t nestora-web:local .
```

The release workflow (`.github/workflows/release.yml`) builds both images on `workflow_dispatch` for smoke-testing Docker in CI.