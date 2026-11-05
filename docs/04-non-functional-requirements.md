# Nestora — Non-Functional Requirements Specification

## 1. Document Purpose
The purpose of this Non-Functional Requirements (NFR) Specification is to define the quality attributes, operational constraints, security benchmarks, and system characteristics for **Nestora — University Hostel Management System**.

While functional requirements detail *what* the system must do, non-functional requirements define *how* the system must perform, operate, scale, and safeguard information. For Nestora—an academic software engineering project for a Bachelor of Computer Applications (BCA) curriculum—this specification establishes the engineering criteria necessary to ensure software robustness, data security, role-based isolation, user accessibility, and administrative trustworthiness.

This document builds directly upon the foundational context of [01-project-overview.md](./01-project-overview.md), the system boundaries in [02-project-scope.md](./02-project-scope.md), and the functional behaviors documented in [03-functional-requirements.md](./03-functional-requirements.md).

---

## 2. Introduction
In a multi-hostel university environment, software systems must manage sensitive personal identities, enforce rigid security boundaries across disparate student and staff groups, guarantee financial integrity, and maintain operational continuity across consecutive academic semesters.

Nestora is structured around six distinct user roles:
1. **University Administrator**
2. **Hostel Warden**
3. **Student**
4. **Hostel Staff**
5. **Security Guard**
6. **Accountant**

To serve these diverse stakeholders effectively, the platform must balance centralized institutional control with localized hostel-level autonomy. All quality targets defined herein represent **planned benchmarks and design criteria** formulated for an academic conceptual model. Performance targets and operational recovery objectives are proposed benchmarks intended for future empirical testing and validation, rather than claims of an active, production-grade deployment.

---

## 3. Requirement Identification and Priority
Non-functional requirements in this document are uniquely indexed using standardized alphanumeric identifiers:

$$\text{NFR}-\text{[CATEGORY]}-\text{[SEQUENCE NUMBER]}$$

Where `[CATEGORY]` indicates the specific quality domain (e.g., `PER` for Performance, `SEC` for Security, `PRI` for Privacy).

Each requirement specifies a priority level defined as:
- **Must**: Essential quality attribute mandatory for basic system integrity, security, and operation.
- **Should**: Important attribute necessary for optimal usability, reliability, and maintainability under typical academic operating conditions.
- **Could**: Desirable enhancement to be incorporated as development and testing resources permit.

---

## 4. Performance Requirements

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-PER-001** | The system shall render primary user dashboard views and standard navigation pages within a proposed target of $\le 2.0$ seconds under normal network conditions. | Proposed: Must | Automated browser performance profiling under simulated broadband network latency measuring First Contentful Paint (FCP) and Time to Interactive (TTI). |
| **NFR-PER-002** | The system shall execute standard transactional read operations (e.g., fetching student profile, room details, published notices) within a proposed server response target of $\le 500$ milliseconds. | Proposed: Must | API benchmark profiling measuring 95th percentile ($P_{95}$) server response latency for read queries. |
| **NFR-PER-003** | The system shall process transactional write operations (e.g., submitting leave applications, lodging maintenance tickets, recording gate movements) within a proposed target of $\le 1.0$ second. | Proposed: Must | End-to-end API write latency benchmarking measuring time from HTTP request submission to database commit confirmation. |
| **NFR-PER-004** | The system architecture shall support concurrent active user sessions across multiple university hostels without unhandled timeouts or dropped HTTP connections. | Proposed: Should | Stress testing via load generation tools simulating concurrent authenticated users accessing dashboards and submitting forms. |
| **NFR-PER-005** | Database queries shall be optimized using indexing on primary keys, foreign keys, unique identifiers, and frequently filtered fields (e.g., `hostel_id`, `student_id`, `status`, `timestamp`) to avoid unindexed full-table scans. | Proposed: Must | Database query execution plan analysis (`EXPLAIN / ANALYZE`) confirming index utilization on all core operational collections/tables. |
| **NFR-PER-006** | The generation of aggregated administrative reports and large historical data exports shall execute asynchronously or in an isolated manner so as not to block or degrade interactive online operations. | Proposed: Should | Concurrent execution test: verify that triggering a heavy historical report export does not increase standard page load latency by more than 15%. |

