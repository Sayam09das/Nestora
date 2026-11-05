# Nestora — Monorepo Architecture Specification

## 1. Document Purpose and Architecture Overview

### 1.1 Document Purpose
This specification establishes the authoritative monorepo architecture and workspace topology for **Nestora — University Hostel Management System**. It translates the system architecture ([06-system-architecture.md](./06-system-architecture.md)), database design ([07-database-design.md](./07-database-design.md)), and phased module development plan ([08-module-development-plan.md](./08-module-development-plan.md)) into an actionable physical workspace organization.

This document serves as the technical blueprint for repository structure, package boundaries, code-sharing protocols, build pipelines, and development workflows. It governs the transition from architectural specifications into code across all six planned development milestones (`MS-1` through `MS-6`).

### 1.2 Core Architectural Philosophy
Nestora is engineered as a **Decoupled Client-Server Modular Monolith** contained within a single version-controlled repository using **pnpm workspaces** and coordinated by **Turborepo**. The architecture adheres to five core principles:

1. **Strict Separation of Concerns**: The Next.js presentation layer (`apps/web`) and Fastify application layer (`apps/api`) maintain independent runtime boundaries. The frontend never communicates directly with the database, and the backend never renders presentation HTML. Communication occurs exclusively over HTTP/REST using typed JSON envelopes.
2. **Direct Client-to-API Communication**: Browser clients communicate directly with the Fastify REST API (`/api/v1/*`). Next.js operates as an application server for rendering views and layouts, not as an intermediate duplicate Backend-for-Frontend (BFF) proxy layer.
3. **Single Source of Truth for Types and Validation**: Domain entities, role enums, API request/response contracts, and validation rules are centralized in dedicated shared workspace packages (`packages/types`, `packages/validators`, `packages/database`). Both frontend forms and backend controllers consume identical validation rules, verified by automated contract tests.
4. **Defense-in-Depth Authorization and Tenant Isolation**: Enforces a strict default-deny policy at the API gateway, verified through Fastify lifecycle hooks (`onRequest` authentication, `preValidation` CSRF protection, `preHandler` role and tenant scoping) and enforced at both the service and repository data-access layers.
5. **Runtime Engine Baseline**: Standardized on **Node.js 24 LTS** across all applications, packages, Docker containers, and CI workflows.

---

## 2. Proposed Monorepo Directory Structure

The repository organizes source code into two primary directories: `apps/` (deployable services) and `packages/` (shared libraries, schemas, and configurations).

