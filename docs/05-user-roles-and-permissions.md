# Nestora — User Roles and Permissions Specification

## 1. Document Purpose
The purpose of this User Roles and Permissions Specification is to define the authoritative authorization framework, access boundaries, functional responsibilities, and data visibility rules for **Nestora — University Hostel Management System**.

In software engineering, access control and authorization specifications define how a system enforces identity-based privileges, protects sensitive records, and maintains operational integrity across multi-tenant or multi-tier institutions. For Nestora—an academic software engineering project undertaken for a Bachelor of Computer Applications (BCA) curriculum—this document provides the explicit authorization reference for both user interface development (rendering controls and views) and backend API development (enforcing security boundaries, middleware guards, and database access filters).

This document builds directly upon the operational concepts defined in [01-project-overview.md](./01-project-overview.md), the system scope in [02-project-scope.md](./02-project-scope.md), the functional behaviors in [03-functional-requirements.md](./03-functional-requirements.md), and the quality attributes in [04-non-functional-requirements.md](./04-non-functional-requirements.md).

---

## 2. Introduction
University hostel administration involves diverse stakeholder groups with varying operational duties, conflicting data requirements, and differing privacy considerations. While central university leadership requires high-level administrative governance and aggregated institutional reporting, hostel-level wardens require operational autonomy over their specific residential buildings without exposing the data of neighboring hostels. Concurrently, students require secure access to personal accommodation services, security guards require rapid gate-verification capabilities, accountants require dedicated financial ledgers, and operational staff require task-focused work queues.

To accommodate these needs securely, Nestora operates with exactly **six confirmed user roles**:
1. **University Administrator**
2. **Hostel Warden**
3. **Student**
4. **Hostel Staff**
5. **Security Guard**
6. **Accountant**

No additional roles are defined within the scope of this system.

---

## 3. Authorization Principles
All access control mechanisms in Nestora are governed by four foundational software engineering principles:

1. **Principle of Least Privilege**: Users are granted only the minimum system privileges and data access necessary to perform their defined academic or operational responsibilities.
2. **Default Deny (Fail-Safe Defaults)**: Access to any system resource, endpoint, or data record is denied by default unless an explicit permission rule or role binding grants access.
3. **Complete Mediation**: Every inbound request to a protected resource is authenticated and authorized at the backend service and data layers; client-side visual states or hidden UI elements never substitute for authoritative backend authorization checks.
4. **Multi-Tenant / Hostel-Level Data Isolation**: Data access is strictly partitioned at the hostel entity boundary. Users assigned to a specific hostel cannot inspect, query, or mutate records belonging to any other hostel.

---

## 4. User Role Overview
The following table summarizes the primary domain, institutional scope, and operational focus of each user role:

| Role Name | Domain Scope | Primary Responsibility | Data Access Boundary |
| :--- | :--- | :--- | :--- |
| **University Administrator** | University-Wide | Institutional governance, configuration, admissions, and oversight | All hostels, campus facilities, and university records |
| **Hostel Warden** | Hostel-Specific | Day-to-day hostel operations, bed allocations, approvals, and discipline | Assigned hostel(s) only |
| **Student** | Personal Resident | Accommodation requests, leave applications, complaints, and fee tracking | Personal records and assigned hostel circulars |
| **Hostel Staff** | Operational Task | Facility maintenance, repairs, housekeeping, and duty tracking | Assigned hostel and assigned work tickets |
| **Security Guard** | Gate Security | Student movement tracking, gate pass validation, and visitor logging | Assigned hostel gate checkpoints |
| **Accountant** | Financial | Fee schedule maintenance, payment recording, and balance tracking | University-wide financial records and fee ledgers |

---

## 5. Detailed Role Definitions

### 1. University Administrator
The University Administrator represents the highest operational authority within Nestora, holding comprehensive governance across all hostels under the university.