---

## 5. Security Requirements

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-SEC-001** | The system shall enforce mandatory authentication for all protected application routes, endpoints, and resources, denying unauthenticated requests with HTTP 401 Unauthorized. | Proposed: Must | Automated security test suite querying protected API endpoints without authentication tokens, verifying strict rejection. |
| **NFR-SEC-002** | The system shall enforce strict Role-Based Access Control (RBAC) across all six user roles, rejecting any unauthorized action with HTTP 403 Forbidden. | Proposed: Must | Role privilege boundary test suite: verify that Students, Staff, Guards, and Accountants cannot invoke administrative endpoints. |
| **NFR-SEC-003** | The system shall enforce rigid hostel-level data isolation at the service and data access layers, ensuring Hostel Wardens and Hostel Staff cannot query or mutate data of unassigned hostels. | Proposed: Must | Cross-tenant data isolation test: verify that a Warden authenticated to Hostel A receives an authorization denial when requesting Hostel B records. |
| **NFR-SEC-004** | User passwords shall be cryptographically hashed using a modern, adaptive hashing algorithm with unique salts per user; passwords shall never be stored or transmitted in plaintext. | Proposed: Must | Database inspection verifying that password fields contain salted, irreversibly hashed strings, with zero plaintext occurrences. |
| **NFR-SEC-005** | The application shall protect against common web vulnerabilities identified in the OWASP Top 10, including SQL/NoSQL injection, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and Insecure Direct Object References (IDOR). | Proposed: Must | Static Application Security Testing (SAST) and dynamic penetration test scripts checking input parameter sanitization and token validation. |
| **NFR-SEC-006** | Authentication sessions and tokens shall enforce secure transmission attributes (e.g., `HttpOnly`, `Secure`, `SameSite`), incorporate inactivity timeouts, and immediately invalidate on logout. | Proposed: Must | Cookie/token header inspection and post-logout session reuse tests confirming terminated tokens cannot access subsequent endpoints. |
| **NFR-SEC-007** | The system shall enforce rate limiting on sensitive authentication and account endpoints (login, password reset requests) to mitigate brute-force and credential stuffing attacks. | Proposed: Must | Automated burst request test: sending rapid successive authentication requests from a single client triggers HTTP 429 Too Many Requests after threshold. |
| **NFR-SEC-008** | Application source code, configuration templates, and client-side builds shall contain zero hardcoded credentials, secret keys, or database passwords. | Proposed: Must | Automated secret scanning pre-commit hook and repository audit checking for committed secrets and API tokens. |

---

## 6. Privacy and Data Protection

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-PRI-001** | The system shall restrict student private data access: resident students shall view only their own personal records, fee balances, disciplinary files, and leave records. | Proposed: Must | Direct object reference vulnerability test: verify that attempting to query another student's ID via API returns HTTP 403 Forbidden or 404 Not Found. |
| **NFR-PRI-002** | Student guardian contact information and emergency contact details shall be classified as confidential, accessible only to authorized roles (University Administrator and assigned Hostel Warden) during official emergencies or inquiries. | Proposed: Must | Field-level authorization test: verify that Hostel Staff, Security Guards, and other Students cannot retrieve guardian contact fields. |
| **NFR-PRI-003** | Sensitive personal data, user passwords, authentication tokens, and financial account details shall never be exposed in application logs, error messages, or unencrypted notification payloads. | Proposed: Must | Automated log inspection and API error response analysis verifying complete redaction of sensitive credential and identity parameters. |
| **NFR-PRI-004** | Data collection shall adhere to the principle of data minimization, capturing only demographic and academic fields necessary for university housing administration. | Proposed: Should | Data dictionary compliance review evaluating every captured field against verified operational necessity. |
| **NFR-PRI-005** | The system shall support institutional data retention and archival policies, allowing graduated or withdrawn student records to be safely archived or anonymized in compliance with university governance. | Proposed: Should | Archival verification test: executing the student offboarding workflow transitions records to an archived state while removing active operational flags. |