```
Nestora/
├── .github/
│   └── workflows/
│       ├── ci.yml                           # Automated lint, type-check, contract test & migration diff
│       └── release.yml                      # Production container build & verification workflow
│
├── apps/
│   ├── web/                                 # Presentation Tier: Next.js 14+ App Router
│   │   ├── public/                          # Static web assets (logos, favicons, campus maps)
│   │   ├── src/
│   │   │   ├── app/                         # Next.js App Router file-system routes
│   │   │   │   ├── (auth)/                  # Public authentication route group
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   │   └── activate/page.tsx
│   │   │   │   ├── (dashboard)/             # Authenticated role-specific dashboards
│   │   │   │   │   ├── admin/               # University Administrator portal
│   │   │   │   │   ├── warden/              # Hostel Warden portal
│   │   │   │   │   ├── student/             # Student resident portal
│   │   │   │   │   ├── staff/               # Hostel Maintenance Staff portal
│   │   │   │   │   ├── guard/               # Security Guard gate checkpoint portal
│   │   │   │   │   └── accountant/          # Accountant financial portal
│   │   │   │   ├── api/                     # Local Next.js route handlers (local health checks only)
│   │   │   │   ├── layout.tsx               # Root application layout (fonts, theme, providers)
│   │   │   │   └── page.tsx                 # Root landing page / smart role redirector
│   │   │   ├── components/                  # Reusable UI component hierarchy
│   │   │   │   ├── ui/                      # Primitive accessible controls (shadcn/ui based)
│   │   │   │   ├── layout/                  # Shell components (Sidebar, TopNav, Breadcrumbs)
│   │   │   │   └── modules/                 # Domain-specific UI widgets per module (MOD-01..19)
│   │   │   │       ├── infrastructure/      # Bed allocation grid, room hierarchy tree
│   │   │   │       ├── admissions/          # Verification queue, document inspection cards
│   │   │   │       ├── attendance/          # Roll-call tables, bulk verification toggles
│   │   │   │       ├── leaves/              # Leave pass generator, request status tracker
│   │   │   │       ├── gate/                # Real-time movement logger, pass scanner
│   │   │   │       ├── complaints/          # Maintenance ticketing board, image preview
│   │   │   │       └── finance/             # Fee collection ledger, challan receipt printer
│   │   │   ├── hooks/                       # Custom React hooks (useAuth, useHostelFilter, useToast)
│   │   │   ├── lib/                         # Browser API client (apiClient), formatters, session state
│   │   │   └── providers/                   # Context providers (AuthContext, QueryClientProvider)
│   │   ├── .env.example                     # Frontend environment variables template
│   │   ├── next.config.mjs                  # Next.js build and routing configuration
│   │   ├── package.json                     # Frontend workspace package manifest
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts               # Design system tokens and styling rules
│   │   └── tsconfig.json                    # Frontend TypeScript configuration
│   │
│   └── api/                                 # Application Tier: Fastify Modular Monolith REST API
│       ├── src/
│       │   ├── config/                      # Server configuration, typed environment schemas
│       │   ├── plugins/                     # Fastify infrastructure plugins
│       │   │   ├── cors.ts                  # Cross-Origin Resource Sharing configuration
│       │   │   ├── csrf.ts                  # Custom header & Origin validation plugin
│       │   │   ├── helmet.ts                # HTTP security headers
│       │   │   ├── rate-limit.ts            # Network IP & credential rate limiting
│       │   │   ├── prisma.ts                # Database client plugin and lifecycle hook
│       │   │   └── session.ts               # Database session lookup & verification plugin
│       │   ├── middleware/                  # Request lifecycle interceptors
│       │   │   ├── authenticate.ts          # Session lookup hook (onRequest)
│       │   │   ├── authorize.ts             # RBAC role capability guard (preHandler)
│       │   │   └── tenant-scope.ts          # Multi-hostel isolation guard (preHandler)
│       │   ├── common/                      # Shared backend infrastructure
│       │   │   ├── errors/                  # Custom HTTP error classes (AppError, ForbiddenError)
│       │   │   ├── helpers/                 # Standard JSON envelope formatters, pagination helpers
│       │   │   └── constants/               # System limits, default thresholds, error codes
│       │   ├── modules/                     # 19 In-Process Domain Business Modules
│       │   │   ├── mod01-auth/              # MOD-01: Authentication & Account Management
│       │   │   ├── mod02-infrastructure/    # MOD-02: Hostel Infrastructure Management
│       │   │   ├── mod03-audit/             # MOD-03: Audit Logging Service (Transactional)
│       │   │   ├── mod04-admissions/        # MOD-04: Student Admission & Registration
│       │   │   ├── mod05-allocation/        # MOD-05: Room & Bed Allocation
│       │   │   ├── mod06-checkin-checkout/  # MOD-06: Student Check-In & Check-Out
│       │   │   ├── mod07-notifications/     # MOD-07: Notification Engine (Email & In-App)
│       │   │   ├── mod08-leaves/            # MOD-08: Temporary Leave & Outings
│       │   │   ├── mod09-attendance/        # MOD-09: Student Attendance
│       │   │   ├── mod10-gate-security/     # MOD-10: Student Movement & Gate Security
│       │   │   ├── mod11-visitors/          # MOD-11: Visitor Management
│       │   │   ├── mod12-complaints/        # MOD-12: Complaints & Maintenance Management
│       │   │   ├── mod13-staff/             # MOD-13: Staff Management
│       │   │   ├── mod14-finance/           # MOD-14: Hostel Fee & Financial Management
│       │   │   ├── mod15-discipline/        # MOD-15: Hostel Rules & Disciplinary Management
│       │   │   ├── mod16-emergency/         # MOD-16: Emergency & Incident Management
│       │   │   ├── mod17-notices/           # MOD-17: Notices & Announcements
│       │   │   ├── mod18-reports/           # MOD-18: Reports & Administrative Monitoring
│       │   │   └── mod19-dashboards/        # MOD-19: Role-Specific Dashboards Data Service
│       │   ├── workers/                     # Background Task Workers (Durable Queue)
│       │   │   ├── email-worker.ts          # Asynchronous transactional email dispatcher
│       │   │   └── report-worker.ts         # Asynchronous heavy report generator
│       │   ├── app.ts                       # Fastify application assembly & route registration
│       │   └── server.ts                    # Server entry point & graceful shutdown listener
│       ├── .env.example                     # Backend environment variables template
│       ├── package.json                     # Backend workspace package manifest
│       └── tsconfig.json                    # Backend TypeScript configuration
│
├── packages/                                # Shared Monorepo Libraries & Contracts
│   ├── database/                            # Centralized Data Layer: Prisma ORM & PostgreSQL
│   │   ├── prisma/
│   │   │   ├── migrations/                  # Version-controlled SQL migration history
│   │   │   ├── seed/                        # Institutional seed fixtures & admin CLI
│   │   │   │   ├── seed.ts                  # Development demo seed entry point
│   │   │   │   ├── init-admin.ts            # Production initial administrator CLI provisioning
│   │   │   │   ├── infrastructure-seed.ts   # 7-tier hierarchy demo fixtures
│   │   │   │   └── users-seed.ts            # Default development role accounts
│   │   │   └── schema.prisma                # Definitive Prisma Schema (56 relational entities)
│   │   ├── src/
│   │   │   ├── client.ts                    # Singleton PrismaClient factory with logging
│   │   │   └── index.ts                     # Re-exported PrismaClient, generated types, enums
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                               # Shared TypeScript Type Definitions & Enums
│   │   ├── src/
│   │   │   ├── roles.ts                     # Re-exported canonical role enum & capability flags
│   │   │   ├── infrastructure.ts            # 7-tier hierarchy interfaces & room config types
│   │   │   ├── auth.ts                      # Session claims, login responses, session token types
│   │   │   ├── api.ts                       # Standard JSON response envelope, error codes
│   │   │   ├── modules/                     # Composite DTO interfaces per module (MOD-01..19)
│   │   │   └── index.ts                     # Barrel export for domain types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── validators/                          # Shared Zod Validation Schemas
│   │   ├── src/
│   │   │   ├── auth.validator.ts            # Login, password reset, account activation schemas
│   │   │   ├── infrastructure.validator.ts  # Hostel, building, room, bed schemas
│   │   │   ├── admissions.validator.ts      # Application, two-tier verification schemas
│   │   │   ├── leaves.validator.ts          # Leave application, outing request schemas
│   │   │   ├── finance.validator.ts         # Fee schedule, offline payment, waiver schemas
│   │   │   ├── modules/                     # Zod schemas matching remaining modules
│   │   │   └── index.ts                     # Barrel export for all validators
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                               # Shared Deterministic Utility Functions
│   │   ├── src/
│   │   │   ├── date.ts                      # Date formatting, academic calendar calculations
│   │   │   ├── formatters.ts                # Currency formatting (paise/rupees), registration IDs
│   │   │   ├── string.ts                    # Slug generators, safe string sanitizers
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                              # Shared Tooling Configurations
│       ├── eslint/                          # Shared ESLint base rules and Next/Node plugins
│       ├── typescript/                      # Base tsconfig.base.json presets
│       └── tailwind/                        # Shared design tokens and Tailwind presets
│
├── docker/                                  # Containerization Definitions
│   ├── docker-compose.yml                   # Local development services (PostgreSQL, MailHog)
│   ├── docker-compose.prod.yml              # Production container orchestration
│   ├── Dockerfile.api                       # Multi-stage production container for Fastify API (Node 24)
│   └── Dockerfile.web                       # Multi-stage production container for Next.js App (Node 24)
│
├── docs/                                    # Project Documentation Suite (Documents 01 to 09)
├── .editorconfig
├── .gitignore
├── .prettierrc
├── package.json                             # Monorepo root package manifest (pnpm workspaces)
├── pnpm-lock.yaml                           # Pinned workspace lockfile
├── pnpm-workspace.yaml                      # Workspace package inclusion definitions
├── README.md                                # Project root README and architectural index
└── turbo.json                               # Turborepo task pipeline execution graph (tasks schema)
```

---

## 3. Frontend Application Responsibilities (`apps/web`)

The Next.js web application operates strictly as the system's presentation tier, providing responsive, role-tailored user interfaces for each of the six confirmed user roles.

### 3.1 Role-Based Route Organization
The frontend employs Next.js App Router route groups to isolate authenticated experiences while enforcing role boundaries at the UI layout level:

```mermaid
flowchart TD
  Root["/ (Root Layout & Smart Role Redirector)"]
  
  subgraph PublicRoutes["Public Route Group: (auth)"]
    Login["/login (Credential Entry)"]
    Forgot["/forgot-password (Reset Request)"]
    Activate["/activate (Initial Setup via Token)"]
  end

  subgraph ProtectedRoutes["Authenticated Route Group: (dashboard)"]
    Admin["/admin/* (University Administrator Portal)"]
    Warden["/warden/* (Hostel Warden Portal)"]
    Student["/student/* (Student Resident Portal)"]
    Staff["/staff/* (Hostel Maintenance Staff Portal)"]
    Guard["/guard/* (Security Guard Gate Checkpoint Portal)"]
    Accountant["/accountant/* (Accountant Financial Portal)"]
  end

  Root --> PublicRoutes
  Root --> ProtectedRoutes
```

