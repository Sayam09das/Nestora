# Nestora — Monorepo Architecture Specification

## 1. Document Purpose and Architecture Overview

### 1.1 Document Purpose
This specification establishes the official monorepo architecture and workspace topology for **Nestora — University Hostel Management System**. It translates the system architecture ([06-system-architecture.md](docs/06-system-architecture.md)), database design ([07-database-design.md](docs/07-database-design.md)), and phased development roadmap ([08-module-development-plan.md](docs/08-module-development-plan.md)) into a unified, physical workspace structure.

This document serves as the technical blueprint for repository organization, package boundaries, code-sharing mechanisms, build pipelines, and development workflows. It is designed to guide developers during initial project scaffolding and throughout the six planned implementation milestones (`MS-1` through `MS-6`).

### 1.2 Core Architectural Philosophy
Nestora is architected as a **Decoupled Client-Server Modular Monolith** housed within a single version-controlled repository. This architectural approach is governed by four core principles:

1. **Strict Separation of Concerns**: The Next.js presentation layer (`apps/web`) and the Fastify API application layer (`apps/api`) maintain distinct runtime boundaries. The frontend never accesses the database directly, and the backend never renders presentation HTML. Communication occurs strictly over HTTP/REST using typed JSON envelopes.
2. **Single Source of Truth for Types and Validation**: Domain entities, role enums, API request/response contracts, and validation schemas are maintained in centralized internal workspace packages (`packages/types`, `packages/validators`, `packages/database`). Both frontend forms and backend controllers import identical validation rules, guaranteeing 100% contract parity.
3. **High-Cohesion, Low-Coupling Domain Modularity**: The backend API organizes business logic into 19 self-contained domain modules (`MOD-01` through `MOD-19`), following the canonical module development plan. Cross-module communication occurs via in-process service interfaces, avoiding distributed network overhead.
4. **Pragmatic Workspace Simplicity**: Engineered for an academic software engineering team, the monorepo leverages lightweight package workspaces (`pnpm` or `npm`) coordinated by Turborepo. It eliminates microservice operational complexity, multi-repository version desynchronization, and heavy orchestration tooling.

---

## 2. Proposed Monorepo Directory Structure

The repository is structured into two primary directories: `apps/` (deployable applications) and `packages/` (shared libraries, schemas, and configurations).

