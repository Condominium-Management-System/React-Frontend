# Portal Implementation Plan

## 1. Executive Summary

This document provides a comprehensive evaluation of the HomeAxis / YE KONDOMINIUM Management System React frontend console. It audits current features, maps existing and required UI elements directly against backend API endpoints, establishes a clear Role-Based Access Control (RBAC) strategy for `super_admin` and `condo_admin` roles, and details a phased implementation roadmap for upcoming development.

The goal is to maintain a simple, clean, and readable React codebase without unnecessary libraries, heavy abstractions, or architectural bloat.

---

## 2. Current Project Architecture

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Dark theme surface `#0F131C`, dark background `#090D16`, gold primary accent `#D3AD32`)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **State Management**: React `useState`, `useEffect`, `useCallback`, `useMemo`, and custom React Context (`AuthContext`).

### Directory Structure Overview
```
src/
├── components/
│   ├── auth/          # ProtectedRoute component
│   ├── condo/         # RegisterCondoModal, EditCondoModal, DeleteCondoModal
│   ├── user/          # RegisterUserModal, EditUserModal, DeleteUserModal
│   ├── payment/       # PaymentDetailsModal, PaymentActionDialog
│   ├── profile/       # ChangePasswordModal
│   ├── dashboard/     # StatCard, PropertyOverview, PlaceholderCard, QuickActionCard
│   ├── layout/        # AdminLayout, Header, Sidebar, UserProfile
│   └── common/        # Shared UI elements
├── context/
│   ├── AuthContext.tsx           # Session management & login/logout state
│   ├── AuthContextDefinition.ts   # Context definition & types
│   └── useAuth.ts                # Custom hook to access AuthContext
├── pages/
│   ├── Login/                 # Authentication login page
│   ├── Dashboard/             # Super Admin & Condo Admin metrics dashboard
│   ├── CondoManagement/       # Property management (Super Admin exclusive)
│   ├── UserManagement/        # Account & role administration
│   ├── PaymentManagement/     # Invoices, transactions, approvals/rejections
│   └── Profile/               # Admin profile & password settings
├── routes/
│   └── AppRoutes.tsx          # Main routing & role-guarded route definitions
├── services/
│   ├── api/apiClient.ts       # Centralized API fetch wrapper with 401 refresh interceptor
│   └── types/                 # TypeScript interface definitions (auth, condo, user, payment, dashboard)
└── utils/
    └── roleHelpers.ts         # Role detection helpers (isSuperAdmin, isCondoAdmin, canAccessWebConsole)
```

---

## 3. Current Authentication & Role System

### Authentication Flow & Tokens
- **Login**: `POST /api/auth/login` returns `accessToken`, `refreshToken`, and `user` object.
- **Session Storage**: `AuthSession` stored in `localStorage` (if `rememberMe === true`) or `sessionStorage` (if `rememberMe === false`).
- **Auto-Refresh Interceptor**: `fetchWithAuth` wrapper in `apiClient.ts` detects HTTP 401 status codes and attempts a token refresh via `POST /api/auth/refresh-token`.
- **Session Restoration**: `AuthProvider` restores session on app startup before setting `isLoading` to `false`.

### Role Enforcement & Access Rules
- **Super Admin (`super_admin`)**: Full system access across all condominiums and management pages.
- **Condo Admin (`condo_admin`)**: Access to management console, but restricted to their assigned condominium (`user.condoId`). Super Admin-only routes (`/condos`) are blocked.
- **Resident (`resident`) / Unauthorized Roles**: Blocked from accessing the web management console. `ProtectedRoute` renders an **Access Denied** screen preventing console interactions.

---

## 4. Completed Features

The following features have been fully implemented, integrated with real backend APIs, tested, and verified:

1. **Authentication & Session Management**:
   - `POST /api/auth/login` (Login with validation & storage)
   - `POST /api/auth/refresh-token` (Automatic 401 retry interceptor)
   - `POST /api/auth/logout` (Server logout & session clearance)
   - `GET /api/auth/me` (Profile data fetch & state sync)
   - `PATCH /api/auth/me` (Profile update with photo/field updates)

2. **Role-Based Access Control (RBAC)**:
   - `src/utils/roleHelpers.ts` (`isSuperAdmin`, `isCondoAdmin`, `canAccessWebConsole`)
   - `ProtectedRoute.tsx` (Route-level protection & Access Denied interface for residents)
   - `AppRoutes.tsx` (Super Admin route guard for `/condos`)
   - `Sidebar.tsx` (Dynamic navigation filtering based on user role)

