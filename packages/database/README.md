# @nestora/database

PostgreSQL persistence for Nestora via [Prisma ORM](https://www.prisma.io/). The schema implements the **56 relational entities** defined in [docs/07-database-design.md](../../docs/07-database-design.md).

## Environment

Copy `.env.example` to `.env` and set **`DATABASE_URL`** and **`DIRECT_DATABASE_URL`** (same value for Neon **direct** host — no `-pooler` in the hostname). Do **not** use `channel_binding=require` in the URL.

### Neon looks empty (no tables)

The Neon project only shows tables **after** migrations run. Empty `public` schema is normal until then.

**Option A — your machine (fastest):**

```bash
cd packages/database
cp .env.example .env   # paste Neon direct connection strings from console
pnpm db:migrate:deploy
pnpm db:seed
```

> **Note on port 5432 blocks (ISP / Wi-Fi firewalls)**: If your network blocks outbound PostgreSQL port 5432 (producing `Can't reach database server`), run the HTTPS migration runner instead, which operates over port 443:
> ```bash
> pnpm --filter @nestora/database db:migrate:neon-http
> ```

In Neon **SQL Editor**: `SELECT migration_name FROM _prisma_migrations;` — you should see `20251105143000_initial_schema`.

**Option B — GitHub Actions (if local Prisma cannot reach Neon):**

1. Repo **Settings → Secrets → Actions** → add `NEON_DATABASE_URL` and `NEON_DIRECT_DATABASE_URL` (Neon console → **direct** connection string, `sslmode=require` only).
2. **Actions → Deploy database migrations → Run workflow**.

### Local Docker

```bash
pnpm docker:up
# use localhost URLs from .env.example
pnpm --filter @nestora/database db:migrate:deploy
```

## Commands

| Script                                              | Purpose                                        |
| --------------------------------------------------- | ---------------------------------------------- |
| `pnpm --filter @nestora/database db:validate`       | Validate `schema.prisma`                       |
| `pnpm --filter @nestora/database db:generate`       | Generate Prisma Client                         |
| `pnpm --filter @nestora/database db:migrate:dev`    | Create/apply development migrations            |
| `pnpm --filter @nestora/database db:migrate:deploy` | Apply migrations in deployment                 |
| `pnpm --filter @nestora/database db:seed`           | Upsert six documented room configurations only |
| `pnpm neon:seed-rooms` (from repo root)             | Demo inventory: **240 rooms / 540 beds** (30 single, 120 double, 90 triple; see `apps/api/scripts/seed-neon-rooms-and-beds.ts`) |

## PostgreSQL-specific SQL

Partial unique indexes, CHECK constraints, and audit-log immutability triggers are applied in the initial migration SQL (`prisma/migrations/*/migration.sql`) where Prisma schema alone cannot express them.

## Documentation conflict (fee schedules)

[docs/09-monorepo-architecture.md](../../docs/09-monorepo-architecture.md) describes a nullable `fee_schedules.hostel_id` for ODR-003 (university-wide vs hostel-specific fees). [docs/07-database-design.md](../../docs/07-database-design.md) §5.7 does **not** define `hostel_id` on `fee_schedules`. This package follows **doc 07** until the specification is reconciled.