```
Nestora/
├── .github/
│   └── workflows/
│       ├── ci.yml                           # Automated lint, type-check, and unit test workflow
│       └── release.yml                      # Production container build & verification workflow
│
├── apps/
│   ├── web/                                 # Presentation Tier: Next.js App Router Application
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
│   │   │   │   ├── api/                     # Local Next.js route handlers (reverse proxy/BFF if needed)
│   │   │   │   ├── layout.tsx               # Root application layout (fonts, providers)
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
│   │   │   ├── lib/                         # Browser API client, formatting utilities, session helpers
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
│       │   ├── config/                      # Server configuration, typed environment variables
│       │   ├── plugins/                     # Fastify infrastructure plugins
│       │   │   ├── cors.ts                  # Cross-Origin Resource Sharing configuration
│       │   │   ├── helmet.ts                # HTTP security headers
│       │   │   ├── rate-limit.ts            # Brute-force protection & endpoint rate limits
│       │   │   ├── prisma.ts                # Database client plugin and lifecycle hook
│       │   │   └── auth.ts                  # Session cookie parser and JWT verification
│       │   ├── middleware/                  # Request lifecycle interceptors
│       │   │   ├── authenticate.ts          # Session validation hook (onRequest)
│       │   │   ├── authorize.ts             # RBAC role capability guard (preHandler)
│       │   │   └── tenant-scope.ts          # Multi-hostel isolation guard (preHandler)
│       │   ├── common/                      # Shared backend infrastructure
│       │   │   ├── errors/                  # Custom HTTP error classes (AppError, ForbiddenError)
│       │   │   ├── helpers/                 # Standard JSON envelope formatters, pagination helpers
│       │   │   └── constants/               # System limits, default thresholds, error codes
│       │   ├── modules/                     # 19 In-Process Domain Business Modules
│       │   │   ├── mod01-auth/              # MOD-01: Authentication & Account Management
│       │   │   ├── mod02-infrastructure/    # MOD-02: Hostel Infrastructure Management
│       │   │   ├── mod03-audit/             # MOD-03: Audit Logging Service
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
│       │   ├── workers/                     # Background Task Workers
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
│   │   │   ├── seed/                        # Institutional seed fixtures (Admin, Hostels, Rooms)
│   │   │   │   ├── seed.ts                  # Main seed execution entry point
│   │   │   │   ├── infrastructure-seed.ts   # 7-tier hierarchy demo fixtures
│   │   │   │   └── users-seed.ts            # Default role accounts
│   │   │   └── schema.prisma                # Definitive Prisma Schema (56 relational entities)
│   │   ├── src/
│   │   │   ├── client.ts                    # Singleton PrismaClient factory with logging
│   │   │   └── index.ts                     # Re-exported PrismaClient, generated types, constants
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                               # Shared TypeScript Type Definitions & Enums
│   │   ├── src/
│   │   │   ├── roles.ts                     # Six user roles enum & privilege definition
│   │   │   ├── infrastructure.ts            # 7-tier hierarchy interfaces & 6 room config types
│   │   │   ├── auth.ts                      # JWT payload, session user claims, login responses
│   │   │   ├── api.ts                       # Standard JSON response envelope, error codes
│   │   │   ├── modules/                     # DTO interfaces per module (MOD-01 to MOD-19)
│   │   │   └── index.ts                     # Barrel export for all domain types
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
│   │   │   ├── date.ts                      # Date formatting, semester calculation, curfew checks
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
│   ├── Dockerfile.api                       # Multi-stage production container for Fastify API
│   └── Dockerfile.web                       # Multi-stage production container for Next.js App
│
├── docs/                                    # Project Documentation Suite (Documents 01 to 09)
├── .editorconfig
├── .gitignore
├── .prettierrc
├── package.json                             # Monorepo root package manifest
├── pnpm-workspace.yaml                      # Workspace package inclusion definitions
├── README.md                                # Project root README and architectural index
└── turbo.json                               # Turborepo task pipeline execution graph
```

---

## 3. Frontend Application Responsibilities (`apps/web`)

The Next.js web application serves as the system's presentation layer, providing responsive, accessible web interfaces tailored to each of the six confirmed user roles.

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
    Admin["/admin/* (University Administrator Dashboard & Central Controls)"]
    Warden["/warden/* (Hostel Warden Dashboard & Scoped Operations)"]
    Student["/student/* (Student Resident Portal & Self-Service)"]
    Staff["/staff/* (Hostel Staff Task Queue & Duty View)"]
    Guard["/guard/* (Security Guard Gate Checkpoint Console)"]
    Accountant["/accountant/* (Accountant Financial Management Portal)"]
  end

  Root --> PublicRoutes
  Root --> ProtectedRoutes