3. **Condominium Management (Super Admin Only)**:
   - `GET /api/condos` (Property list fetch)
   - `POST /api/condos` (Create new condominium)
   - `PATCH /api/condos/:id` (Update condominium details)
   - `DELETE /api/condos/:id` (Delete condominium)

4. **User Management**:
   - `GET /api/users` (Fetch users list)
   - `POST /api/auth/register` (Register new system user)
   - `PATCH /api/users/:condoId/:userId` (Update user details)
   - `PATCH /api/users/:condoId/:userId/role` (Update user role)
   - `DELETE /api/users/:condoId/:userId` (Delete user)
   - Real-time search, role filtering, status filtering, and client-side pagination.

5. **Payment Management**:
   - `GET /api/payments` (Paginated payment list fetch with parameter sanitization)
   - `GET /api/payments/statistics` (Payment metrics stats cards)
   - `GET /api/payments/:id` (Individual payment details modal)
   - `PATCH /api/payments/:id/approve` (Approve pending payment with optional notes)
   - `PATCH /api/payments/:id/reject` (Reject pending payment with optional notes)
   - Real-time search across reference, user, condo, billing type, amount, and status.

6. **Profile Page**:
   - Displays real authenticated user information.
   - Updates profile information via `PATCH /api/auth/me`.
   - Synchronizes `AuthContext` state without hardcoded mock data.

---

## 5. Partially Implemented Features

1. **Dashboard Role Scoping**:
   - **Current State**: Fetches `GET /api/admin/dashboard` returning global metrics.
   - **Gap**: Does not yet adapt metrics or layout specifically for `condo_admin` users when viewing their own property metrics.

---

## 6. Broken Features

Currently, **0 features** are broken. All active routes (`/dashboard`, `/condos`, `/users`, `/payments`, `/profile`) build (`npm run build`) and lint (`npm run lint`) with 0 errors.

---

## 7. Mock / Hardcoded Features

Currently, **0 active pages** use hardcoded mock data for primary tables or metrics. All working pages consume real backend APIs.

---

## 8. Missing Features

The following backend endpoints documented in the CMS API specification do not yet have corresponding frontend management pages or UI components:

1. **Blocks & Rooms Management**:
   - `POST /api/blocks/:condoId/blocks` (Create block)
   - `GET /api/blocks/:condoId/blocks/:blockId/statistics` (Block statistics)
   - `POST /api/rooms/:condoId` (Create rooms/units)
   - `PATCH /api/rooms/:condoId/:roomId/status` (Update room occupancy status)

2. **Equb Management**:
   - Equb creation, member assignment, draw/payout processing, and status tracking.

3. **Iddir Management**:
   - Iddir creation, member management, contribution tracking, and benefit claim records.

4. **Announcements**:
   - Create, list, pin, and manage property-scoped or global announcements.

5. **Reports & Maintenance (Condo Admin View & Status Update)**:
   - `GET /api/reports/admin/all` (List maintenance reports)
   - `PUT /api/reports/:id/status` (Update maintenance status to in-progress/resolved)

6. **Promotions Review (Super Admin Only)**:
   - `PUT /api/promotions/:id/review` (Review and approve/reject sponsor promotions)

7. **Lost & Found Claim Verification (Condo Admin Only)**:
   - `PUT /api/lost-found/:id/verify-claim` (Verify and update lost & found claims)

---

## 9. Super Admin Feature Matrix

| Feature | Access Level | Supported Operations | Endpoint(s) |
| :--- | :--- | :--- | :--- |
| **Global Dashboard** | Full | View system-wide metrics across all condos | `GET /api/admin/dashboard` |
| **Condo Management** | Exclusive | View, Create, Edit, Delete Condos | `GET, POST, PATCH, DELETE /api/condos` |
| **User Management** | Global | View all, Register, Edit, Role Change, Delete | `GET /api/users`, `POST /api/auth/register`, `PATCH, DELETE /api/users/...` |
| **Payment Management** | Global | View all, Filter by Condo, Approve, Reject | `GET, PATCH /api/payments/...` |
| **Blocks & Rooms** | Global | Manage blocks and units across any condo | `POST /api/blocks/...`, `POST, PATCH /api/rooms/...` |
| **Equb & Iddir** | Global | Create and manage financial groups system-wide | TBD |
| **Announcements** | Global/Targeted | Create global or condo-specific announcements | TBD |
| **Promotions** | Exclusive | Review, approve, or reject vendor promotions | `PUT /api/promotions/:id/review` |
| **Profile** | Own Profile | View and edit personal profile details | `GET, PATCH /api/auth/me` |