#### Core Responsibilities:
- Manage the institutional setup, configuration, and structural hierarchy across all university hostels.
- Create and manage physical infrastructure assets: hostels (Boys' and Girls' categories), buildings, blocks, floors, rooms, and individual beds.
- Manage user accounts across all six roles, including provisioning, role modification, activation, and deactivation.
- Perform the first-tier verification on student hostel registration applications.
- Issue final admission approvals following Hostel Warden verification.
- Review and approve annual and semester-wise hostel fee schedules created by Accountants.
- Review and authorize manual fee adjustments, waivers, and penalty concessions proposed by Accountants.
- Formulate and publish university-wide residential rules, policies, and circulars.
- Review escalated disciplinary appeals and exceptional leave/outing requests.
- Supervise active emergency incidents, handle unacknowledged incident escalations, and review emergency logs.
- Monitor aggregated university-wide analytics, operational reports, and immutable audit logs.

#### Boundaries and Restrictions:
- Operates with university-wide authority; access is not restricted to a single hostel.
- Must not bypass audit logging; all administrative mutations, user status alterations, and financial approvals must generate an unalterable audit trail.
- Must not approve self-created financial adjustments without secondary audit verification where applicable.

---

### 2. Hostel Warden
The Hostel Warden exercises operational authority over their assigned hostel (or designated group of hostels), managing resident welfare, facilities, safety, and discipline.

#### Core Responsibilities:
- Supervise all residential operations strictly within their assigned hostel(s).
- Conduct the second-tier verification on student registration records following administrative verification.
- Participate in final admission approval workflows for students assigned to their hostel.
- Manage room and bed allocations, room-change requests, and bed status updates.
- Oversee formal student check-in procedures and check-out clearance workflows (inventory inspection, room condition sign-off, bed release).
- Review, approve, or reject student temporary leave and daily outing requests.
- Record daily student attendance and maintain correction logs for attendance modifications.
- Review and authorize visitor entry requests before visitors are admitted through gate checkpoints.
- Review maintenance complaints, establish final complaint priorities, and assign tickets to Hostel Staff.
- Manage daily staff duties, assign maintenance zones, and record staff attendance.
- Formulate and publish supplementary hostel-specific rules and notices.
- Record student disciplinary violations, issue formal sanctions (verbal warnings, written warnings, actions), and conduct first-tier appeal reviews.
- Manage emergency incidents occurring within the assigned hostel, update severity levels, and coordinate resolution actions.
- Generate and review operational reports strictly scoped to their assigned hostel.
- Provision Student, Hostel Staff, and Security Guard accounts strictly linked to their assigned hostel.

#### Boundaries and Restrictions:
- Strictly prohibited from viewing, modifying, or querying data belonging to unassigned hostels.
- Prohibited from creating University Administrator, Warden, or Accountant accounts.
- Cannot modify university-wide policies, global configurations, or fee schedules.
- Cannot independently waive institutional fees without University Administrator authorization.

---

### 3. Student
The Student role represents an active resident or admitted applicant interacting with university accommodation facilities and services.

#### Core Responsibilities:
- Maintain personal contact and profile information, subject to administrative verification for core academic details.
- View real-time admission verification and approval status.
- Submit accommodation preferences (hostel category, room configuration, AC/Non-AC).
- Submit room-change requests detailing justifiable academic, medical, or facility reasons.
- View allocated room, block, floor, and bed details.
- Submit temporary leave applications, leave-extension requests, and daily outing requests.
- View personal attendance history, attendance percentages, and lodge attendance discrepancy reports.
- View itemized fee schedules, payment receipts, outstanding balances, and fee due reminders.
- Submit maintenance complaints with descriptions, locations, categories, and optional photo attachments.
- Confirm satisfactory complaint resolution or request ticket reopening.
- View active university-wide and hostel-specific rules and circulars.
- View personal disciplinary infractions and submit written explanations or appeals.
- Report urgent emergencies or safety incidents.
- Configure personal non-critical notification preferences (e.g., general announcements).

