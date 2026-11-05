# Nestora Documentation Suite

Authoritative design and requirements documentation for **Nestora — University Hostel Management System**. The repository is currently in the **documentation and architectural design** phase; application code is not yet scaffolded.

---

## Recommended reading order

| Order | Audience                  | Path                                                                     |
| :---: | :------------------------ | :----------------------------------------------------------------------- |
|   1   | Everyone                  | [01-project-overview.md](./01-project-overview.md)                       |
|   2   | Product / scope reviewers | [02-project-scope.md](./02-project-scope.md)                             |
|   3   | Analysts / QA             | [03-functional-requirements.md](./03-functional-requirements.md)         |
|   4   | Architects / DevOps       | [04-non-functional-requirements.md](./04-non-functional-requirements.md) |
|   5   | Security / access design  | [05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md)   |
|   6   | Solution architects       | [06-system-architecture.md](./06-system-architecture.md)                 |
|   7   | Database engineers        | [07-database-design.md](./07-database-design.md)                         |
|   8   | Engineering leads         | [08-module-development-plan.md](./08-module-development-plan.md)         |
|   9   | Full-stack implementers   | [09-monorepo-architecture.md](./09-monorepo-architecture.md)             |
|   —   | Pending policy items      | [10-open-decisions-registry.md](./10-open-decisions-registry.md)         |
|   —   | Terminology & IDs         | [11-glossary-and-traceability.md](./11-glossary-and-traceability.md)     |

**Implementers starting MS-1:** read `01` → `05` → `07` → `08` → `09`, then keep `03` and `10` open as acceptance and policy references.

---

## Document catalogue

|  #  | Document                                                           | Primary contents                                                                                                |
| :-: | :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| 01  | [Project overview](./01-project-overview.md)                       | Background, problem statement, objectives, intended users, academic context                                     |
| 02  | [Project scope](./02-project-scope.md)                             | 18 in-scope capability areas, 7-tier hierarchy, data access scope, 4 explicit exclusions                        |
| 03  | [Functional requirements](./03-functional-requirements.md)         | 144 requirements (`FR-001`–`FR-144`), 16 business rules (`BR-001`–`BR-016`), 19 FR catalogues (`FR-01`–`FR-19`) |
| 04  | [Non-functional requirements](./04-non-functional-requirements.md) | 61 NFRs (performance, security, reliability, usability, deployment)                                             |
| 05  | [User roles & permissions](./05-user-roles-and-permissions.md)     | Six roles, 19-module RBAC matrix, authorization rules (`AUTH-001`–`AUTH-012`)                                   |
| 06  | [System architecture](./06-system-architecture.md)                 | 3-tier modular monolith, stack, security, deployment, API conventions                                           |
| 07  | [Database design](./07-database-design.md)                         | 56 entities, DDL, indexes, ERDs, tenant scoping, module-to-table mapping                                        |
| 08  | [Module development plan](./08-module-development-plan.md)         | 19 modules (`MOD-01`–`MOD-19`), 6 milestones (`MS-1`–`MS-6`), FR↔MOD matrix, testing strategy                   |
| 09  | [Monorepo architecture](./09-monorepo-architecture.md)             | pnpm + Turborepo layout, Fastify lifecycle, sessions, env vars, local/prod setup                                |
| 10  | [Open decisions registry](./10-open-decisions-registry.md)         | Consolidated pending institutional decisions (`ODR-001`–`ODR-005`)                                              |
| 11  | [Glossary & traceability](./11-glossary-and-traceability.md)       | Domain terms, ID conventions, 18 vs 19 module mapping                                                           |

---

## Traceability at a glance

- **Scope (18 areas)** ↔ **Requirements (19 FR groups)** ↔ **Implementation (19 MOD packages)** — explained in [11-glossary-and-traceability.md](./11-glossary-and-traceability.md) and Section 2.19 of [02-project-scope.md](./02-project-scope.md).
- **FR ↔ MOD** — full matrix in Section 3.1 of [08-module-development-plan.md](./08-module-development-plan.md).
- **MOD ↔ database tables** — Section 16 of [07-database-design.md](./07-database-design.md).

---

## Conventions

- **Relative links:** Cross-references inside `docs/` use `./filename.md` paths so links work on GitHub, Cursor, and local viewers.
- **Requirement IDs:** Atomic behaviors use three-digit IDs (`FR-001`). Catalogue groups use two-digit IDs (`FR-01`). Do not renumber existing IDs when adding requirements; append new IDs at the end of the relevant catalogue.
- **Status language:** “Planned”, “Proposed”, and “Not yet implemented” describe design artifacts, not shipped software.
- **Open decisions:** Do not guess institutional policy. Record outcomes in [10-open-decisions-registry.md](./10-open-decisions-registry.md) and propagate to affected specs in the same change set.

---

## Related project files

- Root overview and quick index: [../README.md](../README.md)
- Contribution guidelines: [../CONTRIBUTING.md](../CONTRIBUTING.md)
- License: [../LICENSE](../LICENSE)
- Version history of the documentation suite: [CHANGELOG.md](./CHANGELOG.md)