---

## 7. Reliability and Availability

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-REL-001** | The system shall target a proposed operational availability of $\ge 99.0\%$ during active academic semester periods, excluding planned and communicated maintenance windows. | Proposed: Should | Synthetic uptime monitoring over an evaluation testing window verifying system availability meets the proposed benchmark. |
| **NFR-REL-002** | The system shall enforce transactional atomicity for all multi-step business operations (e.g., bed allocation, student check-out, fee waivers), ensuring partial updates are rolled back upon failure. | Proposed: Must | Fault injection testing: simulating network or database failure midway through a bed allocation confirms no orphaned or partially allocated states persist. |
| **NFR-REL-003** | The system shall exhibit graceful degradation when non-critical external services (e.g., SMTP email dispatch) experience temporary unavailability, preserving core in-app operations. | Proposed: Must | Service dependency failure test: disabling the outbound email service allows student leave submission to succeed with a queued or logged notification error. |
| **NFR-REL-004** | The application server shall incorporate automatic connection pool management and reconnection logic to recover gracefully from transient database disconnections without requiring manual service restarts. | Proposed: Should | Simulated database restart test: verify that the application server re-establishes active database connections and resumes request servicing automatically. |

---

## 8. Usability and Accessibility

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-USA-001** | The user interface shall provide a consistent design language, layout structure, and terminology aligned with university residential operations across all six role interfaces. | Proposed: Must | Expert heuristic evaluation and UI review checking visual hierarchy, terminology consistency, and component alignment across role views. |
| **NFR-USA-002** | All interactive form fields shall provide clear, immediate client-side and server-side validation feedback, indicating specific error reasons adjacent to invalid inputs. | Proposed: Must | Form validation test: submitting invalid email formats, missing required fields, or out-of-range dates highlights the specific field with clear explanatory text. |
| **NFR-USA-003** | Irreversible or high-impact actions (e.g., account deactivation, student check-out/eviction, fee adjustments, disciplinary sanctions) shall require explicit confirmation dialogs before execution. | Proposed: Must | UI workflow verification: triggering a destructive action prompts a modal requiring confirmation; canceling the modal halts the operation without mutation. |
| **NFR-USA-004** | Form controls, action buttons, and primary navigation elements shall support full keyboard navigation and accessible focus indicators compliant with WCAG 2.1 Level AA principles. | Proposed: Should | Keyboard accessibility testing: navigating complete workflows (login, leave application, ticket submission) using only Tab, Shift+Tab, and Enter/Space keys. |
| **NFR-USA-005** | Text typography and UI elements shall maintain adequate visual contrast ratios ($\ge 4.5:1$ for normal body text, $\ge 3:1$ for large text) against their backgrounds. | Proposed: Should | Automated contrast analysis using accessibility testing tools (e.g., Lighthouse Accessibility, axe-core) verifying zero critical contrast violations. |
| **NFR-USA-006** | Every asynchronous operation and data-fetching view shall provide clear visual state indicators, including loading spinners, empty state illustrations, success banners, and failure alerts. | Proposed: Must | UI state matrix review: verify that every table, list, and form exhibits appropriate loading, empty, success, and error presentations. |

---

## 9. Compatibility and Responsiveness

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-CMP-001** | The web application shall be compatible with modern, actively supported versions of major desktop web browsers: Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari. | Proposed: Must | Cross-browser automated test execution confirming consistent visual layout, form submission, and script execution across the target browsers. |
| **NFR-CMP-002** | The interface shall provide responsive layout adaptation across standard device viewports: Desktop ($\ge 1200\text{px}$), Tablet ($768\text{px} - 1199\text{px}$), and Mobile ($360\text{px} - 767\text{px}$). | Proposed: Must | Viewport testing: verifying that tables, navigation menus, and form inputs reflow appropriately without horizontal overflow or overlapping components. |
| **NFR-CMP-003** | The application shall function strictly as a responsive web application and shall not require native binary installations or mobile application store distributions for Android or iOS. | Proposed: Must | System architecture audit confirming that all functionality is delivered entirely through standard web browser interfaces. |
| **NFR-CMP-004** | The client-side application shall rely on standard web technologies (HTML5, CSS3, ECMAScript) without requiring proprietary browser extensions or legacy plugins. | Proposed: Must | Browser compliance audit verifying zero dependency on third-party plugins or deprecated web APIs. |