#### Boundaries and Restrictions:
- Prohibited from approving, extending, or verifying their own requests (leaves, admissions, room changes, complaints).
- Prohibited from viewing personal profiles, disciplinary records, attendance, or room details of other students.
- Prohibited from directly altering attendance, financial, or room allocation records.
- Prohibited from accessing emergency contact records or administrative audit trails.

---

### 4. Hostel Staff
Hostel Staff represents non-academic operational personnel (e.g., electricians, plumbers, carpenters, cleaning staff, housekeeping supervisors) assigned to facility maintenance and upkeep within a specific hostel.

#### Core Responsibilities:
- Access work-related tasks, maintenance tickets, and service orders assigned to their department or profile.
- View essential room and location details necessary to perform maintenance tasks.
- Update complaint ticket progress through standardized lifecycle statuses (`In Progress`, `Resolved`) with operational notes.
- Record daily student night attendance only when explicitly delegated and authorized by the Hostel Warden.
- View relevant student leave presence indicators strictly when necessary to perform scheduled room maintenance.
- Submit staff leave requests to the assigned Hostel Warden.
- View daily shift allocations, work duties, and individual duty completion records.
- Report facility breakdowns, safety hazards, and emergencies to the Hostel Warden.

#### Boundaries and Restrictions:
- Prohibited from viewing student academic details, disciplinary files, fee records, or guardian contact details.
- Prohibited from approving admissions, bed allocations, leave passes, or visitor entries.
- Prohibited from creating, modifying, or deactivating user accounts.
- Restricted strictly to their assigned hostel and work responsibilities.

---

### 5. Security Guard
The Security Guard represents campus gatekeeping personnel stationed at hostel or campus entry and exit gates, responsible for physical movement validation and perimeter security.

#### Core Responsibilities:
- Verify student identity and credentials at security checkpoints.
- Verify digital gate passes for approved student leaves and daily outings.
- Log actual gate departure and arrival timestamps for students in real time.
- Identify and log student late returns or overstayed outings.
- Register visiting individuals at gate checkpoints (capturing name, contact number, government ID, resident visited, and purpose).
- Verify Warden digital authorization prior to allowing visitor entry.
- Log visitor check-in and check-out timestamps at gate checkpoints.
- Access limited student identification information (name, photograph, room number, approved leave status) strictly necessary for gate verification.
- Access authorized emergency contacts strictly during active safety incidents under administrative supervision.
- Report security breaches, perimeter incidents, and emergencies.

#### Boundaries and Restrictions:
- Strictly prohibited from approving or extending student leaves, outings, or visitor requests.
- Prohibited from altering student admission, attendance, fee, or accommodation allocation records.
- Prohibited from accessing academic records, financial ledgers, or disciplinary files.
- Prohibited from managing user accounts or configuring administrative settings.
- Access is restricted strictly to gate operations of the assigned hostel.

---

### 6. Accountant
The Accountant represents the dedicated financial officer responsible for student fee ledgers, payment recording, and accommodation revenue tracking.

#### Core Responsibilities:
- Maintain annual and semester-wise hostel fee schedules linked to room configurations.
- Submit newly created or updated fee structures to the University Administrator for formal authorization.
- Record external and offline fee payments (e.g., bank drafts, challans, NEFT/RTGS transfers) against student accounts.
- Track student fee payment statuses, credit balances, and outstanding dues.
- Monitor late-fee surcharges computed according to approved institutional policies.
- Propose manual fee adjustments, waivers, or penalty concessions with formal justifications.
- Submit fee adjustment proposals to the University Administrator for mandatory approval.
- Issue automated and manual fee payment reminders to students with overdue balances.
- Generate monthly, semester, and annual financial summary reports categorized by hostel and fee item.
- Provide itemized fee statements and official payment receipts to students.
- Access financial ledgers across all university hostels strictly within financial responsibilities.