### 3.2 Key Frontend Technical Responsibilities
1. **Direct Browser Communication with Fastify REST API**:
   - The browser client executes all interactive data-fetching and mutation queries directly against Fastify at `http://localhost:4000/api/v1` (or relative path `/api/v1` behind an Nginx reverse proxy in production).
   - Next.js is not used as an intermediate BFF proxy; `apps/web/src/app/api/` contains only frontend-local utility routes (e.g. local health checks).
2. **Authenticated Server-Side Rendering (RSC) Data Fetching**:
   - When Next.js React Server Components (RSC) render an initial server layout:
     - The Server Component reads incoming session cookies using the Next.js `cookies()` header utility (`cookies().get('nestora_session')?.value`).
     - It executes a direct server-to-server HTTP request to Fastify (`http://localhost:4000/api/v1/...`) forwarding the raw session cookie in the `Cookie: nestora_session=${cookie}` header.
     - Fastify hashes the token, validates the session against PostgreSQL, and returns the standard JSON envelope.
     - This preserves the direct client-server architecture without maintaining a separate session store or stateful BFF on Next.js.
3. **User Authentication & Session State Management**:
   - Maintains an `AuthContext` provider storing the authenticated user profile, active role, and authorized hostel IDs.
   - Session state is sustained via browser cookies (`nestora_session`) transmitted automatically via `credentials: 'include'`; client-side JavaScript never parses, stores, or manipulates raw session tokens in `localStorage`.
4. **Form Handling & Client Validation**:
   - Utilizes React Hook Form paired with `@hookform/resolvers/zod` consuming schemas directly from `@nestora/validators`.
   - Forms validate synchronously in the browser, providing instant visual feedback while guaranteeing schema parity with the Fastify backend.
5. **Data Fetching, Caching, and Server State**:
   - Coordinates asynchronous state using TanStack Query (`@tanstack/react-query`).
   - Query keys are strictly scoped by hostel context (e.g., `['hostels', hostelId, 'rooms']`), preventing stale cache leakage when switching views.
   - Provides optimistic UI updates for frequent operational tasks (e.g., toggling roll-call marks, acknowledging circulars).
6. **Accessible Design System**:
   - Built on `shadcn/ui` accessible headless primitives (Radix UI) styled using `Tailwind CSS`.
   - Enforces WCAG 2.1 Level AA accessibility standards, including keyboard navigation, focus management, and accessible color contrast.
7. **Centralized API Client (`apiClient`)**:
   - Exposes a typed wrapper around `window.fetch`:
     - Prepends the configured API base URL (`process.env.NEXT_PUBLIC_API_URL`).
     - Transmits HTTP-only session cookies with every request (`credentials: 'include'`).
     - Includes mandatory anti-CSRF request headers (`X-Nestora-Requested-With: XMLHttpRequest`) on all state-changing mutations (`POST`, `PUT`, `PATCH`, `DELETE`).
     - Intercepts HTTP 401 Unauthorized responses to trigger automatic redirection to `/login`.
     - Intercepts HTTP 403 Forbidden responses to display standardized access denial notices.

---

## 4. Backend Application Responsibilities (`apps/api`)

The Fastify backend serves as the authoritative application layer, orchestrating business domain workflows, database transactions, and security enforcement across all 19 system modules.

### 4.1 Internal Modular Structure
Each of the 19 domain modules (`MOD-01` to `MOD-19`) inside `apps/api/src/modules/` is encapsulated within a standardized sub-directory structure:

```
apps/api/src/modules/mod04-admissions/
├── admissions.routes.ts       # Fastify route declarations, endpoint paths, and schemas
├── admissions.controller.ts   # Request/response handlers, HTTP status code translation
├── admissions.service.ts      # Pure domain business logic, two-tier verification workflow
├── admissions.repository.ts   # Database query abstraction via PrismaClient
└── admissions.schema.ts       # Fastify JSON schemas compiled from @nestora/validators
```

### 4.2 Authoritative Fastify Request Lifecycle
Fastify processes every incoming HTTP request through an explicit, sequential lifecycle pipeline. The sequence strictly reflects Fastify's actual engine architecture:

```mermaid
sequenceDiagram
  autonumber
  participant Client as Web Client (Next.js)
  participant Fastify as Fastify Engine
  participant AuthHook as onRequest (Session Auth)
  participant Parser as Body Parsing
  participant CsrfHook as preValidation (CSRF Check)
  participant Validator as Schema Validation (Ajv)
  participant GuardHook as preHandler (RBAC & Tenant)
  participant Handler as Controller & Domain Service
  participant DB as PostgreSQL (Prisma)
  participant ResponseHook as onResponse (Pino Logger)

  Client->>Fastify: HTTP Request (e.g., POST /api/v1/admissions/verify)
  
  Note over Fastify,AuthHook: Phase 1: Authentication Hook
  Fastify->>AuthHook: Extract 'nestora_session' cookie & SHA-256 hash token
  AuthHook->>DB: Query sessions table (WHERE session_token_hash = :hash)
  AuthHook-->>Fastify: Attach request.user (ID, Role, Assigned Hostels) or 401
  
  Note over Fastify,Parser: Phase 2: Payload Parsing
  Fastify->>Parser: Parse raw JSON body into request.body
  
  Note over Fastify,CsrfHook: Phase 3: CSRF & Header Verification
  Fastify->>CsrfHook: Validate Origin & custom 'X-Nestora-Requested-With' header
  CsrfHook-->>Fastify: Verified (or abort immediately with HTTP 403)
  
  Note over Fastify,Validator: Phase 4: Fastify Schema Validation
  Fastify->>Validator: Validate params, query, body against compiled JSON schema
  Validator-->>Fastify: Payload valid (or abort immediately with HTTP 400)
  
  Note over Fastify,GuardHook: Phase 5: Authorization & Tenant Hook
  Fastify->>GuardHook: Verify role capability (RBAC) & authorized hostel jurisdiction
  GuardHook-->>Fastify: Authorized (or abort immediately with HTTP 403)
  
  Note over Fastify,Handler: Phase 6: Domain Execution & Transactional Audit
  Fastify->>Handler: Execute controller & domain service
  Handler->>DB: Atomic mutation + audit_logs insert in prisma.$transaction()
  DB-->>Handler: Return committed state
  Handler-->>Fastify: Return domain DTO
  
  Fastify->>Client: Send Standard JSON Envelope (HTTP 200/201)
  
  Note over Fastify,ResponseHook: Phase 7: Operational Logging
  Fastify->>ResponseHook: Asynchronously emit request-level Pino access log
```

### 4.3 Key Backend Technical Responsibilities
1. **Authoritative Authorization & Tenant Scoping**:
   - Enforces the RBAC matrix ([05-user-roles-and-permissions.md](./05-user-roles-and-permissions.md)) and multi-hostel tenant isolation authoritatively at the server boundary. Client claims are never trusted without cryptographic database session validation.
