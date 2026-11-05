# Nestora — Glossary and Traceability Guide

## 1. Purpose

This document defines recurring **domain terms**, **identifier conventions**, and the relationship between **18 scope areas**, **19 requirement catalogues**, and **19 implementation modules**. Use it when reading or extending the specification suite ([docs/README.md](./README.md)).

---

## 2. Identifier conventions

| Pattern                 | Meaning                                    | Example                              | Authoritative source                                                     |
| :---------------------- | :----------------------------------------- | :----------------------------------- | :----------------------------------------------------------------------- |
| `FR-001` … `FR-144`     | Atomic functional requirement              | `FR-047` attendance correction       | [03-functional-requirements.md](./03-functional-requirements.md)         |
| `FR-01` … `FR-19`       | Requirement **catalogue** (thematic group) | `FR-07` Student Attendance           | [03-functional-requirements.md](./03-functional-requirements.md) §3      |
| `BR-001` … `BR-016`     | Business rule (domain invariant)           | `BR-006` bed retention during leave  | [03-functional-requirements.md](./03-functional-requirements.md) §4      |
| `NFR-*`                 | Non-functional requirement                 | `NFR-SEC-004` account lockout        | [04-non-functional-requirements.md](./04-non-functional-requirements.md) |
| `AUTH-001` … `AUTH-012` | Authorization enforcement rule             | `AUTH-009` audit on critical actions | [05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md)   |
| `MOD-01` … `MOD-19`     | Backend/frontend implementation module     | `MOD-08` Temporary Leave & Outings   | [08-module-development-plan.md](./08-module-development-plan.md)         |
| `MS-1` … `MS-6`         | Development milestone                      | `MS-1` Foundation & Security Core    | [08-module-development-plan.md](./08-module-development-plan.md) §5      |
| `ODR-001` … `ODR-005`   | Open institutional decision                | `ODR-003` fee schedule scope         | [10-open-decisions-registry.md](./10-open-decisions-registry.md)         |

**Note:** `FR-07` (catalogue) is not the same as `FR-007` (single requirement). Catalogue numbers use two digits; atomic IDs use three.

---

## 3. Why 18 scope areas vs 19 modules?

| Layer                                                                                                                                      | Count  | Rationale                                                                                                                                                      |
| :----------------------------------------------------------------------------------------------------------------------------------------- | :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project scope** ([02-project-scope.md](./02-project-scope.md))                                                                           | **18** | User-facing capability areas from an institutional perspective (e.g. User + Authentication scoped together; Attendance + Movement grouped for administrators). |
| **Requirements catalogues** ([03](./03-functional-requirements.md), [05](./05-user-roles-and-permissions.md))                              | **19** | Splits **Audit History** (`FR-19`) and **Gate Movement** (`FR-08`) from adjacent areas for testable RBAC and compliance traceability.                          |
| **Implementation modules** ([06](./06-system-architecture.md), [08](./08-module-development-plan.md), [09](./09-monorepo-architecture.md)) | **19** | One cohesive code package per catalogue, including standalone **MOD-03** Audit and **MOD-07** Notifications.                                                   |

Full **FR catalogue → MOD** mapping: Section 3.1 of [08-module-development-plan.md](./08-module-development-plan.md).

---

## 4. Domain glossary

| Term                                  | Definition                                                                                                                                                                     |
| :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **University**                        | Top-level tenant; governs all hostels, policies, and institution-wide reports.                                                                                                 |
| **Hostel**                            | Residential unit under the university; categorized as **Boys' Hostel** or **Girls' Hostel**.                                                                                   |
| **Seven-tier hierarchy**              | University → Hostel → Building → Block → Floor → Room → Bed.                                                                                                                   |
| **Room configuration**                | One of six types: Single / Double / Triple, each in AC or Non-AC variant.                                                                                                      |
| **Bed status**                        | Lifecycle of a bed: e.g. Available, Occupied, Reserved, Maintenance (exact enums in [07-database-design.md](./07-database-design.md)).                                         |
| **Two-tier admission**                | Tier 1: University Administrator verification; Tier 2: Hostel Warden verification; both required before full approval (`BR-013`).                                              |
| **Tenant isolation / hostel scoping** | Operational roles access data only for assigned `hostel_id`(s); enforced in API middleware and repositories ([09-monorepo-architecture.md](./09-monorepo-architecture.md) §9). |
| **Gate pass**                         | Digital token derived from approved leave or outing; verified by Security Guard at checkpoint (MOD-08 / MOD-10).                                                               |
| **Opaque session**                    | Random session token in HTTP-only cookie; **SHA-256 hash** stored in PostgreSQL; not JWT ([09-monorepo-architecture.md](./09-monorepo-architecture.md) §8.1).                  |
| **Business audit log**                | Immutable append-only record of sensitive mutations (MOD-03), written in the same DB transaction as the mutation.                                                              |
| **Offline fee payment**               | Fee recorded manually after physical payment; no payment gateway in initial scope.                                                                                             |
| **Waiver / adjustment**               | Fee change proposed by Accountant; requires University Administrator approval (`BR-010`).                                                                                      |

---

## 5. Role quick reference

| Role                     | Enum-style name (typical)  | Primary scope                                                   |
| :----------------------- | :------------------------- | :-------------------------------------------------------------- |
| University Administrator | `UNIVERSITY_ADMINISTRATOR` | All hostels; policy, admissions tier 1, fee activation, waivers |
| Hostel Warden            | `HOSTEL_WARDEN`            | Assigned hostel(s) only; operations and tier 2 admissions       |
| Student                  | `STUDENT`                  | Own profile, bed, leaves, fees, complaints, notices             |
| Hostel Staff             | `HOSTEL_STAFF`             | Assigned maintenance tickets and delegated duties               |
| Security Guard           | `SECURITY_GUARD`           | Gate passes, movement logs, visitors                            |
| Accountant               | `ACCOUNTANT`               | Fee schedules, payments, dues (financial tables only)           |

Detailed matrices: [05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md).

---

## 6. Technology glossary (planned stack)

| Term                   | Role in Nestora                                                                                          |
| :--------------------- | :------------------------------------------------------------------------------------------------------- |
| **Next.js App Router** | Frontend presentation tier (`apps/web`).                                                                 |
| **Fastify**            | REST API modular monolith (`apps/api`).                                                                  |
| **Prisma**             | ORM, migrations, and schema in `packages/database`.                                                      |
| **pnpm workspaces**    | Monorepo package linking.                                                                                |
| **Turborepo**          | Task pipeline and build caching.                                                                         |
| **TanStack Query**     | Client-side server state on the web app.                                                                 |
| **Zod**                | Shared validation in `@nestora/validators`.                                                              |
| **MailHog**            | Local SMTP capture for development ([09-monorepo-architecture.md](./09-monorepo-architecture.md) §11.1). |

---

## 7. Traceability workflow for new work

1. Locate the behaviour in `FR-xxx` ([03](./03-functional-requirements.md)).
2. Confirm roles via [05](./05-user-roles-and-permissions.md) and business rules `BR-xxx`.
3. Map to `MOD-xx` via [08 §3.1](./08-module-development-plan.md).
4. Confirm tables and constraints in [07](./07-database-design.md).
5. Implement per [09](./09-monorepo-architecture.md) package boundaries.
6. If policy is unclear, check [10-open-decisions-registry.md](./10-open-decisions-registry.md) before encoding assumptions.