#### Boundaries and Restrictions:
- Prohibited from independently activating fee schedules without University Administrator authorization.
- Prohibited from unilaterally applying proposed fee waivers or balance adjustments without University Administrator sign-off.
- Prohibited from accessing student academic records, disciplinary files, medical incident notes, or room allocation tools.
- Prohibited from managing user accounts, student leaves, or gate operations.

---

## 6. Role-Based Permission Matrix

The following matrix defines the access permissions for all six user roles across the 19 system modules. 

### Permission Labels:
- **Full**: Comprehensive administrative control (Create, Read, Update, Delete, Configure).
- **Manage**: Operational authority to create or update permitted records within assigned responsibilities.
- **Approve**: Authority to formally approve, reject, or authorize workflow requests.
- **View**: Read-only inspection access.
- **Own**: Access restricted strictly to records belonging to the authenticated user.
- **Limited**: Access constrained to specific fields or operational subsets necessary for a task.
- **None**: No access granted (HTTP 403 Forbidden).

| Module / Capability Area | University Administrator | Hostel Warden | Student | Hostel Staff | Security Guard | Accountant |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **01. Authentication & Account Management** | **Full** | **Manage** *(Note 1)* | **Own** *(Note 2)* | **Own** | **Own** | **Own** |
| **02. Student Admission & Registration** | **Full / Approve** | **Manage / Approve** | **Own / Limited** | **None** | **None** | **View** *(Note 3)* |
| **03. Hostel Infrastructure Management** | **Full** | **Manage / Limited** | **View** *(Note 4)* | **Limited** | **Limited** | **View** |
| **04. Room and Bed Allocation** | **Full / Approve** | **Manage / Approve** | **Own / Limited** | **None** | **None** | **View** |
| **05. Student Check-in and Check-out** | **Full** | **Manage / Approve** | **Own / Limited** | **Limited** | **Limited** | **Limited** *(Note 5)* |
| **06. Leave and Late Return** | **View / Approve** *(Note 6)* | **Approve / Manage** | **Own / Limited** | **Limited** | **Limited / Manage** | **None** |
| **07. Student Attendance** | **View** | **Manage / Approve** | **Own / View** | **Manage / Limited** *(Note 7)* | **None** | **None** |
| **08. Student Movement and Outings** | **View / Approve** *(Note 6)* | **Approve / Manage** | **Own / Limited** | **None** | **Limited / Manage** | **None** |
| **09. Visitor Management** | **View** | **Approve / Manage** | **Own / View** | **None** | **Manage / Limited** | **None** |
| **10. Complaints and Maintenance** | **View** | **Manage / Approve** | **Own / Manage** | **Manage / Limited** | **None** | **None** |
| **11. Fees and Financial Management** | **Full / Approve** | **View / Limited** | **Own / View** | **None** | **None** | **Manage / Full** *(Note 8)* |
| **12. Notices and Announcements** | **Full / Manage** | **Manage** | **View / Own** | **View / Own** | **View / Own** | **View / Own** |
| **13. Staff Management** | **Full** | **Manage / Approve** | **None** | **Own / Limited** | **Own / Limited** | **None** |
| **14. Rules and Discipline** | **Full / Approve** | **Manage / Approve** | **View / Own** | **None** | **None** | **None** |
| **15. Emergency & Incident Management** | **Full / Approve** | **Manage / Approve** | **Limited / Manage** | **Limited / Manage** | **Limited / Manage** | **Limited / Manage** |
| **16. Notifications** | **Full** | **Manage** | **Own / Limited** | **Own / Limited** | **Own / Limited** | **Own / Limited** |
| **17. Role-Specific Dashboards** | **Full** | **Manage** | **Own** | **Own** | **Own** | **Own** |
| **18. Reports & Administrative Monitoring** | **Full** | **Manage / View** | **None** | **Limited / View** | **Limited / View** | **Manage / View** |
| **19. Audit History** | **Full / View** | **None** *(Note 9)* | **None** | **None** | **None** | **None** |

