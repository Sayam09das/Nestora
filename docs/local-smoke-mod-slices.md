# Local smoke — MOD-05 / MOD-06 / MOD-14 / system_config

API defaults to **`http://127.0.0.1:4000`**. Browser flows use **`http://localhost:3000`** (proxied `/api/v1`).

## Prerequisites

```bash
pnpm install
pnpm db:migrate:deploy
pnpm --filter @nestora/validators build
pnpm --filter @nestora/api dev   # :4000
pnpm --filter @nestora/web dev   # :3000
```

## Automated API smoke

Set credentials for any roles you have seeded (omit roles to skip):

```bash
export SMOKE_STUDENT_EMAIL='sayamdas9124@gmail.com'
export SMOKE_STUDENT_PASSWORD='SayamTest@2025!'
# export SMOKE_WARDEN_EMAIL=...
# export SMOKE_ACCOUNTANT_EMAIL=...
# export SMOKE_ADMIN_EMAIL=...

pnpm smoke:mod-slices
```

## Manual UI checklist

| Step | Role | Route | Expect |
|------|------|-------|--------|
| 1 | Student | `/student/room` | Room-change config dropdown; checkout request/cancel |
| 2 | Warden | `/warden/rooms` → Requests | Room-change queue; approve opens allocate sheet |
| 3 | Warden | `/warden/checkout` | Inspection editor; reject dialog; finalize |
| 4 | Accountant | `/accountant/checkout` | Per-row clearance |
| 5 | Accountant | `/accountant/fees` | Links to `/accountant/fees/:id`; propose waiver |
| 6 | Admin | `/admin/settings` | Quick tune PATCH for policy numbers |
| 7 | Admin | `/admin/fees/:id` | Live lines; assess; reminder; decide waiver |

## Integration test (optional)

```bash
RUN_INTEGRATION_TESTS=1 pnpm --filter @nestora/api test -- finance-ledger.integration
```