2. **Dual-Layer Audit Logging Strategy**:
   - **Operational Request Logging**: Fastify's Pino logger records HTTP method, route, status code, response time, and client IP asynchronously in the `onResponse` hook for performance monitoring and telemetry.
   - **Guaranteed Business Audit Persistence (`MOD-03`)**: For state-mutating institutional actions (bed allocations, admission sign-offs, fee adjustments, disciplinary sanctions, account deactivations), the audit record MUST be written **synchronously within the exact same database transaction (`prisma.$transaction()`)** as the mutation itself. If the business mutation commits, the audit log is guaranteed to be saved; if the transaction fails, both roll back atomically.
3. **Audit Log Immutability Protections**:
   - Transactionality alone guarantees atomicity, not immutability. Append-only immutability is enforced through three distinct layers:
     - **Application Layer**: `AuditRepository` exports strictly `create` and `findMany` methods; no update or delete methods exist in the codebase.
     - **Database Role Privileges**: The application database user (`nestora_app`) is granted strictly `SELECT` and `INSERT` permissions on `audit_logs`:
       ```sql
       GRANT SELECT, INSERT ON audit_logs TO nestora_app;
       REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM nestora_app;
       ```
     - **Database Trigger**: An immutable trigger raises an exception if any SQL `UPDATE` or `DELETE` is attempted against `audit_logs`:
       ```sql
       CREATE OR REPLACE FUNCTION protect_audit_logs() RETURNS TRIGGER AS $$
       BEGIN
         RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
       END;
       $$ LANGUAGE plpgsql;

       CREATE TRIGGER trg_audit_logs_immutable
       BEFORE UPDATE OR DELETE ON audit_logs
       FOR EACH ROW EXECUTE FUNCTION protect_audit_logs();
       ```
4. **Durable Background Job Processing**:
   - Background jobs (transactional emails, report compilation) are managed through durable database state tables (`scheduled_jobs`, `job_execution_logs` from Document 07) with unique `idempotency_key` constraints.
   - If the server restarts, interrupted jobs are recovered safely without duplicate execution. Workers implement exponential backoff retries (maximum 3 attempts).
5. **Centralized Error Handling**:
   - All unhandled exceptions are intercepted by a global Fastify `setErrorHandler`. Unhandled errors are logged with stack traces and returned to clients as sanitized HTTP 500 error envelopes with a unique correlation ID.

---

## 5. Shared Packages and Contract Ownership (`packages/*`)

Shared packages decouple reusable domain assets from specific runtime applications. To eliminate redundancy and prevent contract drift, each package maintains strict ownership over specific aspects of the data contract:

| Package Name | Workspace Scope | Runtime Type | Authoritative Contract Ownership |
| :--- | :--- | :--- | :--- |
| **`@nestora/database`** | `packages/database` | Runtime (Prisma) | **Persistence Models & Canonical Enums**: Owns `schema.prisma`, SQL migrations, and exports the canonical Prisma-generated model types (`User`, `Student`, `Bed`, `AllocationRecord`, etc.) and database enum types (`Role`, `GenderCategory`, `BedStatus`, `RoomConfigCode`, `AdmissionStatus`, `TicketStatus`). |
| **`@nestora/validators`** | `packages/validators` | Runtime (Zod) | **Mutation Input Contracts**: Owns runtime Zod schemas and derives TypeScript types via `z.infer<typeof Schema>` (`LoginInput`, `AllocateBedInput`, `CreateNoticeInput`). |
| **`@nestora/types`** | `packages/types` | Compile-time only | **API Contracts & Envelopes**: Re-exports canonical database enums from `@nestora/database`, owns `ApiResponse<T>`, `ApiError`, `SessionUser` claims, and Composite DTOs (e.g., sanitized profiles omitting passwords, composite dashboard views). |
| **`@nestora/utils`** | `packages/utils` | Runtime (Pure TS) | **Deterministic Helpers**: Owns date formatters, currency conversions in minor units (paise/cents), registration ID formatters, and slug generators. |
| **`@nestora/config`** | `packages/config` | Development Tooling | **Shared Tooling**: Base configurations for ESLint, Prettier, and TypeScript compiler presets (`tsconfig.base.json`). |

### 5.1 Canonical Enum Ownership and Import Isolation
- **Canonical Enums**: Declared once in `packages/database/prisma/schema.prisma` as PostgreSQL enums (`Role`, `GenderCategory`, `BedStatus`, `RoomConfigCode`). Generated by Prisma into `@nestora/database`. `@nestora/types` re-exports these enums to ensure zero manual duplication.
- **Import Boundary Rule**:
  - `apps/web` is **strictly prohibited from importing `@nestora/database`** or Prisma Client code. The frontend interacts only with `@nestora/types`, `@nestora/validators`, and `@nestora/utils`.
  - Enforced in CI via ESLint `no-restricted-imports` configuration:
    ```javascript
    // apps/web/.eslintrc.js
    module.exports = {
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: ['@nestora/database', '@prisma/client'],
            message: 'Frontend is strictly prohibited from importing database packages.'
          }]
        }]
      }
    };
    ```

### 5.2 Validation Contract Consumption & Verification
- **Frontend Consumption**: Direct client execution using `react-hook-form` with `@hookform/resolvers/zod`.
- **Backend Consumption**: Fastify routes compile shared Zod schemas into JSON Schemas at server registration using `zod-to-json-schema`. Fastify's compiled Ajv engine validates incoming `params`, `query`, and `body` at native C-level speed.
- **Automated Parity Verification**: Rather than assuming 100% parity, an automated contract test suite in `packages/validators` executes in CI, asserting that representative valid and invalid payload fixtures yield identical validation passes and rejection codes under both Zod's parser and Fastify's compiled Ajv validator.

---

## 6. Database and Prisma Organization

The data persistence layer is strictly centralized in `packages/database`. Neither `apps/web` nor `apps/api` maintains separate database connection logic or local schemas.

```mermaid
flowchart LR
  subgraph DataPackage["packages/database"]
    PrismaSchema["schema.prisma (56 Relational Entities)"]
    Migrations["prisma/migrations/ (Versioned SQL Scripts)"]
    SeedScripts["prisma/seed/ (Dev Fixtures & Admin CLI)"]
    PrismaClientInst["Singleton PrismaClient Factory"]
    
    PrismaSchema --> Migrations
    PrismaSchema --> PrismaClientInst
  end

  subgraph Consumers["Workspace Consumers"]
    BackendAPI["apps/api (Queries, Mutations, Transactions)"]
    PrismaStudio["Prisma Studio (Admin Data Browser)"]
  end

  PrismaClientInst -->|"Exports @nestora/database"| BackendAPI
  PrismaSchema -.-> PrismaStudio
```