### Matrix Clarification Notes:
1. **Note 1 (Warden Account Management)**: Wardens can only provision and manage accounts for Students, Hostel Staff, and Security Guards strictly within their assigned hostel(s).
2. **Note 2 (Student Profile Management)**: Students can view their profile and update non-critical contact info; core academic identity changes require administrative confirmation.
3. **Note 3 (Accountant Admission Access)**: Accountants have read-only access to approved student lists to assess fees and create student ledgers.
4. **Note 4 (Student Infrastructure Access)**: Students can view room and bed layouts only to the extent needed to submit preferences and view their own assigned bed.
5. **Note 5 (Accountant Check-Out Access)**: Accountants access check-out records strictly to verify and sign off on financial dues clearance.
6. **Note 6 (Administrator Leave/Outing Approval)**: The Administrator approves exceptional outings (e.g., campus lockdowns, non-routine leaves) and monitors overall leave patterns.
7. **Note 7 (Staff Attendance Recording)**: Hostel Staff can enter daily night attendance only when explicitly delegated operational authority by the Hostel Warden.
8. **Note 8 (Accountant Financial Authority)**: Accountants can create fee structures and propose adjustments, but cannot unilaterally activate schedules or apply waivers without Administrator approval.
9. **Note 9 (Audit Log Centralization)**: System-wide audit history is centralized at the University Administrator level to maintain objective, independent oversight.

---

## 7. Hostel-Level Data Access Rules

Data boundaries in Nestora are strictly enforced according to institutional jurisdiction:

| User Role | Authorized Data Boundary | Cross-Hostel Access Policy |
| :--- | :--- | :--- |
| **University Administrator** | All hostels, university-wide assets, and all resident records | Full institutional visibility across all campus facilities. |
| **Hostel Warden** | Assigned hostel(s) only | Strictly prohibited. Requests for data of unassigned hostels are rejected with HTTP 403 Forbidden. |
| **Student** | Own private records and assigned hostel circulars | Strictly prohibited. Attempting to access records of other students returns HTTP 403 or 404. |
| **Hostel Staff** | Assigned hostel and assigned work tickets | Strictly prohibited. Staff can view only tasks and rooms within their assigned hostel. |
| **Security Guard** | Assigned hostel gate checkpoints | Strictly prohibited. Guards access movement data only for their assigned hostel gate. |
| **Accountant** | University-wide financial records and student ledgers | Access is permitted university-wide, but strictly constrained to financial data models. |

### Technical Enforcement Rules:
- **URL / Parameter Tampering Defense**: A user cannot gain access to another hostel or another user's record by manipulating route parameters (e.g., `GET /api/hostels/2/residents` when assigned to Hostel 1). The backend authorization middleware validates the requested `hostel_id` against the authenticated user's session claims.
- **Backend-Layer Isolation**: All database queries executed on behalf of Wardens, Staff, and Guards automatically inject the authenticated user's assigned `hostel_id` into the query filter, guaranteeing that unassigned records are never retrieved from the database.
- **Emergency Contact Segregation**: Emergency contact numbers and guardian phone numbers are stored in protected fields accessible only by the Administrator and the assigned Warden, hidden from general API serialization.
- **Audit Logging of Cross-Tenant Probing**: Any detected attempt to query resources outside a user's authorized hostel boundary generates an immediate security audit warning.

---

## 8. Account Creation and Management Permissions

Nestora implements a **hybrid account creation policy** balancing central governance with local operational agility:

| Target Account Role | Creator Role | Scope & Constraints |
| :--- | :--- | :--- |
| **University Administrator** | University Administrator | Provisioned exclusively by existing University Administrators. |
| **Hostel Warden** | University Administrator | Provisioned exclusively by University Administrators and mapped to specific hostel(s). |
| **Accountant** | University Administrator | Provisioned exclusively by University Administrators. |
| **Hostel Staff** | University Administrator or Hostel Warden | Wardens can provision staff strictly within their assigned hostel; Administrators can provision for any hostel. |
| **Security Guard** | University Administrator or Hostel Warden | Wardens can provision guards strictly for their assigned hostel gate; Administrators can provision for any hostel. |
| **Student** | University Administrator or Hostel Warden | Provisioned via manual registration workflow; requires two-tier verification before admission. |