---

## 10. Condo Admin Feature Matrix

| Feature | Access Level | Supported Operations | Endpoint(s) |
| :--- | :--- | :--- | :--- |
| **Condo Dashboard** | Scoped | View metrics scoped to `authUser.condoId` | `GET /api/admin/dashboard` (Scoped) |
| **Condo Management** | Blocked | ❌ No Access | None |
| **User Management** | Scoped | View, Register, Edit users inside `authUser.condoId` | `GET /api/users`, `POST /api/auth/register`, `PATCH /api/users/...` |
| **Payment Management** | Scoped | View, Approve, Reject payments for own condo | `GET, PATCH /api/payments/...` |
| **Blocks & Rooms** | Scoped | Create blocks and rooms for own condo | `POST /api/blocks/:condoId/...`, `POST /api/rooms/:condoId` |
| **Equb & Iddir** | Scoped | Manage groups for own condo residents | TBD |
| **Announcements** | Scoped | Publish announcements for own condo | TBD |
| **Reports / Maintenance** | Scoped | View reports & update status for own condo | `GET /api/reports/admin/all`, `PUT /api/reports/:id/status` |
| **Lost & Found** | Scoped | Verify resident item claim records | `PUT /api/lost-found/:id/verify-claim` |
| **Profile** | Own Profile | View and edit personal profile details | `GET, PATCH /api/auth/me` |

---

## 11. API → Frontend Mapping

| Endpoint | Method | Feature | Portal | Current Status | Frontend Usage | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Authentication | Shared | COMPLETED | `Login.tsx` | Authenticates user & stores session |
| `/api/auth/refresh-token` | POST | Authentication | Shared | COMPLETED | `apiClient.ts` | Interceptor auto-refreshes 401 responses |
| `/api/auth/logout` | POST | Authentication | Shared | COMPLETED | `Sidebar.tsx` / `AuthContext` | Clears local and server session |
| `/api/auth/me` | GET | Profile | Shared | COMPLETED | `Profile.tsx`, `Header.tsx` | Fetches authenticated user info |
| `/api/auth/me` | PATCH | Profile | Shared | COMPLETED | `Profile.tsx` | Updates profile name, phone, photo |
| `/api/admin/dashboard` | GET | Dashboard | Shared | PARTIAL | `Dashboard.tsx` | Loads metrics (Needs Condo Admin scoping) |
| `/api/condos` | GET | Condo Management | Super Admin | COMPLETED | `CondoManagement.tsx` | Lists condominiums |
| `/api/condos` | POST | Condo Management | Super Admin | COMPLETED | `RegisterCondoModal.tsx` | Creates new condominium |
| `/api/condos/:id` | PATCH | Condo Management | Super Admin | COMPLETED | `EditCondoModal.tsx` | Updates condominium details |
| `/api/condos/:id` | DELETE | Condo Management | Super Admin | COMPLETED | `DeleteCondoModal.tsx` | Removes condominium |
| `/api/users` | GET | User Management | Shared | COMPLETED | `UserManagement.tsx` | Fetches user records |
| `/api/auth/register` | POST | User Management | Shared | COMPLETED | `RegisterUserModal.tsx` | Registers new user account |
| `/api/users/:condoId/:userId` | PATCH | User Management | Shared | COMPLETED | `EditUserModal.tsx` | Updates user details |
| `/api/users/:condoId/:userId/role` | PATCH | User Management | Super Admin | COMPLETED | `EditUserModal.tsx` | Changes user system role |
| `/api/users/:condoId/:userId` | DELETE | User Management | Shared | COMPLETED | `DeleteUserModal.tsx` | Deletes user account |
| `/api/payments` | GET | Payment Management | Shared | COMPLETED | `PaymentManagement.tsx` | Fetches filtered & paginated payments |
| `/api/payments/statistics` | GET | Payment Management | Shared | COMPLETED | `PaymentManagement.tsx` | Fetches payment stats cards |
| `/api/payments/:id` | GET | Payment Management | Shared | COMPLETED | `PaymentDetailsModal.tsx` | Fetches single payment record details |
| `/api/payments/:id/approve` | PATCH | Payment Management | Shared | COMPLETED | `PaymentActionDialog.tsx` | Approves pending payment |
| `/api/payments/:id/reject` | PATCH | Payment Management | Shared | COMPLETED | `PaymentActionDialog.tsx` | Rejects pending payment |
| `/api/blocks/:condoId/blocks` | POST | Property Layout | Shared | NOT IMPLEMENTED | — | Create blocks for condominium |
| `/api/rooms/:condoId` | POST | Property Layout | Shared | NOT IMPLEMENTED | — | Create rooms/units for condominium |
| `/api/reports/admin/all` | GET | Maintenance | Condo Admin | NOT IMPLEMENTED | — | Fetch maintenance requests |
| `/api/reports/:id/status` | PUT | Maintenance | Condo Admin | NOT IMPLEMENTED | — | Update request status |
| `/api/promotions/:id/review` | PUT | Promotions | Super Admin | NOT IMPLEMENTED | — | Review & approve sponsor promotions |
| `/api/lost-found/:id/verify-claim`| PUT | Lost & Found | Condo Admin | NOT IMPLEMENTED | — | Verify resident item claims |

