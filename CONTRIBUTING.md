# Contributing to Nestora

Thank you for your interest in **Nestora — University Hostel Management System**. This repository is an academic software engineering project for a Bachelor of Computer Applications (BCA) curriculum. Contributions that improve design clarity, implementation quality, tests, and documentation are welcome.

For a high-level project overview, see [README.md](./README.md). For the full specification suite, start at [docs/README.md](./docs/README.md).

---

## Table of contents

- [Before you contribute](#before-you-contribute)
- [Ways to contribute](#ways-to-contribute)
- [Reporting issues](#reporting-issues)
- [Proposing changes](#proposing-changes)
- [Pull request guidelines](#pull-request-guidelines)
- [Development standards](#development-standards)
- [Documentation changes](#documentation-changes)
- [Open institutional decisions](#open-institutional-decisions)
- [Code of conduct](#code-of-conduct)

---

## Before you contribute

1. Read [01-project-overview.md](./docs/01-project-overview.md) for context and academic scope boundaries.
2. Confirm your idea is **in scope** ([02-project-scope.md](./docs/02-project-scope.md)) and not listed as an explicit exclusion (SMS gateways, dashboard customization, dashboard date-range filters, online payment gateways).
3. Check [10-open-decisions-registry.md](./docs/10-open-decisions-registry.md) — do not implement guessed institutional policy for `ODR-001` through `ODR-005` without recording the decision.
4. Use [11-glossary-and-traceability.md](./docs/11-glossary-and-traceability.md) when referencing requirement and module IDs (`FR-xxx`, `MOD-xx`, `BR-xxx`, `AUTH-xxx`).

**Implementers starting Milestone 1 (MS-1):** read `01` → `05` → `07` → `08` → `09`, and keep `03` and `10` open for acceptance criteria and policy.

---

## Ways to contribute

| Type                            | Examples                                                                                                                                                                     |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Issues**                      | Bug reports, spec ambiguities, missing acceptance criteria, doc typos                                                                                                        |
| **Documentation**               | Clarify requirements, fix broken links, update traceability tables                                                                                                           |
| **Code** (when scaffold exists) | Module implementation per [08-module-development-plan.md](./docs/08-module-development-plan.md), following [09-monorepo-architecture.md](./docs/09-monorepo-architecture.md) |
| **Tests**                       | Unit, integration, RBAC matrix, tenant isolation, and E2E flows per Section 10 of the module development plan                                                                |

---

## Reporting issues

Open an issue with:

1. **Summary** — one clear sentence describing the problem or suggestion.
2. **Traceability** — link to relevant IDs where possible:
   - Functional: `FR-001` … `FR-144` or catalogue `FR-01` … `FR-19`
   - Business rules: `BR-001` … `BR-016`
   - Authorization: `AUTH-001` … `AUTH-012`
   - Modules: `MOD-01` … `MOD-19`
   - Open decisions: `ODR-001` … `ODR-005`
3. **Expected vs actual** — for bugs (once code exists), steps to reproduce and environment (Node version, OS).
4. **Scope check** — note if the request conflicts with [02-project-scope.md](./docs/02-project-scope.md) §6 exclusions.

Do not include secrets (`.env` values, passwords, session tokens, production database URLs) in issues or pull requests.

---

## Proposing changes

For non-trivial work, describe the approach before large pull requests:

- Which **milestone** (`MS-1` … `MS-6`) and **module** (`MOD-xx`) are affected.
- Which **functional requirements** will be satisfied or updated.
- Any **schema migration** impact ([07-database-design.md](./docs/07-database-design.md)).
- Security impact: RBAC, tenant scoping, audit logging (`MOD-03`).

Small documentation fixes can go straight to a pull request.

---

## Pull request guidelines

1. **Branch** — use a descriptive branch name (for example `docs/fix-fr-traceability`, `feat/mod01-auth-login`).
2. **Scope** — one logical change per PR when possible (single module slice or focused doc update).
3. **Traceability** — PR description should list `FR-xxx` / `MOD-xx` / `ODR-xxx` addressed.
4. **Monorepo conventions** (when code exists):
   - Follow package boundaries in [09-monorepo-architecture.md](./docs/09-monorepo-architecture.md).
   - Do **not** import `@nestora/database` from `apps/web`.
   - Share validation via `@nestora/validators`; share types via `@nestora/types`.
   - Enforce authorization and `hostel_id` scoping on the **API**, not only in the UI.
5. **Quality gate** — before requesting review (when tooling exists):
   - `pnpm lint`
   - `pnpm test` (or module-scoped tests)
   - Type-check / build as applicable
6. **Migrations** — commit Prisma migration SQL with schema changes; no hand-editing production databases.
7. **No drive-by refactors** — avoid unrelated formatting or renames in the same PR.

---

## Development standards

Aligned with [08-module-development-plan.md](./docs/08-module-development-plan.md) and [09-monorepo-architecture.md](./docs/09-monorepo-architecture.md):

| Area                | Standard                                                               |
| :------------------ | :--------------------------------------------------------------------- |
| **Runtime**         | Node.js 24 LTS                                                         |
| **Package manager** | pnpm workspaces + Turborepo                                            |
| **Backend**         | Fastify modular monolith; REST under `/api/v1/*`                       |
| **Frontend**        | Next.js App Router; direct browser → API calls with session cookies    |
| **Database**        | PostgreSQL + Prisma in `packages/database`                             |
| **Auth**            | Opaque session tokens (HTTP-only cookie); Argon2id passwords           |
| **Mutations**       | Critical state changes + audit log in the same `prisma.$transaction()` |
| **Testing**         | Unit → integration (RBAC + tenant isolation) → E2E for core journeys   |

Module completion checklist: Section 12 of [08-module-development-plan.md](./docs/08-module-development-plan.md).

---

## Documentation changes

When editing specs in `docs/`:

- Use **relative links** (`./01-project-overview.md`), not machine-local `file:///` URLs.
- If you resolve an open decision, update [10-open-decisions-registry.md](./docs/10-open-decisions-registry.md) and all referenced sections in the same PR.
- Add an entry to [docs/CHANGELOG.md](./docs/CHANGELOG.md) for notable documentation revisions.
- Keep the root [README.md](./README.md) documentation table in sync when adding or renaming doc files.

---

## Open institutional decisions

Policy items tracked as **Open** must not be hard-coded as final rules until closed in [10-open-decisions-registry.md](./docs/10-open-decisions-registry.md):

| ID      | Topic                                      |
| :------ | :----------------------------------------- |
| ODR-001 | Warden ↔ hostel assignment (1:1 vs 1:N)    |
| ODR-002 | Extended leave escalation threshold        |
| ODR-003 | Uniform vs hostel-specific fee schedules   |
| ODR-004 | Attendance workflow ownership and sign-off |
| ODR-005 | Security Guard shift / duty tracking model |

Use configuration or documented defaults marked as **non-binding** until the registry status is **Closed**.

---

## Code of conduct

Participate respectfully and constructively. This is an academic learning environment:

- Give clear, evidence-based feedback tied to project requirements.
- Credit sources and collaborators.
- Assume good intent; disagree on design with references to `FR-`, `BR-`, and `AUTH-` IDs rather than personal criticism.

---

## License

By contributing, you agree that your contributions are licensed under the terms described in [LICENSE](./LICENSE).