### 6.1 Database Schema Principles
- **PostgreSQL Relational Engine**: Relational integrity enforced at the database level via foreign key constraints.
- **Physical Asset Protection**: All physical accommodation hierarchy tables (`universities`, `hostels`, `buildings`, `blocks`, `floors`, `rooms`, `beds`) enforce `ON DELETE RESTRICT` constraints to prevent accidental cascade destruction of campus assets.
- **Single Active Bed Occupancy**: Guaranteed at the database level via a partial unique index on `allocation_records(bed_id) WHERE status = 'ACTIVE'`.
- **Account Lockout Columns**: The `users` entity maintains `failed_login_attempts` (`INT`, default 0), `failed_attempts_window_started_at` (`TIMESTAMPTZ`, nullable), and `locked_until` (`TIMESTAMPTZ`, nullable) to satisfy `FR-007` and `NFR-SEC-004`.
- **Student Profile Attributes**: The `students` entity maintains `academic_year`, `current_semester`, and `medical_alerts` to satisfy `FR-009`.
- **Hashed Session Tokens**: The `sessions` table maintains `session_token_hash: VARCHAR(64)` storing a SHA-256 digest of the token rather than the raw plaintext token.

### 6.2 Database Migration Workflows
The workspace establishes distinct, explicit migration workflows for development, verification, and production:

1. **Local Development Migration Workflow**:
   - Developers modify `packages/database/prisma/schema.prisma`.
   - Run: `pnpm --filter @nestora/database db:migrate:dev --name <descriptive_name>`
   - Prisma creates a timestamped SQL migration file in `packages/database/prisma/migrations/`, executes it against the local PostgreSQL container, and regenerates the Prisma Client.
2. **Automated CI Schema Drift Detection**:
   - In CI/CD pipelines, schema drift is checked before deployment:
     ```bash
     pnpm --filter @nestora/database prisma migrate diff \
       --from-schema-datamodel prisma/schema.prisma \
       --to-migrations prisma/migrations \
       --exit-code
     ```
   - If `schema.prisma` contains changes that have not been committed as a migration, this command exits with a non-zero code, failing the build.
3. **Production Deployment Migration Workflow**:
   - In production deployment pipelines, run: `pnpm --filter @nestora/database db:migrate:deploy`
   - Applies pending versioned SQL migrations in strict chronological sequence. It does not compare live schema against data models; schema integrity is guaranteed by prior CI drift verification. Fails fast if migration checksums mismatch.

### 6.3 Secure Database Seeding Strategy
- **Development Environment Seeding**:
  - Running `pnpm --filter @nestora/database db:seed` executes `prisma/seed/seed.ts`.
  - Guarded by an explicit environment check: executes strictly when `NODE_ENV === 'development'`.
  - Populates 1 University, 2 Hostels (Boys' & Girls' categories), 2 Buildings, 4 Blocks, 8 Floors, 24 Rooms across all 6 configurations, and test user accounts for each role.
  - Emits a prominent console alert: `[SECURITY NOTICE: Demo seed accounts are active for local development only]`.
- **Production Initial Administrator Provisioning**:
  - Default administrative credentials are **never hardcoded or committed**.
  - Production initial setup uses a dedicated CLI script:
    `pnpm --filter @nestora/database admin:init --email <admin_email>`
  - The script:
    1. Provisions a user record with `role = 'UNIVERSITY_ADMINISTRATOR'`, `status = 'INACTIVE'`, `is_verified = false`.
    2. Generates a secure, 256-bit activation token, computes its SHA-256 hash, and stores it in `password_reset_tokens` with `expires_at = NOW() + INTERVAL '24 hours'` and `used_at = NULL`.
    3. Outputs the single-use activation URL to standard output.
    4. Upon access, the administrator establishes their password via Argon2id; an atomic transaction sets `status = 'ACTIVE'`, `is_verified = true`, and `used_at = NOW()`, permanently invalidating the token.

---

## 7. API Communication Flow

Communication between the Next.js presentation layer and the Fastify backend follows RESTful conventions using standardized JSON envelope structures.

### 7.1 Client-to-API Topology & CORS Alignment
- **Direct Communication**: Browser clients make HTTP requests directly to Fastify (`apps/api`) at `http://localhost:4000/api/v1` (or via reverse proxy in production).
- **CORS Configuration**: Fastify registers `@fastify/cors` configured with:
  - `origin`: Matches explicit allowlist from `process.env.CORS_ORIGIN` (default: `http://localhost:3000`). Wildcards (`*`) are strictly prohibited.
  - `credentials`: `true` (enabling cross-origin transmission of HTTP-only session cookies).
- **Client Configuration**: Next.js `apiClient` sets `credentials: 'include'` on all `fetch()` calls.

### 7.2 Standardized HTTP Response Envelope
Every API response returned by `apps/api` adheres to a uniform JSON envelope:

#### Successful Response (`200 OK`, `201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "c3b5d27a-8f19-4f3b-87b4-1e5f8a92b3cd",
    "ticketNumber": "CMP-2026-0042",
    "category": "ELECTRICAL",
    "status": "ASSIGNED",
    "createdAt": "2026-11-05T10:15:30.000Z"
  },
  "timestamp": "2026-11-05T10:15:30.120Z"
}
```

#### Error Response (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `423 Locked`, `500 Internal Error`):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_FORBIDDEN_HOSTEL_SCOPE",
    "message": "You do not have administrative authority to access records for Hostel 2.",
    "details": {
      "assignedHostelIds": ["e1a2b3c4-0000-0000-0000-000000000001"],
      "requestedHostelId": "e1a2b3c4-0000-0000-0000-000000000002"
    }
  },
  "timestamp": "2026-11-05T10:16:00.450Z"
}
```

---

## 8. Authentication and Authorization Boundaries

Nestora enforces a defense-in-depth security model separating client-side UX navigation from authoritative backend security gates:

### 8.1 Primary Authentication Model (Opaque Database Sessions)
Nestora standardizes on **opaque, high-entropy database-backed session tokens** stored in the `sessions` table (defined in [07-database-design.md](./07-database-design.md) Section 5.1). Stateless JWTs are not used for user sessions.

1. **Token Generation**: Upon successful login, Fastify generates a cryptographically secure 256-bit token using `crypto.randomBytes(32).toString('hex')`.
2. **Session Storage (SHA-256 Hashing)**:
   - The **raw token is never stored in the database**.
   - The token is hashed using SHA-256: `const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')`.
   - The hash is stored in `sessions.session_token_hash: VARCHAR(64)`. If the database is compromised, active session tokens cannot be derived from stored hashes.
3. **Cookie Transmission & Verification**:
   - The **raw token** is delivered to the browser exclusively through the signed, HTTP-only `nestora_session` cookie.
   - On incoming requests, the Fastify `onRequest` hook extracts and unsigns the cookie using `COOKIE_SECRET`, hashes the token via SHA-256, and queries:
     `SELECT * FROM sessions WHERE session_token_hash = :hash AND expires_at > NOW()`
   - Fastify joins `users` (verifying `status = 'ACTIVE'`) and `hostel_assignments` to populate `request.user`.
