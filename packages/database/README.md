# @nestora/database

PostgreSQL persistence for Nestora via [Prisma ORM](https://www.prisma.io/). The schema implements the **56 relational entities** defined in [docs/07-database-design.md](../../docs/07-database-design.md).

## Environment

Copy `.env.example` to `.env` and set `DATABASE_URL`. Start local PostgreSQL with:

```bash
pnpm docker:up
```

## Commands

| Script                                              | Purpose                                        |
| --------------------------------------------------- | ---------------------------------------------- |
| `pnpm --filter @nestora/database db:validate`       | Validate `schema.prisma`                       |
| `pnpm --filter @nestora/database db:generate`       | Generate Prisma Client                         |
| `pnpm --filter @nestora/database db:migrate:dev`    | Create/apply development migrations            |
| `pnpm --filter @nestora/database db:migrate:deploy` | Apply migrations in deployment                 |
| `pnpm --filter @nestora/database db:seed`           | Upsert six documented room configurations only |

## PostgreSQL-specific SQL

Partial unique indexes, CHECK constraints, and audit-log immutability triggers are applied in the initial migration SQL (`prisma/migrations/*/migration.sql`) where Prisma schema alone cannot express them.

## Documentation conflict (fee schedules)

[docs/09-monorepo-architecture.md](../../docs/09-monorepo-architecture.md) describes a nullable `fee_schedules.hostel_id` for ODR-003 (university-wide vs hostel-specific fees). [docs/07-database-design.md](../../docs/07-database-design.md) §5.7 does **not** define `hostel_id` on `fee_schedules`. This package follows **doc 07** until the specification is reconciled.
