# Local smoke test — student gate pass & guard console

Use **`http://localhost:3000`** for the browser (not `127.0.0.1:4000`). The web app proxies `/api/v1` to the API.

## Prerequisites

```bash
pnpm install
pnpm --filter @nestora/validators build   # after validator changes
pnpm --filter @nestora/api dev            # :4000
pnpm --filter @nestora/web dev            # :3000
```

## Test accounts

| Role | Email | Password | Notes |
|------|--------|----------|--------|
| **Student** | `sayamdas9124@gmail.com` | `SayamTest@2025!` | Boys Hostel A, B-201, Bed 01 (seeded profile) |
| **Guard** | `anil.singh@nestora.test` | `NestoraStaff@2026!` | After `pnpm neon:seed-workforce-roster` (needs S3/Neon buckets in `apps/api/.env`) |
| **Admin** | your admin user | — | Approve leave if warden desk unused |

### Guard hostel assignment (required)

The gate API only accepts passes for hostels assigned to the guard via `hostel_assignments`.

**Option A — workforce seed** (creates guards with `assignedHostel`):

```bash
pnpm neon:seed-workforce-roster
```

**Option B — minimal fix** (existing guard, no roster seed):

```bash
pnpm --filter @nestora/api seed:ensure-guard-assignment
# or: GUARD_EMAIL=you@example.com pnpm --filter @nestora/api seed:ensure-guard-assignment
```

**Option C — Admin UI**: Staff profile → assign **Boys Hostel A** (same hostel as the test student leave).

## Happy-path flow

1. **Student** → `/student/leave` → submit leave (or use an existing pending row).
2. **Warden or Admin** → leave desk → **Approve** (issues real `GatePass` in DB — not a UI mock).
3. **Student** → `/student/gate-passes` → copy **pass token** (`GP-…`).
4. **Guard** → `/guard` → enter token → **Look up** → **Record exit** → later **Record return**.
5. **Student** → gate pass status moves to used / returned; **Guard** → `/guard/movements` shows the log.

## API spot-check (optional)

With session cookies from browser DevTools after login:

- `GET /api/v1/dashboard/student/gate-passes`
- `GET /api/v1/dashboard/guard/gate-console`
- `POST /api/v1/dashboard/guard/gate-console/lookup` body `{ "token": "GP-…" }`

## Common failures

| Symptom | Fix |
|---------|-----|
| Login OK, `/auth/me` 401 | Sign in on `localhost:3000` only; restart web after proxy changes. |
| Guard “No hostel assigned” | Run `seed:ensure-guard-assignment` or assign hostel in admin. |
| Token not found | Leave must be **approved** on API desk; student and guard must share the same hostel scope. |
| Validator import errors | `pnpm --filter @nestora/validators build` |