```

### 3.2 Key Frontend Technical Responsibilities
1. **User Authentication & Session State Management**:
   - Maintains an `AuthContext` provider storing the authenticated user profile, active role, and assigned hostel scope.
   - Leverages HTTP-only session cookies managed automatically by browser requests; client code never parses or stores raw session tokens in `localStorage`.
2. **Form Handling & Client Validation**:
   - Implements React Hook Form paired with `@hookform/resolvers/zod` utilizing identical schemas imported directly from `@nestora/validators`.
   - Form inputs validate synchronously on the client, providing immediate inline feedback while guaranteeing conformity with backend API expectations.
3. **Data Fetching, Caching, and Server State**:
   - Uses TanStack Query (`@tanstack/react-query`) to coordinate all client-side data fetching.
   - Enforces automated query key scoping by hostel (e.g., `['hostels', hostelId, 'rooms']`) to guarantee cache invalidation when switching views.
   - Provides optimistic updates for high-frequency actions (e.g., toggling attendance marks, acknowledging notices).
4. **Accessible Design System**:
   - Constructed with `shadcn/ui` accessible headless primitives (Radix UI) styled using utility classes from `Tailwind CSS`.
   - Adheres to WCAG 2.1 Level AA accessibility standards, including keyboard navigation, ARIA attributes, and accessible color contrast.
5. **Centralized API Client**:
   - Exposes a typed `apiClient` wrapper built on browser `fetch()`:
     - Automatically prepends base API routes (`/api/v1`).
     - Includes credentials (`credentials: 'include'`) for cross-origin cookie transmission.
     - Intercepts HTTP 401 Unauthorized errors to trigger automated redirection to `/login`.
     - Intercepts HTTP 403 Forbidden errors to display a standardized permission denial banner.

---

## 4. Backend Application Responsibilities (`apps/api`)

The Fastify backend serves as the authoritative application layer, orchestrating business logic, data persistence, and security enforcement across all 19 system modules.

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

### 4.2 Lifecycle Interceptor & Middleware Pipeline
Fastify processes every incoming HTTP request through an explicit, performant lifecycle hook pipeline:

```mermaid
sequenceDiagram
  autonumber
  participant Client as Web Client (Next.js)
  participant Fastify as Fastify Engine
  participant AuthHook as onRequest (Auth)
  participant ScopeHook as preHandler (RBAC & Tenant)
  participant Schema as Validation (Ajv/Zod)
  participant Service as Domain Service
  participant DB as PostgreSQL (Prisma)
  participant Audit as onResponse (Audit Logger)

  Client->>Fastify: HTTP Request (e.g., POST /api/v1/admissions/verify)
  Fastify->>AuthHook: Parse Cookie & Verify Session
  AuthHook-->>Fastify: Attach request.user (ID, Role, Assigned Hostels)
  Fastify->>ScopeHook: Enforce Role Capability & Hostel Scope
  ScopeHook-->>Fastify: Scope Verified (or abort HTTP 403)
  Fastify->>Schema: Validate Payload Body against Compiled Schema
  Schema-->>Fastify: Payload Validated (or abort HTTP 400)
  Fastify->>Service: Execute Business Logic
  Service->>DB: Atomic Query / prisma.$transaction()
  DB-->>Service: Return Result
  Service-->>Fastify: Return Domain DTO
  Fastify->>Client: Send Standard JSON Envelope (HTTP 200/201)
  Fastify->>Audit: Asynchronously Emit Immutable Audit Record (MOD-03)
