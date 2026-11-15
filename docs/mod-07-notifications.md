# MOD-07 — Notification engine

## API

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/v1/notifications` | Paginated inbox (`limit`, `unreadOnly`) |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark one read |
| `POST` | `/api/v1/notifications/read-all` | Mark all read |

All routes require an authenticated session (`requireAuth`).

## Event sources (today)

- Leave submitted → warden / admin operators for the hostel
- Leave approved or rejected → student
- Complaint submitted → warden / admin operators
- Incident reported → warden / admin operators
- Late gate return (MOD-10 job, every 5m) → warden / admin when a pass is overdue and the student has not returned

Optional SMTP email is sent in-process when `SMTP_*` env vars are set and the user’s notification preference allows email for that category.

## Web top bars

Role top bars poll the inbox every ~20s and merge **MOD-07 store rows first**, then role-specific derived alerts (dashboard queues, assigned tickets, etc.). When an **unread** store row exists for `leave` or `complaint`, derived leave summaries and complaint ticket rows are omitted to avoid duplicates.

| Role | Hook / component | Read persistence |
| ---- | ---------------- | ---------------- |
| Student | `use-student-topbar-live` | localStorage + API mark-read for UUID ids |
| Warden | `use-warden-topbar-live` | same |
| Staff | `use-staff-topbar-live` | same |
| Admin | `AdminNotificationsPanel` | same |

UUID notification ids are persisted server-side when marked read; synthetic ids (e.g. `pending-leave`) remain client-only.

## Local smoke

1. `pnpm --filter @nestora/api dev` and `pnpm --filter @nestora/web dev`
2. Student submits leave → warden bell shows **New leave request** from the store
3. Warden approves → student bell shows **Leave approved**
4. Mark read → `PATCH` fires for store rows; badge count drops

See also [local-smoke-student-guard.md](./local-smoke-student-guard.md).