---

## 10. Scalability

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-SCA-001** | The infrastructure domain model shall support the horizontal addition of multiple hostels, buildings, blocks, floors, rooms, and beds under a single university without requiring database schema alterations. | Proposed: Must | Data schema validation: provisioning an additional hostel with multiple buildings and rooms via administrative interfaces without altering underlying data models. |
| **NFR-SCA-002** | The data architecture shall accommodate continuous growth in student admissions, resident records, and staff allocations over successive academic semesters without architectural redesign. | Proposed: Should | Data volume simulation: populating synthetic multi-semester records and verifying index efficiency and query response stability. |
| **NFR-SCA-003** | High-volume operational record collections (daily attendance, gate logs, visitor logs, and notifications) shall be modeled to facilitate historical partitioning or chronological indexing. | Proposed: Should | Query performance test on multi-thousand row historical log collections confirming logarithmic time complexity ($O(\log n)$) for date-filtered lookups. |

---

## 11. Maintainability

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-MNT-001** | The application codebase shall enforce a modular architecture with strict separation of concerns among presentation, business routing, domain logic, and data access layers. | Proposed: Must | Software architecture review verifying that data access logic is decoupled from user interface components and request routing controllers. |
| **NFR-MNT-002** | The codebase shall adhere to standardized naming conventions, consistent code formatting rules, and automated linting configurations. | Proposed: Must | Automated execution of code quality linters passing with zero syntax or style guideline violations. |
| **NFR-MNT-003** | All incoming network payloads shall undergo strict schema validation at application boundaries prior to processing by core business logic. | Proposed: Must | Schema validation testing: sending unexpected, malformed, or malicious JSON fields to API endpoints returns immediate HTTP 400 Bad Request. |
| **NFR-MNT-004** | The system design shall support automated testing frameworks (unit tests, integration tests) through mockable service interfaces and isolated database fixtures. | Proposed: Should | Execution of automated test suites within an isolated local test environment producing clear pass/fail status reports. |

---

## 12. Data Integrity and Consistency

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-INT-001** | The database shall enforce unique constraints on institutional identifiers, including student registration numbers, user email addresses, and employee identification numbers. | Proposed: Must | Database integrity test: attempting to insert duplicate email addresses or student registration IDs results in constraint violation rejections. |
| **NFR-INT-002** | The system shall enforce referential integrity across the infrastructure hierarchy ($\text{University} \rightarrow \text{Hostel} \rightarrow \text{Building} \rightarrow \text{Block} \rightarrow \text{Floor} \rightarrow \text{Room} \rightarrow \text{Bed}$) to prevent orphaned records. | Proposed: Must | Deletion constraint test: attempting to delete a building with active rooms or a room with active bed allocations is blocked by referential constraints. |
| **NFR-INT-003** | The system shall guarantee mutual exclusivity for bed allocations: an individual bed space shall never be allocated to more than one active student concurrently. | Proposed: Must | Concurrent allocation race condition test: simultaneous allocation requests for the same vacant bed result in exactly one success and one failure. |
| **NFR-INT-004** | Financial ledgers shall maintain consistent mathematical accounting: total assessed fees minus total credited offline payments and approved waivers shall deterministically equal current balance. | Proposed: Must | Financial ledger reconciliation script verifying zero discrepancy between ledger transactions and aggregated balance fields. |
| **NFR-INT-005** | Critical transactional operations (e.g., offline fee payment posting, check-out confirmation, attendance roster submission) shall enforce idempotency to prevent duplicate operations from rapid user clicks. | Proposed: Must | Rapid replay testing: submitting identical payment or check-out mutation requests concurrently results in a single applied transaction. |