```

### 4.3 Key Backend Technical Responsibilities
1. **Authoritative Authorization & Scoping**:
   - Enforces the RBAC matrix ([05-user-roles-and-permissions.md](docs/05-user-roles-and-permissions.md)) and tenant isolation rules at the server layer. Client claims are never trusted without cryptographic session verification.
2. **Transactional Integrity**:
   - Coordinates complex multi-step state mutations (such as bed allocation, admission sign-offs, and check-out clearances) within atomic database transactions via `prisma.$transaction()`.
3. **Asynchronous Background Processing**:
   - Houses an in-process background worker (`workers/email-worker.ts`) executing decoupled, non-blocking asynchronous tasks (SMTP email dispatching for password resets, activation invites, and emergency broadcasts).
4. **Centralized Error Handling**:
   - Catches all uncaught exceptions via a global Fastify `setErrorHandler`. Unhandled errors are logged with stack traces and returned to clients as sanitized HTTP 500 error envelopes with a unique correlation ID.

---

## 5. Shared Packages and Their Responsibilities (`packages/*`)

Shared packages decouple reusable domain assets from specific runtime applications, preventing code duplication and drift.

| Package Name | Workspace Scope | Runtime Type | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **`@nestora/types`** | `packages/types` | Compile-time only (Types) | Central catalog of all TypeScript interfaces, enums, DTOs, and API contract payloads. Zero runtime overhead. |
| **`@nestora/validators`** | `packages/validators` | Runtime (Zod) | Central repository of Zod schemas validating form inputs and API payloads. Imported by both `web` and `api`. |
| **`@nestora/database`** | `packages/database` | Runtime (Prisma) | Owns `schema.prisma`, SQL migration history, seed fixtures, and exports a singleton `PrismaClient`. |
| **`@nestora/utils`** | `packages/utils` | Runtime (Pure TS) | Deterministic utility functions: currency arithmetic (paise conversion), academic year formatters, date maths. |
| **`@nestora/config`** | `packages/config` | Development Tooling | Shared ESLint rules, Prettier configurations, and TypeScript compiler base presets (`tsconfig.base.json`). |

### 5.1 `@nestora/types` Specification
Contains immutable definitions representing domain models and communication envelopes:
- **Role Enumerations**: `UNIVERSITY_ADMINISTRATOR`, `HOSTEL_WARDEN`, `STUDENT`, `HOSTEL_STAFF`, `SECURITY_GUARD`, `ACCOUNTANT`.
- **Infrastructure Hierarchy Types**: Strongly typed interfaces for University, Hostel, Building, Block, Floor, Room, and Bed.
- **Room Configuration Codes**: `SINGLE_NON_AC`, `SINGLE_AC`, `DOUBLE_NON_AC`, `DOUBLE_AC`, `TRIPLE_NON_AC`, `TRIPLE_AC`.
- **API Response Envelope**:
  ```typescript
  export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: Record<string, string[]>;
    };
    meta?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
    timestamp: string;
  }
  ```

### 5.2 `@nestora/validators` Specification
Defines runtime Zod schemas used across the workspace:
- Frontend uses `z.infer<typeof Schema>` to generate form types and validate form state before network dispatch.
- Backend compiles the same Zod schemas via `zod-to-json-schema` into Fastify route validation options.
- Example (`auth.validator.ts`):
  ```typescript
  import { z } from 'zod';

  export const LoginSchema = z.object({
    email: z.string().email('Please enter a valid university email address'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
  });

  export type LoginInput = z.infer<typeof LoginSchema>;
  ```

---

## 6. Database and Prisma Organization

The data persistence layer is strictly centralized in `packages/database`. Neither `apps/web` nor `apps/api` maintains separate database connection logic or local schemas.

```mermaid
flowchart LR
  subgraph DataPackage["packages/database"]
    PrismaSchema["schema.prisma (56 Relational Entities)"]
    Migrations["prisma/migrations/ (SQL Scripts)"]
    SeedScripts["prisma/seed/ (Initial Data)"]
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
- **Physical Asset Protection**: All physical infrastructure tables (`universities`, `hostels`, `buildings`, `blocks`, `floors`, `rooms`, `beds`) enforce `ON DELETE RESTRICT` constraints to prevent accidental cascade destruction of campus assets.
- **Single Active Bed Occupancy**: Guaranteed at the database level via a partial unique index on `allocation_records(bed_id) WHERE status = 'ACTIVE'`.
- **Account Lockout Columns**: The `users` entity maintains `failed_login_attempts` (`INT`, default 0) and `locked_until` (`TIMESTAMPTZ`, nullable) to satisfy `FR-007` and `NFR-SEC-004`.
- **Student Academic & Medical Attributes**: The `students` entity maintains `academic_year`, `current_semester`, and `medical_alerts` to satisfy `FR-009`.

### 6.2 Database Migration and Seeding Workflows
1. **Schema Mutations**:
   - Developers edit `packages/database/prisma/schema.prisma`.
   - Run `pnpm --filter @nestora/database db:migrate:dev --name <descriptive_name>`.
   - Prisma automatically generates a new timestamped SQL migration in `packages/database/prisma/migrations/` and updates the locally generated Prisma Client.
2. **Deterministic Seeding**:
   - Running `pnpm --filter @nestora/database db:seed` executes `prisma/seed/seed.ts`.
   - Provisions 1 University institution, 2 Hostels (Boys' & Girls' categories), 2 Buildings, 4 Blocks, 8 Floors, 24 Rooms across all six room configurations, default Administrator credentials, demo Wardens, and test student profiles.

---

## 7. API Communication Flow

Communication between the Next.js presentation layer and the Fastify backend follows strict RESTful conventions using standardized JSON envelope structures.

### 7.1 Standardized HTTP Response Envelope
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

#### Error Response (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable`):
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

Nestora enforces a defense-in-depth security model separating presentation conveniences from server-side security enforcement:

```mermaid
flowchart TD
  subgraph ClientBoundary["Client Boundary (apps/web)"]
    UIRouteGuard["Next.js Route Middleware\n(Checks Cookie Presence & Cached Role)"]
    UIComponent["Role-Conditional Component Rendering\n(Hides Action Buttons & Nav Links)"]
  end

  subgraph Transport["Secure Network Transport"]
    HTTPS["HTTPS / Secure HTTP-Only Cookie Transmission"]
  end

  subgraph ServerBoundary["Server Boundary (apps/api) — AUTHORITATIVE"]
    AuthHook["Fastify onRequest Hook\n(Validates Session Token & Resolves Actor Profile)"]
    RBACGuard["Fastify preHandler RBAC Guard\n(Verifies Role Capability: AUTH-001 / AUTH-002)"]
    TenantGuard["Fastify preHandler Tenant Scoping Guard\n(Verifies Hostel Jurisdiction: AUTH-004)"]
    DomainAction["Domain Service Execution\n(Invokes Prisma Transactions)"]
  end

  UIRouteGuard -.->|"Navigates"| UIComponent
  UIComponent -->|"API Request"| HTTPS
  HTTPS --> AuthHook
  AuthHook --> RBACGuard
  RBACGuard --> TenantGuard
  TenantGuard --> DomainAction
```

### 8.1 Authentication Architecture
- **Password Protection**: Passwords are cryptographically salted and hashed using Argon2id (or bcrypt) prior to database persistence.
- **Session Tokens**: Authenticated sessions issue a high-entropy session token stored in an HTTP-only, secure, `SameSite=Lax/Strict` cookie (`nestora_session`). Client-side JavaScript cannot read or modify this token.
- **Account Lockout Protection**: Tracked in the `users` table via `failed_login_attempts` and `locked_until`. When failed attempts reach 5 within a 15-minute window, the account is locked for 30 minutes (`FR-007`, `NFR-SEC-004`).

### 8.2 Authorization Architecture (RBAC & Tenant Guards)
Authorization enforces a strict **Default-Deny** policy (`AUTH-002`):
1. **Role Capability Verification**: The backend inspects whether `request.user.role` possesses the permission flag required by the route controller (e.g., only `UNIVERSITY_ADMINISTRATOR` and `HOSTEL_WARDEN` can verify admissions).
2. **Hostel Scoping Verification**: If the user is a `HOSTEL_WARDEN`, `HOSTEL_STAFF`, or `SECURITY_GUARD`, the request's target `hostel_id` parameter is verified against `request.user.assignedHostelIds`. If mismatched, the request is aborted immediately with HTTP 403 Forbidden (`AUTH-004`).

---

## 9. Multi-Hostel Tenant Isolation Strategy

Nestora utilizes a **Shared Database, Shared Schema with Direct Foreign Key Scoping** architecture. Tenant isolation is guaranteed through three coordinated layers:

### 9.1 Direct `hostel_id` Ownership on Operational Tables
High-frequency operational tables store a direct, indexed foreign key referencing `hostels(id)`:
- `attendance_records`
- `leave_applications`
- `outing_requests`
- `gate_movement_logs`
- `visitor_records`
- `complaint_tickets`
- `duty_assignments`
- `staff_attendances`
- `emergency_incidents`
- `notices` (nullable for university-wide broadcasts)

*Design Rationale*: Incorporating direct `hostel_id` foreign keys avoids expensive 8-table relational joins during daily roll-calls and gate movements, enabling queries to filter directly via B-Tree index lookups (`WHERE hostel_id = :hostelId`).

### 9.2 Programmatic Backend Query Scoping
Database queries are constructed using tenant-scoped helper functions:
```typescript
// Example: Scoped complaint ticket retrieval in mod12-complaints
export async function getComplaints(user: SessionUser, hostelId?: string) {
  const whereClause: Prisma.ComplaintTicketWhereInput = {};

  if (user.role === 'UNIVERSITY_ADMINISTRATOR') {
    // Administrator can view all hostels or filter by specific hostel
    if (hostelId) whereClause.hostel_id = hostelId;
  } else if (user.role === 'HOSTEL_WARDEN' || user.role === 'HOSTEL_STAFF') {
    // Operational roles are strictly constrained to their assigned hostel(s)
    whereClause.hostel_id = { in: user.assignedHostelIds };
  } else if (user.role === 'STUDENT') {
    // Students view only their own filed complaints
    whereClause.student_id = user.studentId;
  }

  return prisma.complaintTicket.findMany({ where: whereClause });
}
```

### 9.3 Prevention of Horizontal Privilege Escalation (URL Tampering)
If an actor attempts to inspect or mutate records outside their jurisdiction by altering URL path parameters (e.g., a Warden assigned to Hostel A attempting `GET /api/v1/hostels/hostel-b/residents`), the Fastify `tenant-scope` preHandler hook verifies parameter equality against `user.assignedHostelIds` and rejects the request before business logic executes.

---

## 10. Environment Configuration Strategy

Environment variables are validated at application startup using typed Zod schemas. If any required environment variable is missing or malformed, the application crashes immediately with an informative startup error.

### 10.1 Environment Variable Taxonomy
The system divides configuration variables into logical categories:

```
# ==============================================================================
# 1. SERVER & NETWORK CONFIGURATION
# ==============================================================================
NODE_ENV=development                       # 'development' | 'test' | 'production'
PORT=4000                                 # Fastify API listening port
HOST=0.0.0.0                              # Fastify bind address
API_URL=http://localhost:4000             # Canonical backend URL
WEB_URL=http://localhost:3000             # Canonical frontend URL
CORS_ORIGIN=http://localhost:3000         # Allowed CORS origins

# ==============================================================================
# 2. DATABASE CONFIGURATION
# ==============================================================================
DATABASE_URL=postgresql://nestora:nestora_dev_pw@localhost:5432/nestora_db?schema=public&connection_limit=10

# ==============================================================================
# 3. SECURITY & CRYPTOGRAPHY
# ==============================================================================
COOKIE_SECRET=change_me_to_a_32_byte_secure_random_string
SESSION_SECRET=change_me_to_another_secure_signing_secret
SESSION_TTL_HOURS=24                      # Session duration before expiry

# ==============================================================================
# 4. EMAIL / TRANSACTIONAL NOTIFICATIONS (SMTP)
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
MAX_UPLOAD_SIZE_BYTES=5242880             # 5 MB maximum attachment size
```

### 10.2 Variable Segregation Across Workspace
- `apps/web/.env.local`: Contains `NEXT_PUBLIC_API_URL` and frontend-specific client flags.
- `apps/api/.env`: Contains backend secrets, database connection strings, and SMTP credentials.
- Root `.env.example`: Provides a comprehensive reference template for developer onboarding.

---

## 11. Development and Production Configuration

The monorepo architecture maintains reproducible configurations across development, continuous integration, and production environments.

### 11.1 Local Development Environment
- **Prerequisites**: Node.js 18+ (LTS), `pnpm` (or `npm`), Docker & Docker Compose.
- **Local Supporting Services**: Managed via `docker/docker-compose.yml`:
  - **PostgreSQL 15+**: Persistent database running on port `5432`.
  - **MailHog**: Lightweight local SMTP server and web inbox on port `8025` for testing email dispatch without cloud credentials.
- **Workflow Orchestration**:
  - `pnpm dev`: Single root command launching PostgreSQL via Docker, compiling shared workspace packages, and initiating both Next.js and Fastify in watch/hot-reload mode concurrently.

### 11.2 Production Deployment Environment
- **Containerization Strategy**: Multi-stage Docker builds optimize container images by separating compilation tooling from runtime artifacts:
  - `Dockerfile.api`: Builds production JavaScript from TypeScript, prunes devDependencies, and runs Fastify under the official Node.js Alpine base.
  - `Dockerfile.web`: Leverages Next.js standalone output mode (`output: 'standalone'`), generating a minimal, self-contained server package that excludes unnecessary node_modules.
- **Reverse Proxy Architecture**: In production deployments, Next.js and Fastify operate behind an Nginx reverse proxy or cloud ingress controller routing `/` to the Next.js container and `/api/v1/*` to the Fastify container over an isolated internal container network.

---

## 12. Dependency and Package Management Strategy

The workspace relies on modern package management standards engineered to eliminate dependency duplication while preserving lightning-fast build times.

### 12.1 Workspace Configuration
- **Package Manager**: `pnpm` (or standard `npm workspaces`).
- **Internal Linking**: Internal packages are linked using the workspace protocol (`workspace:*`):
  ```json
  // apps/api/package.json
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
Turborepo orchestrates build, test, and lint tasks in correct dependency order, caching build artifacts to ensure instant incremental builds:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
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
| `pnpm dev` | Starts local database services and runs frontend and backend concurrently with hot reloading. |
| `pnpm build` | Compiles `@nestora/types`, `@nestora/validators`, generates Prisma client, and builds Next.js and Fastify. |
| `pnpm test` | Runs Jest / Vitest unit and integration test suites across all packages. |
| `pnpm lint` | Executes ESLint and Prettier across all applications and shared packages. |
| `pnpm db:migrate` | Applies pending PostgreSQL migrations using Prisma in development. |
| `pnpm db:seed` | Populates the database with initial institutional and demo role accounts. |

---

## 13. Institutional Decisions & Open Questions

The four unresolved institutional decisions documented throughout the project specification suite remain explicitly documented as **pending institutional confirmation**. The proposed monorepo architecture is intentionally structured to support any administrative outcome without requiring workspace reorganization:

1. **Hostel Warden Assignment Cardinality ($1:1$ vs. $1:N$)**:
   - *Current Status*: Pending institutional governance policy.
   - *Architecture Support*: The database (`@nestora/database`) models assignments using the associative table `hostel_assignments`. The backend (`apps/api`) resolves `request.user.assignedHostelIds` as an array. If the university mandates a strict 1:1 policy, the array simply contains a single ID; if 1:N is permitted, the frontend renders a hostel switcher dropdown.
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

The proposed monorepo architecture has been verified against all existing project documentation:

- **User Roles**: The six confirmed roles (`University Administrator`, `Hostel Warden`, `Student`, `Hostel Staff`, `Security Guard`, `Accountant`) are strictly preserved in `@nestora/types/src/roles.ts` and mapped to dedicated UI namespaces in `apps/web/src/app/(dashboard)/`.
- **Physical Hierarchy**: The 7-tier physical hierarchy ($\text{University} \rightarrow \text{Hostel} \rightarrow \text{Building} \rightarrow \text{Block} \rightarrow \text{Floor} \rightarrow \text{Room} \rightarrow \text{Bed}$) is maintained identically across `@nestora/database` and `@nestora/types`.
- **Room Configurations**: The six standardized room configurations (Single, Double, Triple; AC and Non-AC) are typed in `@nestora/types` and validated in `@nestora/validators`.
- **Module Plan Alignment**: All 19 modules (`MOD-01` to `MOD-19`) and six implementation milestones (`MS-1` to `MS-6`) from [08-module-development-plan.md](docs/08-module-development-plan.md) map directly to modular packages in `apps/api/src/modules/`.
- **Database Alignment**: All 56 relational tables and constraints from [07-database-design.md](docs/07-database-design.md) reside in `packages/database/prisma/schema.prisma`.
- **Audit Logging**: Asynchronous emission of immutable audit records via `apps/api/src/modules/mod03-audit/` satisfies `AUTH-009` and `FR-140` through `FR-144`.

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
