# Nestora — Open Decisions Registry

## 1. Purpose

Institutional and operational policies that are **not yet finalized** appear in multiple specification documents. This registry consolidates them into a single authoritative list so implementers do not infer policy from scattered notes.

When a decision is finalized:

1. Update the **Decision** and **Status** rows for the corresponding `ODR-xxx` entry below.
2. Update the linked source sections (listed under **Document references**).
3. Adjust configuration defaults, seed data, or UI copy only if the outcome requires it.
4. Add a line to [CHANGELOG.md](./CHANGELOG.md).

---

## 2. Registry

| ID          | Topic                                           | Status   | Current architecture support                                                                                                                            | Decision needed                                                                                   |
| :---------- | :---------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| **ODR-001** | Hostel Warden ↔ hostel assignment cardinality   | **Open** | `hostel_assignments` junction table; `request.user.assignedHostelIds[]` on API; optional hostel switcher in UI if length > 1                            | Strict **1:1** (one warden per hostel) vs **1:N** (one warden over multiple hostels)              |
| **ODR-002** | Extended leave escalation threshold             | **Open** | `system_configurations` key read by `mod08-leaves`; workflow can route to University Administrator when duration exceeds threshold                      | Calendar-day threshold (e.g. >7 or >14 consecutive days) and whether guardian consent is required |
| **ODR-003** | Fee schedule scope (uniform vs hostel-specific) | **Open** | `fee_schedules.hostel_id` nullable — NULL = university-wide; non-NULL = hostel-specific schedule                                                        | Whether all hostels share one schedule per room config or may differ by amenities                 |
| **ODR-004** | Attendance workflow ownership & sign-off        | **Open** | Warden-primary model with optional staff delegation (`FR-047`, `AUTH` matrix); correction audit trail regardless of entry role                          | Whether staff may finalize nightly rosters without mandatory warden countersignature              |
| **ODR-005** | Security Guard shift & duty tracking            | **Open** | Both `staff_profiles` / `duty_assignments` / `staff_attendances` (department `SECURITY`) and gate-centric credentials via movement logs exist in schema | Formal shift rosters vs gate-checkpoint-only accounts and handover logging                        |

---

## 3. Detail by decision

### ODR-001 — Warden multi-hostel assignment

| Field                     | Value                                                                                                                                                                                                                                                                                                                                                      |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Impact if wrong**       | UI hostel switcher, assignment validation, report scoping                                                                                                                                                                                                                                                                                                  |
| **Default until decided** | Schema and API support **1:N**; product may enforce **1:1** in validation if policy requires                                                                                                                                                                                                                                                               |
| **Document references**   | [02-project-scope.md](./02-project-scope.md) §7 (Unresolved); [03-functional-requirements.md](./03-functional-requirements.md) §5 item 1; [05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md) §14 item 1; [07-database-design.md](./07-database-design.md) §17; [09-monorepo-architecture.md](./09-monorepo-architecture.md) §13 item 1 |

### ODR-002 — Extended leave escalation threshold

| Field                     | Value                                                                                                                                                                                                                                                                                          |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Impact if wrong**       | Approval routing, notifications, admin workload                                                                                                                                                                                                                                                |
| **Default until decided** | Example threshold **>7 consecutive days** documented as assumption only — not enforced in code until confirmed                                                                                                                                                                                 |
| **Document references**   | [02-project-scope.md](./02-project-scope.md) §7 item 2; [03-functional-requirements.md](./03-functional-requirements.md) §5 item 2; [05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md) §14 item 2; [09-monorepo-architecture.md](./09-monorepo-architecture.md) §13 item 2 |

### ODR-003 — Fee structure uniformity

| Field                     | Value                                                                                                                                                                                                                                                                                                                                                |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Impact if wrong**       | Accountant workflows, schedule duplication, student ledger rules                                                                                                                                                                                                                                                                                     |
| **Default until decided** | Data model allows **both**; business rules `BR-009` / `BR-010` apply regardless                                                                                                                                                                                                                                                                      |
| **Document references**   | [02-project-scope.md](./02-project-scope.md) §7 item 3; [03-functional-requirements.md](./03-functional-requirements.md) §5 item 3; [05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md) §14 item 3; [07-database-design.md](./07-database-design.md) §17; [09-monorepo-architecture.md](./09-monorepo-architecture.md) §13 item 3 |

### ODR-004 — Attendance roster execution duties

| Field                     | Value                                                                                                                                                                                                                 |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Impact if wrong**       | Staff portal permissions, attendance “official” status, audit expectations                                                                                                                                            |
| **Default until decided** | Warden may delegate entry; **corrections always audited** (`BR-007`)                                                                                                                                                  |
| **Document references**   | [02-project-scope.md](./02-project-scope.md) §7 item 4; [03-functional-requirements.md](./03-functional-requirements.md) §5 item 4; [05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md) §14 item 4 |

### ODR-005 — Security Guard shift management

| Field                     | Value                                                                                                                         |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| **Impact if wrong**       | Staff module scope for guards, duty UI, attendance of security personnel                                                      |
| **Default until decided** | Implement **gate operations (MOD-10, MOD-11)** first; wire duty rosters only if policy selects roster model                   |
| **Document references**   | [07-database-design.md](./07-database-design.md) §17; [09-monorepo-architecture.md](./09-monorepo-architecture.md) §13 item 4 |

---

## 4. Explicitly not open (confirmed exclusions)

These are **out of scope** for the initial release — not pending decisions:

| Exclusion                          | Reference                                       |
| :--------------------------------- | :---------------------------------------------- |
| SMS gateway notifications          | [02-project-scope.md](./02-project-scope.md) §6 |
| Dashboard layout customization     | [02-project-scope.md](./02-project-scope.md) §6 |
| Dashboard date-range filters       | [02-project-scope.md](./02-project-scope.md) §6 |
| Online payment gateway integration | [02-project-scope.md](./02-project-scope.md) §6 |

---

## 5. Summary

Five institutional decisions (`ODR-001` through `ODR-005`) remain open. The database schema and monorepo architecture intentionally support all plausible outcomes without structural rewrites. Until each `ODR` is **Closed**, treat defaults as **non-binding implementation hints** only.
