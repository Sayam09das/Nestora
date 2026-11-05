# Nestora — Project Scope Specification

## 1. Scope Introduction
The purpose of defining the project scope is to establish the clear functional, structural, and administrative boundaries of **Nestora — University Hostel Management System**. 

In software engineering, a well-defined project scope provides a shared understanding of what the system will deliver, establishes baseline expectations for development, and prevents scope creep. For Nestora—an academic software engineering project undertaken for a Bachelor of Computer Applications (BCA) curriculum—defining the scope ensures that the proposed solution remains focused, technically feasible, and rigorously aligned with university administrative requirements.

All functional areas, user boundaries, and organizational tiers detailed in this document represent planned capabilities and structural models designed to address the challenges identified in [01-project-overview.md](file:///Users/sayamdas/Documents/Programming/Mern%20Stack/My%20Website/Nestora/docs/01-project-overview.md).

---

## 2. In-Scope Features

The proposed system capabilities for Nestora are organized into 18 functional areas. Each area represents a planned operational domain of the application:

### 1. User and Account Management
- Creation, updating, activation, and deactivation of user accounts across all system roles.
- Maintenance of user profiles, role assignments, contact details, and account status indicators.
- Account lifecycle tracking from onboarding to offboarding.

### 2. Authentication and Authorization
- Secure user authentication mechanisms verifying user identity upon login.
- Implementation of Role-Based Access Control (RBAC) ensuring users access only system routes, resources, and interfaces permitted by their role.
- Session management and enforcement of security boundaries between user groups.

### 3. Student Admission and Registration
- Digital capture of student demographic data, academic registration details, guardian contact numbers, and emergency contacts.
- Verification workflows for verifying student eligibility for hostel accommodation.
- Maintenance of comprehensive student resident master records.

### 4. Hostel Infrastructure Management
- Configuration and mapping of university accommodation physical hierarchy: Hostels, Buildings, Blocks, Floors, Rooms, and Beds.
- Categorization of hostels into Boys' Hostel and Girls' Hostel facilities.
- Maintenance of room properties, including room types, intended capacities, and infrastructure status.

### 5. Room and Bed Allocation
- Systematic assignment of students to specific, individually numbered beds within rooms.
- Real-time tracking of bed occupancy, vacancies, and capacity utilization.
- Management of inter-room and inter-bed transfer requests and bed deallocation upon student departure.

### 6. Student Check-In and Check-Out
- Formal onboarding workflows capturing student arrival, room condition verification, and key issuance.
- Structured departure and vacating procedures, including room inspection, inventory return, and dues clearance verification.

### 7. Temporary Leave and Outing Management
- Digital submission of day outing and overnight leave applications by resident students.
- Multi-step review, approval, or rejection workflows handled by Hostel Wardens.
- Generation of digital gate passes containing student details, leave duration, and approval status.

### 8. Student Attendance and Movement Tracking
- Daily roll-call or attendance recording to monitor resident presence.
- Curfew compliance tracking to identify unauthorized absences or late returns.
- Gate-level movement recording capturing timestamps when students leave and re-enter hostel premises.

### 9. Visitor Management
- Digital logging of visitor details, including name, contact number, government identification, and relationship to the resident.
- Association of visitors with specific resident students and recording purpose of visit.
- Check-in and check-out timestamp tracking managed by Security Guards at gate checkpoints.

### 10. Hostel Fee and Financial Management
- Definition and recording of hostel fee structures and charges.
- Manual logging and tracking of fee payments, payment dates, and payment methods.
- Monitoring student payment statuses, outstanding balances, and generation of payment receipts and fee summaries.

### 11. Complaints and Maintenance Management
- Student grievance ticketing portal for logging maintenance issues (e.g., electrical, plumbing, carpentry, cleaning).
- Assignment of maintenance tickets to designated Hostel Staff with priority classification.
- Status tracking from ticket creation, in-progress resolution, through to completion and closure.

### 12. Notices and Announcements
- Creation and publication of official circulars, policy notifications, and emergency advisories.
- Scoped publication options: university-wide notices or hostel-specific circulars.
- Categorization of notices with publication and expiration dates.

### 13. Staff Management
- Profile management for non-student operational personnel (Hostel Staff and Security Guards).
- Assignment of operational staff to specific hostels, departments, and functional duties.
- Tracking active duty status and work assignments.

### 14. Hostel Rules and Disciplinary Management
- Digital repository of official university and hostel codes of conduct.
- Recording and tracking student disciplinary infractions, rule violations, and incident reports.
- Maintenance of student disciplinary records, warnings issued, and punitive actions taken.

### 15. Emergency and Incident Management
- Rapid logging of urgent safety, security, or medical incidents within hostel premises.
- Recording immediate actions taken, personnel involved, and resolution notes.
- Dissemination of emergency notifications to relevant authorities and stakeholders.

### 16. Notification Management
- Generation and delivery of automated system notifications (in-app alerts and status updates).
- Alerting users to critical events, such as leave request decisions, complaint status updates, payment dues, and urgent notices.

### 17. Role-Specific Dashboards
- Tailored default landing dashboards for each of the six user roles.
- Role-pertinent metrics, key statistics, pending operational tasks, and recent activity feeds displayed upon login.

### 18. Reports and Administrative Monitoring
- Compilation of administrative reports covering occupancy statistics, fee collection status, attendance records, gate logs, and maintenance ticket turnaround.
- Aggregated university-level analytical views for central administration alongside operational reports for individual hostels.

### 19. Relationship Between Functional Capability Areas and Implementation Modules
To maintain clarity between high-level project scoping and technical system development:
- **18 Functional Areas in Project Scope**: Section 2 defines the project's scope across 18 user-facing functional capability areas reflecting the operational lifecycle of university hostel administration from an institutional perspective (where User Management and Authentication are scoped collaboratively, and Attendance and Movement are framed together).
- **19 Requirement Catalogues (`FR-01` to `FR-19`)**: In [03-functional-requirements.md](docs/03-functional-requirements.md) and [05-user-roles-and-permissions.md](docs/05-user-roles-and-permissions.md), these capability areas are formally structured into 19 discrete requirement catalogues by isolating **Audit History** as an independent institutional compliance catalogue (`FR-19`) and separating Student Attendance (`FR-07`) from Gate Movement (`FR-08`).
- **19 Implementation Modules (`MOD-01` to `MOD-19`)**: In [06-system-architecture.md](docs/06-system-architecture.md), [07-database-design.md](docs/07-database-design.md), and [08-module-development-plan.md](docs/08-module-development-plan.md), the application is engineered into 19 modular packages. The technical development sequence prioritizes foundational infrastructure (`MOD-02`), audit logging (`MOD-03`), and notification dispatching (`MOD-07`) in early milestones to satisfy architectural dependencies of downstream operational modules.
- **Traceability Guarantee**: A comprehensive cross-reference mapping between the 19 functional requirement groups (`FR-01` to `FR-19`, covering all 144 requirements `FR-001` through `FR-144`) and the 19 implementation modules (`MOD-01` to `MOD-19`) is codified in Section 3.1 of [08-module-development-plan.md](docs/08-module-development-plan.md).

---

## 3. User Scope

Nestora establishes strict operational boundaries across six confirmed user roles. Each role is designed around specific responsibilities and data access constraints:

| User Role | Operational Scope | Access Boundaries & Key Responsibilities |
| :--- | :--- | :--- |
| **University Administrator** | Full university-wide control | Possesses complete administrative authority across the entire university platform. Can configure university-level settings, register hostels, manage wardens and accountants, view cross-hostel aggregate analytics, publish university-wide notices, and oversee all system operations. |
| **Hostel Warden** | Full operational control over assigned hostel | Authorized to manage day-to-day operations strictly within their assigned hostel(s). Responsibilities include bed allocations, reviewing leave and outing requests, managing disciplinary issues, monitoring hostel attendance, assigning complaints, and viewing hostel-specific reports. Cannot access or modify data of unassigned hostels. |
| **Student** | Access to personal records and permitted student services | Resident user whose access is restricted to their personal profile, assigned room/bed information, leave application history, maintenance ticket logging, fee status, and general hostel circulars/rules. Cannot view data of other students or access administrative modules. |
| **Hostel Staff** | Operational access limited to assigned responsibilities | Operational support personnel (e.g., maintenance technicians, housekeeping) whose access is restricted to maintenance tickets, service requests, and operational tasks assigned to them within their designated hostel. Cannot access student academic, disciplinary, or financial records. |
| **Security Guard** | Security-focused gate operational access | Gate personnel whose access is restricted to verifying student gate passes, logging entry and exit timestamps, recording visitor information, and viewing emergency notices. Cannot access academic, fee, or administrative configuration modules. |
| **Accountant** | Full financial access within financial responsibilities | Dedicated financial role authorized to record fee structures, log payments, track outstanding balances, view payment histories, and generate financial reports. Does not have access to disciplinary or confidential student welfare records. |

---

## 4. Organizational Scope

Nestora models the physical and administrative structure of university housing using a standardized seven-tier hierarchy:

$$\text{University} \longrightarrow \text{Hostel} \longrightarrow \text{Building} \longrightarrow \text{Block} \longrightarrow \text{Floor} \longrightarrow \text{Room} \longrightarrow \text{Bed}$$

### Hierarchy Breakdown:
1. **University**: The top-level administrative entity governing all campus facilities, policies, and personnel.
2. **Hostel**: A major residential unit operating under the university, categorized by gender:
   - **Boys' Hostel**
   - **Girls' Hostel**
3. **Building**: A distinct physical architectural structure within a hostel compound.
4. **Block**: A specific wing, section, or division within a building (e.g., North Block, Block A).
5. **Floor**: A specific horizontal level within a block.
6. **Room**: An individual residential living space on a floor, characterized by a room number, room type, and bed capacity.
7. **Bed**: The granular allocation unit representing an individual numbered bed assigned to a single resident student.

### Architectural Rules:
- The system supports **multiple hostels** under a single university.
- **Hostel-level access isolation** is enforced at the data and interface level: operational staff (Wardens, Hostel Staff) interact exclusively with the structural nodes and data belonging to their assigned hostel.
- Structural configurations are modular and dynamic; room counts, bed counts, and building counts mentioned in design examples are illustrative and do not represent hardcoded capacity limits.

---

## 5. Data Access Scope

Data access in Nestora is governed by the principle of least privilege and strict data isolation boundaries:

- **University-Wide Visibility (University Administrator)**:
  The University Administrator has institutional visibility across all hostels, including global occupancy rates, aggregate financial reports, university-wide staff directories, and system-wide audit logs.
- **Assigned-Hostel Visibility (Hostel Warden)**:
  Hostel Wardens are restricted to viewing and managing data pertaining exclusively to their assigned hostel(s). They cannot inspect student records, room allocations, leave applications, or complaints of unassigned hostels.
- **Responsibility-Based Access (Hostel Staff & Security Guard)**:
  - **Hostel Staff** can view only maintenance complaint tickets assigned to their department or individual profile, alongside basic location details (e.g., Room 204, Floor 2) required to perform repairs.
  - **Security Guards** can view only movement-relevant data: student names, photos, approved gate pass validity windows, and visitor log entries.
- **Personal-Data Access (Student)**:
  Students can access only their own individual data (personal profile, assigned bed, submitted leave applications, registered complaints, and fee dues). Personal details, leave destinations, and disciplinary histories of other residents are strictly inaccessible.
- **Financial Responsibility-Based Access (Accountant)**:
  Accountants have read and write access to fee records, payment transactions, and student financial ledgers across the university or assigned hostels, but are restricted from accessing unrelated records such as medical incident notes or confidential disciplinary hearings.
- **Restrictions on Sensitive Information**:
  Student disciplinary records, incident investigations, and emergency contact details are treated as confidential. Access is limited strictly to authorized roles (University Administrator and the respective Hostel Warden).

---

## 6. Out-of-Scope Features

To maintain clarity and project feasibility within the academic timeframe, the following capabilities have been explicitly excluded from the initial scope:

1. **SMS Notifications**: Integration with third-party SMS gateways for sending mobile text alerts is excluded from the initial scope. Notifications will be handled via in-app alerts and notifications.
2. **Dashboard Customization**: End-user configuration of dashboard layouts, drag-and-drop widget customization, and user-defined metric cards are excluded. Standardized, role-specific dashboard views will be provided.
3. **Dashboard Date-Range Filters**: Dynamic date-range pickers and ad-hoc temporal filtering on role dashboards are excluded from the initial release; dashboards will display predefined operational periods and current-state metrics.
4. **Online Payment Gateway Integration**: Direct third-party payment gateway integration (e.g., credit/debit card processing, net banking APIs, UPI interfaces) is excluded from the initial scope. Fee management will support recording, verifying, and tracking manual and offline fee payments and receipts.

> [!NOTE]
> Features and workflows that have not been explicitly decided or confirmed are classified as **pending clarification** rather than assumed to be out of scope.

---

## 7. Project Constraints and Assumptions

### Confirmed Decisions
- The six defined user roles and their operational boundaries are locked.
- The 7-tier organizational hierarchy ($\text{University} \rightarrow \text{Bed}$) forms the structural model.
- Hostels are categorized into Boys' and Girls' facilities.
- Hostel-level data isolation is mandatory for operational roles.
- The 18 functional areas defined in Section 2 constitute the planned functional baseline.
- The four explicit feature exclusions defined in Section 6 represent confirmed scope boundaries.

### Project Assumptions
- **Academic Context**: Nestora is an academic software engineering project for a BCA program. It models institutional processes conceptually and is not deployed in an active production university environment.
- **Web-Based Accessibility**: The system is assumed to operate as a responsive web application accessed through modern standard web browsers.
- **Institutional Administrative Cooperation**: The system assumes standard university administrative workflows where offline fees and official physical documents are validated by authorized staff prior to system record updates.
- **Controlled User Provisioning**: Initial user accounts (Administrators, Wardens, Accountants) are assumed to be provisioned through administrative workflows rather than open public self-registration.

### Unresolved Decisions (Pending Clarification)
The following decisions remain unresolved and are subject to clarification during subsequent design phases:
- **Warden-to-Hostel Relationship**: Whether a Hostel Warden can be assigned to multiple hostels simultaneously or is strictly limited to a single hostel.
- **Leave Escalation Hierarchy**: Whether certain categories of leaves (e.g., extended leaves exceeding a specific duration) require secondary escalation to the University Administrator or external guardian consent workflows.
- **Fee Structure Uniformity**: Whether fee structures are globally standardized at the university level or can vary based on individual hostel amenities and room specifications.
- **Attendance Workflow Ownership**: The operational division of daily attendance logging between Hostel Wardens, designated floor staff, or Security Guards during evening curfew checkpoints.

### Implementation Separation
- Specific authentication protocols, token/session management implementations, and password hashing algorithms will be formalized in the dedicated authentication phase.
- Software architecture diagrams, database schemas, and API endpoint designs are documented in separate technical specifications.
- As the project advances through design and prototyping, scope adjustments will be recorded through updates to this specification.

---

## 8. Scope Summary

Nestora is scoped as an integrated, multi-tier web application designed to digitize and unify university hostel operations. Its scope encompasses:

- **18 Planned Functional Capability Areas (Mapped to 19 Implementation Modules)** covering the complete resident lifecycle—from student registration, bed allocation, and daily movement tracking to fee recording, maintenance resolution, incident reporting, and autonomous audit logging.
- **6 Distinct User Roles** operating within clearly defined privilege boundaries that enforce least-privilege data access and maintain student privacy.
- **A 7-Tier Structural Hierarchy** supporting multiple Boys' and Girls' hostels under one university, with guaranteed hostel-level data isolation for administrative and operational staff.
- **4 Explicit Exclusions** (SMS gateways, dashboard customization, dashboard date-range filters, and online payment gateways) that safeguard academic feasibility while delivering comprehensive core management capabilities.