4. **Instant Revocation**:
   - Logout, password updates, account suspensions, or administrative deactivations execute:
     `DELETE FROM sessions WHERE session_token_hash = :hash` or `DELETE FROM sessions WHERE user_id = :userId`
   - Instantly terminates session validity across all client devices.
5. **Cookie Security Attributes**:
   - `name`: `nestora_session`
   - `httpOnly`: `true` (blocks client script access, preventing XSS token theft)
   - `secure`: `true` in production (`process.env.NODE_ENV === 'production'`); permits HTTP in local development
   - `sameSite`: `'lax'` (protects against CSRF while permitting standard top-level site navigation)
   - `path`: `/`
   - `maxAge`: Calculated as `SESSION_TTL_HOURS * 3600` (e.g., 24 hours = 86,400 seconds)

### 8.2 Password Hashing Standard (Argon2id)
The system strictly standardizes on **Argon2id** (RFC 9106) with unique per-user cryptographically random salts for all password hashing. Plaintext passwords or legacy weak hashes (MD5, SHA1, plain bcrypt) are strictly prohibited.

### 8.3 Account Lockout & Anti-Enumeration Algorithm
To satisfy `FR-007` and `NFR-SEC-004`, account lockout is enforced via the `users` table:
1. **Anti-Enumeration Protection**:
   - If an email is not found, Fastify computes a dummy Argon2id verification using a fixed dummy hash and returns HTTP 401 with generic message `"Invalid email or password"`. Eliminates timing discrepancies and prevents user enumeration.
2. **Active Lockout Inspection**:
   - If `users.locked_until > NOW()`, Fastify aborts with HTTP 423 Locked.
   - If `users.locked_until <= NOW()` and `locked_until` is not null, the lockout period has expired: `failed_login_attempts` is reset to 0, `locked_until` to NULL, and `failed_attempts_window_started_at` to NULL.
3. **15-Minute Window Tracking & Failed Attempt Handling**:
   - When password verification fails:
     - If `failed_attempts_window_started_at IS NULL` or `NOW() - failed_attempts_window_started_at > 15 minutes`:
       Start new window: `failed_login_attempts = 1`, `failed_attempts_window_started_at = NOW()`.
     - Else (`NOW() - failed_attempts_window_started_at <= 15 minutes`):
       Increment: `failed_login_attempts += 1`.
       If `failed_login_attempts >= 5`:
         Set `locked_until = NOW() + INTERVAL '30 minutes'`.
         Synchronously emit an immutable security audit entry (`action_name = 'ACCOUNT_LOCKOUT'`).
     - Save user state atomically and return HTTP 401 `"Invalid email or password"`.
4. **Successful Authentication Reset**:
   - Upon successful credential verification:
     `failed_login_attempts = 0`, `locked_until = NULL`, `failed_attempts_window_started_at = NULL`.
5. **Network Rate Limiting**:
   - In addition to per-account database lockout, Fastify registers `@fastify/rate-limit` configured per-IP (maximum 10 failed login requests per IP per minute) to protect against distributed credential stuffing and denial of service.

### 8.4 Cross-Site Request Forgery (CSRF) Defense Strategy
Because authentication utilizes ambient browser cookies, Fastify enforces an explicit multi-layered CSRF defense:
- **CORS vs CSRF Distinction**: CORS controls cross-origin response reading via the browser; CSRF prevents unauthorized state-changing requests from being executed by the browser using ambient cookies.
- **Strict Method Gating**: State-changing mutations are strictly restricted to `POST`, `PUT`, `PATCH`, and `DELETE`. `GET` and `HEAD` requests are strictly idempotent and read-only.
- **Strict Origin Validation**: On all state-changing requests, Fastify's `preValidation` hook checks the `Origin` and `Referer` headers against `process.env.CORS_ORIGIN`. Mismatched or absent origin headers abort with HTTP 403 Forbidden.
- **Custom Request Header Requirement**: All mutating requests from `apiClient` must include a custom header (`X-Nestora-Requested-With: XMLHttpRequest`). Because browsers forbid cross-origin scripts from setting custom headers without explicit CORS preflight authorization, cross-origin attackers cannot forge this header.

---

## 9. Multi-Hostel Tenant Isolation Strategy

Nestora enforces a **Shared Database, Shared Schema with Direct Foreign Key Scoping** architecture. Tenant isolation applies a strict **Default-Deny** policy across all six user roles:

```mermaid
flowchart TD
  Request["Incoming Fastify Request"] --> AuthCheck{"Authenticated Session?"}
  AuthCheck -- "No" --> Ret401["HTTP 401 Unauthorized"]
  AuthCheck -- "Yes" --> RBACCheck{"Role Allowed Endpoint?"}
  RBACCheck -- "No" --> Ret403["HTTP 403 Forbidden (RBAC)"]
  RBACCheck -- "Yes" --> TenantCheck{"Tenant Scope Verified?"}
  TenantCheck -- "No" --> Ret403Tenant["HTTP 403 Forbidden (Tenant Scope)"]
  TenantCheck -- "Yes" --> ServiceLayer["Service Layer Verification"]
  ServiceLayer --> RepoLayer["Repository Query Building (WHERE hostel_id = ...)"]
  RepoLayer --> DBQuery["PostgreSQL Execution"]
```