### Lifecycle and Security Policies:
- **Auditability**: All account creations, role assignments, profile edits, account deactivations, and reactivations must record the acting user's ID, affected account ID, and timestamp in the audit log.
- **Activation Notifications**: When an account is created, the system dispatches an automated notification email containing secure activation instructions. Low-level token encryption and activation protocols are defined in authentication implementation specifications.
- **Deactivation Authority**: Only the University Administrator can deactivate Administrator or Accountant accounts. Wardens can deactivate Staff, Guard, or Student accounts within their assigned hostel. Deactivating an account immediately revokes all active session tokens.

---

## 9. Sensitive Data Access Restrictions

To uphold student privacy, regulatory standards, and institutional confidentiality, access to sensitive data domains is strictly restricted:

```
[Personal / Demographic Data] ──> Accessible to: Student (Own), Warden (Assigned Hostel), Admin
[Guardian & Emergency Contacts] ──> Accessible to: Warden (Assigned Hostel), Admin (ONLY during inquiries/emergencies)
[Financial Ledgers & Balances]  ──> Accessible to: Accountant, Admin, Student (Own Statements ONLY)
[Disciplinary Files & Appeals]  ──> Accessible to: Warden (Assigned Hostel), Admin, Student (Own File ONLY)
[System Audit Logs]             ──> Accessible to: University Administrator ONLY
```

### Access Guidelines:
1. **Student Private Data**: Resident students can inspect only their own data. Personal information, disciplinary history, and leave destinations of peers are inaccessible.
2. **Guardian and Emergency Contacts**: Emergency contact details are accessible strictly to the University Administrator and the assigned Hostel Warden. Staff and Security Guards cannot access emergency numbers except when explicitly authorized during an active Critical incident.
3. **Disciplinary and Incident Records**: Infractions, witness statements, and disciplinary sanctions are treated as confidential. They are hidden from Hostel Staff, Security Guards, Accountants, and other residents.
4. **Financial Ledgers**: Comprehensive billing and payment ledgers are accessible only to Accountants and Administrators. Students can view only their personal billing statement.
5. **System Audit Trail**: Access to audit logs is granted exclusively to the University Administrator to prevent operational personnel from inspecting administrative investigations.

---

## 10. Approval and Authorization Workflows

To prevent unilateral errors and maintain dual-party accountability, core business operations require multi-role approval gates:

### 1. Student Admission Workflow
$$\text{Registration Draft} \xrightarrow{\text{Admin Verify (Tier 1)}} \text{Admin Verified} \xrightarrow{\text{Warden Verify (Tier 2)}} \text{Warden Verified} \xrightarrow{\text{Sequential Sign-off}} \mathbf{Fully\ Approved}$$
- **Tier 1**: University Administrator verifies institutional eligibility and academic registration.
- **Tier 2**: Assigned Hostel Warden verifies hostel capacity, room suitability, and local prerequisites.
- **Final Approval**: Requires both positive verifications. Neither actor can bypass the other.

### 2. Room and Bed Allocation Workflow
- Students submit accommodation preferences (Room configuration, AC/Non-AC).
- Final bed allocation is executed by the Hostel Warden (for assigned hostels) or University Administrator.
- Students cannot allocate their own beds or select specific bed numbers directly.

### 3. Leave and Outing Approval Workflow
- Resident student submits leave/outing request.
- Assigned Hostel Warden reviews and approves/rejects routine leaves and outings.
- Exceptional outings (e.g., during campus lockdowns or non-standard hours) are escalated to the University Administrator for final authorization.