---

## 13. Backup and Recovery

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-BCK-001** | The system design shall define a regular database backup strategy supporting daily logical snapshots and continuous transactional journaling. | Proposed: Should | Backup automation specification review and dry-run execution of database dump scripts in a staging environment. |
| **NFR-BCK-002** | Backup archives shall be encrypted during transmission and at rest, with access permissions restricted strictly to designated database administrators. | Proposed: Must | Storage configuration audit verifying that backup storage targets enforce encryption-at-rest and strict access control lists (ACLs). |
| **NFR-BCK-003** | The system documentation shall maintain a documented Disaster Recovery Runbook detailing step-by-step restoration procedures from backup archives to a clean environment. | Proposed: Should | Documented runbook review and successful test restoration of a snapshot into an empty staging database instance. |
| **NFR-BCK-004** | The system shall propose a target Recovery Point Objective (RPO) of $\le 24$ hours and a proposed Recovery Time Objective (RTO) of $\le 4$ hours for non-disaster operational recoveries. | Proposed: Could | Restoration drill benchmarking the time required to restore the application database and verify data integrity against proposed benchmarks. |

---

## 14. Auditability and Accountability

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-AUD-001** | The system shall generate an immutable audit log entry for all critical administrative actions, including account modifications, admissions, bed allocations, financial transactions, and sanctions. | Proposed: Must | Action triggering test: executing an administrative status change verifies immediate generation of a corresponding audit log record. |
| **NFR-AUD-002** | Every audit record shall capture standardized metadata: actor user ID, actor role, action performed, target entity type, target entity ID, previous value, updated value, client IP address, and UTC timestamp. | Proposed: Must | Audit log schema inspection verifying that all required contextual and provenance fields are populated completely. |
| **NFR-AUD-003** | Audit log records shall be append-only and strictly protected from modification, alteration, or deletion through user interfaces or standard application APIs. | Proposed: Must | Security penetration test: attempting `UPDATE` or `DELETE` requests against audit log endpoints results in strict authorization denial. |
| **NFR-AUD-004** | Access to audit history logs shall be restricted strictly to the University Administrator; audit interfaces and endpoints shall be inaccessible to all other roles. | Proposed: Must | Role authorization test: attempting to access audit log views as a Warden, Student, Staff, Guard, or Accountant returns HTTP 403 Forbidden. |

---

## 15. Error Handling and Logging

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-LOG-001** | The system shall present user-friendly, actionable error messages on the client interface without exposing technical runtime details, stack traces, or internal database schemas. | Proposed: Must | Fault injection testing: triggering database connection failure or unhandled exceptions displays a sanitized error message to the user. |
| **NFR-LOG-002** | The application server shall maintain structured application logs capturing system events, warnings, operational errors, and unhandled exceptions with standardized severity levels (`INFO`, `WARN`, `ERROR`, `FATAL`). | Proposed: Must | Log output inspection verifying consistent formatting, timestamping, and appropriate severity classification. |
| **NFR-LOG-003** | Logging configurations shall strictly redact or exclude sensitive parameters, including plaintext passwords, session tokens, and personal payment identifiers. | Proposed: Must | Automated grep inspection of log streams during authentication and payment entry confirming absence of sensitive data. |
| **NFR-LOG-004** | System error logs shall include contextual diagnostic metadata (correlation/request ID, route, HTTP method, user ID if authenticated, timestamp) to facilitate rapid debugging. | Proposed: Should | Simulated error triage: locating an error in log files using a unique correlation ID returned to the client in the sanitized error response. |

---

## 16. Deployment and Environment Requirements