### 9.1 Tenant Boundaries Across All Six User Roles
1. **University Administrator**:
   - Possesses global oversight across all university hostels.
   - **Explicit Scope Distinction**:
     - `GLOBAL_ADMIN_HOSTEL`: Admin operating within a specific hostel (e.g. reviewing Hostel A's complaints). `scope.targetHostelId` is **mandatory**; if missing, throws `BadRequestError`.
     - `GLOBAL_ADMIN_ALL`: Explicitly authorized campus-wide queries (e.g. `MOD-18` institutional occupancy reports). Must be explicitly typed and emits an audit log record. An omitted parameter can never accidentally execute an unrestricted query.
2. **Hostel Warden**:
   - Operational jurisdiction is strictly constrained to assigned hostel(s) recorded in `hostel_assignments`.
   - Accessing or modifying records of unassigned hostels is rejected with HTTP 403 Forbidden.
3. **Student**:
   - Scoped strictly to their own personal records (`student_id`) and assigned resident hostel context (`STUDENT_SCOPED`).
   - Prohibited from viewing other residents' personal, financial, or leave records.
4. **Hostel Staff**:
   - Scoped strictly to maintenance tickets and facilities within their assigned hostel (`hostel_id`).
   - Prohibited from accessing academic, financial, or disciplinary records.
5. **Security Guard**:
   - Scoped strictly to gate passes, visitor logs, and movement logs for their assigned hostel gate checkpoint (`hostel_id`).
   - Prohibited from accessing room allocations, student academic profiles, or financial records.
6. **Accountant (`FINANCE_SCOPED`)**:
   - Possesses university-wide financial visibility, BUT repository access is strictly restricted to financial tables (`fee_schedules`, `fee_items`, `student_ledgers`, `payment_records`, `fee_adjustments`).
   - Attempting to query or mutate non-financial entities (room allocations, attendance records, gate passes, disciplinary files, emergency contacts) is rejected at the repository level with `ForbiddenError`.

### 9.2 Direct `hostel_id` Ownership on Operational Tables
To satisfy the latency benchmarks ($\le 500\text{ms}$) defined in [04-non-functional-requirements.md](./04-non-functional-requirements.md) and eliminate 8-table relational joins, high-frequency operational tables maintain a direct, indexed `hostel_id` foreign key referencing `hostels(id)` (aligned with [07-database-design.md](./07-database-design.md) Section 9.1):
- `attendance_records`
- `leave_applications`
- `outing_requests`
- `gate_movement_logs`
- `visitor_records`
- `complaint_tickets`
- `duty_assignments`
- `staff_attendances`
- `emergency_incidents`
- `admission_applications`
- `buildings`
- `hostel_rules` (nullable for university-wide rules)
- `notices` (nullable for university-wide circulars)

*Note on Non-Operational Tables*: Entities without direct `hostel_id` are scoped through explicit relational paths (e.g., `rooms` via `floor_id` $\rightarrow$ `block_id` $\rightarrow$ `building_id` $\rightarrow$ `hostel_id`; student profiles via `student_id`).

### 9.3 Dual-Level Isolation Enforcement (Service + Repository)
Isolation is enforced at both application layers to guarantee that unscoped queries cannot execute:
1. **Service Layer**: Validates that the requested action matches the actor's jurisdiction.
2. **Repository / Data-Access Layer**: Prisma query builders require typed, non-empty tenant scope parameters:

```typescript
// Example: Scoped repository query in mod12-complaints
export type TenantScope =
  | { type: 'GLOBAL_ADMIN_ALL' }
  | { type: 'GLOBAL_ADMIN_HOSTEL'; targetHostelId: string }
  | { type: 'HOSTEL_SCOPED'; hostelIds: string[] }
  | { type: 'STUDENT_SCOPED'; studentId: string }
  | { type: 'FINANCE_SCOPED' };

export async function findComplaintsByScope(scope: TenantScope) {
  const where: Prisma.ComplaintTicketWhereInput = {};

  switch (scope.type) {
    case 'GLOBAL_ADMIN_ALL':
      // Explicitly authorized campus-wide query (requires audit record in service)
      break;

    case 'GLOBAL_ADMIN_HOSTEL':
      if (!scope.targetHostelId) {
        throw new BadRequestError('Target hostel ID is mandatory for hostel-scoped administrator queries');
      }
      where.hostel_id = scope.targetHostelId;
      break;

    case 'HOSTEL_SCOPED':
      if (!scope.hostelIds || scope.hostelIds.length === 0) {
        throw new ForbiddenError('Access denied: User possesses no authorized hostel assignments');
      }
      where.hostel_id = { in: scope.hostelIds };
      break;

    case 'STUDENT_SCOPED':
      if (!scope.studentId) {
        throw new ForbiddenError('Access denied: Unresolved student identity');
      }
      where.student_id = scope.studentId;
      break;

    case 'FINANCE_SCOPED':
      throw new ForbiddenError('Access denied: Accountants are prohibited from accessing maintenance complaint records');

    default:
      throw new ForbiddenError('Access denied: Unrecognized tenant query scope');
  }

  return prisma.complaintTicket.findMany({ where });
}
```

---

## 10. Environment Configuration Strategy

Environment variables are validated at startup using typed Zod schemas. If any required variable is missing or malformed, application startup is aborted immediately with an explicit configuration error.

### 10.1 Environment Variable Taxonomy
Configuration variables are divided into distinct operational domains:

```
# ==============================================================================
# 1. RUNTIME & NETWORK CONFIGURATION
# ==============================================================================
NODE_ENV=development                       # 'development' | 'test' | 'production'
PORT=4000                                 # Fastify API listening port
HOST=0.0.0.0                              # Fastify bind address
API_URL=http://localhost:4000             # Canonical backend URL
WEB_URL=http://localhost:3000             # Canonical frontend URL
CORS_ORIGIN=http://localhost:3000         # Allowed frontend CORS origins (exact match)

# ==============================================================================
# 2. DATABASE PERSISTENCE (POSTGRESQL)
# ==============================================================================
DATABASE_URL=postgresql://nestora:nestora_dev_pw@localhost:5432/nestora_db?schema=public&connection_limit=10

# ==============================================================================
# 3. SECURITY & CRYPTOGRAPHY
# ==============================================================================
COOKIE_SECRET=change_me_to_a_32_byte_secure_random_string  # Cryptographic cookie signing secret
SESSION_TTL_HOURS=24                      # Database session validity window (hours)

# ==============================================================================
# 4. TRANSACTIONAL EMAIL NOTIFICATIONS (SMTP)
# ==============================================================================
SMTP_HOST=localhost                       # MailHog for dev / real SMTP for prod
SMTP_PORT=1025                            # MailHog port 1025 / SMTP 587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Nestora University System <no-reply@nestora.university.edu>"

# ==============================================================================
# 5. STORAGE & UPLOADS
# ==============================================================================
STORAGE_DRIVER=local                      # 'local' | 's3'
UPLOAD_LOCAL_PATH=./uploads               # Local storage directory for attachments
S3_BUCKET_NAME=nestora-attachments        # S3 bucket for production storage
S3_REGION=us-east-1                       # S3 region
S3_ACCESS_KEY_ID=                         # S3 credentials (production)
S3_SECRET_ACCESS_KEY=
MAX_UPLOAD_SIZE_BYTES=5242880             # 5 MB maximum attachment limit
```

---

## 11. Development and Production Configuration

The workspace enforces environment isolation across development, continuous integration, and production deployment environments.

### 11.1 Local Development Environment
- **Prerequisites**: Node.js 24 LTS (Active), `pnpm` (v9+), Docker & Docker Compose.
- **Supporting Infrastructure Daemons**: Started via Docker Compose:
  ```bash
  # Start local PostgreSQL and MailHog background services
  docker compose -f docker/docker-compose.yml up -d
  ```
  - **PostgreSQL 15+**: Port `5432` with pre-configured development credentials.
  - **MailHog**: Port `1025` (SMTP) and `8025` (Web UI) for inspecting local emails without external cloud SMTP accounts.
- **Application Startup**:
  ```bash
  # Launch all workspace packages, Fastify API, and Next.js concurrently
  pnpm dev
  ```

### 11.2 Production Deployment Environment
- **Multi-Stage Container Builds**:
  - `docker/Dockerfile.api`: Compiles TypeScript, prunes devDependencies, and executes Fastify via `CMD ["node", "dist/server.js"]` under the official Node.js 24 Alpine image.
  - `docker/Dockerfile.web`: Leverages Next.js standalone output mode (`output: 'standalone'`), producing an optimized, self-contained server package executed via `CMD ["node", "server.js"]` under the official Node.js 24 Alpine image.
- **Reverse Proxy Architecture**: Production deployments place Next.js and Fastify behind an Nginx reverse proxy or cloud ingress:
  - `/` routes to the Next.js container (port 3000).
  - `/api/v1/*` routes to the Fastify API container (port 4000).
- **Durable File Uploads**: Production uses S3-compatible object storage (`STORAGE_DRIVER=s3`) with pre-signed upload URLs to guarantee attachment persistence across stateless container lifecycles.

---

## 12. Dependency and Package Management Strategy

The monorepo uses **pnpm workspaces** for dependency deduplication, strict isolation, and deterministic lockfile resolution.

### 12.1 Workspace Configuration (`pnpm-workspace.yaml`)
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Internal workspace dependencies are declared strictly using the `workspace:*` protocol in `package.json`:
```json
{
  "dependencies": {
    "@nestora/database": "workspace:*",
    "@nestora/types": "workspace:*",
    "@nestora/validators": "workspace:*",
    "@nestora/utils": "workspace:*"
  }
}
```

### 12.2 Turborepo Task Pipeline (`turbo.json`)
Turborepo orchestrates task execution using the modern `tasks` schema, caching build and test outputs across packages:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

### 12.3 Key Workspace Scripts

| Command | Action Executed Across Workspace |
| :--- | :--- |
| `pnpm dev` | Starts local development server for all apps in parallel with hot reloading. |
| `pnpm build` | Compiles `@nestora/types`, `@nestora/validators`, generates Prisma client, and builds Next.js and Fastify. |
| `pnpm test` | Runs unit, integration, and contract test suites in topological dependency order. |
| `pnpm lint` | Runs ESLint and Prettier across all packages. |
| `pnpm db:migrate:dev` | Generates and applies a new development SQL migration in `@nestora/database`. |
| `pnpm db:migrate:deploy` | Applies pending migrations in production environments without schema drift generation. |
| `pnpm db:seed` | Populates development demo institutions, hostels, and test user accounts. |

---

## 13. Institutional Decisions & Open Questions

The four unresolved institutional decisions documented throughout the project specification suite remain explicitly documented as **pending institutional confirmation**. The monorepo architecture and data models support any administrative outcome without requiring workspace restructuring:

1. **Hostel Warden Assignment Cardinality ($1:1$ vs. $1:N$)**:
   - *Current Status*: Pending institutional governance policy.
   - *Architecture Support*: The database (`@nestora/database`) models assignments using the associative table `hostel_assignments`. The Fastify backend (`apps/api`) resolves `request.user.assignedHostelIds` as an array. If the university mandates a strict 1:1 policy, the array simply contains a single ID; if 1:N is permitted, the frontend renders a hostel switcher dropdown.
2. **Extended Leave Escalation Threshold**:
   - *Current Status*: Pending institutional policy determining the exact duration (e.g., $>7$ consecutive days) that requires University Administrator escalation.
   - *Architecture Support*: Stored as an institutional parameter in `system_configurations` and read dynamically by `apps/api/src/modules/mod08-leaves/leaves.service.ts`.
3. **Fee Schedule Scope (Uniform vs. Hostel-Specific Differentials)**:
   - *Current Status*: Pending institutional financial governance sign-off.
   - *Architecture Support*: The `fee_schedules` entity in `@nestora/database` maintains a nullable `hostel_id` foreign key. If university-wide, `hostel_id` remains NULL; if hostel-specific, it links to the respective hostel.
4. **Security Guard Shift Management Strategy**:
   - *Current Status*: Pending operational determination on whether Security Guards are assigned daily duty rosters via `staff_profiles` / `duty_assignments` (using department `SECURITY`), or operate through gate-checkpoint credentials and shift change logs (`gate_movement_logs`).
   - *Architecture Support*: Both tables exist in `@nestora/database` and can be leveraged collaboratively or independently based on institutional instructions.

---

## 14. Architecture Consistency Verification

The monorepo architecture has been verified against all existing project documentation:

- **User Roles**: The six confirmed roles (`University Administrator`, `Hostel Warden`, `Student`, `Hostel Staff`, `Security Guard`, `Accountant`) are strictly preserved in `@nestora/types/src/roles.ts` and mapped to dedicated UI namespaces in `apps/web/src/app/(dashboard)/`.
- **Physical Hierarchy**: The 7-tier physical hierarchy ($\text{University} \rightarrow \text{Hostel} \rightarrow \text{Building} \rightarrow \text{Block} \rightarrow \text{Floor} \rightarrow \text{Room} \rightarrow \text{Bed}$) is maintained identically across `@nestora/database` and `@nestora/types`.
- **Room Configurations**: The six standardized room configurations (Single, Double, Triple; AC and Non-AC) are typed in `@nestora/types` and validated in `@nestora/validators`.
- **Module Plan Alignment**: All 19 modules (`MOD-01` to `MOD-19`) and six implementation milestones (`MS-1` to `MS-6`) from [08-module-development-plan.md](./08-module-development-plan.md) map directly to modular packages in `apps/api/src/modules/`.
- **Database Alignment**: All 56 relational tables and constraints from [07-database-design.md](./07-database-design.md) reside in `packages/database/prisma/schema.prisma`.
- **Transactional Audit Logging**: Synchronous persistence of immutable audit records via `apps/api/src/modules/mod03-audit/` inside `prisma.$transaction()` satisfies `AUTH-009` and `FR-140` through `FR-144`.

---

## 15. Summary and Next Steps

`docs/09-monorepo-architecture.md` completes the technical design phase of Nestora by establishing an actionable, maintainable workspace architecture.

### Immediate Implementation Readiness:
With Documents `01` through `09` finalized, the engineering team possesses complete requirements, security rules, database schemas, development milestones, and workspace blueprints. The recommended next technical step is the execution of **Milestone 1 (MS-1: Foundation & Security Core)**, which involves:
1. Initializing the monorepo root manifest (`package.json`, `pnpm-workspace.yaml`, `turbo.json`).
2. Scaffolding shared workspace packages (`packages/types`, `packages/validators`, `packages/database`, `packages/utils`, `packages/config`).
3. Generating the Prisma schema and running the initial PostgreSQL database migration.
4. Implementing `apps/api` with Fastify core plugins, authentication hooks, and `MOD-01`, `MOD-02`, and `MOD-03` domain modules.
5. Scaffolding `apps/web` with Next.js App Router, Tailwind CSS, `shadcn/ui`, and public authentication interfaces.