### 4. Visitor Entry Workflow
- Security Guard registers visitor credentials at the gate checkpoint.
- Assigned Hostel Warden reviews visitor details and issues digital pre-approval.
- Security Guard verifies approval and logs physical entry and exit timestamps.

### 5. Financial Schedule and Adjustment Workflow
- Accountant creates fee structures $\rightarrow$ University Administrator authorizes activation.
- Accountant proposes manual late-fee waivers or adjustments $\rightarrow$ University Administrator reviews and approves before student ledger balances are altered.

### 6. Disciplinary Enforcement and Appeal Workflow
- Hostel Warden logs infraction and issues sanction.
- Student submits appeal $\rightarrow$ Hostel Warden conducts first-tier review.
- Contested or severe disciplinary sanctions are escalated to the University Administrator for final binding determination.

### 7. Emergency Incident Lifecycle Workflow
- Any authenticated user reports an emergency with an initial severity rating.
- Assigned Hostel Warden reviews on-site conditions, updates severity, and initiates local response.
- Unacknowledged incidents auto-escalate to the University Administrator after a configurable timeout.
- Final incident resolution and closure is restricted exclusively to the Hostel Warden and University Administrator.

---

## 11. Restricted Operations
The following table outlines explicitly prohibited operations for each user role to prevent privilege escalation:

| User Role | Explicitly Prohibited Operations |
| :--- | :--- |
| **University Administrator** | Cannot bypass audit logging; cannot execute self-approvals for personal administrative waivers; cannot operate without authenticated credentials. |
| **Hostel Warden** | Cannot access, view, or manage unassigned hostels; cannot provision Administrator, Warden, or Accountant accounts; cannot modify university-wide fee structures or policies. |
| **Student** | Cannot approve own applications or requests; cannot modify attendance or room allocation records; cannot view peer records; cannot access emergency contacts or audit logs. |
| **Hostel Staff** | Cannot approve admissions, room allocations, leaves, or visitor entries; cannot view financial or disciplinary records; cannot provision user accounts. |
| **Security Guard** | Cannot approve or extend student leaves or outings; cannot approve visitor requests; cannot modify student admissions, attendance, or fees; cannot access disciplinary files. |
| **Accountant** | Cannot unilaterally activate fee schedules or apply fee waivers without Administrator approval; cannot manage room allocations, attendance, or security operations. |

---

## 12. Audit and Accountability Requirements
To guarantee accountability across all six roles, the system enforces the following audit standards:

1. **Traceable Identity**: Every sensitive administrative, financial, operational, and security mutation records the acting user's ID, role, client IP address, and UTC timestamp.
2. **Immutable Storage**: Audit log records are stored in append-only data stores with no update or delete operations exposed via APIs or administrative user interfaces.
3. **Mandatory Audit Scope**: The following actions must generate audit log entries:
   - Account provisioning, role changes, activation, and deactivation.
   - Tier-1 and Tier-2 admission verifications and final approvals.
   - Bed allocations, reallocations, and deallocations.
   - Manual fee adjustments, penalty waivers, and offline payment postings.
   - Attendance record corrections and justification remarks.
   - Disciplinary sanction issuances and appeal outcomes.
   - Emergency contact lookups and incident resolution closures.
4. **Access Isolation**: Audit trail logs are accessible exclusively to the University Administrator.

---

## 13. Permission Enforcement Guidelines

The following authorization rules represent mandatory architectural constraints across all Nestora modules:

| Rule ID | Title | Architectural Enforcement Rule |
| :--- | :--- | :--- |
| **AUTH-001** | Strict Least Privilege | Every user role shall be granted only the minimum API endpoints, UI controls, and database permissions required for their documented responsibilities. |
| **AUTH-002** | Default Deny Gate | If a requested route, endpoint, or resource lacks an explicit permission binding for the authenticated role, the request shall be denied immediately with HTTP 403 Forbidden. |
| **AUTH-003** | Authoritative Backend Mediation | All authorization boundaries and permission checks shall be enforced by backend middleware and service-layer logic; UI visual state (e.g., hiding buttons) shall never be considered security enforcement. |
| **AUTH-004** | Hostel-Level Tenant Isolation | Backend services shall enforce hostel-level data scoping on every query; Wardens, Staff, and Guards shall be prevented from querying or mutating records of unassigned hostels. |
| **AUTH-005** | Prohibition of Self-Approval | The system shall reject any workflow approval transaction where the target applicant or beneficiary matches the authenticated approver's user ID. |
| **AUTH-006** | Separation of Financial Duties | Accountants may propose fee schedules and adjustments, but activation and ledger balance alterations shall require independent University Administrator approval. |
| **AUTH-007** | Dual-Tier Admission Gate | Final student admission approval shall be blocked at the database level until both University Administrator and Hostel Warden approval flags are recorded. |
| **AUTH-008** | Sensitive Contact Concealment | Student emergency contact numbers and guardian phone numbers shall be excluded from standard API responses and exposed only on authorized emergency interfaces. |
| **AUTH-009** | Immutable Audit Generation | Any endpoint mutating user status, bed allocations, financial ledgers, or disciplinary files shall synchronously emit a structured audit log entry. |
| **AUTH-010** | Uniform UI/Backend Permission Parity | The frontend UI shall dynamically render only the navigation links, dashboards, and action controls corresponding to the authenticated user's verified permissions. |
| **AUTH-011** | Gate Authority Demarcation | Security Guards shall be granted endpoints strictly to verify approved passes and log gate timestamps; leave or visitor approval endpoints shall reject Guard credentials. |
| **AUTH-012** | Controlled Account Provisioning | Only University Administrators may provision administrative and financial roles; Wardens may provision operational roles strictly within their assigned hostel. |

---

## 14. Open Decisions and Assumptions

The following operational policies remain open for institutional clarification during detailed design:

1. **Warden Multi-Hostel Assignment**:
   - *Current Assumption*: The architecture supports a Warden managing one or more assigned hostels via an array of assigned hostel IDs (`assigned_hostels: [hostel_id]`).
   - *Open Decision*: Whether institutional policy restricts Wardens to a strict 1:1 hostel mapping or allows multi-hostel oversight.
2. **Extended Leave Escalation Threshold**:
   - *Current Assumption*: Routine student leaves are approved by the Hostel Warden; exceptional leaves (e.g., exceeding 7 consecutive days) require University Administrator review.
   - *Open Decision*: Finalization of the exact calendar-day threshold for administrative leave escalation.
3. **Fee Structure Uniformity vs. Differential**:
   - *Current Assumption*: The Accountant defines fee structures linked to room types (Single, Double, Triple; AC vs. Non-AC).
   - *Open Decision*: Whether fee structures are globally standardized university-wide or permit hostel-specific fee variations based on individual hostel amenities.
4. **Delegated Attendance Authority**:
   - *Current Assumption*: Wardens hold primary attendance authority, with capability to delegate daily roll-call logging to authorized Hostel Staff.
   - *Open Decision*: Whether staff-entered attendance requires mandatory Warden sign-off before becoming official.

---

## 15. Summary
Nestora establishes a comprehensive, role-governed authorization framework tailored to university hostel administration. By defining six specialized roles (University Administrator, Hostel Warden, Student, Hostel Staff, Security Guard, and Accountant), the platform enforces:

- **Institutional Governance**: Centralized configuration, admission oversight, and financial control for university leadership.
- **Operational Autonomy**: Localized management of rooms, leaves, complaints, and discipline for hostel wardens without cross-hostel data leakage.
- **Student Privacy & Self-Service**: Protected access to accommodation requests, personal fee statements, and maintenance ticketing.
- **Separation of Duties**: Multi-party checks for admissions, fee waivers, room allocations, and emergency incident closures.
- **Auditable Operations**: Complete, tamper-proof logging of critical administrative, financial, and security actions.