---

## 12. Role-Based Access Matrix

| Feature / Page | Super Admin | Condo Admin | Resident |
| :--- | :--- | :--- | :--- |
| **Login (`/login`)** | Public | Public | Public |
| **Dashboard (`/dashboard`)** | Global Overview | Own Condo Metrics | ❌ Access Denied |
| **Condo Management (`/condos`)** | ✅ Full Access | ❌ Access Denied (Blocked) | ❌ Access Denied |
| **User Management (`/users`)** | All Users + Role Edits | Own Condo Users | ❌ Access Denied |
| **Payment Management (`/payments`)** | All Payments + Condo Filter | Own Condo Payments | ❌ Access Denied |
| **Profile (`/profile`)** | Own Profile | Own Profile | ❌ Access Denied |
| **Blocks & Rooms** | All Condos | Own Condo | ❌ Access Denied |
| **Equb Management** | All Condos | Own Condo | ❌ Access Denied |
| **Iddir Management** | All Condos | Own Condo | ❌ Access Denied |
| **Announcements** | Global & Condo-specific | Own Condo Only | ❌ Access Denied |
| **Maintenance Reports** | TBD / Needs Clarification | View & Status Update Only | ❌ Access Denied |
| **Promotions Review** | ✅ Review & Approve/Reject | ❌ Access Denied | ❌ Access Denied |
| **Lost & Found Claims** | TBD / Needs Clarification | Verify Claims | ❌ Access Denied |

---

## 13. Feature Dependencies

```
1. Authentication & AuthContext (Completed)
   │
   ├── 2. Role-Based Route Protection & Navigation Guard (Completed)
   │      │
   │      ├── 3. Dashboard Role Scoping (In Progress)
   │      │
   │      ├── 4. Property Layout: Blocks & Rooms Management (Pending)
   │      │      │
   │      │      ├── 5. Financial Groups: Equb & Iddir Management (Pending)
   │      │      │
   │      │      └── 6. Operations: Announcements, Maintenance Reports, Lost & Found (Pending)
   │      │
   │      └── 7. Promotions Review (Super Admin Exclusive) (Pending)
```

---

## 14. Recommended Implementation Phases

### Phase 1: Dashboard Role Scoping & Refinement
- **Objective**: Adapt `Dashboard.tsx` to handle `condo_admin` users seamlessly by displaying scoped title and property metrics when logged in as a Condo Admin.
- **Affected Roles**: `condo_admin`
- **Reused Code**: `Dashboard.tsx`, `StatCard.tsx`, `PropertyOverview.tsx`.

### Phase 2: Blocks & Rooms Management
- **Objective**: Create unit management interfaces to allow Super Admin and Condo Admin to add blocks (`POST /api/blocks/:condoId/blocks`) and units (`POST /api/rooms/:condoId`), and toggle unit statuses.
- **Affected Roles**: `super_admin`, `condo_admin`
- **New Files**: `src/pages/PropertyLayout/`, `src/components/property/`.

### Phase 3: Maintenance Reports & Requests (Condo Admin)
- **Objective**: Build maintenance report management page allowing Condo Admins to view incoming resident reports (`GET /api/reports/admin/all`) and update resolution status (`PUT /api/reports/:id/status`).
- **Affected Roles**: `condo_admin`
- **New Files**: `src/pages/Reports/`, `src/components/reports/`.

