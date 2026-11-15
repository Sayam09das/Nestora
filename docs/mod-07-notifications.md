# MOD-07 — Notification engine (in-app + email)

## API (`/api/v1/notifications`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List inbox for current user (`page`, `limit`, `unreadOnly`) |
| GET | `/unread-count` | Unread count |
| PATCH | `/:notificationId/read` | Mark one read |
| POST | `/read-all` | Mark all read |

Rows are stored in `notifications` with server-side `is_read`.

## Event wiring

| Event | Recipients | Category |
|-------|------------|----------|
| Student submits leave | Wardens/admins on hostel | `leave` |
| Leave approved/rejected | Student | `leave` |
| Student files complaint | Wardens/admins on hostel | `complaint` |
| Student/staff reports incident | Wardens/admins on hostel | `incident` |

## Email (optional)

When `SMTP_USER` / `SMTP_PASS` are set in `apps/api/.env`, new notifications trigger **async** email via `notification-email.service.ts`, respecting `notification_preferences` (`email_leaves`, `email_maintenance`, `email_notices`, etc.).

MailHog (docker compose) is enough for local dev.

## Web

Student top bar merges **MOD-07 inbox** items (UUID ids) with derived dashboard alerts. Marking read on a store notification calls the API.