| Requirement ID | Requirement Description | Priority | Verification Method / Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| **NFR-DEP-001** | The system architecture shall support logical environment segregation between Development, Testing/Staging, and Production environments with distinct configurations. | Proposed: Must | Configuration audit confirming separate database endpoints, credentials, and environmental flags for development and staging instances. |
| **NFR-DEP-002** | All environment-specific configurations (database connection strings, session secrets, external mail server ports) shall be stored external to source code using environment variables. | Proposed: Must | Codebase inspection confirming that configuration files load values exclusively from environment variables with safe defaults. |
| **NFR-DEP-003** | Production deployment configurations shall mandate Transport Layer Security (TLS/HTTPS) for all communications, disabling unencrypted HTTP access. | Proposed: Must | Network protocol inspection: attempting HTTP connections to the production domain redirects automatically to HTTPS with valid TLS certificates. |
| **NFR-DEP-004** | Application runtime requirements, software dependencies, and environment specifications shall be explicitly documented to ensure reproducible deployments. | Proposed: Should | Clean-machine setup test: following documentation instructions on a fresh environment builds and runs the application without undocumented steps. |

---

## 17. Constraints and Assumptions

### Confirmed Constraints
- **Academic Project Scope**: Nestora is an academic software engineering project developed for a Bachelor of Computer Applications (BCA) curriculum. It provides a comprehensive conceptual model and functional prototype rather than an active commercial university deployment.
- **Web-Only Platform**: The application is constrained to a web-based client-server architecture accessed via standard desktop and mobile web browsers; native mobile operating system builds are outside the project scope.
- **Hardware Boundary**: Physical integration with biometric hardware, turnstiles, smart cards, or RFID readers is outside current scope; workflows operate through authenticated human role inputs.
- **Excluded Features**: In accordance with [02-project-scope.md](./02-project-scope.md), third-party SMS gateways, dashboard customization widgets, dynamic dashboard date-range pickers, and direct online payment gateway integrations are explicitly excluded from the initial scope.

### Project Assumptions and Proposed Targets
- **Performance Benchmarks**: Latency targets (e.g., $\le 2.0\text{s}$ dashboard loads, $\le 500\text{ms}$ reads) and availability targets (99.0%) represent **proposed design benchmarks** to be empirically evaluated during system testing, rather than contractual production SLAs.
- **Backup and Recovery**: Recovery Point Objective (RPO $\le 24\text{h}$) and Recovery Time Objective (RTO $\le 4\text{h}$) represent proposed operational targets subject to future host infrastructure capabilities.
- **Institutional Cooperation**: It is assumed that offline fee receipts, academic eligibility verifications, and physical room condition inspections are performed conscientiously by authorized university personnel prior to system entry.

---

## 18. NFR Summary

The following summary table provides an aggregated overview of all non-functional requirements categorized by domain and priority level:

| Category | Must | Should | Could | Total Requirements |
| :--- | :---: | :---: | :---: | :---: |
| **Performance (`NFR-PER`)** | 4 | 2 | 0 | **6** |
| **Security (`NFR-SEC`)** | 8 | 0 | 0 | **8** |
| **Privacy and Data Protection (`NFR-PRI`)** | 3 | 2 | 0 | **5** |
| **Reliability and Availability (`NFR-REL`)** | 2 | 2 | 0 | **4** |
| **Usability and Accessibility (`NFR-USA`)** | 4 | 2 | 0 | **6** |
| **Compatibility and Responsiveness (`NFR-CMP`)** | 4 | 0 | 0 | **4** |
| **Scalability (`NFR-SCA`)** | 1 | 2 | 0 | **3** |
| **Maintainability (`NFR-MNT`)** | 3 | 1 | 0 | **4** |
| **Data Integrity and Consistency (`NFR-INT`)** | 5 | 0 | 0 | **5** |
| **Backup and Recovery (`NFR-BCK`)** | 1 | 2 | 1 | **4** |
| **Auditability and Accountability (`NFR-AUD`)** | 4 | 0 | 0 | **4** |
| **Error Handling and Logging (`NFR-LOG`)** | 3 | 1 | 0 | **4** |
| **Deployment and Environment (`NFR-DEP`)** | 3 | 1 | 0 | **4** |
| **Total Requirements** | **45** | **15** | **1** | **61** |