### Phase 4: Announcements Management
- **Objective**: Build announcement broadcast page allowing Admins to post, pin, and manage property announcements.
- **Affected Roles**: `super_admin`, `condo_admin`
- **New Files**: `src/pages/Announcements/`, `src/components/announcements/`.

### Phase 5: Equb & Iddir Financial Groups Management
- **Objective**: Build group administration interfaces for community savings (Equb) and social welfare (Iddir).
- **Affected Roles**: `super_admin`, `condo_admin`
- **New Files**: `src/pages/Equb/`, `src/pages/Iddir/`.

### Phase 6: Promotions & Lost & Found Operations
- **Objective**: Implement Super Admin promotion review (`PUT /api/promotions/:id/review`) and Condo Admin Lost & Found claim verification (`PUT /api/lost-found/:id/verify-claim`).
- **Affected Roles**: `super_admin` (Promotions), `condo_admin` (Lost & Found).

---

## 15. Technical Risks & Recommendations

1. **Parameter Sanitization & Omission**:
   - **Risk**: Passing literal `"ALL"` or title-case strings to backend endpoints expecting strict enum values causes 400 validation errors (e.g. `paymentMethod`).
   - **Recommendation**: Always omit default `"ALL"` filter parameters completely from `URLSearchParams` in API service functions.

2. **API Response Wrapper Unwrapping**:
   - **Risk**: Assuming `json.data` is the final target entity when the backend nests objects (e.g., `json.data.user` or `json.data.payments`).
   - **Recommendation**: Maintain defensive unwrapping patterns (`json.data?.user || json.data`) across all service functions.

3. **Client-Side vs Backend Filter Synchronization**:
   - **Risk**: Pagination breaking when applying client-side search filters over single-page responses.
   - **Recommendation**: Ensure client-side `useMemo` filters recalculate total counts and page slices dynamically from the filtered subset.

---

## 16. Testing Strategy

1. **Role Access Testing**:
   - Authenticate as `super_admin` $\rightarrow$ verify full console access & `/condos` availability.
   - Authenticate as `condo_admin` $\rightarrow$ verify `/condos` is blocked and navigation items are hidden.
   - Authenticate as `resident` $\rightarrow$ verify immediate redirection to Access Denied screen.

2. **Session Persistence Testing**:
   - Perform hard browser refresh (`Ctrl+F5`) on protected routes $\rightarrow$ verify loading spinner displays during session restoration without premature login redirect.

3. **Data Scoping Testing**:
   - Log in as `condo_admin` $\rightarrow$ verify user and payment lists are restricted to `authUser.condoId`.

---

## 17. Questions / Clarifications Needed

1. **Super Admin Access to Maintenance Reports**:
   - *Clarification*: The specification currently restricts maintenance report status updates to `condo_admin`. Should `super_admin` also have global read-only or full update permissions for reports across all condominiums?

2. **Super Admin Access to Lost & Found Claims**:
   - *Clarification*: Should `super_admin` be allowed to verify Lost & Found claims globally, or remain strictly `condo_admin` exclusive as currently requested?

---

## 18. Final Recommended Development Order

1. **Phase 1**: Dashboard Role Scoping & Metrics Refinement
2. **Phase 2**: Blocks & Rooms Management (`/blocks-rooms`)
3. **Phase 3**: Maintenance Reports & Status Updates (`/reports`)
4. **Phase 4**: Property & Global Announcements (`/announcements`)
5. **Phase 5**: Equb & Iddir Community Financial Management (`/equb`, `/iddir`)
6. **Phase 6**: Promotions Review & Lost & Found Claim Verification (`/promotions`, `/lost-found`)

---

### Concise Executive Summary

- **CURRENT STATE**: Authentication, RBAC route guarding, Profile management, Condominium Management (Super Admin), User Management, and Payment Management are 100% completed, fully integrated with real backend APIs, and pass build and lint tests with 0 errors.
- **BIGGEST GAPS**: Missing management interfaces for Blocks & Rooms, Maintenance Reports, Announcements, Equb/Iddir financial groups, Promotions, and Lost & Found.
- **NEXT PHASE**: Phase 1 (Dashboard Role Scoping) followed by Phase 2 (Blocks & Rooms Management).
- **TOTAL REMAINING FEATURES**: 6 major feature modules (Blocks & Rooms, Reports, Announcements, Equb/Iddir, Promotions, Lost & Found).
